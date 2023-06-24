import { Plugin } from "obsidian";

import { DEFAULT_SETTINGS, LANGUAGE_ICONS, CodeblockCustomizerSettings } from './Settings';
import { SettingsTab } from "./SettingsTab";
import { updateStyling } from "./ApplyStyling";
import { codeblockLines } from "./EditingView";
import { readingViewPostProcessor } from "./ReadingView";

export default class CodeblockCustomizerPlugin extends Plugin {
	settings: CodeblockCustomizerSettings;
	
	async onload() {
		await this.loadSettings();
		document.body.classList.add('codeblock-customizer');
		updateStyling(this.settings);
		
		const settingsTab = new SettingsTab(this.app, this);
		this.addSettingTab(settingsTab);

		// codeblockHeader.settings = this.settings;
		// collapseField.pluginSettings = this.settings;
		this.registerEditorExtension([
			codeblockLines(this.settings)
		// 	codeblockHeader,
		// 	collapseField,
		]);
		
		
		this.registerMarkdownPostProcessor(async (el, ctx) => {    
			await readingViewPostProcessor(el, ctx, this)
		})

		console.log("Loaded plugin: CodeBlock Customizer");
	}
	
	onunload() {
		for (const url of Object.values(LANGUAGE_ICONS))
			URL.revokeObjectURL(url) // Unload icons
		console.log("Unloaded plugin: CodeBlock Customizer");
	}
	
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		updateStyling(this.settings);
		this.app.workspace.updateOptions();
	}
}
