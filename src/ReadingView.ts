import { MarkdownView, MarkdownPostProcessorContext, sanitizeHTMLToDom } from "obsidian";

import { searchString, getHighlightedLines, getLanguageName, isExcluded } from "./Utils";

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
    codeBlockFirstLine = view.editor.getLine(codeBlockSectionInfo.lineStart);
  }
  
  const codeBlockLang = searchString(codeBlockFirstLine, "```");
  const highlightedLinesParams = searchString(codeBlockFirstLine, "HL:");
  const linesToHighlight = getHighlightedLines(highlightedLinesParams);
  const FileName = searchString(codeBlockFirstLine, "file:");
  const Fold = searchString(codeBlockFirstLine, "fold");
  
  let isCodeBlockExcluded = false;
  isCodeBlockExcluded = isExcluded(codeBlockFirstLine, pluginSettings.ExcludeLangs);

  // set background color
  if (!isCodeBlockExcluded){
    for (let index = 0; index < codeblocks.length; index++) {
      const Currentcodeblock = codeblocks.item(index);
      Currentcodeblock.parentElement.style.backgroundColor = pluginSettings.backgroundColor;
    }
  }
 
  const codeElements = codeBlockElement.getElementsByTagName("code");
  const codeBlockPreElement: HTMLPreElement = codeBlockElement.querySelector("pre:not(.frontmatter)");
  codeBlockPreElement.classList.add("codeblock-customizer-pre");
  
  if (!isCodeBlockExcluded) {
    let isCodeBlockHeaderEnabled = false;
    if (FileName !== "" && FileName !== null) {
      isCodeBlockHeaderEnabled = true;
      HeaderWidget(codeBlockPreElement, FileName, getLanguageName(codeBlockLang), pluginSettings.header, pluginSettings.bDisplayCodeBlockLanguage, Fold);
    } else if (Fold) {
      isCodeBlockHeaderEnabled = true;
      HeaderWidget(codeBlockPreElement, "Collapsed code", getLanguageName(codeBlockLang), pluginSettings.header, pluginSettings.bDisplayCodeBlockLanguage, Fold);
    } else if (pluginSettings.bDisplayCodeBlockLanguage && pluginSettings.header.bAlwaysDisplayCodeblockLang && codeBlockLang) {
      isCodeBlockHeaderEnabled = true;
      //space is required!
      HeaderWidget(codeBlockPreElement, "", getLanguageName(codeBlockLang), pluginSettings.header, pluginSettings.bDisplayCodeBlockLanguage, Fold);
    }
    
    highlightLines(codeElements, linesToHighlight, pluginSettings);
    if (!isCodeBlockHeaderEnabled && pluginSettings.bEnableLineNumbers) {
      codeBlockPreElement.classList.add("codeblock-customizer-pre-radius");
    } else if (isCodeBlockHeaderEnabled) {
      codeBlockPreElement.classList.add("codeblock-customizer-pre-no-radius");
    }
  }
}// ReadingView

function HeaderWidget(preElements, textToDisplay, codeblockLanguage, metaInfo, bDisplayCodeBlockLanguage, Collapse) {
  const parent = preElements.parentNode;
  
  const container = createContainer(metaInfo);
  const wrapper = createWrapper();
  if (codeblockLanguage && bDisplayCodeBlockLanguage){
    wrapper.appendChild(createCodeblockLang(codeblockLanguage, metaInfo));
  }
  wrapper.appendChild(createFileName(textToDisplay, metaInfo));   
  container.appendChild(wrapper);  
  parent.insertBefore(container, preElements);
  
  // Add event listener to the widget element
  container.addEventListener("click", function() {
    // Toggle the "collapsed" class on the codeblock element
    preElements.classList.toggle("collapsed");
  });
  
  if (Collapse) {
    preElements.classList.add("collapsed");
  }

  // Add CSS styles for the "collapsed" class
  const style = document.createElement("style");
  style.innerHTML = ` .collapsed { display: none; }`;
  document.head.appendChild(style);
}// HeaderWidget

function createContainer(header: CodeBlockMeta) {
  const container = document.createElement("div");
  container.classList.add("codeblock-customizer-header-container");
  container.style.setProperty("--header-color", header.color);
  container.style.setProperty("--header-line-color", header.lineColor);
  
  return container;
}// createContainer

function createWrapper() {
  const wrapper = document.createElement("div");
  wrapper.classList.add("codeblock-customizer-header-wrapper");
  
  return wrapper;
}// createWrapper

function createCodeblockLang(lang: string, header: CodeBlockMeta) {
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

function createFileName(text: string, header: CodeBlockMeta) {
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

function createLineNumberElement(lineNumber, settings, isHighlighted) {
  const lineNumberWrapper = document.createElement("div");
  lineNumberWrapper.classList.add("codeblock-customizer-line-number");
  lineNumberWrapper.style.backgroundColor = settings.gutterBackgroundColor;
  lineNumberWrapper.style.color = settings.gutterTextColor;
  if (isHighlighted && settings.bGutterHighlight) {
    lineNumberWrapper.classList.add("codeblock-customizer-line-number-highlighted");
    lineNumberWrapper.style.backgroundColor = settings.highlightColor;
  }
  lineNumberWrapper.innerHTML = lineNumber;
  
  return lineNumberWrapper;
}// createLineNumberElement

function createLineTextElement(line, lineNumber) {
  const lineText = line !== "" ? line : "<br>";
  const sanitizedText = sanitizeHTMLToDom(lineText);
  const lineContentWrapper = createDiv({cls: "codeblock-customizer-line-text", text: sanitizedText});  
  
  return lineContentWrapper;
}// createLineTextElement

function highlightLines(codeElements, linesToHighlight, settings) {
  for (let i = 0; i < codeElements.length; i++) {
    const lines = codeElements[i].innerHTML.split("\n");

    const preElm = codeElements[i].parentNode;
    if (preElm){
      preElm.classList.add("codeblock-customizer-pre-parent");      
    }
    
    const codeWrapper = document.createElement("div");
    for (let j = 0; j < lines.length - 1; j++) {
      const line = lines[j];
      const lineNumber = j + 1;
      const isHighlighted = linesToHighlight.includes(lineNumber);

      // create line element
      const lineWrapper = document.createElement("div");
      lineWrapper.classList.add("codeblock-customizer-line");
      if (isHighlighted) {
        lineWrapper.classList.add("codeblock-customizer-line-highlighted");
        lineWrapper.style.backgroundColor = settings.highlightColor;
      }
      codeWrapper.appendChild(lineWrapper);

      // create line number element
      if (settings.bEnableLineNumbers) {
        const lineNumberEl = createLineNumberElement(lineNumber, settings, isHighlighted);
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
