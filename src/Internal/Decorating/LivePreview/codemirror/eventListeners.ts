import { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { MarkdownView } from "obsidian";
import CodeStylerPlugin from "src/main";
import { fenceScroll } from "./stateEffects";
import { SCROLL_TIMEOUT } from "src/Internal/constants/interface";
import { areRangesInteracting, isRangeInteracting } from "./utils";
import { SKIP_ATTRIBUTE } from "src/Internal/constants/detecting";

let scrollTimeout: NodeJS.Timeout = setTimeout(() => { });
let reset: boolean = true
let scrollLine: HTMLElement
let position: number
let view: EditorView
let ticking = false;

export function scrollListener(
	event: Event,
	plugin: CodeStylerPlugin,
): void {
	if (reset) {
		reset = false

		if (!(event.target instanceof HTMLElement))
			return;

		if (!event.target.matches('div.cm-line.cs-line'))
			return;

		scrollLine = event.target as HTMLElement

		if (scrollLine?.hasClass("HyperMD-codeblock-begin") || scrollLine?.hasClass("HyperMD-codeblock-end"))
			return;

		const activeView = plugin.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView)
			return

		if (activeView.getMode() === "preview")
			return

		// @ts-expect-error Undocumented Obsidian API
		view = activeView.editor.cm.docView.view
		position = view.posAtDOM(scrollLine)
		// scrollLine.setAttribute(SKIP_ATTRIBUTE, "true")
	}

	if (!ticking) {
		window.requestAnimationFrame(
			() => {
				view.dispatch({
					effects: fenceScroll.of({
						scrollPosition: scrollLine.scrollLeft,
						position: position
					})
				})
				ticking = false;
			}
		);
		ticking = true;
	}

	clearTimeout(scrollTimeout)
	scrollTimeout = setTimeout(
		() => {
			reset = true
			// scrollLine.removeAttribute(SKIP_ATTRIBUTE)
		},
		SCROLL_TIMEOUT,
	)

	// clearTimeout(scrollTimeout)
	// 	() => {

	// 	},
	// 	SCROLL_TIMEOUT,
	// )
}

export function createScrollEventObservers(
	plugin: CodeStylerPlugin,
): Extension {
	plugin.registerDomEvent(
		document.body,
		"scroll",
		(event: Event) => {

			const scrolledLines: Array<Element> = [scrollLine]

			// while (scrollLine !== null) {
			// 	scrollLine = scrollLine.nextElementSibling

			// 	if (scrollLine?.hasClass("HyperMD-codeblock-end"))
			// 		break

			// 	if (scrollLine?.hasClass("HyperMD-codeblock"))
			// 		scrolledLines.push(scrollLine)
			// }

			// scrollLine = event.target

			// while (scrollLine !== null) {
			// 	scrollLine = scrollLine.previousElementSibling

			// 	if (scrollLine?.hasClass("HyperMD-codeblock-begin"))
			// 		break

			// 	if (scrollLine?.hasClass("HyperMD-codeblock"))
			// 		scrolledLines.push(scrollLine)
			// }

			// scrolledLines.forEach(
			// 	(scrollLine: Element) => scrollLine.scrollLeft = (event.target as HTMLElement).scrollLeft
			// )
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
