import { PluginSettingTab, Setting } from "obsidian";
import Pickr from "@simonwep/pickr";

import { updateActiveLineStyles } from "./Utils";
import {
    D_ACTIVE_CODEBLOCK_LINE_COLOR,
    D_ACTIVE_LINE_COLOR,
    D_BACKGROUND_COLOR,
    D_HIGHLIGHT_COLOR,
    D_HEADER_COLOR,
    D_HEADER_TEXT_COLOR,
    D_HEADER_LINE_COLOR,
    D_GUTTER_TEXT_COLOR,
    D_GUTTER_BACKGROUND_COLOR,
    D_LANG_COLOR,
    D_LANG_BACKGROUND_COLOR,
    L_ACTIVE_CODEBLOCK_LINE_COLOR,
    L_ACTIVE_LINE_COLOR,
    L_BACKGROUND_COLOR,
    L_HIGHLIGHT_COLOR,
    L_HEADER_COLOR,
    L_HEADER_TEXT_COLOR,
    L_HEADER_LINE_COLOR,
    L_GUTTER_TEXT_COLOR,
    L_GUTTER_BACKGROUND_COLOR,
    L_LANG_COLOR,
    L_LANG_BACKGROUND_COLOR
} from './Settings';

export class SettingsTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
    this.pickerInstances = [];
    this.headerLangToggles = [];
    this.headerLangIconToggles = [];
	}

	display(): void {
    const {containerEl} = this;
    containerEl.empty();
    containerEl.createEl('h3', {text: 'Codeblock Customizer Settings'});
    
    let dropdown;
    new Setting(containerEl)
      .setName("Theme")
      .setDesc("Select which theme to use")
      .addDropdown((dropdownObj) => {
        this.plugin.settings.colorThemes.forEach(theme => {          
          dropdownObj.addOption(theme.color, theme.name);            
        });
        dropdownObj.setValue(this.plugin.settings.SelectedTheme);
        dropdownObj.onChange(value => {
          this.plugin.settings.SelectedTheme = value;
          // Apply the selected theme
          this.applyTheme();
          this.setColorsForPickers(value);
          this.plugin.saveSettings();
        });// onChange
        dropdown = dropdownObj;
      })// addDropdown
      .addExtraButton(button => {
        button.setTooltip("Delete theme");
        button.setIcon('trash');
        button.onClick(() => {
          if (this.plugin.settings.SelectedTheme.trim().length === 0) {
            new Notice('Select a theme first to delete');
          } else if(this.plugin.settings.SelectedTheme === "Dark Theme" || this.plugin.settings.SelectedTheme === "Light Theme") {
            new Notice('You cannot delete the default themes');
          } else {
            let isDefaultLightTheme = false, isDefaltDarkTheme = false;
            this.plugin.settings.colorThemes.forEach(theme => {
              if (theme.name == this.plugin.settings.SelectedTheme){
                isDefaultLightTheme = theme.colors.header.bDefaultLightTheme;
                isDefaltDarkTheme = theme.colors.header.bDefaultDarkTheme;
              }
            });
            if (isDefaultLightTheme){
              // restore bDefaultLightTheme for the default Light theme if the deleted theme is the default
              this.plugin.settings.colorThemes.forEach(theme => {
                if (theme.name === "Light Theme")
                  theme.colors.header.bDefaultLightTheme = true;
              });
            }
            
            if (isDefaltDarkTheme){
              // restore bDefaultLightTheme for the default Dark theme if the deleted theme is the default
              this.plugin.settings.colorThemes.forEach(theme => {
                if (theme.name === "Dark Theme")
                  theme.colors.header.bDefaultDarkTheme = true;
              });
            }
            
            // Delete the selected theme
            const index = this.plugin.settings.colorThemes.findIndex(t => t.name === this.plugin.settings.SelectedTheme);
            this.plugin.settings.colorThemes.splice(index, 1);
            new Notice(`${this.plugin.settings.SelectedTheme} theme deleted successfully!`);
            // Clear the selected theme
            this.plugin.settings.SelectedTheme = "";
            // Update the dropdown options
            dropdown.selectEl.empty();
            for (const theme of this.plugin.settings.colorThemes) {
              dropdown.addOption(theme.color, theme.name);
            }
            // Select the first item in the options list
            if (this.plugin.settings.colorThemes.length > 0) {
              this.plugin.settings.SelectedTheme = this.plugin.settings.colorThemes[0].name;
              dropdown.setValue(this.plugin.settings.SelectedTheme);
            }
            // Apply default theme
            this.applyTheme();
            this.setColorsForPickers(this.plugin.settings.SelectedTheme);
            this.plugin.saveSettings();
          }
        });// onClick
      });// addExtraButton

    let text;
    let darkToggle, lightToggle;
    this.plugin.settings.ThemeName = "";
    new Setting(containerEl)
      .setName('Create your theme')
      .setDesc('Save or update your current colors as a theme')
      .addText(input => {
        text = input;
        text.setPlaceholder('Name for your theme')
          .setValue(this.plugin.settings.ThemeName)
          .onChange(async (value) => {
            this.plugin.settings.ThemeName = value;
            await this.plugin.saveSettings();
          });
      })
      .addToggle(toggle => {
        lightToggle = toggle;
        return toggle
        .setTooltip("Save as default Light theme")
        .setValue(false)
        .onChange(async (value) => {
          this.plugin.settings.header.bDefaultLightTheme = value;
          if (value && this.plugin.settings.header.bDefaultDarkTheme ) {        
            this.plugin.settings.header.bDefaultDarkTheme = !value;
            darkToggle.setValue(!value);
            //await this.plugin.saveSettings();
          }
        });
      })
      .addToggle((toggle) => {
        darkToggle = toggle;
        return toggle
        .setTooltip("Save as default Dark theme")
        .setValue(false)
        .onChange(async (value) => {
          this.plugin.settings.header.bDefaultDarkTheme = value;
          if (value && this.plugin.settings.header.bDefaultLightTheme ) {        
            this.plugin.settings.header.bDefaultLightTheme = !value;
            lightToggle.setValue(!value);
            //await this.plugin.saveSettings();
          } 
        });
      })    
      .addExtraButton(button => {
        button.setTooltip("Save theme");
        button.setIcon('plus');
        button.onClick(() => {
        if (this.plugin.settings.ThemeName.trim().length === 0)
          new Notice('Set a name for your theme!');
        else if(this.plugin.settings.ThemeName === "Dark Theme" || this.plugin.settings.ThemeName === "Light Theme") {
          new Notice('You can\'t overwrite default themes');
        } else {
          const currentColors = {
            activeCodeBlockLineColor: this.plugin.settings.activeCodeBlockLineColor,
            activeLineColor: this.plugin.settings.activeLineColor,
            backgroundColor: this.plugin.settings.backgroundColor,
            highlightColor: this.plugin.settings.highlightColor,          
            gutterTextColor: this.plugin.settings.gutterTextColor,
            gutterBackgroundColor: this.plugin.settings.gutterBackgroundColor,
            header: {
              bDefaultDarkTheme: this.plugin.settings.header.bDefaultDarkTheme,
              bDefaultLightTheme: this.plugin.settings.header.bDefaultLightTheme,
              color: this.plugin.settings.header.color,
              textColor: this.plugin.settings.header.textColor,
              lineColor: this.plugin.settings.header.lineColor,
              codeBlockLangColor: this.plugin.settings.header.codeBlockLangColor,
              codeBlockLangBackgroundColor: this.plugin.settings.header.codeBlockLangBackgroundColor,
            }
          };

          // check if theme already exists
          const existingTheme = this.plugin.settings.colorThemes.find(t => t.name === this.plugin.settings.ThemeName);
          if (existingTheme) {
            // update existing theme
            existingTheme.colors = currentColors;
            new Notice(`${this.plugin.settings.SelectedTheme} theme updated successfully!`);
          } else {
            // add new theme to array
            this.plugin.settings.colorThemes.push({
              name: this.plugin.settings.ThemeName,
              colors: currentColors,
            });
            // Clear the selected theme
            this.plugin.settings.SelectedTheme = "";
            // Update the dropdown options
            dropdown.selectEl.empty();
            for (const theme of this.plugin.settings.colorThemes) {
              dropdown.addOption(theme.color, theme.name);
            }
            // Apply newly created theme
            this.plugin.settings.SelectedTheme = this.plugin.settings.ThemeName;
            dropdown.setValue(this.plugin.settings.SelectedTheme);
            this.applyTheme();
            
            new Notice(`${this.plugin.settings.SelectedTheme} theme saved successfully!`);
          }
          
          // set bDefaultLightTheme to false in every other theme
          if (this.plugin.settings.header.bDefaultLightTheme) {
            this.plugin.settings.colorThemes.forEach(theme => {
              if (theme.name !== this.plugin.settings.ThemeName)
                theme.colors.header.bDefaultLightTheme = false;
            });
          }

          // set bDefaultDarkTheme to false in every other theme
          if (this.plugin.settings.header.bDefaultDarkTheme) {
            this.plugin.settings.colorThemes.forEach(theme => {
              if (theme.name !== this.plugin.settings.ThemeName)
                theme.colors.header.bDefaultDarkTheme = false;
            });
          }

          // Clear the input field        
          this.plugin.settings.ThemeName = "";
          text.setValue("");
          lightToggle.setValue(false);
          darkToggle.setValue(false);
          this.plugin.saveSettings();
        }
      });
    });

    new Setting(containerEl)
      .setName('Enable editor active line highlight')
      .setDesc('If enabled, you can set the color for the active line (including codeblocks).')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.bActiveLineHighlight)
        .onChange(async (value) => {
          this.plugin.settings.bActiveLineHighlight = value;
          await this.plugin.saveSettings();
          updateActiveLineStyles(this.plugin.settings);
        })
      );
     
    this.createPickrSetting(containerEl, 'Editor active line color', 
    'To set this color, enable the option "Enable editor active line highlighting" first.', D_ACTIVE_LINE_COLOR, "activeLineColor");		
     
    new Setting(containerEl)
      .setName('Exclude languages')
      .setDesc('Define languages, separated by a comma, to which the plugin should not apply.')
      .addText(text => text
        .setPlaceholder('e.g. dataview, python etc.')
        .setValue(this.plugin.settings.ExcludeLangs)
        .onChange(async (value) => {
          this.plugin.settings.ExcludeLangs = value;
          await this.plugin.saveSettings();
        })
      );

    containerEl.createEl('h3', {text: 'Codeblock settings'});
    
    new Setting(containerEl)
      .setName('Enable line numbers')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.bEnableLineNumbers)
        .onChange(async (value) => {
          this.plugin.settings.bEnableLineNumbers = value;
          await this.plugin.saveSettings();          
        })
      );

    new Setting(containerEl)
      .setName('Enable codeblock active line hihglight')
      .setDesc('If enabled, you can set the color for the active line inside codeblocks only.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.bActiveCodeblockLineHighlight)
        .onChange(async (value) => {
          this.plugin.settings.bActiveCodeblockLineHighlight = value;          
          await this.plugin.saveSettings();
          updateActiveLineStyles(this.plugin.settings);
        })
      );
        
    this.createPickrSetting(containerEl, 'Codeblock active line color', 
      'To set this color, enable the option "Enable codeblock active line highlight" first.', D_ACTIVE_CODEBLOCK_LINE_COLOR, "activeCodeBlockLineColor");
    
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
              this.updateCurrentAlternateHLColor();
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
    
    new Setting(containerEl)
      .setName('Header bold text')
      .setDesc('If enabled, the header text will be set to bold.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.header.bHeaderBold)
        .onChange(async (value) => {
          this.plugin.settings.header.bHeaderBold = value;
          await this.plugin.saveSettings();
      })
    );
    
    new Setting(containerEl)
      .setName('Header italic text')
      .setDesc('If enabled, the header text will be set to italic.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.header.bHeaderItalic)
        .onChange(async (value) => {
          this.plugin.settings.header.bHeaderItalic = value;
          await this.plugin.saveSettings();
      })
    );
    
    this.createPickrSetting(containerEl, 'Header line color', '', D_HEADER_LINE_COLOR, "lineColor");
    
    containerEl.createEl('h3', {text: 'Header language settings'});
        
    new Setting(containerEl)
      .setName('Display codeblock language (if language is defined)')
      .setDesc('If enabled, the codeblock language will be displayed in the header. If disabled, all below settings are disabled as well!')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.bDisplayCodeBlockLanguage)
        .onChange(async (value) => {
          this.headerLangToggles.forEach(item => {
            item.setDisabled(!value);
          });
          this.plugin.settings.bDisplayCodeBlockLanguage = value;
          await this.plugin.saveSettings();
      })
    );

    this.createPickrSetting(containerEl, 'Codeblock language text color', 'To set this color, enable the option "Display codeblock language" first.', D_LANG_COLOR, "codeBlockLangColor");    
    this.createPickrSetting(containerEl, 'Codeblock language background color', 'To set this color, enable the option "Display codeblock language" first.', D_LANG_BACKGROUND_COLOR, "codeBlockLangBackgroundColor");    
    
    const boldToggle = new Setting(containerEl)
      .setName('Bold text')
      .setDesc('If enabled, the codeblock language text will be set to bold.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.header.bCodeblockLangBold)
        .onChange(async (value) => {
          this.plugin.settings.header.bCodeblockLangBold = value;
          await this.plugin.saveSettings();
      })
    );
    this.headerLangToggles.push(boldToggle);
    
    const italicToggle = new Setting(containerEl)
      .setName('Italic text')
      .setDesc('If enabled, the codeblock language text will be set to italic.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.header.bCodeblockLangItalic)
        .onChange(async (value) => {
          this.plugin.settings.header.bCodeblockLangItalic = value;
          await this.plugin.saveSettings();
      })
    );
    this.headerLangToggles.push(italicToggle);
    
    const alwaysDisplayToggle = new Setting(containerEl)
      .setName('Always display codeblock language')
      .setDesc('If enabled, the codeblock language will always be displayed (if a language is defined), even if the file parameter is not specified.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.header.bAlwaysDisplayCodeblockLang)
        .onChange(async (value) => {
          this.plugin.settings.header.bAlwaysDisplayCodeblockLang = value;
          await this.plugin.saveSettings();
      })
    );
    this.headerLangToggles.push(alwaysDisplayToggle);
    
    if (!this.plugin.settings.bDisplayCodeBlockLanguage){
      this.headerLangToggles.forEach(item => {
        item.setDisabled(true);
      });
    }
    
    containerEl.createEl('h5', {text: 'Header language icon settings'});
    
    new Setting(containerEl)
      .setName('Display codeblock language icon (if available)')
      .setDesc('If enabled, the codeblock language icon will be displayed in the header. If disabled, all below settings are disabled as well!')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.bDisplayCodeBlockIcon)
        .onChange(async (value) => {
          this.headerLangIconToggles.forEach(item => {
            item.setDisabled(!value);
          });
          this.plugin.settings.bDisplayCodeBlockIcon = value;
          await this.plugin.saveSettings();
      })
    );
    
    const alwaysDisplayIconToggle = new Setting(containerEl)
      .setName('Always display codeblock language icon (if available)')
      .setDesc('If enabled, the codeblock language icon will always be displayed (if a language is defined and it has an icon), even if the file parameter is not specified.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.header.bAlwaysDisplayCodeblockIcon)
        .onChange(async (value) => {
          this.plugin.settings.header.bAlwaysDisplayCodeblockIcon = value;
          await this.plugin.saveSettings();
      })
    );
    this.headerLangIconToggles.push(alwaysDisplayIconToggle);
    
    if (!this.plugin.settings.bDisplayCodeBlockIcon){
      this.headerLangIconToggles.forEach(item => {
        item.setDisabled(true);
      });
    }
    
    containerEl.createEl('h3', {text: 'Gutter settings'});
    
    new Setting(containerEl)
      .setName('Highlight gutter')
      .setDesc('If enabled, highlighted lines will also highlight the gutter (line number), not just the line.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.bGutterHighlight)
        .onChange(async (value) => {
          this.plugin.settings.bGutterHighlight = value;
          await this.plugin.saveSettings();
      })
    );
    
    this.createPickrSetting(containerEl, 'Gutter text color', '', D_GUTTER_TEXT_COLOR, "gutterTextColor");
    this.createPickrSetting(containerEl, 'Gutter background color', '', D_GUTTER_BACKGROUND_COLOR, "gutterBackgroundColor");
    
    // donation
    const cDonationDiv = containerEl.createEl("div", { cls: "codeblock-customizer-Donation", });    
    const credit = createEl("p");
    const donateText = createEl("p");
    donateText.appendText("If you like this plugin, and would like to help support continued development, use the button below!");
    
    credit.setAttribute("style", "color: var(--text-muted)");
    cDonationDiv.appendChild(donateText);
    cDonationDiv.appendChild(credit);

    cDonationDiv.appendChild(
      this.createDonateButton("https://www.buymeacoffee.com/ThePirateKing")
    ); 
	}// display
  
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
    
    updateActiveLineStyles(this.plugin.settings);
    this.updateCurrentAlternateHLColor();
  }// applyTheme
  
  updateCurrentAlternateHLColor() {
    const selectedTheme = this.plugin.settings.colorThemes.find(t => t.name === this.plugin.settings.SelectedTheme);
    
    const isDefaultDarkTheme = selectedTheme.colors.header.bDefaultDarkTheme;
    const isDefaultLightTheme = selectedTheme.colors.header.bDefaultLightTheme;
    // moonstone = light, obsidian = dark
    const obsidianTheme = this.plugin.app.vault.getConfig('theme');
    
    if (isDefaultDarkTheme && !isDefaultLightTheme)
      this.applyCurrentAlternateHLColor(false);
    else if (!isDefaultDarkTheme && isDefaultLightTheme)
      this.applyCurrentAlternateHLColor(true);
    else if (!isDefaultDarkTheme && !isDefaultLightTheme) {
      if (obsidianTheme === "moonstone")
        this.applyCurrentAlternateHLColor(true);
      else 
        this.applyCurrentAlternateHLColor(false);
    }
  }// updateCurrentAlternateHLColor
  
  applyCurrentAlternateHLColor(isLight: boolean){
    const alternateColors = this.plugin.settings.alternateColors;

    for (let i = 0; i < alternateColors.length; i++) {
      if (isLight)
        alternateColors[i].currentColor = alternateColors[i].lightColor;
      else
        alternateColors[i].currentColor = alternateColors[i].darkColor;
    }
    this.plugin.saveSettings();
  }// applyCurrentAlternateHLColor
  
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
              updateActiveLineStyles(this.plugin.settings);
            }
        })
        .on('cancel', (instance: Pickr) => {
            instance.hide();
        })
      })
      .addExtraButton((btn) => {
        btn.setIcon("reset")
          .onClick(() => {
            if (this.plugin.settings.SelectedTheme === "Light Theme" ) {
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

    this.updateCurrentAlternateHLColor();
    await this.plugin.saveSettings();
  }// setAndSaveAlternatePickrSetting
  
  updateColorContainer(colorContainer: HTMLElement) {
    colorContainer.empty();

    this.plugin.settings.alternateColors.forEach((color: any) => {
      this.createAlternatePickr(colorContainer, colorContainer, color.name, color.darkColor, color.lightColor);
    });
  }// updateColorContainer
    
  createDonateButton = (link: string): HTMLElement => {
    const a = createEl("a");
    a.setAttribute("href", link);
    a.addClass("buymeacoffee-ThePirateKing-img");
    a.innerHTML = `<img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=ThePirateKing&button_colour=e3e7ef&font_colour=262626&font_family=Inter&outline_colour=262626&coffee_colour=ff0000" height="42px">`;
    return a;
  };// createDonateButton
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
