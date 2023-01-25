import { MarkdownView, MarkdownPostProcessorContext } from "obsidian";

import { searchString, getHighlightedLines, getLanguageName, isExcluded } from "./Utils";

export async function ReadingView(codeBlockElement: HTMLElement, context: MarkdownPostProcessorContext, plugin: CodeBlockRedesignPlugin) {
	const pluginSettings = plugin.settings
  const codeElm: HTMLElement = codeBlockElement.querySelector('pre > code')
  
	if (!codeElm) 
    return;

  const classRegex = /^language-\S+/;
  const match = Array.from(codeElm.classList).some(className => classRegex.test(className));
  if (match)
    while(!codeElm.classList.contains("is-loaded"))
      await sleep(2);
    
  const codeblocks = codeBlockElement.querySelectorAll("code");
  const codeBlockSectionInfo = context.getSectionInfo(codeElm)
	
  let codeBlockFirstLine = "";
  if (codeBlockSectionInfo) {
		const view = app.workspace.getActiveViewOfType(MarkdownView)
		codeBlockFirstLine = view.editor.getLine(codeBlockSectionInfo.lineStart)    
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
  
  if (!isCodeBlockExcluded){
    let isCodeBlockHeaderEnabled = false;
    if (FileName !== "" && FileName !== null){
      isCodeBlockHeaderEnabled = true;
      HeaderWidget(codeBlockPreElement, FileName, getLanguageName(codeBlockLang), pluginSettings.header, pluginSettings.bDisplayCodeBlockLanguage, Fold);
    } else if (Fold){
      isCodeBlockHeaderEnabled = true;
      HeaderWidget(codeBlockPreElement, "Collapsed code", getLanguageName(codeBlockLang), pluginSettings.header, pluginSettings.bDisplayCodeBlockLanguage, Fold);
    } else if (pluginSettings.bDisplayCodeBlockLanguage && pluginSettings.header.bAlwaysDisplayCodeblockLang && codeBlockLang) {
      isCodeBlockHeaderEnabled = true;
      //space is required!
      HeaderWidget(codeBlockPreElement, "", getLanguageName(codeBlockLang), pluginSettings.header, pluginSettings.bDisplayCodeBlockLanguage, Fold);
    }
    
    highlightLines(codeElements, linesToHighlight, pluginSettings);
    if (!isCodeBlockHeaderEnabled && pluginSettings.bEnableLineNumbers){
      codeBlockPreElement.style.borderTopLeftRadius = "5px";
      codeBlockPreElement.style.borderBottomLeftRadius = "5px";
    } else if (isCodeBlockHeaderEnabled) {
      codeBlockPreElement.style.borderTopLeftRadius = "0px";
      codeBlockPreElement.style.borderTopRightRadius = "0px";
    }
    
  }
}// ReadingView

function HeaderWidget(preElements, textToDisplay, codeblockLanguage, metaInfo, bDisplayCodeBlockLanguage, Collapse) {
  preElements.style.marginTop = "0px"; // originalVal: 16px, set it to 0, so the header is displayed above the codeblock
  const parent = preElements.parentNode;
  
  const container = createContainer(metaInfo);
  const wrapper = createWrapper();
  if (codeblockLanguage && bDisplayCodeBlockLanguage){
    wrapper.appendChild(createCodeblockLang(codeblockLanguage, metaInfo));
  }
  wrapper.appendChild(createFileName(textToDisplay, metaInfo));   
  container.appendChild(wrapper);
  container.style.marginTop = "16px"; // originalVal: none, set it to 16px, so the headergets the marginTop, which was removed from the first line of the codeblock
  parent.insertBefore(container, preElements);
  
  // Add event listener to the widget element
  container.addEventListener("click", function() {
    // Toggle the "collapsed" class on the codeblock element
    preElements.classList.toggle("collapsed");
  });
  
  if(Collapse){
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
  container.style.cssText = 'user-select: none'; 
  container.style.borderTopLeftRadius = '5px';
  container.style.borderTopRightRadius = '5px';
  container.style.backgroundColor = header.color;
  container.style.borderBottom = "2px";
  //container.style.borderBottomWidth = "2px";
  container.style.borderBottomStyle = "groove";
  container.style.borderBottomColor = header.lineColor;
  
  return container;
}// createContainer

function createWrapper() {
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  
  return wrapper;
}// createWrapper

function createCodeblockLang(lang: string, header: CodeBlockMeta) {
  const codeblockLang = document.createElement("div");
  codeblockLang.classList.add("codeblock-customizer-header-language-tag");
  codeblockLang.style.backgroundColor = header.codeBlockLangBackgroundColor;
  codeblockLang.style.color = header.codeBlockLangColor;
  codeblockLang.style.borderRadius = "5px 5px 5px 0px";
  codeblockLang.innerText = lang;
  if (header.bCodeblockLangBold)
    codeblockLang.style.fontWeight = "bold";
  if (header.bCodeblockLangItalic)
    codeblockLang.style.fontStyle = "italic";
  
  return codeblockLang;
}// createCodeblockLang

function createFileName(text: string, header: CodeBlockMeta) {
  const fileName = document.createElement("div");
  fileName.innerText = text;
  fileName.classList.add("codeblock-customizer-header-text");
  fileName.style.color = header.textColor;
  if (header.bHeaderBold)
    fileName.style.fontWeight = "bold";
  if (header.bHeaderItalic)
    fileName.style.fontStyle = "italic";

  return fileName;
}// createFileName

function createLineNumberElement(lineNumber, settings, isHighlighted) {
  const lineNumberWrapper = document.createElement("div");
  lineNumberWrapper.classList.add("codeblock-customizer-line-number");
  lineNumberWrapper.style.backgroundColor = settings.gutterBackgroundColor;
  lineNumberWrapper.style.color = settings.gutterTextColor;
  if (isHighlighted && settings.bGutterHighlight) {
    lineNumberWrapper.classList.add("codeblock-customizer-line-highlighted");
    lineNumberWrapper.style.backgroundColor = settings.highlightColor;
  }
  lineNumberWrapper.innerHTML = lineNumber;
  
  return lineNumberWrapper;
}// createLineNumberElement

function createLineTextElement(line, lineNumber, lastLine) {
  const lineContentWrapper = document.createElement("div");
  lineContentWrapper.classList.add("codeblock-customizer-line-text");
  lineContentWrapper.style.paddingLeft = "16px"; //originalVal:0px, add padding between the line numbers and the text
  lineContentWrapper.innerHTML = line;
  
  return lineContentWrapper;
}// createLineTextElement

function highlightLines(codeElements, linesToHighlight, settings) {
  for (let i = 0; i < codeElements.length; i++) {
    const lines = codeElements[i].innerHTML.split("\n");

    const preElm = codeElements[i].parentNode;
    if (preElm){
      preElm.style.paddingRight = "0px";  // originalVal: 16px, disable it, so the lines are fully highlighted
      preElm.style.paddingLeft = "0px";   // originalVal: 16px, disable it, so the lines are fully highlighted
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
      const lineTextEl = createLineTextElement(line, lineNumber, lines.length - 1);
      lineWrapper.appendChild(lineTextEl);
    }
    codeElements[i].innerHTML = "";
    codeElements[i].appendChild(codeWrapper);
  }
}// highlightLines
