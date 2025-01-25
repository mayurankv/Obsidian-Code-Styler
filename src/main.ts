import { Plugin} from "obsidian";
import { CodeStylerSettings } from "./Internal/types/settings";
import { BODY_CLASS } from "./Internal/constants/decoration";
import { SettingsTab } from "./Interface/Settings/SettingsTab";
import { renderedInlineCodeDetecting } from "./Internal/Detecting/Rendered/Inline";
import { renderedFencedCodeDetecting } from "./Internal/Detecting/Rendered/Fenced";
import { toPostProcess } from "./Internal/utils/rendered";
import { mutationObservers, renderedFencedCodeDecorating, renderedFencedCodeUndecorating } from "./Internal/Decorating/Rendered/Fenced";
import { renderedInlineCodeDecorating, renderedInlineCodeUndecorating } from "./Internal/Decorating/Rendered/Inline";
import { DEFAULT_SETTINGS } from "./Internal/constants/settings";
import { convertSettings } from "./Internal/utils/settings";
import { EXTERNAL_REFERENCE_CACHE, EXTERNAL_REFERENCE_PATH, REFERENCE_CODEBLOCK } from "./Internal/constants/reference";
import { registerCommands } from "./Interface/Actions/commands";
import { loadLanguageIcons, unloadLanguageIcons } from "./Resources/icons";
import { registerRerenderingOnWorkspaceChange } from "./Interface/View/rendered";
import { addModes } from "./Internal/Decorating/LivePreview/SyntaxHighlight";

export default class CodeStylerPlugin extends Plugin {
	settings: CodeStylerSettings;
	mutationObservers: Record<string,MutationObserver>;
	resources: {
		languageIcons: Record<string, string>,
	};
	watchedValues: Record<string, string>;

	async onload(): Promise<void> {
		await this.loadSettings();
		await this.initialiseFileSystem();

		this.loadResources(true);
		this.addStyling(true)
		this.addObservers(true)
		this.addModes(true)
		this.addCodeblockProcessors(true)
		this.addMarkdownPostProcessors(true)
		this.addEditorExtensions(true)
		this.registerEvents(true)
		this.addCommands(true)
		this.registerReadyActions(true)
		this.notifyReady(true)
	}

	onunload(): void {
		this.loadResources(false)
		this.addStyling(false)
		this.addObservers(false)
		this.addModes(false)
		this.addCodeblockProcessors(false)
		this.addMarkdownPostProcessors(false)
		this.addEditorExtensions(false)
		this.registerEvents(false)
		this.addCommands(false)
		this.registerReadyActions(false)
		this.notifyReady(false)
	}

	async loadSettings(): Promise<void> {
		this.settings = { ...structuredClone(DEFAULT_SETTINGS), ...convertSettings(await this.loadData()) };
		this.addSettingTab(new SettingsTab(this.app, this));
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
		this.app.workspace.updateOptions();

		updateStyling(this.settings,this.app);
	}

	async initialiseFileSystem(): Promise<void> {
		if (await this.app.vault.adapter.exists(this.app.vault.configDir + EXTERNAL_REFERENCE_PATH))
			return;

		await this.app.vault.adapter.mkdir(this.app.vault.configDir + EXTERNAL_REFERENCE_PATH);
		await this.app.vault.adapter.write(this.app.vault.configDir + EXTERNAL_REFERENCE_CACHE, JSON.stringify({}));
	}

	loadResources(
		load: boolean = true,
	): void {
		if (load)
			this.languageIcons = loadLanguageIcons()
		else
			unloadLanguageIcons(this.languageIcons)
	}

	addStyling(
		load: boolean = true,
	): void {
		if (load) {
			//!==================================
			document.body.classList.add(BODY_CLASS);
			//!==================================

			updateStyling(this.settings, this.app);

		} else {
			removeStylesAndClasses();
		}
	}

	addObservers(
		load: boolean = true,
	): void {
		if (load)
			this.mutationObservers = mutationObservers;
		else
			Object.values(this.mutationObservers).forEach(
				(mutationObserver: MutationObserver) => mutationObserver.disconnect()
			);
	}

	addModes(
		load: boolean = true,
	): void {
		addModes(load)
	}

	addCodeblockProcessors(
		load: boolean = true,
	): void {
		if (load)
			this.registerMarkdownCodeBlockProcessor(
				REFERENCE_CODEBLOCK,
				async (source, el, ctx) => await referenceCodeblockProcessor(source, el, ctx, this),
			);
	}

	addMarkdownPostProcessors(
		load: boolean = true,
	): void {
		if (load)
			this.registerMarkdownPostProcessor(async (element, context) => {
				if (!toPostProcess(element, context, this))
					return;

				await renderedInlineCodeDetecting(element, context, this);
				await renderedInlineCodeDecorating(element, context, this);
				await renderedFencedCodeDetecting(element, context, this);
				await renderedFencedCodeDecorating(element, context, this);
			})
		else {
			renderedInlineCodeUndecorating();
			renderedFencedCodeUndecorating();
		}
	}

	addEditorExtensions(
		load: boolean = true,
	): void {
		if (load)
			this.registerEditorExtension(createCodeblockCodeMirrorExtensions(this.settings,this));
	}

	registerEvents(
		load: boolean = true,
	): void {
		if (load) {
			this.registerEvent(
				this.app.workspace.on(
					"css-change",
					() => updateStyling(this.settings, this.app),
					this,
				),
			);
			registerRerenderingOnWorkspaceChange("font", () => document.body.getCssPropertyValue("--font-text-size"), "css-change", this)
			registerRerenderingOnWorkspaceChange("zoom", () => document.body.getCssPropertyValue("--zoom-factor"), "resize", this)
		}
	}

	addCommands(
		load: boolean = true,
	): void {
		if (load)
			registerCommands(this)
	}

	registerReadyActions(
		load: boolean = true,
	): void {
		if (load)
			this.app.workspace.onLayoutReady(
				async () => {
					if (this.settings.externalReferenceUpdateOnLoad)
						await updateExternalReferencedFiles(this);
					else {
						await cleanExternalReferencedFiles(this);
						this.renderReadingView();
					}
				},
			);
	}

	notifyReady(
		load: boolean = true,
	): void {
		console.log((load ? "Loaded" : "Unloaded")+" plugin: Code Styler")
	}
}
