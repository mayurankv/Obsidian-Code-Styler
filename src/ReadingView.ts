import { MarkdownSectionInformation, CachedMetadata, sanitizeHTMLToDom, FrontMatterCache, MarkdownRenderer, Component } from "obsidian";

import CodeStylerPlugin from "./main";
import { PRIMARY_DELAY, SECONDARY_DELAY } from "./Settings";
import { CodeblockParameters, getFileContentLines, isExcluded, parseCodeblockSource } from "./CodeblockParsing";
import { createHeader, getLineClass } from "./CodeblockDecorating";

export async function readingViewCodeblockDecoratingPostProcessor(element: HTMLElement, {sourcePath,getSectionInfo,frontmatter}: {sourcePath: string, getSectionInfo: (element: HTMLElement) => MarkdownSectionInformation | null, frontmatter: FrontMatterCache | undefined}, plugin: CodeStylerPlugin, editingEmbeds: boolean = false) {
	const cache: CachedMetadata | null = plugin.app.metadataCache.getCache(sourcePath);
	if (!sourcePath || !element || (frontmatter ?? cache?.frontmatter)?.['code-styler-ignore'] === true)
		return;

	await sleep(50);
	let codeblockPreElements: Array<HTMLElement>;
	editingEmbeds = editingEmbeds || Boolean(element.matchParent(".cm-embed-block"));
	const specific = !element.querySelector(".view-content > *");
	const printing = Boolean(element.querySelector("div.print > *"));
	if (printing && !plugin.settings.decoratePrint)
		return;

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

	if (!editingEmbeds && !printing) {
		const readingViewParent = element.matchParent('.view-content > .markdown-reading-view > .markdown-preview-view > .markdown-preview-section');
		if (readingViewParent)
			plugin.readingStylingMutationObserver.observe(readingViewParent,{
				childList: true,
				attributes: false,
				characterData: false,
				subtree: false,
			})
	}
	const codeblockSectionInfo: MarkdownSectionInformation | null= getSectionInfo(codeblockPreElements[0]);
	if (codeblockSectionInfo && specific && !editingEmbeds)
		renderSpecificReadingSection(codeblockPreElements,sourcePath,codeblockSectionInfo,plugin);
	else if (specific && !printing) {
		if (!(!editingEmbeds && element.classList.contains("admonition-content"))) {
			let contentEl = element.matchParent('.view-content') as HTMLElement;
			await readingViewCodeblockDecoratingPostProcessor(contentEl?contentEl:(element.matchParent('div.print') as HTMLElement),{sourcePath,getSectionInfo,frontmatter},plugin,editingEmbeds); // Re-render whole document
		}
	}
	else
		renderDocument(codeblockPreElements,sourcePath,cache,editingEmbeds,printing,plugin);
}
async function renderSpecificReadingSection(codeblockPreElements: Array<HTMLElement>, sourcePath: string, codeblockSectionInfo: MarkdownSectionInformation, plugin: CodeStylerPlugin): Promise<void> {
	const codeblocksParameters = (await parseCodeblockSource(Array.from({length: codeblockSectionInfo.lineEnd-codeblockSectionInfo.lineStart+1}, (_,num) => num + codeblockSectionInfo.lineStart).map((lineNumber)=>codeblockSectionInfo.text.split('\n')[lineNumber]),sourcePath,plugin)).codeblocksParameters;
	if (codeblockPreElements.length !== codeblocksParameters.length)
		return;
	for (let [key,codeblockPreElement] of codeblockPreElements.entries()) {
		let codeblockParameters = codeblocksParameters[key];
		let codeblockCodeElement = codeblockPreElement.querySelector('pre > code');
		if (!codeblockCodeElement)
			return;
		if (Array.from(codeblockCodeElement.classList).some(className => /^language-\S+/.test(className)))
			while(!codeblockCodeElement.classList.contains("is-loaded"))
				await sleep(2);
		if (isExcluded(codeblockParameters.language,plugin.settings.excludedLanguages) || codeblockParameters.ignore)
			continue;
		await remakeCodeblock(codeblockCodeElement as HTMLElement,codeblockPreElement,codeblockParameters,true,plugin);
	}
}
async function renderDocument(codeblockPreElements: Array<HTMLElement>, sourcePath: string, cache: CachedMetadata | null, editingEmbeds: boolean, printing: boolean, plugin: CodeStylerPlugin) {
	const fileContentLines = await getFileContentLines(sourcePath,plugin);
	if (!fileContentLines)
		return;
	let codeblocksParameters: Array<CodeblockParameters> = [];

	if (typeof cache?.sections !== 'undefined') {
		for (const section of cache.sections) {
			if (!editingEmbeds || section.type === 'code' || section.type === 'callout') {
				const parsedCodeblocksParameters = await parseCodeblockSource(fileContentLines.slice(section.position.start.line,section.position.end.line+1),sourcePath,plugin);
				if (!editingEmbeds || parsedCodeblocksParameters.nested)
					codeblocksParameters = codeblocksParameters.concat(parsedCodeblocksParameters.codeblocksParameters);
			}
		}
	} else {
		console.error(`Metadata cache not found for file: ${sourcePath}`);
		return;
	}
	if (codeblockPreElements.length !== codeblocksParameters.length)
		return;
	try {
		for (let [key,codeblockPreElement] of Array.from(codeblockPreElements).entries()) {
			let codeblockParameters = codeblocksParameters[key];
			let codeblockCodeElement: HTMLPreElement | null = codeblockPreElement.querySelector("pre > code");
			if (!codeblockCodeElement)
				return;
			if (Array.from(codeblockCodeElement.classList).some(className => /^language-\S+/.test(className)))
				while(!codeblockCodeElement.classList.contains("is-loaded"))
					await sleep(2);
			if (codeblockCodeElement.querySelector("code [class*='code-styler-line']"))
				continue;
			if (isExcluded(codeblockParameters.language,plugin.settings.excludedLanguages) || codeblockParameters.ignore)
				continue;
			await remakeCodeblock(codeblockCodeElement,codeblockPreElement,codeblockParameters,!printing,plugin);
		}
	} catch (error) {
		console.error(`Error rendering document: ${error.message}`);
		return;
	}
}

export async function readingViewInlineDecoratingPostProcessor(element: HTMLElement, {sourcePath,getSectionInfo,frontmatter}: {sourcePath: string, getSectionInfo: (element: HTMLElement) => MarkdownSectionInformation | null, frontmatter: FrontMatterCache | undefined}, plugin: CodeStylerPlugin) {
	if (!sourcePath || !element || !plugin.settings.currentTheme.settings.inline.syntaxHighlight)
		return;
	element.querySelectorAll(':not(pre) > code').forEach((inlineCodeElement: HTMLElement)=>{
		if (inlineCodeElement.classList.contains('code-styler-highlighted'))
			return;
		let match = /^({})?{([^\s]*)} ?(.*)$/.exec(inlineCodeElement.innerText);
		let renderString: string;
		if (!match?.[1] && !(match?.[2] && match?.[3]))
			return;
		else if (match?.[1])
			renderString = '`'+match[0].substring(2)+'`';
		else
			renderString = ['```',match[2],'\n',match[3],'\n```'].join('');
		const tempRenderContainer = createDiv();
		MarkdownRenderer.renderMarkdown(renderString,tempRenderContainer,sourcePath,new Component());
		const renderedCodeElement = tempRenderContainer.querySelector('code');
		if (!renderedCodeElement)
			return;
		inlineCodeElement.classList.add('code-styler-highlighted');
		inlineCodeElement.innerHTML = renderedCodeElement.innerHTML;
	})
}

async function remakeCodeblock(codeblockCodeElement: HTMLElement, codeblockPreElement: HTMLElement, codeblockParameters: CodeblockParameters, dynamic: boolean, plugin: CodeStylerPlugin) {
	// Add Execute Code Observer
	if (dynamic) {
		plugin.executeCodeMutationObserver.observe(codeblockPreElement,{
			childList: true,
			subtree: true,
			attributes: true,
			characterData: true,
		});
	}

	// Add Parent Classes
	codeblockPreElement.classList.add(`code-styler-pre`);
	if (codeblockParameters.language)
		codeblockPreElement.classList.add(`language-${codeblockParameters.language}`);
	if (codeblockPreElement.parentElement)
		codeblockPreElement.parentElement.classList.add(`code-styler-pre-parent`);

	// Create Header
	const headerContainer = createHeader(codeblockParameters, plugin.settings.currentTheme.settings,plugin.languageIcons);
	codeblockPreElement.insertBefore(headerContainer, codeblockPreElement.childNodes[0]);
	
	if (dynamic) {
		// Add listener for header collapsing on click
		headerContainer.addEventListener("click", ()=>{
			codeblockPreElement.classList.toggle("code-styler-collapsed")
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

		// Line Wrapping Classes
		if (codeblockParameters.lineUnwrap.alwaysEnabled) {
			codeblockCodeElement.style.setProperty('--line-wrapping','pre');
			if (codeblockParameters.lineUnwrap.activeWrap)
				codeblockCodeElement.style.setProperty('--line-active-wrapping','pre-wrap');
			else
				codeblockCodeElement.style.setProperty('--line-active-wrapping','pre');
		} else if (codeblockParameters.lineUnwrap.alwaysDisabled)
			codeblockCodeElement.style.setProperty('--line-wrapping','pre-wrap');

		// Height Setting (for collapse animation) - Delay to return correct height
		setTimeout(()=>{setCollapseStyling(codeblockPreElement,codeblockCodeElement,codeblockParameters.fold.enabled)},PRIMARY_DELAY);
	} else if (codeblockParameters.fold.enabled)
		codeblockPreElement.classList.add("code-styler-collapsed");
	
	// Ignore styled lines
	if (codeblockCodeElement.querySelector("code [class*='code-styler-line']"))
		return;

	// Add line numbers
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
		lineWrapper.appendChild(createDiv({cls: `code-styler-line-number${lineNumberDisplay}`, text: (lineNumber+codeblockParameters.lineNumbers.offset).toString()}));
		lineWrapper.appendChild(createDiv({cls: `code-styler-line-text`, text: sanitizeHTMLToDom(line !== "" ? line : "<br>")}));
	});
}
export function remeasureReadingView(element: HTMLElement, primary_delay: number = PRIMARY_DELAY): void {
	const codeblockPreElements = element.querySelectorAll('pre:not(.frontmatter)');
	codeblockPreElements.forEach((codeblockPreElement: HTMLElement)=>{
		let codeblockCodeElement = codeblockPreElement.querySelector('pre > code') as HTMLElement;
		if (!codeblockCodeElement)
			return;
		setTimeout(()=>{setCollapseStyling(codeblockPreElement,codeblockCodeElement,codeblockPreElement.classList.contains('code-styler-collapsed'))},primary_delay);
	})
}
function setCollapseStyling(codeblockPreElement: HTMLElement, codeblockCodeElement: HTMLElement, fold: boolean): void {
	codeblockCodeElement.style.setProperty('--true-height',`calc(${codeblockCodeElement.scrollHeight}px + 2 * var(--code-padding)`);
	codeblockCodeElement.style.maxHeight = 'var(--true-height)';
	codeblockCodeElement.style.whiteSpace = 'var(--line-wrapping)';
	if (fold) {
		codeblockPreElement.classList.add("code-styler-collapsed");
		codeblockCodeElement.style.maxHeight = '';
	}
}

export function destroyReadingModeElements(): void {
	document.querySelectorAll(".code-styler-pre-parent").forEach(codeblockPreParent => {
		codeblockPreParent.classList.remove('code-styler-pre-parent');
	});
	
	[
		...Array.from(document.querySelectorAll("pre.code-styler-pre div[class^='code-styler-header-container']")),
		...Array.from(document.querySelectorAll("pre.code-styler-pre div[class^='code-styler-line-number']")),
	].forEach(element => element.remove());
	document.querySelectorAll("pre.code-styler-pre").forEach(codeblockPreElement => {
		codeblockPreElement.classList.remove('code-styler-pre');
		codeblockPreElement.classList.remove('code-styler-collapsed');
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
		(codeblockCodeElement as HTMLElement).innerHTML = Array.from(codeblockCodeElement.querySelectorAll('code > [class*="code-styler-line"]')).reduce((reconstructedCodeblockLines: Array<string>, codeblockLine: HTMLElement): Array<string> => {
			const codeblockLineText = (codeblockLine.firstChild as HTMLElement);
			if (codeblockLineText)
				reconstructedCodeblockLines.push(codeblockLineText.innerHTML);
			return reconstructedCodeblockLines
		},[]).join('\n')+'\n';
	})
}

export const readingStylingMutationObserver = new MutationObserver((mutations) => {
	mutations.forEach((mutation: MutationRecord) => {
		if (mutation.addedNodes.length !== 0)
			mutation.addedNodes.forEach((addedNode: HTMLElement)=>remeasureReadingView(addedNode))
	});
});
export const executeCodeMutationObserver = new MutationObserver((mutations) => {
	mutations.forEach((mutation: MutationRecord) => {
		if (mutation.type === "attributes" && mutation.attributeName === "style" && (mutation.target as HTMLElement).tagName === 'CODE' && (mutation.target as HTMLElement).classList.contains('execute-code-output')) { // Change style of execute code output
			const executeCodeOutput = mutation.target as HTMLElement;
			if (executeCodeOutput.parentElement?.classList.contains('code-styler-collapsed'))
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
	});
});
