import { EditorState, Extension, Range, SelectionRange, StateField, Transaction } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView } from "@codemirror/view";
import { editorInfoField } from "obsidian";
import { PREFIX } from "src/Internal/constants/general";
import { toHighlightInlineCode } from "src/Internal/Parsing/inline";
import { InlineCodeInfo } from "src/Internal/types/detecting";
import CodeStylerPlugin from "src/main";
import { areRangesInteracting, isSourceMode } from "./codemirror/utils";
import { HeaderWidget } from "./codemirror/widgets";
import { buildInlineDecorations } from "src/Internal/Detecting/LivePreview/inline";

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
		create(
			state: EditorState,
		): DecorationSet {
			return buildInlineDecorations(state, plugin, buildInlineDecoration);
		},
		
		update(
			value: DecorationSet,
			transaction: Transaction,
		): DecorationSet {
			return buildInlineDecorations(transaction.state, plugin, buildInlineDecoration);
		},

		provide(
			field: StateField<DecorationSet>,
		): Extension {
			return EditorView.decorations.from(field);
		}
	});
}

function buildInlineDecoration(
	state: EditorState,
	inlineCodeInfo: InlineCodeInfo | null,
	plugin: CodeStylerPlugin,
): Array<Range<Decoration>> {
	if (!inlineCodeInfo)
		return []

	let decorations: Array<Range<Decoration>> = []

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

	if (isSourceMode(state) || areRangesInteracting(state, inlineCodeInfo.section.from, inlineCodeInfo.section.to))
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
): Array<Range<Decoration>> {
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
