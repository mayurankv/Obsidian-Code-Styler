import { tokenClassNodeProp } from "@codemirror/language";
import { EditorState, SelectionRange } from "@codemirror/state";
import { SyntaxNodeRef } from "@lezer/common";
import { editorInfoField, editorLivePreviewField } from "obsidian";

export function areRangesInteracting(
	state: EditorState,
	from: number,
	to: number,
) {
	return state.selection.ranges.some((range: SelectionRange) => isRangeInteracting(from, to, range))
}

function isRangeInteracting(
	from: number,
	to: number,
	range: SelectionRange,
): boolean {
	return (from <= range.head && range.head <= to) || (from <= range.anchor && range.anchor <= to);
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
