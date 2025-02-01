import { MarkdownPostProcessorContext, MarkdownRenderer, MarkdownSectionInformation } from "obsidian";
import CodeStylerPlugin from "src/main";
import { applyStandaloneFencedDetecting } from "../../Detecting/Rendered/fenced";
import { PREFIX } from "../../constants/general";
import { REFERENCE_ATTRIBUTE } from "../../constants/reference";
import { Reference } from "../../types/reference";
import { getReference } from "../../utils/reference";
import { renderedFencedCodeDecorating } from "./fenced";

export async function referenceCodeblockProcessor(
	source: string,
	codeblockElement: HTMLElement,
	context: MarkdownPostProcessorContext,
	plugin: CodeStylerPlugin,
): Promise<void> {
	const codeblockSectionInfo: MarkdownSectionInformation | null = context.getSectionInfo(codeblockElement);
	if (codeblockSectionInfo === null)
		throw new Error("Could not retrieve codeblock information");

	const codeblockLines = [codeblockSectionInfo.text.split("\n")[codeblockSectionInfo.lineStart], ...source.split("\n")];
	if (codeblockLines[codeblockLines.length - 1] !== "")
		codeblockLines.push("");

	const reference: Reference = await getReference(
		codeblockLines,
		context.sourcePath,
		plugin,
	);

	await MarkdownRenderer.render(
		plugin.app,
		reference.code,
		codeblockElement,
		context.sourcePath,
		plugin,
	);

	const fenceCodeElement = codeblockElement.querySelector("pre > code")
	if (!fenceCodeElement)
		throw new Error("Missing rendered code element")

	await applyStandaloneFencedDetecting(
		codeblockElement,
		context
	)

	codeblockElement.addClass(`${PREFIX}-reference`)
	fenceCodeElement.setAttribute(REFERENCE_ATTRIBUTE, JSON.stringify({ ...reference, code: "" }))

	await renderedFencedCodeDecorating(
		codeblockElement,
		context,
		plugin
	)
}
