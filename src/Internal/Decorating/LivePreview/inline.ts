import { EditorState, Range } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, PluginValue, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { editorInfoField, livePreviewState } from "obsidian";
import { PREFIX } from "src/Internal/constants/general";
import { buildInlineDecorations as buildInlineCodeDecorations } from "src/Internal/Detecting/LivePreview/inline";
import { toDecorateInlineCode, toHighlightInlineCode } from "src/Internal/Parsing/inline";
import { InlineCodeInfo } from "src/Internal/types/detecting";
import CodeStylerPlugin from "src/main";
import { areRangesInteracting, getCommentDecorations, isSourceMode, updateViewPlugin } from "./codemirror/utils";
import { FooterWidget, HeaderWidget } from "./codemirror/widgets";

export function getInlineCodeMirrorExtensions(
	plugin: CodeStylerPlugin,
) {
	return [
		createInlineCodeDecorationsViewPlugin(plugin),
		// createInlineCodeDecorationsStateField(plugin),
	]
}

export function createInlineCodeDecorationsViewPlugin(
	plugin: CodeStylerPlugin,
) {
	class InlineCodeDecorationsViewPlugin implements PluginValue {
		decorations: DecorationSet;
		plugin: CodeStylerPlugin;

		constructor(
			view: EditorView,
		) {
			this.decorations = buildInlineCodeDecorations(
				view.state,
				plugin,
				buildInlineCodeDecoration,
			);
		}

		update(
			update: ViewUpdate,
		) {
			if (updateViewPlugin(update))
				this.decorations = buildInlineCodeDecorations(
					update.state,
					plugin,
					buildInlineCodeDecoration,
				);
		}

		destroy() {
			return;
		}
	}

	return ViewPlugin.fromClass(
		InlineCodeDecorationsViewPlugin,
		{
			decorations: (
				value: InlineCodeDecorationsViewPlugin,
			) => value.decorations,
		},
	);
}

function buildInlineCodeDecoration(
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

	if (isSourceMode(state) || areRangesInteracting(state, inlineCodeInfo.section.from, inlineCodeInfo.section.to))
		return decorations

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

	decorations.push({
		from: inlineCodeInfo.section.to,
		to: inlineCodeInfo.section.to,
		value: Decoration.replace({
			widget: new FooterWidget(
				inlineCodeInfo.parameters.value,
				inlineCodeInfo.content.value,
				state.field(editorInfoField)?.file?.path ?? "",
				false,
				plugin,
			)
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
