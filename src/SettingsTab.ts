import { App, PluginSettingTab, Setting, Notice, TextComponent, DropdownComponent, SliderComponent } from "obsidian";
import Pickr from "@simonwep/pickr";

import CodeBlockCustomizerPlugin from "./main";
import { updateSettingStyles, getCurrentMode, getThemeColor } from "./Utils";
import { Color, CodeblockCustomizerSettings, CodeblockCustomizerTheme, DEFAULT_SETTINGS, NEW_THEME_DEFAULT } from './Settings';

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
        .onChange(async (value) => {
          this.plugin.settings.excludedLangs = value;
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
          this.plugin.settings.selectedTheme = value;
          this.plugin.settings.currentTheme = structuredClone(this.plugin.settings.themes[this.plugin.settings.selectedTheme])
          this.setColorsForPickers(this.plugin.settings.selectedTheme);
          this.plugin.saveSettings();
        });
        ;
      })
      .addExtraButton(button => {
        button.setTooltip("Update theme");
        button.setIcon('arrow-up');
        button.onClick(async () => {
          if (this.plugin.settings.selectedTheme in DEFAULT_SETTINGS.themes)
            new Notice('You cannot update the default themes');
          else {
            this.plugin.settings.themes[this.plugin.settings.selectedTheme] = structuredClone(this.plugin.settings.currentTheme);
            new Notice(`${this.plugin.settings.selectedTheme} theme saved successfully!`);
            await this.plugin.saveSettings();
          }
        });
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
            new Notice(`${this.plugin.settings.selectedTheme} theme deleted successfully!`);
            this.plugin.settings.selectedTheme = "Default";
            this.plugin.settings.currentTheme = structuredClone(this.plugin.settings.themes[this.plugin.settings.selectedTheme])
            this.updateDropdown(themeDropdown,this.plugin.settings);
            this.setColorsForPickers(this.plugin.settings.selectedTheme); //todo What is this?
            this.plugin.saveSettings();
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
        .onChange(async (value) => {
          this.plugin.settings.newTheme.name = value;
          //await this.plugin.saveSettings();
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
        button.onClick(async () => {
        if (this.plugin.settings.newTheme.name.trim().length === 0) {
          new Notice('Set a name for your theme');
        } else if (this.plugin.settings.newTheme.name in DEFAULT_SETTINGS.themes) {
          new Notice('You can\'t overwrite the default themes');
        } else {
          if (this.plugin.settings.newTheme.name in this.plugin.settings.themes) {
            this.plugin.settings.themes[this.plugin.settings.newTheme.name] = structuredClone(this.plugin.settings.currentTheme);
            new Notice(`${this.plugin.settings.newTheme.name} theme updated successfully!`);
          } else {
            this.plugin.settings.themes[this.plugin.settings.newTheme.name] = structuredClone(this.plugin.settings.currentTheme);
            new Notice(`${this.plugin.settings.newTheme.name} theme saved successfully!`);
          }
          this.plugin.settings.selectedTheme = this.plugin.settings.newTheme.name;
          //this.plugin.settings.currentTheme = structuredClone(this.plugin.settings.themes[this.plugin.settings.selectedTheme])
          if (this.plugin.settings.newTheme.default)
            this.plugin.settings.defaultTheme = this.plugin.settings.selectedTheme;
          this.updateDropdown(themeDropdown,this.plugin.settings);
          this.plugin.settings.newTheme = NEW_THEME_DEFAULT;
          newThemeName.setValue("");
          await this.plugin.saveSettings();
        }
      });
    });
		containerEl.createEl('h4', {text: 'Codeblock Appearance'});
    new Setting(containerEl)
      .setName('Enable Line Numbers')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.currentTheme.settings.codeblock.lineNumbers)
        .onChange(async (value) => {
          this.plugin.settings.currentTheme.settings.codeblock.lineNumbers = value;
          await this.plugin.saveSettings();          
        }));
    new Setting(containerEl)
      .setName('Codeblock Background Color')
      .then((setting) => {
        let pickr = Pickr.create(pickrSettings(containerEl,setting,getThemeColor(this.plugin.settings.currentTheme.colors[getCurrentMode()].codeblock.backgroundColor)))
          .on('show', (instance: Pickr) => {requestAnimationFrame(() => requestAnimationFrame(() => (instance.getRoot() as any).interaction.result.select()))})
          .on('save', async (color: Pickr.HSVaColor, instance: Pickr) => {
            if (!color) 
              return;
            const savedColor: Color = `#${color.toHEXA().toString().substring(1)}`;
            instance.hide();
            instance.addSwatch(savedColor);
            this.plugin.settings.currentTheme.colors[getCurrentMode()].codeblock.backgroundColor = savedColor;
            await this.plugin.saveSettings();
          })
          .on('cancel', (instance: Pickr) => {instance.hide()})
        setting.addExtraButton((button) => {button
          .setIcon("reset")
          .onClick(async () => {
            const resetColor: Color = getThemeColor(this.plugin.settings.themes[this.plugin.settings.selectedTheme].colors[getCurrentMode()].codeblock.backgroundColor)
            this.plugin.settings.currentTheme.colors[getCurrentMode()].codeblock.backgroundColor = resetColor;
            pickr.setColor(resetColor)
            await this.plugin.saveSettings();
          })
          .setTooltip('Restore default color');
        })
      })
    new Setting(containerEl)
      .setName('Codeblock Text Color')
      .then((setting) => {
        let pickr = Pickr.create(pickrSettings(containerEl,setting,getThemeColor(this.plugin.settings.currentTheme.colors[getCurrentMode()].codeblock.textColor)))
          .on('show', (instance: Pickr) => {requestAnimationFrame(() => requestAnimationFrame(() => (instance.getRoot() as any).interaction.result.select()))})
          .on('save', async (color: Pickr.HSVaColor, instance: Pickr) => {
            if (!color) 
              return;
            const savedColor: Color = `#${color.toHEXA().toString().substring(1)}`;
            instance.hide();
            instance.addSwatch(savedColor);
            this.plugin.settings.currentTheme.colors[getCurrentMode()].codeblock.textColor = savedColor;
            await this.plugin.saveSettings();
          })
          .on('cancel', (instance: Pickr) => {instance.hide()})
        setting.addExtraButton((button) => {button
          .setIcon("reset")
          .onClick(async () => {
            const resetColor: Color = getThemeColor(this.plugin.settings.themes[this.plugin.settings.selectedTheme].colors[getCurrentMode()].codeblock.textColor)
            this.plugin.settings.currentTheme.colors[getCurrentMode()].codeblock.textColor = resetColor;
            pickr.setColor(resetColor)
            await this.plugin.saveSettings();
          })
          .setTooltip('Restore default color');
        })
      })
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
            .onChange(async (value) => {
              this.plugin.settings.currentTheme.settings.codeblock.curvature = value;
              await this.plugin.saveSettings();     
            })});
        setting.addExtraButton((button) => {button
          .setIcon("reset")
          .onClick(async () => {
            this.plugin.settings.currentTheme.settings.codeblock.curvature = this.plugin.settings.themes[this.plugin.settings.selectedTheme].settings.codeblock.curvature;
            resettableSlider.setValue(this.plugin.settings.currentTheme.settings.codeblock.curvature)
            await this.plugin.saveSettings();
          })
          .setTooltip('Restore default icon size');
        })
      })
      
		containerEl.createEl('h4', {text: 'Gutter Appearance'});
    new Setting(containerEl)
      .setName('Gutter Background Color')
      .then((setting) => {
        let pickr = Pickr.create(pickrSettings(containerEl,setting,getThemeColor(this.plugin.settings.currentTheme.colors[getCurrentMode()].gutter.backgroundColor)))
          .on('show', (instance: Pickr) => {requestAnimationFrame(() => requestAnimationFrame(() => (instance.getRoot() as any).interaction.result.select()))})
          .on('save', async (color: Pickr.HSVaColor, instance: Pickr) => {
            if (!color) 
              return;
            const savedColor: Color = `#${color.toHEXA().toString().substring(1)}`;
            instance.hide();
            instance.addSwatch(savedColor);
            this.plugin.settings.currentTheme.colors[getCurrentMode()].gutter.backgroundColor = savedColor;
            await this.plugin.saveSettings();
          })
          .on('cancel', (instance: Pickr) => {instance.hide()})
        setting.addExtraButton((button) => {button
          .setIcon("reset")
          .onClick(async () => {
            const resetColor: Color = getThemeColor(this.plugin.settings.themes[this.plugin.settings.selectedTheme].colors[getCurrentMode()].gutter.backgroundColor)
            this.plugin.settings.currentTheme.colors[getCurrentMode()].gutter.backgroundColor = resetColor;
            pickr.setColor(resetColor)
            await this.plugin.saveSettings();
          })
          .setTooltip('Restore default color');
        })
      })
    new Setting(containerEl)
      .setName('Line Number Color')
      .then((setting) => {
        let pickr = Pickr.create(pickrSettings(containerEl,setting,getThemeColor(this.plugin.settings.currentTheme.colors[getCurrentMode()].gutter.textColor)))
          .on('show', (instance: Pickr) => {requestAnimationFrame(() => requestAnimationFrame(() => (instance.getRoot() as any).interaction.result.select()))})
          .on('save', async (color: Pickr.HSVaColor, instance: Pickr) => {
            if (!color) 
              return;
            const savedColor: Color = `#${color.toHEXA().toString().substring(1)}`;
            instance.hide();
            instance.addSwatch(savedColor);
            this.plugin.settings.currentTheme.colors[getCurrentMode()].gutter.textColor = savedColor;
            await this.plugin.saveSettings();
          })
          .on('cancel', (instance: Pickr) => {instance.hide()})
        setting.addExtraButton((button) => {button
          .setIcon("reset")
          .onClick(async () => {
            const resetColor: Color = getThemeColor(this.plugin.settings.themes[this.plugin.settings.selectedTheme].colors[getCurrentMode()].gutter.textColor)
            this.plugin.settings.currentTheme.colors[getCurrentMode()].gutter.textColor = resetColor;
            pickr.setColor(resetColor)
            await this.plugin.saveSettings();
          })
          .setTooltip('Restore default color');
        })
      })
    new Setting(containerEl)
      .setName('Highlight Line Numbers')
      .setDesc('If enabled, highlights will also highlight the line numbers.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.currentTheme.settings.gutter.highlight)
        .onChange(async (value) => {
          this.plugin.settings.currentTheme.settings.gutter.highlight = value;
          await this.plugin.saveSettings();
        }));
		containerEl.createEl('h4', {text: 'Header Appearance'});
    new Setting(containerEl)
      .setName('Header Background Color')
      .then((setting) => {
        let pickr = Pickr.create(pickrSettings(containerEl,setting,getThemeColor(this.plugin.settings.currentTheme.colors[getCurrentMode()].header.backgroundColor)))
          .on('show', (instance: Pickr) => {requestAnimationFrame(() => requestAnimationFrame(() => (instance.getRoot() as any).interaction.result.select()))})
          .on('save', async (color: Pickr.HSVaColor, instance: Pickr) => {
            if (!color) 
              return;
            const savedColor: Color = `#${color.toHEXA().toString().substring(1)}`;
            instance.hide();
            instance.addSwatch(savedColor);
            this.plugin.settings.currentTheme.colors[getCurrentMode()].header.backgroundColor = savedColor;
            await this.plugin.saveSettings();
          })
          .on('cancel', (instance: Pickr) => {instance.hide()})
        setting.addExtraButton((button) => {button
          .setIcon("reset")
          .onClick(async () => {
            const resetColor: Color = getThemeColor(this.plugin.settings.themes[this.plugin.settings.selectedTheme].colors[getCurrentMode()].header.backgroundColor)
            this.plugin.settings.currentTheme.colors[getCurrentMode()].header.backgroundColor = resetColor;
            pickr.setColor(resetColor)
            await this.plugin.saveSettings();
          })
          .setTooltip('Restore default color');
        })
      })
    new Setting(containerEl)
      .setName('Header Title Text Styling')
      .setDesc('Style the header title text using bold and italic toggles, by setting a font or by setting a text color.')
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
      .addText(text => {return text
        .setPlaceholder('Font')
        .setValue("textFont" in this.plugin.settings.currentTheme.settings.header.title?this.plugin.settings.currentTheme.settings.header.title.textFont:'')
        .onChange(async (value) => {
          this.plugin.settings.currentTheme.settings.header.title.textFont = value;
          await this.plugin.saveSettings();
        });
      })
      .then((setting) => {
        let pickr = Pickr.create(pickrSettings(containerEl,setting,getThemeColor(this.plugin.settings.currentTheme.colors[getCurrentMode()].header.title.textColor)))
          .on('show', (instance: Pickr) => {requestAnimationFrame(() => requestAnimationFrame(() => (instance.getRoot() as any).interaction.result.select()))})
          .on('save', async (color: Pickr.HSVaColor, instance: Pickr) => {
            if (!color) 
              return;
            const savedColor: Color = `#${color.toHEXA().toString().substring(1)}`;
            instance.hide();
            instance.addSwatch(savedColor);
            this.plugin.settings.currentTheme.colors[getCurrentMode()].header.title.textColor = savedColor;
            await this.plugin.saveSettings();
          })
          .on('cancel', (instance: Pickr) => {instance.hide()})
        setting.addExtraButton((button) => {button
          .setIcon("reset")
          .onClick(async () => {
            const resetColor: Color = getThemeColor(this.plugin.settings.themes[this.plugin.settings.selectedTheme].colors[getCurrentMode()].header.title.textColor)
            this.plugin.settings.currentTheme.colors[getCurrentMode()].header.title.textColor = resetColor;
            pickr.setColor(resetColor)
            await this.plugin.saveSettings();
          })
          .setTooltip('Restore default color');
        })
      })
    new Setting(containerEl)
      .setName('Header Divider Color')
      .setDesc('')
      .then((setting) => {
        let pickr = Pickr.create(pickrSettings(containerEl,setting,getThemeColor(this.plugin.settings.currentTheme.colors[getCurrentMode()].header.lineColor)))
          .on('show', (instance: Pickr) => {requestAnimationFrame(() => requestAnimationFrame(() => (instance.getRoot() as any).interaction.result.select()))})
          .on('save', async (color: Pickr.HSVaColor, instance: Pickr) => {
            if (!color) 
              return;
            const savedColor: Color = `#${color.toHEXA().toString().substring(1)}`;
            instance.hide();
            instance.addSwatch(savedColor);
            this.plugin.settings.currentTheme.colors[getCurrentMode()].header.lineColor = savedColor;
            await this.plugin.saveSettings();
          })
          .on('cancel', (instance: Pickr) => {instance.hide()})
        setting.addExtraButton((button) => {button
          .setIcon("reset")
          .onClick(async () => {
            const resetColor: Color = getThemeColor(this.plugin.settings.themes[this.plugin.settings.selectedTheme].colors[getCurrentMode()].header.lineColor)
            this.plugin.settings.currentTheme.colors[getCurrentMode()].header.lineColor = resetColor;
            pickr.setColor(resetColor)
            await this.plugin.saveSettings();
          })
          .setTooltip('Restore default color');
        })
      })
		containerEl.createEl('h5', {text: 'Header Language Tag Appearance'});
    new Setting(containerEl)
      .setName('Display Header Language Tags')
      .setDesc('Determine when to show language tags in the header. "Title Only" will only show language tags when the title parameter is set.')
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
      .setName('Header Language Tag Background Color')
      .then((setting) => {
        let pickr = Pickr.create(pickrSettings(containerEl,setting,getThemeColor(this.plugin.settings.currentTheme.colors[getCurrentMode()].header.languageTag.backgroundColor)))
          .on('show', (instance: Pickr) => {requestAnimationFrame(() => requestAnimationFrame(() => (instance.getRoot() as any).interaction.result.select()))})
          .on('save', async (color: Pickr.HSVaColor, instance: Pickr) => {
            if (!color) 
              return;
            const savedColor: Color = `#${color.toHEXA().toString().substring(1)}`;
            instance.hide();
            instance.addSwatch(savedColor);
            this.plugin.settings.currentTheme.colors[getCurrentMode()].header.languageTag.backgroundColor = savedColor;
            await this.plugin.saveSettings();
          })
          .on('cancel', (instance: Pickr) => {instance.hide()})
        setting.addExtraButton((button) => {button
          .setIcon("reset")
          .onClick(async () => {
            const resetColor: Color = getThemeColor(this.plugin.settings.themes[this.plugin.settings.selectedTheme].colors[getCurrentMode()].header.languageTag.backgroundColor)
            this.plugin.settings.currentTheme.colors[getCurrentMode()].header.languageTag.backgroundColor = resetColor;
            pickr.setColor(resetColor)
            await this.plugin.saveSettings();
          })
          .setTooltip('Restore default color');
        })
      })
    new Setting(containerEl)
      .setName('Header Language Tag Text Styling')
      .setDesc('Style the header language tag text using bold and italic toggles, by setting a font or by setting a text color.')
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
      .addText(text => {return text
        .setPlaceholder('Font')
        .setValue("textFont" in this.plugin.settings.currentTheme.settings.header.languageTag?this.plugin.settings.currentTheme.settings.header.languageTag.textFont:'')
        .onChange(async (value) => {
          this.plugin.settings.currentTheme.settings.header.languageTag.textFont = value;
          await this.plugin.saveSettings();
        });
      })
      .then((setting) => {
        let pickr = Pickr.create(pickrSettings(containerEl,setting,getThemeColor(this.plugin.settings.currentTheme.colors[getCurrentMode()].header.languageTag.textColor)))
          .on('show', (instance: Pickr) => {requestAnimationFrame(() => requestAnimationFrame(() => (instance.getRoot() as any).interaction.result.select()))})
          .on('save', async (color: Pickr.HSVaColor, instance: Pickr) => {
            if (!color) 
              return;
            const savedColor: Color = `#${color.toHEXA().toString().substring(1)}`;
            instance.hide();
            instance.addSwatch(savedColor);
            this.plugin.settings.currentTheme.colors[getCurrentMode()].header.languageTag.textColor = savedColor;
            await this.plugin.saveSettings();
          })
          .on('cancel', (instance: Pickr) => {instance.hide()})
        setting.addExtraButton((button) => {button
          .setIcon("reset")
          .onClick(async () => {
            const resetColor: Color = getThemeColor(this.plugin.settings.themes[this.plugin.settings.selectedTheme].colors[getCurrentMode()].header.languageTag.textColor)
            this.plugin.settings.currentTheme.colors[getCurrentMode()].header.languageTag.textColor = resetColor;
            pickr.setColor(resetColor)
            await this.plugin.saveSettings();
          })
          .setTooltip('Restore default color');
        })
      })
		containerEl.createEl('h5', {text: 'Header Language Icon Appearance'});
    new Setting(containerEl)
      .setName('Display Language Icons')
      .setDesc('Determine when to show language icons where available. "Title Only" will only show language tags when the title parameter is set.')
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
        .setValue(this.plugin.settings.currentTheme.settings.header.languageIcon.displayColor)
        .onChange(async (value) => {
          this.plugin.settings.currentTheme.settings.header.languageIcon.displayColor = value;
          await this.plugin.saveSettings();
        }));
		containerEl.createEl('h4', {text: 'Highlighting Appearance'});
    new Setting(containerEl)
      .setName('Editor Active Line Highlight')
      .setDesc('If enabled, highlights the active line outside codeblocks.')
      .setClass('codeblock-customizer-spaced')
      .addToggle(toggle => {return toggle
        .setTooltip('Toggle editor active line highlighting')
        .setValue(this.plugin.settings.currentTheme.settings.highlights.activeEditorLine)
        .onChange(async (value) => {
          this.plugin.settings.currentTheme.settings.highlights.activeEditorLine = value;
          await this.plugin.saveSettings();
        });
      })
      .then((setting) => {
        let pickr = Pickr.create(pickrSettings(containerEl,setting,getThemeColor(this.plugin.settings.currentTheme.colors[getCurrentMode()].highlights.activeEditorLineColor)))
          .on('show', (instance: Pickr) => {requestAnimationFrame(() => requestAnimationFrame(() => (instance.getRoot() as any).interaction.result.select()))})
          .on('save', async (color: Pickr.HSVaColor, instance: Pickr) => {
            if (!color) 
              return;
            const savedColor: Color = `#${color.toHEXA().toString().substring(1)}`;
            instance.hide();
            instance.addSwatch(savedColor);
            this.plugin.settings.currentTheme.colors[getCurrentMode()].highlights.activeEditorLineColor = savedColor;
            await this.plugin.saveSettings();
          })
          .on('cancel', (instance: Pickr) => {instance.hide()})
        setting.addExtraButton((button) => {button
          .setIcon("reset")
          .onClick(async () => {
            const resetColor: Color = getThemeColor(this.plugin.settings.themes[this.plugin.settings.selectedTheme].colors[getCurrentMode()].highlights.activeEditorLineColor)
            this.plugin.settings.currentTheme.colors[getCurrentMode()].highlights.activeEditorLineColor = resetColor;
            pickr.setColor(resetColor)
            await this.plugin.saveSettings();
          })
          .setTooltip('Restore default color');
        })
      })
    new Setting(containerEl)
      .setName('Codeblock Active Line Highlight')
      .setDesc('If enabled, highlights the active line inside codeblocks.')
      .setClass('codeblock-customizer-spaced')
      .addToggle(toggle => {return toggle
        .setValue(this.plugin.settings.currentTheme.settings.highlights.activeCodeblockLine)
        .onChange(async (value) => {
          this.plugin.settings.currentTheme.settings.highlights.activeCodeblockLine = value;          
          await this.plugin.saveSettings();
        });
      })
      .then((setting) => {
        let pickr = Pickr.create(pickrSettings(containerEl,setting,getThemeColor(this.plugin.settings.currentTheme.colors[getCurrentMode()].highlights.activeCodeblockLineColor)))
          .on('show', (instance: Pickr) => {requestAnimationFrame(() => requestAnimationFrame(() => (instance.getRoot() as any).interaction.result.select()))})
          .on('save', async (color: Pickr.HSVaColor, instance: Pickr) => {
            if (!color) 
              return;
            const savedColor: Color = `#${color.toHEXA().toString().substring(1)}`;
            instance.hide();
            instance.addSwatch(savedColor);
            this.plugin.settings.currentTheme.colors[getCurrentMode()].highlights.activeCodeblockLineColor = savedColor;
            await this.plugin.saveSettings();
          })
          .on('cancel', (instance: Pickr) => {instance.hide()})
        setting.addExtraButton((button) => {button
          .setIcon("reset")
          .onClick(async () => {
            const resetColor: Color = getThemeColor(this.plugin.settings.themes[this.plugin.settings.selectedTheme].colors[getCurrentMode()].highlights.activeCodeblockLineColor)
            this.plugin.settings.currentTheme.colors[getCurrentMode()].highlights.activeCodeblockLineColor = resetColor;
            pickr.setColor(resetColor)
            await this.plugin.saveSettings();
          })
          .setTooltip('Restore default color');
        })
      })
    new Setting(containerEl)
      .setName('Default Highlight Color')
      .setDesc('Used by the \'hl\' parameter.')
      .then((setting) => {
        let pickr = Pickr.create(pickrSettings(containerEl,setting,getThemeColor(this.plugin.settings.currentTheme.colors[getCurrentMode()].highlights.defaultColor)))
          .on('show', (instance: Pickr) => {requestAnimationFrame(() => requestAnimationFrame(() => (instance.getRoot() as any).interaction.result.select()))})
          .on('save', async (color: Pickr.HSVaColor, instance: Pickr) => {
            if (!color) 
              return;
            const savedColor: Color = `#${color.toHEXA().toString().substring(1)}`;
            instance.hide();
            instance.addSwatch(savedColor);
            this.plugin.settings.currentTheme.colors[getCurrentMode()].highlights.defaultColor = savedColor;
            await this.plugin.saveSettings();
          })
          .on('cancel', (instance: Pickr) => {instance.hide()})
        setting.addExtraButton((button) => {button
          .setIcon("reset")
          .onClick(async () => {
            const resetColor: Color = getThemeColor(this.plugin.settings.themes[this.plugin.settings.selectedTheme].colors[getCurrentMode()].highlights.defaultColor)
            this.plugin.settings.currentTheme.colors[getCurrentMode()].highlights.defaultColor = resetColor;
            pickr.setColor(resetColor)
            await this.plugin.saveSettings();
          })
          .setTooltip('Restore default color');
        })
      })
    let newHighlightText: TextComponent;
    new Setting(containerEl)
      .setName("Add Alternative Highlight")
      .setDesc('Define a new alternative highlight name. Colors can be modified after it is added.')
      .addText(value => {newHighlightText = value
        .setPlaceholder('e.g. error, warn')
        .onChange(async (value) => {
          this.plugin.settings.newHighlight = value;
        });
        return newHighlightText;
      })
      .addButton(async (button) => {
        button.setButtonText("Add");
        button.onClick(async () => {
          if (this.plugin.settings.newHighlight.trim() === "") {
            new Notice("Please enter a color name.");
          } else if (!COLOR_NAME_REGEX.test(this.plugin.settings.newHighlight)) {
            new Notice(`"${this.plugin.settings.newHighlight}" is not a valid color name.`);
          } else {
            if (this.plugin.settings.newHighlight in this.plugin.settings.currentTheme.colors.light.highlights.alternativeHighlights) {
              //todo (@mayurankv) Non-Immediate: Focus on existing highlighter
              new Notice(`A highlight with the name "${this.plugin.settings.newHighlight}" already exists.`);
            } else {
              const newColor = this.getRandomColor()
              this.plugin.settings.currentTheme.colors.light.highlights.alternativeHighlights[this.plugin.settings.newHighlight] = newColor;
              this.plugin.settings.currentTheme.colors.dark.highlights.alternativeHighlights[this.plugin.settings.newHighlight] = newColor;
              this.updateAlternativeHighlights(alternativeHighlightsContainer);
              new Notice(`Added highlight "${this.plugin.settings.newHighlight}".`);
              this.plugin.settings.newHighlight = "";
              newHighlightText.setValue("");
              await this.plugin.saveSettings();
            }
          }
        });
      });
    const alternativeHighlightsContainer = containerEl.createDiv()
    this.updateAlternativeHighlights(alternativeHighlightsContainer)

    // ========== Advanced ==========
		containerEl.createEl('h3', {text: 'Advanced Settings'});
    
    new Setting(containerEl)
      .setName('Gradient Highlighting')
      .setDesc('If enabled, highlights fade away to the right. The slider sets the gradient color stop as a percentage.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.currentTheme.settings.advanced.gradientHighlights)
        .onChange(async (value) => {
          this.plugin.settings.currentTheme.settings.advanced.gradientHighlights = value;
          await this.plugin.saveSettings();
        }))
      .then((setting) => {
        let resettableSlider: SliderComponent;
        setting.addSlider((slider) => {
          resettableSlider = slider
            .setLimits(0,100,1)
            .setValue(+this.plugin.settings.currentTheme.settings.advanced.gradientHighlightsColorStop.slice(0,-1))
            .setDynamicTooltip()
            .onChange(async (value) => {
              this.plugin.settings.currentTheme.settings.advanced.gradientHighlightsColorStop = `${value}%`;
              await this.plugin.saveSettings();     
            })});
        setting.addExtraButton((button) => {button
          .setIcon("reset")
          .onClick(async () => {
            this.plugin.settings.currentTheme.settings.advanced.gradientHighlightsColorStop = this.plugin.settings.themes[this.plugin.settings.selectedTheme].settings.advanced.gradientHighlightsColorStop;
            resettableSlider.setValue(+this.plugin.settings.currentTheme.settings.advanced.gradientHighlightsColorStop.slice(0,-1))
            await this.plugin.saveSettings();
          })
          .setTooltip('Restore default color stop');
        })
      })
    new Setting(containerEl)
      .setName('Language Colored Borders')
      .setDesc('If enabled, languages with icons display a left border with the color of the icon.')
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings.currentTheme.settings.advanced.languageBorderColor)
        .onChange(async (value) => {
          this.plugin.settings.currentTheme.settings.advanced.languageBorderColor = value;
          await this.plugin.saveSettings();
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
            .onChange(async (value) => {
              this.plugin.settings.currentTheme.settings.advanced.iconSize = value;
              await this.plugin.saveSettings();     
            })});
        setting.addExtraButton((button) => {button
          .setIcon("reset")
          .onClick(async () => {
            this.plugin.settings.currentTheme.settings.advanced.iconSize = this.plugin.settings.themes[this.plugin.settings.selectedTheme].settings.advanced.iconSize;
            resettableSlider.setValue(this.plugin.settings.currentTheme.settings.advanced.iconSize)
            await this.plugin.saveSettings();
          })
          .setTooltip('Restore default curvature');
        })
      })
      .addSlider((slider) => slider

    // ========== Donation ==========
    const donationDiv = containerEl.createEl("div", { cls: "codeblock-customizer-donation", });    
    const donationText = createEl("p");
    donationText.appendText("If you like this plugin, and would like to help support continued development, use the button below!");
    const donationButton = createEl("a", { href: "https://www.buymeacoffee.com/ThePirateKing"});
    donationButton.innerHTML = `<img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=ThePirateKing&button_colour=e3e7ef&font_colour=262626&font_family=Inter&outline_colour=262626&coffee_colour=ff0000" height="42px">`;
    donationDiv.appendChild(donationText);
    donationDiv.appendChild(createEl("p"));
    donationDiv.appendChild(donationButton); 
    //todo (@mayurankv) Disable relevant settings and show warnings etc.
	}//display

  // Methods
  updateDropdown(dropdown: DropdownComponent, settings: CodeblockCustomizerSettings) {
    dropdown.selectEl.empty();
    Object.keys(settings.themes).forEach((theme_name: string) => {
      dropdown.addOption(theme_name, theme_name);            
    })
    dropdown.setValue(settings.selectedTheme);
  }
  updateAlternativeHighlights(alternativeHighlightsContainer: HTMLDivElement) {
    alternativeHighlightsContainer.empty();
    Object.keys(this.plugin.settings.currentTheme.colors.light.highlights.alternativeHighlights).forEach((alternativeHighlightName) => {
      new Setting(alternativeHighlightsContainer)
        .setName(alternativeHighlightName)
        .setDesc(`To highlight lines with this highlight, use the ${alternativeHighlightName} parameter.`)
        .then((setting) => {
          let lightPickr = Pickr.create({...pickrSettings(alternativeHighlightsContainer,setting,getThemeColor(this.plugin.settings.currentTheme.colors.light.highlights.alternativeHighlights[alternativeHighlightName])),...{i18n: {'btn:toggle': 'Select color for light theme'}}})
            .on('show', (instance: Pickr) => {requestAnimationFrame(() => requestAnimationFrame(() => (instance.getRoot() as any).interaction.result.select()))})
            .on('save', async (color: Pickr.HSVaColor, instance: Pickr) => {
              if (!color) 
                return;
              const savedColor: Color = `#${color.toHEXA().toString().substring(1)}`;
              instance.hide();
              instance.addSwatch(savedColor);
              this.plugin.settings.currentTheme.colors.light.highlights.alternativeHighlights[alternativeHighlightName] = savedColor;
              await this.plugin.saveSettings();
            })
            .on('cancel', (instance: Pickr) => {instance.hide()})
          let darkPickr = Pickr.create({...pickrSettings(alternativeHighlightsContainer,setting,getThemeColor(this.plugin.settings.currentTheme.colors.dark.highlights.alternativeHighlights[alternativeHighlightName])),...{i18n: {'btn:toggle': 'Select color for light theme'}}})
            .on('show', (instance: Pickr) => {requestAnimationFrame(() => requestAnimationFrame(() => (instance.getRoot() as any).interaction.result.select()))})
            .on('save', async (color: Pickr.HSVaColor, instance: Pickr) => {
              if (!color) 
                return;
              const savedColor: Color = `#${color.toHEXA().toString().substring(1)}`;
              instance.hide();
              instance.addSwatch(savedColor);
              this.plugin.settings.currentTheme.colors.dark.highlights.alternativeHighlights[alternativeHighlightName] = savedColor;
              await this.plugin.saveSettings();
            })
            .on('cancel', (instance: Pickr) => {instance.hide()})
          setting.addExtraButton((button) => {button
            .setIcon("reset")
            .setTooltip("Reset highlight colors")
            .onClick(async () => {
              const lightResetColor: Color = getThemeColor(this.plugin.settings.themes[this.plugin.settings.selectedTheme].colors.light.highlights.alternativeHighlights[alternativeHighlightName])
              this.plugin.settings.currentTheme.colors.light.highlights.alternativeHighlights[alternativeHighlightName] = lightResetColor;
              lightPickr.setColor(lightResetColor)
              const darkResetColor: Color = getThemeColor(this.plugin.settings.themes[this.plugin.settings.selectedTheme].colors.dark.highlights.alternativeHighlights[alternativeHighlightName])
              this.plugin.settings.currentTheme.colors.dark.highlights.alternativeHighlights[alternativeHighlightName] = darkResetColor;
              lightPickr.setColor(darkResetColor)
              await this.plugin.saveSettings();
            });
          })
          setting.addExtraButton((button) => {button
            .setIcon("trash")
            .setTooltip("Delete highlight")
            .onClick(async () => {
              delete this.plugin.settings.currentTheme.colors.light.highlights.alternativeHighlights[alternativeHighlightName]
              delete this.plugin.settings.currentTheme.colors.dark.highlights.alternativeHighlights[alternativeHighlightName]
              new Notice(`Removed highlight "${alternativeHighlightName}".`);
              this.updateAlternativeHighlights(alternativeHighlightsContainer)
              await this.plugin.saveSettings();
            });
          })
        })
    })
  }
  getRandomColor(): Color {
    const letters = "0123456789ABCDEF";
    let color = "";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return `#${color}`;
  }













  

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
  }
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










//todo (@mayurankv) Modularise setting creation


const COLOR_NAME_REGEX = /^[^\d][\w\d]*$/

function pickrSettings(containerEl: HTMLElement, setting: Setting, defaultColor: Color): Pickr.Options {
  const settings: Pickr.Options = {
    el: setting.controlEl.createDiv({cls: "picker"}),
    theme: 'nano',
    default: defaultColor,
    // appClass: 'codeblock-customizer-pickr',
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
      'btn:toggle': 'Select color',
      'btn:swatch': 'Color swatch',
      'btn:last-color': 'Use previous color',
    }
  };
  if (containerEl.parentElement !== null)
    settings.container = containerEl.parentElement
  return settings
}