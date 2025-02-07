import { syntaxTree } from "@codemirror/language";
import { EditorState, Extension, Range, RangeSet, StateEffect, StateField, Transaction } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, PluginValue, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { SyntaxNodeRef } from "@lezer/common";
import { editorInfoField } from "obsidian";
import { isFenceComment, isFenceEnd, isFenceLine, isFenceStart, updateFenceInfo } from "src/Internal/Detecting/LivePreview/fenced";
import { FenceInfo } from "src/Internal/types/decoration";
import { getLineClasses } from "src/Internal/utils/decorating";
import CodeStylerPlugin from "src/main";
import { hoverListener, scrollListener, setScroll } from "./codemirror/eventListeners";
import { getCommentDecorations, getFenceLimits, getFoldStatuses, getScrollStatus, getStateFieldDecorations, getStateFieldScrollStates, getStateFieldsViewDecorations, isFileIgnored, lineDOMatPos, updateBaseStateField, updateInteractions, updateStateField, updateViewPlugin, valueInRange } from "./codemirror/utils";
import { FillerWidget, FooterWidget, HeaderWidget, LineNumberWidget } from "./codemirror/widgets";
import { RangeNumber } from "./codemirror/ranges";
import { fenceScroll } from "./codemirror/stateEffects";
import { SCROLL_TIMEOUT } from "src/Internal/constants/interface";
import { PREFIX } from "src/Internal/constants/general";
import { DATA_PREFIX, SKIP_ATTRIBUTE } from "src/Internal/constants/detecting";

export function getFenceCodemirrorExtensions(
	plugin: CodeStylerPlugin,
) {
	return [
		...createFenceCodeDecorations(plugin),
	]
}

function createFenceCodeDecorations(
	plugin: CodeStylerPlugin,
) {
	const fullStateField = StateField.define<RangeSet<any>>({
		create(
			state: EditorState,
		): RangeSet<any> {
			return buildFenceCodeDecorations(
				state,
				Decoration.none,
				plugin,
			);
		},

		update(
			value: RangeSet<any>,
			transaction: Transaction,
		): RangeSet<any> {
			value = value.map(transaction.changes)

			if (updateStateField(transaction)) //NOTE: TODO: Ideally would map ranges on docchanged unless affected but quirks mean that statefield doesn'y actually get whole document so some decorations don't exist in create and thus this wouldn't work on scrolling; hence why the view updater is needed
				value = buildFenceCodeDecorations(
					transaction.state,
					value.map(transaction.changes),
					plugin,
				);

			value = transaction.effects.reduce(
				(value: RangeSet<any>, effect: StateEffect<any>) => adjustTransactions(value, effect, transaction),
				value,
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

		addDecorations(
			view: EditorView,
		) {
			this.decorations = getStateFieldsViewDecorations(view, stateFields)
		}

		destroy() {
			return;
		}
	}

	class FenceCodeInteractions implements PluginValue {
		plugin: CodeStylerPlugin;

		constructor(
			view: EditorView,
		) {
			view.contentDOM.addEventListener(
				"scroll",
				(event: Event) => scrollListener(event, plugin),
				{
					capture: true,
				},
			)
			view.contentDOM.addEventListener(
				"mouseenter",
				(event: Event) => hoverListener(event, plugin),
				{
					capture: true,
				},
			)
			view.contentDOM.addEventListener(
				"mouseleave",
				(event: Event) => hoverListener(event, plugin),
				{
					capture: true,
				},
			)
		}

		update(
			update: ViewUpdate,
		) {
			if (updateViewPlugin(update) || updateInteractions(update))
				this.addInteractions(
					update.view,
					update.transactions,
				)
		}

		addInteractions(
			view: EditorView,
			transactions: readonly Transaction[],
		) {
			const scrollEffects = transactions.reduce(
				(result: Array<StateEffect<any>>, transaction: Transaction) => {
					transaction.effects.forEach(
				 		(effect: StateEffect<any>) => {
							if (effect.is(fenceScroll))
								result.push(effect)

						}
					)

					return result
				},
				[],
			)
			addScrollInteractions(
				view,
				scrollEffects,
				fullStateField,
			)
		}

		destroy() {
			return;
		}
	}

	const decorationViewPlugin = ViewPlugin.fromClass(
		FenceCodeDecorations,
		{
			decorations: (
				value: FenceCodeDecorations,
			) => value.decorations,
		},
	);

	const interactionViewPlugin = ViewPlugin.fromClass(
		FenceCodeInteractions,
		{},
	);

	const viewPlugins = [
		decorationViewPlugin,
		interactionViewPlugin,
	]

	return [
		...stateFields,
		...viewPlugins,
	]
}

function adjustTransactions(
	value: RangeSet<any>,
	effect: StateEffect<any>,
	transaction: Transaction,
): RangeSet<any> {
	if (effect.is(fenceScroll)) {
		if (transaction.docChanged)
			return value;

		const { fenceLimit, fenceValue, filteredValue } = getFenceLimits(effect.value.position, value)
		if (fenceLimit === null)
			throw new Error("Missing fence range")

		value = filteredValue.update({
			add: [
				new RangeNumber(effect.value.scrollPosition).range(
					fenceLimit.from,
					fenceLimit.to,
				)
			],
			sort: true,

		})

		return value
	}

	return value
}

function buildFenceCodeDecorations(
	state: EditorState,
	value: RangeSet<any>,
	plugin: CodeStylerPlugin,
): RangeSet<any> {
	if (isFileIgnored(state))
		return Decoration.none;

	let fenceInfo = new FenceInfo({sourcePath: state.field(editorInfoField)?.file?.path ?? ""})
	let allDecorations: Array<Range<any>> = []

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
					const previousFoldStatuses = getFoldStatuses(value, fenceInfo)
					fenceInfo.baseFoldStatus = fenceInfo.parameters.fold.enabled === true
					fenceInfo.currentFoldStatus = previousFoldStatuses !== null
						? previousFoldStatuses.baseFoldStatus === fenceInfo.baseFoldStatus ? previousFoldStatuses.currentFoldStatus : fenceInfo.baseFoldStatus
						: fenceInfo.baseFoldStatus

					fenceInfo.scroll = getScrollStatus(value, fenceInfo) ?? 0

					fenceInfo.decorations.push(
						{
							from: syntaxNode.from,
							to: syntaxNode.to,
							value: "footer"
						},
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
								sourceMode: false,
								fold: true,
								currentFoldStatus: fenceInfo.currentFoldStatus,
								baseFoldStatus: fenceInfo.baseFoldStatus,
								language: fenceInfo.parameters.language,
							}),
						},
						{
							from: fenceInfo.bodyStart,
							to: fenceInfo.bodyEnd,
							value: new RangeNumber(fenceInfo.scroll),
						},
					)
				}
			}

			if (isFenceEnd(syntaxNode))
				allDecorations.push(...convertFenceDecorations(fenceInfo, plugin))
		}
	});

	allDecorations.push(...convertFenceDecorations(fenceInfo, plugin))

	return RangeSet.of(allDecorations, true);
}

function convertFenceDecorations(
	fenceInfo: FenceInfo,
	plugin: CodeStylerPlugin,
): Array<Range<any>> {
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
						sourceMode: false,
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
						sourceMode: false,
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
						sourceMode: false,
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
						},
						sourceMode: false,
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
						sourceMode: false,
					}),
				}

			return decoration
		}
	)
}

let scrollTimeout: NodeJS.Timeout = setTimeout(() => { });
let reset: boolean = true
let scrollGroups: Array<Array<HTMLElement>>
let ticking = false;

function addScrollInteractions(
	view: EditorView,
	scrollEffects: Array<StateEffect<any>>,
	stateField: StateField<RangeSet<any>>,
): void {
	if (scrollEffects.length === 0)
		return

	else if (scrollEffects.length !== 1)
		throw new Error(`Unexpected scroll effects`)

	const position = scrollEffects[0].value.position

	const scrollStates = getStateFieldScrollStates(view.state, stateField)
	scrollStates.update({
		filter: (from: number, to: number, value: any) => valueInRange(position, from, to) && (setScroll(view, from, value.number) ?? true),
		filterFrom: view.viewport.from,
		filterTo: view.viewport.to,
	})
}
