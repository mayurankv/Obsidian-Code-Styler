import { Plugin, MarkdownView, WorkspaceLeaf } from "obsidian";

import { convertSettings, DEFAULT_SETTINGS, LANGUAGES, CodeStylerSettings, REFERENCE_CODEBLOCK } from "./Settings";
import { SettingsTab } from "./SettingsTab";
import { removeStylesAndClasses, updateStyling } from "./ApplyStyling";
import { createCodeblockCodeMirrorExtensions, editingDocumentFold } from "./EditingView";
import { destroyReadingModeElements, readingDocumentFold, executeCodeMutationObserver, readingViewCodeblockDecoratingPostProcessor, readingViewInlineDecoratingPostProcessor } from "./ReadingView";
import { referenceCodeblockProcessor } from "./Referencing";

export default class CodeStylerPlugin extends Plugin {
	settings: CodeStylerSettings;
	executeCodeMutationObserver: MutationObserver;
	languageIcons: Record<string,string>;
	sizes: {
		font: string;
		zoom: string;
	};

	async onload() {
		await this.loadSettings(); // Load Settings
		const settingsTab = new SettingsTab(this.app,this);
		this.addSettingTab(settingsTab);

		document.body.classList.add("code-styler"); // Load Styles
		updateStyling(this.settings,this.app);

		this.languageIcons = Object.keys(LANGUAGES).reduce((result: {[key: string]: string}, key: string) => { // Load Icons
			if (LANGUAGES[key]?.icon)
				result[key] = URL.createObjectURL(new Blob([`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32">${LANGUAGES[key].icon}</svg>`], { type: "image/svg+xml" }));
			return result;
		},{});
		this.sizes = {
			font: document.body.getCssPropertyValue("--font-text-size"),
			zoom: document.body.getCssPropertyValue("--zoom-factor"),
		};

		this.executeCodeMutationObserver = executeCodeMutationObserver; // Add execute code mutation observer

		this.registerMarkdownCodeBlockProcessor(REFERENCE_CODEBLOCK, async (source, el, ctx) => { await referenceCodeblockProcessor(source, el, ctx, this);});

		this.registerMarkdownPostProcessor(async (el,ctx) => {await readingViewCodeblockDecoratingPostProcessor(el,ctx,this);}); // Add codeblock decorating markdownPostProcessor
		this.registerMarkdownPostProcessor(async (el,ctx) => {await readingViewInlineDecoratingPostProcessor(el,ctx,this);}); // Add inline code decorating markdownPostProcessor

		this.registerEditorExtension(createCodeblockCodeMirrorExtensions(this.settings,this)); // Add codemirror extensions

		let zoomTimeout: NodeJS.Timeout = setTimeout(()=>{});
		this.registerEvent(this.app.workspace.on("css-change",()=>{
			updateStyling(this.settings,this.app); // Update styling on css changes
			const currentFontSize = document.body.getCssPropertyValue("--font-text-size");
			if (this.sizes.font !== currentFontSize) {
				this.sizes.font = currentFontSize;
				clearTimeout(zoomTimeout);
				zoomTimeout = setTimeout(()=>{
					this.renderReadingView(); // Re-render on font size changes
				},1000);
			}
		},this));
		this.registerEvent(this.app.workspace.on("resize",()=>{
			const currentZoomSize = document.body.getCssPropertyValue("--zoom-factor");
			if (this.sizes.zoom !== currentZoomSize) {
				this.sizes.zoom = currentZoomSize;
				clearTimeout(zoomTimeout);
				zoomTimeout = setTimeout(()=>{
					this.renderReadingView(); // Re-render on zoom changes
				},1000);
			}
		},this));

		this.addCommand({id: "fold-all", name: "Fold all codeblocks", callback: ()=>{
			const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (activeView) {
				if (activeView.getMode() === "preview")
					readingDocumentFold(activeView.contentEl,true);
				else if (activeView.getMode() === "source")
					//@ts-expect-error Undocumented Obsidian API
					editingDocumentFold(activeView.editor.cm.docView.view,true);
			}
		}});
		this.addCommand({id: "unfold-all", name: "Unfold all codeblocks", callback: ()=>{
			const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (activeView) {
				if (activeView.getMode() === "preview")
					readingDocumentFold(activeView.contentEl,false);
				else if (activeView.getMode() === "source")
					//@ts-expect-error Undocumented Obsidian API
					editingDocumentFold(activeView.editor.cm.docView.view,false);
			}
		}});
		this.addCommand({id: "reset-all", name: "Reset fold state for all codeblocks", callback: ()=>{
			const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (activeView) {
				if (activeView.getMode() === "preview")
					readingDocumentFold(activeView.contentEl);
				else if (activeView.getMode() === "source")
					//@ts-expect-error Undocumented Obsidian API
					editingDocumentFold(activeView.editor.cm.docView.view);
			}
		}});

		this.app.workspace.onLayoutReady(()=>{this.renderReadingView();}); // Add decoration on enabling of plugin

		console.log("Loaded plugin: Code Styler");
	}

	onunload() {
		this.executeCodeMutationObserver.disconnect();
		removeStylesAndClasses();
		destroyReadingModeElements();
		for (const url of Object.values(this.languageIcons)) // Unload icons
			URL.revokeObjectURL(url);
		console.log("Unloaded plugin: Code Styler");
	}

	async loadSettings() {
		this.settings = {...structuredClone(DEFAULT_SETTINGS), ...convertSettings(await this.loadData())};
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.app.workspace.updateOptions();
		updateStyling(this.settings,this.app);
	}

	renderReadingView() {
		this.app.workspace.iterateRootLeaves((leaf: WorkspaceLeaf) => {
			if (leaf.view instanceof MarkdownView && leaf.view.getMode() === "preview")
				leaf.view.previewMode.rerender(true);
		});
	}
}
