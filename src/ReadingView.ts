import { MarkdownSectionInformation, CachedMetadata, sanitizeHTMLToDom, FrontMatterCache, MarkdownRenderer, Component } from "obsidian";
import {unified} from "unified";
import remarkParse from "remark-parse";
import {visit} from "unist-util-visit";

import CodeStylerPlugin from "./main";
import { PRIMARY_DELAY, SECONDARY_DELAY } from "./Settings";
import { CodeblockParameters, getFileContentLines, isExcluded, parseCodeblockSource, parseInlineCode } from "./CodeblockParsing";
import { createHeader, createInlineOpener, getLineClass } from "./CodeblockDecorating";

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
	if (!sourcePath || !element)
		return;
	for (let inlineCodeElement of Array.from(element.querySelectorAll(':not(pre) > code'))) {
		if (inlineCodeElement.classList.contains('code-styler-highlighted') || inlineCodeElement.classList.contains('code-styler-highlight-ignore'))
			return;
		let tempRenderContainer = createDiv();
		let renderedCodeElement: HTMLElement | null;
		let inlineCodeText = (inlineCodeElement as HTMLElement).innerText;
		let {parameters,text} = parseInlineCode(inlineCodeText);
		if (!parameters) {
			if (!text)
				return;
			MarkdownRenderer.renderMarkdown('`'.repeat(20)+text+'`'.repeat(20),tempRenderContainer,'',new Component());
			renderedCodeElement = tempRenderContainer.querySelector('code');
			if (!renderedCodeElement)
				return;
			inlineCodeElement.innerHTML = renderedCodeElement.innerHTML;
			inlineCodeElement.classList.add('code-styler-highlight-ignore');
		} else {
			MarkdownRenderer.renderMarkdown(['```',plugin.settings.currentTheme.settings.inline.syntaxHighlight?parameters.language:'','\n',text,'\n','```'].join(''),tempRenderContainer,'',new Component());
			renderedCodeElement = tempRenderContainer.querySelector('pre > code');
			if (!renderedCodeElement)
				return;
			while(plugin.settings.currentTheme.settings.inline.syntaxHighlight && !renderedCodeElement.classList.contains("is-loaded"))
				await sleep(2);
			inlineCodeElement.innerHTML = renderedCodeElement.innerHTML;
			inlineCodeElement.classList.add('code-styler-highlighted');
			inlineCodeElement.setAttribute("parameters",inlineCodeText.substring(0,inlineCodeText.lastIndexOf(text)));
			if (parameters.icon || parameters.title)
				inlineCodeElement.insertBefore(createInlineOpener(parameters,plugin.languageIcons),inlineCodeElement.childNodes[0]);
		}
	}
}

export function destroyReadingModeElements(): void {
	document.querySelectorAll(".code-styler-pre-parent").forEach(codeblockPreParent => {
		codeblockPreParent.classList.remove('code-styler-pre-parent');
	});
	[
		...Array.from(document.querySelectorAll("pre.code-styler-pre div[class^='code-styler-header-container']")),
		...Array.from(document.querySelectorAll("pre.code-styler-pre div[class^='code-styler-line-number']")),
		...Array.from(document.querySelectorAll(":not(pre) > code span.code-styler-inline-opener")),
	].forEach(element => element.remove());
	document.querySelectorAll("pre.code-styler-pre").forEach((codeblockPreElement: HTMLElement) => {
		codeblockPreElement.classList.remove('code-styler-pre');
		codeblockPreElement.classList.remove('code-styler-collapsed');
		codeblockPreElement.style.removeProperty('--true-height');
		codeblockPreElement.style.removeProperty('--line-number-margin');
		codeblockPreElement.style.removeProperty('max-height');
		codeblockPreElement.style.removeProperty('white-space');
	});
	document.querySelectorAll('pre > code ~ code.language-output').forEach((executeCodeOutput: HTMLElement) => {
		executeCodeOutput.classList.remove('execute-code-output');
		executeCodeOutput.style.removeProperty('--true-height');
		executeCodeOutput.style.removeProperty('max-height');
	});
	document.querySelectorAll('pre > code:nth-of-type(1)').forEach((codeblockCodeElement: HTMLElement) => {
		codeblockCodeElement.style.removeProperty('--true-height');
		codeblockCodeElement.style.removeProperty('--line-wrapping');
		codeblockCodeElement.style.removeProperty('--line-active-wrapping');
		codeblockCodeElement.style.removeProperty('max-height');
		codeblockCodeElement.style.removeProperty('white-space');
		codeblockCodeElement.innerHTML = Array.from(codeblockCodeElement.querySelectorAll('code > [class*="code-styler-line"]')).reduce((reconstructedCodeblockLines: Array<string>, codeblockLine: HTMLElement): Array<string> => {
			const codeblockLineText = (codeblockLine.firstChild as HTMLElement);
			if (codeblockLineText)
				reconstructedCodeblockLines.push(codeblockLineText.innerHTML);
			return reconstructedCodeblockLines
		},[]).join('\n')+'\n';
	});
	document.querySelectorAll(":not(pre) > code").forEach((inlineCodeElement: HTMLElement) => {
		inlineCodeElement.classList.remove('code-styler-highlighted');
		inlineCodeElement.classList.remove('code-styler-highlight-ignore');
		inlineCodeElement.innerText = inlineCodeElement.getAttribute("parameters") + inlineCodeElement.innerText;
	});
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
	codeblockPreElement.insertBefore(headerContainer,codeblockPreElement.childNodes[0]);
	
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
	let tree = unified().use(remarkParse).parse(codeblockCodeElement.innerHTML.replace(/\n/g,'<br>'));
	let stack: Array<string> = [];
	let codeblockHTML: string = '';
	codeblockCodeElement.innerHTML = "";
	visit(tree,(node)=>{
		if (node.type === 'html' || node.type === 'text') {
			if (node.type === 'html' && node.value !== '<br>') {
				if (node.value.startsWith('<span'))
					stack.push(node.value);
				else if (node.value.startsWith('</span'))
					stack.pop();
			} else if (node.type === 'html' && node.value === '<br>')
				node.value = '</span>'.repeat(stack.length)+'<br>'+stack.join('');
			codeblockHTML += node.value;
		}
	});
	let codeblockLines = codeblockHTML.split('<br>');
	if (codeblockLines.length == 1)
		codeblockLines = ['',''];
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
			lineNumberDisplay = '-hide';
		else if (codeblockParameters.lineNumbers.alwaysEnabled && !codeblockParameters.lineNumbers.alwaysDisabled)
			lineNumberDisplay = '-specific';
		lineWrapper.appendChild(createDiv({cls: `code-styler-line-number${lineNumberDisplay}`, text: (lineNumber+codeblockParameters.lineNumbers.offset).toString()}));
		lineWrapper.appendChild(createDiv({cls: `code-styler-line-text`, text: sanitizeHTMLToDom(line !== "" ? line : "<br>")}));
	});
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

function remeasureReadingView(element: HTMLElement, primary_delay: number = PRIMARY_DELAY): void {
	const codeblockPreElements = element.querySelectorAll('pre:not(.frontmatter)');
	codeblockPreElements.forEach((codeblockPreElement: HTMLElement)=>{
		let codeblockCodeElement = codeblockPreElement.querySelector('pre > code') as HTMLElement;
		if (!codeblockCodeElement)
			return;
		setTimeout(()=>{setCollapseStyling(codeblockPreElement,codeblockCodeElement,codeblockPreElement.classList.contains('code-styler-collapsed'))},primary_delay);
	});
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
