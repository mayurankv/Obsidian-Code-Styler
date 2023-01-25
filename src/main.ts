import { Plugin } from "obsidian";
import { Extension } from "@codemirror/state";

import { DEFAULT_SETTINGS, MyPluginSettings } from './Settings';
import { codeblockActiveLingHighlight } from "./ActiveLineHighlight"
import { codeblockHighlight } from "./CodeBlockHighlight"
import { codeblockGutter } from "./Gutter"
import { codeblockHeader, collapseField } from "./Header"
import { ReadingView} from "./ReadingView"
import { SettingsTab} from "./SettingsTab"

// npm i @simonwep/pickr

export default class CodeBlockCustomizerPlugin extends Plugin {
  settings: MyPluginSettings;
  extensions: Extension[];
  
  async onload() {
    await this.loadSettings();
    
    this.extensions = [];

    // eslint main.ts
    
  /* Problems to solve:
    - if a language is excluded then:
      - the gutter is not removed,
      - header needs to unfold before removing it,
  */

    codeblockHeader.settings = this.settings
    this.extensions.push(codeblockHeader);
    
    collapseField.pluginSettings = this.settings
    this.extensions.push(collapseField);
    
    this.extensions.push(codeblockHighlight(this.settings));
    
    if (this.settings.bEnableLineNumbers)
      this.extensions.push(codeblockGutter(this.settings));
    
    if ((this.settings.bActiveCodeblockLineHighlight) || (this.settings.bActiveLineHighlight))
      this.extensions.push(codeblockActiveLingHighlight(this.settings));
    
    this.registerEditorExtension(this.extensions);
     
    this.addSettingTab(new SettingsTab(this.app, this));
    
    // reading mode
    this.registerMarkdownPostProcessor((el, ctx) => {    
      ReadingView(el, ctx, this)
    })

    console.log("loading CodeBlock Customizer plugin");
  }
  
  onunload() {
    console.log("unloading CodeBlock Customizer plugin");
	}
  
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {    
		await this.saveData(this.settings);    
    this.app.workspace.updateOptions();
	}
  
}
