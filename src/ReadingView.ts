import { TFile, MarkdownView, MarkdownPostProcessorContext, MarkdownSectionInformation, CachedMetadata, sanitizeHTMLToDom } from "obsidian";

import CodeblockCustomizerPlugin from "./main";
import { CodeblockCustomizerThemeSettings } from "./Settings";
import { CodeblockParameters, parseCodeblockParameters, isLanguageExcluded } from "./CodeblockParsing";
import { createHeader, getLineClass } from "./CodeblockDecorating";

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
	const cache: CachedMetadata | null = plugin.app.metadataCache.getCache(context.sourcePath);
	if (cache?.frontmatter?.['codeblock-customizer-ignore'] === true)
		return;
	if (codeblockSectionInfo) {
		const view: MarkdownView | null = plugin.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view || typeof view?.editor === 'undefined')
			return;
		const codeblockLines = Array.from({length: codeblockSectionInfo.lineEnd-codeblockSectionInfo.lineStart+1}, (_,num) => num + codeblockSectionInfo.lineStart).map((lineNumber)=>view.editor.getLine(lineNumber))
		await remakeCodeblock(codeblockCodeElement, codeblockPreElement, codeblockLines, context, plugin);
	} else {
		const file = plugin.app.vault.getAbstractFileByPath(context.sourcePath);
		if (!file) {
			console.error(`File not found: ${context.sourcePath}`);
			return;
		}
		const fileContent = await plugin.app.vault.cachedRead(<TFile> file).catch((error) => {
			console.error(`Error reading file: ${error.message}`);
			return '';
		});

		const fileContentLines = fileContent.split(/\n/g);
		const codeblocks: Array<Array<string>> = [];

		if (typeof cache?.sections !== 'undefined') {
			for (const element of cache.sections)
				if (element.type === 'code')
					codeblocks.push(fileContentLines.slice(element.position.start.line,element.position.end.line+1));
		} else {
			console.error(`Metadata cache not found for file: ${context.sourcePath}`);
			return;
		}
		try {
			await PDFExport(element, context, plugin, codeblocks);
		} catch (error) {
			console.error(`Error exporting to PDF: ${error.message}`);
			return;
		}
	}
}

async function remakeCodeblock(codeblockCodeElement: HTMLElement, codeblockPreElement: HTMLElement, codeblockLines: Array<string>, context: MarkdownPostProcessorContext, plugin: CodeblockCustomizerPlugin) {
	const codeblockParameters = parseCodeblockParameters(codeblockLines[0],plugin.settings.currentTheme);
		
	if (isLanguageExcluded(codeblockParameters.language,plugin.settings.excludedLanguages) || codeblockParameters.ignore)
		return;
	if (codeblockParameters.language === 'preview') {
		if ('obsidian-code-preview' in plugin.app.plugins.plugins) { //NOTE: (@mayurankv) Unpublished part of Obsidian API
			let codePreviewParams = await plugin.app.plugins.plugins['obsidian-code-preview'].code(codeblockLines.slice(1,-1).join('\n'),context.sourcePath);
			if (!codeblockParameters.lineNumbers.alwaysDisabled && !codeblockParameters.lineNumbers.alwaysEnabled) {
				if (typeof codePreviewParams.start === 'number')
					codeblockParameters.lineNumbers.offset = codePreviewParams.start - 1;
				codeblockParameters.lineNumbers.alwaysEnabled = codePreviewParams.lineNumber;
			}
			codeblockParameters.highlights.default = [...new Set(codeblockParameters.highlights.default.concat(Array.from(plugin.app.plugins.plugins['obsidian-code-preview'].analyzeHighLightLines(codePreviewParams.lines,codePreviewParams.highlight),([num,_])=>(num))))];
			if (codeblockParameters.title === '')
				codeblockParameters.title = codePreviewParams.filePath;
		}
	}

	codeblockPreElement.classList.add(`codeblock-customizer-pre`);
	if (codeblockPreElement.parentElement)
		codeblockPreElement.parentElement.classList.add(`codeblock-customizer-pre-parent`);

	decorateCodeblock(codeblockCodeElement,codeblockPreElement,codeblockParameters,plugin.settings.currentTheme.settings);
}
function decorateCodeblock(codeblockCodeElement: HTMLElement, codeblockPreElement: HTMLElement, codeblockParameters: CodeblockParameters, themeSettings: CodeblockCustomizerThemeSettings) {
	const headerContainer = createHeader(codeblockParameters, themeSettings);
	codeblockPreElement.insertBefore(headerContainer, codeblockPreElement.childNodes[0]);
	
	headerContainer.addEventListener("click", ()=>{
		codeblockPreElement.classList.toggle("codeblock-customizer-codeblock-collapsed")
	});
	if (codeblockParameters.fold.enabled)
		codeblockPreElement.classList.add("codeblock-customizer-codeblock-collapsed");

	let codeblockLines = codeblockCodeElement.innerHTML.split("\n");
	if (codeblockLines.length == 1)
		codeblockLines = ['',''];
	codeblockCodeElement.innerHTML = "";
	codeblockLines.forEach((line,index) => {
		if (index === codeblockLines.length-1)
			return;
		const lineNumber = index + 1;
		const lineWrapper = document.createElement("div");
		getLineClass(codeblockParameters,lineNumber).forEach((lineClass) => {
			lineWrapper.classList.add(lineClass);
		});
		codeblockCodeElement.appendChild(lineWrapper);
		let lineNumberDisplay = '';
		if (!codeblockParameters.lineNumbers.alwaysEnabled && codeblockParameters.lineNumbers.alwaysDisabled)
			lineNumberDisplay = '-hide'
		else if (codeblockParameters.lineNumbers.alwaysEnabled && !codeblockParameters.lineNumbers.alwaysDisabled)
			lineNumberDisplay = '-specific'
		lineWrapper.appendChild(createDiv({cls: `codeblock-customizer-line-number${lineNumberDisplay}`, text: (lineNumber+codeblockParameters.lineNumbers.offset).toString()}));
		lineWrapper.appendChild(createDiv({cls: `codeblock-customizer-line-text`, text: sanitizeHTMLToDom(line !== "" ? line : "<br>")}));
	});
}
async function PDFExport(element: HTMLElement, context: MarkdownPostProcessorContext, plugin: CodeblockCustomizerPlugin, codeblocks: Array<Array<string>>) {
	const codeblockPreElements = element.querySelectorAll('pre:not(.frontmatter)');
	for (let [key,codeblockPreElement] of Array.from(codeblockPreElements).entries()) {
		const codeblockCodeElement: HTMLPreElement | null = codeblockPreElement.querySelector("pre > code");
		if (!codeblockCodeElement)
			return;
		const codeblockLines = codeblocks[key];
		await remakeCodeblock(codeblockCodeElement, (codeblockPreElement as HTMLElement), codeblockLines, context, plugin);
	}
}
