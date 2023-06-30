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
		plugin.executeCodeMutationObserver.observe(codeblockPreElement,{
			childList: true,
			subtree: true,
			attributes: true,
			characterData: true,
		});
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
	//@ts-expect-error Undocumented Obsidian API
	const plugins: Record<string,any> = plugin.app.plugins.plugins
	if (codeblockParameters.language === 'preview') {
		if ('obsidian-code-preview' in plugins) {
			let codePreviewParams = await plugins['obsidian-code-preview'].code(codeblockLines.slice(1,-1).join('\n'),context.sourcePath);
			if (!codeblockParameters.lineNumbers.alwaysDisabled && !codeblockParameters.lineNumbers.alwaysEnabled) {
				if (typeof codePreviewParams.start === 'number')
					codeblockParameters.lineNumbers.offset = codePreviewParams.start - 1;
				codeblockParameters.lineNumbers.alwaysEnabled = codePreviewParams.lineNumber;
			}
			codeblockParameters.highlights.default.lineNumbers = [...new Set(codeblockParameters.highlights.default.lineNumbers.concat(Array.from(plugins['obsidian-code-preview'].analyzeHighLightLines(codePreviewParams.lines,codePreviewParams.highlight),([num,_])=>(num))))];
			if (codeblockParameters.title === '')
				codeblockParameters.title = codePreviewParams.filePath;
			codeblockParameters.language = codePreviewParams.language;
		}
	} else if (codeblockParameters.language === 'include') {
		if ('file-include' in plugins) {
			const fileIncludeLanguage = codeblockLines[0].match(/include(?:[:\s]+(?<lang>\w+))?/)?.groups?.lang;
			if (typeof fileIncludeLanguage !== 'undefined')
				codeblockParameters.language = fileIncludeLanguage;
		}
	}

	codeblockPreElement.classList.add(`codeblock-customizer-pre`);
	if (codeblockPreElement.parentElement)
		codeblockPreElement.parentElement.classList.add(`codeblock-customizer-pre-parent`);

	decorateCodeblock(codeblockCodeElement,codeblockPreElement,codeblockParameters,plugin.settings.currentTheme.settings);
	codeblockPreElement.style.setProperty('--line-number-margin',`${(codeblockCodeElement.querySelector('[class^="codeblock-customizer-line"]:last-child [class^="codeblock-customizer-line-number"]') as HTMLElement)?.offsetWidth}px`);
}
function decorateCodeblock(codeblockCodeElement: HTMLElement, codeblockPreElement: HTMLElement, codeblockParameters: CodeblockParameters, themeSettings: CodeblockCustomizerThemeSettings) {
	const headerContainer = createHeader(codeblockParameters, themeSettings);
	codeblockPreElement.insertBefore(headerContainer, codeblockPreElement.childNodes[0]);
	
	headerContainer.addEventListener("click", ()=>{
		codeblockPreElement.classList.toggle("codeblock-customizer-codeblock-collapsed")
		if (codeblockCodeElement.style.maxHeight)
			codeblockCodeElement.style.maxHeight = '';
		else
			codeblockCodeElement.style.maxHeight = 'var(--true-height)';
		const executeCodeOutput = (codeblockPreElement.querySelector('pre > code ~ code.language-output') as HTMLElement);
		if (executeCodeOutput && executeCodeOutput.style.display !== 'none') {
			if (executeCodeOutput.style.maxHeight)
				executeCodeOutput.style.maxHeight = '';
			else
				executeCodeOutput.style.maxHeight = 'var(--true-height)';
		}
	});

	let codeblockLines = codeblockCodeElement.innerHTML.split("\n");
	if (codeblockLines.length == 1)
		codeblockLines = ['',''];
	codeblockCodeElement.innerHTML = "";
	codeblockLines.forEach((line,index) => {
		if (index === codeblockLines.length-1)
			return;
		const lineNumber = index + 1;
		const lineWrapper = document.createElement("div");
		getLineClass(codeblockParameters,lineNumber,line).forEach((lineClass) => {
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

	setTimeout(()=>{ // Delay to return correct height
		codeblockCodeElement.style.setProperty('--true-height',`calc(${codeblockCodeElement.scrollHeight}px + 2 * var(--code-padding)`);
		codeblockCodeElement.style.maxHeight = 'var(--true-height)';
		codeblockCodeElement.style.whiteSpace = 'var(--line-wrapping)';
		if (codeblockParameters.fold.enabled) {
			codeblockPreElement.classList.add("codeblock-customizer-codeblock-collapsed");
			codeblockCodeElement.style.maxHeight = '';
		}
	},10);
}
async function PDFExport(element: HTMLElement, context: MarkdownPostProcessorContext, plugin: CodeblockCustomizerPlugin, codeblocks: Array<Array<string>>) {
	const codeblockPreElements = element.querySelectorAll('pre:not(.frontmatter)');
	for (let [key,codeblockPreElement] of Array.from(codeblockPreElements).entries()) {
		const codeblockCodeElement: HTMLPreElement | null = codeblockPreElement.querySelector("pre > code");
		if (!codeblockCodeElement)
			return;
		const codeblockLines = codeblocks[key];
		plugin.executeCodeMutationObserver.observe(codeblockPreElement,{
			childList: true,
			subtree: true,
			attributes: true,
			characterData: true,
		});
		await remakeCodeblock(codeblockCodeElement, (codeblockPreElement as HTMLElement), codeblockLines, context, plugin);
	}
}


export const executeCodeMutationObserver = new MutationObserver((mutations) => {
	mutations.forEach(mutation => {
		if (mutation.type === "attributes" && mutation.attributeName === "style" && (mutation.target as HTMLElement).tagName === 'CODE' && (mutation.target as HTMLElement).classList.contains('execute-code-output')) { // Change style of execute code output
			const executeCodeOutput = mutation.target as HTMLElement;
			if (executeCodeOutput.parentElement?.classList.contains('codeblock-customizer-codeblock-collapsed'))
				executeCodeOutput.style.maxHeight = '';
		} else if (mutation.type === "childList" && (mutation.target as HTMLElement).tagName === 'CODE' && (mutation.target as HTMLElement).classList.contains('execute-code-output')) { // Change children of execute code output
			const executeCodeOutput = mutation.target as HTMLElement;
			console.log('here')
			setTimeout(()=>{
				executeCodeOutput.style.setProperty('--true-height',`calc(${executeCodeOutput.scrollHeight}px + 3.5 * var(--code-padding) + var(--header-separator-width)`);
			},10)
		} else if (mutation.type === "attributes" && mutation.attributeName === "style" && (mutation.target as HTMLElement).tagName === 'INPUT' && (mutation.target as HTMLElement).parentElement?.tagName === 'CODE') { // Change style of execute code output input box
			const executeCodeOutput = mutation.target.parentElement as HTMLElement;
			console.log(executeCodeOutput)
			if (executeCodeOutput) {
				setTimeout(()=>{
					console.log(executeCodeOutput.scrollHeight)
					executeCodeOutput.style.setProperty('--true-height',`calc(${executeCodeOutput.scrollHeight}px + 3.5 * var(--code-padding) + var(--header-separator-width)`);
				},100)
			}
		} else if (mutation.type === "childList" && (mutation.target as HTMLElement).tagName === 'PRE') { // Add execute code output
			const executeCodeOutput = (mutation.target as HTMLElement).querySelector('pre > code ~ code.language-output') as HTMLElement;
			if (executeCodeOutput) {
				executeCodeOutput.classList.add('execute-code-output');
				if (!executeCodeOutput.style.maxHeight) {
					setTimeout(()=>{
						executeCodeOutput.style.setProperty('--true-height',`calc(${executeCodeOutput.scrollHeight}px + 3.5 * var(--code-padding) + var(--header-separator-width)`);
						executeCodeOutput.style.maxHeight = 'var(--true-height)';
						executeCodeOutput.style.whiteSpace = 'var(--line-wrapping)';
					},10)
				}
			}
		} else console.log(mutation)
	})
});
