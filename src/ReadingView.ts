import { MarkdownSectionInformation, CachedMetadata, sanitizeHTMLToDom, FrontMatterCache, MarkdownRenderer, Component } from "obsidian";
import { visitParents } from "unist-util-visit-parents";
import { fromHtml } from "hast-util-from-html";
import { toHtml } from "hast-util-to-html";

import CodeStylerPlugin from "./main";
import { TRANSITION_LENGTH } from "./Settings";
import { CodeblockParameters, InlineCodeParameters, getFileContentLines, isExcluded, parseCodeblockSource, parseInlineCode } from "./CodeblockParsing";
import { createHeader, createInlineOpener, getLineClass as getLineClasses, getLineNumberDisplay } from "./CodeblockDecorating";

export async function readingViewCodeblockDecoratingPostProcessor(element: HTMLElement, {sourcePath,getSectionInfo,frontmatter}: {sourcePath: string, getSectionInfo: (element: HTMLElement) => MarkdownSectionInformation | null, frontmatter: FrontMatterCache | undefined}, plugin: CodeStylerPlugin, editingEmbeds = false) {
	const cache: CachedMetadata | null = plugin.app.metadataCache.getCache(sourcePath);
	if (!sourcePath || !element || (frontmatter ?? cache?.frontmatter)?.["code-styler-ignore"] === true)
		return;

	editingEmbeds = editingEmbeds || Boolean(element.matchParent(".cm-embed-block"));
	const specific = !element.querySelector(".view-content > *");
	const printing = Boolean(element.querySelector("div.print > *"));
	if (printing && !plugin.settings.decoratePrint)
		return;

	const codeblockPreElements: Array<HTMLElement> = await getCodeblockPreElements(element,specific,editingEmbeds);
	if (codeblockPreElements.length === 0 && !(editingEmbeds && specific))
		return;

	const codeblockSectionInfo: MarkdownSectionInformation | null = getSectionInfo(codeblockPreElements[0]);
	if (codeblockSectionInfo && specific && !editingEmbeds)
		await renderSpecificReadingSection(codeblockPreElements,sourcePath,codeblockSectionInfo,plugin);
	else if (specific && !printing)
		await retriggerProcessor(element,{sourcePath,getSectionInfo,frontmatter},plugin,editingEmbeds);
	else
		await renderDocument(codeblockPreElements,sourcePath,cache,editingEmbeds,printing,plugin);
}
export async function readingViewInlineDecoratingPostProcessor(element: HTMLElement, {sourcePath}: {sourcePath: string, getSectionInfo: (element: HTMLElement) => MarkdownSectionInformation | null, frontmatter: FrontMatterCache | undefined}, plugin: CodeStylerPlugin) {
	if (!sourcePath || !element)
		return;
	for (const inlineCodeElement of Array.from(element.querySelectorAll(":not(pre) > code"))) {
		await remakeInlineCode(inlineCodeElement as HTMLElement,plugin);
	}
}
export function destroyReadingModeElements(): void {
	document.querySelectorAll(".code-styler-pre-parent").forEach(codeblockPreParent => {
		codeblockPreParent.classList.remove("code-styler-pre-parent");
	});
	[
		...Array.from(document.querySelectorAll("pre.code-styler-pre div[class^='code-styler-header-container']")),
		...Array.from(document.querySelectorAll("pre.code-styler-pre div[class^='code-styler-line-number']")),
		...Array.from(document.querySelectorAll(":not(pre) > code span.code-styler-inline-opener")),
	].forEach(element => element.remove());
	document.querySelectorAll("pre.code-styler-pre").forEach((codeblockPreElement: HTMLElement) => {
		codeblockPreElement.classList.remove("code-styler-pre");
		codeblockPreElement.classList.remove("code-styler-collapsed");
		codeblockPreElement.style.removeProperty("--true-height");
		codeblockPreElement.style.removeProperty("--line-number-margin");
		codeblockPreElement.style.removeProperty("max-height");
		codeblockPreElement.style.removeProperty("white-space");
	});
	document.querySelectorAll("pre > code ~ code.language-output").forEach((executeCodeOutput: HTMLElement) => {
		executeCodeOutput.classList.remove("execute-code-output");
		executeCodeOutput.style.removeProperty("--true-height");
		executeCodeOutput.style.removeProperty("max-height");
	});
	document.querySelectorAll("pre > code:nth-of-type(1)").forEach((codeblockCodeElement: HTMLElement) => {
		codeblockCodeElement.style.removeProperty("--true-height");
		codeblockCodeElement.style.removeProperty("--line-wrapping");
		codeblockCodeElement.style.removeProperty("--line-active-wrapping");
		codeblockCodeElement.style.removeProperty("max-height");
		codeblockCodeElement.style.removeProperty("white-space");
		codeblockCodeElement.innerHTML = Array.from(codeblockCodeElement.querySelectorAll("code > [class*=\"code-styler-line\"]")).reduce((reconstructedCodeblockLines: Array<string>, codeblockLine: HTMLElement): Array<string> => {
			const codeblockLineText = (codeblockLine.firstChild as HTMLElement);
			if (codeblockLineText)
				reconstructedCodeblockLines.push(codeblockLineText.innerHTML);
			return reconstructedCodeblockLines;
		},[]).join("\n")+"\n";
	});
	document.querySelectorAll(":not(pre) > code").forEach((inlineCodeElement: HTMLElement) => {
		inlineCodeElement.classList.remove("code-styler-highlighted");
		inlineCodeElement.classList.remove("code-styler-highlight-ignore");
		inlineCodeElement.innerText = inlineCodeElement.getAttribute("parameters") + inlineCodeElement.innerText;
	});
}

async function renderSpecificReadingSection(codeblockPreElements: Array<HTMLElement>, sourcePath: string, codeblockSectionInfo: MarkdownSectionInformation, plugin: CodeStylerPlugin): Promise<void> {
	const codeblocksParameters = (await parseCodeblockSource(Array.from({length: codeblockSectionInfo.lineEnd-codeblockSectionInfo.lineStart+1}, (_,num) => num + codeblockSectionInfo.lineStart).map((lineNumber)=>codeblockSectionInfo.text.split("\n")[lineNumber]),sourcePath,plugin)).codeblocksParameters;
	if (codeblockPreElements.length !== codeblocksParameters.length)
		return;
	for (const [key,codeblockPreElement] of codeblockPreElements.entries()) {
		const codeblockParameters = codeblocksParameters[key];
		const codeblockCodeElement = codeblockPreElement.querySelector("pre > code");
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
async function retriggerProcessor(element: HTMLElement, context: {sourcePath: string, getSectionInfo: (element: HTMLElement) => MarkdownSectionInformation | null, frontmatter: FrontMatterCache | undefined}, plugin: CodeStylerPlugin, editingEmbeds: boolean) {
	if (element.matchParent("div.block-language-dataviewjs") && /dataviewjs(?= |,|$)/.test(plugin.settings.excludedCodeblocks))
		return;
	await sleep(50);
	editingEmbeds = editingEmbeds || Boolean(element.matchParent(".cm-embed-block"));
	if (editingEmbeds || !element.classList.contains("admonition-content")) {
		const contentEl = element.matchParent(".view-content") as HTMLElement;
		await readingViewCodeblockDecoratingPostProcessor(contentEl || (element.matchParent("div.print") as HTMLElement),context,plugin,editingEmbeds); // Re-render whole document
	}
}
async function renderDocument(codeblockPreElements: Array<HTMLElement>, sourcePath: string, cache: CachedMetadata | null, editingEmbeds: boolean, printing: boolean, plugin: CodeStylerPlugin) {
	const codeblocksParameters: Array<CodeblockParameters> = await getCodeblocksParameters(sourcePath,cache,plugin,editingEmbeds);
	if (codeblocksParameters.length !== codeblockPreElements.length)
		return;

	try {
		for (const [key,codeblockPreElement] of Array.from(codeblockPreElements).entries()) {
			const codeblockParameters = codeblocksParameters[key];
			const codeblockCodeElement: HTMLPreElement | null = codeblockPreElement.querySelector("pre > code");
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

async function remakeCodeblock(codeblockCodeElement: HTMLElement, codeblockPreElement: HTMLElement, codeblockParameters: CodeblockParameters, dynamic: boolean, plugin: CodeStylerPlugin) {
	if (dynamic)
		plugin.executeCodeMutationObserver.observe(codeblockPreElement,{childList: true,subtree: true,attributes: true,characterData: true}); // Add Execute Code Observer
	
	insertHeader(codeblockPreElement,codeblockParameters,plugin,dynamic);
	
	codeblockPreElement.classList.add(...getPreClasses(codeblockParameters,dynamic));
	codeblockPreElement.setAttribute("defaultFold",codeblockParameters.fold.enabled.toString());
	if (codeblockPreElement.parentElement)
		codeblockPreElement.parentElement.classList.add("code-styler-pre-parent");
	
	if (!codeblockCodeElement.querySelector("code [class*='code-styler-line']")) // Ignore styled lines
		decorateCodeblockLines(codeblockCodeElement,codeblockParameters);
}
async function remakeInlineCode(inlineCodeElement: HTMLElement, plugin: CodeStylerPlugin): Promise<void> {
	if (inlineCodeElement.classList.contains("code-styler-inline"))
		return;
	const inlineCodeText = inlineCodeElement.innerText;
	const {parameters,text} = parseInlineCode(inlineCodeText);
	if (parameters && plugin.settings.currentTheme.settings.inline.syntaxHighlight)
		inlineCodeElement.innerHTML = await getHighlightedHTML(parameters,text,plugin);
	else if ((!parameters && text) || (parameters && !plugin.settings.currentTheme.settings.inline.syntaxHighlight))
		inlineCodeElement.innerHTML = text;
	else
		return;
	
	inlineCodeElement.classList.add("code-styler-inline");
	if (parameters) {
		const parameterString = inlineCodeText.substring(0,inlineCodeText.lastIndexOf(text));
		inlineCodeElement.setAttribute("parameters",parameterString); // Store parameter string as attribute so original text can be restored on plugin removal
		if (parameters.icon || parameters.title)
			inlineCodeElement.insertBefore(createInlineOpener(parameters,plugin.languageIcons),inlineCodeElement.childNodes[0]);
	}
}

async function getCodeblockPreElements(element: HTMLElement, specific: boolean,editingEmbeds: boolean): Promise<Array<HTMLElement>> {
	let codeblockPreElements: Array<HTMLElement>;
	if (!editingEmbeds && !specific)
		codeblockPreElements = Array.from(element.querySelectorAll(".markdown-reading-view pre:not(.frontmatter)"));
	else if (editingEmbeds && !specific)
		codeblockPreElements = Array.from(element.querySelectorAll(".markdown-source-view .cm-embed-block pre:not(.frontmatter)"));
	else if (!editingEmbeds && specific) {
		codeblockPreElements = Array.from(element.querySelectorAll("pre:not(.frontmatter)"));
		const admonitionCodeElement = codeblockPreElements?.[0]?.querySelector("pre:not([class]) > code[class*=\"language-ad-\"]");
		if (admonitionCodeElement) {
			await sleep(50); //TODO
			codeblockPreElements = Array.from(element.querySelectorAll("pre:not(.frontmatter)"));
		}
	} else
		codeblockPreElements = [];
	return codeblockPreElements;
}
async function getCodeblocksParameters(sourcePath: string, cache: CachedMetadata | null, plugin: CodeStylerPlugin, editingEmbeds: boolean): Promise<Array<CodeblockParameters>> {
	let codeblocksParameters: Array<CodeblockParameters> = [];
	const fileContentLines = await getFileContentLines(sourcePath,plugin);
	if (!fileContentLines)
		return [];

	if (typeof cache?.sections !== "undefined") {
		for (const section of cache.sections) {
			if (!editingEmbeds || section.type === "code" || section.type === "callout") {
				const parsedCodeblocksParameters = await parseCodeblockSource(fileContentLines.slice(section.position.start.line,section.position.end.line+1),sourcePath,plugin);
				if (!editingEmbeds || parsedCodeblocksParameters.nested)
					codeblocksParameters = codeblocksParameters.concat(parsedCodeblocksParameters.codeblocksParameters);
			}
		}
	} else
		console.error(`Metadata cache not found for file: ${sourcePath}`);
	return codeblocksParameters;
}
export function readingDocumentFold(contentEl: HTMLElement, fold?: boolean) {
	const codeblockPreElements = document.querySelectorAll("pre.code-styler-pre"); //todo Change document
	if (typeof fold === "undefined") //Return all blocks to original state
		codeblockPreElements.forEach((codeblockPreElement: HTMLElement)=>toggleFold(codeblockPreElement,(codeblockPreElement.getAttribute("defaultFold")??"false")==="true"));
	else //Fold or unfold all blocks
		codeblockPreElements.forEach((codeblockPreElement: HTMLElement)=>toggleFold(codeblockPreElement,fold));
}
async function toggleFold(codeblockPreElement: HTMLElement, fold?: boolean): Promise<void> {
	codeblockPreElement.querySelectorAll("pre > code").forEach((codeblockCodeElement: HTMLElement)=>codeblockCodeElement.style.setProperty("max-height",`calc(${Math.ceil(codeblockCodeElement.scrollHeight+0.01)}px + var(--code-padding) * ${codeblockCodeElement.classList.contains("execute-code-output")?"3.5 + var(--header-separator-width)":"2"})`));
	codeblockPreElement.classList.add("hide-scroll");
	await sleep(1);
	if (typeof fold === "undefined")
		codeblockPreElement.classList.toggle("code-styler-collapsed");
	else
		fold?codeblockPreElement.classList.add("code-styler-collapsed"):codeblockPreElement.classList.remove("code-styler-collapsed");
	await sleep(TRANSITION_LENGTH);
	codeblockPreElement.querySelectorAll("pre > code").forEach((codeblockCodeElement: HTMLElement)=>codeblockCodeElement.style.removeProperty("max-height"));
	codeblockPreElement.classList.remove("hide-scroll");
}
function insertHeader(codeblockPreElement: HTMLElement, codeblockParameters: CodeblockParameters, plugin: CodeStylerPlugin, dynamic: boolean): void {
	const headerContainer = createHeader(codeblockParameters, plugin.settings.currentTheme.settings,plugin.languageIcons);
	if (dynamic)
		headerContainer.addEventListener("click",()=>{toggleFold(codeblockPreElement);}); // Add listener for header collapsing on click
	codeblockPreElement.insertBefore(headerContainer,codeblockPreElement.childNodes[0]);
}
function getPreClasses(codeblockParameters: CodeblockParameters, dynamic: boolean): Array<string> {
	const preClassList = ["code-styler-pre"];
	if (codeblockParameters.language)
		preClassList.push(`language-${codeblockParameters.language}`);
	if (dynamic) {
		if (codeblockParameters.fold.enabled)
			preClassList.push("code-styler-collapsed");
		if (codeblockParameters.lineUnwrap.alwaysEnabled)
			preClassList.push(codeblockParameters.lineUnwrap.activeWrap?"unwrapped-inactive":"unwrapped");
		else if (codeblockParameters.lineUnwrap.alwaysDisabled)
			preClassList.push("wrapped");
	}
	return preClassList;
}
function decorateCodeblockLines(codeblockCodeElement: HTMLElement, codeblockParameters: CodeblockParameters): void {
	getCodeblockLines(codeblockCodeElement).forEach((line,index,codeblockLines) => {
		if (index !== codeblockLines.length-1)
			insertLineWrapper(codeblockCodeElement,codeblockParameters,index+1,line);
	});
}
function getCodeblockLines(codeblockCodeElement: HTMLElement): Array<string> {
	const htmlTree = fromHtml(codeblockCodeElement.innerHTML.replace(/\n/g,"<br>"),{fragment: true});
	let codeblockHTML = codeblockCodeElement.innerHTML;
	visitParents(htmlTree,["text","element"],(node,ancestors)=>{
		if (node.type === "element" && node.tagName === "br") {
			if (ancestors.length >= 2) {
				codeblockHTML = codeblockHTML.replace(/\n/,ancestors.slice(1).reduce((result,element)=>{
					const elementCopy = structuredClone(element);
					elementCopy.children = [];
					const splitTag = toHtml(elementCopy).split(/(?<=>)(?=<\/)/);
					return splitTag.splice(-1)+result+splitTag.join("");
				},"<br>"));
			} else
				codeblockHTML = codeblockHTML.replace(/\n/,"<br>");
		}
	});
	let codeblockLines = codeblockHTML.split("<br>");
	if (codeblockLines.length === 1)
		codeblockLines = ["",""];
	codeblockCodeElement.innerHTML = "";
	return codeblockLines;
}
function insertLineWrapper(codeblockCodeElement: HTMLElement, codeblockParameters: CodeblockParameters, lineNumber: number, line: string): void {
	const lineWrapper = document.createElement("div");
	codeblockCodeElement.appendChild(lineWrapper);
	getLineClasses(codeblockParameters,lineNumber,line).forEach((lineClass) => lineWrapper.classList.add(lineClass));
	lineWrapper.appendChild(createDiv({cls: `code-styler-line-number${getLineNumberDisplay(codeblockParameters)}`, text: (lineNumber+codeblockParameters.lineNumbers.offset).toString()}));
	lineWrapper.appendChild(createDiv({cls: "code-styler-line-text", text: sanitizeHTMLToDom(line !== "" ? line : "<br>")}));
}
async function getHighlightedHTML(parameters: InlineCodeParameters, text: string, plugin: CodeStylerPlugin): Promise<string> {
	const temporaryRenderingContainer = createDiv();
	MarkdownRenderer.render(plugin.app,["```",parameters.language,"\n",text,"\n","```"].join(""),temporaryRenderingContainer,"",new Component());
	const renderedCodeElement = temporaryRenderingContainer.querySelector("code");
	if (!renderedCodeElement)
		return "ERROR: Could not render highlighted code";
	while(plugin.settings.currentTheme.settings.inline.syntaxHighlight && !renderedCodeElement.classList.contains("is-loaded"))
		await sleep(2);
	return renderedCodeElement.innerHTML;
}

export const executeCodeMutationObserver = new MutationObserver((mutations) => {
	mutations.forEach((mutation: MutationRecord) => {
		if (mutation.type === "childList" && (mutation.target as HTMLElement).tagName === "PRE") { // Add execute code output
			const executeCodeOutput = (mutation.target as HTMLElement).querySelector("pre > code ~ code.language-output") as HTMLElement;
			if (executeCodeOutput)
				executeCodeOutput.classList.add("execute-code-output");
		}
	});
});
