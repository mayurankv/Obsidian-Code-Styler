import { syntaxTree } from "@codemirror/language";
import { EditorState, Extension, RangeSetBuilder, SelectionRange, StateField, Transaction } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView } from "@codemirror/view";
import { SyntaxNodeRef } from "@lezer/common";
import { PREFIX } from "src/Internal/constants/general";
import { parseInlineCodeParameters, splitInlineCodeRaw, toHighlightInlineCode } from "src/Internal/Parsing/inline";
import { InlineCodeInfo } from "src/Internal/types/detecting";
import { getInlineDelimiterSize, isFileIgnored, isRangeInteracting, isSourceMode } from "./codemirror/utils";
import CodeStylerPlugin from "src/main";
import { editorInfoField } from "obsidian";
import { HeaderWidget } from "./codemirror/widgets";

export function getInlineCodeMirrorExtensions(
	plugin: CodeStylerPlugin,
) {
	return [
		createInlineDecorationsStateField(plugin),
	]
}

export function createInlineDecorationsStateField(
	plugin: CodeStylerPlugin,
) {
	return StateField.define<DecorationSet>({
		create(state: EditorState): DecorationSet {
			return buildInlineDecorations(state, plugin);
		},
		update(value: DecorationSet, transaction: Transaction): DecorationSet {
			return buildInlineDecorations(transaction.state, plugin);
		},
		provide(field: StateField<DecorationSet>): Extension {
			return EditorView.decorations.from(field);
		}
	});
}

function buildInlineDecorations(
	state: EditorState,
	plugin: CodeStylerPlugin,
): DecorationSet {
	let builder = new RangeSetBuilder<Decoration>();
	if (isFileIgnored(state))
		return Decoration.none;

	syntaxTree(state).iterate({
		enter: (syntaxNode)=>{
			addInlineDecorations(
				state,
				getInlineCodeInfo(state, syntaxNode),
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

function addInlineDecorations(
	state: EditorState,
	inlineCodeInfo: InlineCodeInfo | null,
	plugin: CodeStylerPlugin,
): Array<{from: number, to: number, value: Decoration}> {
	let decorations: Array<{from: number, to: number, value: Decoration}> = []
	if (!inlineCodeInfo)
		return decorations

	if (inlineCodeInfo.parameters.from < inlineCodeInfo.parameters.to)
		decorations.push({
			from: inlineCodeInfo.parameters.from,
			to: inlineCodeInfo.parameters.to,
			value: Decoration.mark({
				class: PREFIX + "inline-parameters",
			}),
		});

	if (toHighlightInlineCode(plugin))
		decorations = [
			...decorations,
			...inlineSyntaxHighlight(
				inlineCodeInfo.parameters.value.language,
				inlineCodeInfo.content.value,
				inlineCodeInfo.parameters.to,
			),
		]

	if (
		state.selection.ranges.some(
			(range: SelectionRange) => isRangeInteracting(
				inlineCodeInfo.section.from,
				inlineCodeInfo.section.to,
				range,
			),
		) ||
		isSourceMode(state)
	)
		return decorations

	if (inlineCodeInfo.parameters.from < inlineCodeInfo.parameters.to) {
		decorations.push({
			from: inlineCodeInfo.parameters.from,
			to: inlineCodeInfo.parameters.from,
			value: Decoration.replace({
				widget: new HeaderWidget(
					inlineCodeInfo.parameters.value,
					state.field(editorInfoField)?.file?.path ?? "",
					false,
					plugin,
				)
			}),
		});
		decorations.push({
			from: inlineCodeInfo.parameters.from,
			to: inlineCodeInfo.parameters.to,
			value: Decoration.replace({}),
		});
	}

	return decorations
}

function inlineSyntaxHighlight(
	language: string,
	content: string,
	start: number,
): Array<{from: number, to: number, value: Decoration}> {
	const decorations: Array<{from: number, to: number, value: Decoration}> = []

	// @ts-expect-error Undocumented Obsidian API
	const mode = window.CodeMirror.getMode(window.CodeMirror.defaults,window.CodeMirror.findModeByName(language)?.mime);
	const state = window.CodeMirror.startState(mode);

	if (mode?.token) {
		const stream = new window.CodeMirror.StringStream(content);
		while (!stream.eol()) {
			const style = mode.token(stream,state);
			if (style)
				decorations.push({
					from: start + stream.start,
					to: start + stream.pos,
					value: Decoration.mark({ class: `cm-${style}` }),
				});

			stream.start = stream.pos;
		}
	}

	return decorations;
}
