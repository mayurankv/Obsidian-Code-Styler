import { App, PluginSettingTab, Setting, Notice, TextComponent, DropdownComponent, SliderComponent, ToggleComponent, ExtraButtonComponent } from "obsidian";
import Pickr from "@simonwep/pickr";

import CodeblockCustomizerPlugin from "./main";
import { getCurrentMode, getColor } from "./Utils";
import { Color, Display, CodeblockCustomizerSettings, CodeblockCustomizerThemeColors, DEFAULT_SETTINGS, NEW_THEME_DEFAULT } from './Settings';

const DISPLAY_OPTIONS: Record<string,string> = {
  "none": "Never",
  "title_only": "Title Only",
  "always": "Always",
}

export class SettingsTab extends PluginSettingTab {
	plugin: CodeblockCustomizerPlugin;
  pickrs: Array<PickrResettable>;
  disableableComponents: Record<string,Array<ToggleComponent | ExtraButtonComponent | SliderComponent>>

	constructor(app: App, plugin: CodeblockCustomizerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
    this.pickrs = [];
    this.disableableComponents = {
      'lineNumbers': [],
      'headerLanguageTags': [],
      'headerLanguageIcons': [],
      'editorActiveLineHighlight': [],
      'codeblockActiveLineHighlight': [],
      'gradientHighlighting': [],
    };
	}

  /**
	 *  Builds the html page that is showed in the settings.
	 */
	display() {
    const {containerEl} = this;
    containerEl.empty();
    containerEl.createEl('h2', {text: 'Settings for the Codeblock Customizer Plugin.'});

    // ========== General ==========
		//containerEl.createEl('h3', {text: 'General Settings'});

    new Setting(containerEl)
      .setName('Exclude Languages')
      .setDesc('Define languages in a comma separated list on which the plugin should not apply. You can use a wildcard (*) either at the beginning, or at the end. For example: ad-* will exclude codeblocks where the language starts with ad- e.g.: ad-info, ad-error etc.')
      .addText(text => text
        .setPlaceholder('e.g. dataview, python etc.')
        .setValue(this.plugin.settings.excludedLangs)
        .onChange((value) => {
          this.plugin.settings.excludedLangs = value;
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
          this.updatePickrColors();
          this.updateAlternativeHighlights(alternativeHighlightsContainer);
          (async () => {await this.plugin.saveSettings()})();
        });
        ;
      })
      .addExtraButton(button => {
        button.setTooltip("Update theme");
        button.setIcon('arrow-up');
        button.onClick(() => {
          if (this.plugin.settings.selectedTheme in DEFAULT_SETTINGS.themes)
            new Notice('You cannot update the default themes'); //NOSONAR
          else {
            this.plugin.settings.themes[this.plugin.settings.selectedTheme] = structuredClone(this.plugin.settings.currentTheme);
            new Notice(`${this.plugin.settings.selectedTheme} theme saved successfully!`); //NOSONAR
            (async () => {await this.plugin.saveSettings()})();
          }
        });
      })
      .addExtraButton(button => {
        button.setTooltip("Delete theme");
        button.setIcon('trash');
        button.onClick(() => {
          if (this.plugin.settings.selectedTheme.trim().length === 0) {
            new Notice('Select a theme first to delete'); //NOSONAR
          } else if (this.plugin.settings.newTheme.name in DEFAULT_SETTINGS.themes) {
            new Notice('You cannot delete the default themes'); //NOSONAR
          } else {
            if (this.plugin.settings.defaultTheme === this.plugin.settings.selectedTheme)
              this.plugin.settings.defaultTheme = 'Default';
            delete this.plugin.settings.themes[this.plugin.settings.selectedTheme]
            new Notice(`${this.plugin.settings.selectedTheme} theme deleted successfully!`); //NOSONAR
            this.plugin.settings.selectedTheme = "Default";
            this.plugin.settings.currentTheme = structuredClone(this.plugin.settings.themes[this.plugin.settings.selectedTheme])
            this.updateDropdown(themeDropdown,this.plugin.settings);
            this.updatePickrColors();
            this.updateAlternativeHighlights(alternativeHighlightsContainer);
            (async () => {await this.plugin.saveSettings()})();
          }
        });
      });
    let newThemeName: TextComponent;
    this.plugin.settings.newTheme = NEW_THEME_DEFAULT
    new Setting(containerEl)
      .setName('Add New Theme')
      .setDesc('Create a new theme from the current settings.')
      .addText(text => {
        newThemeName = text;
        newThemeName
        .setPlaceholder('New theme name')
        .setValue(this.plugin.settings.newTheme.name)
        .onChange((value) => {
          this.plugin.settings.newTheme.name = value;
        });
      })
      .addToggle(toggle => {return toggle
        .setTooltip("Save as the default theme")
        .setValue(false)
        .onChange((value) => {
          this.plugin.settings.newTheme.default = value;
        });
      })  
      .addExtraButton(button => {
        button.setTooltip("Save theme");
        button.setIcon('plus');
        button.onClick(() => {
        if (this.plugin.settings.newTheme.name.trim().length === 0) {
          new Notice('Set a name for your theme'); //NOSONAR
        } else if (this.plugin.settings.newTheme.name in DEFAULT_SETTINGS.themes) {
          new Notice('You can\'t overwrite the default themes'); //NOSONAR
        } else {
          if (this.plugin.settings.newTheme.name in this.plugin.settings.themes) {
            this.plugin.settings.themes[this.plugin.settings.newTheme.name] = structuredClone(this.plugin.settings.currentTheme);
            new Notice(`${this.plugin.settings.newTheme.name} theme updated successfully!`); //NOSONAR
          } else {
            this.plugin.settings.themes[this.plugin.settings.newTheme.name] = structuredClone(this.plugin.settings.currentTheme);
            new Notice(`${this.plugin.settings.newTheme.name} theme saved successfully!`); //NOSONAR
          }
          this.plugin.settings.selectedTheme = this.plugin.settings.newTheme.name;
          if (this.plugin.settings.newTheme.default)
            this.plugin.settings.defaultTheme = this.plugin.settings.selectedTheme;
          this.updateDropdown(themeDropdown,this.plugin.settings);
          this.updateAlternativeHighlights(alternativeHighlightsContainer);
          this.plugin.settings.newTheme = NEW_THEME_DEFAULT;
          newThemeName.setValue("");
          (async () => {await this.plugin.saveSettings()})();
        }
      });
    });
		containerEl.createEl('h4', {text: 'Codeblock Appearance'});
    new Setting(containerEl)
      .setName('Codeblock Background Color')
      .then((setting) => {this.createPickr(
        this.plugin,containerEl,setting,
        (relevantThemeColors: CodeblockCustomizerThemeColors) => relevantThemeColors[getCurrentMode()].codeblock.backgroundColor,
        (relevantThemeColors: CodeblockCustomizerThemeColors, saveColor: Color) => {relevantThemeColors[getCurrentMode()].codeblock.backgroundColor = saveColor},
      )});
    new Setting(containerEl)
      .setName('Codeblock Text Color')
      .then((setting) => {this.createPickr(
        this.plugin,containerEl,setting,
        (relevantThemeColors: CodeblockCustomizerThemeColors) => relevantThemeColors[getCurrentMode()].codeblock.textColor,
        (relevantThemeColors: CodeblockCustomizerThemeColors, saveColor: Color) => {relevantThemeColors[getCurrentMode()].codeblock.textColor = saveColor},
      )});
    new Setting(containerEl)
      .setName('Codeblock Curvature')
      .setDesc('Determines how rounded the codeblocks appear in pixels.')
      .then((setting) => {
        let resettableSlider: SliderComponent;
        setting.addSlider((slider) => {
          resettableSlider = slider
            .setLimits(0,25,1)
            .setValue(this.plugin.settings.currentTheme.settings.codeblock.curvature)
            .setDynamicTooltip()
            .onChange((value) => {
              this.plugin.settings.currentTheme.settings.codeblock.curvature = value;
              (async () => {await this.plugin.saveSettings()})();    
            })});
        setting.addExtraButton((button) => {button
          .setIcon("reset")
          .onClick(() => {
            this.plugin.settings.currentTheme.settings.codeblock.curvature = this.plugin.settings.themes[this.plugin.settings.selectedTheme].settings.codeblock.curvature;
            resettableSlider.setValue(this.plugin.settings.currentTheme.settings.codeblock.curvature);
            (async () => {await this.plugin.saveSettings()})();
          })
          .setTooltip('Restore default icon size');
        })
      })
      
		containerEl.createEl('h4', {text: 'Gutter Appearance'});
    new Setting(containerEl)
      .setName('Enable Line Numbers')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.currentTheme.settings.codeblock.lineNumbers)
        .onChange((value) => {
          this.plugin.settings.currentTheme.settings.codeblock.lineNumbers = value;
          (async () => {await this.plugin.saveSettings()})();         
        }));
    new Setting(containerEl)
      .setName('Gutter Background Color')
      .then((setting) => {this.createPickr(
        this.plugin,containerEl,setting,
        (relevantThemeColors: CodeblockCustomizerThemeColors) => relevantThemeColors[getCurrentMode()].gutter.backgroundColor,
        (relevantThemeColors: CodeblockCustomizerThemeColors, saveColor: Color) => {relevantThemeColors[getCurrentMode()].gutter.backgroundColor = saveColor},
        () => !this.plugin.settings.currentTheme.settings.codeblock.lineNumbers,
        )});
    new Setting(containerEl)
      .setName('Line Number Color')
      .then((setting) => {this.createPickr(
        this.plugin,containerEl,setting,
        (relevantThemeColors: CodeblockCustomizerThemeColors) => relevantThemeColors[getCurrentMode()].gutter.textColor,
        (relevantThemeColors: CodeblockCustomizerThemeColors, saveColor: Color) => {relevantThemeColors[getCurrentMode()].gutter.textColor = saveColor},
        () => !this.plugin.settings.currentTheme.settings.codeblock.lineNumbers,
        )});
    new Setting(containerEl)
      .setName('Highlight Line Numbers')
      .setDesc('If enabled, highlights will also highlight the line numbers.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.currentTheme.settings.gutter.highlight)
        .onChange((value) => {
          this.plugin.settings.currentTheme.settings.gutter.highlight = value;
          (async () => {await this.plugin.saveSettings()})();
        }));
		containerEl.createEl('h4', {text: 'Header Appearance'});
    new Setting(containerEl)
      .setName('Header Background Color')
      .then((setting) => {this.createPickr(
        this.plugin,containerEl,setting,
        (relevantThemeColors: CodeblockCustomizerThemeColors) => relevantThemeColors[getCurrentMode()].header.backgroundColor,
        (relevantThemeColors: CodeblockCustomizerThemeColors, saveColor: Color) => {relevantThemeColors[getCurrentMode()].header.backgroundColor = saveColor},
      )});
    new Setting(containerEl)
      .setName('Header Title Text Styling')
      .setDesc('Style the header title text using bold and italic toggles, by setting a font or by setting a text color.')
      .addToggle(toggle => {return toggle
        .setTooltip("Toggle bold title text")
        .setValue(this.plugin.settings.currentTheme.settings.header.title.textBold)
        .onChange((value) => {
          this.plugin.settings.currentTheme.settings.header.title.textBold = value;
          (async () => {await this.plugin.saveSettings()})();
        });
      })
      .addToggle(toggle => {return toggle
        .setTooltip("Toggle italic title text")
        .setValue(this.plugin.settings.currentTheme.settings.header.title.textItalic)
        .onChange((value) => {
          this.plugin.settings.currentTheme.settings.header.title.textItalic = value;
          (async () => {await this.plugin.saveSettings()})();
        });
      })
      .addText(text => {return text
        .setPlaceholder('Font')
        .setValue(this.plugin.settings.currentTheme.settings.header.title.textFont)
        .onChange((value) => {
          this.plugin.settings.currentTheme.settings.header.title.textFont = value;
          (async () => {await this.plugin.saveSettings()})();
        });
      })
      .then((setting) => {this.createPickr(
        this.plugin,containerEl,setting,
        (relevantThemeColors: CodeblockCustomizerThemeColors) => relevantThemeColors[getCurrentMode()].header.title.textColor,
        (relevantThemeColors: CodeblockCustomizerThemeColors, saveColor: Color) => {relevantThemeColors[getCurrentMode()].header.title.textColor = saveColor},
      )});
    new Setting(containerEl)
      .setName('Header Separator Color')
      .setDesc('Color of the line separating the codeblock header and the codeblock.')
      .then((setting) => {this.createPickr(
        this.plugin,containerEl,setting,
        (relevantThemeColors: CodeblockCustomizerThemeColors) => relevantThemeColors[getCurrentMode()].header.lineColor,
        (relevantThemeColors: CodeblockCustomizerThemeColors, saveColor: Color) => {relevantThemeColors[getCurrentMode()].header.lineColor = saveColor},
      )});
		containerEl.createEl('h5', {text: 'Header Language Tag Appearance'});
    new Setting(containerEl)
      .setName('Display Header Language Tags')
      .setDesc('Determine when to show language tags in the header. "Title Only" will only show language tags when the title parameter is set.')
      .addDropdown((dropdown) => dropdown
        .addOptions(DISPLAY_OPTIONS)
        .setValue(this.plugin.settings.currentTheme.settings.header.languageTag.display)
        .onChange((value: Display) => {
          this.plugin.settings.currentTheme.settings.header.languageTag.display = value;
          if (value === "none") {
            //todo (@mayurankv) disable styling settings - this.headerLangToggles.forEach(item => {item.setDisabled(!value);});
          }
          (async () => {await this.plugin.saveSettings()})();
        }));
    new Setting(containerEl)
      .setName('Header Language Tag Background Color')
      .then((setting) => {this.createPickr(
        this.plugin,containerEl,setting,
        (relevantThemeColors: CodeblockCustomizerThemeColors) => relevantThemeColors[getCurrentMode()].header.languageTag.backgroundColor,
        (relevantThemeColors: CodeblockCustomizerThemeColors, saveColor: Color) => {relevantThemeColors[getCurrentMode()].header.languageTag.backgroundColor = saveColor},
        () => this.plugin.settings.currentTheme.settings.header.languageTag.display === 'none',
      )});
    new Setting(containerEl)
      .setName('Header Language Tag Text Styling')
      .setDesc('Style the header language tag text using bold and italic toggles, by setting a font or by setting a text color.')
      .addToggle(toggle => {return toggle
        .setTooltip("Toggle bold language tag text")
        .setValue(this.plugin.settings.currentTheme.settings.header.languageTag.textBold)
        .onChange((value) => {
          this.plugin.settings.currentTheme.settings.header.languageTag.textBold = value;
          (async () => {await this.plugin.saveSettings()})();
        });
      })
      .addToggle(toggle => {return toggle
        .setTooltip("Toggle italic language tag text")
        .setValue(this.plugin.settings.currentTheme.settings.header.languageTag.textItalic)
        .onChange((value) => {
          this.plugin.settings.currentTheme.settings.header.languageTag.textItalic = value;
          (async () => {await this.plugin.saveSettings()})();
        });
      })
      .addText(text => {return text
        .setPlaceholder('Font')
        .setValue(this.plugin.settings.currentTheme.settings.header.languageTag.textFont)
        .onChange((value) => {
          this.plugin.settings.currentTheme.settings.header.languageTag.textFont = value;
          (async () => {await this.plugin.saveSettings()})();
        });
      })
      .then((setting) => {this.createPickr(
        this.plugin,containerEl,setting,
        (relevantThemeColors: CodeblockCustomizerThemeColors) => relevantThemeColors[getCurrentMode()].header.languageTag.textColor,
        (relevantThemeColors: CodeblockCustomizerThemeColors, saveColor: Color) => {relevantThemeColors[getCurrentMode()].header.languageTag.textColor = saveColor},
        () => this.plugin.settings.currentTheme.settings.header.languageTag.display === 'none',
      )});
		containerEl.createEl('h5', {text: 'Header Language Icon Appearance'});
    new Setting(containerEl)
      .setName('Display Language Icons')
      .setDesc('Determine when to show language icons where available. "Title Only" will only show language tags when the title parameter is set.')
      .addDropdown((dropdown) => dropdown
        .addOptions(DISPLAY_OPTIONS)
        .setValue(this.plugin.settings.currentTheme.settings.header.languageIcon.display)
        .onChange((value: Display) => {
          this.plugin.settings.currentTheme.settings.header.languageIcon.display = value;
          this.disableableComponents['codeblockActiveLineHighlight'].forEach(component => component.setDisabled(value==="none"));
          (async () => {await this.plugin.saveSettings()})();
        }));
    this.disableableComponents['headerLanguageIcons'] = [];
    let languageIconsColoredToggle: ToggleComponent;
    new Setting(containerEl)
      .setName('Language Icons Colored')
      .setDesc('If disabled, language icons will be black and white.')
      .addToggle(toggle => {languageIconsColoredToggle = toggle
        .setValue(this.plugin.settings.currentTheme.settings.header.languageIcon.displayColor)
        .onChange((value) => {
          this.plugin.settings.currentTheme.settings.header.languageIcon.displayColor = value;
          (async () => {await this.plugin.saveSettings()})();
        })});
    this.disableableComponents['headerLanguageIcons'].push(languageIconsColoredToggle);
		containerEl.createEl('h4', {text: 'Highlighting Appearance'});
    this.disableableComponents['editorActiveLineHighlight'] = [];
    new Setting(containerEl)
      .setName('Editor Active Line Highlight')
      .setDesc('If enabled, highlights the active line outside codeblocks.')
      .setClass('codeblock-customizer-spaced')
      .addToggle(toggle => {return toggle
        .setTooltip('Toggle editor active line highlighting')
        .setValue(this.plugin.settings.currentTheme.settings.highlights.activeEditorLine)
        .onChange((value) => {
          this.plugin.settings.currentTheme.settings.highlights.activeEditorLine = value;
          this.disableableComponents['editorActiveLineHighlight'].forEach(component => component.setDisabled(!value));
          (async () => {await this.plugin.saveSettings()})();
        });
      })
      .then((setting) => {this.createPickr(
        this.plugin,containerEl,setting,
        (relevantThemeColors: CodeblockCustomizerThemeColors) => relevantThemeColors[getCurrentMode()].highlights.activeEditorLineColor,
        (relevantThemeColors: CodeblockCustomizerThemeColors, saveColor: Color) => {relevantThemeColors[getCurrentMode()].highlights.activeEditorLineColor = saveColor},
        () => !this.plugin.settings.currentTheme.settings.highlights.activeEditorLine,
        )});
    this.disableableComponents['codeblockActiveLineHighlight'] = [];
    new Setting(containerEl)
      .setName('Codeblock Active Line Highlight')
      .setDesc('If enabled, highlights the active line inside codeblocks.')
      .setClass('codeblock-customizer-spaced')
      .addToggle(toggle => {return toggle
        .setValue(this.plugin.settings.currentTheme.settings.highlights.activeCodeblockLine)
        .onChange((value) => {
          this.plugin.settings.currentTheme.settings.highlights.activeCodeblockLine = value; 
          this.disableableComponents['codeblockActiveLineHighlight'].forEach(component => component.setDisabled(!value));
          (async () => {await this.plugin.saveSettings()})();
        });
      })
      .then((setting) => {this.createPickr(
        this.plugin,containerEl,setting,
        (relevantThemeColors: CodeblockCustomizerThemeColors) => relevantThemeColors[getCurrentMode()].highlights.activeCodeblockLineColor,
        (relevantThemeColors: CodeblockCustomizerThemeColors, saveColor: Color) => {relevantThemeColors[getCurrentMode()].highlights.activeCodeblockLineColor = saveColor},
        () => !this.plugin.settings.currentTheme.settings.highlights.activeCodeblockLine,
      )});
    new Setting(containerEl)
      .setName('Default Highlight Color')
      .setDesc('Used by the \'hl\' parameter.')
      .then((setting) => {this.createPickr(
        this.plugin,containerEl,setting,
        (relevantThemeColors: CodeblockCustomizerThemeColors) => relevantThemeColors[getCurrentMode()].highlights.defaultColor,
        (relevantThemeColors: CodeblockCustomizerThemeColors, saveColor: Color) => {relevantThemeColors[getCurrentMode()].highlights.defaultColor = saveColor},
      )});
    let newHighlightText: TextComponent;
    new Setting(containerEl)
      .setName("Add Alternative Highlight")
      .setDesc('Define a new alternative highlight name. Colors can be modified after it is added.')
      .addText(value => {newHighlightText = value
        .setPlaceholder('e.g. error, warn')
        .onChange((value) => {
          this.plugin.settings.newHighlight = value;
        });
        return newHighlightText;
      })
      .addButton((button) => {
        button.setButtonText("Add");
        button.onClick(() => {
          if (this.plugin.settings.newHighlight.trim() === "") {
            new Notice("Please enter a color name."); //NOSONAR
          } else if (!COLOR_NAME_REGEX.test(this.plugin.settings.newHighlight)) {
            new Notice(`"${this.plugin.settings.newHighlight}" is not a valid color name.`); //NOSONAR
          } else {
            if (this.plugin.settings.newHighlight in this.plugin.settings.currentTheme.colors.light.highlights.alternativeHighlights) {
              //todo (@mayurankv) Future: Focus on existing highlighter
              new Notice(`A highlight with the name "${this.plugin.settings.newHighlight}" already exists.`); //NOSONAR
            } else {
              const newColor = getRandomColor();
              this.plugin.settings.currentTheme.colors.light.highlights.alternativeHighlights[this.plugin.settings.newHighlight] = newColor;
              this.plugin.settings.currentTheme.colors.dark.highlights.alternativeHighlights[this.plugin.settings.newHighlight] = newColor;
              this.updateAlternativeHighlights(alternativeHighlightsContainer);
              new Notice(`Added highlight "${this.plugin.settings.newHighlight}".`); //NOSONAR
              this.plugin.settings.newHighlight = "";
              newHighlightText.setValue("");
              (async () => {await this.plugin.saveSettings()})();
            }
          }
        });
      });
    const alternativeHighlightsContainer = containerEl.createDiv()
    this.updateAlternativeHighlights(alternativeHighlightsContainer)

    // ========== Advanced ==========
		containerEl.createEl('h3', {text: 'Advanced Settings'});
    
    this.disableableComponents['gradientHighlighting'] = [];
    new Setting(containerEl)
      .setName('Gradient Highlighting')
      .setDesc('If enabled, highlights fade away to the right. The slider sets the gradient color stop as a percentage.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.currentTheme.settings.advanced.gradientHighlights)
        .onChange((value) => {
          this.plugin.settings.currentTheme.settings.advanced.gradientHighlights = value;
          this.disableableComponents['gradientHighlighting'].forEach(component => component.setDisabled(!value));
          (async () => {await this.plugin.saveSettings()})();
        }))
      .then((setting) => {
        let resettableSlider: SliderComponent;
        setting.addSlider((slider) => {
          resettableSlider = slider
            .setLimits(0,100,1)
            .setValue(+this.plugin.settings.currentTheme.settings.advanced.gradientHighlightsColorStop.slice(0,-1))
            .setDynamicTooltip()
            .onChange((value) => {
              this.plugin.settings.currentTheme.settings.advanced.gradientHighlightsColorStop = `${value}%`;
              (async () => {await this.plugin.saveSettings()})();    
            })});
        let resetButton: ExtraButtonComponent;
        setting.addExtraButton((button) => {resetButton = button
          .setIcon("reset")
          .onClick(() => {
            this.plugin.settings.currentTheme.settings.advanced.gradientHighlightsColorStop = this.plugin.settings.themes[this.plugin.settings.selectedTheme].settings.advanced.gradientHighlightsColorStop;
            resettableSlider.setValue(+this.plugin.settings.currentTheme.settings.advanced.gradientHighlightsColorStop.slice(0,-1));
            (async () => {await this.plugin.saveSettings()})();
          })
          .setTooltip('Restore default color stop');
        this.disableableComponents['gradientHighlighting'].push(resettableSlider);
        this.disableableComponents['gradientHighlighting'].push(resetButton);
        })
      })
    new Setting(containerEl)
      .setName('Language Colored Borders')
      .setDesc('If enabled, languages with icons display a left border with the color of the icon.')
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings.currentTheme.settings.advanced.languageBorderColor)
        .onChange((value) => {
          this.plugin.settings.currentTheme.settings.advanced.languageBorderColor = value;
          (async () => {await this.plugin.saveSettings()})();
        }))
    new Setting(containerEl)
      .setName('Language Icon Size')
      .setDesc('Set the size of the displayed language icons.')
      .then((setting) => {
        let resettableSlider: SliderComponent;
        setting.addSlider((slider) => {
          resettableSlider = slider
            .setLimits(10,40,1)
            .setValue(this.plugin.settings.currentTheme.settings.advanced.iconSize)
            .setDynamicTooltip()
            .onChange((value) => {
              this.plugin.settings.currentTheme.settings.advanced.iconSize = value;
              (async () => {await this.plugin.saveSettings()})();    
            })});
        setting.addExtraButton((button) => {button
          .setIcon("reset")
          .onClick(() => {
            this.plugin.settings.currentTheme.settings.advanced.iconSize = this.plugin.settings.themes[this.plugin.settings.selectedTheme].settings.advanced.iconSize;
            resettableSlider.setValue(this.plugin.settings.currentTheme.settings.advanced.iconSize);
            (async () => {await this.plugin.saveSettings()})();
          })
          .setTooltip('Restore default icon size');
        })
      })

    // ========== Donation ==========
    const donationDiv = containerEl.createEl("div", { cls: "codeblock-customizer-donation", });    
    const donationText = createEl("p");
    donationText.appendText("If you like this plugin, and would like to help support continued development, use the button below!");
    const donationButton = createEl("a", { href: "https://www.buymeacoffee.com/ThePirateKing"});
    donationButton.innerHTML = `<img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=ThePirateKing&button_colour=e3e7ef&font_colour=262626&font_family=Inter&outline_colour=262626&coffee_colour=ff0000" height="42px">`;
    donationDiv.appendChild(donationText);
    donationDiv.appendChild(createEl("p"));
    donationDiv.appendChild(donationButton); 
	}//display

  // Setting Creation
  createPickr(plugin: CodeblockCustomizerPlugin, containerEl: HTMLElement, setting: Setting, getRelevantThemeColor: (relevantThemeColors: CodeblockCustomizerThemeColors)=>Color, saveRelevantThemeColor: (relevantThemeColors: CodeblockCustomizerThemeColors, saveColor: Color)=>void, disabled?: ()=>boolean) {
    let pickr: PickrResettable = new PickrResettable(plugin,containerEl,setting,getRelevantThemeColor,saveRelevantThemeColor);
    pickr
      .on('show', (color: Pickr.HSVaColor, instance: Pickr) => {
        if (typeof disabled !== 'undefined' && disabled())
          instance.hide()
        requestAnimationFrame(() => requestAnimationFrame(() => (instance.getRoot() as any).interaction.result.select()))
      })
      .on('save', (color: Pickr.HSVaColor, instance: PickrResettable) => {
        const savedColor: Color = `#${color.toHEXA().toString().substring(1)}`;
        instance.hide();
        instance.addSwatch(savedColor);
        instance.saveColor(savedColor);
      })
      .on('cancel', (instance: PickrResettable) => {instance.hide()});
    setting.addExtraButton((button) => {button
      .setIcon("reset")
      .setDisabled(typeof disabled !== 'undefined' && disabled())
      .setTooltip('Restore default color')
      .onClick(() => {pickr.resetColor()});
    });
    this.pickrs.push(pickr);
  }
  createDualPickr(plugin: CodeblockCustomizerPlugin, containerEl: HTMLElement, setting: Setting, getRelevantThemeColors: Record<'light'|'dark',(relevantThemeColors: CodeblockCustomizerThemeColors)=>Color>, saveRelevantThemeColors: Record<'light'|'dark',(relevantThemeColors: CodeblockCustomizerThemeColors, saveColor: Color)=>void>, resetEnabled: ()=>boolean) {
    let lightPickr: PickrResettable = new PickrResettable(plugin,containerEl,setting,getRelevantThemeColors.light,saveRelevantThemeColors.light,'Select color for light theme');
    lightPickr
      .on('show', (color: Pickr.HSVaColor, instance: Pickr) => {requestAnimationFrame(() => requestAnimationFrame(() => (instance.getRoot() as any).interaction.result.select()))})
      .on('save', (color: Pickr.HSVaColor, instance: PickrResettable) => {
        const savedColor: Color = `#${color.toHEXA().toString().substring(1)}`;
        instance.hide();
        instance.addSwatch(savedColor);
        instance.saveColor(savedColor);
      })
      .on('cancel', (instance: PickrResettable) => {instance.hide()});
    let darkPickr: PickrResettable = new PickrResettable(plugin,containerEl,setting,getRelevantThemeColors.dark,saveRelevantThemeColors.dark,'Select color for dark theme');
    darkPickr
      .on('show', (color: Pickr.HSVaColor, instance: Pickr) => {requestAnimationFrame(() => requestAnimationFrame(() => (instance.getRoot() as any).interaction.result.select()))})
      .on('save', (color: Pickr.HSVaColor, instance: PickrResettable) => {
        const savedColor: Color = `#${color.toHEXA().toString().substring(1)}`;
        instance.hide();
        instance.addSwatch(savedColor);
        instance.saveColor(savedColor);
      })
      .on('cancel', (instance: PickrResettable) => {instance.hide()});
    setting.addExtraButton((button) => {button
      .setIcon("reset")
      .setTooltip('Restore default color')
      .setDisabled(!resetEnabled())
      .onClick(() => {
        lightPickr.resetColor();
        darkPickr.resetColor();
      });
    });
    this.pickrs.push(lightPickr);
    this.pickrs.push(darkPickr);
  }

  // Setting Updates
  updateDropdown(dropdown: DropdownComponent, settings: CodeblockCustomizerSettings) {
    dropdown.selectEl.empty();
    Object.keys(settings.themes).forEach((theme_name: string) => {
      dropdown.addOption(theme_name, theme_name);            
    })
    dropdown.setValue(settings.selectedTheme);
  }
  updatePickrColors() {
    this.pickrs.forEach((pickr) => {pickr.resetColor()})
  }
  updateAlternativeHighlights(alternativeHighlightsContainer: HTMLDivElement) {
    alternativeHighlightsContainer.empty();
    Object.keys(this.plugin.settings.currentTheme.colors.light.highlights.alternativeHighlights).forEach((alternativeHighlightName) => {
      new Setting(alternativeHighlightsContainer)
        .setName(alternativeHighlightName)
        .setDesc(`To highlight lines with this highlight, use the ${alternativeHighlightName} parameter.`)
        .then((setting) => {
          this.createDualPickr(
            this.plugin,alternativeHighlightsContainer,setting,
            {
              'light':(relevantThemeColors: CodeblockCustomizerThemeColors) => relevantThemeColors.light.highlights.alternativeHighlights[alternativeHighlightName],
              'dark':(relevantThemeColors: CodeblockCustomizerThemeColors) => relevantThemeColors.dark.highlights.alternativeHighlights[alternativeHighlightName],
            },
            {
              'light':(relevantThemeColors: CodeblockCustomizerThemeColors, saveColor: Color) => {relevantThemeColors.light.highlights.alternativeHighlights[alternativeHighlightName] = saveColor},
              'dark':(relevantThemeColors: CodeblockCustomizerThemeColors, saveColor: Color) => {relevantThemeColors.dark.highlights.alternativeHighlights[alternativeHighlightName] = saveColor},
            },
            () => alternativeHighlightName in this.plugin.settings.themes[this.plugin.settings.selectedTheme].colors.light.highlights.alternativeHighlights,
          );
          setting.addExtraButton((button) => {button
            .setIcon("trash")
            .setTooltip("Delete highlight")
            .onClick(() => {
              delete this.plugin.settings.currentTheme.colors.light.highlights.alternativeHighlights[alternativeHighlightName]
              delete this.plugin.settings.currentTheme.colors.dark.highlights.alternativeHighlights[alternativeHighlightName]
              new Notice(`Removed highlight "${alternativeHighlightName}".`); //NOSONAR
              this.updateAlternativeHighlights(alternativeHighlightsContainer);
              (async () => {await this.plugin.saveSettings()})();
            });
          });
        })
    })
  }
}// SettingsTab

class PickrResettable extends Pickr {
  saveColor: (saveColor: Color)=>void;
  resetColor: ()=>void;
  getCurrentColor: (accessTheme: boolean)=>void;

  constructor(plugin: CodeblockCustomizerPlugin, containerEl: HTMLElement, setting: Setting, getRelevantThemeColor: (relevantThemeColors: CodeblockCustomizerThemeColors)=>Color, saveRelevantThemeColor: (relevantThemeColors: CodeblockCustomizerThemeColors, saveColor: Color)=>void, tooltip?: string) {
    const settings: Pickr.Options = {
      el: setting.controlEl.createDiv({cls: "picker"}),
      theme: 'nano',
      default: getColor(getRelevantThemeColor(plugin.settings.currentTheme.colors)),
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
        'ui:dialog': 'Color picker dialog',
        'btn:toggle': (typeof tooltip !== 'undefined')?tooltip:'Select color',
        'btn:swatch': 'Color swatch',
        'btn:last-color': 'Use previous color',
      }
    };
    if (containerEl.parentElement !== null)
      settings.container = containerEl.parentElement;
    super(settings);
    this.saveColor = (saveColor: Color) => {
      saveRelevantThemeColor(plugin.settings.currentTheme.colors,saveColor);
      (async () => {await plugin.saveSettings()})();
    };
    this.resetColor = () => {
      const resetColor: Color = getRelevantThemeColor(plugin.settings.themes[plugin.settings.selectedTheme].colors);
      this.setColor(getColor(resetColor));
      this.saveColor(resetColor);
    };
  }
}

const COLOR_NAME_REGEX = /^[^\d]\w*$/
function getRandomColor(): Color {
  const letters = "0123456789ABCDEF";
  let color = "";
  for (let i = 0; i < 6; i++)
    color += letters[Math.floor(Math.random() * 16)];
  return `#${color}FF`;
}