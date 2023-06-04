import { MarkdownView, MarkdownPostProcessorContext, sanitizeHTMLToDom } from "obsidian";

import { searchString, getHighlightedLines, getLanguageName, isExcluded, getLanguageIcon, createContainer, createCodeblockLang, createCodeblockIcon, createFileName } from "./Utils";

export async function ReadingView(codeBlockElement: HTMLElement, context: MarkdownPostProcessorContext, plugin: CodeblockCustomizerPlugin) {
  const codeElm: HTMLElement = codeBlockElement.querySelector('pre > code');
  
  if (!codeElm) 
    return;

  const classRegex = /^language-\S+/;
  const match = Array.from(codeElm.classList).some(className => classRegex.test(className));
  if (match)
    while(!codeElm.classList.contains("is-loaded"))
      await sleep(2);
    
  const codeBlockSectionInfo = context.getSectionInfo(codeElm);

  let codeBlockFirstLine = "";
  if (codeBlockSectionInfo) {
    const view = plugin.app.workspace.getActiveViewOfType(MarkdownView);
    if (view && view.editor)
      codeBlockFirstLine = view.editor.getLine(codeBlockSectionInfo.lineStart);
  } else {
    // PDF export
    const file = plugin.app.vault.getAbstractFileByPath(context.sourcePath);
    if (!file) {
      //console.error(`File not found: ${context.sourcePath}`);
      return;
    }
		const cache = plugin.app.metadataCache.getCache(context.sourcePath);
		const fileContent = await plugin.app.vault.cachedRead(<TFile> file).catch((error) => {
      //console.error(`Error reading file: ${error.message}`);
      return '';
    });
		const fileContentLines = fileContent.split(/\n/g);
		const codeBlockFirstLines: string[] = [];

		if (cache.sections) {
      for (const element of cache.sections) {
        if (element.type === 'code') {
          const lineStart = element.position.start.line;
          const codeBlockFirstLine = fileContentLines[lineStart];
          if (!isAdmonition(codeBlockFirstLine)) {
            codeBlockFirstLines.push(codeBlockFirstLine);
          }
        }
      }
    } else {
      //console.error(`Metadata cache not found for file: ${context.sourcePath}`);
      return;
    }
    try {
      await PDFExport(codeBlockElement, plugin, codeBlockFirstLines);
    } catch (error) {
      //console.error(`Error exporting to PDF: ${error.message}`);
      return;
    }
    return;
  }
  
  const codeBlockLang = searchString(codeBlockFirstLine, "```");
  const highlightedLinesParams = searchString(codeBlockFirstLine, "HL:");
  const linesToHighlight = getHighlightedLines(highlightedLinesParams);
  const FileName = searchString(codeBlockFirstLine, "file:");
  const Fold = searchString(codeBlockFirstLine, "fold");
  const alternateColors = plugin.settings.alternateColors || [];
  let altHL = [];
  for (const { name } of alternateColors) {
    const altParams = searchString(codeBlockFirstLine, `${name}:`);
    altHL = altHL.concat(getHighlightedLines(altParams).map((lineNumber) => ({ name, lineNumber })));
  }

  let isCodeBlockExcluded = false;
  isCodeBlockExcluded = isExcluded(codeBlockFirstLine, plugin.settings.ExcludeLangs);

  const codeElements = codeBlockElement.getElementsByTagName("code");
  const codeBlockPreElement: HTMLPreElement | null = codeBlockElement.querySelector("pre:not(.frontmatter)");
  if (codeBlockPreElement === null) {
    return;
  }
  if (!isCodeBlockExcluded) {
    codeBlockPreElement.classList.add(`codeblock-customizer-pre`);
  }
  
  AddHeaderAndHighlight(isCodeBlockExcluded, FileName, codeBlockPreElement, codeBlockLang, Fold, codeElements, linesToHighlight, altHL );
}// ReadingView

function isAdmonition(lineText: string): boolean {
  const adTypes = ["ad-note", "ad-seealso", "ad-abstract", "ad-summary", "ad-tldr", "ad-info", "ad-todo", "ad-tip", "ad-hint", "ad-important", "ad-success", "ad-check", "ad-done", "ad-question", "ad-help", "ad-faq", "ad-warning", "ad-caution", "ad-attention", "ad-failure", "ad-fail", "ad-missing", "ad-danger", "ad-error", "ad-bug", "ad-example", "ad-quote", "ad-cite"]; //TODO (@mayurankv) refactor to use regex
  const codeBlockLang = searchString(lineText, "```");
  return adTypes.some((adType) => codeBlockLang && codeBlockLang.startsWith(adType));
}// isAdmonition

function HeaderWidget(preElements, textToDisplay: string, specificHeader: boolean, codeblockLanguage: string, Collapse: boolean) {
  const parent = preElements.parentNode;
  
  const container = createContainer(specificHeader);
  if (codeblockLanguage){
    const Icon = getLanguageIcon(codeblockLanguage)
    if (Icon) {
      container.appendChild(createCodeblockIcon(codeblockLanguage));
    }
    container.appendChild(createCodeblockLang(codeblockLanguage));
  }
  container.appendChild(createFileName(textToDisplay));   
  parent.insertBefore(container, preElements);
  
  // Add event listener to the widget element
  container.addEventListener("click", function() {
    // Toggle the "collapsed" class on the codeblock element
    preElements.classList.toggle("codeblock-customizer-codeblock-collapsed");
  });
  
  if (Collapse) {
    preElements.classList.add(`codeblock-customizer-codeblock-collapsed`);
  }
  
}// HeaderWidget

function createLineNumberElement(lineNumber) {
  const lineNumberWrapper = document.createElement("div");
  //TODO (@mayurankv) If the numbers are set with ln parameter, then make this an if statement and instead add a new class called 'codeblock-customizer-line-number-specific' which can then be targeted by css
  lineNumberWrapper.classList.add(`codeblock-customizer-line-number`);
  lineNumberWrapper.setText(lineNumber);
  
  return lineNumberWrapper;
}// createLineNumberElement

function createLineTextElement(line) {
  const lineText = line !== "" ? line : "<br>";
  const sanitizedText = sanitizeHTMLToDom(lineText);
  const lineContentWrapper = createDiv({cls: `codeblock-customizer-line-text`, text: sanitizedText});  
  
  return lineContentWrapper;
}// createLineTextElement

function highlightLines(codeElements, linesToHighlight, altHL) {
  for (let i = 0; i < codeElements.length; i++) {
    const lines = codeElements[i].innerHTML.split("\n");
    
    const preElm = codeElements[i].parentNode;
    if (preElm === null || preElm.nodeName !== "PRE") { // only process pre > code elements
      return;
    }

    const lineNumberOffset = 0; //TODO (@mayurankv) Set offset here
    codeElements[i].innerHTML = "";
    for (let j = 0; j < lines.length - 1; j++) {
      const line = lines[j];
      const lineNumber = j + 1;
      const isHighlighted = linesToHighlight.includes(lineNumber);
      const altHLMatch = altHL.filter((hl) => hl.lineNumber === lineNumber);

      // create line element
      const lineWrapper = document.createElement("div");
      if (isHighlighted) {
        lineWrapper.classList.add(`codeblock-customizer-line-highlighted`);
      }
      else if (altHLMatch.length > 0) {
        lineWrapper.classList.add(`codeblock-customizer-line-highlighted-${altHLMatch[0].name.replace(/\s+/g, '-').toLowerCase()}`);
      }
      codeElements[i].appendChild(lineWrapper);

      // create line number element
      const lineNumberEl = createLineNumberElement(lineNumber+lineNumberOffset);
      lineWrapper.appendChild(lineNumberEl);

      // create line text element
      const lineTextEl = createLineTextElement(line);
      lineWrapper.appendChild(lineTextEl);
    }
  }
}// highlightLines

function AddHeaderAndHighlight(isCodeBlockExcluded, fileName, codeBlockPreElement, codeBlockLang, Fold, codeElements, linesToHighlight, altHL ){
  if (!isCodeBlockExcluded) {
    let specificHeader = true;
    if (fileName === null || fileName === "") {
      if (Fold) {
        fileName = 'Collapsed Code';
      } else {
        fileName = '';
        specificHeader = false;
      }
    }
    HeaderWidget(codeBlockPreElement, fileName, specificHeader, getLanguageName(codeBlockLang), Fold);

    highlightLines(codeElements, linesToHighlight, altHL);
    if (codeBlockPreElement.parentElement) {
      codeBlockPreElement.parentElement.classList.add(`codeblock-customizer-pre-parent`);
    }
  }
}// AddHeaderAndHighlight

function PDFExport(codeBlockElement: HTMLElement, plugin: CodeblockCustomizerPlugin, codeBlockFirstLines: string[]) {
  const codeBlocks = codeBlockElement.querySelectorAll('pre > code');
  const pluginSettings = plugin.settings;
	codeBlocks.forEach((codeElm, key) => {
    const codeBlockFirstLine = codeBlockFirstLines[key];
    const codeBlockLang = searchString(codeBlockFirstLine, "```");
    const highlightedLinesParams = searchString(codeBlockFirstLine, "HL:");
    const linesToHighlight = getHighlightedLines(highlightedLinesParams);
    const FileName = searchString(codeBlockFirstLine, "file:");
    const Fold = searchString(codeBlockFirstLine, "fold");
    const alternateColors = pluginSettings.alternateColors || [];
    let altHL = [];
    for (const { name, _ } of alternateColors) {
      const altParams = searchString(codeBlockFirstLine, `${name}:`);
      altHL = altHL.concat(getHighlightedLines(altParams).map((lineNumber) => ({ name, lineNumber })));
    }

    let isCodeBlockExcluded = false;
    isCodeBlockExcluded = isExcluded(codeBlockFirstLine, pluginSettings.ExcludeLangs);

    const codeBlockPreElement: HTMLPreElement | null = codeElm.parentElement;
    if (codeBlockPreElement === null) {
      return;
    }

    if (!isCodeBlockExcluded){
      codeBlockPreElement.classList.add(`codeblock-customizer-pre`);
    }
    const codeElements = codeBlockPreElement.getElementsByTagName("code");

    AddHeaderAndHighlight(isCodeBlockExcluded, FileName, codeBlockPreElement, codeBlockLang, pluginSettings, Fold, codeElements, linesToHighlight, altHL );
	})
}// PDFExport
