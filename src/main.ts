import { Plugin } from "obsidian";
import { Extension } from "@codemirror/state";

import { DEFAULT_SETTINGS, CodeblockCustomizerSettings } from './Settings';
import { codeblockHighlight } from "./CodeBlockHighlight";
import { codeblockHeader, collapseField } from "./Header";
import { ReadingView } from "./ReadingView";
import { SettingsTab } from "./SettingsTab";
import { getCurrentMode, loadIcons, BLOBS, updateSettingStyles } from "./Utils";

// npm i @simonwep/pickr

export default class CodeBlockCustomizerPlugin extends Plugin {
  settings: CodeblockCustomizerSettings;
  extensions: Extension[];
  theme: string;
  
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

    updateSettingStyles(this.settings);
    
    this.registerEditorExtension(this.extensions);
    
    // theme on startup
    this.theme = getCurrentMode();

    const settingsTab = new SettingsTab(this.app, this);
    this.addSettingTab(settingsTab);
    
    if (this.settings.SelectedTheme == "")
      this.updateTheme(settingsTab);
    
    this.registerEvent(this.app.workspace.on('css-change', this.handleCssChange.bind(this, settingsTab), this));

    // reading mode
    this.registerMarkdownPostProcessor(async (el, ctx) => {    
      await ReadingView(el, ctx, this)
    })

    console.log("loading CodeBlock Customizer plugin");
  }// onload
  
  handleCssChange(settingsTab) {
    if (getCurrentMode() != this.theme){
      this.updateTheme(settingsTab);
    }
  }// handleCssChange
    
  updateTheme(settingsTab) {
    console.log(getCurrentMode())
    this.settings.colorThemes.forEach(theme => {
      console.log(theme.colors.header.bDefaultLightTheme)
      if (getCurrentMode() == "light" && theme.colors.header.bDefaultLightTheme) {
        this.theme = theme.name;
      }
      else if (getCurrentMode() == "dark" && theme.colors.header.bDefaultDarkTheme) {
        this.theme = theme.name;
      }
    });
    console.log(this.theme)
    this.settings.SelectedTheme = this.theme;
    settingsTab.applyTheme();
    this.saveSettings();
  }// updateTheme
  
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
    updateSettingStyles(this.settings);
		await this.saveData(this.settings);
    this.app.workspace.updateOptions();
	}
}
