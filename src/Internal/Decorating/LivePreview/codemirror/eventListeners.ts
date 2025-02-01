import { EditorView, PluginValue, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import CodeStylerPlugin from "src/main";
import { livePreviewState, MarkdownEditView, MarkdownView, WorkspaceLeaf } from "obsidian";
import { DATA_PREFIX, UNWRAPPED_ATTRIBUTE } from "src/Internal/constants/detecting";
import { PREFIX } from "src/Internal/constants/general";
import { hasContentChanged } from "./utils";

export function createScrollEventObservers(
	plugin: CodeStylerPlugin,
): Extension {
	plugin.registerDomEvent(
		document.body,
		'scroll',
		(event: Event) => {
			if (!(event.target instanceof HTMLElement))
				return;

			if (!event.target.matches('div.cm-line.cs-line'))
				return;

			let scrollLine: Element | null = event.target

			if (scrollLine?.hasClass("HyperMD-codeblock-begin") || scrollLine?.hasClass("HyperMD-codeblock-end"))
				return;

			const scrolledLines: Array<Element> = [scrollLine]

			while (scrollLine !== null) {
				scrollLine = scrollLine.nextElementSibling

				if (scrollLine?.hasClass("HyperMD-codeblock-end"))
					break

				if (scrollLine?.hasClass("HyperMD-codeblock"))
					scrolledLines.push(scrollLine)
			}

			scrollLine = event.target

			while (scrollLine !== null) {
				scrollLine = scrollLine.previousElementSibling

				if (scrollLine?.hasClass("HyperMD-codeblock-begin"))
					break

				if (scrollLine?.hasClass("HyperMD-codeblock"))
					scrolledLines.push(scrollLine)
			}

			scrolledLines.forEach(
				(scrollLine: Element) => scrollLine.scrollLeft = (event.target as HTMLElement).scrollLeft
			)
		},
		{
			capture: true,
		},
	);

	return EditorView.domEventObservers({
		scroll: (event: Event, view: EditorView) => {

		},
	})
}
