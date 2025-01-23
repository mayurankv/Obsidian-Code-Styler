import { CachedMetadata, DataAdapter, Editor, MarkdownPostProcessorContext, MarkdownSectionInformation, MarkdownView, SectionCache, View } from "obsidian";
import { PARAMETERS_ATTRIBUTE } from "src/constants";
import CodeStylerPlugin from "src/main";
import { SETTINGS_SOURCEPATH_PREFIX } from "src/Settings";
import { CodeParsingContext, FencedCodeMarkupContext } from "src/types";
import { unified } from "unified";
import markdown from 'remark-parse';
import { visit } from 'unist-util-visit';

export async function renderedFencedParsing(
	element: HTMLElement,
	context: MarkdownPostProcessorContext,
	plugin: CodeStylerPlugin,
): Promise<void> {
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
	const editingMode = Boolean(element.matchParent(".cm-embed-block")) && (view.getViewType() === "markdown")

	if (codeParsingContext === "settings") {
		await applySettingsFencedParsing(
			element,
			context,
		)
	} else if ((codeParsingContext === "slides") || (codeParsingContext === "export" && plugin.settings.decoratePrint)) {
		const fileContentLines = await getFileContentLines(
			context.sourcePath,
			plugin.app.vault.adapter
		);
		await applyDocumentFencedParsing(
			element,
			// @ts-expect-error Undocumented Obsidian API
			view?.previewMode?.renderer?.previewEl as HTMLElement,
			cache,
			fileContentLines,
		)
	} else if ((codeParsingContext === "admonition" && editingMode)) { //NOTE: Possibly inefficient?
		const fileContentLines = await getFileContentLines(
			context.sourcePath,
			plugin.app.vault.adapter
		);
		await applyEmbeddedAdmonitionFencedParsing(
			element,
			// @ts-expect-error Undocumented Obsidian API
			view?.editMode?.editorEl as HTMLElement,
			cache,
			fileContentLines,
		)
	} else if ((codeParsingContext === "callout" && editingMode)) { //NOTE: Possibly inefficient?
		const fileContentLines = await getFileContentLines(
			context.sourcePath,
			plugin.app.vault.adapter
		);
		await applyEmbeddedCalloutFencedParsing(
			element,
			// @ts-expect-error Undocumented Obsidian API
			view?.editMode?.editorEl as HTMLElement,
			cache,
			fileContentLines,
		)
	} else if (codeParsingContext === "admonition") {
		const fileContentLines = await getFileContentLines(
			context.sourcePath,
			plugin.app.vault.adapter
		);
		await applyAdmonitionFencedParsing(
			element,
			// @ts-expect-error Undocumented Obsidian API
			view?.previewMode?.renderer?.previewEl as HTMLElement,
			cache,
			fileContentLines,
		)
	} else if (codeParsingContext === "callout") {
		await applyCalloutFencedParsing(
			element,
			context,
		)
	} else if (codeParsingContext === "standalone") {
		await applyStandaloneFencedParsing(
			element,
			context,
		)
	}
}

async function applyStandaloneFencedParsing(
	element: HTMLElement,
	context: MarkdownPostProcessorContext,
): Promise<void> {
	if (element.querySelectorAll("pre:not(.frontmatter) > code").length > 1)
		console.warn("Unexpected number of fenced codeblocks")

	const fenceCodeElement = element.querySelector("pre:not(.frontmatter) > code") as HTMLElement
	if (!fenceCodeElement)
		return;

	const fenceSectionLines = getElementSectionLines(element, context)
	if (!fenceSectionLines)
		return;

	if (!isFenceCodeElement(fenceCodeElement))
		return;

	const fenceCodeParameters = cleanFenceCodeParameters(fenceSectionLines[0])
	applyFenceCodeParameters(
		fenceCodeElement,
		fenceCodeParameters,
	)
	fenceCodeElement.innerHTML = fenceCodeElement.getAttribute(PARAMETERS_ATTRIBUTE) ?? "ERROR" //TODO:DELETE
}

async function applyCalloutFencedParsing(
	element: HTMLElement,
	context: MarkdownPostProcessorContext,
): Promise<void> {
	const fenceSectionLines = getElementSectionLines(element, context)
	if (!fenceSectionLines)
		return;

	const fenceCodeElements = (Array.from(element.querySelectorAll("pre:not(.frontmatter) > code")) as Array<HTMLElement>).filter(isFenceCodeElement)

	const fenceCodeParametersList = getMarkdownFenceParameters(fenceSectionLines)

	if (fenceCodeElements.length !== fenceCodeParametersList.length)
		return;

	for (let idx = 0; idx < fenceCodeElements.length; idx++) {
		const fenceCodeElement = fenceCodeElements[idx];
		const fenceCodeParameters = cleanFenceCodeParameters(fenceCodeParametersList[idx]);
		applyFenceCodeParameters(
			fenceCodeElement,
			fenceCodeParameters,
		)
		fenceCodeElement.innerHTML = fenceCodeElement.getAttribute(PARAMETERS_ATTRIBUTE) ?? "ERROR" //TODO:DELETE
	}
}

async function applyEmbeddedCalloutFencedParsing(
	element: HTMLElement,
	contentElement: HTMLElement,
	cache: CachedMetadata | null,
	fileContentLines: Array<string>,
) {
	const filterSections = (section: SectionCache) => (section.type === "callout")
	const calloutSectionsLines = getSectionLines(
		cache,
		fileContentLines,
		filterSections,
	)
	if (!calloutSectionsLines)
		return;

	const calloutSections = (Array.from(contentElement.querySelectorAll(".cm-embed-block.cm-callout > .markdown-rendered, .HyperMD-callout.HyperMD-quote-1")) as Array<HTMLElement>)

	if (calloutSections.length !== calloutSectionsLines.length)
		return;

	let section_idx = calloutSections.indexOf(element)
	if (section_idx === -1)
		section_idx = calloutSections.findIndex((element) => element.classList.contains("HyperMD-callout"));
	//TODO: FIX - This isn't unique if multiple callouts are in editing mode rather than embed as there is no information to map them

	const fenceCodeElements = (Array.from(element.querySelectorAll("pre:not(.frontmatter) > code")) as Array<HTMLElement>).filter(isFenceCodeElement)

	const fenceCodeParametersList = getMarkdownFenceParameters(calloutSectionsLines[section_idx])

	if (fenceCodeElements.length !== fenceCodeParametersList.length)
		return;

	for (let idx = 0; idx < fenceCodeElements.length; idx++) {
		const fenceCodeElement = fenceCodeElements[idx];
		const fenceCodeParameters = cleanFenceCodeParameters(fenceCodeParametersList[idx]);
		applyFenceCodeParameters(
			fenceCodeElement,
			fenceCodeParameters,
		)
		fenceCodeElement.innerHTML = fenceCodeElement.getAttribute(PARAMETERS_ATTRIBUTE) ?? "ERROR" //TODO:DELETE
	}
}

async function applyAdmonitionFencedParsing(
	element: HTMLElement,
	contentElement: HTMLElement,
	cache: CachedMetadata | null,
	fileContentLines: Array<string>,
): Promise<void> {
	const admonitionSectionsLines = getAdmonitionLines(cache, fileContentLines)
	if (!admonitionSectionsLines)
		{console.log("foo");  return;}

	const admonitionSections = (Array.from(contentElement.querySelectorAll(".callout-content.admonition-content:not(.internal-embed .callout-content.admonition-content):not(.callout-content.admonition-content .callout-content.admonition-content)")) as Array<HTMLElement>)

	console.log(admonitionSections)
	console.log(admonitionSectionsLines)
	console.log(admonitionSections.length, admonitionSectionsLines.length)
	if (admonitionSections.length !== admonitionSectionsLines.length)
		return;

	let section_idx = admonitionSections.indexOf(element)
	if (section_idx === -1)
		return;

	const fenceCodeElements = (Array.from(element.querySelectorAll("pre:not(.frontmatter) > code")) as Array<HTMLElement>).filter(isFenceCodeElement)

	const fenceCodeParametersList = getMarkdownFenceParameters(admonitionSectionsLines[section_idx])

	if (fenceCodeElements.length !== fenceCodeParametersList.length)
		return;

	for (let idx = 0; idx < fenceCodeElements.length; idx++) {
		const fenceCodeElement = fenceCodeElements[idx];
		const fenceCodeParameters = cleanFenceCodeParameters(fenceCodeParametersList[idx]);
		// const fenceCodeParameters = "ADMONITION TODO"
		applyFenceCodeParameters(
			fenceCodeElement,
			fenceCodeParameters,
		)
		fenceCodeElement.innerHTML = fenceCodeElement.getAttribute(PARAMETERS_ATTRIBUTE) ?? "ERROR" //TODO:DELETE
	}
}

async function applyEmbeddedAdmonitionFencedParsing(
	element: HTMLElement,
	contentElement: HTMLElement,
	cache: CachedMetadata | null,
	fileContentLines: Array<string>,
): Promise<void> {
	const admonitionSectionsLines = getAdmonitionLines(cache, fileContentLines)
	if (!admonitionSectionsLines)
		return;

	const admonitionSections = (Array.from(contentElement.querySelectorAll(".callout-content.admonition-content, .HyperMD-codeblock-begin > .cm-hmd-codeblock")) as Array<HTMLElement>).filter((element) => (element.classList.contains("admonition-content") || RegExp(`^[> ]*[\`~]*ad-`).test(element.innerText)))
	console.log(admonitionSections)
	console.log(admonitionSectionsLines)
	console.log(element)

	console.log(admonitionSections)
	console.log(admonitionSectionsLines)
	console.log(admonitionSections.length, admonitionSectionsLines.length)
	if (admonitionSections.length !== admonitionSectionsLines.length)
		return;

	let section_idx = admonitionSections.indexOf(element)
	if (section_idx === -1)
		section_idx = admonitionSections.findIndex((element) => element.classList.contains("cm-hmd-codeblock"));
	console.log(section_idx)
	//TODO: FIX - This isn't unique if multiple callouts are in editing mode rather than embed as there is no information to map them

	const fenceCodeElements = (Array.from(element.querySelectorAll("pre:not(.frontmatter) > code")) as Array<HTMLElement>).filter(isFenceCodeElement)

	const fenceCodeParametersList = getMarkdownFenceParameters(admonitionSectionsLines[section_idx])

	if (fenceCodeElements.length !== fenceCodeParametersList.length)
		return;

	for (let idx = 0; idx < fenceCodeElements.length; idx++) {
		const fenceCodeElement = fenceCodeElements[idx];
		// const fenceCodeParameters = cleanFenceCodeParameters(fenceCodeParametersList[idx]);
		const fenceCodeParameters = "ADMONITION TODO"
		applyFenceCodeParameters(
			fenceCodeElement,
			fenceCodeParameters,
		)
		fenceCodeElement.innerHTML = fenceCodeElement.getAttribute(PARAMETERS_ATTRIBUTE) ?? "ERROR" //TODO:DELETE
	}
}

async function applyDocumentFencedParsing(
	element: HTMLElement,
	contentElement: HTMLElement,
	cache: CachedMetadata | null,
	fileContentLines: Array<string>,
) {
	const filterSections = (section: SectionCache) => (section.type === "callout" || section.type === "code")
	const fenceDocumentLines = getSectionLines(
		cache,
		fileContentLines,
		filterSections,
	)?.flat()
	if (!fenceDocumentLines)
		return;

	const fenceCodeElements = (Array.from(contentElement.querySelectorAll("pre:not(.frontmatter) > code")) as Array<HTMLElement>).filter(isFenceCodeElement)
	const fenceCodeParametersList = getMarkdownFenceParameters(fenceDocumentLines)

	if (fenceCodeElements.length !== fenceCodeParametersList.length)
		return;

	for (let idx = 0; idx < fenceCodeElements.length; idx++) {
		const fenceCodeElement = fenceCodeElements[idx];
		const fenceCodeParameters = cleanFenceCodeParameters(fenceCodeParametersList[idx]);
		applyFenceCodeParameters(
			fenceCodeElement,
			fenceCodeParameters,
		)
		fenceCodeElement.innerHTML = fenceCodeElement.getAttribute(PARAMETERS_ATTRIBUTE) ?? "ERROR" //TODO:DELETE
	}
}

async function applySettingsFencedParsing(
	element: HTMLElement,
	context: MarkdownPostProcessorContext,
): Promise<void> {
	const fenceCodeElement = element.querySelector("pre:not(.frontmatter) > code") as HTMLElement
	if (!fenceCodeElement)
		return;

	const fenceSectionLines = context.sourcePath.substring(SETTINGS_SOURCEPATH_PREFIX.length).split("\n")

	if (!isFenceCodeElement(fenceCodeElement))
		return;

	const fenceCodeParameters = cleanFenceCodeParameters(fenceSectionLines[0])
	applyFenceCodeParameters(
		fenceCodeElement,
		fenceCodeParameters,
	)
}

// TODO: MOVE THese functions elsewhere
async function getFileContentLines(
	sourcePath: string,
	adapter: DataAdapter,
): Promise<Array<string>> {
	return (await adapter.read(sourcePath)).split(/\n/g);
}

function getElementSectionLines(
	element: HTMLElement,
	context: MarkdownPostProcessorContext,
): Array<string> | null {
	const fenceSectionInfo: MarkdownSectionInformation | null = context.getSectionInfo(element);
	if (!fenceSectionInfo)
		return null;

	const fenceSectionLines = Array.from(
		{ length: fenceSectionInfo.lineEnd - fenceSectionInfo.lineStart + 1 },
		(_, num) => num + fenceSectionInfo.lineStart).map((lineNumber) => fenceSectionInfo.text.split("\n")[lineNumber],
	)

	return fenceSectionLines
}

function getSectionLines(
	cache: CachedMetadata | null,
	fileContentLines: Array<string>,
	filterSections: (section: SectionCache) => boolean,
): Array<Array<string>> | null {
	const sections = cache?.sections
	if (typeof sections === "undefined")
		return null;

	const fenceDocumentLines = sections.filter(
		filterSections,
	).map(
		(section: SectionCache) => fileContentLines.slice(section.position.start.line, section.position.end.line + 1),
	)

	return fenceDocumentLines
}

function getAdmonitionLines(
	cache: CachedMetadata | null,
	fileContentLines: Array<string>,
) {
	const filterSections = (section: SectionCache) => (section.type === "code")
	const admonitionSectionLines = getSectionLines(
		cache,
		fileContentLines,
		filterSections,
	)?.filter(
		(sectionLinesList) => (RegExp(`^[> ]*[\`~]+ad-`).test(sectionLinesList[0]))
	)

	return admonitionSectionLines
}

function getMarkdownFenceParameters(
	fenceSectionLines: Array<string>,
): Array<string> {
	const tree = unified().use(markdown).parse(fenceSectionLines.join("\n"));
	const fenceSectionParameters: Array<string> = []
	visit(
		tree,
		'code',
		(node: any) => {
			if (node?.lang?.startsWith("ad-") && !node?.meta)
				fenceSectionParameters.push(...getMarkdownFenceParameters(node?.value?.split("\n")))
			else
				fenceSectionParameters.push(fenceSectionLines[node.position.start.line-1]); //NOTE: Used to use `\`\`\`${node.lang || ""} ${node.meta || ""}`
		}
	);

	return fenceSectionParameters
}

function isFenceCodeElement(
	fenceCodeElement: HTMLElement,
): boolean {
	// if (!fenceCodeElement.className)
	// 	return false;

	const fencePreElement = fenceCodeElement.parentElement;
	if (!fencePreElement)
		return false;

	const fenceParentElement = fencePreElement.parentElement;
	if (!fenceParentElement)
		return false;

	return true
}

function isUnparsedFenceCodeElement(
	fenceCodeElement: HTMLElement,
): boolean {
	const parsed = fenceCodeElement.getAttribute(PARAMETERS_ATTRIBUTE)
	if (parsed)
		return false;

	return true
}

function cleanFenceCodeParameters(
	fenceCodeParameters: string,
): string {
	fenceCodeParameters = fenceCodeParameters.replace(new RegExp(`^[> ]*`), '')
	fenceCodeParameters = fenceCodeParameters.replace(new RegExp(`^[\`~]+`), '');
	fenceCodeParameters += " "

	return fenceCodeParameters
}

function applyFenceCodeParameters(
	fenceCodeElement: HTMLElement,
	fenceCodeParameters: string,
) {
	if (isUnparsedFenceCodeElement(fenceCodeElement))
		fenceCodeElement.setAttribute(PARAMETERS_ATTRIBUTE, fenceCodeParameters)
}

function doesCalloutOverlap(
	editor: Editor,
	section: SectionCache,
): boolean {
	const cursor = {from: editor.getCursor("from"), to: editor.getCursor("to")}
	const cursorPreCallout = (section.position.start.line > cursor.to.line || (section.position.start.line === cursor.to.line && section.position.start.col > cursor.to.ch))
	const cursorPostCallout = (section.position.end.line < cursor.from.line || (section.position.start.line === cursor.to.line && section.position.start.col < cursor.to.ch))

	const overlap = !cursorPreCallout && !cursorPostCallout

	return overlap
}
