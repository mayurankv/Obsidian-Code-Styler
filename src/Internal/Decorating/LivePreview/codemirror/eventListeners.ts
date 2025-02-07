import { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { MarkdownView } from "obsidian";
import CodeStylerPlugin from "src/main";
import { fenceScroll } from "./stateEffects";
import { HOVER_TIMEOUT, SCROLL_TIMEOUT } from "src/Internal/constants/interface";
import { areRangesInteracting, isRangeInteracting, lineDOMatPos } from "./utils";
import { SKIP_ATTRIBUTE } from "src/Internal/constants/detecting";
import { getCodeblockLines } from "src/Internal/utils/elements";
import { PREFIX } from "src/Internal/constants/general";

let scrollTimeout: NodeJS.Timeout = setTimeout(() => { });
let reset: boolean = true
let scrollLine: HTMLElement
let position: number
let scrollPosition: number = -1
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

		const activeView = plugin.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView || activeView.getMode() === "preview")
			return

		scrollLine = event.target as HTMLElement

		if (scrollLine?.hasClass("HyperMD-codeblock-begin") || scrollLine?.hasClass("HyperMD-codeblock-end"))
			return;

		// @ts-expect-error Undocumented Obsidian API
		view = activeView.editor.cm.docView.view
		position = view.posAtDOM(scrollLine)
	}

	if (scrollLine.scrollLeft !== scrollPosition) {
		scrollPosition = scrollLine.scrollLeft
		if (!ticking) {

			window.requestAnimationFrame(
				() => {
					view.dispatch({
						effects: fenceScroll.of({
							scrollPosition: scrollPosition,
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
			},
			SCROLL_TIMEOUT,
		)
	} else {
		reset = true
	}
}

let hoverTimeout: NodeJS.Timeout = setTimeout(() => { });
let hover: boolean = false;
let hoverLine: HTMLElement

export function hoverListener(
	event: Event,
	plugin: CodeStylerPlugin,
): void {
	// if (reset) {
	// 	reset = false

	if (!(event.target instanceof HTMLElement))
		return;

	if (!event.target.matches('div.cm-line.cs-line'))
		return;


	if (event.type === "mouseenter") {
		clearTimeout(hoverTimeout)
		if (!hover) {
			hover = true
			setHover(event, plugin, hover)
		}
	}  else if (event.type === "mouseleave" && hover) {
		hoverTimeout = setTimeout(
			() => {
				hover = false
				setHover(event, plugin, hover)
			},
			HOVER_TIMEOUT,
		)
	}
	// if (scrollLine.scrollLeft !== scrollPosition) {
	// 	scrollPosition = scrollLine.scrollLeft
	// 	if (!ticking) {

	// 		window.requestAnimationFrame(
	// 			() => {
	// 				view.dispatch({
	// 					effects: fenceScroll.of({
	// 						scrollPosition: scrollPosition,
	// 						position: position
	// 					})
	// 				})
	// 				ticking = false;
	// 			}
	// 		);
	// 		ticking = true;
	// 	}
	// } else {
	// 	reset = true
	// }
}

export function setScroll(
	view: EditorView,
	fenceStart: number,
	scrollPosition: number,
): void {
	const originalScrollLine = lineDOMatPos(view, fenceStart)
	if (!originalScrollLine)
		return

	const scrollLines = getCodeblockLines(originalScrollLine)

	scrollLines.forEach(
		(scrolledLine: HTMLElement) => {
			if (scrolledLine.scrollLeft !== scrollPosition)
				scrolledLine.scrollLeft = scrollPosition
		}
	)
}

function setHover(
	event: Event,
	plugin: CodeStylerPlugin,
	hover: boolean,
): void {
	const activeView = plugin.app.workspace.getActiveViewOfType(MarkdownView);
	if (!activeView || activeView.getMode() === "preview")
		return

	hoverLine = event.target as HTMLElement

	// @ts-expect-error Undocumented Obsidian API
	const view: EditorView = activeView.editor.cm.docView.view
	position = view.posAtDOM(hoverLine)

	const originalScrollLine = lineDOMatPos(view, position)
	if (!originalScrollLine)
		return

	const hoverLines = getCodeblockLines(originalScrollLine, true, true)

	hoverLines.forEach(
		(hoverLine: HTMLElement) => {
			if (hover)
				hoverLine.addClass(PREFIX + "hover")
			else
				hoverLine.removeClass(PREFIX+"hover")
		}
	)
}
