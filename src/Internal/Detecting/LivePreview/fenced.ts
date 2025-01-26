import { syntaxTree } from "@codemirror/language";
import { EditorState, Line, Range, RangeSetBuilder } from "@codemirror/state";
import { Decoration, DecorationSet } from "@codemirror/view";
import { SyntaxNodeRef } from "@lezer/common";
import { isFileIgnored } from "src/Internal/Decorating/LivePreview/codemirror/utils";
import { parseFenceCodeParameters } from "src/Internal/Parsing/fenced";
import { CommentInfo } from "src/Internal/types/detecting";
import { LinkInfo } from "src/Internal/types/parsing";
import { cleanFenceCodeParametersLine } from "src/Internal/utils/detecting";
import { parseLinks } from "src/Internal/utils/parsing";
import CodeStylerPlugin from "src/main";

export function buildHeaderDecorations(
	state: EditorState,
	plugin: CodeStylerPlugin,
	buildHeaderDecoration: (
		state: EditorState,
		headerInfo: HeaderInfo | null,
		plugin: CodeStylerPlugin,
	) => Array<Range<Decoration>>,
): DecorationSet {
	if (isFileIgnored(state))
		return Decoration.none;

	let builder = new RangeSetBuilder<Decoration>();

	syntaxTree(state).iterate({
		enter: (syntaxNode) => buildHeaderDecoration(
			state,
			getHeaderInfo(state, syntaxNode),
			plugin,
		).sort(
			(a, b) => (a.from === b.from)
				? a.value.startSide < b.value.startSide ? -1 : a.value.startSide > b.value.startSide ? 1 : 0
				: a.from < b.from ? -1 : 1
		).forEach(
			({from, to, value}) => builder.add(from, to, value),
		),

		codeblockParameters = parseCodeblockParameters(trimParameterLine(startLine.text.toString()),settings.currentTheme);
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

	return fenceCodeParametersLine

	const fenceCodeParameters = parseFenceCodeParameters(fenceCodeParametersLine, plugin);


	if (
		!isLanguageIgnored(codeblockParameters.language, settings.excludedLanguages) &&
		!isCodeblockIgnored(codeblockParameters.language, settings.processedCodeblocksWhitelist) &&
		!codeblockParameters.ignore &&
		!SPECIAL_LANGUAGES.some(regExp => new RegExp(regExp).test(codeblockParameters.language))
	)
		builder.add(startLine.from,startLine.from,Decoration.widget({widget: new HeaderWidget(codeblockParameters,foldValue(startLine.from,codeblockParameters.fold.enabled),settings.currentTheme.settings,state.field(editorInfoField)?.file?.path ?? "",plugin), block: true, side: -1}));

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
