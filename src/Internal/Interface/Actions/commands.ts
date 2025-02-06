import { EditorView } from "@codemirror/view";
import { MarkdownView, WorkspaceLeaf } from "obsidian";
import { renderedViewFold } from "src/Internal/Decorating/Rendered/fenced";
import { viewDependentCallback } from "src/Internal/utils/interface";
import { manageExternalReferencedFiles } from "src/Internal/utils/reference";
import CodeStylerPlugin from "src/main";

async function viewFold(
	fold: boolean | null,
	plugin: CodeStylerPlugin,
): Promise<void> {
	await viewDependentCallback(
		plugin,
		(view: MarkdownView, plugin: CodeStylerPlugin) => {
			renderedViewFold(view.contentEl, fold);

			return false;
		},
		(view: EditorView, plugin: CodeStylerPlugin) => { return }, //TODO/
	)
}

export function registerCommands(
	plugin: CodeStylerPlugin,
): void {
	plugin.addCommand({
		id: "fold-all",
		name: "Fold all codeblocks",
		callback: async () => await viewFold(true, this),
	});
	plugin.addCommand({
		id: "unfold-all",
		name: "Unfold all codeblocks",
		callback: async () => await viewFold(false, this),
	});
	plugin.addCommand({
		id: "reset-all",
		name: "Reset fold state for all codeblocks",
		callback: async() => await viewFold(null, this),
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
