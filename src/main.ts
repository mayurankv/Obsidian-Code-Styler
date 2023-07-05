import { Plugin, FileView, Notice } from "obsidian";

import { DEFAULT_SETTINGS, LANGUAGE_ICONS_DATA, CodeblockCustomizerSettings } from './Settings';
import { SettingsTab } from "./SettingsTab";
import { removeStylesAndClasses, updateStyling } from "./ApplyStyling";
import { createCodeMirrorExtensions } from "./EditingView";
import { destroyReadingModeElements, executeCodeMutationObserver, readingViewPostProcessor } from "./ReadingView";

export default class CodeblockCustomizerPlugin extends Plugin {
	settings: CodeblockCustomizerSettings;
	executeCodeMutationObserver: MutationObserver;
	languageIcons: Record<string,string>;
	
	async onload() {
		await this.loadSettings();
		document.body.classList.add('codeblock-customizer');
		updateStyling(this.settings,this.app);
		this.registerEvent(this.app.workspace.on('css-change',()=>updateStyling(this.settings,this.app),this));
		
		const settingsTab = new SettingsTab(this.app,this);
		this.addSettingTab(settingsTab);

		this.languageIcons = Object.keys(LANGUAGE_ICONS_DATA).reduce((result: {[key: string]: string}, key: string) => { // Load Icons
			result[key] = URL.createObjectURL(new Blob([`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32">${LANGUAGE_ICONS_DATA[key]}</svg>`], { type: "image/svg+xml" }));
			return result
		},{})

		this.registerEditorExtension(createCodeMirrorExtensions(this.settings,this.languageIcons)); // Add codemirror extensions

		this.executeCodeMutationObserver = executeCodeMutationObserver; // Add execute code mutation observer
		this.app.workspace.iterateRootLeaves(leaf => { // Add decoration on enabling of plugin
			if (leaf.view instanceof FileView)
				readingViewPostProcessor(leaf.view.contentEl,{sourcePath: leaf.view.file.path, getSectionInfo: (element: HTMLElement)=>null, frontmatter: undefined},this);
		})
		this.registerMarkdownPostProcessor(async (element,context) => {await readingViewPostProcessor(element,context,this)}) // Add markdownPostProcessor

		console.log("Loaded plugin: CodeBlock Customizer");
	}
	
	onunload() {
		this.executeCodeMutationObserver.disconnect();
		removeStylesAndClasses();
		destroyReadingModeElements();
		for (const url of Object.values(this.languageIcons)) // Unload icons
			URL.revokeObjectURL(url);
		console.log("Unloaded plugin: CodeBlock Customizer");
	}

	async loadSettings() {
		this.settings = Object.assign({}, structuredClone(DEFAULT_SETTINGS), await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.app.workspace.updateOptions();
		updateStyling(this.settings,this.app);
	}
}
