import { syntaxTree } from "@codemirror/language";
import { EditorState, Range, RangeSetBuilder } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView } from "@codemirror/view";
import { SyntaxNodeRef } from "@lezer/common";
import { getInlineDelimiterSize, isFileIgnored } from "src/Internal/Decorating/LivePreview/codemirror/utils";
import { parseInlineCodeParameters, splitInlineCodeRaw } from "src/Internal/Parsing/inline";
import { InlineCodeInfo } from "src/Internal/types/detecting";
import CodeStylerPlugin from "src/main";

export function getInlineCodeInfo(
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
