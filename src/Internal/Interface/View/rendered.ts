import { MarkdownView, WorkspaceLeaf } from "obsidian";
import { WORKSPACE_CHANGE_TIMEOUT } from "src/Internal/constants/interface";
import CodeStylerPlugin from "src/main";

let rerenderTimeout: NodeJS.Timeout = setTimeout(() => { });

export function registerRerenderingOnWorkspaceChange(
	valueName: string,
	getValueCallback: () => string,
	workspaceChangeEvent: string,
	plugin: CodeStylerPlugin,
): void {
	plugin.watchedValues[valueName] = getValueCallback(),
	plugin.registerEvent(
		plugin.app.workspace.on(
			// @ts-expect-error Improperly documented Obsidian API
			workspaceChangeEvent,
			() => {
				const currentValue = getValueCallback();
				if (plugin.watchedValues[valueName] !== currentValue) {
					plugin.watchedValues[valueName] = currentValue;
					clearTimeout(rerenderTimeout);
					rerenderTimeout = setTimeout(
						() => {
							rerenderRenderedView(plugin);
						},
						WORKSPACE_CHANGE_TIMEOUT,
					);
				}
			},
			plugin,
		),
	);

}

export function rerenderRenderedView(
	plugin: CodeStylerPlugin,
): void {
	plugin.app.workspace.iterateRootLeaves((leaf: WorkspaceLeaf) => {
		if (leaf.view instanceof MarkdownView && leaf.view.getMode() === "preview")
			leaf.view.previewMode.rerender(true);
	});
}
