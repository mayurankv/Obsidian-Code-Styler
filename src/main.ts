import { Plugin, MarkdownView, WorkspaceLeaf } from "obsidian";

import { DEFAULT_SETTINGS, LANGUAGE_ICONS_DATA, CodeblockCustomizerSettings } from './Settings';
import { SettingsTab } from "./SettingsTab";
import { removeStylesAndClasses, updateStyling } from "./ApplyStyling";
import { createCodeMirrorExtensions } from "./EditingView";
import { destroyReadingModeElements, executeCodeMutationObserver, readingStylingMutationObserver, readingViewPostProcessor, remeasureReadingView } from "./ReadingView";

export default class CodeblockCustomizerPlugin extends Plugin {
	settings: CodeblockCustomizerSettings;
	readingStylingMutationObserver: MutationObserver;
	executeCodeMutationObserver: MutationObserver;
	languageIcons: Record<string,string>;
	
	async onload() {
		await this.loadSettings(); // Load Settings
		const settingsTab = new SettingsTab(this.app,this);
		this.addSettingTab(settingsTab);

		document.body.classList.add('codeblock-customizer'); // Load Styles
		updateStyling(this.settings,this.app);

		this.languageIcons = Object.keys(LANGUAGE_ICONS_DATA).reduce((result: {[key: string]: string}, key: string) => { // Load Icons
			result[key] = URL.createObjectURL(new Blob([`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32">${LANGUAGE_ICONS_DATA[key]}</svg>`], { type: "image/svg+xml" }));
			return result
		},{})

		this.registerEditorExtension(createCodeMirrorExtensions(this.settings,this.languageIcons)); // Add codemirror extensions

		this.readingStylingMutationObserver = readingStylingMutationObserver; // Initialise reading view styling mutation observer
		this.executeCodeMutationObserver = executeCodeMutationObserver; // Add execute code mutation observer
		
		this.app.workspace.iterateRootLeaves((leaf: WorkspaceLeaf) => { // Add decoration on enabling of plugin
			if (leaf.view instanceof MarkdownView) {
				if (leaf.view.getMode() === 'preview')
					leaf.view.previewMode.rerender(true);
				// else if (leaf.view.getMode() === 'source')
				// 	console.log(leaf.view.sourceMode)
			}
		})
		this.app.workspace.iterateRootLeaves((leaf: WorkspaceLeaf) => { // Add decoration on enabling of plugin
			if (leaf.view instanceof MarkdownView && leaf.view.getMode() === 'preview') {
				// remeasureReadingView(leaf.view.contentEl,10,1000);
				// readingViewPostProcessor(leaf.view.contentEl,{sourcePath: leaf.view.file.path, getSectionInfo: (element: HTMLElement)=>null, frontmatter: undefined},this);
			}
		})
		this.registerMarkdownPostProcessor(async (element,context) => {await readingViewPostProcessor(element,context,this)}) // Add markdownPostProcessor

		this.registerEvent(this.app.workspace.on('css-change',()=>updateStyling(this.settings,this.app),this)); // Update styling on css changes

		console.log("Loaded plugin: CodeBlock Customizer");
	}
	
	onunload() {
		this.readingStylingMutationObserver.disconnect();
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
