import { Plugin, FileView } from "obsidian";

import { DEFAULT_SETTINGS, LANGUAGE_ICONS, CodeblockCustomizerSettings } from './Settings';
import { SettingsTab } from "./SettingsTab";
import { updateStyling } from "./ApplyStyling";
import { createCodeMirrorExtensions } from "./EditingView";
import { executeCodeMutationObserver, readingViewPostProcessor } from "./ReadingView";

export default class CodeblockCustomizerPlugin extends Plugin {
	settings: CodeblockCustomizerSettings;
	executeCodeMutationObserver: MutationObserver;
	
	async onload() {
		await this.loadSettings();
		document.body.classList.add('codeblock-customizer');
		updateStyling(this.settings);
		
		const settingsTab = new SettingsTab(this.app,this);
		this.addSettingTab(settingsTab);

		this.registerEditorExtension(createCodeMirrorExtensions(this.settings)); // Add codemirror extensions

		this.executeCodeMutationObserver = executeCodeMutationObserver; // Add execute code mutation observer
		this.app.workspace.iterateRootLeaves(leaf => { // Add decoration on enabling of plugin
			if (leaf.view instanceof FileView)
				readingViewPostProcessor(leaf.view.contentEl,{sourcePath: leaf.view.file.path, getSectionInfo: (element: HTMLElement)=>null},this);
		})
		this.registerMarkdownPostProcessor(async (element,context) => {await readingViewPostProcessor(element,context,this)}) // Add markdownPostProcessor

		console.log("Loaded plugin: CodeBlock Customizer");
	}
	
	onunload() {
		for (const url of Object.values(LANGUAGE_ICONS))
			URL.revokeObjectURL(url) // Unload icons
		this.executeCodeMutationObserver.disconnect();
		console.log("Unloaded plugin: CodeBlock Customizer");
	}
	
	async loadSettings() {
		this.settings = Object.assign({}, structuredClone(DEFAULT_SETTINGS), await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.app.workspace.updateOptions();
		updateStyling(this.settings);
	}
}
