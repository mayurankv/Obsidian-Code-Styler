import { Plugin } from "obsidian";
import { Extension } from "@codemirror/state";

import { DEFAULT_SETTINGS, CodeblockCustomizerSettings } from './Settings';
import { codeblockHighlight } from "./CodeBlockHighlight";
import { codeblockGutter } from "./Gutter";
import { codeblockHeader, collapseField } from "./Header";
import { ReadingView } from "./ReadingView";
import { SettingsTab } from "./SettingsTab";
import { loadIcons, BLOBS, updateActiveLineStyles } from "./Utils";

// npm i @simonwep/pickr

export default class CodeBlockCustomizerPlugin extends Plugin {
  settings: CodeblockCustomizerSettings;
  extensions: Extension[];
  theme: string;
  
  async onload() {
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
    
    if (this.settings.bEnableLineNumbers)
      this.extensions.push(codeblockGutter(this.settings));

    if ((this.settings.bActiveCodeblockLineHighlight) || (this.settings.bActiveLineHighlight))
      updateActiveLineStyles(this.settings);
    
    this.registerEditorExtension(this.extensions);
    
    // theme on startup
    this.theme = this.getCurrentTheme();

    const settingsTab = new SettingsTab(this.app, this);
    this.addSettingTab(settingsTab);
    
    if (this.settings.SelectedTheme == "")
      this.updateTheme(settingsTab);
    
    this.registerEvent(this.app.workspace.on('css-change', this.handleCssChange.bind(this, settingsTab), this));

    // reading mode
    this.registerMarkdownPostProcessor((el, ctx) => {    
      ReadingView(el, ctx, this)
    })

    console.log("loading CodeBlock Customizer plugin");
  }// onload
  
  handleCssChange(settingsTab) {
    if (this.getCurrentTheme() != this.theme){
      this.updateTheme(settingsTab);
    }
  }// handleCssChange
    
  getCurrentTheme() {
    const body = document.querySelector('body');
    if (body.classList.contains('theme-light')) {
      return "light";
    } else if (body.classList.contains('theme-dark')) {
      return "dark";
    }
  }// getCurrentTheme
  
  updateTheme(settingsTab) {
    this.settings.colorThemes.forEach(theme => {
      if (this.getCurrentTheme() == "light" && theme.colors.header.bDefaultLightTheme) {
        this.theme = theme.name;
        settingsTab.applyCurrentAlternateHLColor(true);
      }
      else if (this.getCurrentTheme() == "dark" && theme.colors.header.bDefaultDarkTheme) {
        this.theme = theme.name;
        settingsTab.applyCurrentAlternateHLColor(false);
      }
    });
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
		await this.saveData(this.settings);
    this.app.workspace.updateOptions();
	}
}
