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

			const scrolledLines: Array<Element> = [scrollLine]

			while (scrollLine !== null) {
				scrollLine = scrollLine.nextElementSibling

				if (scrollLine?.hasClass("HyperMD-codeblock"))
					scrolledLines.push(scrollLine)

				if (scrollLine?.hasClass("HyperMD-codeblock-end"))
					break
			}

			scrollLine = event.target

			while (scrollLine !== null) {
				scrollLine = scrollLine.previousElementSibling

				if (scrollLine?.hasClass("HyperMD-codeblock"))
					scrolledLines.push(scrollLine)

				if (scrollLine?.hasClass("HyperMD-codeblock-start"))
					break
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
			// console.log(event)
		},
	})
}

export function getWrappedCodeblocks(
	view: EditorView,
) {
	const wrappedCodeblocks = Array.from(view.contentDOM.querySelectorAll("div.HyperMD-codeblock-begin.cm-line")).map(
		(element: Element): Array<Element> => {
			if (element.hasAttribute(UNWRAPPED_ATTRIBUTE))
				return []

			let wrappedLine: Element | null = element

			const wrappedLineElements: Array<Element> = [wrappedLine]

			while (wrappedLine !== null) {
				wrappedLine = wrappedLine.nextElementSibling
				if (wrappedLine?.hasClass("HyperMD-codeblock"))
					wrappedLineElements.push(wrappedLine)
				else
					return []

				if (wrappedLine?.hasClass("HyperMD-codeblock-end"))
					return wrappedLineElements
			}

			return []

		},
	).filter(
		(wrappedLineElements: Array<Element>): boolean => wrappedLineElements.length !== 0,
	)

	return wrappedCodeblocks
}

function unwrapCodeblocks(
	wrappedCodeblocks: Array<Array<Element>>,
) {
	wrappedCodeblocks.forEach((codeblockLineElements: Array<Element>): void => {
		codeblockLineElements
		console.log(codeblockLineElements)
	})
}
