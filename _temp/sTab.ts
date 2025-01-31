// //TODO: Update

// import { App, PluginSettingTab, Setting, Notice, TextComponent, DropdownComponent, SliderComponent, ToggleComponent, ExtraButtonComponent, MarkdownRenderer } from "obsidian";
// import Pickr from "@simonwep/pickr";
// import { ColorTranslator } from "colortranslator";

// import { getColour } from "src/Internal/Decorating/css";
// import CodeStylerPlugin from "src/main";
// import { Colour } from "src/Internal/types/decoration";
// import { Display } from "src/Internal/types/settings";

// const SETTINGS_PAGES: Record<string,string> = {
// 	"main": "Core Settings",
// 	"codeblock": "Codeblock Styling",
// 	"inline": "Inline Code Styling",
// };
// const CODEBLOCK_PAGES: Record<string,string> = {
// 	"body": "Codeblock Body",
// 	"gutter": "Codeblock Gutter",
// 	"header": "Codeblock Header",
// 	"highlight": "Codeblock Highlighting",
// 	"languages": "Codeblock Languages",
// 	// "plugins": "Plugin Compatibility",
// 	"example": "Example Codeblock Content",
// };
// const DISPLAY_OPTIONS: Record<Display,string> = {
// 	"none": "Never",
// 	"if_header_shown": "If Header Shown",
// 	"always": "Always",
// };

// export class SettingsTab extends PluginSettingTab {
// 	plugin: CodeStylerPlugin;
// 	pickrs: Record<string,PickrResettable>;
// 	page: string;
// 	codeblockPage: string;
// 	hideAdvanced: boolean;
// 	codeblockSettingEl: HTMLElement;
// 	advancedSettingsContainer: HTMLElement;
// 	alternativeHighlightsContainer: HTMLElement;
// 	exampleCodeblockContainer: HTMLElement;
// 	exampleInlineCodeContainer: HTMLElement;
// 	wrapLinesContainer: HTMLElement;
// 	lineNumbersContainer: HTMLElement;
// 	headerTagsContainer: HTMLElement;
// 	headerIconsContainer: HTMLElement;
// 	headerExternalReferenceContainer: HTMLElement;
// 	inlineCodeStylesContainer: HTMLElement;
// 	disableableComponents: Record<string,Array<ToggleComponent | SliderComponent | TextComponent | ExtraButtonComponent>>;

// 	constructor(app: App, plugin: CodeStylerPlugin) {
// 		super(app, plugin);
// 		this.plugin = plugin;
// 		this.pickrs = {};
// 		this.page = "main";
// 		this.codeblockPage = "body";
// 		this.hideAdvanced = true;
// 		this.disableableComponents = {};
// 	}

// 	/**
// 	 *  Builds the html page that is showed in the settings.
// 	 */
// 	display() {
// 		this.disableableComponents = {
// 			"editorActiveLineHighlight": [],
// 			"codeblockActiveLineHighlight": [],
// 			"gradientHighlighting": [],
// 			"languageBorderColour": [],
// 		};
// 		this.hideAdvanced = true;
// 		this.generateSettings(this.containerEl);
// 	}

// 	// Create Settings Pages
// 	displayMainSettings(containerEl: HTMLElement) {
// 		this.emptySettings(containerEl);
// 		this.generateThemeSettings(containerEl);
// 		this.generateSettingsSwitcher(containerEl);
// 		this.generateCoreSettings(containerEl);
// 		this.generateAdvancedHeading(containerEl);
// 		this.advancedSettingsContainer = containerEl.createDiv();
// 		this.generateAdvancedSettings();
// 		this.generateDonationFooter(containerEl);
// 	}
// 	displayCodeblockSettings(containerEl: HTMLElement) {
// 		this.emptySettings(containerEl);
// 		this.generateThemeSettings(containerEl);
// 		this.generateSettingsSwitcher(containerEl);
// 		containerEl.createEl("hr");
// 		this.exampleCodeblockContainer = containerEl.createDiv();
// 		this.generateExampleCodeblock();
// 		this.generateCodeblockStylingSwitcher(containerEl);
// 		this.codeblockSettingEl = containerEl.createDiv();
// 		this.generateCodeblockSetting();

// 	}
// 	displayInlineCodeSettings(containerEl: HTMLElement) {
// 		this.emptySettings(containerEl);
// 		this.generateThemeSettings(containerEl);
// 		this.generateSettingsSwitcher(containerEl);
// 		containerEl.createEl("hr");
// 		this.exampleInlineCodeContainer = containerEl.createDiv();
// 		this.generateExampleInlineCode();
// 		this.generateExampleInlineCodeSettings(containerEl);
// 		this.generateInlineCodeSettings(containerEl);
// 	}

// 	// Create Settings Groups
// 	emptySettings(containerEl: HTMLElement) {
// 		containerEl.empty();
// 		containerEl.createEl("h1", {text: "Settings for the Code Styler Plugin."});
// 	}
// 	generateSettings(containerEl: HTMLElement) {
// 		if (this.page === "main")
// 			this.displayMainSettings(containerEl);
// 		else if (this.page === "codeblock")
// 			this.displayCodeblockSettings(containerEl);
// 		else if (this.page === "inline")
// 			this.displayInlineCodeSettings(containerEl);
// 	}
// 	generateSettingsSwitcher(containerEl: HTMLElement) {
// 		new Setting(containerEl)
// 			.setName("Choose Settings Page")
// 			.setDesc("Change dropdown to modify different groups of settings")
// 			.addDropdown((dropdown) => dropdown
// 				.addOptions(SETTINGS_PAGES)
// 				.setValue(this.page)
// 				.onChange((value: string) => {
// 					this.page = value;
// 					this.generateSettings(containerEl);
// 				}));
// 	}
// 	generateCodeblockStylingSwitcher(containerEl: HTMLElement) {
// 		new Setting(containerEl)
// 			.setName("Choose Codeblock Settings")
// 			.setDesc("Change dropdown to modify styles and settings of different codeblock sections")
// 			.addDropdown((dropdown) => dropdown
// 				.addOptions(CODEBLOCK_PAGES)
// 				.setValue(this.codeblockPage)
// 				.onChange((value: string) => {
// 					this.codeblockPage = value;
// 					this.generateCodeblockSetting();
// 				}));
// 	}
// 	generateCodeblockSetting() {
// 		this.codeblockSettingEl.empty();
// 		if (this.codeblockPage === "body")
// 			this.generateCodeblockBodySettings(this.codeblockSettingEl);
// 		else if (this.codeblockPage === "gutter")
// 			this.generateCodeblockGutterSettings(this.codeblockSettingEl);
// 		else if (this.codeblockPage === "header")
// 			this.generateCodeblockHeaderSettings(this.codeblockSettingEl);
// 		else if (this.codeblockPage === "highlight")
// 			this.generateCodeblockHighlightSettings(this.codeblockSettingEl);
// 		else if (this.codeblockPage === "languages")
// 			this.generateCodeblockLanguageSettings(this.codeblockSettingEl);
// 		else if (this.codeblockPage === "plugins")
// 			this.generatePluginCompatibilitySettings(this.codeblockSettingEl);
// 		else if (this.codeblockPage === "example")
// 			this.generateExampleCodeblockSettings(this.codeblockSettingEl);
// 	}
// 	generateCoreSettings(containerEl: HTMLElement) {
// 		new Setting(containerEl)
// 			.setName("Style Code on Export")
// 			.setDesc("If enabled, styling will be applied when exporting to PDF.")
// 			.addToggle(toggle => toggle
// 				.setValue(this.plugin.settings.decoratePrint)
// 				.onChange((value) => {
// 					this.plugin.settings.decoratePrint = value;
// 					this.saveSettings();
// 				}));
// 	}
// 	generateThemeSettings(containerEl: HTMLElement) {
// 		containerEl.createEl("h2", {text: "Theme Settings"});
// 		let themeDropdown: DropdownComponent;
// 		new Setting(containerEl)
// 			.setName("Select Theme")
// 			.addDropdown((dropdown) => {
// 				themeDropdown = dropdown;
// 				this.updateDropdown(themeDropdown,this.plugin.settings);
// 				themeDropdown.onChange((value) => {
// 					this.plugin.settings.selectedTheme = value;
// 					this.plugin.settings.currentTheme = structuredClone(this.plugin.settings.themes[this.plugin.settings.selectedTheme]);
// 					this.saveSettings();
// 					this.display();
// 				});
// 			})
// 			.addExtraButton(button => {
// 				button.setTooltip("Update theme");
// 				button.setIcon("save");
// 				button.onClick(() => {
// 					this.plugin.settings.themes[this.plugin.settings.selectedTheme] = structuredClone(this.plugin.settings.currentTheme);
// 					this.updateAlternativeHighlights();
// 					new Notice(`${this.plugin.settings.selectedTheme} theme saved successfully!`); //NOSONAR
// 					this.saveSettings();
// 				});
// 			})
// 			.addExtraButton(button => {
// 				button.setTooltip("Delete theme");
// 				button.setIcon("trash");
// 				button.onClick(() => {
// 					if (this.plugin.settings.selectedTheme.trim().length === 0)
// 						new Notice("Select a theme first to delete"); //NOSONAR
// 					else if (this.plugin.settings.selectedTheme in DEFAULT_SETTINGS.themes)
// 						new Notice("You cannot delete the default themes"); //NOSONAR
// 					else {
// 						delete this.plugin.settings.themes[this.plugin.settings.selectedTheme];
// 						new Notice(`${this.plugin.settings.selectedTheme} theme deleted successfully!`); //NOSONAR
// 						this.plugin.settings.selectedTheme = "Default";
// 						this.plugin.settings.currentTheme = structuredClone(this.plugin.settings.themes[this.plugin.settings.selectedTheme]);
// 						this.updateDropdown(themeDropdown,this.plugin.settings);
// 						this.saveSettings();
// 						this.display();
// 					}
// 				});
// 			});
// 		let newThemeName: TextComponent;
// 		let newThemeDefault: ToggleComponent;
// 		this.plugin.settings.newTheme = "";
// 		new Setting(containerEl)
// 			.setName("Add New Theme")
// 			.setDesc("Create a new theme from the current settings.")
// 			.addText(text => {newThemeName = text
// 				.setPlaceholder("New theme name")
// 				.setValue(this.plugin.settings.newTheme)
// 				.onChange((value) => {
// 					this.plugin.settings.newTheme = value;
// 				});
// 			})
// 			.addExtraButton(button => {
// 				button.setTooltip("Save theme");
// 				button.setIcon("plus");
// 				button.onClick(() => {
// 					if (this.plugin.settings.newTheme.trim().length === 0)
// 						new Notice("Set a name for your theme"); //NOSONAR
// 					else if (this.plugin.settings.newTheme in DEFAULT_SETTINGS.themes)
// 						new Notice("You can't overwrite the default themes"); //NOSONAR
// 					else {
// 						if (this.plugin.settings.newTheme in this.plugin.settings.themes) {
// 							this.plugin.settings.themes[this.plugin.settings.newTheme] = structuredClone(this.plugin.settings.currentTheme);
// 							new Notice(`${this.plugin.settings.newTheme} theme updated successfully!`); //NOSONAR
// 						} else {
// 							this.plugin.settings.themes[this.plugin.settings.newTheme] = structuredClone(this.plugin.settings.currentTheme);
// 							new Notice(`${this.plugin.settings.newTheme} theme saved successfully!`); //NOSONAR
// 						}
// 						this.plugin.settings.selectedTheme = this.plugin.settings.newTheme;
// 						this.updateDropdown(themeDropdown,this.plugin.settings);
// 						this.updateAlternativeHighlights();
// 						this.plugin.settings.newTheme = "";
// 						newThemeName.setValue("");
// 						newThemeDefault.setValue(false);
// 						this.saveSettings();
// 					}
// 				});
// 			});
// 	}
// 	generateCodeblockBodySettings(containerEl: HTMLElement) {
// 		containerEl.createEl("h3", {text: "Codeblock Appearance"});
// 		new Setting(containerEl)
// 			.setName("Codeblock Background Colour")
// 			.then((setting) => {this.createPickr(
// 				this.plugin,containerEl,setting,
// 				"codeblock_background",
// 				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].codeblock.backgroundColour,
// 				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].codeblock.backgroundColour = saveColour;},
// 			);});
// 		new Setting(containerEl)
// 			.setName("Codeblock Text Colour")
// 			.then((setting) => {this.createPickr(
// 				this.plugin,containerEl,setting,
// 				"codeblock_text",
// 				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].codeblock.textColour,
// 				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].codeblock.textColour = saveColour;},
// 			);});
// 		new Setting(containerEl)
// 			.setName("Codeblock Curvature")
// 			.setDesc("Determines how rounded the codeblocks appear in pixels.")
// 			.then((setting) => {
// 				let resettableSlider: SliderComponent;
// 				setting.addSlider((slider) => {resettableSlider = slider
// 					.setLimits(0,25,1)
// 					.setValue(this.plugin.settings.currentTheme.settings.codeblock.curvature)
// 					.setDynamicTooltip()
// 					.onChange((value) => {
// 						this.plugin.settings.currentTheme.settings.codeblock.curvature = value;
// 						this.saveSettings();
// 					});
// 				});
// 				setting.addExtraButton((button) => {button
// 					.setIcon("reset")
// 					.setTooltip("Restore default curvature")
// 					.onClick(() => {
// 						this.plugin.settings.currentTheme.settings.codeblock.curvature = this.plugin.settings.themes[this.plugin.settings.selectedTheme].settings.codeblock.curvature;
// 						resettableSlider.setValue(this.plugin.settings.currentTheme.settings.codeblock.curvature);
// 						this.saveSettings();
// 					});
// 				});
// 			});
// 		new Setting(containerEl)
// 			.setName("Language Coloured Borders")
// 			.setDesc("If enabled, languages with icons display a left border with the colour of the icon. The slider sets the width of the border.")
// 			.addToggle(toggle => toggle
// 				.setValue(this.plugin.settings.currentTheme.settings.advanced.languageBorderColour)
// 				.onChange((value) => {
// 					this.plugin.settings.currentTheme.settings.advanced.languageBorderColour = value;
// 					this.disableableComponents["languageBorderColour"].forEach(component => {component.setDisabled(!value);});
// 					this.saveSettings();
// 				}))
// 			.then((setting) => {
// 				let resettableSlider: SliderComponent;
// 				setting.addSlider((slider) => {resettableSlider = slider
// 					.setLimits(0,20,1)
// 					.setValue(this.plugin.settings.currentTheme.settings.advanced.languageBorderWidth)
// 					.setDisabled(!this.plugin.settings.currentTheme.settings.advanced.languageBorderColour)
// 					.setDynamicTooltip()
// 					.onChange((value) => {
// 						this.plugin.settings.currentTheme.settings.advanced.languageBorderWidth = value;
// 						this.saveSettings();
// 					});
// 				this.disableableComponents["languageBorderColour"].push(resettableSlider);
// 				});
// 				let resetButton: ExtraButtonComponent;
// 				setting.addExtraButton((button) => {resetButton = button
// 					.setIcon("reset")
// 					.setDisabled(!this.plugin.settings.currentTheme.settings.advanced.languageBorderColour)
// 					.setTooltip("Restore default colour stop")
// 					.onClick(() => {
// 						this.plugin.settings.currentTheme.settings.advanced.languageBorderWidth = this.plugin.settings.themes[this.plugin.settings.selectedTheme].settings.advanced.languageBorderWidth;
// 						resettableSlider.setValue(this.plugin.settings.currentTheme.settings.advanced.languageBorderWidth);
// 						this.saveSettings();
// 					});
// 				this.disableableComponents["languageBorderColour"].push(resetButton);
// 				});
// 			});
// 		new Setting(containerEl)
// 			.setName("Unwrap codeblock lines")
// 			.setDesc("Choose whether to unwrap lines in reading mode")
// 			.addToggle(toggle => toggle
// 				.setValue(this.plugin.settings.currentTheme.settings.codeblock.unwrapLines)
// 				.onChange((value) => {
// 					this.plugin.settings.currentTheme.settings.codeblock.unwrapLines = value;
// 					this.generateWrapLineSettings();
// 					this.saveSettings(true);
// 				}));
// 		this.wrapLinesContainer = containerEl.createDiv();
// 		this.generateWrapLineSettings();
// 	}
// 	generateWrapLineSettings() {
// 		this.wrapLinesContainer.empty();
// 		if (!this.plugin.settings.currentTheme.settings.codeblock.unwrapLines)
// 			return;
// 		new Setting(this.wrapLinesContainer)
// 			.setName("Wrap Lines on Click")
// 			.setDesc("If enabled, in reading mode, holding click on a codeblock will wrap the lines for better visibility.")
// 			.addToggle(toggle => toggle
// 				.setValue(this.plugin.settings.currentTheme.settings.codeblock.wrapLinesActive)
// 				.setDisabled(!this.plugin.settings.currentTheme.settings.codeblock.unwrapLines)
// 				.onChange((value) => {
// 					this.plugin.settings.currentTheme.settings.codeblock.wrapLinesActive = value;
// 					this.saveSettings(true);
// 				}));
// 	}
// 	generateCodeblockGutterSettings(containerEl: HTMLElement) {
// 		containerEl.createEl("h3", {text: "Gutter Appearance"});
// 		new Setting(containerEl)
// 			.setName("Enable Line Numbers")
// 			.setDesc("If disabled, the below settings are disabled too.")
// 			.addToggle(toggle => toggle
// 				.setValue(this.plugin.settings.currentTheme.settings.codeblock.lineNumbers)
// 				.onChange((value) => {
// 					this.plugin.settings.currentTheme.settings.codeblock.lineNumbers = value;
// 					this.generateCodeblockLineNumberSettings();
// 					this.saveSettings(true);
// 				}));
// 		this.lineNumbersContainer = containerEl.createDiv();
// 		this.generateCodeblockLineNumberSettings();
// 	}
// 	generateCodeblockLineNumberSettings() {
// 		this.lineNumbersContainer.empty();
// 		if (!this.plugin.settings.currentTheme.settings.codeblock.lineNumbers)
// 			return;
// 		new Setting(this.lineNumbersContainer)
// 			.setName("Gutter Background Colour")
// 			.then((setting) => {this.createPickr(
// 				this.plugin,this.lineNumbersContainer,setting,
// 				"gutter_background",
// 				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].gutter.backgroundColour,
// 				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].gutter.backgroundColour = saveColour;},
// 			);});
// 		new Setting(this.lineNumbersContainer)
// 			.setName("Line Number Colour")
// 			.then((setting) => {this.createPickr(
// 				this.plugin,this.lineNumbersContainer,setting,
// 				"line_number",
// 				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].gutter.textColour,
// 				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].gutter.textColour = saveColour;},
// 			);});
// 		new Setting(this.lineNumbersContainer)
// 			.setName("Highlight Line Numbers")
// 			.setDesc("If enabled, highlights will also highlight the line numbers.")
// 			.addToggle(toggle => toggle
// 				.setValue(this.plugin.settings.currentTheme.settings.gutter.highlight)
// 				.setDisabled(!this.plugin.settings.currentTheme.settings.codeblock.lineNumbers)
// 				.onChange((value) => {
// 					this.plugin.settings.currentTheme.settings.gutter.highlight = value;
// 					this.saveSettings();
// 				}));
// 		new Setting(this.lineNumbersContainer)
// 			.setName("Indicate Current Line Number")
// 			.setDesc("If enabled, the current line number in codeblocks will be indicated with a separate colour.")
// 			.setClass("code-styler-spaced")
// 			.addToggle(toggle => toggle
// 				.setValue(this.plugin.settings.currentTheme.settings.gutter.activeLine)
// 				.setDisabled(!this.plugin.settings.currentTheme.settings.codeblock.lineNumbers)
// 				.onChange((value) => {
// 					this.plugin.settings.currentTheme.settings.gutter.activeLine = value;
// 					this.saveSettings();
// 				})
// 			)
// 			.then((setting) => {this.createPickr(
// 				this.plugin,this.lineNumbersContainer,setting,
// 				"active_line_number",
// 				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].gutter.activeTextColour,
// 				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].gutter.activeTextColour = saveColour;},
// 			);});
// 	}
// 	generateCodeblockHeaderSettings(containerEl: HTMLElement) {
// 		containerEl.createEl("h3", {text: "Header Appearance"});
// 		new Setting(containerEl)
// 			.setName("Header Background Colour")
// 			.then((setting) => {this.createPickr(
// 				this.plugin,containerEl,setting,
// 				"header_background",
// 				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].header.backgroundColour,
// 				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].header.backgroundColour = saveColour;},
// 			);});
// 		new Setting(containerEl)
// 			.setName("Header Font Size")
// 			.setDesc("Set the font size for header language tags and titles.")
// 			.then((setting) => {
// 				let resettableSlider: SliderComponent;
// 				setting.addSlider((slider) => {resettableSlider = slider
// 					.setLimits(6,32,1)
// 					.setValue(this.plugin.settings.currentTheme.settings.header.fontSize)
// 					.setDynamicTooltip()
// 					.onChange((value) => {
// 						this.plugin.settings.currentTheme.settings.header.fontSize = value;
// 						this.saveSettings();
// 					});
// 				});
// 				setting.addExtraButton((button) => {button
// 					.setIcon("reset")
// 					.setTooltip("Restore default font size")
// 					.onClick(() => {
// 						this.plugin.settings.currentTheme.settings.header.fontSize = this.plugin.settings.themes[this.plugin.settings.selectedTheme].settings.header.fontSize;
// 						resettableSlider.setValue(this.plugin.settings.currentTheme.settings.header.fontSize);
// 						this.saveSettings();
// 					});
// 				});
// 			});
// 		new Setting(containerEl)
// 			.setName("Header Title Text Styling")
// 			.setDesc("Style the header title text using bold and italic toggles, by setting a font or by setting a text colour.")
// 			.addToggle(toggle => {toggle
// 				.setTooltip("Toggle bold title text")
// 				.setValue(this.plugin.settings.currentTheme.settings.header.title.textBold)
// 				.onChange((value) => {
// 					this.plugin.settings.currentTheme.settings.header.title.textBold = value;
// 					this.saveSettings();
// 				});
// 			})
// 			.addToggle(toggle => {toggle
// 				.setTooltip("Toggle italic title text")
// 				.setValue(this.plugin.settings.currentTheme.settings.header.title.textItalic)
// 				.onChange((value) => {
// 					this.plugin.settings.currentTheme.settings.header.title.textItalic = value;
// 					this.saveSettings();
// 				});
// 			})
// 			.addText(text => {text
// 				.setPlaceholder("Font")
// 				.setValue(this.plugin.settings.currentTheme.settings.header.title.textFont)
// 				.onChange((value) => {
// 					this.plugin.settings.currentTheme.settings.header.title.textFont = value;
// 					this.saveSettings();
// 				});
// 			})
// 			.then((setting) => {this.createPickr(
// 				this.plugin,containerEl,setting,
// 				"header_title_text",
// 				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].header.title.textColour,
// 				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].header.title.textColour = saveColour;},
// 			);});
// 		let foldPlaceholderTimeout: NodeJS.Timeout = setTimeout(()=>{});
// 		new Setting(containerEl)
// 			.setName("Fold Placeholder Text")
// 			.setDesc("Title placeholder text for folded code when no title parameter is set.")
// 			.addText(text => text
// 				.setPlaceholder(FOLD_PLACEHOLDER)
// 				.setValue(this.plugin.settings.currentTheme.settings.header.foldPlaceholder)
// 				.onChange((value) => {
// 					this.plugin.settings.currentTheme.settings.header.foldPlaceholder = value;
// 					this.saveSettings();
// 					clearTimeout(foldPlaceholderTimeout);
// 					foldPlaceholderTimeout = setTimeout(()=>this.rerender(),1000);
// 				}));
// 		new Setting(containerEl)
// 			.setName("Header Separator Colour")
// 			.setDesc("Colour of the line separating the codeblock header and the codeblock.")
// 			.then((setting) => {this.createPickr(
// 				this.plugin,containerEl,setting,
// 				"header_separator",
// 				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].header.lineColour,
// 				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].header.lineColour = saveColour;},
// 			);});

// 		containerEl.createEl("h5", {text: "Header Language Tag Appearance"});
// 		new Setting(containerEl)
// 			.setName("Display Header Language Tags")
// 			.setDesc("Determine when to show language tags in the header. \"Title Only\" will only show language tags when the title parameter is set.")
// 			.addDropdown((dropdown) => dropdown
// 				.addOptions(DISPLAY_OPTIONS)
// 				.setValue(this.plugin.settings.currentTheme.settings.header.languageTag.display)
// 				.onChange((value: Display) => {
// 					this.plugin.settings.currentTheme.settings.header.languageTag.display = value;
// 					this.generateHeaderTagSettings();
// 					this.saveSettings(true);
// 				}));
// 		this.headerTagsContainer = containerEl.createDiv();
// 		this.generateHeaderTagSettings();

// 		containerEl.createEl("h5", {text: "Header Language Icon Appearance"});
// 		new Setting(containerEl)
// 			.setName("Display Header Language Icons")
// 			.setDesc("Determine when to show language icons where available. \"Title Only\" will only show language tags when the title parameter is set.")
// 			.addDropdown((dropdown) => dropdown
// 				.addOptions(DISPLAY_OPTIONS)
// 				.setValue(this.plugin.settings.currentTheme.settings.header.languageIcon.display)
// 				.onChange((value: Display) => {
// 					this.plugin.settings.currentTheme.settings.header.languageIcon.display = value;
// 					this.generateHeaderLanguageIconSettings();
// 					this.saveSettings(true);
// 				}));
// 		this.headerIconsContainer = containerEl.createDiv();
// 		this.generateHeaderLanguageIconSettings();
// 		this.headerExternalReferenceContainer = containerEl.createDiv();
// 		this.generateHeaderExternalReferenceSettings();
// 	}
// 	generateHeaderTagSettings() {
// 		this.headerTagsContainer.empty();
// 		if (this.plugin.settings.currentTheme.settings.header.languageTag.display === "none")
// 			return;
// 		new Setting(this.headerTagsContainer)
// 			.setName("Header Language Tag Background Colour")
// 			.then((setting) => {this.createPickr(
// 				this.plugin,this.headerTagsContainer,setting,
// 				"header_language_tag_background",
// 				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].header.languageTag.backgroundColour,
// 				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].header.languageTag.backgroundColour = saveColour;},
// 			);});
// 		new Setting(this.headerTagsContainer)
// 			.setName("Header Language Tag Text Styling")
// 			.setDesc("Style the header language tag text using bold and italic toggles, by setting a font or by setting a text colour.")
// 			.addToggle(toggle => toggle
// 				.setTooltip("Toggle bold language tag text")
// 				.setValue(this.plugin.settings.currentTheme.settings.header.languageTag.textBold)
// 				.setDisabled(this.plugin.settings.currentTheme.settings.header.languageTag.display==="none")
// 				.onChange((value) => {
// 					this.plugin.settings.currentTheme.settings.header.languageTag.textBold = value;
// 					this.saveSettings();
// 				}))
// 			.addToggle(toggle => toggle
// 				.setTooltip("Toggle italic language tag text")
// 				.setValue(this.plugin.settings.currentTheme.settings.header.languageTag.textItalic)
// 				.setDisabled(this.plugin.settings.currentTheme.settings.header.languageTag.display==="none")
// 				.onChange((value) => {
// 					this.plugin.settings.currentTheme.settings.header.languageTag.textItalic = value;
// 					this.saveSettings();
// 				}))
// 			.addText(text => text
// 				.setPlaceholder("Font")
// 				.setValue(this.plugin.settings.currentTheme.settings.header.languageTag.textFont)
// 				.setDisabled(this.plugin.settings.currentTheme.settings.header.languageTag.display==="none")
// 				.onChange((value) => {
// 					this.plugin.settings.currentTheme.settings.header.languageTag.textFont = value;
// 					this.saveSettings();
// 				}))
// 			.then((setting) => {this.createPickr(
// 				this.plugin,this.headerTagsContainer,setting,
// 				"header_language_tag_text",
// 				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].header.languageTag.textColour,
// 				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].header.languageTag.textColour = saveColour;},
// 			);});
// 	}
// 	generateHeaderLanguageIconSettings() {
// 		this.headerIconsContainer.empty();
// 		if (this.plugin.settings.currentTheme.settings.header.languageIcon.display === "none")
// 			return;
// 		new Setting(this.headerIconsContainer)
// 			.setName("Language Icons Coloured")
// 			.setDesc("If disabled, language icons will be black and white.")
// 			.addToggle(toggle => toggle
// 				.setValue(this.plugin.settings.currentTheme.settings.header.languageIcon.displayColour)
// 				.setDisabled(this.plugin.settings.currentTheme.settings.header.languageIcon.display==="none")
// 				.onChange((value) => {
// 					this.plugin.settings.currentTheme.settings.header.languageIcon.displayColour = value;
// 					this.saveSettings();
// 				}));
// 		new Setting(this.headerIconsContainer)
// 			.setName("Language Icon Size")
// 			.setDesc("Set the size of the displayed language icons.")
// 			.then((setting) => {
// 				let resettableSlider: SliderComponent;
// 				setting.addSlider((slider) => {resettableSlider = slider
// 					.setLimits(10,40,1)
// 					.setValue(this.plugin.settings.currentTheme.settings.advanced.iconSize)
// 					.setDisabled(this.plugin.settings.currentTheme.settings.header.languageIcon.display==="none")
// 					.setDynamicTooltip()
// 					.onChange((value) => {
// 						this.plugin.settings.currentTheme.settings.advanced.iconSize = value;
// 						this.saveSettings();
// 					});
// 				});
// 				setting.addExtraButton((button) => button
// 					.setIcon("reset")
// 					.setDisabled(this.plugin.settings.currentTheme.settings.header.languageIcon.display==="none")
// 					.setTooltip("Restore default icon size")
// 					.onClick(() => {
// 						this.plugin.settings.currentTheme.settings.advanced.iconSize = this.plugin.settings.themes[this.plugin.settings.selectedTheme].settings.advanced.iconSize;
// 						resettableSlider.setValue(this.plugin.settings.currentTheme.settings.advanced.iconSize);
// 						this.saveSettings();
// 					}));
// 			});
// 	}
// 	generateHeaderExternalReferenceSettings() {
// 		this.headerExternalReferenceContainer.empty();
// 		this.headerExternalReferenceContainer.createEl("h5", { text: "External Reference Indicators Appearance" });
// 		new Setting(this.headerExternalReferenceContainer)
// 			.setName("Display Repository")
// 			.setDesc("Display repository in codeblock header for external references.")
// 			.addToggle(toggle => toggle
// 				.setTooltip("Display Repository")
// 				.setValue(this.plugin.settings.currentTheme.settings.header.externalReference.displayRepository)
// 				.onChange((value) => {
// 					this.plugin.settings.currentTheme.settings.header.externalReference.displayRepository = value;
// 					this.saveSettings();
// 				}))
// 			.then((setting) => {this.createPickr(
// 				this.plugin,this.headerExternalReferenceContainer,setting,
// 				"codeblock_header_display_repository",
// 				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].header.externalReference.displayRepositoryColour,
// 				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].header.externalReference.displayRepositoryColour = saveColour;},
// 				() => !this.plugin.settings.currentTheme.settings.header.externalReference.displayRepository,
// 			);});
// 		new Setting(this.headerExternalReferenceContainer)
// 			.setName("Display Repository Name")
// 			.setDesc("Display repository version in codeblock header for external references.")
// 			.addToggle(toggle => toggle
// 				.setTooltip("Display Repository Version")
// 				.setValue(this.plugin.settings.currentTheme.settings.header.externalReference.displayVersion)
// 				.onChange((value) => {
// 					this.plugin.settings.currentTheme.settings.header.externalReference.displayVersion = value;
// 					this.saveSettings();
// 				}))
// 			.then((setting) => {this.createPickr(
// 				this.plugin,this.headerExternalReferenceContainer,setting,
// 				"codeblock_header_display_version",
// 				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].header.externalReference.displayVersionColour,
// 				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].header.externalReference.displayVersionColour = saveColour;},
// 				() => !this.plugin.settings.currentTheme.settings.header.externalReference.displayVersion,
// 			);});
// 		new Setting(this.headerExternalReferenceContainer)
// 			.setName("Display Reference Timestamp")
// 			.setDesc("Display the timestamp at which the reference was last updated.")
// 			.addToggle(toggle => toggle
// 				.setTooltip("Display Timestamp")
// 				.setValue(this.plugin.settings.currentTheme.settings.header.externalReference.displayTimestamp)
// 				.onChange((value) => {
// 					this.plugin.settings.currentTheme.settings.header.externalReference.displayTimestamp = value;
// 					this.saveSettings();
// 				}))
// 			.then((setting) => {this.createPickr(
// 				this.plugin,this.headerExternalReferenceContainer,setting,
// 				"codeblock_header_display_timestamp",
// 				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].header.externalReference.displayTimestampColour,
// 				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].header.externalReference.displayTimestampColour = saveColour;},
// 				() => !this.plugin.settings.currentTheme.settings.header.externalReference.displayTimestamp,
// 			);});
// 	}
// 	generateCodeblockHighlightSettings(containerEl: HTMLElement) {
// 		containerEl.createEl("h3", {text: "Highlighting Appearance"});
// 		new Setting(containerEl)
// 			.setName("Codeblock Active Line Highlight")
// 			.setDesc("If enabled, highlights the active line inside codeblocks.")
// 			.setClass("code-styler-spaced")
// 			.addToggle(toggle => {return toggle
// 				.setValue(this.plugin.settings.currentTheme.settings.highlights.activeCodeblockLine)
// 				.onChange((value) => {
// 					this.plugin.settings.currentTheme.settings.highlights.activeCodeblockLine = value;
// 					this.disableableComponents["codeblockActiveLineHighlight"].forEach(component => {component.setDisabled(!value);});
// 					this.saveSettings();
// 				});
// 			})
// 			.then((setting) => {this.createPickr(
// 				this.plugin,containerEl,setting,
// 				"codeblock_active_line_highlight",
// 				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].highlights.activeCodeblockLineColour,
// 				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].highlights.activeCodeblockLineColour = saveColour;},
// 				() => !this.plugin.settings.currentTheme.settings.highlights.activeCodeblockLine,
// 			);});
// 		this.disableableComponents["codeblockActiveLineHighlight"].push(this.pickrs["codeblock_active_line_highlight"].resetButton);
// 		new Setting(containerEl)
// 			.setName("Default Highlight Colour")
// 			.setDesc("Used by the 'hl' parameter.")
// 			.then((setting) => {this.createPickr(
// 				this.plugin,containerEl,setting,
// 				"default_highlight",
// 				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].highlights.defaultColour,
// 				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].highlights.defaultColour = saveColour;},
// 			);});
// 		let newHighlightText: TextComponent;
// 		new Setting(containerEl)
// 			.setName("Add Alternative Highlight")
// 			.setDesc("Define a new alternative highlight name. The colour can be modified after it is added.")
// 			.addText(value => {newHighlightText = value
// 				.setPlaceholder("e.g. error, warn")
// 				.onChange((value) => {
// 					this.plugin.settings.newHighlight = value;
// 				});
// 			})
// 			.addButton((button) => {
// 				button.setButtonText("Add");
// 				button.onClick(() => {
// 					if (this.plugin.settings.newHighlight.trim() === "")
// 						new Notice("Please enter a colour name."); //NOSONAR
// 					else if (!/^[^\d]\w*$/.test(this.plugin.settings.newHighlight))
// 						new Notice(`"${this.plugin.settings.newHighlight}" is not a valid colour name.`); //NOSONAR
// 					else if (this.plugin.settings.newHighlight.trim().toLowerCase() === "hl")
// 						new Notice("Cannot override the default highlight parameter."); //NOSONAR
// 					else if (PARAMETERS.includes(this.plugin.settings.newHighlight.trim().toLowerCase()))
// 						new Notice("Cannot use other default parameters."); //NOSONAR
// 					else if (this.plugin.settings.newHighlight in this.plugin.settings.currentTheme.colours.light.highlights.alternativeHighlights)
// 						new Notice(`A highlight with the name "${this.plugin.settings.newHighlight}" already exists.`); //NOSONAR
// 						//TODO (@mayurankv) Future: Focus on existing highlighter - `renderMatches`
// 					else {
// 						const newColour = getRandomColour();
// 						this.plugin.settings.currentTheme.colours.light.highlights.alternativeHighlights[this.plugin.settings.newHighlight] = newColour;
// 						this.plugin.settings.currentTheme.colours.dark.highlights.alternativeHighlights[this.plugin.settings.newHighlight] = newColour;
// 						this.updateAlternativeHighlights();
// 						new Notice(`Added highlight "${this.plugin.settings.newHighlight}".`); //NOSONAR
// 						this.plugin.settings.newHighlight = "";
// 						newHighlightText.setValue("");
// 						this.saveSettings(true);
// 					}
// 				});
// 			});
// 		this.alternativeHighlightsContainer = containerEl.createDiv();
// 		this.updateAlternativeHighlights();
// 		new Setting(containerEl)
// 			.setName("Gradient Highlighting")
// 			.setDesc("If enabled, highlights fade away to the right. The slider sets the gradient colour stop as a percentage.")
// 			.addToggle(toggle => toggle
// 				.setValue(this.plugin.settings.currentTheme.settings.advanced.gradientHighlights)
// 				.onChange((value) => {
// 					this.plugin.settings.currentTheme.settings.advanced.gradientHighlights = value;
// 					this.disableableComponents["gradientHighlighting"].forEach(component => {component.setDisabled(!value);});
// 					this.saveSettings();
// 				}))
// 			.then((setting) => {
// 				let resettableSlider: SliderComponent;
// 				setting.addSlider((slider) => {resettableSlider = slider
// 					.setLimits(0,100,1)
// 					.setValue(+this.plugin.settings.currentTheme.settings.advanced.gradientHighlightsColourStop.slice(0,-1))
// 					.setDisabled(!this.plugin.settings.currentTheme.settings.advanced.gradientHighlights)
// 					.setDynamicTooltip()
// 					.onChange((value) => {
// 						this.plugin.settings.currentTheme.settings.advanced.gradientHighlightsColourStop = `${value}%`;
// 						this.saveSettings();
// 					});
// 				this.disableableComponents["gradientHighlighting"].push(resettableSlider);
// 				});
// 				let resetButton: ExtraButtonComponent;
// 				setting.addExtraButton((button) => {resetButton = button
// 					.setIcon("reset")
// 					.setDisabled(!this.plugin.settings.currentTheme.settings.advanced.gradientHighlights)
// 					.setTooltip("Restore default colour stop")
// 					.onClick(() => {
// 						this.plugin.settings.currentTheme.settings.advanced.gradientHighlightsColourStop = this.plugin.settings.themes[this.plugin.settings.selectedTheme].settings.advanced.gradientHighlightsColourStop;
// 						resettableSlider.setValue(+this.plugin.settings.currentTheme.settings.advanced.gradientHighlightsColourStop.slice(0,-1));
// 						this.saveSettings();
// 					});
// 				this.disableableComponents["gradientHighlighting"].push(resetButton);
// 				});
// 			});
// 	}
// 	generateCodeblockLanguageSettings(containerEl: HTMLElement) {
// 		let excludeTimeout: NodeJS.Timeout = setTimeout(()=>{});
// 		new Setting(containerEl)
// 			.setName("Exclude Languages")
// 			.setDesc("Define languages in a comma separated list which the plugin should not decorate. You can use a wildcard (*) either at the beginning, or at the end. For example: ad-* will exclude codeblocks where the language starts with ad- e.g.: ad-info, ad-error etc.")
// 			.addText(text => text
// 				.setPlaceholder(`e.g. ${EXCLUDED_LANGUAGES} etc.`)
// 				.setValue(this.plugin.settings.excludedLanguages)
// 				.onChange((value) => {
// 					this.plugin.settings.excludedLanguages = value;
// 					this.saveSettings();
// 					clearTimeout(excludeTimeout);
// 					excludeTimeout = setTimeout(()=>this.rerender(),1000);
// 				}));
// 		let whitelistTimeout: NodeJS.Timeout = setTimeout(()=>{});
// 		new Setting(containerEl)
// 			.setName("Whitelisted Processed Codeblocks")
// 			.setDesc("Define languages in a comma separated list which the plugin should style despite being processed by another plugin. You can use a wildcard (*) either at the beginning, or at the end. For example: ad-* will exclude codeblocks where the language starts with ad- e.g.: ad-info, ad-error etc.")
// 			.addText(text => text
// 				.setPlaceholder(`e.g. ${WHITELIST_CODEBLOCKS} etc.`)
// 				.setValue(this.plugin.settings.processedCodeblocksWhitelist)
// 				.onChange((value) => {
// 					this.plugin.settings.processedCodeblocksWhitelist = value;
// 					this.saveSettings();
// 					clearTimeout(whitelistTimeout);
// 					whitelistTimeout = setTimeout(()=>this.rerender(),1000);
// 				}));
// 		new Setting(containerEl)
// 			.setName("Redirect Language Settings")
// 			.setDesc("Use this textbox to redirect specific language colours and icons as a JSON with language names as keys and either a colour key, an icon key or both as the value for a given language. Colours should be passed as CSS colours and icons should be passed as a string of the inside of an svg element. This setting is theme independent.")
// 			.setClass("code-styler-setting-text-area")
// 			.addTextArea(textArea => textArea
// 				.setValue(JSON.stringify(this.plugin.settings.redirectLanguages)==="{}"?"":JSON.stringify(this.plugin.settings.redirectLanguages,null,4))
// 				.setPlaceholder(JSON.stringify({toml: {colour: "#012345", icon: LANGUAGES["APL"].colour}},null,4))
// 				.onChange((value)=>{
// 					if (value === "") {
// 						this.plugin.settings.redirectLanguages = {};
// 						this.saveSettings();
// 					} else {
// 						try {
// 							this.plugin.settings.redirectLanguages = JSON.parse(value);
// 							this.redirectLanguages();
// 							this.saveSettings();
// 						} catch {
// 							new Notice("Invalid JSON"); //NOSONAR
// 						}
// 					}
// 					//TODO (@mayurankv) Re-render (Test)
// 				}));
// 	}
// 	generateInlineCodeSettings(containerEl: HTMLElement) {
// 		containerEl.createEl("h3", {text: "Inline Code Appearance"});
// 		new Setting(containerEl)
// 			.setName("Syntax Highlight Inline Code")
// 			.setDesc("If enabled, in reading mode, inline code will be syntax highlighted based on a language set with `{language} highlighted_inline_code`. See the README for more information.")
// 			.addToggle(toggle => toggle
// 				.setValue(this.plugin.settings.currentTheme.settings.inline.syntaxHighlight)
// 				.onChange((value) => {
// 					this.plugin.settings.currentTheme.settings.inline.syntaxHighlight = value;
// 					this.saveSettings(true);
// 				}));
// 		new Setting(containerEl)
// 			.setName("Style Inline Code")
// 			.setDesc("If enabled, inline code will be styled.")
// 			.addToggle(toggle => toggle
// 				.setValue(this.plugin.settings.currentTheme.settings.inline.style)
// 				.onChange((value) => {
// 					this.plugin.settings.currentTheme.settings.inline.style = value;
// 					this.generateInlineCodeStyleSettings();
// 					this.saveSettings();
// 				}));
// 		this.inlineCodeStylesContainer = containerEl.createDiv();
// 		this.generateInlineCodeStyleSettings();
// 		new Setting(this.inlineCodeStylesContainer)
// 			.setName("Inline Code Title Colour")
// 			.setDesc("The text colour of inline code titles.")
// 			.then((setting) => {this.createPickr(
// 				this.plugin,this.inlineCodeStylesContainer,setting,
// 				"title_text",
// 				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].inline.titleTextColour,
// 				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].inline.titleTextColour = saveColour;},
// 			);});
// 		new Setting(this.inlineCodeStylesContainer)
// 			.setName("Inline Code Title Font Weight")
// 			.setDesc("Determines how bold inline code titles appear.")
// 			.then((setting) => {
// 				let resettableSlider: SliderComponent;
// 				setting.addSlider((slider) => {resettableSlider = slider
// 					.setLimits(1,9,1)
// 					.setValue(this.plugin.settings.currentTheme.settings.inline.titleFontWeight)
// 					.setDynamicTooltip()
// 					.onChange((value) => {
// 						this.plugin.settings.currentTheme.settings.inline.titleFontWeight = value;
// 						this.saveSettings();
// 					});
// 				});
// 				setting.addExtraButton((button) => {button
// 					.setIcon("reset")
// 					.setTooltip("Restore default font weight")
// 					.onClick(() => {
// 						this.plugin.settings.currentTheme.settings.inline.titleFontWeight = this.plugin.settings.themes[this.plugin.settings.selectedTheme].settings.inline.titleFontWeight;
// 						resettableSlider.setValue(this.plugin.settings.currentTheme.settings.inline.titleFontWeight);
// 						this.saveSettings();
// 					});
// 				});
// 			});
// 	}
// 	generateInlineCodeStyleSettings() {
// 		this.inlineCodeStylesContainer.empty();
// 		if (!this.plugin.settings.currentTheme.settings.inline.style)
// 			return;
// 		new Setting(this.inlineCodeStylesContainer)
// 			.setName("Inline Code Background Colour")
// 			.then((setting) => {this.createPickr(
// 				this.plugin,this.inlineCodeStylesContainer,setting,
// 				"inline_background",
// 				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].inline.backgroundColour,
// 				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].inline.backgroundColour = saveColour;},
// 			);});
// 		new Setting(this.inlineCodeStylesContainer)
// 			.setName("Inline Code Text Colour")
// 			.then((setting) => {this.createPickr(
// 				this.plugin,this.inlineCodeStylesContainer,setting,
// 				"inline_text",
// 				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].inline.textColour,
// 				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].inline.textColour = saveColour;},
// 			);});
// 		new Setting(this.inlineCodeStylesContainer)
// 			.setName("Inline Code Active Text Colour")
// 			.setDesc("The text colour when editing inline code.")
// 			.then((setting) => {this.createPickr(
// 				this.plugin,this.inlineCodeStylesContainer,setting,
// 				"inline_active_text",
// 				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].inline.activeTextColour,
// 				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].inline.activeTextColour = saveColour;},
// 			);});
// 		new Setting(this.inlineCodeStylesContainer)
// 			.setName("Inline Code Font Weight")
// 			.setDesc("Determines how bold inline code appears.")
// 			.then((setting) => {
// 				let resettableSlider: SliderComponent;
// 				setting.addSlider((slider) => {resettableSlider = slider
// 					.setLimits(1,9,1)
// 					.setValue(this.plugin.settings.currentTheme.settings.inline.fontWeight)
// 					.setDynamicTooltip()
// 					.onChange((value) => {
// 						this.plugin.settings.currentTheme.settings.inline.fontWeight = value;
// 						this.saveSettings();
// 					});
// 				});
// 				setting.addExtraButton((button) => {button
// 					.setIcon("reset")
// 					.setTooltip("Restore default font weight")
// 					.onClick(() => {
// 						this.plugin.settings.currentTheme.settings.inline.fontWeight = this.plugin.settings.themes[this.plugin.settings.selectedTheme].settings.inline.fontWeight;
// 						resettableSlider.setValue(this.plugin.settings.currentTheme.settings.inline.fontWeight);
// 						this.saveSettings();
// 					});
// 				});
// 			});
// 		new Setting(this.inlineCodeStylesContainer)
// 			.setName("Inline Code Curvature")
// 			.setDesc("Determines how rounded inline code appear in pixels.")
// 			.then((setting) => {
// 				let resettableSlider: SliderComponent;
// 				setting.addSlider((slider) => {resettableSlider = slider
// 					.setLimits(0,12,1)
// 					.setValue(this.plugin.settings.currentTheme.settings.inline.curvature)
// 					.setDynamicTooltip()
// 					.onChange((value) => {
// 						this.plugin.settings.currentTheme.settings.inline.curvature = value;
// 						this.saveSettings();
// 					});
// 				});
// 				setting.addExtraButton((button) => {button
// 					.setIcon("reset")
// 					.setTooltip("Restore default curvature")
// 					.onClick(() => {
// 						this.plugin.settings.currentTheme.settings.inline.curvature = this.plugin.settings.themes[this.plugin.settings.selectedTheme].settings.inline.curvature;
// 						resettableSlider.setValue(this.plugin.settings.currentTheme.settings.inline.curvature);
// 						this.saveSettings();
// 					});
// 				});
// 			});
// 		new Setting(this.inlineCodeStylesContainer)
// 			.setName("Inline Code Vertical Padding")
// 			.setDesc("Determines how much vertical inner padding in pixels inline code has.")
// 			.then((setting) => {
// 				let resettableSlider: SliderComponent;
// 				setting.addSlider((slider) => {resettableSlider = slider
// 					.setLimits(0,10,1)
// 					.setValue(this.plugin.settings.currentTheme.settings.inline.paddingVertical)
// 					.setDynamicTooltip()
// 					.onChange((value) => {
// 						this.plugin.settings.currentTheme.settings.inline.paddingVertical = value;
// 						this.saveSettings();
// 					});
// 				});
// 				setting.addExtraButton((button) => {button
// 					.setIcon("reset")
// 					.setTooltip("Restore default vertical padding")
// 					.onClick(() => {
// 						this.plugin.settings.currentTheme.settings.inline.paddingVertical = this.plugin.settings.themes[this.plugin.settings.selectedTheme].settings.inline.paddingVertical;
// 						resettableSlider.setValue(this.plugin.settings.currentTheme.settings.inline.paddingVertical);
// 						this.saveSettings();
// 					});
// 				});
// 			});
// 		new Setting(this.inlineCodeStylesContainer)
// 			.setName("Inline Code Horizontal Padding")
// 			.setDesc("Determines how much horizontal inner padding in pixels inline code has.")
// 			.then((setting) => {
// 				let resettableSlider: SliderComponent;
// 				setting.addSlider((slider) => {resettableSlider = slider
// 					.setLimits(0,10,1)
// 					.setValue(this.plugin.settings.currentTheme.settings.inline.paddingHorizontal)
// 					.setDynamicTooltip()
// 					.onChange((value) => {
// 						this.plugin.settings.currentTheme.settings.inline.paddingHorizontal = value;
// 						this.saveSettings();
// 					});
// 				});
// 				setting.addExtraButton((button) => {button
// 					.setIcon("reset")
// 					.setTooltip("Restore default horizontal padding")
// 					.onClick(() => {
// 						this.plugin.settings.currentTheme.settings.inline.paddingHorizontal = this.plugin.settings.themes[this.plugin.settings.selectedTheme].settings.inline.paddingHorizontal;
// 						resettableSlider.setValue(this.plugin.settings.currentTheme.settings.inline.paddingHorizontal);
// 						this.saveSettings();
// 					});
// 				});
// 			});
// 		new Setting(this.inlineCodeStylesContainer)
// 			.setName("Inline Code Horizontal Margin")
// 			.setDesc("Determines how much horizontal outer margin is added to the inline code in pixels.")
// 			.then((setting) => {
// 				let resettableSlider: SliderComponent;
// 				setting.addSlider((slider) => {resettableSlider = slider
// 					.setLimits(0,8,1)
// 					.setValue(this.plugin.settings.currentTheme.settings.inline.marginHorizontal)
// 					.setDynamicTooltip()
// 					.onChange((value) => {
// 						this.plugin.settings.currentTheme.settings.inline.marginHorizontal = value;
// 						this.saveSettings();
// 					});
// 				});
// 				setting.addExtraButton((button) => {button
// 					.setIcon("reset")
// 					.setTooltip("Restore default horizontal margin")
// 					.onClick(() => {
// 						this.plugin.settings.currentTheme.settings.inline.marginHorizontal = this.plugin.settings.themes[this.plugin.settings.selectedTheme].settings.inline.marginHorizontal;
// 						resettableSlider.setValue(this.plugin.settings.currentTheme.settings.inline.marginHorizontal);
// 						this.saveSettings();
// 					});
// 				});
// 			});
// 	}
// 	generateAdvancedHeading(containerEl: HTMLElement) {
// 		const advancedSettingsHeading = containerEl.createEl("h2", {text: "Advanced Settings", cls: `advanced-settings-header${this.hideAdvanced?" header-folded":""}`});
// 		advancedSettingsHeading.addEventListener("click",()=>{
// 			this.hideAdvanced = !this.hideAdvanced;
// 			advancedSettingsHeading.classList.toggle("header-folded",this.hideAdvanced);
// 			this.generateAdvancedSettings();
// 		});
// 	}
// 	generateAdvancedSettings() {
// 		this.advancedSettingsContainer.empty();
// 		if (this.hideAdvanced)
// 			return;
// 		this.generateInterfaceSettings(this.advancedSettingsContainer);
// 		new Setting(this.advancedSettingsContainer)
// 			.setName("Editor Active Line Highlight")
// 			.setDesc("If enabled, highlights the active line outside codeblocks.")
// 			.setClass("code-styler-spaced")
// 			.addToggle(toggle => toggle
// 				.setTooltip("Toggle editor active line highlighting")
// 				.setValue(this.plugin.settings.currentTheme.settings.highlights.activeEditorLine)
// 				.onChange((value) => {
// 					this.plugin.settings.currentTheme.settings.highlights.activeEditorLine = value;
// 					this.disableableComponents["editorActiveLineHighlight"].forEach(component => {component.setDisabled(!value);});
// 					this.saveSettings();
// 				}))
// 			.then((setting) => {this.createPickr(
// 				this.plugin,this.advancedSettingsContainer,setting,
// 				"editor_active_line_highlight",
// 				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].highlights.activeEditorLineColour,
// 				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].highlights.activeEditorLineColour = saveColour;},
// 				() => !this.plugin.settings.currentTheme.settings.highlights.activeEditorLine,
// 			);
// 			});
// 		new Setting(this.advancedSettingsContainer)
// 			.setName("External References Automatic Update on Load")
// 			.setDesc("If enabled, external references will be updated automatically on load when possible.")
// 			.addToggle(toggle => toggle
// 				.setTooltip("Toggle auto-update external references")
// 				.setValue(this.plugin.settings.externalReferenceUpdateOnLoad)
// 				.onChange((value) => {
// 					this.plugin.settings.externalReferenceUpdateOnLoad = value;
// 					this.saveSettings();
// 				}));
// 		this.disableableComponents["editorActiveLineHighlight"].push(this.pickrs["editor_active_line_highlight"].resetButton);
// 		new Setting(this.advancedSettingsContainer)
// 			.setName("Reset inbuilt themes")
// 			.setDesc("This will return all inbuilt themes to the plugin defaults")
// 			.addButton(button => button
// 				.setButtonText("Reset")
// 				.onClick(()=>{
// 					Object.entries(INBUILT_THEMES).forEach(([themeName,theme]: [string,CodeStylerTheme]) => this.plugin.settings.themes[themeName] = structuredClone(theme));
// 					if (this.plugin.settings.selectedTheme in INBUILT_THEMES)
// 						this.plugin.settings.currentTheme = structuredClone(this.plugin.settings.themes[this.plugin.settings.selectedTheme]);
// 					this.saveSettings(true);
// 				}));
// 	}
// 	generateInterfaceSettings(containerEl: HTMLElement) {
// 		new Setting(containerEl)
// 			.setName("Button Colour")
// 			.setDesc("Used for UI buttons like the copy code button.")
// 			.then((setting) => {this.createPickr(
// 				this.plugin,containerEl,setting,
// 				"default_highlight",
// 				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].advanced.buttonColour,
// 				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].advanced.buttonColour = saveColour;},
// 			);});
// 		new Setting(containerEl)
// 			.setName("Button Active Colour")
// 			.setDesc("Colour buttons use when activated.")
// 			.then((setting) => {this.createPickr(
// 				this.plugin,containerEl,setting,
// 				"default_highlight",
// 				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].advanced.buttonActiveColour,
// 				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].advanced.buttonActiveColour = saveColour;},
// 			);});
// 	}
// 	generatePluginCompatibilitySettings(containerEl: HTMLElement) {
// 		containerEl.createSpan("Needs completing"); //TODO (@mayurankv) Complete
// 		// Execute Code Settings
// 	}
// 	generateExampleCodeblockSettings(containerEl: HTMLElement) {
// 		new Setting(containerEl)
// 			.setName("Example Codeblock Parameter String")
// 			.setDesc("Parameters and language which would follow codeblock delimiter.")
// 			.setClass("code-styler-setting-text-wide")
// 			.addText(text => text
// 				.setPlaceholder(EXAMPLE_CODEBLOCK_PARAMETERS)
// 				.setValue(this.plugin.settings.exampleCodeblockParameters)
// 				.onChange((value) => {
// 					this.plugin.settings.exampleCodeblockParameters = value;
// 					this.saveSettings();
// 					this.generateExampleCodeblock();
// 				}));
// 		new Setting(containerEl)
// 			.setName("Example Codeblock Parameter String")
// 			.setDesc("Content for example codeblock.")
// 			.setClass("code-styler-setting-text-area")
// 			.addTextArea(textArea => textArea
// 				.setValue(this.plugin.settings.exampleCodeblockContent)
// 				.setPlaceholder(EXAMPLE_CODEBLOCK_CONTENT)
// 				.onChange((value)=>{
// 					this.plugin.settings.exampleCodeblockContent = value;
// 					this.saveSettings();
// 					this.generateExampleCodeblock();
// 				}));
// 	}
// 	generateExampleCodeblock() {
// 		this.exampleCodeblockContainer.empty();
// 		const codeblockString = "```````"+this.plugin.settings.exampleCodeblockParameters+"\n"+this.plugin.settings.exampleCodeblockContent+"\n```````";
// 		MarkdownRenderer.render(this.plugin.app,codeblockString,this.exampleCodeblockContainer,SETTINGS_SOURCEPATH_PREFIX+codeblockString,this.plugin);
// 		this.exampleCodeblockContainer.querySelector("pre > button.copy-code-button")?.classList?.add("code-styler-settings-button");
// 	}
// 	generateExampleInlineCodeSettings(containerEl: HTMLElement) {
// 		new Setting(containerEl)
// 			.setName("Inline Code Example")
// 			.setDesc("Text to render as example inside code delimiters.")
// 			.setClass("code-styler-setting-text-wide")
// 			.addText(text => text
// 				.setPlaceholder(EXAMPLE_INLINE_CODE)
// 				.setValue(this.plugin.settings.exampleInlineCode)
// 				.onChange((value) => {
// 					this.plugin.settings.exampleInlineCode = value;
// 					this.saveSettings();
// 					this.generateExampleInlineCode();
// 				}));
// 	}
// 	generateExampleInlineCode() {
// 		this.exampleInlineCodeContainer.empty();
// 		MarkdownRenderer.render(this.plugin.app,"`"+this.plugin.settings.exampleInlineCode+"`",this.exampleInlineCodeContainer,SETTINGS_SOURCEPATH_PREFIX,this.plugin);
// 		this.exampleInlineCodeContainer.querySelector("code")?.classList?.add("code-styler-settings-inline-code");
// 	}
// 	generateDonationFooter(containerEl: HTMLElement) {
// 		containerEl.createEl("hr");
// 		const donationDiv = containerEl.createEl("div", { cls: "code-styler-donation", });
// 		const donationText = createEl("p", {text: "If you like this plugin, and would like to help support continued development, use the button below!"});
// 		donationDiv.appendChild(donationText);
// 		const donationButton = createEl("a", { href: "https://www.buymeacoffee.com/mayurankv"});
// 		donationButton.innerHTML = "<img src=\"https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=mayurankv&button_colour=e3e7efa0&font_colour=262626&font_family=Inter&outline_colour=262626&coffee_colour=a0522d\" height=\"42px\">";
// 		donationDiv.appendChild(donationButton);
// 	}

// 	// Create Settings
// 	createPickr(plugin: CodeStylerPlugin, containerEl: HTMLElement, setting: Setting, id: string, getRelevantThemeColour: (relevantThemeColours: CodeStylerThemeColours)=>Colour, saveRelevantThemeColour: (relevantThemeColours: CodeStylerThemeColours, saveColour: Colour)=>void, disabled?: ()=>boolean) {
// 		const pickr: PickrResettable = new PickrResettable(plugin,containerEl,setting,getRelevantThemeColour,saveRelevantThemeColour);
// 		pickr
// 			.on("show", (colour: Pickr.HSVaColor, instance: Pickr) => {
// 				if (typeof disabled !== "undefined" && disabled())
// 					instance.hide();
// 				// requestAnimationFrame(() => requestAnimationFrame(() => (instance.getRoot() as any).interaction.result.select()))
// 			})
// 			.on("save", (colour: Pickr.HSVaColor, instance: PickrResettable) => {
// 				const savedColour: Colour = `#${colour.toHEXA().toString().substring(1)}`;
// 				instance.hide();
// 				instance.addSwatch(savedColour);
// 				instance.saveColour(savedColour);
// 			})
// 			.on("cancel", (instance: PickrResettable) => {instance.hide();});
// 		setting.addExtraButton((button) => {pickr.resetButton = button
// 			.setIcon("reset")
// 			.setDisabled(typeof disabled !== "undefined" && disabled())
// 			.setTooltip("Restore default colour")
// 			.onClick(() => {pickr.resetColour();});
// 		});
// 		this.pickrs[id]=pickr;
// 	}

// 	// Update Settings
// 	saveSettings(rerender: boolean=false) {
// 		(async () => {await this.plugin.saveSettings();})();
// 		if (rerender)
// 			this.rerender();
// 	}
// 	rerender() {
// 		this.plugin.renderReadingView();
// 		if (this.page === "codeblock")
// 			this.generateExampleCodeblock();
// 		else if (this.page === "inline")
// 			this.generateExampleInlineCode();
// 	}
// 	updateDropdown(dropdown: DropdownComponent, settings: CodeStylerSettings) {
// 		dropdown.selectEl.empty();
// 		Object.keys(settings.themes).forEach((theme_name: string) => {
// 			dropdown.addOption(theme_name, theme_name);
// 		});
// 		dropdown.setValue(settings.selectedTheme);
// 	}
// 	updateAlternativeHighlights() {
// 		if (this.page !== "codeblock" || this.codeblockPage !== "highlight")
// 			return;
// 		this.alternativeHighlightsContainer.empty();
// 		Object.keys(this.plugin.settings.currentTheme.colours.light.highlights.alternativeHighlights).forEach((alternativeHighlightName) => {
// 			new Setting(this.alternativeHighlightsContainer)
// 				.setName(alternativeHighlightName)
// 				.setDesc(`To highlight lines with this highlight, use the ${alternativeHighlightName} parameter.`)
// 				.then((setting) => {
// 					this.createPickr(
// 						this.plugin,this.alternativeHighlightsContainer,setting,
// 						`alternative_highlight_${alternativeHighlightName}`,
// 						(relevantThemeColours: CodeStylerThemeColours) => alternativeHighlightName in relevantThemeColours.light.highlights.alternativeHighlights?relevantThemeColours[getCurrentMode()].highlights.alternativeHighlights[alternativeHighlightName]:this.plugin.settings.currentTheme.colours[getCurrentMode()].highlights.alternativeHighlights[alternativeHighlightName],
// 						(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].highlights.alternativeHighlights[alternativeHighlightName] = saveColour;},
// 					);
// 					setting.addExtraButton((button) => {button
// 						.setIcon("trash")
// 						.setTooltip("Delete highlight")
// 						.onClick(() => {
// 							delete this.plugin.settings.currentTheme.colours.light.highlights.alternativeHighlights[alternativeHighlightName];
// 							delete this.plugin.settings.currentTheme.colours.dark.highlights.alternativeHighlights[alternativeHighlightName];
// 							new Notice(`Removed highlight "${alternativeHighlightName}".`); //NOSONAR
// 							this.updateAlternativeHighlights();
// 							this.saveSettings();
// 						});
// 					});
// 				});
// 		});
// 	}
// 	redirectLanguages() {
// 		Object.entries(this.plugin.settings.redirectLanguages).forEach(([languageName, languageSettings]: [string, {colour?: Colour, icon?: string}])=>{
// 			if ("icon" in languageSettings) {
// 				if (LANGUAGE_NAMES[languageName] in this.plugin.languageIcons)
// 					URL.revokeObjectURL(this.plugin.languageIcons[LANGUAGE_NAMES[languageName]]);
// 				this.plugin.languageIcons[LANGUAGE_NAMES[languageName]] = URL.createObjectURL(new Blob([`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32">${languageSettings.icon}</svg>`], { type: "image/svg+xml" }));
// 			}
// 		});
// 	}
// }

// // Extend Pickr Class
// class PickrResettable extends Pickr {
// 	saveColour: (saveColour: Colour)=>void;
// 	resetColour: ()=>void;
// 	getCurrentColour: (accessTheme: boolean)=>void;
// 	resetButton: ExtraButtonComponent;

// 	constructor(plugin: CodeStylerPlugin, containerEl: HTMLElement, setting: Setting, getRelevantThemeColour: (relevantThemeColours: CodeStylerThemeColours)=>Colour, saveRelevantThemeColour: (relevantThemeColours: CodeStylerThemeColours, saveColour: Colour)=>void, tooltip?: string) {
// 		const settings: Pickr.Options = {
// 			el: setting.controlEl.createDiv({cls: "picker"}),
// 			theme: "nano",
// 			default: getColour(getRelevantThemeColour(plugin.settings.currentTheme.colours)),
// 			position: "left-middle",
// 			lockOpacity: false,
// 			components: {
// 				preview: true,
// 				hue: true,
// 				opacity: true,
// 				interaction: {
// 					hex: true,
// 					rgba: true,
// 					hsla: false,
// 					input: true,
// 					cancel: true,
// 					save: true,
// 				},
// 			},
// 			i18n: {
// 				"ui:dialog": "Colour picker dialog",
// 				"btn:toggle": (typeof tooltip !== "undefined")?tooltip:"Select colour",
// 				"btn:swatch": "Colour swatch",
// 				"btn:last-color": "Use previous colour",
// 			}
// 		};
// 		if (containerEl.parentElement !== null)
// 			settings.container = containerEl.parentElement;
// 		super(settings);
// 		this.saveColour = (saveColour: Colour) => {
// 			saveRelevantThemeColour(plugin.settings.currentTheme.colours,saveColour);
// 			(async () => {await plugin.saveSettings();})();
// 		};
// 		this.resetColour = () => {
// 			const resetColour: Colour = getRelevantThemeColour(plugin.settings.themes[plugin.settings.selectedTheme].colours);
// 			this.setColor(getColour(resetColour));
// 			this.saveColour(resetColour);
// 		};
// 	}
// }

// // Colour Management
// function getRandomColour(): Colour {
// 	const letters = "0123456789ABCDEF";
// 	let colour = "";
// 	for (let i = 0; i < 6; i++)
// 		colour += letters[Math.floor(Math.random() * 16)];
// 	return `#${colour}FF`;
// }

// // Fetch Settings
// function getCurrentMode() {
// 	const body = document.querySelector("body");
// 	if (body !== null){
// 		if (body.classList.contains("theme-light"))
// 			return "light";
// 		else if (body.classList.contains("theme-dark"))
// 			return "dark";
// 	}
// 	console.warn("Warning: Couldn't get current theme");
// 	return "light";
// }
