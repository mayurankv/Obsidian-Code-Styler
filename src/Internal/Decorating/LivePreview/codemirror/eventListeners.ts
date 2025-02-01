import { EditorView, PluginValue, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import CodeStylerPlugin from "src/main";
import { livePreviewState } from "obsidian";
import { DATA_PREFIX, UNWRAPPED_ATTRIBUTE } from "src/Internal/constants/detecting";
import { PREFIX } from "src/Internal/constants/general";
import { hasContentChanged } from "./utils";

export function createScrollEventObservers(
	plugin: CodeStylerPlugin,
): Extension {
	// plugin.registerDomEvent(document, 'scroll', (event: Event) => {
	// 	if (!(event.target instanceof HTMLElement))
	// 		return;

	// 	if (!event.target.matches('div.HyperMD-codeblock.cm-line'))
	// 		return;

	// 	// your logic
	// });

	class InlineCodeDecorationsViewPlugin implements PluginValue {
		codeblocksLines: Array<Array<Element>>;
		plugin: CodeStylerPlugin;

		constructor(
			view: EditorView,
		) {
			// unwrapCodeblocks(getWrappedCodeblocks(view))
		}

		update(
			update: ViewUpdate,
		) {
			// if (hasContentChanged(update) || update.viewportChanged)
			// 	unwrapCodeblocks(getWrappedCodeblocks(update.view))
		}

		destroy() {
			return;
		}
	}

	return ViewPlugin.fromClass(
		InlineCodeDecorationsViewPlugin,
		{ },
		// 	eventObservers: {
		// 		scroll: (event: Event, view: EditorView) => {
		// 			console.log(event)
		// 		 }
		// 	}
		// },
	);

	// return EditorView.domEventObservers({
	// 	scroll: (event: Event, view: EditorView) => {

	// 	},
	// })
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
