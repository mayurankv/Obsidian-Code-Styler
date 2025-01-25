import { CachedMetadata, DataAdapter, MarkdownPostProcessorContext, MarkdownSectionInformation, parseLinktext, resolveSubpath, SectionCache, View } from "obsidian";
import { CONTENT_ATTRIBUTE, EMPTY_PARAMETERS_ATTRIBUTE, PARAMETERS_ATTRIBUTE } from "src/Internal/constants/detecting";
import CodeStylerPlugin from "src/main";
import { splitInlineCodeRaw } from "../../Parsing/Inline";
import { isUndetectedCodeElement } from "../../utils/detecting";

export async function renderedInlineCodeDetecting(
	element: HTMLElement,
	context: MarkdownPostProcessorContext,
	plugin: CodeStylerPlugin,
): Promise<void> {
	for (const inlineCodeElement of Array.from(element.querySelectorAll(":not(pre) > code")) as Array<HTMLElement>) {
		const inlineCodeRaw = inlineCodeElement.innerText;
		const {inlineCodeParameters, inlineCodeContent} = splitInlineCodeRaw(inlineCodeRaw);

		if (!isUndetectedCodeElement(inlineCodeElement))
			return;

		inlineCodeElement.setAttribute(CONTENT_ATTRIBUTE, inlineCodeContent);
		inlineCodeElement.setAttribute(PARAMETERS_ATTRIBUTE, (inlineCodeParameters ?? "") + " ");
		inlineCodeElement.setAttribute(EMPTY_PARAMETERS_ATTRIBUTE, (inlineCodeParameters === null) ? "true" : "false");
	}
}
