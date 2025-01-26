import { Plugin} from "obsidian";
import { CodeStylerSettings } from "./Internal/types/settings";
import { SettingsTab } from "./Interface/Settings/settingsTab";
import { renderedInlineCodeDetecting } from "./Internal/Detecting/Rendered/inline";
import { renderedFencedCodeDetecting } from "./Internal/Detecting/Rendered/fenced";
import { toPostProcess } from "./Internal/utils/rendered";
import { mutationObservers, renderedFencedCodeDecorating, renderedFencedCodeUndecorating } from "./Internal/Decorating/Rendered/fenced";
import { renderedInlineCodeDecorating, renderedInlineCodeUndecorating } from "./Internal/Decorating/Rendered/inline";
import { DEFAULT_SETTINGS } from "./Internal/constants/settings";
import { convertSettings } from "./Internal/utils/settings";
import { EXTERNAL_REFERENCE_CACHE, EXTERNAL_REFERENCE_PATH, REFERENCE_CODEBLOCK } from "./Internal/constants/reference";
import { registerCommands } from "./Interface/Actions/commands";
import { loadLanguageIcons, unloadLanguageIcons } from "./Resources/icons";
import { registerRerenderingOnWorkspaceChange, rerenderRenderedView } from "./Interface/View/rendered";
import { addModes } from "./Internal/Decorating/LivePreview/codemirror/modes";
import { applyStyling, removeStyling } from "./Internal/Decorating/styles";
import { manageExternalReferencedFiles } from "./Internal/utils/reference";
import { getReferenceCodeMirrorExtensions as getReferenceCodemirrorExtensions } from "./Internal/Decorating/LivePreview/reference";
import { getFenceCodemirrorExtensions } from "./Internal/Decorating/LivePreview/fenced";
import { getInlineCodeMirrorExtensions as getInlineCodemirrorExtensions } from "./Internal/Decorating/LivePreview/inline";
import { referenceCodeblockProcessor } from "./Internal/Decorating/Rendered/reference";

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
		applyStyling(this);
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
			this.resources = {
				languageIcons: loadLanguageIcons(),
			}
		else
			unloadLanguageIcons(this.resources.languageIcons)
	}

	addStyling(
		load: boolean = true,
	): void {
		if (load)
			applyStyling(this);
		else
			removeStyling()
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
				async (source, element, context) => await referenceCodeblockProcessor(
					source,
					element,
					context,
					this,
				),
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
			this.registerEditorExtension([
				...getFenceCodemirrorExtensions(this),
				...getInlineCodemirrorExtensions(this),
				...getReferenceCodemirrorExtensions(this),
			]);
	}

	registerEvents(
		load: boolean = true,
	): void {
		if (load) {
			this.watchedValues = {}
			this.registerEvent(
				this.app.workspace.on(
					"css-change",
					() => applyStyling(this),
					this,
				),
			);
			registerRerenderingOnWorkspaceChange(
				"font",
				() => document.body.getCssPropertyValue("--font-text-size"),
				"css-change",
				this,
			)
			registerRerenderingOnWorkspaceChange(
				"zoom",
				() => document.body.getCssPropertyValue("--zoom-factor"),
				"resize",
				this,
			)
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
				async () => await manageExternalReferencedFiles(this, null, this.settings.externalReferenceUpdateOnLoad),
			);
	}

	notifyReady(
		load: boolean = true,
	): void {
		console.log((load ? "Loaded" : "Unloaded")+" plugin: Code Styler")
	}
}
