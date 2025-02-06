import { EditorState, Extension, Range, RangeSetBuilder, StateField, Transaction } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, PluginValue, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { editorInfoField } from "obsidian";
import { PREFIX } from "src/Internal/constants/general";
import { toDecorateInlineCode, toHighlightInlineCode } from "src/Internal/Parsing/inline";
import { InlineCodeInfo } from "src/Internal/types/detecting";
import CodeStylerPlugin from "src/main";
import { areRangesInteracting, getCommentDecorations, getStateFieldDecorations, getStateFieldsViewDecorations, isFileIgnored, updateStateField, updateViewPlugin } from "./codemirror/utils";
import { FooterWidget, HeaderWidget } from "./codemirror/widgets";
import { syntaxTree } from "@codemirror/language";
import { getInlineCodeInfo } from "src/Internal/Detecting/LivePreview/inline";

export function getInlineCodeMirrorExtensions(
	plugin: CodeStylerPlugin,
) {
	return [
		...createInlineCodeDecorations(plugin),
	]
}

export function createInlineCodeDecorations(
	plugin: CodeStylerPlugin,
) {
	const fullStateField = StateField.define<DecorationSet>({
		create(
			state: EditorState,
		): DecorationSet {
			return buildInlineCodeDecorations(
				state,
				Decoration.none,
				plugin,
			)
		},

		update(
			value: DecorationSet,
			transaction: Transaction,
		): DecorationSet {
			value = value.map(transaction.changes)

			if (updateStateField(transaction)) //NOTE: TODO: Ideally would map ranges on docchanged unless affected but quirks mean that statefield doesn'y actually get whole document so some decorations don't exist in create and thus this wouldn't work on scrolling; hence why the view updater is needed
				return buildInlineCodeDecorations(
					transaction.state,
					value,
					plugin,
				)

			return value
		},
	});

	const shownStateField = StateField.define<DecorationSet>({
		create(
			state: EditorState,
		): DecorationSet {
			return getStateFieldDecorations(
				state,
				fullStateField,
			);
		},

		update(
			value: DecorationSet,
			transaction: Transaction,
		): DecorationSet {
			value = value.map(transaction.changes)

			if (updateStateField(transaction)) //NOTE: TODO: Ideally would map ranges on docchanged unless affected but quirks mean that statefield doesn'y actually get whole document so some decorations don't exist in create and thus this wouldn't work on scrolling; hence why the view updater is needed
				return getStateFieldDecorations(
					transaction.state,
					fullStateField,
				);

			return value
		},

		provide(
			field: StateField<DecorationSet>,
		): Extension {
			return EditorView.decorations.from(field);
		}
	});

	const stateFields = [
		fullStateField,
		shownStateField,
	]

	class InlineCodeDecorations implements PluginValue {
		decorations: DecorationSet;
		plugin: CodeStylerPlugin;

		constructor(
			view: EditorView,
		) {
			this.addDecorations(view)
		}

		update(
			update: ViewUpdate,
		) {
			this.addDecorations(update.view)
		}

		addDecorations(view: EditorView) {
			this.decorations = getStateFieldsViewDecorations(view, stateFields)
		}

		destroy() {
			return;
		}
	}

	const viewPlugin = ViewPlugin.fromClass(
		InlineCodeDecorations,
		{
			decorations: (
				value: InlineCodeDecorations,
			) => value.decorations,
		}
	);

	return [
		...stateFields,
		viewPlugin,
	]
}


function buildInlineCodeDecorations(
	state: EditorState,
	value: DecorationSet,
	plugin: CodeStylerPlugin,
): DecorationSet {
	if (isFileIgnored(state))
		return Decoration.none;

	let allDecorations: Array<Range<Decoration>> = [];

	syntaxTree(state).iterate({
		enter: (syntaxNode) => void allDecorations.push(
			...buildInlineDecoration(
				state,
				getInlineCodeInfo(state, syntaxNode),
				plugin,
			),
		)
	});

	return Decoration.set(allDecorations, true);
}


function buildInlineDecoration(
	state: EditorState,
	inlineCodeInfo: InlineCodeInfo | null,
	plugin: CodeStylerPlugin,
): Array<Range<Decoration>> {
	if (!inlineCodeInfo || !toDecorateInlineCode(inlineCodeInfo.parameters.value, inlineCodeInfo.content.value))
		return []

	let decorations: Array<Range<Decoration>> = []

	if (inlineCodeInfo.parameters.from < inlineCodeInfo.parameters.to)
		decorations.push({
			from: inlineCodeInfo.parameters.from,
			to: inlineCodeInfo.parameters.to,
			value: Decoration.mark({
				class: PREFIX + "parameters",
			}),
		});

	if (toHighlightInlineCode(inlineCodeInfo.parameters.value, plugin))
		decorations = [
			...decorations,
			...inlineSyntaxHighlight(
				state,
				inlineCodeInfo.parameters.value.language,
				inlineCodeInfo.content.value,
				inlineCodeInfo.parameters.to,
				plugin,
			),
		]

	decorations.push({
		from: inlineCodeInfo.parameters.from,
		to: inlineCodeInfo.parameters.from,
		value: Decoration.replace({
			widget: new HeaderWidget(
				inlineCodeInfo.parameters.value,
				false,
				inlineCodeInfo.content.value,
				false,
				state.field(editorInfoField)?.file?.path ?? "",
				plugin,
			),
			interactive: true,
			interactStart: inlineCodeInfo.section.from,
			interactEnd: inlineCodeInfo.section.to,
			sourceMode: false,
		}),
	});
	decorations.push({
		from: inlineCodeInfo.parameters.from,
		to: inlineCodeInfo.parameters.to,
		value: Decoration.replace({
			interactive: true,
			interactStart: inlineCodeInfo.section.from,
			interactEnd: inlineCodeInfo.section.to,
			sourceMode: false,
		}),
	});

	decorations.push({
		from: inlineCodeInfo.section.to,
		to: inlineCodeInfo.section.to,
		value: Decoration.replace({
			widget: new FooterWidget(
				inlineCodeInfo.parameters.value,
				false,
				inlineCodeInfo.content.value,
				false,
				state.field(editorInfoField)?.file?.path ?? "",
				plugin,
			),
			interactive: true,
			interactStart: inlineCodeInfo.section.from,
			interactEnd: inlineCodeInfo.section.to,
			sourceMode: false,
		}),
	});

	return decorations
}

function inlineSyntaxHighlight(
	state: EditorState,
	language: string | null,
	content: string,
	start: number,
	plugin: CodeStylerPlugin,
): Array<Range<Decoration>> {
	if (language === null)
		return []

	const decorations: Array<Range<Decoration>> = []

	// @ts-expect-error Undocumented Obsidian API
	const mode = window.CodeMirror.getMode(window.CodeMirror.defaults,window.CodeMirror.findModeByName(language)?.mime);
	const startState = window.CodeMirror.startState(mode);

	if (mode?.token) {
		const stream = new window.CodeMirror.StringStream(content);
		while (!stream.eol()) {
			const style = mode.token(stream,startState);
			if (style)
				decorations.push({
					from: start + stream.start,
					to: start + stream.pos,
					value: Decoration.mark({
						class: `cm-${style}`,
					}),
				});

			if (style === "comment")
				decorations.push(
					...getCommentDecorations(
						state,
						start + stream.start,
						null,
						stream.string.slice(stream.start, stream.pos),
						plugin,
					),
				)

			stream.start = stream.pos;
		}
	}

	return decorations;
}
