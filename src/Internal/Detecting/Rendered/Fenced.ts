import { CachedMetadata, DataAdapter, MarkdownPostProcessorContext, MarkdownSectionInformation, parseLinktext, resolveSubpath, SectionCache, View } from "obsidian";
import { DETECTING_CONTEXT, PARAMETERS_ATTRIBUTE } from "src/Internal/constants/detecting";
import CodeStylerPlugin from "src/main";
import { unified } from "unified";
import markdown from 'remark-parse';
import { visit } from 'unist-util-visit';
import { isUndetectedCodeElement } from "../../utils/detecting";
import { SETTINGS_TAB_SOURCEPATH_PREFIX } from "src/Internal/constants/interface";
import { CodeDetectingContext } from "src/Internal/types/detecting";

export async function renderedFencedCodeDetecting(
	element: HTMLElement,
	context: MarkdownPostProcessorContext,
	plugin: CodeStylerPlugin,
): Promise<void> {
	const view = plugin.app.workspace.getActiveViewOfType(View);
	const cache = plugin.app.metadataCache.getCache(context.sourcePath)
	if (!view || !cache)
		return;

	const codeDetectingContext: CodeDetectingContext = context.sourcePath.startsWith(SETTINGS_TAB_SOURCEPATH_PREFIX)
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
	// @ts-expect-error Undocumented Obsidian API
	const editingMode = (view.getViewType() === "markdown") && (view.currentMode.type === "source")
	// @ts-expect-error Undocumented Obsidian API
	const embeddedContent = (view?.file?.path !== context.sourcePath);

	if (codeDetectingContext === "settings") {
		await applySettingsFencedDetecting(
			element,
			context,
		)
	} else if ((codeDetectingContext === "slides") || (codeDetectingContext === "export" && plugin.settings.decoratePrint)) {
		const fileContentLines = await getFileContentLines(
			context.sourcePath,
			plugin.app.vault.adapter
		);
		await applyDocumentFencedDetecting(
			element,
			cache,
			fileContentLines,
		)
	} else if ((codeDetectingContext === "admonition") && embeddedContent) { //NOTE: Possibly inefficient?
		const fileContentLines = await getFileContentLines(
			context.sourcePath,
			plugin.app.vault.adapter
		);
		await applyEmbeddedAdmonitionFencedDetecting(
			element,
			cache,
			fileContentLines,
		)
	} else if ((codeDetectingContext === "admonition") && editingMode) { //NOTE: Possibly inefficient?
		const fileContentLines = await getFileContentLines(
			context.sourcePath,
			plugin.app.vault.adapter
		);
		const editing = true
		await applyAdmonitionFencedDetecting(
			element,
			// @ts-expect-error Undocumented Obsidian API
			view?.editMode?.editorEl as HTMLElement,
			cache,
			fileContentLines,
			editing,
		)
	} else if ((codeDetectingContext === "callout") && editingMode) { //NOTE: Possibly inefficient?
		const fileContentLines = await getFileContentLines(
			context.sourcePath,
			plugin.app.vault.adapter
		);
		await applyEditingCalloutFencedDetecting(
			element,
			// @ts-expect-error Undocumented Obsidian API
			view?.editMode?.editorEl as HTMLElement,
			cache,
			fileContentLines,
		)
	} else if (codeDetectingContext === "admonition") {
		const fileContentLines = await getFileContentLines(
			context.sourcePath,
			plugin.app.vault.adapter
		);
		const editing = false
		await applyAdmonitionFencedDetecting(
			element,
			// @ts-expect-error Undocumented Obsidian API
			view?.previewMode?.renderer?.previewEl as HTMLElement,
			cache,
			fileContentLines,
			editing,
		)
	} else if (codeDetectingContext === "callout") {
		await applyCalloutFencedDetecting(
			element,
			context,
		)
	} else if (codeDetectingContext === "standalone") {
		await applyStandaloneFencedDetecting(
			element,
			context,
		)
	}
}

async function applyStandaloneFencedDetecting(
	element: HTMLElement,
	context: MarkdownPostProcessorContext,
): Promise<void> {
	if (element.querySelectorAll("pre:not(.frontmatter) > code").length > 1)
		console.warn("Unexpected number of fenced codeblocks")

	const fenceCodeElement = element.querySelector("pre:not(.frontmatter) > code") as HTMLElement
	if (!fenceCodeElement || !isFenceCodeElement(fenceCodeElement))
		return;

	const fenceSectionLines = getElementSectionLines(element, context)
	if (!fenceSectionLines)
		return;

	const fenceCodeParametersLine = fenceSectionLines[0]
	applyFenceCodeParametersLine(
		fenceCodeElement,
		fenceCodeParametersLine,
		"standalone",
	)
}

async function applyCalloutFencedDetecting(
	element: HTMLElement,
	context: MarkdownPostProcessorContext,
): Promise<void> {
	const fenceSectionLines = getElementSectionLines(element, context)
	if (!fenceSectionLines)
		return;

	applyFenceCodeParametersLinesList(
		element,
		fenceSectionLines,
		"callout",
	)
}

async function applyEditingCalloutFencedDetecting(
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

	let idxSection = calloutSections.indexOf(element)
	if (idxSection === -1)
		idxSection = calloutSections.findIndex((element) => element.classList.contains("HyperMD-callout"));
	//TODO: FIX - This isn't unique if multiple callouts are in editing mode rather than embed as there is no information to map them

	const fenceSectionLines = calloutSectionsLines[idxSection]
	applyFenceCodeParametersLinesList(
		element,
		fenceSectionLines,
		"callout",
	)
}

async function applyAdmonitionFencedDetecting(
	element: HTMLElement,
	contentElement: HTMLElement,
	cache: CachedMetadata | null,
	fileContentLines: Array<string>,
	editing: boolean
): Promise<void> {
	const admonitionSectionsLines = getAdmonitionLines(cache, fileContentLines)
	if (!admonitionSectionsLines)
		return;

	const query = editing
		? ".callout-content.admonition-content:not(.admonition-parent):not(.internal-embed .callout-content.admonition-content), .HyperMD-codeblock-begin > .cm-hmd-codeblock"
		: ".callout-content.admonition-content:not(.internal-embed .callout-content.admonition-content):not(.callout-content.admonition-content .callout-content.admonition-content)"
	const admonitionSections = (Array.from(contentElement.querySelectorAll(query)) as Array<HTMLElement>).filter((element) => (element.classList.contains("admonition-content") || RegExp(`^[> ]*[\`~]*ad-`).test(element.innerText)))

	if (admonitionSections.length !== admonitionSectionsLines.length)
		return;

	let idxSection = admonitionSections.indexOf(element)
	if (idxSection === -1)
		return;

	const fenceSectionLines = admonitionSectionsLines[idxSection]
	applyFenceCodeParametersLinesList(
		element,
		fenceSectionLines,
		"admonition",
	)
}

async function applyEmbeddedAdmonitionFencedDetecting(
	element: HTMLElement,
	cache: CachedMetadata | null,
	fileContentLines: Array<string>,
): Promise<void> {
	if (!cache)
		return;

	const admonitionSectionsLines = getAdmonitionLines(cache, fileContentLines)
	if (!admonitionSectionsLines)
		return;

	const embedElement = element?.matchParent(".internal-embed")
	if (!embedElement)
		return;

	const embedLink = embedElement?.getAttribute("src")
	if (!embedLink)
		return;

	const subPath = parseLinktext(embedLink).subpath

	let embeddedAdmonitionSectionsLines = admonitionSectionsLines
	if (subPath !== "") {
		const linkSection = resolveSubpath(cache, subPath)
		if (!linkSection)
			return;

		if (linkSection.type === "heading") {
			fileContentLines = (typeof linkSection.end?.line === "undefined")
				? fileContentLines.slice(linkSection.start.line)
				: fileContentLines.slice(linkSection.start.line, linkSection.end.line+2)
		} else if (linkSection.type === "block") {
			if (!linkSection.end?.line)
				return;

			fileContentLines = fileContentLines.slice(linkSection.start.line, linkSection.end.line + 1)
		}
		embeddedAdmonitionSectionsLines = embeddedAdmonitionSectionsLines.filter((admonitionSectionLines) => admonitionSectionLines.every((admonitionSectionLine) => fileContentLines.includes(admonitionSectionLine)))
	}

	const embeddedAdmonitionSections = (Array.from(embedElement.querySelectorAll(".callout-content.admonition-content:not(.admonition-parent)")) as Array<HTMLElement>)

	if (embeddedAdmonitionSections.length !== embeddedAdmonitionSectionsLines.length)
		return;

	let idxSection = embeddedAdmonitionSections.indexOf(element)
	if (idxSection === -1)
		return;

	const fenceSectionLines = embeddedAdmonitionSectionsLines[idxSection]
	applyFenceCodeParametersLinesList(
		element,
		fenceSectionLines,
		"admonition",
	)
}

async function applyDocumentFencedDetecting(
	element: HTMLElement,
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

	const fenceSectionLines = fenceDocumentLines
	applyFenceCodeParametersLinesList(
		element,
		fenceSectionLines,
		"export",
	)
}

async function applySettingsFencedDetecting(
	element: HTMLElement,
	context: MarkdownPostProcessorContext,
): Promise<void> {
	const fenceCodeElement = element.querySelector("pre:not(.frontmatter) > code") as HTMLElement
	if (!fenceCodeElement)
		return;

	if (!isFenceCodeElement(fenceCodeElement))
		return;

	const fenceSectionLines = context.sourcePath.substring(SETTINGS_TAB_SOURCEPATH_PREFIX.length).split("\n")

	const fenceCodeParametersLine = fenceSectionLines[0];
	applyFenceCodeParametersLine(
		fenceCodeElement,
		fenceCodeParametersLine,
		"settings",
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

	if (fenceCodeElement.className.startsWith("language-ad-"))
		return false;

	const fencePreElement = fenceCodeElement.parentElement;
	if (!fencePreElement)
		return false;

	const fenceParentElement = fencePreElement.parentElement;
	if (!fenceParentElement)
		return false;

	return true
}

function cleanFenceCodeParametersLine(
	fenceCodeParametersLine: string,
): string {
	fenceCodeParametersLine = fenceCodeParametersLine.replace(new RegExp(`^[> ]*`), '')
	fenceCodeParametersLine = fenceCodeParametersLine.replace(new RegExp(`^[\`~]+`), '');
	fenceCodeParametersLine += " "

	return fenceCodeParametersLine
}

function applyFenceCodeParametersLine(
	fenceCodeElement: HTMLElement,
	fenceCodeParametersLine: string,
	codeDetectingContext: CodeDetectingContext,
) {
	if (!isUndetectedCodeElement(fenceCodeElement))
		return;

	fenceCodeElement.setAttribute(PARAMETERS_ATTRIBUTE, cleanFenceCodeParametersLine(fenceCodeParametersLine))
	fenceCodeElement.setAttribute(DETECTING_CONTEXT, codeDetectingContext)
}

function applyFenceCodeParametersLinesList(
	element: HTMLElement,
	fenceSectionLines: Array<string>,
	codeDetectingContext: CodeDetectingContext,
) {
	const fenceCodeElements = (Array.from(element.querySelectorAll("pre:not(.frontmatter) > code")) as Array<HTMLElement>).filter(isFenceCodeElement)
	const fenceCodeParametersLinesList = getMarkdownFenceParameters(fenceSectionLines)

	if (fenceCodeElements.length !== fenceCodeParametersLinesList.length)
		return;

	for (let idx = 0; idx < fenceCodeElements.length; idx++) {
		const fenceCodeElement = fenceCodeElements[idx];
		const fenceCodeParametersLine = fenceCodeParametersLinesList[idx];
		applyFenceCodeParametersLine(
			fenceCodeElement,
			fenceCodeParametersLine,
			codeDetectingContext,
		)
	}
}
