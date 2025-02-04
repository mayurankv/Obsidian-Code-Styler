import { EditorState, Extension, Line, Range, RangeSet, RangeSetBuilder, SelectionRange, StateEffect, StateField, Transaction } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, PluginValue, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { SyntaxNodeRef } from "@lezer/common";
import { editorInfoField, livePreviewState } from "obsidian";
import { PREFIX } from "src/Internal/constants/general";
import { updateFenceInfo, isFenceStart, isFenceLine, isFenceEnd, isFenceComment } from "src/Internal/Detecting/LivePreview/fenced";
import { FenceCodeParameters, LinkInfo } from "src/Internal/types/parsing";
import { getLineClasses } from "src/Internal/utils/decorating";
import { parseLinks } from "src/Internal/utils/parsing";
import CodeStylerPlugin from "src/main";
import { areRangesInteracting, getCommentDecorations, isSourceMode, isFileIgnored, updateStateField, updateViewPlugin, cursorInView, updateBaseStateField, isRangeInteracting, getStateFieldsViewDecorations, getStateFieldDecorations, getFoldStatuses } from "./codemirror/utils";
import { CommentLinkWidget, FillerWidget, FooterWidget, HeaderWidget, LineNumberWidget } from "./codemirror/widgets";
import { createScrollEventObservers } from "./codemirror/eventListeners";
import { syntaxTree } from "@codemirror/language";
import { parseFenceCodeParameters, toDecorateFenceCode } from "src/Internal/Parsing/fenced";
import { cleanFenceCodeParametersLine } from "src/Internal/utils/detecting";
import { FenceInfo, FenceState } from "src/Internal/types/decoration";
import { fold, visualStateUpdate
} from "./codemirror/stateEffects";

export function getFenceCodemirrorExtensions(
	plugin: CodeStylerPlugin,
) {
	return [
		createViewUpdater(),
		...createFenceCodeDecorations(plugin),
		createScrollEventObservers(plugin),
	]
}

let i = 0

function createFenceCodeDecorations(
	plugin: CodeStylerPlugin,
) {
	const fullStateField = StateField.define<DecorationSet>({
		create(
			state: EditorState,
		): DecorationSet {
			return buildFenceCodeDecorations(
				state,
				Decoration.none,
				plugin,
			);
		},

		update(
			value: DecorationSet,
			transaction: Transaction,
		): DecorationSet {
			value = value.map(transaction.changes)

			if (updateStateField(transaction)) //NOTE: TODO: Ideally would map ranges on docchanged unless affected but quirks mean that statefield doesn'y actually get whole document so some decorations don't exist in create and thus this wouldn't work on scrolling; hence why the view updater is needed
				return buildFenceCodeDecorations(
					transaction.state,
					value.map(transaction.changes),
					plugin,
				);

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

	class FenceCodeDecorations implements PluginValue {
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
		FenceCodeDecorations,
		{
			decorations: (
				value: FenceCodeDecorations,
			) => value.decorations,
		}
	);

	return [
		...stateFields,
		viewPlugin,
	]
}

function createViewUpdater() {
	return EditorView.updateListener.of((update: ViewUpdate) => {
		if (updateViewPlugin(update))
			update.view.dispatch({effects: visualStateUpdate.of(true)})

		if (!cursorInView(update.view))
			console.log("TODO: Scroll to view, ensure only horizontal scrolls though (on selection change)")
	})
}

function buildFenceCodeDecorations(
	state: EditorState,
	value: DecorationSet,
	plugin: CodeStylerPlugin,
): DecorationSet {
	if (isFileIgnored(state))
		return Decoration.none;

	let fenceInfo = new FenceInfo({sourcePath: state.field(editorInfoField)?.file?.path ?? ""})
	let allDecorations: Array<Range<Decoration>> = []

	syntaxTree(state).iterate({ //TODO: Use `ensureSyntaxTree` to get more of document
		enter: (syntaxNode: SyntaxNodeRef) => {
			fenceInfo = updateFenceInfo(
				state,
				syntaxNode,
				fenceInfo,
				plugin,
			)

			if (fenceInfo.toDecorate) {
				if (isFenceStart(syntaxNode)) {
					fenceInfo.decorations.push({
						from: syntaxNode.from,
						to: syntaxNode.to,
						value: "header",
					})
				}

				if (isFenceLine(syntaxNode)) {
					fenceInfo.decorations.push(
						{
							//? LineNumber Widget
							from: syntaxNode.from,
							to: syntaxNode.from,
							value: { lineNumber: fenceInfo.lineNumber },
						},
						{
							//? Line Classes
							from: syntaxNode.from,
							to: syntaxNode.from,
							value: { lineNumber: fenceInfo.lineNumber, lineText: fenceInfo.lineText },
						},
					)

					if (fenceInfo.lineNumber !== 0)
						fenceInfo.decorations.push(
							{
								from: syntaxNode.to,
								to: syntaxNode.to,
								value: { lineNumber: fenceInfo.lineNumber, chars: fenceInfo.lineText.length },
							}
						)

				} else if (isFenceComment(syntaxNode, fenceInfo)) {
					fenceInfo.decorations.push(
						...getCommentDecorations(
							state,
							syntaxNode.from,
							fenceInfo.lineNumber,
							state.sliceDoc(syntaxNode.from, syntaxNode.to),
							plugin,
						),
					)
				}

				if (isFenceEnd(syntaxNode)) {
					fenceInfo.decorations.push({
						from: syntaxNode.from,
						to: syntaxNode.to,
						value: "footer"
					})

					const previousFoldStatuses = getFoldStatuses(value, fenceInfo)
					fenceInfo.baseFoldStatus = fenceInfo.parameters.fold.enabled === true
					fenceInfo.currentFoldStatus = previousFoldStatuses !== null
						? previousFoldStatuses.baseFoldStatus === fenceInfo.baseFoldStatus ? previousFoldStatuses.currentFoldStatus : fenceInfo.baseFoldStatus
						: fenceInfo.baseFoldStatus

					fenceInfo.decorations.push(
						{
							from: fenceInfo.bodyStart,
							to: fenceInfo.bodyEnd,
							value: Decoration.replace({
								block: true,
								side: 10,
								interactive: true,
								interactStart: fenceInfo.headerStart,
								interactEnd: fenceInfo.footerEnd,
								include: fenceInfo.currentFoldStatus,
								viewPlugin: false,
								fold: true,
								currentFoldStatus: fenceInfo.currentFoldStatus,
								baseFoldStatus: fenceInfo.baseFoldStatus,
								language: fenceInfo.parameters.language,
							}),
						},
					)
				}
			}

			if (isFenceEnd(syntaxNode))
				allDecorations.push(...convertFenceDecorations(fenceInfo, plugin))
		}
	});

	allDecorations.push(...convertFenceDecorations(fenceInfo, plugin))

	return Decoration.set(allDecorations, true);
}

function convertFenceDecorations(
	fenceInfo: FenceInfo,
	plugin: CodeStylerPlugin,
) {
	const maxChars = fenceInfo.decorations.reduce(
		(result: number, decoration: Range<any>) => ((typeof decoration.value?.chars === "number") && (decoration.value.chars > result))
			? decoration.value.chars
			: result,
		0,
	)

	const maxLineNumber = fenceInfo.decorations.reduce(
		(result: number, decoration: Range<any>) => ((typeof decoration.value?.lineNumber === "number") && (decoration.value.lineNumber > result))
			? decoration.value.lineNumber
			: result,
		0,
	)


	fenceInfo.decorations.forEach(
		(decoration: Range<any>) => {
			if (!((typeof decoration.value?.lineNumber === "number") && (typeof decoration.value?.subtractChars === "number")))
				return;

			const charsIndex = fenceInfo.decorations.findIndex((_decoration: Range<any>) => (typeof _decoration.value?.lineNumber === "number") && (typeof _decoration.value?.chars === "number") && (_decoration.value.lineNumber === decoration.value.lineNumber))
			fenceInfo.decorations[charsIndex].value.chars -= decoration.value.subtractChars
		}
	)

	return fenceInfo.decorations.filter(
		(decoration: Range<any>) => !(decoration.value?.remove === true)
	).map(
		(decoration: Range<any>) => {
			if (decoration.value === "header")
				return {
					...decoration,
					value: Decoration.widget({
						widget: new HeaderWidget(
							fenceInfo.parameters,
							fenceInfo.currentFoldStatus,
							fenceInfo.content,
							true,
							fenceInfo.sourcePath,
							plugin,
						),
						block: false,
						side: -10,
						interactive: true,
					}),
				}

			else if (decoration.value === "footer")
				return {
					...decoration,
					value: Decoration.widget({
						widget: new FooterWidget(
							fenceInfo.parameters,
							fenceInfo.currentFoldStatus,
							fenceInfo.content,
							true,
							fenceInfo.sourcePath,
							plugin,
						),
						block: false,
						side: -10,
						interactive: true,
					}),
				}

			else if ((typeof decoration.value?.lineNumber === "number") && (typeof decoration.value?.chars === "number"))
				return {
					...decoration,
					value: Decoration.widget({
						widget: new FillerWidget(
							maxChars - decoration.value.chars
						),
						side: 10,
					}),
				}

			else if ((typeof decoration.value?.lineNumber === "number") && (typeof decoration.value?.lineText === "string"))
				return {
					...decoration,
					value: Decoration.line({
						attributes: {
							style: `--cs-gutter-char-size: ${(maxLineNumber + (fenceInfo.parameters.language === "reference" ? 0 : (fenceInfo.parameters.lineNumbers.offset ?? 0))).toString().length}ch`,
							class: getLineClasses(
								fenceInfo.parameters,
								decoration.value.lineNumber,
								decoration.value.lineText,
							).join(" "),

						}
					}),
				}

			else if (typeof decoration.value?.lineNumber === "number")
				return {
					...decoration,
					value: Decoration.widget({
						widget: new LineNumberWidget(
							decoration.value.lineNumber,
							maxLineNumber,
							fenceInfo.parameters,
						),
						side: -5,
					}),
				}

			return decoration
		}
	)
}
