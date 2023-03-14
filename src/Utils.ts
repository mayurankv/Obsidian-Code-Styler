import { Languages, manualLang, Icons } from "./Const"

export function splitAndTrimString(str) {
  if (!str) {
    return [];
  }
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
  const Langs = splitAndTrimString(excludeLangs);
  if (codeBlockLang && Langs.includes(codeBlockLang.toLowerCase())) {
    return true;
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
export function createContainer(header: CodeBlockMeta) {
  const container = document.createElement("div");
  container.classList.add("codeblock-customizer-header-container");
  container.style.setProperty("--header-color", header.color);
  container.style.setProperty("--header-line-color", header.lineColor);
  
  return container;
}// createContainer

export function createWrapper() {
  const wrapper = document.createElement("div");
  wrapper.classList.add("codeblock-customizer-header-wrapper");

  return wrapper;
}// createWrapper

export function createCodeblockLang(lang: string, header: CodeBlockMeta) {
  const codeblockLang = document.createElement("div");
  codeblockLang.innerText = lang;
  codeblockLang.classList.add("codeblock-customizer-header-language-tag");
  codeblockLang.style.setProperty("--codeblock-lang-background-color", header.codeBlockLangBackgroundColor);
  codeblockLang.style.setProperty("--codeblock-lang-color", header.codeBlockLangColor);
  if (header.bCodeblockLangBold)
    codeblockLang.style.setProperty("--codeblock-lang-bold", "bold");
  if (header.bCodeblockLangItalic)
  codeblockLang.style.setProperty("--codeblock-lang-italic", "italic");
  
  return codeblockLang;
}// createCodeblockLang

export function createCodeblockIcon(displayLang: string, Icon: string, bDisplayCodeBlockLanguage: boolean) {
  const div = document.createElement("div");
  div.classList.add("codeblock-customizer-icon-container");
  if (bDisplayCodeBlockLanguage)
    div.classList.add("codeblock-customizer-icon-container-codeblockLang");
  
  const img = document.createElement("img");
  img.classList.add("codeblock-customizer-icon");
  img.width = 28 //32
  img.src = BLOBS[displayLang.replace(/\s/g, "_")]

  div.appendChild(img);
  
  return div;
}// createCodeblockIcon

export function createFileName(text: string, header: CodeBlockMeta) {
  const fileName = document.createElement("div");
  fileName.innerText = text;
  fileName.classList.add("codeblock-customizer-header-text");
  fileName.style.setProperty("--header-text-color", header.textColor);
  if (header.bHeaderBold)
    fileName.style.setProperty("--header-bold", "bold");
  if (header.bHeaderItalic)
    fileName.style.setProperty("--header-italic", "italic");

  return fileName;
}// createFileName

// Functions for displaying header END

export function updateActiveLineStyles(settings) {
  if (settings.bActiveLineHighlight && settings.bActiveCodeblockLineHighlight) {
    // Inside and outside of codeblocks with different colors
    document.documentElement.style.setProperty("--codeblock-customizer-editor-active-line-color", settings.activeLineColor);
    document.documentElement.style.setProperty("--codeblock-customizer-codeblock-active-line-color", settings.activeCodeBlockLineColor);

    document.body.classList.add("codeblock-customizer-active-codeblock-line-highlight");
  } else if (settings.bActiveLineHighlight && !settings.bActiveCodeblockLineHighlight) {
    // Only outside codeblocks
    document.documentElement.style.setProperty("--codeblock-customizer-editor-active-line-color", settings.activeLineColor);
    document.documentElement.style.removeProperty("--codeblock-customizer-codeblock-active-line-color");
    
    document.body.classList.add("codeblock-customizer-active-codeblock-line-important");
    
    document.body.classList.remove("codeblock-customizer-active-codeblock-line-highlight");
  } else if (!settings.bActiveLineHighlight && settings.bActiveCodeblockLineHighlight) {
    // Only inside codeblocks
    document.documentElement.style.setProperty("--codeblock-customizer-codeblock-active-line-color", settings.activeCodeBlockLineColor);
    document.documentElement.style.removeProperty("--codeblock-customizer-editor-active-line-color");
    
    document.body.classList.remove("codeblock-customizer-active-codeblock-line-important");
    
    document.body.classList.add("codeblock-customizer-active-codeblock-line-highlight");
  } else {
    // Disabled
    document.documentElement.style.removeProperty("--codeblock-customizer-editor-active-line-color");
    document.documentElement.style.removeProperty("--codeblock-customizer-codeblock-active-line-color");

    document.body.classList.remove("codeblock-customizer-active-codeblock-line-highlight");
    document.body.classList.remove("codeblock-customizer-active-codeblock-line-important");
  }
}// updateActiveLineStyles