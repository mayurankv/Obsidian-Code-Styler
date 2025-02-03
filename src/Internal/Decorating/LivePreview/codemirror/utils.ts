import { tokenClassNodeProp } from "@codemirror/language";
import { EditorState, Range, RangeSet, SelectionRange, StateField, Transaction } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, ViewUpdate } from "@codemirror/view";
import { SyntaxNodeRef } from "@lezer/common";
import { editorInfoField, editorLivePreviewField, livePreviewState } from "obsidian";
import { PREFIX } from "src/Internal/constants/general";
import { LinkInfo } from "src/Internal/types/parsing";
import { parseLinks } from "src/Internal/utils/parsing";
import { CommentLinkWidget } from "./widgets";
import CodeStylerPlugin from "src/main";
import { visualStateUpdate } from "./stateEffects";
import { AnyRange, BaseRange } from "src/Internal/types/decoration";

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
							)
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
	stateFields: Array<StateField<DecorationSet>>,
): DecorationSet {
	return RangeSet.join(stateFields.map((stateField: StateField<DecorationSet>) => getStateFieldViewDecorations(view, stateField)))
}

export function getStateFieldViewDecorations(
	view: EditorView,
	stateField: StateField<DecorationSet>,
): DecorationSet {
	return view.state.field(stateField)?.update({
		filter: (
			from: number,
			to: number,
			value: Decoration,
		) => !areRangesInteracting(view.state, from, to) && isRangeInteracting(from, to, view.viewport)
	}) ?? Decoration.none
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
	return update.docChanged || update.viewportChanged || (update.selectionSet && !update.view.plugin(livePreviewState)?.mousedown)
}

export function updateBaseStateField(
	transaction: Transaction,
) {
	return transaction.docChanged
}

export function updateStateField(
	transaction: Transaction,
) {
	return updateBaseStateField(transaction) || transaction.effects.some(effect => effect.is(visualStateUpdate))
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
