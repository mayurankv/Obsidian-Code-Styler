import { MarkdownView, MarkdownPostProcessorContext, sanitizeHTMLToDom } from "obsidian";

import { searchString, getHighlightedLines, getLanguageName, isExcluded, getLanguageIcon, createContainer, createCodeblockLang, createCodeblockIcon, createFileName } from "./Utils";

export async function ReadingView(codeBlockElement: HTMLElement, context: MarkdownPostProcessorContext, plugin: CodeblockCustomizerPlugin) {

}