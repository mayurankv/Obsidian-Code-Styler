import { ElementContent } from "hast";
import { fromHtml } from "hast-util-from-html";
import { toHtml } from "hast-util-to-html";
import { MarkdownPostProcessorContext, sanitizeHTMLToDom } from "obsidian";
import { DECORATED_ATTRIBUTE, DEFAULT_FOLD_ATTRIBUTE, FOLD_ATTRIBUTE, WRAP_ATTRIBUTE } from "src/Internal/constants/decoration";
import { CONTENT_ATTRIBUTE, DETECTING_CONTEXT, PARAMETERS_ATTRIBUTE } from "src/Internal/constants/detecting";
import { PREFIX } from "src/Internal/constants/general";
import { parseFenceCodeParameters, toDecorateFenceCode } from "src/Internal/Parsing/Fenced";
import { CodeDetectingContext } from "src/Internal/types/detecting";
import { FenceCodeParameters } from "src/Internal/types/parsing";
import CodeStylerPlugin from "src/main";
import { visitParents } from "unist-util-visit-parents";
import { convertCommentLinks, createFenceHeaderElement, getIndentation, getLineClasses } from "../utils";

export async function renderedInlineCodeDecorating(
	element: HTMLElement,
	context: MarkdownPostProcessorContext,
	plugin: CodeStylerPlugin,
): Promise<void> {
	const inlineCodeElements = Array.from(element.querySelectorAll(`:not(pre) > code[${PARAMETERS_ATTRIBUTE}]`))
	for (const inlineCodeElement of inlineCodeElements as Array<HTMLElement>) {
		const decorated = inlineCodeElement.getAttribute(DECORATED_ATTRIBUTE) ?? "false"
		if (decorated === "true")
			return;

		const inlineCodeParameters = parseInlineCodeParameters(inlineCodeElement.getAttribute(PARAMETERS_ATTRIBUTE) ?? " ");
		const codeDetectingContext = (fenceCodeElement.getAttribute(DETECTING_CONTEXT) ?? "standalone") as CodeDetectingContext

		if (!toDecorateFenceCode(fenceCodeParameters))
			return;

		const staticRender = codeDetectingContext === "export"

		decorateInlineCodeElement(
			fenceCodeElement,
			fenceCodeParameters,
			staticRender,
			context.sourcePath,
			plugin,
		)
	}


	for (const inlineCodeElement of Array.from(element.querySelectorAll(":not(pre) > code"))) {
		await remakeInlineCode(inlineCodeElement as HTMLElement,plugin);
	}
}

export function renderedInlineCodeUndecorating(): void {
	const removableElements = [
		...Array.from(document.querySelectorAll(`:not(pre) > code.${PREFIX}.code-inline span.${PREFIX}inline-opener`)),
	]
	removableElements.forEach(element => element.remove());

	document.querySelectorAll(`:not(pre) > code.${PREFIX}.code-inline`).forEach((inlineCodeElement: HTMLElement) => {
		inlineCodeElement.innerHTML = (inlineCodeElement.getAttribute(PARAMETERS_ATTRIBUTE) ?? "") + (inlineCodeElement.getAttribute(CONTENT_ATTRIBUTE) ?? "");
	});
}

function decorateInlineCodeElement(
	fenceCodeElement: HTMLElement,
	fenceCodeParameters: FenceCodeParameters,
	staticRender: boolean,
	sourcePath: string,
	plugin: CodeStylerPlugin,
): void {
	const fencePreElement = fenceCodeElement.parentElement
	if (!fencePreElement)
		return;

	const fencePreParentElement = fencePreElement.parentElement
	if (!fencePreParentElement)
		return;

	if (!staticRender)
		plugin.mutationObservers.executeCode.observe(
			fencePreElement,
			{
				childList: true,
				subtree: true,
				attributes: true,
				characterData: true,
			},
		)

	const fenceHeaderElement = createFenceHeaderElement(
		fenceCodeParameters,
		sourcePath,
		plugin,
	);

	markupFenceCodeElement(
		fenceCodeElement,
		fenceCodeParameters,
		sourcePath,
		plugin,
	)
	fencePreElement.insertBefore(fenceHeaderElement, fencePreElement.childNodes[0]);

	fenceCodeElement.setAttribute(DECORATED_ATTRIBUTE, "true")
}

function markupInlineCodeElement(
	fenceCodeElement: HTMLElement,
	fenceCodeParameters: FenceCodeParameters,
	sourcePath: string,
	plugin: CodeStylerPlugin,
): void {
	const fenceCodeLines = getFenceCodeLines(fenceCodeElement, sourcePath, plugin)

	let indentation = 0;
	fenceCodeLines.forEach(
		(line, idx, fenceCodeLines) => {
			const currentIndentation = getIndentation(line);
			if (currentIndentation > indentation) {
				//TODO (@mayurankv) Add fold start to previous line for indentation level currentIndentation
				indentation = currentIndentation;
			} else if (currentIndentation < indentation) {
				//TODO (@mayurankv) Add fold end to previous line for all indentation levels currentIndentation+1 -> indentation
				indentation = currentIndentation;
			}
			if (currentIndentation > 0) {
				//TODO (@mayurankv) Add indentation line element
			}
		},
	);

	fenceCodeElement.classList.add(`${PREFIX}code`)
	fenceCodeElement.innerHTML = ""
	fenceCodeElement.append(
		...fenceCodeLines.filter(
			(line, idx, fenceCodeLines) => idx !== fenceCodeLines.length - 1,
		).map(
			(line, idx) => {
				const lineNumber = idx + fenceCodeParameters.lineNumbers.offset + 1
				const lineContainer = document.createDiv({
					cls: getLineClasses(fenceCodeParameters, lineNumber, line)
				});
				lineContainer.append(
					createDiv({ cls: PREFIX + "line-number", text: lineNumber.toString() }),
					createDiv({ cls: PREFIX + "line-text", text: sanitizeHTMLToDom(line !== "" ? line : "<br>") }),
				);

				return lineContainer
			},
		)
	)
}

//TODO: Update

import { MarkdownSectionInformation, CachedMetadata, sanitizeHTMLToDom, FrontMatterCache, MarkdownRenderer, MarkdownView, View } from "obsidian";
import { visitParents } from "unist-util-visit-parents";
import { fromHtml } from "hast-util-from-html";
import { toHtml } from "hast-util-to-html";
import { ElementContent, Element } from "hast";

import CodeStylerPlugin from "./main";
import { SETTINGS_SOURCEPATH_PREFIX, TRANSITION_LENGTH } from "./Settings";
import { CodeblockParameters, getFileContentLines, isCodeblockIgnored, isLanguageIgnored, parseCodeblockSource } from "./Parsing/CodeblockParsing";
import { InlineCodeParameters, parseInlineCode } from "./Parsing/InlineCodeParsing";
import { createHeader, createInlineOpener, getLineClass as getLineClasses } from "./CodeblockDecorating";

async function remakeInlineCode(inlineCodeElement: HTMLElement, plugin: CodeStylerPlugin): Promise<void> {
	if (!plugin.settings.currentTheme.settings.inline.syntaxHighlight || inlineCodeElement.classList.contains("code-styler-inline"))
		return;
	const inlineCodeText = inlineCodeElement.innerText;
	const {parameters,text} = parseInlineCode(inlineCodeText);
	if (parameters) {
		inlineCodeElement.innerHTML = await getHighlightedHTML(parameters,text,plugin);
		inlineCodeElement.innerHTML = inlineCodeElement.innerHTML + "&ZeroWidthSpace;";
		inlineCodeElement.classList.add("code-styler-inline");
		const parameterString = inlineCodeText.substring(0,inlineCodeText.lastIndexOf(text));
		inlineCodeElement.setAttribute("parameters",parameterString); // Store parameter string as attribute so original text can be restored on plugin removal
		if (parameters.icon || parameters.title)
			inlineCodeElement.insertBefore(createInlineOpener(parameters,plugin.languageIcons),inlineCodeElement.childNodes[0]);
	} else if (!parameters && text) {
		inlineCodeElement.innerText = text;
		inlineCodeElement.classList.add("code-styler-inline");
	}
}

async function getHighlightedHTML(parameters: InlineCodeParameters, text: string, plugin: CodeStylerPlugin): Promise<string> {
	const temporaryRenderingContainer = createDiv();
	MarkdownRenderer.render(plugin.app,["```",parameters.language,"\n",text,"\n","```"].join(""),temporaryRenderingContainer,"",plugin);
	const renderedCodeElement = temporaryRenderingContainer.querySelector("code");
	if (!renderedCodeElement)
		return "ERROR: Could not render highlighted code";
	while(plugin.settings.currentTheme.settings.inline.syntaxHighlight && !renderedCodeElement.classList.contains("is-loaded"))
		await sleep(2);
	return renderedCodeElement.innerHTML;
}
