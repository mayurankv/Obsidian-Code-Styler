import { Plugin } from "obsidian";
import { Extension } from "@codemirror/state";

import { DEFAULT_SETTINGS, CodeblockCustomizerSettings } from './Settings';
import { codeblockHighlight } from "./CodeBlockHighlight";
import { codeblockHeader, collapseField } from "./Header";
import { ReadingView } from "./ReadingView";
import { SettingsTab } from "./SettingsTab";
import { getCurrentMode, loadIcons, BLOBS, updateSettingStyles } from "./Utils";

// npm i @simonwep/pickr

export default class CodeblockCustomizerPlugin extends Plugin {
  settings: CodeblockCustomizerSettings;
  extensions: Extension[];
  
  async onload() {
    document.body.classList.add('codeblock-customizer');
    await this.loadSettings();
    this.extensions = [];

    // eslint main.ts
    
  /* Problems to solve:
    - if a language is excluded then:
      - header needs to unfold before removing it,
  */

    loadIcons();

    codeblockHeader.settings = this.settings;
    this.extensions.push(codeblockHeader);
    
    collapseField.pluginSettings = this.settings;
    this.extensions.push(collapseField);

    this.extensions.push(codeblockHighlight(this.settings));

    this.registerEditorExtension(this.extensions);
    
    const settingsTab = new SettingsTab(this.app, this);
    this.addSettingTab(settingsTab);
    
    updateSettingStyles(this.settings);
    
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
