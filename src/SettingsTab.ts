import { App, PluginSettingTab, Setting, Notice, TextComponent, DropdownComponent, SliderComponent, ToggleComponent, ExtraButtonComponent } from "obsidian";
import Pickr from "@simonwep/pickr";
import { ColorTranslator } from "colortranslator";

import CodeStylerPlugin from "./main";
import { Colour, CSS, HEX, Display, CodeStylerSettings, CodeStylerThemeColours, PARAMETERS, DEFAULT_SETTINGS, LANGUAGE_NAMES, LANGUAGE_ICONS_DATA } from './Settings';

const DISPLAY_OPTIONS: Record<Display,string> = {
	"none": "Never",
	"if_header_shown": "If Header Shown",
	"always": "Always",
}

export class SettingsTab extends PluginSettingTab {
	plugin: CodeStylerPlugin;
	pickrs: Record<string,PickrResettable>;
	disableableComponents: Record<string,Array<ToggleComponent | SliderComponent | TextComponent | ExtraButtonComponent>>

	constructor(app: App, plugin: CodeStylerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.pickrs = {}
		this.disableableComponents = {};
	}

	/**
	 *  Builds the html page that is showed in the settings.
	 */
	display() {
		const {containerEl} = this;
		containerEl.empty();
		containerEl.createEl('h2', {text: 'Settings for the Code Styler Plugin.'});

		this.disableableComponents = {
			'lineNumbers': [],
			'wrapLines': [],
			'headerLanguageTags': [],
			'headerLanguageIcons': [],
			'editorActiveLineHighlight': [],
			'codeblockActiveLineHighlight': [],
			'gradientHighlighting': [],
			'languageBorderColour': [],
		};

		// ========== General ==========

		new Setting(containerEl)
			.setName('Ignore Codeblocks')
			.setDesc('Define languages in a comma separated list which the plugin should completely ignore. You can use a wildcard (*) either at the beginning, or at the end. For example: ad-* will exclude codeblocks where the language starts with ad- e.g.: ad-info, ad-error etc.')
			.addText(text => text
				.setPlaceholder('e.g. dataview, dataviewjs etc.')
				.setValue(this.plugin.settings.excludedCodeblocks)
				.onChange((value) => {
					this.plugin.settings.excludedCodeblocks = value;
					(async () => {await this.plugin.saveSettings()})();
				}));
		new Setting(containerEl)
			.setName('Exclude Languages')
			.setDesc('Define languages in a comma separated list which the plugin should not decorate. You can use a wildcard (*) either at the beginning, or at the end. For example: ad-* will exclude codeblocks where the language starts with ad- e.g.: ad-info, ad-error etc.')
			.addText(text => text
				.setPlaceholder('e.g. ad-*, python etc.')
				.setValue(this.plugin.settings.excludedLanguages)
				.onChange((value) => {
					this.plugin.settings.excludedLanguages = value;
					(async () => {await this.plugin.saveSettings()})();
				}));
		new Setting(containerEl)
			.setName('Style Code on Export')
			.setDesc('If enabled, styling will be applied when exporting to PDF.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.decoratePrint)
				.onChange((value) => {
					this.plugin.settings.decoratePrint = value;
					(async () => {await this.plugin.saveSettings()})();         
				}));

		// ========== Themes ==========
		containerEl.createEl('h3', {text: 'Theme Settings'});

		let themeDropdown: DropdownComponent;
		new Setting(containerEl)
			.setName("Select Theme")
			.addDropdown((dropdown) => {
				themeDropdown = dropdown;
				this.updateDropdown(themeDropdown,this.plugin.settings);
				themeDropdown.onChange((value) => {
					this.plugin.settings.selectedTheme = value;
					this.plugin.settings.currentTheme = structuredClone(this.plugin.settings.themes[this.plugin.settings.selectedTheme])
					this.display();
					(async () => {await this.plugin.saveSettings()})();
				});
			})
			.addExtraButton(button => {
				button.setTooltip("Update theme");
				button.setIcon('save');
				button.onClick(() => {
					if (this.plugin.settings.selectedTheme in DEFAULT_SETTINGS.themes)
						new Notice('You cannot update the default themes'); //NOSONAR
					else {
						this.plugin.settings.themes[this.plugin.settings.selectedTheme] = structuredClone(this.plugin.settings.currentTheme);
						this.updateAlternativeHighlights(alternativeHighlightsContainer);
						new Notice(`${this.plugin.settings.selectedTheme} theme saved successfully!`); //NOSONAR
						(async () => {await this.plugin.saveSettings()})();
					}
				});
			})
			.addExtraButton(button => {
				button.setTooltip("Delete theme");
				button.setIcon('trash');
				button.onClick(() => {
					if (this.plugin.settings.selectedTheme.trim().length === 0)
						new Notice('Select a theme first to delete'); //NOSONAR
					else if (this.plugin.settings.selectedTheme in DEFAULT_SETTINGS.themes)
						new Notice('You cannot delete the default themes'); //NOSONAR
					else {
						delete this.plugin.settings.themes[this.plugin.settings.selectedTheme]
						new Notice(`${this.plugin.settings.selectedTheme} theme deleted successfully!`); //NOSONAR
						this.plugin.settings.selectedTheme = "Default";
						this.plugin.settings.currentTheme = structuredClone(this.plugin.settings.themes[this.plugin.settings.selectedTheme])
						this.updateDropdown(themeDropdown,this.plugin.settings);
						this.display();
						(async () => {await this.plugin.saveSettings()})();
					}
				});
			});
		let newThemeName: TextComponent;
		let newThemeDefault: ToggleComponent;
		this.plugin.settings.newTheme = '';
		new Setting(containerEl)
			.setName('Add New Theme')
			.setDesc('Create a new theme from the current settings.')
			.addText(text => {newThemeName = text
				.setPlaceholder('New theme name')
				.setValue(this.plugin.settings.newTheme)
				.onChange((value) => {
					this.plugin.settings.newTheme = value;
				});
			})
			.addExtraButton(button => {
				button.setTooltip("Save theme");
				button.setIcon('plus');
				button.onClick(() => {
					if (this.plugin.settings.newTheme.trim().length === 0)
						new Notice('Set a name for your theme'); //NOSONAR
					else if (this.plugin.settings.newTheme in DEFAULT_SETTINGS.themes)
						new Notice('You can\'t overwrite the default themes'); //NOSONAR
					else {
						if (this.plugin.settings.newTheme in this.plugin.settings.themes) {
							this.plugin.settings.themes[this.plugin.settings.newTheme] = structuredClone(this.plugin.settings.currentTheme);
							new Notice(`${this.plugin.settings.newTheme} theme updated successfully!`); //NOSONAR
						} else {
							this.plugin.settings.themes[this.plugin.settings.newTheme] = structuredClone(this.plugin.settings.currentTheme);
							new Notice(`${this.plugin.settings.newTheme} theme saved successfully!`); //NOSONAR
						}
						this.plugin.settings.selectedTheme = this.plugin.settings.newTheme;
						this.updateDropdown(themeDropdown,this.plugin.settings);
						this.updateAlternativeHighlights(alternativeHighlightsContainer);
						this.plugin.settings.newTheme = '';
						newThemeName.setValue("");
						newThemeDefault.setValue(false);
						(async () => {await this.plugin.saveSettings()})();
					}
				});
			});
		
		containerEl.createEl('h4', {text: 'Codeblock Appearance'});
		new Setting(containerEl)
			.setName('Codeblock Background Colour')
			.then((setting) => {this.createPickr(
				this.plugin,containerEl,setting,
				'codeblock_background',
				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].codeblock.backgroundColour,
				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].codeblock.backgroundColour = saveColour},
			)});
		new Setting(containerEl)
			.setName('Codeblock Text Colour')
			.then((setting) => {this.createPickr(
				this.plugin,containerEl,setting,
				'codeblock_text',
				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].codeblock.textColour,
				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].codeblock.textColour = saveColour},
			)});
		new Setting(containerEl)
			.setName('Unwrap codeblock lines')
			.setDesc('Choose whether to unwrap lines in reading mode')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.currentTheme.settings.codeblock.unwrapLines)
				.onChange((value) => {
					this.plugin.settings.currentTheme.settings.codeblock.unwrapLines = value;
					this.disableableComponents['wrapLines'].forEach(component => {component.setDisabled(!value)});
					(async () => {await this.plugin.saveSettings()})();    
				}));
		new Setting(containerEl)
			.setName('Codeblock Curvature')
			.setDesc('Determines how rounded the codeblocks appear in pixels.')
			.then((setting) => {
				let resettableSlider: SliderComponent;
				setting.addSlider((slider) => {resettableSlider = slider
					.setLimits(0,25,1)
					.setValue(this.plugin.settings.currentTheme.settings.codeblock.curvature)
					.setDynamicTooltip()
					.onChange((value) => {
						this.plugin.settings.currentTheme.settings.codeblock.curvature = value;
						(async () => {await this.plugin.saveSettings()})();    
					});
				});
				setting.addExtraButton((button) => {button
					.setIcon("reset")
					.setTooltip('Restore default curvature')
					.onClick(() => {
						this.plugin.settings.currentTheme.settings.codeblock.curvature = this.plugin.settings.themes[this.plugin.settings.selectedTheme].settings.codeblock.curvature;
						resettableSlider.setValue(this.plugin.settings.currentTheme.settings.codeblock.curvature);
						(async () => {await this.plugin.saveSettings()})();
					});
				});
			});
			
		containerEl.createEl('h4', {text: 'Gutter Appearance'});
		new Setting(containerEl)
			.setName('Enable Line Numbers')
			.setDesc('If disabled, the below settings are disabled too.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.currentTheme.settings.codeblock.lineNumbers)
				.onChange((value) => {
					this.plugin.settings.currentTheme.settings.codeblock.lineNumbers = value;
					this.disableableComponents['lineNumbers'].forEach(component => {component.setDisabled(!value)});
					(async () => {await this.plugin.saveSettings()})();         
				}));
		new Setting(containerEl)
			.setName('Gutter Background Colour')
			.then((setting) => {this.createPickr(
				this.plugin,containerEl,setting,
				'gutter_background',
				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].gutter.backgroundColour,
				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].gutter.backgroundColour = saveColour},
				() => !this.plugin.settings.currentTheme.settings.codeblock.lineNumbers,
			)});
		this.disableableComponents['lineNumbers'].push(this.pickrs['gutter_background'].resetButton);
		new Setting(containerEl)
			.setName('Line Number Colour')
			.then((setting) => {this.createPickr(
				this.plugin,containerEl,setting,
				'line_number',
				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].gutter.textColour,
				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].gutter.textColour = saveColour},
				() => !this.plugin.settings.currentTheme.settings.codeblock.lineNumbers,
			)});
		this.disableableComponents['lineNumbers'].push(this.pickrs['line_number'].resetButton);
		new Setting(containerEl)
			.setName('Highlight Line Numbers')
			.setDesc('If enabled, highlights will also highlight the line numbers.')
			.addToggle(toggle => {let highlightLineNumbersToggle = toggle
				.setValue(this.plugin.settings.currentTheme.settings.gutter.highlight)
				.setDisabled(!this.plugin.settings.currentTheme.settings.codeblock.lineNumbers)
				.onChange((value) => {
					this.plugin.settings.currentTheme.settings.gutter.highlight = value;
					(async () => {await this.plugin.saveSettings()})();
				})
				this.disableableComponents['lineNumbers'].push(highlightLineNumbersToggle);
			});
		new Setting(containerEl)
			.setName('Indicate Current Line Number')
			.setDesc('If enabled, the current line number in codeblocks will be indicated with a separate colour.')
			.setClass('code-styler-spaced')
			.addToggle(toggle => {let indicateCurrentLineNumberToggle = toggle
				.setValue(this.plugin.settings.currentTheme.settings.gutter.activeLine)
				.setDisabled(!this.plugin.settings.currentTheme.settings.codeblock.lineNumbers)
				.onChange((value) => {
					this.plugin.settings.currentTheme.settings.gutter.activeLine = value;
					(async () => {await this.plugin.saveSettings()})();
				})
				this.disableableComponents['lineNumbers'].push(indicateCurrentLineNumberToggle);
			})
			.then((setting) => {this.createPickr(
				this.plugin,containerEl,setting,
				'active_line_number',
				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].gutter.activeTextColour,
				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].gutter.activeTextColour = saveColour},
				() => !this.plugin.settings.currentTheme.settings.codeblock.lineNumbers,
			)});
		
		containerEl.createEl('h4', {text: 'Header Appearance'});
		new Setting(containerEl)
			.setName('Header Background Colour')
			.then((setting) => {this.createPickr(
				this.plugin,containerEl,setting,
				'header_background',
				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].header.backgroundColour,
				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].header.backgroundColour = saveColour},
			)});
		new Setting(containerEl)
			.setName('Header Font Size')
			.setDesc('Set the font size for header language tags and titles.')
			.then((setting) => {
				let resettableSlider: SliderComponent;
				setting.addSlider((slider) => {resettableSlider = slider
					.setLimits(6,32,1)
					.setValue(this.plugin.settings.currentTheme.settings.header.fontSize)
					.setDynamicTooltip()
					.onChange((value) => {
						this.plugin.settings.currentTheme.settings.header.fontSize = value;
						(async () => {await this.plugin.saveSettings()})();    
					})
				});
				setting.addExtraButton((button) => {button
					.setIcon("reset")
					.setTooltip('Restore default font size')
					.onClick(() => {
						this.plugin.settings.currentTheme.settings.header.fontSize = this.plugin.settings.themes[this.plugin.settings.selectedTheme].settings.header.fontSize;
						resettableSlider.setValue(this.plugin.settings.currentTheme.settings.header.fontSize);
						(async () => {await this.plugin.saveSettings()})();
					});
				})
			})
		new Setting(containerEl)
			.setName('Header Title Text Styling')
			.setDesc('Style the header title text using bold and italic toggles, by setting a font or by setting a text colour.')
			.addToggle(toggle => {toggle
				.setTooltip("Toggle bold title text")
				.setValue(this.plugin.settings.currentTheme.settings.header.title.textBold)
				.onChange((value) => {
					this.plugin.settings.currentTheme.settings.header.title.textBold = value;
					(async () => {await this.plugin.saveSettings()})();
				});
			})
			.addToggle(toggle => {toggle
				.setTooltip("Toggle italic title text")
				.setValue(this.plugin.settings.currentTheme.settings.header.title.textItalic)
				.onChange((value) => {
					this.plugin.settings.currentTheme.settings.header.title.textItalic = value;
					(async () => {await this.plugin.saveSettings()})();
				});
			})
			.addText(text => {text
				.setPlaceholder('Font')
				.setValue(this.plugin.settings.currentTheme.settings.header.title.textFont)
				.onChange((value) => {
					this.plugin.settings.currentTheme.settings.header.title.textFont = value;
					(async () => {await this.plugin.saveSettings()})();
				});
			})
			.then((setting) => {this.createPickr(
				this.plugin,containerEl,setting,
				'header_title_text',
				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].header.title.textColour,
				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].header.title.textColour = saveColour},
			)});
		new Setting(containerEl)
			.setName('Collapse Placeholder Text')
			.setDesc('Title placeholder text for collapsed code when no title parameter is set.')
			.addText(text => text
				.setPlaceholder('Collapsed Code')
				.setValue(this.plugin.settings.currentTheme.settings.header.collapsePlaceholder)
				.onChange((value) => {
					this.plugin.settings.currentTheme.settings.header.collapsePlaceholder = value;
					(async () => {await this.plugin.saveSettings()})();
				}));
		new Setting(containerEl)
			.setName('Header Separator Colour')
			.setDesc('Colour of the line separating the codeblock header and the codeblock.')
			.then((setting) => {this.createPickr(
				this.plugin,containerEl,setting,
				'header_separator',
				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].header.lineColour,
				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].header.lineColour = saveColour},
			)});
			
		containerEl.createEl('h5', {text: 'Header Language Tag Appearance'});
		new Setting(containerEl)
			.setName('Display Header Language Tags')
			.setDesc('Determine when to show language tags in the header. "Title Only" will only show language tags when the title parameter is set. If set to "None", the below settings are disabled too.')
			.addDropdown((dropdown) => dropdown
				.addOptions(DISPLAY_OPTIONS)
				.setValue(this.plugin.settings.currentTheme.settings.header.languageTag.display)
				.onChange((value: Display) => {
					this.plugin.settings.currentTheme.settings.header.languageTag.display = value;
					this.disableableComponents['headerLanguageTags'].forEach(component => {component.setDisabled(value==="none")});
					(async () => {await this.plugin.saveSettings()})();
				}));
		new Setting(containerEl)
			.setName('Header Language Tag Background Colour')
			.then((setting) => {this.createPickr(
				this.plugin,containerEl,setting,
				'header_language_tag_background',
				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].header.languageTag.backgroundColour,
				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].header.languageTag.backgroundColour = saveColour},
				() => this.plugin.settings.currentTheme.settings.header.languageTag.display === 'none',
			)});
		this.disableableComponents['headerLanguageTags'].push(this.pickrs['header_language_tag_background'].resetButton);
		let languageTagsBoldToggle: ToggleComponent;
		let languageTagsItalicToggle: ToggleComponent;
		let languageIconsFontText: TextComponent;
		new Setting(containerEl)
			.setName('Header Language Tag Text Styling')
			.setDesc('Style the header language tag text using bold and italic toggles, by setting a font or by setting a text colour.')
			.addToggle(toggle => {languageTagsBoldToggle = toggle
				.setTooltip("Toggle bold language tag text")
				.setValue(this.plugin.settings.currentTheme.settings.header.languageTag.textBold)
				.setDisabled(this.plugin.settings.currentTheme.settings.header.languageTag.display==="none")
				.onChange((value) => {
					this.plugin.settings.currentTheme.settings.header.languageTag.textBold = value;
					(async () => {await this.plugin.saveSettings()})();
				});
				this.disableableComponents['headerLanguageTags'].push(languageTagsBoldToggle);
			})
			.addToggle(toggle => {languageTagsItalicToggle = toggle
				.setTooltip("Toggle italic language tag text")
				.setValue(this.plugin.settings.currentTheme.settings.header.languageTag.textItalic)
				.setDisabled(this.plugin.settings.currentTheme.settings.header.languageTag.display==="none")
				.onChange((value) => {
					this.plugin.settings.currentTheme.settings.header.languageTag.textItalic = value;
					(async () => {await this.plugin.saveSettings()})();
				});
				this.disableableComponents['headerLanguageTags'].push(languageTagsItalicToggle);
			})
			.addText(text => {languageIconsFontText = text
				.setPlaceholder('Font')
				.setValue(this.plugin.settings.currentTheme.settings.header.languageTag.textFont)
				.setDisabled(this.plugin.settings.currentTheme.settings.header.languageTag.display==="none")
				.onChange((value) => {
					this.plugin.settings.currentTheme.settings.header.languageTag.textFont = value;
					(async () => {await this.plugin.saveSettings()})();
				});
				this.disableableComponents['headerLanguageTags'].push(languageIconsFontText);
			})
			.then((setting) => {this.createPickr(
				this.plugin,containerEl,setting,
				'header_language_tag_text',
				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].header.languageTag.textColour,
				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].header.languageTag.textColour = saveColour},
				() => this.plugin.settings.currentTheme.settings.header.languageTag.display === 'none',
			)});
		this.disableableComponents['headerLanguageTags'].push(this.pickrs['header_language_tag_text'].resetButton);
		
		containerEl.createEl('h5', {text: 'Header Language Icon Appearance'});
		new Setting(containerEl)
			.setName('Display Header Language Icons')
			.setDesc('Determine when to show language icons where available. "Title Only" will only show language tags when the title parameter is set. If set to "None", the below settings are disabled too.')
			.addDropdown((dropdown) => dropdown
				.addOptions(DISPLAY_OPTIONS)
				.setValue(this.plugin.settings.currentTheme.settings.header.languageIcon.display)
				.onChange((value: Display) => {
					this.plugin.settings.currentTheme.settings.header.languageIcon.display = value;
					this.disableableComponents['headerLanguageIcons'].forEach(component => {component.setDisabled(value==="none")});
					(async () => {await this.plugin.saveSettings()})();
				}));
		let languageIconsColouredToggle: ToggleComponent;
		new Setting(containerEl)
			.setName('Language Icons Coloured')
			.setDesc('If disabled, language icons will be black and white.')
			.addToggle(toggle => {languageIconsColouredToggle = toggle
				.setValue(this.plugin.settings.currentTheme.settings.header.languageIcon.displayColour)
				.setDisabled(this.plugin.settings.currentTheme.settings.header.languageIcon.display==="none")
				.onChange((value) => {
					this.plugin.settings.currentTheme.settings.header.languageIcon.displayColour = value;
					(async () => {await this.plugin.saveSettings()})();
				})
				this.disableableComponents['headerLanguageIcons'].push(languageIconsColouredToggle);
			});
		new Setting(containerEl)
			.setName('Language Icon Size')
			.setDesc('Set the size of the displayed language icons.')
			.then((setting) => {
				let resettableSlider: SliderComponent;
				setting.addSlider((slider) => {resettableSlider = slider
					.setLimits(10,40,1)
					.setValue(this.plugin.settings.currentTheme.settings.advanced.iconSize)
					.setDisabled(this.plugin.settings.currentTheme.settings.header.languageIcon.display==="none")
					.setDynamicTooltip()
					.onChange((value) => {
						this.plugin.settings.currentTheme.settings.advanced.iconSize = value;
						(async () => {await this.plugin.saveSettings()})();    
					})
					this.disableableComponents['headerLanguageIcons'].push(resettableSlider);
				});
				let resetButton: ExtraButtonComponent;
				setting.addExtraButton((button) => {resetButton = button
					.setIcon("reset")
					.setDisabled(this.plugin.settings.currentTheme.settings.header.languageIcon.display==="none")
					.setTooltip('Restore default icon size')
					.onClick(() => {
						this.plugin.settings.currentTheme.settings.advanced.iconSize = this.plugin.settings.themes[this.plugin.settings.selectedTheme].settings.advanced.iconSize;
						resettableSlider.setValue(this.plugin.settings.currentTheme.settings.advanced.iconSize);
						(async () => {await this.plugin.saveSettings()})();
					});
					this.disableableComponents['headerLanguageIcons'].push(resetButton);
				})
			})
		
		containerEl.createEl('h4', {text: 'Highlighting Appearance'});
		new Setting(containerEl)
			.setName('Editor Active Line Highlight')
			.setDesc('If enabled, highlights the active line outside codeblocks.')
			.setClass('code-styler-spaced')
			.addToggle(toggle => {return toggle
				.setTooltip('Toggle editor active line highlighting')
				.setValue(this.plugin.settings.currentTheme.settings.highlights.activeEditorLine)
				.onChange((value) => {
					this.plugin.settings.currentTheme.settings.highlights.activeEditorLine = value;
					this.disableableComponents['editorActiveLineHighlight'].forEach(component => {component.setDisabled(!value)});
					(async () => {await this.plugin.saveSettings()})();
				});
			})
			.then((setting) => {this.createPickr(
				this.plugin,containerEl,setting,
				'editor_active_line_highlight',
				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].highlights.activeEditorLineColour,
				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].highlights.activeEditorLineColour = saveColour},
				() => !this.plugin.settings.currentTheme.settings.highlights.activeEditorLine,
			)});
		this.disableableComponents['editorActiveLineHighlight'].push(this.pickrs['editor_active_line_highlight'].resetButton);
		new Setting(containerEl)
			.setName('Codeblock Active Line Highlight')
			.setDesc('If enabled, highlights the active line inside codeblocks.')
			.setClass('code-styler-spaced')
			.addToggle(toggle => {return toggle
				.setValue(this.plugin.settings.currentTheme.settings.highlights.activeCodeblockLine)
				.onChange((value) => {
					this.plugin.settings.currentTheme.settings.highlights.activeCodeblockLine = value; 
					this.disableableComponents['codeblockActiveLineHighlight'].forEach(component => {component.setDisabled(!value)});
					(async () => {await this.plugin.saveSettings()})();
				});
			})
			.then((setting) => {this.createPickr(
				this.plugin,containerEl,setting,
				'codeblock_active_line_highlight',
				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].highlights.activeCodeblockLineColour,
				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].highlights.activeCodeblockLineColour = saveColour},
				() => !this.plugin.settings.currentTheme.settings.highlights.activeCodeblockLine,
			)});
		this.disableableComponents['codeblockActiveLineHighlight'].push(this.pickrs['codeblock_active_line_highlight'].resetButton);
		new Setting(containerEl)
			.setName('Default Highlight Colour')
			.setDesc('Used by the \'hl\' parameter.')
			.then((setting) => {this.createPickr(
				this.plugin,containerEl,setting,
				'default_highlight',
				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].highlights.defaultColour,
				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].highlights.defaultColour = saveColour},
			)});
		let newHighlightText: TextComponent;
		new Setting(containerEl)
			.setName("Add Alternative Highlight")
			.setDesc('Define a new alternative highlight name. The colour can be modified after it is added.')
			.addText(value => {newHighlightText = value
				.setPlaceholder('e.g. error, warn')
				.onChange((value) => {
					this.plugin.settings.newHighlight = value;
				});
			})
			.addButton((button) => {
				button.setButtonText("Add");
				button.onClick(() => {
					if (this.plugin.settings.newHighlight.trim() === "")
						new Notice("Please enter a colour name."); //NOSONAR
					else if (!/^[^\d]\w*$/.test(this.plugin.settings.newHighlight))
						new Notice(`"${this.plugin.settings.newHighlight}" is not a valid colour name.`); //NOSONAR
					else if (this.plugin.settings.newHighlight.trim().toLowerCase() === 'hl')
						new Notice("Cannot override the default highlight parameter."); //NOSONAR
					else if (PARAMETERS.includes(this.plugin.settings.newHighlight.trim().toLowerCase()))
						new Notice("Cannot use other default parameters."); //NOSONAR
					else {
						if (this.plugin.settings.newHighlight in this.plugin.settings.currentTheme.colours.light.highlights.alternativeHighlights)
							new Notice(`A highlight with the name "${this.plugin.settings.newHighlight}" already exists.`); //NOSONAR
							//todo (@mayurankv) Future: Focus on existing highlighter
						else {
							const newColour = getRandomColour();
							this.plugin.settings.currentTheme.colours.light.highlights.alternativeHighlights[this.plugin.settings.newHighlight] = newColour;
							this.plugin.settings.currentTheme.colours.dark.highlights.alternativeHighlights[this.plugin.settings.newHighlight] = newColour;
							this.updateAlternativeHighlights(alternativeHighlightsContainer);
							new Notice(`Added highlight "${this.plugin.settings.newHighlight}".`); //NOSONAR
							this.plugin.settings.newHighlight = "";
							newHighlightText.setValue("");
							(async () => {await this.plugin.saveSettings()})();
						}
					}
				});
			});
		const alternativeHighlightsContainer = containerEl.createDiv();
		this.updateAlternativeHighlights(alternativeHighlightsContainer);

		containerEl.createEl('h4', {text: 'Inline Code Appearance'});
		new Setting(containerEl)
			.setName('Syntax Highlight Inline Code')
			.setDesc('If enabled, in reading mode, inline code will be syntax highlighted based on a language set with `{language} highlighted_inline_code`. See the README for more information.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.currentTheme.settings.inline.syntaxHighlight)
				.onChange((value) => {
					this.plugin.settings.currentTheme.settings.inline.syntaxHighlight = value;
					(async () => {await this.plugin.saveSettings()})();    
				}));
		new Setting(containerEl)
			.setName('Inline Code Background Colour')
			.then((setting) => {this.createPickr(
				this.plugin,containerEl,setting,
				'inline_background',
				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].inline.backgroundColour,
				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].inline.backgroundColour = saveColour},
			)});
		new Setting(containerEl)
			.setName('Inline Code Text Colour')
			.then((setting) => {this.createPickr(
				this.plugin,containerEl,setting,
				'inline_text',
				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].inline.textColour,
				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].inline.textColour = saveColour},
			)});
		new Setting(containerEl)
			.setName('Inline Code Active Text Colour')
			.setDesc('The text colour when editing inline code.')
			.then((setting) => {this.createPickr(
				this.plugin,containerEl,setting,
				'inline_active_text',
				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].inline.activeTextColour,
				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].inline.activeTextColour = saveColour},
			)});
		new Setting(containerEl)
			.setName('Inline Code Font Weight')
			.setDesc('Determines how bold inline code appears.')
			.then((setting) => {
				let resettableSlider: SliderComponent;
				setting.addSlider((slider) => {resettableSlider = slider
					.setLimits(1,9,1)
					.setValue(this.plugin.settings.currentTheme.settings.inline.fontWeight)
					.setDynamicTooltip()
					.onChange((value) => {
						this.plugin.settings.currentTheme.settings.inline.fontWeight = value;
						(async () => {await this.plugin.saveSettings()})();    
					});
				});
				setting.addExtraButton((button) => {button
					.setIcon("reset")
					.setTooltip('Restore default font weight')
					.onClick(() => {
						this.plugin.settings.currentTheme.settings.inline.fontWeight = this.plugin.settings.themes[this.plugin.settings.selectedTheme].settings.inline.fontWeight;
						resettableSlider.setValue(this.plugin.settings.currentTheme.settings.inline.fontWeight);
						(async () => {await this.plugin.saveSettings()})();
					});
				});
			});
		new Setting(containerEl)
			.setName('Inline Code Curvature')
			.setDesc('Determines how rounded inline code appear in pixels.')
			.then((setting) => {
				let resettableSlider: SliderComponent;
				setting.addSlider((slider) => {resettableSlider = slider
					.setLimits(0,12,1)
					.setValue(this.plugin.settings.currentTheme.settings.inline.curvature)
					.setDynamicTooltip()
					.onChange((value) => {
						this.plugin.settings.currentTheme.settings.inline.curvature = value;
						(async () => {await this.plugin.saveSettings()})();    
					});
				});
				setting.addExtraButton((button) => {button
					.setIcon("reset")
					.setTooltip('Restore default curvature')
					.onClick(() => {
						this.plugin.settings.currentTheme.settings.inline.curvature = this.plugin.settings.themes[this.plugin.settings.selectedTheme].settings.inline.curvature;
						resettableSlider.setValue(this.plugin.settings.currentTheme.settings.inline.curvature);
						(async () => {await this.plugin.saveSettings()})();
					});
				});
			});
		new Setting(containerEl)
			.setName('Inline Code Vertical Padding')
			.setDesc('Determines how much vertical inner padding in pixels inline code has.')
			.then((setting) => {
				let resettableSlider: SliderComponent;
				setting.addSlider((slider) => {resettableSlider = slider
					.setLimits(0,10,1)
					.setValue(this.plugin.settings.currentTheme.settings.inline.paddingVertical)
					.setDynamicTooltip()
					.onChange((value) => {
						this.plugin.settings.currentTheme.settings.inline.paddingVertical = value;
						(async () => {await this.plugin.saveSettings()})();    
					});
				});
				setting.addExtraButton((button) => {button
					.setIcon("reset")
					.setTooltip('Restore default vertical padding')
					.onClick(() => {
						this.plugin.settings.currentTheme.settings.inline.paddingVertical = this.plugin.settings.themes[this.plugin.settings.selectedTheme].settings.inline.paddingVertical;
						resettableSlider.setValue(this.plugin.settings.currentTheme.settings.inline.paddingVertical);
						(async () => {await this.plugin.saveSettings()})();
					});
				});
			});
		new Setting(containerEl)
			.setName('Inline Code Horizontal Padding')
			.setDesc('Determines how much horizontal inner padding in pixels inline code has.')
			.then((setting) => {
				let resettableSlider: SliderComponent;
				setting.addSlider((slider) => {resettableSlider = slider
					.setLimits(0,10,1)
					.setValue(this.plugin.settings.currentTheme.settings.inline.paddingHorizontal)
					.setDynamicTooltip()
					.onChange((value) => {
						this.plugin.settings.currentTheme.settings.inline.paddingHorizontal = value;
						(async () => {await this.plugin.saveSettings()})();    
					});
				});
				setting.addExtraButton((button) => {button
					.setIcon("reset")
					.setTooltip('Restore default horizontal padding')
					.onClick(() => {
						this.plugin.settings.currentTheme.settings.inline.paddingHorizontal = this.plugin.settings.themes[this.plugin.settings.selectedTheme].settings.inline.paddingHorizontal;
						resettableSlider.setValue(this.plugin.settings.currentTheme.settings.inline.paddingHorizontal);
						(async () => {await this.plugin.saveSettings()})();
					});
				});
			});
		new Setting(containerEl)
			.setName('Inline Code Horizontal Margin')
			.setDesc('Determines how much horizontal outer margin is added to the inline code in pixels.')
			.then((setting) => {
				let resettableSlider: SliderComponent;
				setting.addSlider((slider) => {resettableSlider = slider
					.setLimits(0,8,1)
					.setValue(this.plugin.settings.currentTheme.settings.inline.marginHorizontal)
					.setDynamicTooltip()
					.onChange((value) => {
						this.plugin.settings.currentTheme.settings.inline.marginHorizontal = value;
						(async () => {await this.plugin.saveSettings()})();    
					});
				});
				setting.addExtraButton((button) => {button
					.setIcon("reset")
					.setTooltip('Restore default horizontal margin')
					.onClick(() => {
						this.plugin.settings.currentTheme.settings.inline.marginHorizontal = this.plugin.settings.themes[this.plugin.settings.selectedTheme].settings.inline.marginHorizontal;
						resettableSlider.setValue(this.plugin.settings.currentTheme.settings.inline.marginHorizontal);
						(async () => {await this.plugin.saveSettings()})();
					});
				});
			});
		new Setting(containerEl)
			.setName('Inline Code Title Colour')
			.setDesc('The text colour of inline code titles.')
			.then((setting) => {this.createPickr(
				this.plugin,containerEl,setting,
				'title_text',
				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].inline.titleTextColour,
				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].inline.titleTextColour = saveColour},
			)});
		new Setting(containerEl)
			.setName('Inline Code Title Font Weight')
			.setDesc('Determines how bold inline code titles appear.')
			.then((setting) => {
				let resettableSlider: SliderComponent;
				setting.addSlider((slider) => {resettableSlider = slider
					.setLimits(1,9,1)
					.setValue(this.plugin.settings.currentTheme.settings.inline.titleFontWeight)
					.setDynamicTooltip()
					.onChange((value) => {
						this.plugin.settings.currentTheme.settings.inline.titleFontWeight = value;
						(async () => {await this.plugin.saveSettings()})();    
					});
				});
				setting.addExtraButton((button) => {button
					.setIcon("reset")
					.setTooltip('Restore default font weight')
					.onClick(() => {
						this.plugin.settings.currentTheme.settings.inline.titleFontWeight = this.plugin.settings.themes[this.plugin.settings.selectedTheme].settings.inline.titleFontWeight;
						resettableSlider.setValue(this.plugin.settings.currentTheme.settings.inline.titleFontWeight);
						(async () => {await this.plugin.saveSettings()})();
					});
				});
			});

		// ========== Advanced ==========
		containerEl.createEl('h3', {text: 'Advanced Settings'});
		

		let wrapLinesActiveToggle: ToggleComponent;
		new Setting(containerEl)
			.setName('Wrap Lines on Click')
			.setDesc('If enabled, in reading mode, holding click on a codeblock will wrap the lines for better visibility. This can only be used if the "Unwrap Lines" setting is enabled.')
			.addToggle(toggle => {wrapLinesActiveToggle = toggle
				.setValue(this.plugin.settings.currentTheme.settings.codeblock.wrapLinesActive)
				.setDisabled(!this.plugin.settings.currentTheme.settings.codeblock.unwrapLines)
				.onChange((value) => {
					this.plugin.settings.currentTheme.settings.codeblock.wrapLinesActive = value;
					(async () => {await this.plugin.saveSettings()})();    
				})
				this.disableableComponents['wrapLines'].push(wrapLinesActiveToggle);
			});
		new Setting(containerEl)
			.setName('Button Colour')
			.setDesc('Used for UI buttons like the copy code button.')
			.then((setting) => {this.createPickr(
				this.plugin,containerEl,setting,
				'default_highlight',
				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].advanced.buttonColour,
				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].advanced.buttonColour = saveColour},
			)});
		new Setting(containerEl)
			.setName('Button Active Colour')
			.setDesc('Colour buttons use when activated.')
			.then((setting) => {this.createPickr(
				this.plugin,containerEl,setting,
				'default_highlight',
				(relevantThemeColours: CodeStylerThemeColours) => relevantThemeColours[getCurrentMode()].advanced.buttonActiveColour,
				(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].advanced.buttonActiveColour = saveColour},
			)});
		new Setting(containerEl)
			.setName('Gradient Highlighting')
			.setDesc('If enabled, highlights fade away to the right. The slider sets the gradient colour stop as a percentage.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.currentTheme.settings.advanced.gradientHighlights)
				.onChange((value) => {
					this.plugin.settings.currentTheme.settings.advanced.gradientHighlights = value;
					this.disableableComponents['gradientHighlighting'].forEach(component => {component.setDisabled(!value)});
					(async () => {await this.plugin.saveSettings()})();
				}))
			.then((setting) => {
				let resettableSlider: SliderComponent;
				setting.addSlider((slider) => {resettableSlider = slider
					.setLimits(0,100,1)
					.setValue(+this.plugin.settings.currentTheme.settings.advanced.gradientHighlightsColourStop.slice(0,-1))
					.setDisabled(!this.plugin.settings.currentTheme.settings.advanced.gradientHighlights)
					.setDynamicTooltip()
					.onChange((value) => {
						this.plugin.settings.currentTheme.settings.advanced.gradientHighlightsColourStop = `${value}%`;
						(async () => {await this.plugin.saveSettings()})();    
					});
					this.disableableComponents['gradientHighlighting'].push(resettableSlider);
				});
				let resetButton: ExtraButtonComponent;
				setting.addExtraButton((button) => {resetButton = button
					.setIcon("reset")
					.setDisabled(!this.plugin.settings.currentTheme.settings.advanced.gradientHighlights)
					.setTooltip('Restore default colour stop')
					.onClick(() => {
						this.plugin.settings.currentTheme.settings.advanced.gradientHighlightsColourStop = this.plugin.settings.themes[this.plugin.settings.selectedTheme].settings.advanced.gradientHighlightsColourStop;
						resettableSlider.setValue(+this.plugin.settings.currentTheme.settings.advanced.gradientHighlightsColourStop.slice(0,-1));
						(async () => {await this.plugin.saveSettings()})();
					});
					this.disableableComponents['gradientHighlighting'].push(resetButton);
				})
			})
		new Setting(containerEl)
			.setName('Language Coloured Borders')
			.setDesc('If enabled, languages with icons display a left border with the colour of the icon. The slider sets the width of the border.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.currentTheme.settings.advanced.languageBorderColour)
				.onChange((value) => {
					this.plugin.settings.currentTheme.settings.advanced.languageBorderColour = value;
					this.disableableComponents['languageBorderColour'].forEach(component => {component.setDisabled(!value)});
					(async () => {await this.plugin.saveSettings()})();
				}))
			.then((setting) => {
				let resettableSlider: SliderComponent;
				setting.addSlider((slider) => {resettableSlider = slider
					.setLimits(0,20,1)
					.setValue(this.plugin.settings.currentTheme.settings.advanced.languageBorderWidth)
					.setDisabled(!this.plugin.settings.currentTheme.settings.advanced.languageBorderColour)
					.setDynamicTooltip()
					.onChange((value) => {
						this.plugin.settings.currentTheme.settings.advanced.languageBorderWidth = value;
						(async () => {await this.plugin.saveSettings()})();    
					});
					this.disableableComponents['languageBorderColour'].push(resettableSlider);
				});
				let resetButton: ExtraButtonComponent;
				setting.addExtraButton((button) => {resetButton = button
					.setIcon("reset")
					.setDisabled(!this.plugin.settings.currentTheme.settings.advanced.languageBorderColour)
					.setTooltip('Restore default colour stop')
					.onClick(() => {
						this.plugin.settings.currentTheme.settings.advanced.languageBorderWidth = this.plugin.settings.themes[this.plugin.settings.selectedTheme].settings.advanced.languageBorderWidth;
						resettableSlider.setValue(this.plugin.settings.currentTheme.settings.advanced.languageBorderWidth);
						(async () => {await this.plugin.saveSettings()})();
					});
					this.disableableComponents['languageBorderColour'].push(resetButton);
				});
			})
		new Setting(containerEl)
			.setName('Redirect Language Settings')
			.setDesc('Use this textbox to redirect specific language colours and icons as a JSON with language names as keys and either a colour key, an icon key or both as the value for a given language. Colours should be passed as CSS colours and icons should be passed as a string of the inside of an svg element. This setting is theme independent.')
			.setClass('code-styler-setting-text-area')
			.addTextArea(textArea => textArea
				.setValue(JSON.stringify(this.plugin.settings.redirectLanguages)==='{}'?'':JSON.stringify(this.plugin.settings.redirectLanguages,null,4))
				.setPlaceholder(JSON.stringify({toml: {colour: '#012345', icon: LANGUAGE_ICONS_DATA['APL']}},null,4))
				.onChange((value)=>{
					if (value === '') {
						this.plugin.settings.redirectLanguages = {};
						(async () => {await this.plugin.saveSettings()})();
					} else {
						try {
							this.plugin.settings.redirectLanguages = JSON.parse(value);
							Object.entries(this.plugin.settings.redirectLanguages).forEach(([languageName, languageSettings]: [string, {colour?: Colour, icon?: string}])=>{
								if ('icon' in languageSettings) {
									if (LANGUAGE_NAMES[languageName] in this.plugin.languageIcons)
										URL.revokeObjectURL(this.plugin.languageIcons[LANGUAGE_NAMES[languageName]]);
									this.plugin.languageIcons[LANGUAGE_NAMES[languageName]] = URL.createObjectURL(new Blob([`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32">${languageSettings.icon}</svg>`], { type: "image/svg+xml" }));
								}
							});
							(async () => {await this.plugin.saveSettings()})();
						} catch {
							new Notice('Invalid JSON'); //NOSONAR
						}
					}
				}));


		// ========== Donation ==========
		const donationDiv = containerEl.createEl("div", { cls: "code-styler-donation", });    
		const donationText = createEl("p", {text: "If you like this plugin, and would like to help support continued development, use the button below!"});
		donationDiv.appendChild(donationText);
		const donationButton = createEl("a", { href: "https://www.buymeacoffee.com/mayurankv2"});
		donationButton.innerHTML = `<img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=mayurankv2&button_colour=e3e7efa0&font_colour=262626&font_family=Inter&outline_colour=262626&coffee_colour=a0522d" height="42px">`;
		donationDiv.appendChild(donationButton);
	}

	// Setting Creation
	createPickr(plugin: CodeStylerPlugin, containerEl: HTMLElement, setting: Setting, id: string, getRelevantThemeColour: (relevantThemeColours: CodeStylerThemeColours)=>Colour, saveRelevantThemeColour: (relevantThemeColours: CodeStylerThemeColours, saveColour: Colour)=>void, disabled?: ()=>boolean) {
		let pickr: PickrResettable = new PickrResettable(plugin,containerEl,setting,getRelevantThemeColour,saveRelevantThemeColour);
		pickr
			.on('show', (colour: Pickr.HSVaColor, instance: Pickr) => {
				if (typeof disabled !== 'undefined' && disabled())
					instance.hide()
				// requestAnimationFrame(() => requestAnimationFrame(() => (instance.getRoot() as any).interaction.result.select()))
			})
			.on('save', (colour: Pickr.HSVaColor, instance: PickrResettable) => {
				const savedColour: Colour = `#${colour.toHEXA().toString().substring(1)}`;
				instance.hide();
				instance.addSwatch(savedColour);
				instance.saveColour(savedColour);
			})
			.on('cancel', (instance: PickrResettable) => {instance.hide()});
		setting.addExtraButton((button) => {pickr.resetButton = button
			.setIcon("reset")
			.setDisabled(typeof disabled !== 'undefined' && disabled())
			.setTooltip('Restore default colour')
			.onClick(() => {pickr.resetColour()});
		});
		this.pickrs[id]=pickr;
	}
	
	// Setting Updates
	updateDropdown(dropdown: DropdownComponent, settings: CodeStylerSettings) {
		dropdown.selectEl.empty();
		Object.keys(settings.themes).forEach((theme_name: string) => {
			dropdown.addOption(theme_name, theme_name);            
		})
		dropdown.setValue(settings.selectedTheme);
	}
	updateAlternativeHighlights(alternativeHighlightsContainer: HTMLDivElement) {
		alternativeHighlightsContainer.empty();
		Object.keys(this.plugin.settings.currentTheme.colours.light.highlights.alternativeHighlights).forEach((alternativeHighlightName) => {
			new Setting(alternativeHighlightsContainer)
				.setName(alternativeHighlightName)
				.setDesc(`To highlight lines with this highlight, use the ${alternativeHighlightName} parameter.`)
				.then((setting) => {
					this.createPickr(
						this.plugin,alternativeHighlightsContainer,setting,
						`alternative_highlight_${alternativeHighlightName}`,
						(relevantThemeColours: CodeStylerThemeColours) => alternativeHighlightName in relevantThemeColours.light.highlights.alternativeHighlights?relevantThemeColours[getCurrentMode()].highlights.alternativeHighlights[alternativeHighlightName]:this.plugin.settings.currentTheme.colours[getCurrentMode()].highlights.alternativeHighlights[alternativeHighlightName],
						(relevantThemeColours: CodeStylerThemeColours, saveColour: Colour) => {relevantThemeColours[getCurrentMode()].highlights.alternativeHighlights[alternativeHighlightName] = saveColour},
					);
					setting.addExtraButton((button) => {button
						.setIcon("trash")
						.setTooltip("Delete highlight")
						.onClick(() => {
							delete this.plugin.settings.currentTheme.colours.light.highlights.alternativeHighlights[alternativeHighlightName]
							delete this.plugin.settings.currentTheme.colours.dark.highlights.alternativeHighlights[alternativeHighlightName]
							new Notice(`Removed highlight "${alternativeHighlightName}".`); //NOSONAR
							this.updateAlternativeHighlights(alternativeHighlightsContainer);
							(async () => {await this.plugin.saveSettings()})();
						});
					});
				});
		});
	}
}

class PickrResettable extends Pickr {
	saveColour: (saveColour: Colour)=>void;
	resetColour: ()=>void;
	getCurrentColour: (accessTheme: boolean)=>void;
	resetButton: ExtraButtonComponent;

	constructor(plugin: CodeStylerPlugin, containerEl: HTMLElement, setting: Setting, getRelevantThemeColour: (relevantThemeColours: CodeStylerThemeColours)=>Colour, saveRelevantThemeColour: (relevantThemeColours: CodeStylerThemeColours, saveColour: Colour)=>void, tooltip?: string) {
		const settings: Pickr.Options = {
			el: setting.controlEl.createDiv({cls: "picker"}),
			theme: 'nano',
			default: getColour(getRelevantThemeColour(plugin.settings.currentTheme.colours)),
			position: "left-middle",
			lockOpacity: false,
			components: {
				preview: true,
				hue: true,
				opacity: true,
				interaction: {
					hex: true,
					rgba: true,
					hsla: false,
					input: true,
					cancel: true,
					save: true,
				},
			},
			i18n: {
				'ui:dialog': 'Colour picker dialog',
				'btn:toggle': (typeof tooltip !== 'undefined')?tooltip:'Select colour',
				'btn:swatch': 'Colour swatch',
				'btn:last-color': 'Use previous colour',
			}
		};
		if (containerEl.parentElement !== null)
			settings.container = containerEl.parentElement;
		super(settings);
		this.saveColour = (saveColour: Colour) => {
			saveRelevantThemeColour(plugin.settings.currentTheme.colours,saveColour);
			(async () => {await plugin.saveSettings()})();
		};
		this.resetColour = () => {
			const resetColour: Colour = getRelevantThemeColour(plugin.settings.themes[plugin.settings.selectedTheme].colours);
			this.setColor(getColour(resetColour));
			this.saveColour(resetColour);
		};
	}
}

// Colour Management
function getRandomColour(): Colour {
	const letters = "0123456789ABCDEF";
	let colour = "";
	for (let i = 0; i < 6; i++)
		colour += letters[Math.floor(Math.random() * 16)];
	return `#${colour}FF`;
}
export function isCss(possibleCss: string): possibleCss is CSS {
	return possibleCss.startsWith('--') && typeof possibleCss === 'string';
}
function calc(calcString: string): string {
	const splitString = calcString.replace(/(\d*)%/g,'$1').split(' ');
	const operators: {[key: string]: (num1:number, num2:number) => number} = {
		'+': (num1:number, num2:number):number => Math.max(num1+num2,0),
		'-': (num1:number ,num2:number):number => Math.max(num1-num2,0),
	}
	if (splitString.length === 3)
		if (splitString[1] in operators)
			return `${operators[splitString[1]](parseFloat(splitString[0]),parseFloat(splitString[2]))}%`
	
	console.warn('Warning: Couldn\'t parse calc string');
	return calcString;
}
function getCssVariable(cssVariable: CSS): HEX {
	let variableValue = window.getComputedStyle(document.body).getPropertyValue(cssVariable).trim();
	if (typeof variableValue === "string" && variableValue.trim().startsWith('#'))
		return `#${variableValue.trim().substring(1)}`;
	else if (variableValue.startsWith('rgb'))
		return `#${ColorTranslator.toHEXA(variableValue.replace(/calc\((.*?)\)/g,(match,capture)=>calc(capture))).substring(1)}`;
	else if (variableValue.startsWith('hsl'))
		return `#${ColorTranslator.toHEXA(variableValue.replace(/calc\((.*?)\)/g,(match,capture)=>calc(capture))).substring(1)}`;
	else
		console.warn(`Warning: Couldn't determine colour format - ${variableValue}`);
	return `#${ColorTranslator.toHEXA(variableValue).substring(1)}`;
}
export function getColour(themeColour: Colour): Colour {
	return isCss(themeColour)?getCssVariable(themeColour):themeColour;;
}

function getCurrentMode() {
	const body = document.querySelector('body');
	if (body !== null){
		if (body.classList.contains('theme-light'))
			return "light";
		else if (body.classList.contains('theme-dark'))
			return "dark";
	}
	console.warn('Warning: Couldn\'t get current theme');
	return "light";
}
