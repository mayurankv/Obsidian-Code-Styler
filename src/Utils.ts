import { Languages, manualLang, Icons } from "./Const";

export function splitAndTrimString(str) {
  if (!str) {
    return [];
  }
  
  // Replace * with .*
  str = str.replace(/\*/g, '.*');
  
  if (!str.includes(",")) {
    return [str];
  }
  
  return str.split(",").map(s => s.trim());
}// splitAndTrimString

export function searchString(str, searchTerm) {
  const originalStr = str;
  str = str.toLowerCase();
  searchTerm = searchTerm.toLowerCase();
  if (searchTerm === "file:") {
    if (str.includes(searchTerm)) {
      const startIndex = str.indexOf(searchTerm) + searchTerm.length;
      let result = "";
      if (str[startIndex] === "\"") {
        const endIndex = str.indexOf("\"", startIndex + 1);
        if (endIndex !== -1) {
          result = originalStr.substring(startIndex + 1, endIndex);
        } else {
          result = originalStr.substring(startIndex + 1);
        }
      } else {
        const endIndex = str.indexOf(" ", startIndex);
        if (endIndex !== -1) {
          result = originalStr.substring(startIndex, endIndex);
        } else {
          result = originalStr.substring(startIndex);
        }
      }
      return result.trim();
    }
  } else if (searchTerm === "```") {
    if (str.startsWith(searchTerm)) {
      const startIndex = searchTerm.length;
      const endIndex = str.indexOf(" ", startIndex);
      let word = "";
      if (endIndex !==-1) {
        word = originalStr.substring(startIndex, endIndex);
      } else {
        word = originalStr.substring(startIndex);
      }
      if (!word.includes(":")) {
        if (word.toLowerCase() === "fold") 
          return null;
        else
          return word;
      }
    }
  } else if (searchTerm === 'fold') {
    if (str.includes(" fold ")) {
      return true;
    }
    const index = str.indexOf(searchTerm);
    if (index !== -1 && index === str.length - searchTerm.length && str[index - 1] === " ") {
      return true;
    }
    if (str.includes("```fold ")) {
      return true;
    }
    if (str.includes("```fold") && str.indexOf("```fold") + "```fold".length === str.length) {
      return true;
    }
      return false;
    } else {
    if (str.includes(searchTerm)) {
      const startIndex = str.indexOf(searchTerm) + searchTerm.length;
      const endIndex = str.indexOf(" ", startIndex);
      if (endIndex !== -1) {
        return originalStr.substring(startIndex, endIndex).trim();
      } else {
        return originalStr.substring(startIndex).trim();
      }
    }
  }
  
  return null;
}//searchString

export function getHighlightedLines(params: string): number[] {
  if (!params) {
    return [];
  }

  const trimmedParams = params.trim();
  const lines = trimmedParams.split(",");

  return lines.map(line => {
    if (line.includes("-")) {
      const range = line.split("-");
      const start = parseInt(range[0], 10);
      const end = parseInt(range[1], 10);
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
    return parseInt(line, 10);
  }).flat();
}// getHighlightedLines

export function isExcluded(lineText: string, excludeLangs: string[]) : boolean {
  const codeBlockLang = searchString(lineText, "```");
  const regexLangs = splitAndTrimString(excludeLangs).map(lang => new RegExp(`^${lang.replace(/\*/g, '.*')}$`, 'i'));
  
  for (const regexLang of regexLangs) {
    if (codeBlockLang && regexLang.test(codeBlockLang)) {
      return true;
    }
  }
  
  return false;
}// isExcluded

export function getLanguageIcon(DisplayName) {
  if (!DisplayName)
    return "";
    
  if (Icons.hasOwnProperty(DisplayName)) {
    return Icons[DisplayName];
  }
  
  return null;
}// getLanguageIcon

export function getLanguageName(code) {
  if (!code)
    return "";
  
  code = code.toLowerCase();
  
  if (Languages.hasOwnProperty(code)) {
    return Languages[code];
  } else if (manualLang.hasOwnProperty(code)) {
    return manualLang[code];
  } else if (code){
      return code.charAt(0).toUpperCase() + code.slice(1);
  }
  
  return "";
}// getLanguageName

export const BLOBS: Record<string, string> = {};
export function loadIcons(){
  for (const [key, value] of Object.entries(Icons)) {
    BLOBS[key.replace(/\s/g, "_")] = URL.createObjectURL(new Blob([`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32">${value}</svg>`], { type: "image/svg+xml" }));
  }
}// loadIcons

// Functions for displaying header BEGIN
export function createContainer(specific: boolean) {
  const container = document.createElement("div");
  container.classList.add(`codeblock-customizer-header-container${specific?'-specific':''}`);
  return container;
}// createContainer

export function createCodeblockLang(lang: string) {
  const codeblockLang = document.createElement("div");
  codeblockLang.innerText = lang;
  codeblockLang.classList.add(`codeblock-customizer-header-language-tag-${getLanguageName(lang)}`);
  return codeblockLang;
}// createCodeblockLang

export function createCodeblockIcon(displayLang: string) {
  const div = document.createElement("div");
  const img = document.createElement("img");
  img.classList.add("codeblock-customizer-icon");
  img.width = 28; //32
  img.src = BLOBS[displayLang.replace(/\s/g, "_")];

  div.appendChild(img);
  
  return div;
}// createCodeblockIcon

export function createFileName(text: string) {
  const fileName = document.createElement("div");
  fileName.innerText = text;
  fileName.classList.add("codeblock-customizer-header-text");
  return fileName;
}// createFileName

// Functions for displaying header END

const stylesDict = {
  activeCodeBlockLineColor: 'codeblock-active-line-color',
  activeLineColor: 'editor-active-line-color',
  backgroundColor: 'codeblock-background-color',
  highlightColor: 'highlight-color',
  headerColor: 'header-background-color',
  headerTextColor: 'header-text-color',
  headerLineColor: 'header-line-color',
  gutterTextColor: 'gutter-text-color',
  gutterBackgroundColor: 'gutter-background-color',
  codeBlockLangColor: 'language-tag-text-color',
  codeBlockLangBackgroundColor: 'language-tag-background-color',
}

export function updateSettingStyles(settings: CodeblockCustomizerSettings) {
  let colorThemes = settings.colorThemes;
  let styleId = 'codeblock-customizer-styles'
  let styleTag = document.getElementById(styleId);
  if (typeof(styleTag) == 'undefined' || styleTag == null) {
    styleTag = document.createElement('style');
    styleTag.id = styleId;
    document.getElementsByTagName('head')[0].appendChild(styleTag);
  }
  let defaultThemeColors = settings.colorThemes.find((theme) => {return theme['name'] == settings.SelectedTheme})['colors'];
  let currentTheme = {name: 'current', colors: {}};
  for (const key of Object.keys(stylesDict)) {
    let currentValue = accessSetting(key,settings);
    if (accessSetting(key,defaultThemeColors) != currentValue) {
      currentTheme['colors'][key] = currentValue;
    }
  }
  let altHighlightStyling = settings.alternateColors.reduce((styling,altHighlight) => {return styling + `
    .codeblock-customizer-line-highlighted-${altHighlight['name'].replace(/\s+/g, '-').toLowerCase()} {
      background-color: var(--codeblock-customiser-highlight-${altHighlight['name'].replace(/\s+/g, '-').toLowerCase()}-color) !important;
    }
  `},'');
  let textSettingsStyles = `
    body.codeblock-customizer [class^="codeblock-customizer-header-language-tag"] {
      --codeblock-customizer-language-tag-text-bold: ${settings.header.bCodeblockLangBold?'bold':'normal'};
      --codeblock-customizer-language-tag-text-italic: ${settings.header.bCodeblockLangItalic?'italic':'normal'};
    }
    body.codeblock-customizer .codeblock-customizer-header-text {
      --codeblock-customizer-header-text-bold: ${settings.header.bHeaderBold?'bold':'normal'};
      --codeblock-customizer-header-text-italic: ${settings.header.bHeaderItalic?'italic':'normal'};
    }
  `;
  styleTag.innerText = colorThemes.reduce((styles,theme) => {
    return styles + formatStyles(theme,settings.alternateColors);
  },formatStyles(currentTheme,settings.alternateColors)+altHighlightStyling+textSettingsStyles).trim().replace(/[\r\n\s]+/g, ' ');
  updateSettingClasses(settings);
}// setStyles

function updateSettingClasses(settings) {
  document.body.classList.remove("codeblock-customizer-active-line-highlight","codeblock-customizer-active-line-highlight-codeblock","codeblock-customizer-active-line-highlight-editor")
  if (settings.bActiveLineHighlight && settings.bActiveCodeblockLineHighlight) {
    // Inside and outside of codeblocks with different colors
    document.body.classList.add("codeblock-customizer-active-line-highlight");
  } else if (settings.bActiveLineHighlight && !settings.bActiveCodeblockLineHighlight) {
    // Only outside codeblocks
    document.body.classList.add("codeblock-customizer-active-line-highlight-editor");
  } else if (!settings.bActiveLineHighlight && settings.bActiveCodeblockLineHighlight) {
    // Only inside codeblocks
    document.body.classList.add("codeblock-customizer-active-line-highlight-codeblock");
  }
  
  if (settings.bEnableLineNumbers) {
    document.body.classList.add("codeblock-customizer-show-line-numbers");
  } else {
    document.body.classList.remove("codeblock-customizer-show-line-numbers");
  }
  
  document.body.classList.remove("codeblock-customizer-show-langnames","codeblock-customizer-show-langnames-always");
  if (settings.header.bAlwaysDisplayCodeblockLang) {
    document.body.classList.add("codeblock-customizer-show-langnames-always");
  } else if (settings.bDisplayCodeBlockLanguage) {
    document.body.classList.add("codeblock-customizer-show-langnames");
  }

  document.body.classList.remove("codeblock-customizer-show-langicons","codeblock-customizer-show-langicons-always");
  if (settings.header.bAlwaysDisplayCodeblockIcon) {
    document.body.classList.add("codeblock-customizer-show-langicons-always");
  } else if (settings.bDisplayCodeBlockIcon) {
    document.body.classList.add("codeblock-customizer-show-langicons");
  }

  if (settings.bGutterHighlight) {
    document.body.classList.add('codeblock-customizer-gutter-highlight');
  } else {
    document.body.classList.remove('codeblock-customizer-gutter-highlight');
  }
}// updateSettingStyles

function formatStyles(theme: {name: string, colors: CodeblockCustomizerColors},alternateColors) { //todo (@mayurankv) Add type hint for alternateColors
  let current = theme['name'] == "current";
  let themeClass = ''
  let altHighlightStyles = ''
  if (theme['name'] == 'Light Theme') {
    themeClass = 'theme-light';
    altHighlightStyles = addAltHighlightColors(alternateColors,true);
  } else if (theme['name'] == 'Dark Theme') {
    themeClass = 'theme-dark';
    altHighlightStyles = addAltHighlightColors(alternateColors,false);
  } else {
    themeClass = theme['name'].replace(/\s+/g, '-').toLowerCase();
  }
  return `
    body.codeblock-customizer${current ?'':`.${themeClass}`} {
      ${Object.keys(stylesDict).reduce((variables,key)=>{
        let cssVariable = `--codeblock-customizer-${stylesDict[key]}`;
        let cssValue = accessSetting(key,theme['colors']);
        let cssImportant = (themeClass == 'current' ?' !important':'');
        if (cssValue != null) {
          return variables + `${cssVariable}: ${cssValue + cssImportant};`;
        } else {
          return variables;
        }
      },altHighlightStyles)}
    }
  `;
}// formatStyles

function addAltHighlightColors(alternateColors, lightTheme: boolean) { //todo (@mayurankv) Add type hint for alternateColors
  let key = lightTheme?'lightColor':'darkColor';
  return alternateColors.reduce((altHighlightStyles,altHighlight) => {return altHighlightStyles + `--codeblock-customiser-highlight-${altHighlight['name'].replace(/\s+/g, '-').toLowerCase()}-color: ${altHighlight[key]};`},'')
}

function accessSetting(key: string, settings: CodeblockCustomizerSettings) {
  if (key in settings) {
    return settings[key];
  } else if ('header' in settings) {
    if (key in settings['header']) {
      return settings['header'][key];
    } else {
      let alt_key = key.charAt(6).toLowerCase()+key.slice(7);
      if (alt_key in settings['header']) {
        return settings['header'][alt_key];
      } 
    }
  } else {
    return null;
  }
}