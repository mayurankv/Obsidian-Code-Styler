import { EditorView, PluginValue, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { editorInfoField } from "obsidian";
import { PREFIX } from "src/Internal/constants/general";
import { addReferenceSyntaxHighlight } from "src/Internal/Decorating/LivePreview/codemirror/modes";
import CodeStylerPlugin from "src/main";

class ReferenceModeViewPlugin implements PluginValue {
	constructor(
		view: EditorView,
	) {
		addReferenceSyntaxHighlight(window.CodeMirror);
	}

	update(
		update: ViewUpdate,
	) {
		return;
	}

	destroy() {
		return;
	}
}

export function getReferenceCodeMirrorExtensions(
	plugin: CodeStylerPlugin,
) {
	return [
		getModeInitialiserViewPlugin(plugin),
	]
}

function getModeInitialiserViewPlugin(
	plugin: CodeStylerPlugin,
): ViewPlugin<ReferenceModeViewPlugin> {
	return ViewPlugin.define(
		(view) => new ReferenceModeViewPlugin(view),
		{
			eventHandlers: {
				click: function (
					event: MouseEvent,
					view: EditorView,
				) {
					if (
						!(event.target as HTMLElement).classList.contains(PREFIX + "source-link") ||
						!(event.metaKey === true)
					)
						return;

					const sourcePath = view.state.field(editorInfoField)?.file?.path ?? "";
					const destination = (event.target as HTMLElement).getAttribute("destination");
					if (!destination)
						return;

					plugin.app.workspace.openLinkText(
						destination,
						sourcePath,
						true,
					);
				}
			}
		},
	)
}
