import { REFERENCE_CODEBLOCK } from "./_temp/_Old/Settings";
import { removeStylesAndClasses, updateStyling } from "./_temp/_Old/ApplyStyling";
import { createCodeblockCodeMirrorExtensions, editingDocumentFold } from "./_temp/_Old/EditingView";
import { readingDocumentFold, readingViewCodeblockDecoratingPostProcessor, readingViewInlineDecoratingPostProcessor } from "./_temp/_Old/ReadingView";
import { cleanExternalReferencedFiles, referenceCodeblockProcessor, updateExternalReferencedFiles } from "./_temp/_Old/Referencing";
import { addModes, removeModes } from "./_temp/_Old/SyntaxHighlighting";

import { Plugin, MarkdownView, WorkspaceLeaf } from "obsidian";
import { CodeStylerSettings } from "./Internal/types/settings";
import { BODY_CLASS, LANGUAGES } from "./Internal/constants/decoration";
import { SettingsTab } from "./Interface/Settings/SettingsTab";
import { renderedInlineCodeDetecting } from "./Internal/Detecting/Rendered/Inline";
import { renderedFencedCodeDetecting } from "./Internal/Detecting/Rendered/Fenced";
import { toPostProcess } from "./Internal/utils/rendered";
import { mutationObservers, renderedFencedCodeDecorating, renderedFencedCodeUndecorating } from "./Internal/Decorating/Rendered/Fenced";
import { renderedInlineCodeDecorating, renderedInlineCodeUndecorating } from "./Internal/Decorating/Rendered/Inline";
import { DEFAULT_SETTINGS } from "./Internal/constants/settings";
import { convertSettings } from "./Internal/utils/settings";
import { EXTERNAL_REFERENCE_CACHE, EXTERNAL_REFERENCE_PATH } from "./Internal/constants/reference";

export default class CodeStylerPlugin extends Plugin {
	settings: CodeStylerSettings;
	mutationObservers: Record<string,MutationObserver>;
	languageIcons: Record<string,string>;
	sizes: {
		font: string;
		zoom: string;
	};

	async onload(): Promise<void> {
		await this.loadSettings();
		const settingsTab = new SettingsTab(this.app,this);
		this.addSettingTab(settingsTab);

		if (!(await this.app.vault.adapter.exists(this.app.vault.configDir + EXTERNAL_REFERENCE_PATH))) {
			await this.app.vault.adapter.mkdir(this.app.vault.configDir + EXTERNAL_REFERENCE_PATH);
			await this.app.vault.adapter.write(this.app.vault.configDir + EXTERNAL_REFERENCE_CACHE, JSON.stringify({}));
		}

		document.body.classList.add(BODY_CLASS); // Load Styles
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

		this.mutationObservers = mutationObservers;

		//* Rendering Modifiers
		this.registerMarkdownPostProcessor(async (element, context) => {
			if (!toPostProcess(element, context, this))
				return;

			await renderedInlineCodeDetecting(element, context, this);
			await renderedInlineCodeDecorating(element, context, this);
			await renderedFencedCodeDetecting(element, context, this);
			await renderedFencedCodeDecorating(element, context, this);
		})

		addModes();
		this.registerMarkdownCodeBlockProcessor(REFERENCE_CODEBLOCK, async (source, el, ctx) => {
			await referenceCodeblockProcessor(source, el, ctx, this);
		});

		this.registerMarkdownPostProcessor(async (el, ctx) => {
			await readingViewCodeblockDecoratingPostProcessor(el, ctx, this); // Add codeblock decorating markdownPostProcessor
		});
		this.registerMarkdownPostProcessor(async (el, ctx) => {
			await readingViewInlineDecoratingPostProcessor(el, ctx, this); // Add inline code decorating markdownPostProcessor
		});

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
		this.addCommand({id: "update-references-vault", name: "Update all external references in vault", callback: async ()=>{
			await updateExternalReferencedFiles(this);
		}});
		this.addCommand({id: "update-references-page", name: "Update all external references in note", callback: async ()=>{
			await updateExternalReferencedFiles(this, this.app.workspace.getActiveFile()?.path);
		}});
		this.addCommand({id: "clean-references", name: "Remove all unneeded external references", callback: async ()=>{
			await cleanExternalReferencedFiles(this);
		}});

		this.app.workspace.onLayoutReady(async () => this.initialiseOnLayout()); // Add decoration on enabling of plugin

		console.log("Loaded plugin: Code Styler");
	}

	onunload(): void {
		removeModes();
		Object.values(this.mutationObservers).forEach((mutationObserver: MutationObserver) => mutationObserver.disconnect());

		removeStylesAndClasses();
		renderedInlineCodeUndecorating()
		renderedFencedCodeUndecorating()

		for (const url of Object.values(this.languageIcons)) // Unload icons
			URL.revokeObjectURL(url);

		console.log("Unloaded plugin: Code Styler");
	}

	async loadSettings(): Promise<void> {
		this.settings = { ...structuredClone(DEFAULT_SETTINGS), ...convertSettings(await this.loadData()) };
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
		this.app.workspace.updateOptions();
		updateStyling(this.settings,this.app);
	}

	async initialiseOnLayout(): Promise<void> {
		if (this.settings.externalReferenceUpdateOnLoad)
			await updateExternalReferencedFiles(this);
		else {
			await cleanExternalReferencedFiles(this);
			this.renderReadingView();
		}
	}

	renderReadingView(): void {
		this.app.workspace.iterateRootLeaves((leaf: WorkspaceLeaf) => {
			if (leaf.view instanceof MarkdownView && leaf.view.getMode() === "preview")
				leaf.view.previewMode.rerender(true);
		});
	}
}
