import { syntaxTree } from "@codemirror/language";
import { EditorState, Line, Range, RangeSetBuilder } from "@codemirror/state";
import { Decoration, DecorationSet } from "@codemirror/view";
import { SyntaxNodeRef } from "@lezer/common";
import { isFileIgnored, isSourceMode } from "src/Internal/Decorating/LivePreview/codemirror/utils";
import { FillerWidget } from "src/Internal/Decorating/LivePreview/codemirror/widgets";
import { parseFenceCodeParameters, toDecorateFenceCode } from "src/Internal/Parsing/fenced";
import { FenceCodeParameters } from "src/Internal/types/parsing";
import { cleanFenceCodeParametersLine } from "src/Internal/utils/detecting";
import CodeStylerPlugin from "src/main";

export function buildFenceCodeDecorations(
	state: EditorState,
	plugin: CodeStylerPlugin,
	buildHeaderDecorations: (
		state: EditorState,
		startPosition: number,
		endPosition: number,
		fenceCodeParameters: FenceCodeParameters,
		plugin: CodeStylerPlugin,
	) => Array<Range<Decoration>>,
	buildLineDecorations: (
		state: EditorState,
		startPosition: number,
		endPosition: number,
		lineText: string,
		lineNumber: number,
		fenceCodeParameters: FenceCodeParameters,
		plugin: CodeStylerPlugin,
	) => Array<Range<any>>,
	buildIntraLineDecorations: (
		state: EditorState,
		syntaxNode: SyntaxNodeRef,
		line: Line,
		plugin: CodeStylerPlugin,
	) => Array<Range<Decoration>>,
	buildFooterDecorations: (
		state: EditorState,
		startPosition: number,
		endPosition: number,
		codeStartPosition: number,
		fenceCodeParameters: FenceCodeParameters,
		plugin: CodeStylerPlugin,
	) => Array<Range<Decoration>>,
	modifyIntermediateDecorations: (
		decorations: Array<Range<any>>,
		fenceCodeParameters: FenceCodeParameters,
	) => Array<Range<any>>,
	filterBadDecorations: (
		decorations: Array<Range<any>>,
	) => Array<Range<Decoration>>,
): DecorationSet {
	if (isFileIgnored(state))
		return Decoration.none;

	const sourceMode = isSourceMode(state);

	let builder = new RangeSetBuilder<Decoration>();

	let fenceCodeParameters: FenceCodeParameters = new FenceCodeParameters({})
	let lineNumber = 0
	let startPosition: number
	let toDecorate: boolean
	let line: Line
	let decorations: Array<Range<Decoration>> = []

	syntaxTree(state).iterate({
		enter: (syntaxNode) => {

			if (syntaxNode.type.name.includes("HyperMD-codeblock"))
				line = state.doc.lineAt(syntaxNode.from);

			if (syntaxNode.type.name.includes("HyperMD-codeblock-begin")) {
				lineNumber = 0;
				startPosition = syntaxNode.from

				fenceCodeParameters = parseFenceCodeParameters(
					cleanFenceCodeParametersLine(line.text.toString()),
					plugin,
				)

				toDecorate = toDecorateFenceCode(fenceCodeParameters, plugin) && !sourceMode

				if (toDecorate)
					decorations.push(
						...buildHeaderDecorations(
							state,
							syntaxNode.from,
							syntaxNode.to,
							fenceCodeParameters,
							plugin,
						)
					)

			}

			if (syntaxNode.type.name.includes("HyperMD-codeblock-end"))
				lineNumber = 0;

			if (syntaxNode.type.name.includes("HyperMD-codeblock")) {
				if (toDecorate)
					decorations.push(
						...buildLineDecorations(
							state,
							syntaxNode.from,
							syntaxNode.to,
							line.text.toString(),
							lineNumber,
							fenceCodeParameters,
							plugin,
						)
					)

				lineNumber += 1
			}

			if (syntaxNode.type.name.includes("HyperMD-codeblock-end")) {
				lineNumber = 0;
				decorations = modifyIntermediateDecorations(decorations, fenceCodeParameters)

				if (toDecorate)
					decorations.push(
						...buildFooterDecorations(
							state,
							syntaxNode.from,
							syntaxNode.to,
							startPosition,
							fenceCodeParameters,
							plugin,
						)
					)
			}

			if (lineNumber !== 0)
				if (toDecorate)
					decorations.push(
						...buildIntraLineDecorations(
							state,
							syntaxNode,
							line,
							plugin,
						)
					)

		}
	});

	decorations = filterBadDecorations(decorations)

	decorations.sort(
		(a, b) => (a.from === b.from)
			? a.value.startSide < b.value.startSide ? -1 : a.value.startSide > b.value.startSide ? 1 : 0
			: a.from < b.from ? -1 : 1
	).forEach((range) => builder.add(range.from, range.to, range.value))

	return builder.finish();
}
