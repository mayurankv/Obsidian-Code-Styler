import { tokenClassNodeProp } from "@codemirror/language";
import { EditorState, Range, RangeSet, RangeValue, SelectionRange, StateField, Transaction } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, ViewUpdate } from "@codemirror/view";
import { SyntaxNodeRef } from "@lezer/common";
import { editorInfoField, editorLivePreviewField, livePreviewState } from "obsidian";
import { PREFIX } from "src/Internal/constants/general";
import { LinkInfo } from "src/Internal/types/parsing";
import { parseLinks } from "src/Internal/utils/parsing";
import { CommentLinkWidget } from "./widgets";
import CodeStylerPlugin from "src/main";
import { fenceScroll, visualStateUpdate } from "./stateEffects";
import { AnyRange, BaseRange, FenceInfo } from "src/Internal/types/decoration";
import { RangeNumber } from "./ranges";

export function createViewUpdater() {
	return EditorView.updateListener.of((update: ViewUpdate) => {
		if (updateViewPlugin(update))
			update.view.dispatch({effects: visualStateUpdate.of(true)})

		// if (!cursorInView(update.view))
		// 	console.log("TODO: Scroll to view, ensure only horizontal scrolls though (on selection change)")
	})
}

export function getCommentDecorations(
	state: EditorState,
	from: number,
	lineNumber: number | null,
	commentText: string,
	plugin: CodeStylerPlugin,
): Array<Range<any>> {
	const linksInfo = parseLinks(commentText)
	const commentInfo = linksInfo.map((linkInfo: LinkInfo) => {
		return {
			...linkInfo,
			fullLink: linkInfo.match,
			from: from + linkInfo.offset,
			to: from + linkInfo.offset + linkInfo.match.length,
		}
	})

	const decorations = commentInfo.reduce(
		(result: Array<Range<any>>, extendedLinkInfo) => {
			if (isSourceMode(state) || areRangesInteracting(state, extendedLinkInfo.from, extendedLinkInfo.to)) {
				if (extendedLinkInfo.type === "wiki")
					result.push({
						from: extendedLinkInfo.from + 2,
						to: extendedLinkInfo.to - 2,
						value: Decoration.mark({
							class: `cm-hmd-internal-link ${PREFIX}-source-link`,
							attributes: {
								destination: extendedLinkInfo.reference,
							},
						}),
					})

				else if (extendedLinkInfo.type === "url") {
					result.push({
						from: extendedLinkInfo.from,
						to: extendedLinkInfo.to,
						value: Decoration.mark({
							class: `cm-link ${PREFIX}-source-link`,
							attributes: {
								destination: extendedLinkInfo.reference,
							},
						}),
					})
				} else {
					let startSpaceCount = extendedLinkInfo.fullLink.slice(1).search(/\S/) + 1
					let endSpaceCount = extendedLinkInfo.fullLink.slice(1 + startSpaceCount + extendedLinkInfo.title.length).search(/\S/)

					const splitIndex = 1 + startSpaceCount + extendedLinkInfo.title.length + endSpaceCount

					result.push({
						from: extendedLinkInfo.from + 1,
						to: extendedLinkInfo.from + splitIndex - 1,
						value: Decoration.mark({
							class: `"cm-link ${PREFIX}source-link`,
							attributes: {
								destination: extendedLinkInfo.reference,
							},
						}),
					})

					result.push({
						from: extendedLinkInfo.from + splitIndex + 1,
						to: extendedLinkInfo.to - 1,
						value: Decoration.mark({
							class: "cm-string cm-url",
						})
					})
				}

			} else {
				result.push(
					{
						from: extendedLinkInfo.from,
						to: extendedLinkInfo.to,
						value: Decoration.replace({
							widget: new CommentLinkWidget(
								extendedLinkInfo.type === "wiki"
									? `[[${extendedLinkInfo.reference}|${extendedLinkInfo.title}]]`
									: `[${extendedLinkInfo.title}](${extendedLinkInfo.reference})`,
								state.field(editorInfoField)?.file?.path ?? "",
								plugin,
							),
							interactive: true,
							sourceMode: false,
						}),
					},
				)

				if (lineNumber !== null)
					result.push(
						{
							from: extendedLinkInfo.from,
							to: extendedLinkInfo.to,
							value: { lineNumber: lineNumber, subtractChars: extendedLinkInfo.match.length - extendedLinkInfo.title.length , remove: true }
						},
					)

			}

			return result
		},
		[],
	)

	return decorations
}

export function getStateFieldsViewDecorations(
	view: EditorView,
	stateFields: Array<StateField<RangeSet<any>>>,
): DecorationSet {
	return RangeSet.join(stateFields.map((stateField: StateField<DecorationSet>) => getStateFieldViewDecorations(view, stateField)))
}

export function getStateFieldDecorations(
	state: EditorState,
	stateField: StateField<RangeSet<any>>,
): DecorationSet {
	return state.field(stateField).update({ //TODO: Maybe update to between? Might update in place
		filter: (
			from: number,
			to: number,
			value: any,
		) => (typeof value?.spec === "object") &&
			(value.spec?.include !== false) &&
			(value.spec?.viewPlugin === false) &&
			!(value.spec?.sourceMode === false && isSourceMode(state)) &&
			!(
				value.spec?.interactive === true &&
				areRangesInteracting(state, value.spec?.interactStart ?? from, value.spec?.interactEnd ?? to)
			),
	})
}

export function getStateFieldViewDecorations(
	view: EditorView,
	stateField: StateField<DecorationSet>,
): DecorationSet {
	// console.log(isSourceMode(view.state))
	return view.state.field(stateField).update({ //TODO: Maybe update to between? Might update in place
		filter: (
			from: number,
			to: number,
			value: any,
		) => (typeof value?.spec === "object") &&
			(value.spec?.include !== false) &&
			(value.spec?.viewPlugin !== false) &&
			!(value.spec?.sourceMode === false && isSourceMode(view.state)) &&
			!(
				value.spec?.interactive === true &&
				areRangesInteracting(view.state, value.spec?.interactStart ?? from, value.spec?.interactEnd ?? to) &&
				!view.plugin(livePreviewState)?.mousedown &&
				view.hasFocus
			) &&
			isRangeInteracting(from, to, view.viewport),
		filterFrom: view.viewport.from,
		filterTo: view.viewport.to,
	})
}

export function getStateFieldScrollStates(
	state: EditorState,
	stateField: StateField<RangeSet<any>>,
): RangeSet<RangeNumber> {
	return state.field(stateField).update({ //TODO: Maybe update to between? Might update in place
		filter: (
			from: number,
			to: number,
			value: any,
		) => (value instanceof RangeNumber) &&
			(typeof value?.number === "number"),
	})
}

export function getFoldStatuses(
	value: RangeSet<any>,
	fenceInfo: FenceInfo,
): {currentFoldStatus: boolean, baseFoldStatus: boolean} | null {
	let foldStatuses: {currentFoldStatus: boolean, baseFoldStatus: boolean} | null = null
	value.between(
		fenceInfo.headerStart,
		fenceInfo.footerEnd,
		(
			from: number,
			to: number,
			value: any,
		) => {
			if (typeof value?.spec?.fold !== "boolean")
				return

			foldStatuses = {currentFoldStatus: value.spec.currentFoldStatus, baseFoldStatus: value.spec.baseFoldStatus}

			return false
		},
	)

	return foldStatuses
}

export function getScrollStatus(
	value: RangeSet<any>,
	fenceInfo: FenceInfo,
): number | null {
	let scrollStatus: number | null = null
	value.between(
		fenceInfo.headerStart,
		fenceInfo.footerEnd,
		(
			from: number,
			to: number,
			value: any,
		) => {
			if (!(value instanceof RangeNumber))
				return

			scrollStatus = value.number

			return false
		},
	)

	return scrollStatus
}

export function getFenceLimits(
	position: number,
	value: RangeSet<any>,
	exclude: boolean = true,
): { fenceLimit: {from: number, to: number} | null, fenceValue: any | null, filteredValue: RangeSet<any> } {
	let fenceLimit: {from: number, to: number} | null = null
	let fenceValue: any | null = null

	const filteredValue = value.update({
		filter: (from: number, to: number, value: any) => {
			if (!(value instanceof RangeNumber))
				return exclude

			if (!valueInRange(position, from, to))
				return exclude

			fenceLimit = {from: from, to: to}
			fenceValue = value

			return !exclude
		},
	})

	return {fenceLimit: fenceLimit, fenceValue: fenceValue, filteredValue: filteredValue}
}

// export function updateStateFieldDecorations( //TODO: This should be the function that properly maps decorations between docchanged eveents and rewrites
// 	state: EditorState,
// 	decorations: DecorationSet,
// ) {
// 	decorations.between()

// 	return state.selection.ranges.some((range: SelectionRange) => isRangeInteracting(from, to, range))
// }

export function areRangesInteracting(
	state: EditorState,
	from: number,
	to: number,
) {
	return state.selection.ranges.some((range: SelectionRange) => isRangeInteracting(from, to, range))
}

export function isRangeInteracting<T extends BaseRange>(
	from: number,
	to: number,
	range: T,
): boolean {
	return (
		(from <= range.from && range.from <= to) || (from <= range.to && range.to <= to) ||
		(range.from <= from && from <= range.to) || (range.from <= to && to <= range.to)
	);
}

export function isFileIgnored(
	state: EditorState,
): boolean {
	const filePath = state.field(editorInfoField)?.file?.path;
	if (typeof filePath !== "undefined")
		return this.app.metadataCache.getCache(filePath)?.frontmatter?.["code-styler-ignore"]?.toString() === "true";
	return false;
}

export function isSourceMode(
	state: EditorState,
): boolean {
	return !state.field(editorLivePreviewField);
}

export function getInlineDelimiterSize(
	syntaxNode: SyntaxNodeRef,
): number | null {
	const properties = new Set(syntaxNode.node.type.prop<string>(tokenClassNodeProp)?.split(" "));
	if (!(properties.has("inline-code") && !properties.has("formatting")))
		return null;

	const previousSibling = syntaxNode.node.prevSibling;
	if (!previousSibling)
		return null;

	return previousSibling.to - previousSibling.from;
}

export function updateViewPlugin(
	update: ViewUpdate,
): boolean {
	return update.docChanged || update.viewportChanged || ((update.selectionSet) && !update.view.plugin(livePreviewState)?.mousedown)
}

export function updateBaseStateField(
	transaction: Transaction,
): boolean {
	return transaction.docChanged
}

export function updateStateField(  //NOTE: TODO: Ideally would map ranges on docchanged unless affected but quirks mean that statefield doesn'y actually get whole document so some decorations don't exist in create and thus this wouldn't work on scrolling; hence why the view updater is needed
	transaction: Transaction,
): boolean {
	return updateBaseStateField(transaction) || transaction.effects.some(effect => effect.is(visualStateUpdate))
}

export function updateInteractions(
	update: ViewUpdate,
): boolean {
	return update.transactions.some((transaction) => transaction.effects.some((effect) => effect.is(fenceScroll)))
}

export function cursorInView(
	view: EditorView,
) {
	const cursorPos = view.state.selection.main.head;
	const cursorCoords = view.coordsAtPos(cursorPos);

	if (!cursorCoords)
		return false;

	const viewportRect = view.contentDOM.getBoundingClientRect();
	const inView = (cursorCoords.left >= viewportRect.left && cursorCoords.right <= viewportRect.right);

	return inView
}

export function lineDOMatPos(
	view: EditorView,
	pos: number,
): HTMLElement | null {
	if (!isVisible(view, pos))
		return null;

	// @ts-expect-error private API
	const children: Array<any> | undefined = view.docView?.children;

	if (!children)
		return null;

	let from = 0;

	for (let i = 0; i < children.length; i++) {
		const child = children[i];
		const to = from + child.length;

		if ('addLineDeco' in child && pos >= from && pos <= to)
			return (child.dom ?? null) as HTMLElement | null;

		from = to + child.breakAfter;

		if (pos < from)
			break;
	}

	return null;
}

export function valueInRange(
	position: number,
	from: number,
	to: number,
): boolean {
	return (from <= position) && (position <= to)
}

export function isVisible(
	view: EditorView,
	pos: number,
): boolean {
	return view.visibleRanges.some(range => isRangeInteracting(pos, pos, range))
}
