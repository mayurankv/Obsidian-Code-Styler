import { MarkdownView } from "obsidian";
import { renderedViewFold } from "src/Internal/Decorating/Rendered/fenced";
import { manageExternalReferencedFiles } from "src/Internal/utils/reference";
import CodeStylerPlugin from "src/main";

function viewFold(
	fold: boolean | null,
	plugin: CodeStylerPlugin,
): void {
	const activeView = plugin.app.workspace.getActiveViewOfType(MarkdownView);
	if (activeView) {
		if (activeView.getMode() === "preview")
			renderedViewFold(activeView.contentEl, fold);
		// else if (activeView.getMode() === "source")
		// 	// // @ts-expect-error Undocumented Obsidian API //TODO: Fix livePreviewFold and then uncomment expect error
		// 	livePreviewFold(activeView.editor.cm.docView.view, fold);
	}
}

export function registerCommands(
	plugin: CodeStylerPlugin,
): void {
	plugin.addCommand({
		id: "fold-all",
		name: "Fold all codeblocks",
		callback: () => viewFold(true, this),
	});
	plugin.addCommand({
		id: "unfold-all",
		name: "Unfold all codeblocks",
		callback: () => viewFold(false, this),
	});
	plugin.addCommand({
		id: "reset-all",
		name: "Reset fold state for all codeblocks",
		callback: () => viewFold(null, this),
	});
	plugin.addCommand({
		id: "update-references-vault",
		name: "Update all external references in vault",
		callback: async () => await manageExternalReferencedFiles(this, null, true),
	});
	plugin.addCommand({
		id: "update-references-page",
		name: "Update all external references in note",
		callback: async () => await manageExternalReferencedFiles(this, this.app.workspace.getActiveFile()?.path, true)
	});
	plugin.addCommand({
		id: "clean-references",
		name: "Remove all unneeded external references",
		callback: async () => await manageExternalReferencedFiles(this, null, false)
	});
}
