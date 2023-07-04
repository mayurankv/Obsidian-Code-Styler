import { TFile, MarkdownView, MarkdownSectionInformation, CachedMetadata, sanitizeHTMLToDom, FrontMatterCache } from "obsidian";

import CodeblockCustomizerPlugin from "./main";
import { CodeblockCustomizerThemeSettings, PRIMARY_DELAY, SECONDARY_DELAY } from "./Settings";
import { CodeblockParameters, parseCodeblockParameters, isLanguageExcluded, arraysEqual, parseCodeblockSource, pluginAdjustParameters, getParameterLine } from "./CodeblockParsing";
import { createHeader, getLineClass } from "./CodeblockDecorating";

export async function readingViewPostProcessor(element: HTMLElement, {sourcePath,getSectionInfo,frontmatter}: {sourcePath: string, getSectionInfo: (element: HTMLElement) => MarkdownSectionInformation | null, frontmatter: FrontMatterCache | undefined}, plugin: CodeblockCustomizerPlugin, editingEmbeds: boolean = false) {
	const cache: CachedMetadata | null = plugin.app.metadataCache.getCache(sourcePath);
	if (sourcePath === '' || (frontmatter ?? cache?.frontmatter)?.['codeblock-customizer-ignore'] === true)
		return;
	
	await sleep(50);
	// const view: MarkdownView | null = plugin.app.workspace.getActiveViewOfType(MarkdownView);
	// if (!element && view)
	if (!element)
		console.log('oh no!')
		// element = view.contentEl;
	let codeblockPreElements: Array<HTMLElement>;
	editingEmbeds = editingEmbeds || Boolean(element.matchParent(".cm-embed-block"));
	const specific = !element.querySelector(".view-content > *");

	if (!editingEmbeds && !specific)
		codeblockPreElements = Array.from(element.querySelectorAll('.markdown-reading-view pre:not(.frontmatter)'));
	else if (!editingEmbeds && specific)
		codeblockPreElements = Array.from(element.querySelectorAll('pre:not(.frontmatter)'));
	else if (editingEmbeds && !specific)
		codeblockPreElements = Array.from(element.querySelectorAll('.markdown-source-view .cm-embed-block pre:not(.frontmatter)'));
	else
		codeblockPreElements = [];
	if (codeblockPreElements.length === 0 && !(editingEmbeds && specific))
		return;

	if (editingEmbeds)
		console.log(editingEmbeds,specific,element,sourcePath)

	const codeblockSectionInfo: MarkdownSectionInformation | null= getSectionInfo(codeblockPreElements[0]);
	if (codeblockSectionInfo && specific && !editingEmbeds)
		renderSpecificReadingSection(codeblockPreElements,sourcePath,codeblockSectionInfo,plugin);
	else if (specific) {
		if (!(!editingEmbeds && element.classList.contains("admonition-content")))
			await readingViewPostProcessor(element.matchParent('.view-content') as HTMLElement,{sourcePath,getSectionInfo,frontmatter},plugin,editingEmbeds); // Re-render whole document
	}
	else
		renderDocument(codeblockPreElements,sourcePath,cache,editingEmbeds,plugin);
}
async function renderSpecificReadingSection(codeblockPreElements: Array<HTMLElement>, sourcePath: string, codeblockSectionInfo: MarkdownSectionInformation, plugin: CodeblockCustomizerPlugin): Promise<void> {
	const view: MarkdownView | null = plugin.app.workspace.getActiveViewOfType(MarkdownView);
	if (!view || typeof view?.editor === 'undefined')
		return;
	const codeblockLines = parseCodeblockSource(Array.from({length: codeblockSectionInfo.lineEnd-codeblockSectionInfo.lineStart+1}, (_,num) => num + codeblockSectionInfo.lineStart).map((lineNumber)=>view.editor.getLine(lineNumber))).codeblocks;
	for (let [key,codeblockPreElement] of codeblockPreElements.entries()) {
		let codeblockCodeElement = codeblockPreElement.querySelector('pre > code');
		if (!codeblockCodeElement)
			return;
		if (Array.from(codeblockCodeElement.classList).some(className => /^language-\S+/.test(className)))
			while(!codeblockCodeElement.classList.contains("is-loaded"))
				await sleep(2);
		// if (codeblockCodeElement.querySelector("code [class*='codeblock-customizer-line']"))
		// 	continue;
		await remakeCodeblock(codeblockCodeElement as HTMLElement,codeblockPreElement,codeblockLines[key],sourcePath,false,plugin);
	}
}
async function renderDocument(codeblockPreElements: Array<HTMLElement>, sourcePath: string, cache: CachedMetadata | null, editingEmbeds: boolean, plugin: CodeblockCustomizerPlugin) {
	const file = plugin.app.vault.getAbstractFileByPath(sourcePath);
	if (!file) {
		console.error(`File not found: ${sourcePath}`);
		return;
	}
	const fileContent = await plugin.app.vault.cachedRead(<TFile> file).catch((error) => {
		console.error(`Error reading file: ${error.message}`);
		return '';
	});

	const fileContentLines = fileContent.split(/\n/g);
	let codeblocks: Array<Array<string>> = [];

	if (typeof cache?.sections !== 'undefined') {
		for (const section of cache.sections) {
			if (!editingEmbeds || section.type === 'code' || section.type === 'callout') {
				const parsedCodeblock = parseCodeblockSource(fileContentLines.slice(section.position.start.line,section.position.end.line+1));
				if (!editingEmbeds || parsedCodeblock.nested)
					codeblocks = codeblocks.concat(parsedCodeblock.codeblocks);
			}
		}
	} else {
		console.error(`Metadata cache not found for file: ${sourcePath}`);
		return;
	}
	console.log(codeblockPreElements,codeblocks)
	if (codeblockPreElements.length !== codeblocks.length)
		return;
	try {
		for (let [key,codeblockPreElement] of Array.from(codeblockPreElements).entries()) {
			const codeblockCodeElement: HTMLPreElement | null = codeblockPreElement.querySelector("pre > code");
			if (!codeblockCodeElement)
				return;
			if (Array.from(codeblockCodeElement.classList).some(className => /^language-\S+/.test(className)))
				while(!codeblockCodeElement.classList.contains("is-loaded"))
					await sleep(2);
			if (codeblockCodeElement.querySelector("code [class*='codeblock-customizer-line']"))
				continue;
			const codeblockLines = codeblocks?.[key];
			if (!codeblockLines)
				return;
			await remakeCodeblock(codeblockCodeElement,codeblockPreElement,codeblockLines,sourcePath,editingEmbeds,plugin);
		}
	} catch (error) {
		console.error(`Error exporting to PDF: ${error.message}`);
		return;
	}
}

async function remakeCodeblock(codeblockCodeElement: HTMLElement, codeblockPreElement: HTMLElement, codeblockLines: Array<string>, sourcePath: string, editingEmbeds: boolean, plugin: CodeblockCustomizerPlugin) {
	let parameterLine = getParameterLine(codeblockLines);
	if (!parameterLine)
		return;
	let codeblockParameters = parseCodeblockParameters(parameterLine,plugin.settings.currentTheme);
		
	if (isLanguageExcluded(codeblockParameters.language,plugin.settings.excludedLanguages) || codeblockParameters.ignore)
		return;
	codeblockParameters = await pluginAdjustParameters(codeblockParameters,plugin,codeblockLines,sourcePath);

	plugin.executeCodeMutationObserver.observe(codeblockPreElement,{
		childList: true,
		subtree: true,
		attributes: true,
		characterData: true,
	});

	codeblockPreElement.classList.add(`codeblock-customizer-pre`);
	codeblockPreElement.classList.add(`language-${codeblockParameters.language}`);
	if (codeblockPreElement.parentElement)
		codeblockPreElement.parentElement.classList.add(`codeblock-customizer-pre-parent`);

	decorateCodeblock(codeblockCodeElement,codeblockPreElement,codeblockParameters,editingEmbeds,plugin.settings.currentTheme.settings,plugin.languageIcons);
	setTimeout(()=>{
		codeblockPreElement.style.setProperty('--line-number-margin',`${(codeblockCodeElement.querySelector('[class^="codeblock-customizer-line"]:last-child [class^="codeblock-customizer-line-number"]') as HTMLElement)?.offsetWidth}px`);
	},SECONDARY_DELAY);
}
function decorateCodeblock(codeblockCodeElement: HTMLElement, codeblockPreElement: HTMLElement, codeblockParameters: CodeblockParameters, editingEmbeds: boolean, themeSettings: CodeblockCustomizerThemeSettings, languageIcons: Record<string,string>) {
	const headerContainer = createHeader(codeblockParameters, themeSettings,languageIcons);
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

	if (codeblockParameters.lineUnwrap.alwaysEnabled) {
		codeblockCodeElement.style.setProperty('--line-wrapping','pre');
		if (codeblockParameters.lineUnwrap.activeWrap)
			codeblockCodeElement.style.setProperty('--line-active-wrapping','pre-wrap');
		else
			codeblockCodeElement.style.setProperty('--line-active-wrapping','pre');
	} else if (codeblockParameters.lineUnwrap.alwaysDisabled)
		codeblockCodeElement.style.setProperty('--line-wrapping','pre-wrap');

	setTimeout(()=>{ // Delay to return correct height
		codeblockCodeElement.style.setProperty('--true-height',`calc(${codeblockCodeElement.scrollHeight}px + 2 * var(--code-padding)`);
		codeblockCodeElement.style.maxHeight = 'var(--true-height)';
		codeblockCodeElement.style.whiteSpace = 'var(--line-wrapping)';
		if (codeblockParameters.fold.enabled) {
			codeblockPreElement.classList.add("codeblock-customizer-codeblock-collapsed");
			codeblockCodeElement.style.maxHeight = '';
		}
	},PRIMARY_DELAY);

	if (codeblockCodeElement.querySelector("code [class*='codeblock-customizer-line']"))
		return;

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
}

export function destroyReadingModeElements(): void {
	document.querySelectorAll(".codeblock-customizer-pre-parent").forEach(codeblockPreParent => {
		codeblockPreParent.classList.remove('codeblock-customizer-pre-parent');
	});
	[
		...Array.from(document.querySelectorAll("pre.codeblock-customizer-pre div[class^='codeblock-customizer-header-container']")),
		...Array.from(document.querySelectorAll("pre.codeblock-customizer-pre div[class^='codeblock-customizer-line-number']")),
	].forEach(element => element.remove());
	document.querySelectorAll("pre.codeblock-customizer-pre").forEach(codeblockPreElement => {
		codeblockPreElement.classList.remove('codeblock-customizer-pre');
		codeblockPreElement.classList.remove('codeblock-customizer-codeblock-collapsed');
		(codeblockPreElement as HTMLElement).style.removeProperty('--true-height');
		(codeblockPreElement as HTMLElement).style.removeProperty('--line-number-margin');
		(codeblockPreElement as HTMLElement).style.removeProperty('max-height');
		(codeblockPreElement as HTMLElement).style.removeProperty('white-space');
	});
	document.querySelectorAll('pre > code ~ code.language-output').forEach(executeCodeOutput => {
		executeCodeOutput.classList.remove('execute-code-output');
		(executeCodeOutput as HTMLElement).style.removeProperty('--true-height');
		(executeCodeOutput as HTMLElement).style.removeProperty('max-height');
	})
	document.querySelectorAll('pre > code:nth-of-type(1)').forEach(codeblockCodeElement => {
		(codeblockCodeElement as HTMLElement).style.removeProperty('--true-height');
		(codeblockCodeElement as HTMLElement).style.removeProperty('--line-wrapping');
		(codeblockCodeElement as HTMLElement).style.removeProperty('--line-active-wrapping');
		(codeblockCodeElement as HTMLElement).style.removeProperty('max-height');
		(codeblockCodeElement as HTMLElement).style.removeProperty('white-space');
		(codeblockCodeElement as HTMLElement).innerHTML = Array.from(codeblockCodeElement.querySelectorAll('code > [class*="codeblock-customizer-line"]')).reduce((reconstructedCodeblockLines: Array<string>, codeblockLine: HTMLElement): Array<string> => {
			const codeblockLineText = (codeblockLine.firstChild as HTMLElement);
			if (codeblockLineText)
				reconstructedCodeblockLines.push(codeblockLineText.innerHTML);
			return reconstructedCodeblockLines
		},[]).join('\n')+'\n';
	})
}

export const executeCodeMutationObserver = new MutationObserver((mutations) => {
	mutations.forEach((mutation: MutationRecord) => {
		if (mutation.type === "attributes" && mutation.attributeName === "style" && (mutation.target as HTMLElement).tagName === 'CODE' && (mutation.target as HTMLElement).classList.contains('execute-code-output')) { // Change style of execute code output
			const executeCodeOutput = mutation.target as HTMLElement;
			if (executeCodeOutput.parentElement?.classList.contains('codeblock-customizer-codeblock-collapsed'))
				executeCodeOutput.style.maxHeight = '';
		} else if (mutation.type === "childList" && (mutation.target as HTMLElement).tagName === 'CODE' && (mutation.target as HTMLElement).classList.contains('execute-code-output')) { // Change children of execute code output
			const executeCodeOutput = mutation.target as HTMLElement;
			setTimeout(()=>{
				executeCodeOutput.style.setProperty('--true-height',`calc(${executeCodeOutput.scrollHeight}px + 3.5 * var(--code-padding) + var(--header-separator-width)`);
			},PRIMARY_DELAY)
		} else if (mutation.type === "attributes" && mutation.attributeName === "style" && (mutation.target as HTMLElement).tagName === 'INPUT' && (mutation.target as HTMLElement).parentElement?.tagName === 'CODE') { // Change style of execute code output input box
			const executeCodeOutput = mutation.target.parentElement as HTMLElement;
			if (executeCodeOutput) {
				setTimeout(()=>{
					executeCodeOutput.style.setProperty('--true-height',`calc(${executeCodeOutput.scrollHeight}px + 3.5 * var(--code-padding) + var(--header-separator-width)`);
				},SECONDARY_DELAY)
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
					},PRIMARY_DELAY)
				}
			}
		}
	})
});
