import { syntaxTree } from "@codemirror/language";
import { EditorState, Line, Range, RangeSetBuilder } from "@codemirror/state";
import { Decoration, DecorationSet } from "@codemirror/view";
import { SyntaxNodeRef } from "@lezer/common";
import { PREFIX } from "src/Internal/constants/general";
import { isFileIgnored, isSourceMode } from "src/Internal/Decorating/LivePreview/codemirror/utils";
import { LineNumberWidget } from "src/Internal/Decorating/LivePreview/codemirror/widgets";
import { parseFenceCodeParameters } from "src/Internal/Parsing/fenced";
import { CommentInfo, HeaderInfo } from "src/Internal/types/detecting";
import { FenceCodeParameters, LinkInfo } from "src/Internal/types/parsing";
import { cleanFenceCodeParametersLine } from "src/Internal/utils/detecting";
import { parseLinks } from "src/Internal/utils/parsing";
import CodeStylerPlugin from "src/main";

export function buildFenceCodeDecorations(
	state: EditorState,
	plugin: CodeStylerPlugin,
	buildHeaderDecoration: (
		state: EditorState,
		headerInfo: HeaderInfo | null,
		plugin: CodeStylerPlugin,
	) => Array<Range<Decoration>>,
	buildLineDecoration: (
		state: EditorState,
		headerInfo: LineInfo | null,
		plugin: CodeStylerPlugin,
	) => Array<Range<Decoration>>,
	buildFooterDecoration: (
		state: EditorState,
		headerInfo: HeaderInfo | null,
		plugin: CodeStylerPlugin,
	) => Array<Range<Decoration>>,
): DecorationSet {
	if (isFileIgnored(state))
		return Decoration.none;

	let builder = new RangeSetBuilder<Decoration>();

	let fenceCodeParameters: FenceCodeParameters = new FenceCodeParameters({})
	let lineNumber = 0

	syntaxTree(state).iterate({
		enter: (syntaxNode) => {
			if (syntaxNode.type.name.includes("HyperMD-codeblock-begin")) {
				lineNumber = 0

				fenceCodeParameters = parseFenceCodeParameters(cleanFenceCodeParametersLine(state.doc.lineAt(syntaxNode.from).text.toString()), plugin)

			} else if (syntaxNode.type.name.includes("HyperMD-codeblock-end")) {
				lineNumber = 0
				// console.log("end", syntaxNode.from, params)

			}

			if (syntaxNode.type.name.includes("HyperMD-codeblock")) {
				builder.add(
					syntaxNode.from,
					syntaxNode.from,
					Decoration.line({
						attributes: {
							style: "",
							class: PREFIX + "line",
						}
					})
				)
				builder.add(
					syntaxNode.from,
					syntaxNode.from,
					Decoration.widget({
						widget: new LineNumberWidget(
							lineNumber,
							fenceCodeParameters,
						)
					})
				)

				lineNumber += 1
			}
		}
		// enter: (syntaxNode) => buildLineDecoration(
		// 		state,
		// 		getLineInfo(state, syntaxNode),
		// 		plugin,
		// 	).sort(
		// 	(a, b) => (a.from === b.from)
		// 		? a.value.startSide < b.value.startSide ? -1 : a.value.startSide > b.value.startSide ? 1 : 0
		// 		: a.from < b.from ? -1 : 1
		// ).forEach(
		// 	({from, to, value}) => builder.add(from, to, value),
		// ),
	});

	return builder.finish();
}

function getHeaderInfo(
	state: EditorState,
	syntaxNode: SyntaxNodeRef,
): HeaderInfo | null {
	if (!syntaxNode.type.name.includes("HyperMD-codeblock-begin"))
		return null

	const startLine = state.doc.lineAt(syntaxNode.from);
	const fenceCodeParametersLine = cleanFenceCodeParametersLine(startLine.text.toString())

	return {
		fenceCodeParametersLine: fenceCodeParametersLine,
		position: startLine.from
	}
}

function getLineInfo(
	state: EditorState,
	syntaxNode: SyntaxNodeRef,
): LineInfo | null {
	if (!syntaxNode.type.name.includes("HyperMD-codeblock-begin"))
		return null

	const startLine = state.doc.lineAt(syntaxNode.from);
	const fenceCodeParametersLine = cleanFenceCodeParametersLine(startLine.text.toString())

	return {
		fenceCodeParametersLine: fenceCodeParametersLine,
		position: startLine.from
	}
}

export function buildCommentDecorations(
	state: EditorState,
	line: Line,
	builder: RangeSetBuilder<Decoration>,
	plugin: CodeStylerPlugin,
	buildCommentDecoration: (
		state: EditorState,
		commentInfo: CommentInfo | null,
		plugin: CodeStylerPlugin,
	) => Array<Range<Decoration>>,
) {
	if (isFileIgnored(state))
		return Decoration.none;

	syntaxTree(state).iterate({
		enter: (syntaxNode) => buildCommentDecoration(
			state,
			getCommentInfo(state, syntaxNode),
			plugin,
		).sort(
			(a, b) => (a.from === b.from)
				? a.value.startSide < b.value.startSide ? -1 : a.value.startSide > b.value.startSide ? 1 : 0
				: a.from < b.from ? -1 : 1
		).forEach(
			({from, to, value}) => builder.add(from, to, value),
		),
		from: line.from,
		to: line.to
	});
}

function getCommentInfo(
	state: EditorState,
	syntaxNode: SyntaxNodeRef,
): CommentInfo | null {
	if (!syntaxNode.type.name.includes("comment_hmd-codeblock"))
		return null

	const commentText = state.sliceDoc(syntaxNode.from, syntaxNode.to);
	const linksInfo = parseLinks(commentText)

	const commentLinksInfo = linksInfo.map((linkInfo: LinkInfo) => {
		return {
			...linkInfo,
			fullLink: linkInfo.match,
			from: syntaxNode.from + linkInfo.offset,
			to: syntaxNode.from + linkInfo.offset + linkInfo.match.length,
		}
	})

	return commentLinksInfo
}
