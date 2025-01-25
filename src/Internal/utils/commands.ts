import { MarkdownView } from "obsidian";
import CodeStylerPlugin from "src/main";
import { renderedViewFold } from "../Decorating/Rendered/Fenced";

export function viewFold(
	fold: boolean | null,
	plugin: CodeStylerPlugin,
) {
	const activeView = plugin.app.workspace.getActiveViewOfType(MarkdownView);
	if (activeView) {
		if (activeView.getMode() === "preview")
			renderedViewFold(activeView.contentEl, fold);
		else if (activeView.getMode() === "source")
			//@ts-expect-error Undocumented Obsidian API
			editingDocumentFold(activeView.editor.cm.docView.view, fold);
	}
}
