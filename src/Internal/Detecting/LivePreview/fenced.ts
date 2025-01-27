import { syntaxTree } from "@codemirror/language";
import { EditorState, Line, Range, RangeSetBuilder } from "@codemirror/state";
import { Decoration, DecorationSet } from "@codemirror/view";
import { SyntaxNodeRef } from "@lezer/common";
import { isFileIgnored, isSourceMode } from "src/Internal/Decorating/LivePreview/codemirror/utils";
import { parseFenceCodeParameters } from "src/Internal/Parsing/fenced";
import { FenceCodeParameters } from "src/Internal/types/parsing";
import { cleanFenceCodeParametersLine } from "src/Internal/utils/detecting";
import CodeStylerPlugin from "src/main";

export function buildFenceCodeDecorations(
	state: EditorState,
	plugin: CodeStylerPlugin,
	buildHeaderDecorations: (
		state: EditorState,
		position: number,
		fenceCodeParameters: FenceCodeParameters,
		plugin: CodeStylerPlugin,
	) => Array<Range<Decoration>>,
	buildLineDecorations: (
		state: EditorState,
		position: number,
		lineText: string,
		lineNumber: number,
		fenceCodeParameters: FenceCodeParameters,
		plugin: CodeStylerPlugin,
	) => Array<Range<Decoration>>,
	buildExtraDecorations: (
		state: EditorState,
		syntaxNode: SyntaxNodeRef,
		line: Line,
		plugin: CodeStylerPlugin,
	) => Array<Range<Decoration>>,
): DecorationSet {
	if (isFileIgnored(state))
		return Decoration.none;

	let builder = new RangeSetBuilder<Decoration>();

	let fenceCodeParameters: FenceCodeParameters = new FenceCodeParameters({})
	let lineNumber = 0
	let line: Line

	syntaxTree(state).iterate({
		enter: (syntaxNode) => {
			const decorations = []

			if (syntaxNode.type.name.includes("HyperMD-codeblock"))
				line = state.doc.lineAt(syntaxNode.from);

			if (syntaxNode.type.name.includes("HyperMD-codeblock-begin")) {
				lineNumber = 0;

				fenceCodeParameters = parseFenceCodeParameters(
					cleanFenceCodeParametersLine(line.text.toString()),
					plugin,
				)

				if (!isSourceMode(state) || !fenceCodeParameters.ignore)
					decorations.push(
						...buildHeaderDecorations(
							state,
							syntaxNode.from,
							fenceCodeParameters,
							plugin,
						)
					)

			} else if (syntaxNode.type.name.includes("HyperMD-codeblock-end")) {
				lineNumber = -1;

			}

			if (syntaxNode.type.name.includes("HyperMD-codeblock")) {
				if (!isSourceMode(state) || !fenceCodeParameters.ignore)
					decorations.push(
						...buildLineDecorations(
							state,
							syntaxNode.from,
							line.text.toString(),
							lineNumber,
							fenceCodeParameters,
							plugin,
						)
					)

				lineNumber += 1
			}

			if (lineNumber !== 0)
				decorations.push(
					...buildExtraDecorations(
						state,
						syntaxNode,
						line,
						plugin,
					)
				)

			if (decorations.length > 0)
				decorations.sort(
					(a, b) => (a.from === b.from)
						? a.value.startSide < b.value.startSide ? -1 : a.value.startSide > b.value.startSide ? 1 : 0
						: a.from < b.from ? -1 : 1
				).forEach((range) => builder.add(range.from, range.to, range.value))
		}
	});

	return builder.finish();
}
