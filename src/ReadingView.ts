import { MarkdownView, MarkdownPostProcessorContext, sanitizeHTMLToDom } from "obsidian";

import { searchString, getHighlightedLines, getLanguageName, isExcluded, getLanguageIcon, createContainer, createWrapper, createCodeblockLang, createCodeblockIcon, createFileName } from "./Utils";

export async function ReadingView(codeBlockElement: HTMLElement, context: MarkdownPostProcessorContext, plugin: CodeblockCustomizerPlugin) {
  const pluginSettings = plugin.settings;
  const codeElm: HTMLElement = codeBlockElement.querySelector('pre > code');
  
  if (!codeElm) 
    return;

  const classRegex = /^language-\S+/;
  const match = Array.from(codeElm.classList).some(className => classRegex.test(className));
  if (match)
    while(!codeElm.classList.contains("is-loaded"))
      await sleep(2);
    
  const codeblocks = codeBlockElement.querySelectorAll("code");
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
  const alternateColors = pluginSettings.alternateColors || [];
  let altHL = [];
  for (const { name, currentColor } of alternateColors) {
    const altParams = searchString(codeBlockFirstLine, `${name}:`);
    altHL = altHL.concat(getHighlightedLines(altParams).map((lineNumber) => ({ name, currentColor, lineNumber })));
  }

  let isCodeBlockExcluded = false;
  isCodeBlockExcluded = isExcluded(codeBlockFirstLine, pluginSettings.ExcludeLangs);

  // set background color
  if (!isCodeBlockExcluded){
    for (let index = 0; index < codeblocks.length; index++) {
      const Currentcodeblock = codeblocks.item(index);
      if (Currentcodeblock.parentNode && Currentcodeblock.parentNode.nodeName === "PRE") {
        // only process code element which have a PRE parent (don't process LI elements)
        Currentcodeblock.parentElement.style.backgroundColor = pluginSettings.backgroundColor;
      }
    }
  }

  const codeElements = codeBlockElement.getElementsByTagName("code");
  const codeBlockPreElement: HTMLPreElement | null = codeBlockElement.querySelector("pre:not(.frontmatter)");
  if (codeBlockPreElement === null) {
    return;
  }

  codeBlockPreElement.classList.add(`codeblock-customizer-pre`);
  
  AddHeaderAndHighlight(isCodeBlockExcluded, FileName, codeBlockPreElement, codeBlockLang, pluginSettings, Fold, codeElements, linesToHighlight, altHL );
}// ReadingView

function isAdmonition(lineText: string): boolean {
  const adTypes = ["ad-note", "ad-seealso", "ad-abstract", "ad-summary", "ad-tldr", "ad-info", "ad-todo", "ad-tip", "ad-hint", "ad-important", "ad-success", "ad-check", "ad-done", "ad-question", "ad-help", "ad-faq", "ad-warning", "ad-caution", "ad-attention", "ad-failure", "ad-fail", "ad-missing", "ad-danger", "ad-error", "ad-bug", "ad-example", "ad-quote", "ad-cite"];
  const codeBlockLang = searchString(lineText, "```");
  return adTypes.some((adType) => codeBlockLang && codeBlockLang.startsWith(adType));
}// isAdmonition

function HeaderWidget(preElements, textToDisplay, codeblockLanguage, metaInfo, bDisplayCodeBlockLanguage, Collapse, bDisplayCodeBlockIcon) {
  const parent = preElements.parentNode;
  
  const container = createContainer(metaInfo);
  const wrapper = createWrapper();
  if (codeblockLanguage && bDisplayCodeBlockIcon){
    const Icon = getLanguageIcon(codeblockLanguage)
    if (Icon) {
      wrapper.appendChild(createCodeblockIcon(codeblockLanguage, Icon, bDisplayCodeBlockLanguage));
    }
  }
  if (codeblockLanguage && bDisplayCodeBlockLanguage){
    wrapper.appendChild(createCodeblockLang(codeblockLanguage, metaInfo));
  }
  wrapper.appendChild(createFileName(textToDisplay, metaInfo));   
  container.appendChild(wrapper);  
  parent.insertBefore(container, preElements);
  
  // Add event listener to the widget element
  container.addEventListener("click", function() {
    // Toggle the "collapsed" class on the codeblock element
    preElements.classList.toggle("codeblock-customizer-coedeblock-collapsed");
  });
  
  if (Collapse) {
    preElements.classList.add(`codeblock-customizer-coedeblock-collapsed`);
  }
  
}// HeaderWidget

function createLineNumberElement(lineNumber, settings, isHighlighted, altHLMatch) {
  const lineNumberWrapper = document.createElement("div");
  lineNumberWrapper.classList.add(`codeblock-customizer-RVline-number`);
  lineNumberWrapper.style.setProperty("--codeblock-customizer-RVline-number-color", settings.gutterBackgroundColor);
  lineNumberWrapper.style.setProperty("--codeblock-customizer-RVline-number-textColor", settings.gutterTextColor);

  if (isHighlighted && settings.bGutterHighlight) {
    lineNumberWrapper.classList.add(`codeblock-customizer-RVline-number-highlighted`);
    lineNumberWrapper.style.setProperty("--codeblock-customizer-RVline-number-highlighted-color", settings.highlightColor);
  }
  else if (altHLMatch.length > 0 && settings.bGutterHighlight) {
    lineNumberWrapper.classList.add(`codeblock-customizer-RVline-number-highlighted-${altHLMatch[0].name}`);
    lineNumberWrapper.style.backgroundColor = altHLMatch[0].currentColor;
  }
  lineNumberWrapper.setText(lineNumber);
  
  return lineNumberWrapper;
}// createLineNumberElement

function createLineTextElement(line, lineNumber) {
  const lineText = line !== "" ? line : "<br>";
  const sanitizedText = sanitizeHTMLToDom(lineText);
  const lineContentWrapper = createDiv({cls: `codeblock-customizer-RVline-text`, text: sanitizedText});  
  
  return lineContentWrapper;
}// createLineTextElement

function highlightLines(codeElements, linesToHighlight, settings, altHL) {
  for (let i = 0; i < codeElements.length; i++) {
    const lines = codeElements[i].innerHTML.split("\n");
    
    const preElm = codeElements[i].parentNode;
    if (preElm && preElm.nodeName === "PRE") {
      preElm.classList.add(`codeblock-customizer-pre-parent`);
    }
    else // only process pre > code elements
      return;

    const codeWrapper = document.createElement("div");
    for (let j = 0; j < lines.length - 1; j++) {
      const line = lines[j];
      const lineNumber = j + 1;
      const isHighlighted = linesToHighlight.includes(lineNumber);
      const altHLMatch = altHL.filter((hl) => hl.lineNumber === lineNumber);

      // create line element
      const lineWrapper = document.createElement("div");
      lineWrapper.classList.add(`codeblock-customizer-RVline`);
      if (isHighlighted) {
        lineWrapper.classList.add(`codeblock-customizer-RVline-highlighted`);
        lineWrapper.style.setProperty("--codeblock-customizer-RVline-highlighted-color", settings.highlightColor);
      }
      else if (altHLMatch.length > 0) {
        lineWrapper.classList.add(`codeblock-customizer-RVline-highlighted-${altHLMatch[0].name}`);
        lineWrapper.style.backgroundColor = altHLMatch[0].currentColor;
      }
      codeWrapper.appendChild(lineWrapper);

      // create line number element
      if (settings.bEnableLineNumbers) {
        const lineNumberEl = createLineNumberElement(lineNumber, settings, isHighlighted, altHLMatch);
        lineWrapper.appendChild(lineNumberEl);
      }

      // create line text element
      const lineTextEl = createLineTextElement(line, lineNumber);
      lineWrapper.appendChild(lineTextEl);
    }
    codeElements[i].innerHTML = "";
    codeElements[i].appendChild(codeWrapper);
  }
}// highlightLines

function AddHeaderAndHighlight(isCodeBlockExcluded, FileName, codeBlockPreElement, codeBlockLang, pluginSettings, Fold, codeElements, linesToHighlight, altHL ){
  if (!isCodeBlockExcluded) {
    let isCodeBlockHeaderEnabled = false;
    if (FileName !== "" && FileName !== null) {
      isCodeBlockHeaderEnabled = true;
      HeaderWidget(codeBlockPreElement, FileName, getLanguageName(codeBlockLang), pluginSettings.header, pluginSettings.bDisplayCodeBlockLanguage, Fold, pluginSettings.bDisplayCodeBlockIcon);
    } else if (Fold) {
      isCodeBlockHeaderEnabled = true;
      HeaderWidget(codeBlockPreElement, "Collapsed code", getLanguageName(codeBlockLang), pluginSettings.header, pluginSettings.bDisplayCodeBlockLanguage, Fold, pluginSettings.bDisplayCodeBlockIcon);
    } else if (pluginSettings.bDisplayCodeBlockLanguage && pluginSettings.header.bAlwaysDisplayCodeblockLang && codeBlockLang) {
      isCodeBlockHeaderEnabled = true;
      HeaderWidget(codeBlockPreElement, "", getLanguageName(codeBlockLang), pluginSettings.header, pluginSettings.bDisplayCodeBlockLanguage, Fold, pluginSettings.bDisplayCodeBlockIcon);
    } else if (pluginSettings.bDisplayCodeBlockIcon && pluginSettings.header.bAlwaysDisplayCodeblockIcon && getLanguageIcon(getLanguageName(codeBlockLang)) && codeBlockLang) {
      isCodeBlockHeaderEnabled = true;
      HeaderWidget(codeBlockPreElement, "", getLanguageName(codeBlockLang), pluginSettings.header, pluginSettings.bDisplayCodeBlockLanguage, Fold, pluginSettings.bDisplayCodeBlockIcon);
    }

    highlightLines(codeElements, linesToHighlight, pluginSettings, altHL);
    if (!isCodeBlockHeaderEnabled && pluginSettings.bEnableLineNumbers) {
      codeBlockPreElement.classList.add(`codeblock-customizer-pre-radius`);
    } else if (isCodeBlockHeaderEnabled) {
      codeBlockPreElement.classList.add(`codeblock-customizer-pre-no-radius`);
      if (codeBlockPreElement.parentElement) {
        codeBlockPreElement.parentElement.classList.add(`codeblock-customizer-codeBlockPreElement-parent`);
      }
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
    for (const { name, currentColor } of alternateColors) {
      const altParams = searchString(codeBlockFirstLine, `${name}:`);
      altHL = altHL.concat(getHighlightedLines(altParams).map((lineNumber) => ({ name, currentColor, lineNumber })));
    }

    let isCodeBlockExcluded = false;
    isCodeBlockExcluded = isExcluded(codeBlockFirstLine, pluginSettings.ExcludeLangs);

    // set background color
    if (!isCodeBlockExcluded){
      if (codeElm.parentNode && codeElm.parentNode.nodeName === "PRE") {
        // only process code element which have a PRE parent (don't process LI elements)
        codeElm.parentElement.style.backgroundColor = pluginSettings.backgroundColor;
      }
    }

    const codeBlockPreElement: HTMLPreElement | null = codeElm.parentElement;
    if (codeBlockPreElement === null) {
      return;
    }

    codeBlockPreElement.classList.add(`codeblock-customizer-pre`);
    const codeElements = codeBlockPreElement.getElementsByTagName("code");

    AddHeaderAndHighlight(isCodeBlockExcluded, FileName, codeBlockPreElement, codeBlockLang, pluginSettings, Fold, codeElements, linesToHighlight, altHL );
	})
}// PDFExport
