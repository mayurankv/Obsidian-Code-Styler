import { Languages, manualLang } from "./Const"

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
  str = str.toLowerCase();
  searchTerm = searchTerm.toLowerCase();
  if (searchTerm === "file:") {
    if (str.includes(searchTerm)) {
      const startIndex = str.indexOf(searchTerm) + searchTerm.length;
      let result = "";
      if (str[startIndex] === "\"") {
        const endIndex = str.indexOf("\"", startIndex + 1);
        if (endIndex !== -1) {
          result = str.substring(startIndex + 1, endIndex);
        } else {
          result = str.substring(startIndex + 1);
        }
      } else {
        const endIndex = str.indexOf(" ", startIndex);
        if (endIndex !== -1) {
          result = str.substring(startIndex, endIndex);
        } else {
          result = str.substring(startIndex);
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
        word = str.substring(startIndex, endIndex);
      } else {
        word = str.substring(startIndex);
      }
      if (!word.includes(":")) {
        if(word==="fold") 
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
        return str.substring(startIndex, endIndex).trim();
      } else {
        return str.substring(startIndex).trim();
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

export function getLanguageName(code) {
  if (!code)
    return "";
  
  code = code.toLowerCase();
  if (Languages.hasOwnProperty(code)) {
    return Languages[code];
  }
  else if (manualLang.hasOwnProperty(code)) {
    return manualLang[code];
  } else if (code){
      return code.charAt(0).toUpperCase() + code.slice(1)
  }
  
  return "";
}// getLanguageName
