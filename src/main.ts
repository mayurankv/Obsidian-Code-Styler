import { Plugin, MarkdownView, WorkspaceLeaf } from "obsidian";

import { DEFAULT_SETTINGS, LANGUAGE_ICONS_DATA, CodeStylerSettings } from './Settings';
import { SettingsTab } from "./SettingsTab";
import { removeStylesAndClasses, updateStyling } from "./ApplyStyling";
import { createCodeblockCodeMirrorExtensions } from "./EditingView";
import { destroyReadingModeElements, executeCodeMutationObserver, readingViewCodeblockDecoratingPostProcessor, readingViewInlineDecoratingPostProcessor } from "./ReadingView";

export default class CodeStylerPlugin extends Plugin {
	settings: CodeStylerSettings;
	executeCodeMutationObserver: MutationObserver;
	languageIcons: Record<string,string>;
	sizes: {
		font: string;
		zoom: string;
	};
	
	async onload() {
		await this.loadSettings(); // Load Settings
		const settingsTab = new SettingsTab(this.app,this);
		this.addSettingTab(settingsTab);

		document.body.classList.add('code-styler'); // Load Styles
		updateStyling(this.settings,this.app);

		this.languageIcons = Object.keys(LANGUAGE_ICONS_DATA).reduce((result: {[key: string]: string}, key: string) => { // Load Icons
			result[key] = URL.createObjectURL(new Blob([`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32">${LANGUAGE_ICONS_DATA[key]}</svg>`], { type: "image/svg+xml" }));
			return result
		},{});
		this.sizes = {
			font: document.body.getCssPropertyValue('--font-text-size'),
			zoom: document.body.getCssPropertyValue('--zoom-factor'),
		};

		this.executeCodeMutationObserver = executeCodeMutationObserver; // Add execute code mutation observer
		
		this.registerMarkdownPostProcessor(async (el,ctx) => {await readingViewCodeblockDecoratingPostProcessor(el,ctx,this)}); // Add codeblock decorating markdownPostProcessor
		this.registerMarkdownPostProcessor(async (el,ctx) => {await readingViewInlineDecoratingPostProcessor(el,ctx,this)}); // Add inline code decorating markdownPostProcessor

		this.registerEditorExtension(createCodeblockCodeMirrorExtensions(this.settings,this.languageIcons)); // Add codemirror extensions

		let zoomTimeout: NodeJS.Timeout = setTimeout(()=>{});
		this.registerEvent(this.app.workspace.on('css-change',()=>{
			updateStyling(this.settings,this.app); // Update styling on css changes
			let currentFontSize = document.body.getCssPropertyValue('--font-text-size');
			if (this.sizes.font !== currentFontSize) {
				this.sizes.font = currentFontSize;
				clearTimeout(zoomTimeout);
				zoomTimeout = setTimeout(()=>{
					this.rerenderPreview(); // Re-render on font size changes
				},1000);
			}
		},this));
		this.registerEvent(this.app.workspace.on('resize',()=>{
			let currentZoomSize = document.body.getCssPropertyValue('--zoom-factor');
			if (this.sizes.zoom !== currentZoomSize) {
				this.sizes.zoom = currentZoomSize;
				clearTimeout(zoomTimeout);
				zoomTimeout = setTimeout(()=>{
					this.rerenderPreview(); // Re-render on zoom changes
				},1000);
			}
		},this));

		this.app.workspace.onLayoutReady(()=>{this.rerenderPreview()}); // Add decoration on enabling of plugin

		console.log("Loaded plugin: Code Styler");
	}
	
	onunload() {
		this.executeCodeMutationObserver.disconnect();
		removeStylesAndClasses();
		destroyReadingModeElements();
		for (const url of Object.values(this.languageIcons)) // Unload icons
			URL.revokeObjectURL(url);
		console.log("Unloaded plugin: Code Styler");
	}

	async loadSettings() {
		this.settings = Object.assign({}, structuredClone(DEFAULT_SETTINGS), await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.app.workspace.updateOptions();
		updateStyling(this.settings,this.app);
	}

	rerenderPreview() {
		this.app.workspace.iterateRootLeaves((leaf: WorkspaceLeaf) => {
			if (leaf.view instanceof MarkdownView && leaf.view.getMode() === 'preview')
				leaf.view.previewMode.rerender(true);
		});
	}
}
