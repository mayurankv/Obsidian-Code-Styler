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
	} else if (
		(codeParsingContext === "slides") ||
		(codeParsingContext === "export" && plugin.settings.decoratePrint) ||
		(codeParsingContext === "callout" && editingMode)) //NOTE: Possibly inefficient?
	{
		const fileContentLines = await getFileContentLines(
			context.sourcePath,
			plugin.app.vault.adapter
		);
		console.log("original element", element)
		console.log(view)
		// @ts-expect-error Undocumented Obsidian API
		element = (codeParsingContext === "callout" ? view.contentEl : element) as HTMLElement
		console.log("element",element)
		const filterSections = (codeParsingContext === "callout")
			? (section: SectionCache) => (section.type === "callout" && !doesCalloutOverlap((view as MarkdownView).editor, section))
			: (section: SectionCache) => (section.type === "callout" || section.type === "code")
		await applyDocumentFencedParsing(
			element,
			cache,
			fileContentLines,
			filterSections,
		)
	} else if (codeParsingContext === "admonition") {
		await applyAdmonitionFencedParsing(
			element,
			context,
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

async function applyAdmonitionFencedParsing(
	element: HTMLElement,
	context: MarkdownPostProcessorContext,
): Promise<void> {
	// const fenceSectionLines = getElementSectionLines(element, context)
	// if (!fenceSectionLines)
	// 	return;

	const fenceCodeElements = (Array.from(element.querySelectorAll("pre:not(.frontmatter) > code")) as Array<HTMLElement>).filter(isFenceCodeElement)

	// TODO: Parse admonition
	console.log("Admonition")

	for (const fenceCodeElement of fenceCodeElements) {
		// TODO: Joint loop with parsed

		const fenceCodeParameters = cleanFenceCodeParameters("TODO ADMONITION")
		applyFenceCodeParameters(
			fenceCodeElement,
			fenceCodeParameters,
		)
		fenceCodeElement.innerHTML = fenceCodeElement.getAttribute(PARAMETERS_ATTRIBUTE) ?? "ERROR" //TODO:DELETE
	}
}

async function applyDocumentFencedParsing(
	element: HTMLElement,
	cache: CachedMetadata | null,
	fileContentLines: Array<string>,
	filterSections: (section: SectionCache) => boolean = (section) => (section.type === "callout" || section.type === "code"),
) {
	const fenceDocumentLines = getFenceDocumentLines(
		cache,
		fileContentLines,
		filterSections,
	)
	if (!fenceDocumentLines)
		return;

	const fenceCodeElements = (Array.from(element.querySelectorAll("pre:not(.frontmatter) > code")) as Array<HTMLElement>).filter(isFenceCodeElement)
	const fenceCodeParametersList = getMarkdownFenceParameters(fenceDocumentLines)

	// TODO: class="internal-embed markdown-embed inline-embed is-loaded"
	console.log(fenceCodeElements.length, fenceCodeParametersList.length)
	console.log(fenceCodeParametersList)
	console.log(fenceCodeElements)
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

function getFenceDocumentLines(
	cache: CachedMetadata | null,
	fileContentLines: Array<string>,
	filterSections: (section: SectionCache) => boolean,
): Array<string> | null {
	const sections = cache?.sections
	if (typeof sections === "undefined")
		return null;

	const fenceDocumentLines = sections.filter(filterSections).reduce<Array<string>>(
		(fenceDocumentLines, section) => {
			const sectionLines = fileContentLines.slice(section.position.start.line, section.position.end.line + 1)
			fenceDocumentLines = fenceDocumentLines.concat(sectionLines)

			return fenceDocumentLines
		},
		[],
	)

	return fenceDocumentLines
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
	console.log("overlap", overlap)

	return overlap
}
