import { EditorState, Extension, Line, Range, StateField, Transaction } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, PluginValue, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { SyntaxNodeRef } from "@lezer/common";
import { editorInfoField, livePreviewState } from "obsidian";
import { PREFIX } from "src/Internal/constants/general";
import { buildFenceCodeDecorations } from "src/Internal/Detecting/LivePreview/fenced";
import { FenceCodeParameters, LinkInfo } from "src/Internal/types/parsing";
import { getLineClasses } from "src/Internal/utils/decorating";
import { parseLinks } from "src/Internal/utils/parsing";
import CodeStylerPlugin from "src/main";
import { areRangesInteracting, getCommentDecorations, isSourceMode, hasContentChanged } from "./codemirror/utils";
import { CommentLinkWidget, FillerWidget, FooterWidget, HeaderWidget, LineNumberWidget } from "./codemirror/widgets";
import { createScrollEventObservers } from "./codemirror/eventListeners";

export function getFenceCodemirrorExtensions(
	plugin: CodeStylerPlugin,
) {
	return [
		createFenceCodeDecorationsViewPlugin(plugin),
		createScrollEventObservers(plugin),
	]
}

export function createFenceCodeDecorationsViewPlugin(
	plugin: CodeStylerPlugin,
) {
	class InlineCodeDecorationsViewPlugin implements PluginValue {
		decorations: DecorationSet;
		plugin: CodeStylerPlugin;

		constructor(
			view: EditorView,
		) {
			this.decorations = buildFenceCodeDecorations(
				view.state,
				plugin,
				buildHeaderDecorations,
				buildLineDecorations,
				buildIntraLineDecoration,
				buildFooterDecorations,
				modifyIntermediateDecorations,
				filterBadDecorations,
			);
		}

		update(
			update: ViewUpdate,
		) {
			if (hasContentChanged(update))
				this.decorations = buildFenceCodeDecorations(
					update.state,
					plugin,
					buildHeaderDecorations,
					buildLineDecorations,
					buildIntraLineDecoration,
					buildFooterDecorations,
					modifyIntermediateDecorations,
					filterBadDecorations,
				);
			// TODO: Attempt and reading and writing measure cycle
			// if (hasContentChanged(update))
			// 	update.view.requestMeasure({
			// 		read: (view) => getWrappedCodeblocks(view).map((codeblocks) => codeblocks.reduce((result: number, line: HTMLElement) => result >= line.scrollWidth ? result : line.scrollWidth, 0)),
			// 		write: (measure, view) => getWrappedCodeblocks(view).forEach((codeblocks, index) => codeblocks.forEach((element: HTMLElement) => { element.style.width = `${measure[index]}px`; console.log(element.style, measure[index])}))
			// 	})
			// update.view.contentDOM.querySelector(".cs-filler")?.addEventListener("scroll",console.log)
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
		}
	);
}

function buildHeaderDecorations(
	state: EditorState,
	startPosition: number,
	endPosition: number,
	fenceCodeParameters: FenceCodeParameters,
	plugin: CodeStylerPlugin,
): Array<Range<Decoration>> {
	if (areRangesInteracting(state, startPosition, endPosition))
		return [];

	return [{
		from: startPosition,
		to: endPosition,
		value: Decoration.widget({
			widget: new HeaderWidget(
				fenceCodeParameters,
				state.field(editorInfoField)?.file?.path ?? "",
				true,
				plugin,
			)
		}),
	}]
}

function buildLineDecorations(
	state: EditorState,
	position: number,
	lineText: string,
	lineNumber: number,
	fenceCodeParameters: FenceCodeParameters,
	plugin: CodeStylerPlugin,
): Array<Range<any>> {
	return [
		...(lineNumber === 0 ? [] : [
			{
				from: position,
				to: position,
				value: Decoration.widget({
					widget: new LineNumberWidget(
						lineNumber,
						fenceCodeParameters,
					)
				}),
			},
		]),
		{
			from: position,
			to: position,
			value: Decoration.line({
				attributes: {
					style: "",
					class: getLineClasses(fenceCodeParameters, lineNumber, lineText).join(" "),
				}
			}),
		},
		...(
			lineNumber !== 0
				? [{
					from: position + lineText.length,
					to: position + lineText.length,
					value: {chars: lineText.length},
				}]
				: []
		),
	]
}

function buildIntraLineDecoration(
	state: EditorState,
	syntaxNode: SyntaxNodeRef,
	line: Line,
	plugin: CodeStylerPlugin,
): Array<Range<Decoration>> {
	if (syntaxNode.type.name.includes("comment_hmd-codeblock") && (syntaxNode.from >= line.from)  && (syntaxNode.to <= line.to)) {
		const commentText = state.sliceDoc(syntaxNode.from, syntaxNode.to);

		const decorations = getCommentDecorations(
			state,
			syntaxNode.from,
			commentText,
			plugin,
		)

		return decorations
	}

	return []
}

function buildFooterDecorations(
	state: EditorState,
	startPosition: number,
	endPosition: number,
	codeStartPosition: number,
	fenceCodeParameters: FenceCodeParameters,
	plugin: CodeStylerPlugin,
): Array<Range<Decoration>> {
	if (areRangesInteracting(state, startPosition, endPosition))
		return [];

	return [{
		from: startPosition,
		to: endPosition,
		value: Decoration.widget({
			widget: new FooterWidget(
				fenceCodeParameters,
				"",
				state.field(editorInfoField)?.file?.path ?? "",
				true,
				plugin,
			)
		}),
	}]
}

function modifyIntermediateDecorations(
	decorations: Array<Range<any>>,
): Array<Range<any>> {
	const maxChars = decorations.reduce(
		(result: number, decoration: Range<any>) => ((typeof decoration.value?.chars === "number") && (decoration.value.chars > result))
			? decoration.value.chars
			: result,
		0,
	)

	decorations = decorations.map(
		(decoration: Range<any>) => {
			if (typeof decoration.value?.chars === "number")
				return {
				...decoration, value: Decoration.widget({
					widget: new FillerWidget(
						maxChars - decoration.value.chars
					),
					side: 100,
				})}

			return decoration
		}
	)

	return decorations
}

function filterBadDecorations(
	decorations: Array<Range<any>>,
): Array<Range<Decoration>> {
	decorations = decorations.filter(
		(decoration: Range<any>) => {
			if (typeof decoration.value?.chars === "number")
				return false

			return true
		}
	)

	return decorations
}
