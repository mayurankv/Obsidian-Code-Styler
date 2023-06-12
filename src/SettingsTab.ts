import { PluginSettingTab, Setting, Notice, TextComponent, DropdownComponent } from "obsidian";
import Pickr from "@simonwep/pickr";

import { CodeBlockCustomizerPlugin } from "./main";
import { updateSettingStyles } from "./Utils";
import { CodeblockCustomizerSettings, CodeblockCustomizerTheme, DEFAULT_SETTINGS, NEW_THEME_DEFAULT } from './Settings';

const DISPLAY_OPTIONS: Record<string,string> = {
  "never": "Never",
  "title_only": "Title Only",
  "always": "Always",
}

export class SettingsTab extends PluginSettingTab {
	plugin: CodeBlockCustomizerPlugin;

	constructor(app: App, plugin: CodeBlockCustomizerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
    this.pickerInstances = [];
	}

  /**
	 *  Builds the html page that is showed in the settings.
	 */
	display() {
    const {containerEl} = this;
    containerEl.empty();

    containerEl.createEl('h2', {text: 'Settings for the Codeblock Customizer Plugin.'});

    // ========== General ==========
		containerEl.createEl('h3', {text: 'General Settings'});

    new Setting(containerEl)
      .setName('Exclude Languages')
      .setDesc('Define languages in a comma separated list on which the plugin should not apply. You can use a wildcard (*) either at the beginning, or at the end. For example: ad-* will exclude codeblocks where the language starts with ad- e.g.: ad-info, ad-error etc.')
      .addText(text => text
        .setPlaceholder('e.g. dataview, python etc.')
        .setValue(this.plugin.settings.excludedLangs)
        .onChange(async (value) => {
          this.plugin.settings.excludedLangs = value;
          await this.plugin.saveSettings();
        }));
    new Setting(containerEl)
      .setName('Enable Line Numbers')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.currentTheme.settings.codeblock.lineNumbers)
        .onChange(async (value) => {
          this.plugin.settings.currentTheme.settings.codeblock.lineNumbers = value;
          await this.plugin.saveSettings();          
        }));
    new Setting(containerEl)
      .setName('Highlight Line Numbers')
      .setDesc('If enabled, highlights will also highlight the line numbers.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.currentTheme.settings.gutter.highlight)
        .onChange(async (value) => {
          this.plugin.settings.currentTheme.settings.gutter.highlight = value;
          await this.plugin.saveSettings();
        }));
    new Setting(containerEl)
      .setName('Enable Codeblock Active Line Highlight')
      .setDesc('If enabled, highlights the active line inside codeblocks.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.currentTheme.settings.highlights.activeCodeblockLine)
        .onChange(async (value) => {
          this.plugin.settings.currentTheme.settings.highlights.activeCodeblockLine = value;          
          await this.plugin.saveSettings();
        }));
    new Setting(containerEl)
      .setName('Enable Editor Active Line Highlight')
      .setDesc('If enabled, highlights the active line outside codeblocks.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.currentTheme.settings.highlights.activeEditorLine)
        .onChange(async (value) => {
          this.plugin.settings.currentTheme.settings.highlights.activeEditorLine = value;
          await this.plugin.saveSettings();
        }));
    new Setting(containerEl)
      .setName('Title Styling')
      .setDesc('Style the title text using bold and italic toggles or by setting a font.')
      .addText(text => {return text
        .setPlaceholder('Font')
        .setValue("textFont" in this.plugin.settings.currentTheme.settings.header.title?this.plugin.settings.currentTheme.settings.header.title.textFont:'')
        .onChange(async (value) => {
          this.plugin.settings.currentTheme.settings.header.title.textFont = value;
          await this.plugin.saveSettings();
        });
      })
      .addToggle(toggle => {return toggle
        .setTooltip("Toggle bold title text")
        .setValue(this.plugin.settings.currentTheme.settings.header.title.textBold)
        .onChange(async (value) => {
          this.plugin.settings.currentTheme.settings.header.title.textBold = value;
          await this.plugin.saveSettings();
        });
      })
      .addToggle(toggle => {return toggle
        .setTooltip("Toggle italic title text")
        .setValue(this.plugin.settings.currentTheme.settings.header.title.textItalic)
        .onChange(async (value) => {
          this.plugin.settings.currentTheme.settings.header.title.textItalic = value;
          await this.plugin.saveSettings();
        });
      })
    new Setting(containerEl)
      .setName('Display Language Tags')
      .setDesc('Determine when to show language tags. "Title Only" will only show language tags when the title parameter is set. If "Never", styling is disabled.')
      .addDropdown((dropdown) => dropdown
        .addOptions(DISPLAY_OPTIONS)
        .setValue(this.plugin.settings.currentTheme.settings.header.languageTag.display)
        .onChange(async (value: string) => {
          this.plugin.settings.currentTheme.settings.header.languageTag.display = value;
          if (value === "Never") {
            //todo (@mayurankv) disable styling settings - this.headerLangToggles.forEach(item => {item.setDisabled(!value);});
          }
          await this.plugin.saveSettings();
        }));
    new Setting(containerEl)
      .setName('Language Tag Styling')
      .setDesc('Style the language tag text using bold and italic toggles or by setting a font.')
      .addText(text => {return text
        .setPlaceholder('Font')
        .setValue("textFont" in this.plugin.settings.currentTheme.settings.header.languageTag?this.plugin.settings.currentTheme.settings.header.languageTag.textFont:'')
        .onChange(async (value) => {
          this.plugin.settings.currentTheme.settings.header.languageTag.textFont = value;
          await this.plugin.saveSettings();
        });
      })
      .addToggle(toggle => {return toggle
        .setTooltip("Toggle bold language tag text")
        .setValue(this.plugin.settings.currentTheme.settings.header.languageTag.textBold)
        .onChange(async (value) => {
          this.plugin.settings.currentTheme.settings.header.languageTag.textBold = value;
          await this.plugin.saveSettings();
        });
      })
      .addToggle(toggle => {return toggle
        .setTooltip("Toggle italic language tag text")
        .setValue(this.plugin.settings.currentTheme.settings.header.languageTag.textItalic)
        .onChange(async (value) => {
          this.plugin.settings.currentTheme.settings.header.languageTag.textItalic = value;
          await this.plugin.saveSettings();
        });
      })
    new Setting(containerEl)
      .setName('Display Language Icons')
      .setDesc('Determine when to show language icons where available. "Title Only" will only show language tags when the title parameter is set. If "Never", styling is disabled.')
      .addDropdown((dropdown) => dropdown
        .addOptions(DISPLAY_OPTIONS)
        .setValue(this.plugin.settings.currentTheme.settings.header.languageIcon.display)
        .onChange(async (value: string) => {
          this.plugin.settings.currentTheme.settings.header.languageIcon.display = value;
          if (value === "Never") {
            //todo (@mayurankv) disable styling settings - this.headerLangToggles.forEach(item => {item.setDisabled(!value);});
          }
          await this.plugin.saveSettings();
        }));
    new Setting(containerEl)
      .setName('Language Icons Colored')
      .setDesc('If disabled, language icons will be black and white.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.currentTheme.settings.languageIcon.displayColor)
        .onChange(async (value) => {
          this.plugin.settings.currentTheme.settings.languageIcon.displayColor = value;
          await this.plugin.saveSettings();
        }));

    // ========== Themes ==========
		containerEl.createEl('h3', {text: 'Theme Settings'});

    let themeDropdown: DropdownComponent;
    new Setting(containerEl)
      .setName("Select Theme")
      .addDropdown((dropdown) => {
        themeDropdown = dropdown;
        this.updateDropdown(themeDropdown,this.plugin.settings);
        themeDropdown.onChange(value => {
          this.plugin.settings.SelectedTheme = value;
          this.applyTheme();
          this.setColorsForPickers(this.plugin.settings.SelectedTheme);
          this.plugin.saveSettings();
        });
        ;
      })
      .addExtraButton(button => {
        button.setTooltip("Delete theme");
        button.setIcon('trash');
        button.onClick(() => {
          if (this.plugin.settings.selectedTheme.trim().length === 0) {
            new Notice('Select a theme first to delete');
          } else if (this.plugin.settings.newTheme.name in DEFAULT_SETTINGS.themes) {
            new Notice('You cannot delete the default themes');
          } else {
            if (this.plugin.settings.defaultTheme === this.plugin.settings.selectedTheme)
              this.plugin.settings.defaultTheme = 'Default';
            delete this.plugin.settings.themes[this.plugin.settings.selectedTheme]
            new Notice(`${this.plugin.settings.SelectedTheme} theme deleted successfully!`);
            this.plugin.settings.selectedTheme = "Default";
            
            this.updateDropdown(themeDropdown,this.plugin.settings);
            this.applyTheme();
            this.setColorsForPickers(this.plugin.settings.SelectedTheme);
            this.plugin.saveSettings();
          }
        });
      });
    let newThemeName: TextComponent;
    this.plugin.settings.currentTheme.settings.newTheme = NEW_THEME_DEFAULT
    new Setting(containerEl)
      .setName('Add New Theme')
      .setDesc('Create a new theme from the current settings.')
      .addText(text => {
        newThemeName = text;
        newThemeName
        .setPlaceholder('New theme name')
        .setValue(this.plugin.settings.currentTheme.settings.newTheme.name)
        .onChange(async (value) => {
          this.plugin.settings.currentTheme.settings.newTheme.name = value;
          //await this.plugin.saveSettings();
        });
      })
      .addToggle(toggle => {return toggle
        .setTooltip("Save as default theme")
        .setValue(false)
        .onChange((value) => {
          this.plugin.settings.newTheme.default = value;
        });
      })  
      .addExtraButton(button => {
        button.setTooltip("Save theme");
        button.setIcon('plus');
        button.onClick(async () => {
        if (this.plugin.settings.newTheme.name.trim().length === 0) {
          new Notice('Set a name for your theme');
        } else if (this.plugin.settings.newTheme.name in DEFAULT_SETTINGS.themes) {
          new Notice('You can\'t overwrite the default themes');
        } else {
          if (this.plugin.settings.newTheme.name in this.plugin.settings.themes) {
            new Notice(`${this.plugin.settings.newTheme.name} theme updated successfully!`);
          } else {
            new Notice(`${this.plugin.settings.newTheme.name} theme saved successfully!`);
          }
          this.plugin.settings.themes[this.plugin.settings.newTheme.name] = this.plugin.settings.currentTheme;
          this.plugin.settings.selectedTheme = this.plugin.settings.newTheme.name;
          if (this.plugin.settings.newTheme.default)
            this.plugin.settings.defaultTheme = this.plugin.settings.selectedTheme;
          this.updateDropdown(themeDropdown,this.plugin.settings);
          this.applyTheme();

          this.plugin.settings.newTheme = NEW_THEME_DEFAULT;
          newThemeName.setValue("");
          await this.plugin.saveSettings();
        }
      });
    });
    
    // ========== Advanced ==========
		containerEl.createEl('h3', {text: 'Advanced Settings'});
    
    new Setting(containerEl)
      .setName('Gradient Highlighting')
      .setDesc('If enabled, highlights fade away to the right.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.currentTheme.settings.advanced.gradientHighlights)
        .onChange(async (value) => {
          this.plugin.settings.currentTheme.settings.advanced.gradientHighlights = value;
          await this.plugin.saveSettings();
        }));
    new Setting(containerEl)
      .setName('Language Colored Borders')
      .setDesc('If enabled, languages with icons display a left border with the color of the icon.')
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings.currentTheme.settings.advanced.languageBorderColor)
        .onChange(async (value) => {
          this.plugin.settings.currentTheme.settings.advanced.languageBorderColor = value;
          await this.plugin.saveSettings();
        }));
    //todo (@mayurankv) Add settings for advanced.iconSize (type Number)



  







    this.createPickrSetting(containerEl, 'Editor active line color', 'To set this color, enable the option "Enable editor active line highlighting" first.', D_ACTIVE_LINE_COLOR, "activeLineColor");		

    containerEl.createEl('h3', {text: 'Codeblock settings'});
    this.createPickrSetting(containerEl, 'Codeblock active line color', 'To set this color, enable the option "Enable codeblock active line highlight" first.', D_ACTIVE_CODEBLOCK_LINE_COLOR, "activeCodeBlockLineColor");
    
    this.createPickrSetting(containerEl, 'Background color', '', D_BACKGROUND_COLOR, "backgroundColor");
    this.createPickrSetting(containerEl, 'Highlight color (used by the "hl" parameter)', '', D_HIGHLIGHT_COLOR, "highlightColor");

    containerEl.createEl('h3', {text: 'Alternative highlight colors'});
    
    // Add the color input and button
    let alternateHLName = "";
    let alternateColorDisplayText;
    new Setting(containerEl)
      .setName("Add alternative highlight color")
      .setDesc('Define a name, by which you will reference the color. You can set the color itself after adding it to the list.')
      .addText(value => {
        alternateColorDisplayText = value;
        alternateColorDisplayText.setPlaceholder('e.g. error, warn')
        alternateColorDisplayText.onChange(async (alternateHLColorName) => {
          alternateHLName = alternateHLColorName;
        });
      })
      .addButton(async (button) => {
        button.setButtonText("Add");
        button.onClick(async () => {
          const colorValue = this.getRandomColor();
          const colorNameRegex = /^[^\d][\w\d]*$/;
          if (alternateHLName.trim() === "") {
            new Notice("Please enter a color name.");
          } else if (!colorNameRegex.test(alternateHLName)) { // check if the input matches the regex
            new Notice(`"${alternateHLName}" is not a valid color name.`);
          } else {
            const alternateColors = this.plugin.settings.alternateColors;
            const colorExists = alternateColors.some(color => color.name.toLowerCase() === alternateHLName.toLowerCase());
            if (colorExists) {
              new Notice(`A color with the name "${alternateHLName}" already exists.`);
            } else {
              const newColor = { name: alternateHLName, darkColor: colorValue, lightColor: colorValue };
              alternateColors.push(newColor);
              await this.plugin.saveSettings();
              this.plugin.saveSettings();
              new Notice(`Added color "${alternateHLName}".`);
              alternateColorDisplayText.setValue("");
              alternateHLName = "";
              this.updateColorContainer(colorContainer); // Update the color container after adding a color
            }
          }
        });
      });
      
    const colorContainer = containerEl.createEl("div", { cls: "codeblock-customizer-alternateHLcolorContainer" });

    // Update the color container on page load
    this.updateColorContainer(colorContainer);
    
    containerEl.createEl('h3', {text: 'Header settings'});
    this.createPickrSetting(containerEl, 'Header color', '', D_HEADER_COLOR, "color");
    this.createPickrSetting(containerEl, 'Header text color', '', D_HEADER_TEXT_COLOR, "textColor");
    this.createPickrSetting(containerEl, 'Header line color', '', D_HEADER_LINE_COLOR, "lineColor");
    
    containerEl.createEl('h3', {text: 'Header language settings'});
    this.createPickrSetting(containerEl, 'Codeblock language text color', 'To set this color, enable the option "Display codeblock language" first.', D_LANG_COLOR, "codeBlockLangColor");    
    this.createPickrSetting(containerEl, 'Codeblock language background color', 'To set this color, enable the option "Display codeblock language" first.', D_LANG_BACKGROUND_COLOR, "codeBlockLangBackgroundColor");    
    
    
    if (!this.plugin.settings.bDisplayCodeBlockLanguage){
      this.headerLangToggles.forEach(item => {
        item.setDisabled(true);
      });
    }
    if (!this.plugin.settings.bDisplayCodeBlockIcon){
      this.headerLangIconToggles.forEach(item => {
        item.setDisabled(true);
      });
    }
    
    containerEl.createEl('h3', {text: 'Gutter settings'});
    this.createPickrSetting(containerEl, 'Gutter text color', '', D_GUTTER_TEXT_COLOR, "gutterTextColor");
    this.createPickrSetting(containerEl, 'Gutter background color', '', D_GUTTER_BACKGROUND_COLOR, "gutterBackgroundColor");
    
    // Donation
    const donationDiv = containerEl.createEl("div", { cls: "codeblock-customizer-donation", });    
    const credit = createEl("p", { cls: "codeblock-customizer-credit", });
    const donationText = createEl("p");
    donationText.appendText("If you like this plugin, and would like to help support continued development, use the button below!");
    const donationButton = createEl("a");
    donationButton.setAttribute("href", "https://www.buymeacoffee.com/ThePirateKing");
    donationButton.addClass("buymeacoffee-ThePirateKing-img");
    donationButton.innerHTML = `<img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=ThePirateKing&button_colour=e3e7ef&font_colour=262626&font_family=Inter&outline_colour=262626&coffee_colour=ff0000" height="42px">`;
    donationDiv.appendChild(donationText);
    donationDiv.appendChild(credit);
    donationDiv.appendChild(donationButton); 
	}//display
  




  updateDropdown(dropdown: DropdownComponent, settings: CodeblockCustomizerSettings) {
    //dropdown.selectEl.empty();
    Object.keys(settings.themes).forEach((theme_name: string) => {
      dropdown.addOption(theme_name, theme_name);            
    })
    dropdown.setValue(settings.selectedTheme);
  }













  getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }// getRandomColor

  removeExtension(name){
    for (const ext of this.plugin.extensions) {
      if  (ext.name === name)
        this.plugin.extensions.remove(ext);
    }
  }// removeExtension
      
  applyTheme() {
    const selectedTheme = this.plugin.settings.colorThemes.find(t => t.name === this.plugin.settings.SelectedTheme);
    this.plugin.settings.activeCodeBlockLineColor = selectedTheme.colors.activeCodeBlockLineColor;
    this.plugin.settings.activeLineColor = selectedTheme.colors.activeLineColor;
    this.plugin.settings.backgroundColor = selectedTheme.colors.backgroundColor;
    this.plugin.settings.highlightColor = selectedTheme.colors.highlightColor;
    this.plugin.settings.header.color = selectedTheme.colors.header.color;
    this.plugin.settings.header.textColor = selectedTheme.colors.header.textColor;
    this.plugin.settings.header.lineColor = selectedTheme.colors.header.lineColor;
    this.plugin.settings.gutterTextColor = selectedTheme.colors.gutterTextColor;
    this.plugin.settings.gutterBackgroundColor = selectedTheme.colors.gutterBackgroundColor;
    this.plugin.settings.header.codeBlockLangColor = selectedTheme.colors.header.codeBlockLangColor;
    this.plugin.settings.header.codeBlockLangBackgroundColor = selectedTheme.colors.header.codeBlockLangBackgroundColor;
    
    updateSettingStyles(this.plugin.settings);
    this.plugin.saveSettings();
  }// applyTheme
  
  setColorsForPickers(themeName){
    const selectedTheme = this.plugin.settings.colorThemes.find(t => t.name === themeName);    

    if (!selectedTheme) 
      return;

    this.pickerInstances.forEach(picker => {
      const color = getColorByClass(picker.options.appClass, selectedTheme);
      if (color) {
        picker.setColor(color);
      }
    });
  }// setColorsForPickers
  
  createPickrSetting(containerEl: HTMLElement, name: string, description: string, defaultColor: string, pickrClass: string): Setting {
    let pickrDefault;
    if (pickrClass.includes("codeBlockLang") || pickrClass === "color" || pickrClass === "textColor" || pickrClass === "lineColor")
      pickrDefault = this.plugin.settings.header[pickrClass] || defaultColor;
    else
      pickrDefault = this.plugin.settings[pickrClass] || defaultColor;
    let pickr: Pickr;
    let desc = "";
    if (description != '')
      desc = description;
        
    const mySetting =  new Setting(containerEl)
      // @ts-ignore
      .setName(name)
      .setDesc(desc)
      .then((setting) => {
        pickr = Pickr.create({
          el: setting.controlEl.createDiv({cls: "picker"}),
          container: containerEl.parentNode,
          appClass: pickrClass,
          theme: 'nano',
          position: "left-middle",
          lockOpacity: false, // If true, the user won't be able to adjust any opacity.
          default: pickrDefault, // Default color
          swatches: [], // Optional color swatches
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
          }
        })
        .on('show', (color: Pickr.HSVaColor, instance: Pickr) => { // Pickr got opened
            if ((!this.plugin.settings.bActiveCodeblockLineHighlight && pickrClass === 'activeCodeBlockLineColor') ||
                (!this.plugin.settings.bActiveLineHighlight && pickrClass === 'activeLineColor') ||
                (!this.plugin.settings.bDisplayCodeBlockLanguage && pickrClass === 'codeBlockLangColor') ||
                (!this.plugin.settings.bDisplayCodeBlockLanguage && pickrClass === 'codeBlockLangBackgroundColor')){
              pickr?.hide();
            }
            const {result} = (pickr.getRoot() as any).interaction;
            requestAnimationFrame(() =>
              requestAnimationFrame(() => result.select())
            );
        })
        .on('save', (color: Pickr.HSVaColor, instance: Pickr) => {
            if (!color) 
              return;
            instance.hide();
            const savedColor = color.toHEXA().toString();
            instance.addSwatch(savedColor);
            this.setAndSavePickrSetting(pickrClass, savedColor);
            // if the active line color changed update it
            if (pickrClass === 'activeLineColor' || pickrClass === 'activeCodeBlockLineColor'){
              updateSettingStyles(this.plugin.settings);
            }
        })
        .on('cancel', (instance: Pickr) => {
            instance.hide();
        })
      })
      .addExtraButton((btn) => {
        btn.setIcon("reset")
          .onClick(() => {
            if (this.plugin.settings.SelectedTheme === "Light Theme" ) { //TODO (@mayurankv) Use a dictionary instead here
              if (pickrClass === 'activeCodeBlockLineColor') {
                pickrDefault = L_ACTIVE_CODEBLOCK_LINE_COLOR;
              } else if (pickrClass === 'activeLineColor') {
                pickrDefault = L_ACTIVE_LINE_COLOR;
              } else if (pickrClass === 'backgroundColor') {
                pickrDefault = L_BACKGROUND_COLOR;
              } else if (pickrClass === 'highlightColor') {
                pickrDefault = L_HIGHLIGHT_COLOR;
              } else if (pickrClass === 'color') {
                pickrDefault = L_HEADER_COLOR;
              } else if (pickrClass === 'textColor') {
                pickrDefault = L_HEADER_TEXT_COLOR;
              } else if (pickrClass === 'lineColor') {
                pickrDefault = L_HEADER_LINE_COLOR;
              } else if (pickrClass === 'gutterTextColor') {
                pickrDefault = L_GUTTER_TEXT_COLOR;
              } else if (pickrClass === 'gutterBackgroundColor') {
                pickrDefault = L_GUTTER_BACKGROUND_COLOR;
              } else if (pickrClass === 'codeBlockLangColor') {
                pickrDefault = L_LANG_COLOR;
              } else if (pickrClass === 'codeBlockLangBackgroundColor') {
                pickrDefault = L_LANG_BACKGROUND_COLOR;
              } else {
                pickrDefault = defaultColor;
              }
              pickr.setColor(pickrDefault);
              this.setAndSavePickrSetting(pickrClass, pickrDefault);
            }
            else if (this.plugin.settings.SelectedTheme === "Dark Theme"){
              pickr.setColor(defaultColor);
              this.setAndSavePickrSetting(pickrClass, defaultColor);
            }
          })
        .setTooltip('restore default color');
      });
            
    this.pickerInstances.push(pickr);
    return mySetting;
  }// createPickrSetting
  
  createAlternatePickr(containerEl: HTMLElement, colorContainer: HTMLElement, name: string, defaultDarkColor: string, defaultLightColor: string): Setting {
    let lightPickr: Pickr;
    let darkPickr: Pickr; // add a new variable for the second color picker
    const desc = "To higlight lines with this color use the \"" + name + "\" parameter. e.g: " + name + ":2,4-6";

    const mySetting = new Setting(containerEl)
      // @ts-ignore
      .setName(name)
      .setDesc(desc)
      .then((setting) => {
        lightPickr = Pickr.create({
          el: setting.controlEl.createDiv({cls: "picker"}),
          container: containerEl.parentNode,
          theme: 'nano',
          position: "left-middle",
          lockOpacity: false, // If true, the user won't be able to adjust any opacity.
          default: defaultLightColor, // Default color
          swatches: [], // Optional color swatches
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
            'btn:toggle': 'select color for light theme'
          }
        })
        .on('show', (color: Pickr.HSVaColor, instance: Pickr) => { // Pickr got opened
            const {result} = (lightPickr.getRoot() as any).interaction;
            requestAnimationFrame(() =>
              requestAnimationFrame(() => result.select())
            );
        })
        .on('save', (color: Pickr.HSVaColor, instance: Pickr) => {
            if (!color) 
              return;
            instance.hide();
            const savedColor = color.toHEXA().toString();
            instance.addSwatch(savedColor);
            this.setAndSaveAlternatePickrSetting(name, savedColor, true);
        })
        .on('cancel', (instance: Pickr) => {
            instance.hide();
        })
        darkPickr = Pickr.create({
          el: setting.controlEl.createDiv({cls: "picker"}),
          container: containerEl.parentNode,
          theme: 'nano',
          position: "left-middle",
          lockOpacity: false,
          default: defaultDarkColor,
          swatches: [],
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
            'btn:toggle': 'select color for dark theme'
          }
        })
        .on('show', (color: Pickr.HSVaColor, instance: Pickr) => {
            const {result} = (darkPickr.getRoot() as any).interaction;
            requestAnimationFrame(() =>
              requestAnimationFrame(() => result.select())
            );
        })
        .on('save', (color: Pickr.HSVaColor, instance: Pickr) => {
            if (!color) 
              return;
            instance.hide();
            const savedColor = color.toHEXA().toString();
            instance.addSwatch(savedColor);
            this.setAndSaveAlternatePickrSetting(name, savedColor, false);
        })
        .on('cancel', (instance: Pickr) => {
            instance.hide();
        });
      })
      .addExtraButton((deleteButton) => {
        deleteButton
          .setIcon("trash")
          .setTooltip("Delete color")
          .onClick(async () => {
            const index = this.plugin.settings.alternateColors.findIndex((c: any) => c.name === name);
            this.plugin.settings.alternateColors.splice(index, 1);
            await this.plugin.saveSettings();
            new Notice(`Removed color "${name}".`);
            this.updateColorContainer(colorContainer); // Update the color container after deleting a color
          });
      });

    return mySetting;
  }// createAlternatePickr

  setAndSavePickrSetting(className: string, savedColor: string): void {
    if (className === 'activeCodeBlockLineColor') {
      this.plugin.settings.activeCodeBlockLineColor = savedColor;
    } else if (className === 'activeLineColor') {
      this.plugin.settings.activeLineColor = savedColor;
    } else if (className === 'backgroundColor') {
      this.plugin.settings.backgroundColor = savedColor;
    } else if (className === 'highlightColor') {
      this.plugin.settings.highlightColor = savedColor;
    } else if (className === 'color') {
      this.plugin.settings.header.color = savedColor;
    } else if (className === 'textColor') {
      this.plugin.settings.header.textColor = savedColor;
    } else if (className === 'lineColor') {
      this.plugin.settings.header.lineColor = savedColor;
    } else if (className === 'gutterTextColor') {
      this.plugin.settings.gutterTextColor = savedColor;
    } else if (className === 'gutterBackgroundColor') {
      this.plugin.settings.gutterBackgroundColor = savedColor;
    } else if (className === 'codeBlockLangColor') {
      this.plugin.settings.header.codeBlockLangColor = savedColor;
    } else if (className === 'codeBlockLangBackgroundColor') {
      this.plugin.settings.header.codeBlockLangBackgroundColor = savedColor;
    }
    this.plugin.saveSettings();
  }// setAndSavePickrSetting
  
  async setAndSaveAlternatePickrSetting(name: string, color: string, isLight: boolean) {
    const alternateColors = this.plugin.settings.alternateColors;
    for (let i = 0; i < alternateColors.length; i++) {
      if (alternateColors[i].name === name) {
        if (isLight)
          alternateColors[i].lightColor = color;
        else
          alternateColors[i].darkColor = color;
        break;
      }
    }

    await this.plugin.saveSettings();
  }// setAndSaveAlternatePickrSetting
  
  updateColorContainer(colorContainer: HTMLElement) {
    colorContainer.empty();

    this.plugin.settings.alternateColors.forEach((color: any) => {
      this.createAlternatePickr(colorContainer, colorContainer, color.name, color.darkColor, color.lightColor);
    });
  }// updateColorContainer
    
  
}// SettingsTab

function getColorByClass(pickerClass, theme) {
  switch (pickerClass) {
    case 'activeCodeBlockLineColor':
      return theme.colors.activeCodeBlockLineColor;
    case 'activeLineColor':
      return theme.colors.activeLineColor;
    case 'backgroundColor':
      return theme.colors.backgroundColor;
    case 'highlightColor':
      return theme.colors.highlightColor;
    case 'color':
      return theme.colors.header.color;
    case 'textColor':
      return theme.colors.header.textColor;
    case 'lineColor':
      return theme.colors.header.lineColor;
    case 'gutterTextColor':
      return theme.colors.gutterTextColor;
    case 'gutterBackgroundColor':
      return theme.colors.gutterBackgroundColor;
    case 'codeBlockLangColor':
      return theme.colors.header.codeBlockLangColor;
    case 'codeBlockLangBackgroundColor':
      return theme.colors.header.codeBlockLangBackgroundColor;
    default:
      return null;
  }
}
