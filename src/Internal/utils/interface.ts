import { EditorView } from "@codemirror/view";
import { editorLivePreviewField, MarkdownView } from "obsidian";
import CodeStylerPlugin from "src/main";

export async function viewDependentCallback(
	plugin: CodeStylerPlugin,
	readingCallback: (view: MarkdownView, plugin: CodeStylerPlugin) => Promise<boolean>,
	livePreviewCallback: (view: EditorView, plugin: CodeStylerPlugin) => Promise<void>,
	sourceCallback: (view: EditorView, plugin: CodeStylerPlugin) => Promise<void> = async (view: EditorView, plugin: CodeStylerPlugin) => { return },
): Promise<void> {
	const activeView = plugin.app.workspace.getActiveViewOfType(MarkdownView);
	if (!activeView)
		return

	if (activeView.getMode() === "preview")
		return void await readingCallback(activeView, plugin)

	// @ts-expect-error Undocumented Obsidian API
	const view: EditorView = activeView.editor.cm.docView.view

	if (!view.state.field(editorLivePreviewField))
		return await sourceCallback(view, plugin)

	if (!await readingCallback(activeView, plugin))
		return await livePreviewCallback(view, plugin)
}
