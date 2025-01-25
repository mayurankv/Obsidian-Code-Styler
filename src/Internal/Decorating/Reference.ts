import { MarkdownPostProcessorContext, MarkdownRenderer, MarkdownSectionInformation } from "obsidian";
import CodeStylerPlugin from "src/main";
import { getReference } from "../utils/reference";
import { applyStandaloneFencedDetecting } from "../Detecting/Rendered/fenced";
import { asyncDecorateFenceCodeElement } from "./Rendered/fenced";

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

	const reference = await getReference(
		codeblockLines,
		context.sourcePath,
		plugin,
	);
	MarkdownRenderer.render(
		plugin.app,
		reference.code,
		codeblockElement,
		context.sourcePath,
		plugin,
	);

	await applyStandaloneFencedDetecting(
		codeblockElement,
		context
	)

	const fenceCodeElement = codeblockElement.querySelector("pre:not(.frontmatter) > code") as HTMLElement | null
	if (!fenceCodeElement)
		throw new Error("Could't find codeblock in reference element")

	await asyncDecorateFenceCodeElement(
		fenceCodeElement,
		context,
		plugin,
	)
}
