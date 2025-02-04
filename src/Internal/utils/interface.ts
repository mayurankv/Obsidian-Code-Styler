import { EditorView } from "@codemirror/view";
import { editorLivePreviewField, MarkdownView } from "obsidian";
import CodeStylerPlugin from "src/main";

export function viewDependentCallback(
	plugin: CodeStylerPlugin,
	readingCallback: (view: MarkdownView, plugin: CodeStylerPlugin) => boolean,
	livePreviewCallback: (view: EditorView, plugin: CodeStylerPlugin) => void,
	sourceCallback: (view: EditorView, plugin: CodeStylerPlugin) => void = (view: EditorView, plugin: CodeStylerPlugin) => { return },
): void {
	const activeView = plugin.app.workspace.getActiveViewOfType(MarkdownView);
	if (!activeView)
		return

	if (activeView.getMode() === "preview")
		return void readingCallback(activeView, plugin)

	// @ts-expect-error Undocumented Obsidian API
	const view: EditorView = activeView.editor.cm.docView.view

	if (!view.state.field(editorLivePreviewField))
		return sourceCallback(view, plugin)

	if (!readingCallback(activeView, plugin))
		return livePreviewCallback(view, plugin)
}
