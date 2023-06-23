import { Plugin } from "obsidian";

import { DEFAULT_SETTINGS, CodeblockCustomizerSettings } from './Settings';
import { codeblockHighlight } from "./CodeBlockHighlight";
import { codeblockHeader, collapseField } from "./Header";
import { ReadingView } from "./ReadingViewOld";
import { SettingsTab } from "./SettingsTab";
import { loadIcons, BLOBS, updateSettingStyles } from "./Utils";

export default class CodeblockCustomizerPlugin extends Plugin {
	settings: CodeblockCustomizerSettings;
	
	async onload() {
		await this.loadSettings();
		document.body.classList.add('codeblock-customizer');

		loadIcons();

		codeblockHeader.settings = this.settings;
		collapseField.pluginSettings = this.settings;
		
		this.registerEditorExtension([
			codeblockHeader,
			collapseField,
			codeblockHighlight(this.settings)
		]);
		
		const settingsTab = new SettingsTab(this.app, this);
		this.addSettingTab(settingsTab);
		
		//updateSettingStyles(this.settings);
		
		this.registerEvent(this.app.workspace.on('css-change', this.handleCssChange.bind(this, settingsTab), this));

		// reading mode
		this.registerMarkdownPostProcessor(async (el, ctx) => {    
			await ReadingView(el, ctx, this)
		})

		console.log("loading CodeBlock Customizer plugin");
	}// onload
	
	handleCssChange(settingsTab) {
		console.log('updating css');
	}// handleCssChange
	
	onunload() {
		console.log("unloading CodeBlock Customizer plugin");
		// unload icons
		for (const url of Object.values(BLOBS)) {
			URL.revokeObjectURL(url)
		}
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
