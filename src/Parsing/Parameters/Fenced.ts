import { CachedMetadata, MarkdownPostProcessorContext, MarkdownSectionInformation, View } from "obsidian";
import CodeStylerPlugin from "src/main";
import { SETTINGS_SOURCEPATH_PREFIX } from "src/Settings";
import { CodeParsingContext, FencedCodeMarkupContext } from "src/types";

export async function renderedFencedParsing(
	element: HTMLElement,
	context: MarkdownPostProcessorContext,
	plugin: CodeStylerPlugin,
) {
	if (!element)
		return;

	const view = plugin.app.workspace.getActiveViewOfType(View);

	if (!view)
		return;

	const cache: CachedMetadata | null = plugin.app.metadataCache.getCache(context.sourcePath);
	if ((context.frontmatter ?? cache?.frontmatter)?.["code-styler-ignore"] === true)
		return;

	const codeParsingContext: CodeParsingContext = context.sourcePath.startsWith(SETTINGS_SOURCEPATH_PREFIX)
		? "settings"
		: document.querySelector("div.print")?.contains(element)
		? "export"
		: document.querySelector("div.slides")?.contains(element)
		? "slides"
		: element.classList.contains("admonition-content")
		? "admonition"
		: element.querySelector("div.callout-content") !== null
		? "callout"
		: "standalone";

	if (codeParsingContext === "settings") {
		await applySettingsFencedParsing(
			element,
			context,
		)
	} else if ((codeParsingContext === "slides") || (codeParsingContext === "export" && plugin.settings.decoratePrint)) {
		const fileContentLines = (await plugin.app.vault.adapter.read(context.sourcePath)).split(/\n/g);
		await applyFullFencedParsing(
			element,
			context,
			cache,
			fileContentLines,
		)
	} else if (codeParsingContext === "admonition") {
		await applyAdmonitionFencedParsing(element, context)
	} else if (codeParsingContext === "callout") {
		await applyCalloutFencedParsing(element, context)
	} else if (codeParsingContext === "standalone") {
		await applySingleFencedParsing(element, context)
	}
}

async function applySingleFencedParsing(
	element: HTMLElement,
	context: MarkdownPostProcessorContext,
) {
	if (element.querySelectorAll("pre:not(.frontmatter) > code").length > 1)
		console.warn("Unexpected number of fenced codeblocks")

	const fenceCodeElement = element.querySelector("pre:not(.frontmatter) > code") as HTMLElement
	if (!fenceCodeElement)
		return;

	const fenceSectionInfo: MarkdownSectionInformation | null = context.getSectionInfo(fenceCodeElement);
	if (!fenceSectionInfo)
		return;

	const fenceSectionLines = Array.from(
		{ length: fenceSectionInfo.lineEnd - fenceSectionInfo.lineStart + 1 },
		(_, num) => num + fenceSectionInfo.lineStart).map((lineNumber) => fenceSectionInfo.text.split("\n")[lineNumber],
	)

	if (!fenceCodeElement.className)
		return;

	const fencePreElement = fenceCodeElement.parentElement;
	if (!fencePreElement)
		return;

	const fenceParentElement = fencePreElement.parentElement;
	if (!fenceParentElement)
		return;

	const parsed = fenceCodeElement.getAttribute("code-parameters")
	if (parsed)
		return;

	const fenceCodeParameters = fenceSectionLines[0]
	fenceCodeElement.setAttribute("code-parameters", fenceCodeParameters)
	fenceCodeElement.innerHTML = fenceCodeElement.getAttribute("code-parameters") ?? "UNDONE"
	for (const codeElement of Array.from(element.querySelectorAll("pre:not(.frontmatter) > code")) as Array<HTMLElement>) {
		if (!codeElement.className)
			continue;

		const fenceCodeElement = codeElement

		const fencePreElement = fenceCodeElement.parentElement;
		if (!fencePreElement)
			continue;

		const fenceParentElement = fencePreElement.parentElement;
		if (!fenceParentElement)
			continue;

		const parsed = fenceCodeElement.getAttribute("code-parameters")
		if (parsed)
			continue;

		const fenceSectionInfo: MarkdownSectionInformation | null = context.getSectionInfo(fenceCodeElement);
		// console.log(fenceSectionInfo)
		// console.log(element)
		// console.log(context.getSectionInfo(fenceCodeElement),context.getSectionInfo(element))

		const fencedCodeMarkupContext: FencedCodeMarkupContext = element.querySelector("div.callout-content") !== null
			? "callout"
			: element.classList.contains("admonition-content")
			? "admonition"
			: "default";

		if (fencedCodeMarkupContext === "admonition") {
			// TODO:
			const fenceCodeParameters = "TODO ADMONITION"
			fenceCodeElement.setAttribute("code-parameters", fenceCodeParameters)
		} else if (fencedCodeMarkupContext === "callout") {
			// TODO:
			const fenceCodeParameters = "TODO CALLOUT"
			fenceCodeElement.setAttribute("code-parameters", fenceCodeParameters)
		} else if (fencedCodeMarkupContext === "default") {
			if (!fenceSectionInfo)
				continue;
			// console.log(fenceSectionInfo)

			const fenceSectionLines = Array.from(
				{ length: fenceSectionInfo.lineEnd - fenceSectionInfo.lineStart + 1 },
				(_, num) => num + fenceSectionInfo.lineStart).map((lineNumber) => fenceSectionInfo.text.split("\n")[lineNumber],
			)
			const fenceCodeParameters = fenceSectionLines[0]
			fenceCodeElement.setAttribute("code-parameters", fenceCodeParameters)
		}
		fenceCodeElement.innerHTML = fenceCodeElement.getAttribute("code-parameters") ?? "UNDONE"
	}
}

async function applyCalloutFencedParsing(
	element: HTMLElement,
	context: MarkdownPostProcessorContext,
) {
	// TODO:
	const fenceCodeParameters = "TODO CALLOUT"
	fenceCodeElement.setAttribute("code-parameters", fenceCodeParameters)
	const fenceSectionInfo: MarkdownSectionInformation | null = context.getSectionInfo(element);
	// TODO:
	const fenceCodeElement = element.querySelector("pre:not(.frontmatter) > code")
	if (!fenceCodeElement)
		return;

	const parsed = fenceCodeElement.getAttribute("code-parameters")
	if (parsed)
		return;

	const fenceCodeLines = context.sourcePath.substring(SETTINGS_SOURCEPATH_PREFIX.length).split("\n")
	const fenceCodeParameters = fenceCodeLines[0]
	fenceCodeElement.setAttribute("code-parameters", fenceCodeParameters)
}


async function applyAdmonitionFencedParsing(
	element: HTMLElement,
	context: MarkdownPostProcessorContext,
) {
	// TODO:
	const fenceCodeParameters = "TODO ADMONITION"
	fenceCodeElement.setAttribute("code-parameters", fenceCodeParameters)
	// TODO:
	const fenceCodeElement = element.querySelector("pre:not(.frontmatter) > code")
	if (!fenceCodeElement)
		return;

	const parsed = fenceCodeElement.getAttribute("code-parameters")
	if (parsed)
		return;

	const fenceCodeLines = context.sourcePath.substring(SETTINGS_SOURCEPATH_PREFIX.length).split("\n")
	const fenceCodeParameters = fenceCodeLines[0]
	fenceCodeElement.setAttribute("code-parameters", fenceCodeParameters)
}

async function applyFullFencedParsing(
	element: HTMLElement,
	context: MarkdownPostProcessorContext,
	cache: CachedMetadata | null,
	fileContentLines: Array<string>,
) {
	const sections = cache?.sections
	if (typeof sections === "undefined")
		return;

	for (const section of sections) {
		console.log(section)
		// if (!editingEmbeds || section.type === "code" || section.type === "callout") {
		// 	const parsedCodeblocksParameters = fileContentLines.slice(section.position.start.line,section.position.end.line+1)
		// }
	}
	// class="internal-embed markdown-embed inline-embed is-loaded"
}

async function applySettingsFencedParsing(
	element: HTMLElement,
	context: MarkdownPostProcessorContext,
) {
	const fenceCodeElement = element.querySelector("pre:not(.frontmatter) > code")
	if (!fenceCodeElement)
		return;

	const parsed = fenceCodeElement.getAttribute("code-parameters")
	if (parsed)
		return;

	const fenceCodeLines = context.sourcePath.substring(SETTINGS_SOURCEPATH_PREFIX.length).split("\n")
	const fenceCodeParameters = fenceCodeLines[0]
	fenceCodeElement.setAttribute("code-parameters", fenceCodeParameters)
}
