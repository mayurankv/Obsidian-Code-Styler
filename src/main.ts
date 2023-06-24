import { Plugin } from "obsidian";

import { DEFAULT_SETTINGS, CodeblockCustomizerSettings } from './Settings';
import { LANGUAGE_ICONS } from './LanguageDetails';
import { codeblockHighlight } from "./CodeBlockHighlight";
import { codeblockHeader, collapseField } from "./Header";
import { readingViewPostProcessor } from "./ReadingView";
import { SettingsTab } from "./SettingsTab";
import {  } from "./Utils";

export default class CodeblockCustomizerPlugin extends Plugin {
	settings: CodeblockCustomizerSettings;
	
	async onload() {
		await this.loadSettings();
		document.body.classList.add('codeblock-customizer');
		
		const settingsTab = new SettingsTab(this.app, this);
		this.addSettingTab(settingsTab);

		codeblockHeader.settings = this.settings;
		collapseField.pluginSettings = this.settings;
		this.registerEditorExtension([
			codeblockHeader,
			collapseField,
			codeblockHighlight(this.settings)
		]);
		
		
		this.registerMarkdownPostProcessor(async (el, ctx) => {    
			await readingViewPostProcessor(el, ctx, this)
		})

		//updateSettingStyles(this.settings);
		// this.registerEvent(this.app.workspace.on('css-change', this.handleCssChange.bind(this, settingsTab), this));

		console.log("loading CodeBlock Customizer plugin");
	}
	
	// handleCssChange(settingsTab) {
	// 	console.log('updating css');
	// }
	
	onunload() {
		console.log("unloading CodeBlock Customizer plugin");
		for (const url of Object.values(LANGUAGE_ICONS))
			URL.revokeObjectURL(url) // Unload icons
	}
	
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.app.workspace.updateOptions();
		// updateSettingStyles(this.settings);
	}
}
