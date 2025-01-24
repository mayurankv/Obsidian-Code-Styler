import { MarkdownRenderer, MarkdownPostProcessorContext, sanitizeHTMLToDom } from "obsidian";
import { DECORATED_ATTRIBUTE, TEMPORARY_SOURCEPATH } from "src/Internal/constants/decoration";
import { CONTENT_ATTRIBUTE, PARAMETERS_ATTRIBUTE } from "src/Internal/constants/detecting";
import { PREFIX } from "src/Internal/constants/general";
import { FenceCodeParameters, InlineCodeParameters } from "src/Internal/types/parsing";
import CodeStylerPlugin from "src/main";
import { createFenceHeaderElement, createInlineHeaderElement, getIndentation, getLineClasses } from "../utils";
import { parseInlineCodeParameters, toDecorateInlineCode, toHighlightInlineCode } from "src/Internal/Parsing/Inline";

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

		if (!toDecorateInlineCode(inlineCodeParameters))
			return;

		await decorateInlineCodeElement(
			inlineCodeElement,
			inlineCodeParameters,
			context.sourcePath,
			plugin,
		)
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

async function decorateInlineCodeElement(
	inlineCodeElement: HTMLElement,
	inlineCodeParameters: InlineCodeParameters,
	sourcePath: string,
	plugin: CodeStylerPlugin,
): Promise<void> {
	const inlineHeaderElement = createInlineHeaderElement(
		inlineCodeParameters,
		sourcePath,
		plugin,
	);

	await markupInlineCodeElement(
		inlineCodeElement,
		inlineCodeParameters,
		sourcePath,
		plugin,
	)
	inlineCodeElement.insertBefore(inlineHeaderElement, inlineCodeElement.childNodes[0]);

	inlineCodeElement.setAttribute(DECORATED_ATTRIBUTE, "true")
}

async function markupInlineCodeElement(
	inlineCodeElement: HTMLElement,
	inlineCodeParameters: InlineCodeParameters,
	sourcePath: string,
	plugin: CodeStylerPlugin,
): Promise<void> {
	inlineCodeElement.classList.add(`${PREFIX}code-inline`)

	if (!toHighlightInlineCode(plugin))
		return;

	const temporaryRenderingContainer = createDiv();
	await MarkdownRenderer.render(
		plugin.app,
		["```", inlineCodeParameters.language, "\n", inlineCodeElement.getAttribute(CONTENT_ATTRIBUTE) ?? "", "\n", "```"].join(""),
		temporaryRenderingContainer,
		TEMPORARY_SOURCEPATH,
		plugin,
	);
	const renderedCodeElement = temporaryRenderingContainer.querySelector("code");
	if (!renderedCodeElement)
		throw new Error("Could not render highlighted code");

	// while (plugin.settings.currentTheme.settings.inline.syntaxHighlight && !renderedCodeElement.classList.contains("is-loaded")) //TODO: Is needed?
	// 	await sleep(2);

	inlineCodeElement.innerHTML = renderedCodeElement.innerHTML + "&ZeroWidthSpace;";
}
