import { CachedMetadata, DataAdapter, MarkdownPostProcessorContext, MarkdownSectionInformation, parseLinktext, resolveSubpath, SectionCache, View } from "obsidian";
import { DETECTING_CONTEXT, PARAMETERS_ATTRIBUTE } from "src/Internal/constants/detecting";
import CodeStylerPlugin from "src/main";
import { unified } from "unified";
import markdown from 'remark-parse';
import { visit } from 'unist-util-visit';
import { SETTINGS_TAB_SOURCEPATH_PREFIX } from "src/Internal/constants/interface";
import { CodeDetectingContext } from "src/Internal/types/detecting";
import { DECORATED_ATTRIBUTE } from "src/Internal/constants/decoration";
import { parseFenceCodeParameters, toDecorateFenceCode } from "src/Internal/Parsing/Fenced";

export async function renderedFencedCodeDecorating(
	element: HTMLElement,
	context: MarkdownPostProcessorContext,
	plugin: CodeStylerPlugin,
): Promise<void> {
	const fenceCodeElements = Array.from(element.querySelectorAll(`pre:not(frontmatter) > code[${PARAMETERS_ATTRIBUTE}]`))
	for (const fenceCodeElement of fenceCodeElements as Array<HTMLElement>) {
		if (!fenceCodeElement.classList.contains("is-loaded"))
			console.log("WASN'T LOADED")

		const decorated = fenceCodeElement.getAttribute(DECORATED_ATTRIBUTE) ?? "false"
		if (decorated === "true")
			return;

		//TODO: Decorate
		console.log("decoorate", fenceCodeElement)
		const codeblockParameters = parseFenceCodeParameters(fenceCodeElement.getAttribute(PARAMETERS_ATTRIBUTE) ?? " ");
		const codeDetectingContext = (fenceCodeElement.getAttribute(DETECTING_CONTEXT) ?? "standalone") as CodeDetectingContext

		if (!toDecorateFenceCode(codeblockParameters))
			return;

		fenceCodeElement.setAttribute(DECORATED_ATTRIBUTE, "true")
	}
}

// //TODO: Update

// import { MarkdownSectionInformation, CachedMetadata, sanitizeHTMLToDom, FrontMatterCache, MarkdownRenderer, MarkdownView, View } from "obsidian";
// import { visitParents } from "unist-util-visit-parents";
// import { fromHtml } from "hast-util-from-html";
// import { toHtml } from "hast-util-to-html";
// import { ElementContent, Element } from "hast";

// import CodeStylerPlugin from "./main";
// import { SETTINGS_SOURCEPATH_PREFIX, TRANSITION_LENGTH } from "./Settings";
// import { CodeblockParameters, getFileContentLines, isCodeblockIgnored, isLanguageIgnored, parseCodeblockSource } from "./Parsing/CodeblockParsing";
// import { InlineCodeParameters, parseInlineCode } from "./Parsing/InlineCodeParsing";
// import { createHeader, createInlineOpener, getLineClass as getLineClasses } from "./CodeblockDecorating";

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
		codeblockPreElement.classList.remove("code-styler-folded");
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

async function remakeCodeblock(codeblockCodeElement: HTMLElement, codeblockPreElement: HTMLElement, codeblockParameters: CodeblockParameters, sourcePath: string, dynamic: boolean, plugin: CodeStylerPlugin) {
	if (dynamic)
		plugin.executeCodeMutationObserver.observe(codeblockPreElement,{childList: true,subtree: true,attributes: true,characterData: true}); // Add Execute Code Observer

	insertHeader(codeblockPreElement,codeblockParameters,sourcePath,plugin,dynamic);

	codeblockPreElement.classList.add(...getPreClasses(codeblockParameters,dynamic));
	codeblockPreElement.setAttribute("defaultFold",codeblockParameters.fold.enabled.toString());
	if (codeblockPreElement.parentElement)
		codeblockPreElement.parentElement.classList.add("code-styler-pre-parent");

	if (!codeblockCodeElement.querySelector("code [class*='code-styler-line']")) // Ignore styled lines
		decorateCodeblockLines(codeblockCodeElement,codeblockParameters,sourcePath,plugin);
}

function insertHeader(codeblockPreElement: HTMLElement, codeblockParameters: CodeblockParameters, sourcePath: string, plugin: CodeStylerPlugin, dynamic: boolean): void {
	const headerContainer = createHeader(codeblockParameters, plugin.settings.currentTheme.settings, sourcePath, plugin);
	if (dynamic)
		headerContainer.addEventListener("click",()=>{toggleFold(codeblockPreElement);}); // Add listener for header folding on click
	codeblockPreElement.insertBefore(headerContainer,codeblockPreElement.childNodes[0]);
}
export function readingDocumentFold(contentEl: HTMLElement, fold?: boolean) {
	const codeblockPreElements = contentEl.querySelectorAll("pre.code-styler-pre");
	if (typeof fold === "undefined") //Return all blocks to original state
		codeblockPreElements.forEach((codeblockPreElement: HTMLElement)=>{toggleFold(codeblockPreElement,(codeblockPreElement.getAttribute("defaultFold")??"false")==="true");});
	else //Fold or unfold all blocks
		codeblockPreElements.forEach((codeblockPreElement: HTMLElement)=>{toggleFold(codeblockPreElement,fold);});
}
async function toggleFold(codeblockPreElement: HTMLElement, fold?: boolean): Promise<void> {
	if (codeblockPreElement.firstElementChild?.classList?.contains("code-styler-header-container-hidden"))
		return;
	codeblockPreElement.querySelectorAll("pre > code").forEach((codeblockCodeElement: HTMLElement)=>codeblockCodeElement.style.setProperty("max-height",`calc(${Math.ceil(codeblockCodeElement.scrollHeight+0.01)}px + var(--code-padding) * ${codeblockCodeElement.classList.contains("execute-code-output")?"3.5 + var(--header-separator-width)":"2"})`));
	codeblockPreElement.classList.add("hide-scroll");
	await sleep(1);
	if (typeof fold === "undefined")
		codeblockPreElement.classList.toggle("code-styler-folded");
	else
		fold?codeblockPreElement.classList.add("code-styler-folded"):codeblockPreElement.classList.remove("code-styler-folded");
	await sleep(TRANSITION_LENGTH);
	codeblockPreElement.querySelectorAll("pre > code").forEach((codeblockCodeElement: HTMLElement)=>codeblockCodeElement.style.removeProperty("max-height"));
	codeblockPreElement.classList.remove("hide-scroll");
}
function getPreClasses(codeblockParameters: CodeblockParameters, dynamic: boolean): Array<string> {
	const preClassList = ["code-styler-pre"];
	if (codeblockParameters.language)
		preClassList.push(`language-${codeblockParameters.language}`);
	if (dynamic) {
		if (codeblockParameters.fold.enabled)
			preClassList.push("code-styler-folded");
		if (codeblockParameters.lineUnwrap.alwaysEnabled)
			preClassList.push(codeblockParameters.lineUnwrap.activeWrap?"unwrapped-inactive":"unwrapped");
		else if (codeblockParameters.lineUnwrap.alwaysDisabled)
			preClassList.push("wrapped");
	}
	return preClassList;
}
function decorateCodeblockLines(codeblockCodeElement: HTMLElement, codeblockParameters: CodeblockParameters, sourcePath: string, plugin: CodeStylerPlugin): void {
	let indentation = 0;
	getCodeblockLines(codeblockCodeElement,sourcePath,plugin).forEach((line,index,codeblockLines) => {
		const currentIndentation = countTabs(line);
		if (currentIndentation > indentation) {
			//TODO (@mayurankv) Add fold to previous point
			indentation = currentIndentation;
		} else if (currentIndentation < indentation) {
			//TODO (@mayurankv) Close all folds to level of current indentation
			indentation = currentIndentation;
		}
		if (currentIndentation > 0) {
			//TODO (@mayurankv) Add indentation line
		}
		if (index !== codeblockLines.length-1)
			insertLineWrapper(codeblockCodeElement,codeblockParameters,index+1,line,plugin.settings.currentTheme.settings.codeblock.lineNumbers);
	});
}
function getCodeblockLines(codeblockCodeElement: HTMLElement, sourcePath: string, plugin: CodeStylerPlugin): Array<string> {
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
	const splitHtmlTree = fromHtml(codeblockHTML,{fragment: true});
	visitParents(splitHtmlTree,["element"],(node)=>{
		if (node.type === "element" && Array.isArray(node.properties.className) && node.properties?.className?.includes("comment")) {
			node.children = node.children.reduce((result: Array<ElementContent>, child: ElementContent): Array<ElementContent> => {
				if (child.type !== "text")
					result.push(child);
				else
					result = convertCommentLinks(result,child.value,sourcePath,plugin);
				return result;
			},[]);
		}
	});
	codeblockHTML = toHtml(splitHtmlTree);
	let codeblockLines = codeblockHTML.split("<br>");
	if (codeblockLines.length === 1)
		codeblockLines = ["",""];
	codeblockCodeElement.innerHTML = "";
	return codeblockLines;
}
function convertCommentLinks(result: Array<ElementContent>, commentText: string, sourcePath: string, plugin: CodeStylerPlugin): Array<ElementContent> {
	const linkMatches = [...commentText.matchAll(/(?:\[\[[^\]|\r\n]+?(?:\|[^\]|\r\n]+?)?\]\]|\[.*?\]\(.+\))/g)].reverse();
	const newChildren = linkMatches.reduce((result: Array<ElementContent>, linkMatch: RegExpMatchArray): Array<ElementContent> => {
		if (typeof linkMatch?.index === "undefined")
			return result;
		const ending = commentText.slice(linkMatch.index + linkMatch[0].length);
		result.push({type: "text",value: ending});
		const linkText = commentText.slice(linkMatch.index, linkMatch.index + linkMatch[0].length);
		const linkContainer = createDiv();
		MarkdownRenderer.render(plugin.app, linkText, linkContainer, sourcePath, plugin);
		const linkChild = (fromHtml(linkContainer.innerHTML,{fragment: true})?.children?.[0] as Element)?.children?.[0];
		result.push(linkChild);
		commentText = commentText.slice(0, linkMatch.index);
		return result;
	},[]).reverse();
	return [...result, ...[{type: "text",value: commentText} as ElementContent,...newChildren]];
}
function insertLineWrapper(codeblockCodeElement: HTMLElement, codeblockParameters: CodeblockParameters, lineNumber: number, line: string, showLineNumbers: boolean): void {
	const lineWrapper = document.createElement("div");
	codeblockCodeElement.appendChild(lineWrapper);
	getLineClasses(codeblockParameters,lineNumber,line).forEach((lineClass) => lineWrapper.classList.add(lineClass));
	if ((showLineNumbers && !codeblockParameters.lineNumbers.alwaysDisabled) || codeblockParameters.lineNumbers.alwaysEnabled)
		lineWrapper.appendChild(createDiv({cls: "code-styler-line-number", text: (lineNumber+codeblockParameters.lineNumbers.offset).toString()}));
	lineWrapper.appendChild(createDiv({cls: "code-styler-line-text", text: sanitizeHTMLToDom(line !== "" ? line : "<br>")}));
}
function countTabs(text: string): number {
	//TODO (@mayurankv) Make work with space indentation too
	let count = 0;
	let index = 0;
	while (text.charAt(index++) === "\t")
		count++;
	return count;
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
