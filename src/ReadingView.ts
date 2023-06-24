import { TFile, MarkdownView, MarkdownPostProcessorContext, MarkdownSectionInformation, CachedMetadata, sanitizeHTMLToDom } from "obsidian";

import CodeblockCustomizerPlugin from "./main";
import { CodeblockCustomizerThemeSettings } from "./Settings";
import { CodeblockParameters, parseCodeblockParameters, isLanguageExcluded } from "./CodeblockParsing";
import { createHeader } from "./CodeblockDecorating";

export async function readingViewPostProcessor(element: HTMLElement, context: MarkdownPostProcessorContext, plugin: CodeblockCustomizerPlugin) {
	const codeblockCodeElement: HTMLElement | null = element.querySelector('pre > code');
	if (!codeblockCodeElement) 
		return;
	
	if (Array.from(codeblockCodeElement.classList).some(className => /^language-\S+/.test(className)))
		while(!codeblockCodeElement.classList.contains("is-loaded"))
			await sleep(2);
	
	const codeblockPreElement: HTMLPreElement | null = element.querySelector("pre:not(.frontmatter)");
	if (!codeblockPreElement)
		return;
		
	const codeblockSectionInfo: MarkdownSectionInformation | null = context.getSectionInfo(codeblockCodeElement);
	if (codeblockSectionInfo) {
		const view: MarkdownView | null = plugin.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view || typeof view?.editor === 'undefined')
			return;
		const codeblockFirstLine = view.editor.getLine(codeblockSectionInfo.lineStart);
		remakeCodeblock(codeblockCodeElement, codeblockPreElement, codeblockFirstLine, plugin);
	} else {
		// PDF export
		const file = plugin.app.vault.getAbstractFileByPath(context.sourcePath);
		if (!file) {
			console.error(`File not found: ${context.sourcePath}`);
			return;
		}
		const fileContent = await plugin.app.vault.cachedRead(<TFile> file).catch((error) => {
			console.error(`Error reading file: ${error.message}`);
			return '';
		});

		const cache: CachedMetadata | null = plugin.app.metadataCache.getCache(context.sourcePath);
		const fileContentLines = fileContent.split(/\n/g);
		const codeBlockFirstLines: Array<string> = [];

		if (typeof cache?.sections !== 'undefined') {
			for (const element of cache.sections)
				if (element.type === 'code')
					codeBlockFirstLines.push(fileContentLines[element.position.start.line]);
		} else {
			console.error(`Metadata cache not found for file: ${context.sourcePath}`);
			return;
		}
		try {
			PDFExport(element, plugin, codeBlockFirstLines);
		} catch (error) {
			console.error(`Error exporting to PDF: ${error.message}`);
			return;
		}
	}
}

function decorateCodeblock(codeblockCodeElement: HTMLElement, codeblockPreElement: HTMLElement, codeblockParameters: CodeblockParameters, themeSettings: CodeblockCustomizerThemeSettings) {
	createHeader(codeblockPreElement,codeblockParameters,themeSettings)
	let codeblockLines = codeblockCodeElement.innerHTML.split("\n");
	if (codeblockLines.length == 1)
		codeblockLines = ['',''];
	codeblockCodeElement.innerHTML = "";
	codeblockLines.forEach((line,index) => {
		const lineNumber = index + 1;
		const lineWrapper = document.createElement("div");
		//TODO (@mayurankv) Future: Speed this up by setting up a reverse dictionary for line number to highlights
		if (codeblockParameters.highlights.default.includes(lineNumber))
			lineWrapper.classList.add('codeblock-customizer-line-highlighted')
		Object.entries(codeblockParameters.highlights.alternative).forEach(([alternativeHighlight,highlightedLineNumbers]: [string,Array<number>]) => {
			if (highlightedLineNumbers.includes(lineNumber))
				lineWrapper.classList.add(`codeblock-customizer-line-highlighted-${alternativeHighlight.replace(/\s+/g, '-').toLowerCase()}`)
		})
		codeblockCodeElement.appendChild(lineWrapper);
		let lineNumberDisplay = '';
		if (!codeblockParameters.lineNumbers.alwaysEnabled && codeblockParameters.lineNumbers.alwaysDisabled)
			lineNumberDisplay = '-hide'
		else if (codeblockParameters.lineNumbers.alwaysEnabled && !codeblockParameters.lineNumbers.alwaysDisabled)
			lineNumberDisplay = '-specific'
		lineWrapper.appendChild(createDiv({cls: `codeblock-customizer-line-number${lineNumberDisplay}`, text: lineNumber.toString()}));
		lineWrapper.appendChild(createDiv({cls: `codeblock-customizer-line-text`, text: sanitizeHTMLToDom(line !== "" ? line : "<br>")}));
	})
}
function remakeCodeblock(codeblockCodeElement: HTMLElement, codeblockPreElement: HTMLElement, codeblockFirstLine: string, plugin: CodeblockCustomizerPlugin) {
	const codeblockParameters = parseCodeblockParameters(codeblockFirstLine,plugin.settings.currentTheme);
		
	const excludeCodeblock = isLanguageExcluded(codeblockParameters.language,plugin.settings.excludedLanguages);
	if (excludeCodeblock)
		return;

	codeblockPreElement.classList.add(`codeblock-customizer-pre`);
	if (codeblockPreElement.parentElement)
		codeblockPreElement.parentElement.classList.add(`codeblock-customizer-pre-parent`);

	decorateCodeblock(codeblockCodeElement,codeblockPreElement,codeblockParameters,plugin.settings.currentTheme.settings);
}
function PDFExport(element: HTMLElement, plugin: CodeblockCustomizerPlugin, codeBlockFirstLines: string[]) {
	const codeblockPreElements = element.querySelectorAll('pre:not(.frontmatter)');
	codeblockPreElements.forEach((codeblockPreElement: HTMLElement, key: number) => {
		const codeblockCodeElement: HTMLPreElement | null = codeblockPreElement.querySelector("pre > code");
		if (!codeblockCodeElement)
			return;
		const codeblockFirstLine = codeBlockFirstLines[key];
		remakeCodeblock(codeblockCodeElement, codeblockPreElement, codeblockFirstLine, plugin)
	})
}
