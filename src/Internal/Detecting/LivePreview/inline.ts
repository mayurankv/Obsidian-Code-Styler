import { syntaxTree } from "@codemirror/language";
import { EditorState, Range, RangeSetBuilder } from "@codemirror/state";
import { Decoration, DecorationSet } from "@codemirror/view";
import { SyntaxNodeRef } from "@lezer/common";
import { getInlineDelimiterSize, isFileIgnored } from "src/Internal/Decorating/LivePreview/codemirror/utils";
import { parseInlineCodeParameters, splitInlineCodeRaw } from "src/Internal/Parsing/inline";
import { InlineCodeInfo } from "src/Internal/types/detecting";
import CodeStylerPlugin from "src/main";

export function buildInlineDecorations(
	state: EditorState,
	plugin: CodeStylerPlugin,
	buildInlineDecoration: (
		state: EditorState,
		inlineCodeInfo: InlineCodeInfo | null,
		plugin: CodeStylerPlugin,
	) => Array<Range<Decoration>>,
): DecorationSet {
	let builder = new RangeSetBuilder<Decoration>();
	if (isFileIgnored(state))
		return Decoration.none;

	syntaxTree(state).iterate({
		enter: (syntaxNode) => {
			const inlineCodeInfo = getInlineCodeInfo(state, syntaxNode)
			buildInlineDecoration(
				state,
				inlineCodeInfo,
				plugin,
			).sort(
				(a, b) => (a.from === b.from)
					? a.value.startSide < b.value.startSide ? -1 : a.value.startSide > b.value.startSide ? 1 : 0
					: a.from < b.from ? -1 : 1
			).forEach(
				({from, to, value}) => builder.add(from, to, value),
			);
		},
	});

	return builder.finish();
}

function getInlineCodeInfo(
	state: EditorState,
	syntaxNode: SyntaxNodeRef,
): InlineCodeInfo | null {
	const delimiterSize = getInlineDelimiterSize(syntaxNode);
	if (delimiterSize === null)
		return null;

	const inlineCodeRaw = state.doc.sliceString(syntaxNode.from, syntaxNode.to);

	const {inlineCodeParametersLine, inlineCodeContent} = splitInlineCodeRaw(inlineCodeRaw);
	const inlineCodeParameters = parseInlineCodeParameters((inlineCodeParametersLine ?? "") + " ");
	const inlineCodeParametersLineLength = (inlineCodeParametersLine ?? "").length

	return {
		parameters: {
			from: syntaxNode.from,
			to: syntaxNode.from + inlineCodeParametersLineLength,
			value: inlineCodeParameters,
		},
		content: {
			from: syntaxNode.from + inlineCodeParametersLineLength + 1,
			to: syntaxNode.to,
			value: inlineCodeContent,
		},
		section: {
			from: syntaxNode.from - delimiterSize,
			to: syntaxNode.to + delimiterSize,
		}
	};
}
