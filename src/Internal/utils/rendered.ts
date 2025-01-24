import { CachedMetadata, MarkdownPostProcessorContext, View } from "obsidian";
import CodeStylerPlugin from "src/main";

export function toPostProcess(
	element: HTMLElement,
	context: MarkdownPostProcessorContext,
	plugin: CodeStylerPlugin,
): boolean {
	if (!element || !context?.sourcePath)
		return false;

	const view = plugin.app.workspace.getActiveViewOfType(View);
	if (!view)
		return false;

	const cache: CachedMetadata | null = plugin.app.metadataCache.getCache(context.sourcePath);
	if ((context.frontmatter ?? cache?.frontmatter)?.["code-styler-ignore"] === true)
		return false;

	return true;
}
