import { MarkdownPostProcessorContext, MarkdownRenderer } from "obsidian";
import { DECORATED_ATTRIBUTE, TEMPORARY_SOURCEPATH } from "src/Internal/constants/decoration";
import { CONTENT_ATTRIBUTE, PARAMETERS_ATTRIBUTE } from "src/Internal/constants/detecting";
import { PREFIX } from "src/Internal/constants/general";
import { InlineCodeParameters } from "src/Internal/types/parsing";
import CodeStylerPlugin from "src/main";
import { parseInlineCodeParameters, toDecorateInlineCode, toHighlightInlineCode } from "../../Parsing/inline";
import { createFooterElement, createHeaderElement } from "../elements";
import { codeToHast, codeToHtml, codeToTokens } from 'shiki'
import { USE_SHIKI } from "src/Internal/constants/settings";

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
		const inlineCodeContent = (inlineCodeElement.getAttribute(CONTENT_ATTRIBUTE) ?? " ").trim();

		if (!toDecorateInlineCode(inlineCodeParameters, inlineCodeContent))
			return;

		await decorateInlineCodeElement(
			inlineCodeElement,
			inlineCodeParameters,
			inlineCodeContent,
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
	inlineCodeContent: string,
	sourcePath: string,
	plugin: CodeStylerPlugin,
): Promise<void> {
	const inlineHeaderElement = createHeaderElement(
		inlineCodeParameters,
		false,
		inlineCodeContent,
		false,
		sourcePath,
		plugin,
	);

	const inlineFooterElement = createFooterElement(
		inlineCodeParameters,
		false,
		inlineCodeContent,
		false,
		sourcePath,
		plugin,
	);

	await markupInlineCodeElement(
		inlineCodeElement,
		inlineCodeParameters,
		plugin,
	)

	inlineCodeElement.insertBefore(inlineHeaderElement, inlineCodeElement.childNodes[0]);
	inlineCodeElement.appendChild(inlineFooterElement);

	inlineCodeElement.setAttribute(DECORATED_ATTRIBUTE, "true")
}

async function markupInlineCodeElement(
	inlineCodeElement: HTMLElement,
	inlineCodeParameters: InlineCodeParameters,
	plugin: CodeStylerPlugin,
): Promise<void> {
	if (toHighlightInlineCode(inlineCodeParameters, plugin)) {
		if (USE_SHIKI) {
			try {
				const htmlSections = (
					await codeToHtml(
						inlineCodeElement.getAttribute(CONTENT_ATTRIBUTE) ?? "",
						{
							lang: inlineCodeParameters.language ?? "",
							themes: {
								light: inlineCodeParameters.theme ?? 'github-light', //TODO: Replace github with settings default theme
								dark: inlineCodeParameters.theme ?? 'github-dark', //TODO: Replace github with settings default theme
							},
							defaultColor: inlineCodeParameters.dark === null
								? false
								: inlineCodeParameters.dark
									? "dark"
									: "light",
							cssVariablePrefix: `--${PREFIX}shiki-`,
						},
					)
				).match(/^<pre.*?style="(.*?)".*?><code>(.*?)<\/code><\/pre>/)
				if (!htmlSections)
					throw new Error("Could not render highlighted code");
				if (htmlSections[2])
					inlineCodeElement.innerHTML = htmlSections[2] + '&ZeroWidthSpace;';
				if (htmlSections[1])
					inlineCodeElement.setAttribute("style", htmlSections[1])

				inlineCodeElement.addClass(`${PREFIX}shiki`)
				if (inlineCodeParameters.dark !== null)
					inlineCodeElement.addClass(`${PREFIX}shiki-${inlineCodeParameters.dark ? 'dark' : 'light'}`)
			} catch (error) { }
		} else {
			const temporaryRenderingContainer = createDiv();
			await MarkdownRenderer.render(
				plugin.app,
				["```", inlineCodeParameters.language ?? "", "\n", inlineCodeElement.getAttribute(CONTENT_ATTRIBUTE) ?? "", "\n", "```"].join(""),
				temporaryRenderingContainer,
				TEMPORARY_SOURCEPATH,
				plugin,
			);

			const renderedCodeElement = temporaryRenderingContainer.querySelector("code");
			if (!renderedCodeElement)
				throw new Error("Could not render highlighted code");

			inlineCodeElement.innerHTML = renderedCodeElement.innerHTML + '&ZeroWidthSpace;';
		}
	} else {
		inlineCodeElement.innerHTML = inlineCodeElement.getAttribute(CONTENT_ATTRIBUTE) ?? "";
	}

	inlineCodeElement.addClass(`${PREFIX}code-inline`)
}
