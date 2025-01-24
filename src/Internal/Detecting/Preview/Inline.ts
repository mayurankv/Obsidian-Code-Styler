import { CachedMetadata, DataAdapter, MarkdownPostProcessorContext, MarkdownSectionInformation, parseLinktext, resolveSubpath, SectionCache, View } from "obsidian";
import { CONTENT_ATTRIBUTE, EMPTY_PARAMETERS_ATTRIBUTE, PARAMETERS_ATTRIBUTE } from "src/Internal/constants/parameters";
import CodeStylerPlugin from "src/main";
import { SETTINGS_SOURCEPATH_PREFIX } from "src/_temp/_Old/Settings";
import { CodeParsingContext } from "src/Internal/types";
import { unified } from "unified";
import markdown from 'remark-parse';
import { visit } from 'unist-util-visit';
import { splitInlineCodeRaw } from "../../Parsing/Inline";
import { isUnparsedCodeElement } from "../../Parsing/utils";

export async function renderedInlineCodeParsing(
	element: HTMLElement,
	context: MarkdownPostProcessorContext,
	plugin: CodeStylerPlugin,
): Promise<void> {
	if (!element || !context?.sourcePath)
		return;

	const view = plugin.app.workspace.getActiveViewOfType(View);
	if (!view)
		return;

	const cache: CachedMetadata | null = plugin.app.metadataCache.getCache(context.sourcePath);
	if ((context.frontmatter ?? cache?.frontmatter)?.["code-styler-ignore"] === true)
		return;

	for (const inlineCodeElement of Array.from(element.querySelectorAll(":not(pre) > code")) as Array<HTMLElement>) {
		const inlineCodeRaw = inlineCodeElement.innerText;
		const {inlineCodeParameters, inlineCodeContent} = splitInlineCodeRaw(inlineCodeRaw);

		if (!isUnparsedCodeElement(inlineCodeElement))
			return;

		inlineCodeElement.setAttribute(CONTENT_ATTRIBUTE, inlineCodeContent);
		inlineCodeElement.setAttribute(PARAMETERS_ATTRIBUTE, inlineCodeParameters ?? "");
		inlineCodeElement.setAttribute(EMPTY_PARAMETERS_ATTRIBUTE, (inlineCodeParameters === null) ? "true" : "false");
	}
}
