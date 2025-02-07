import { Notice, setIcon } from "obsidian";
import { BUTTON_TIMEOUT, BUTTON_TRANSITION, FOLD_TRANSITION } from "../constants/interface";
import { Colour } from "../types/decoration";
import { FOLD_ATTRIBUTE } from "../constants/decoration";
import { convertBoolean } from "./string";

export async function copyButton(
	button: HTMLButtonElement,
	content: string,
): Promise<void> {
	await navigator.clipboard.writeText(content)
	new Notice("Copied to your clipboard");

	clickIcon(button)
}

export function clickIcon(
	button: HTMLButtonElement,
	baseIcon: string = "copy",
	newIcon: string = "check",
	activeColour: Colour = "--text-success",
	transitionDuration: number = BUTTON_TRANSITION,
	clickTimeout: number = BUTTON_TIMEOUT,
	properties: Record<string, string> = {},
	propertiesEarly: Record<string, string> = {},
): void {
	button.style.setProperty("color", `var(${activeColour})`)
	button.style.setProperty("transition-property", `opacity, background-color, transform`)
	button.style.setProperty("transition-duration", `${transitionDuration}ms`)
	setIcon(button, newIcon)

	Object.entries({ ...properties, ...propertiesEarly }).forEach(
		([property, value]: [string, string]) => button.style.setProperty(property, value),
	)

	setTimeout(
		() => {
			button.style.removeProperty("color")
			Object.keys(propertiesEarly).forEach(
				(property: string) => button.style.removeProperty(property),
			)
		},
		clickTimeout - 10,
	)
	setTimeout(
		() => {
			button.style.removeProperty("transition-property")
			button.style.removeProperty("transition-duration")
			Object.keys(properties).forEach(
				(property: string) => button.style.removeProperty(property),
			)
			setIcon(button, baseIcon)
		},
		clickTimeout,
	)
}

export function toggleFoldIcon(
	foldButton: HTMLButtonElement | null,
	foldedIcon: string,
	unfoldedIcon: string,
): void {
	if (!foldButton)
		return

	const fencePreElement = foldButton.closest("pre.cs-pre")
	if (!fencePreElement)
		return

	const foldStatus = convertBoolean(fencePreElement?.getAttribute(FOLD_ATTRIBUTE) ?? null)
	if (foldStatus === null)
		return

	animateIconChange(
		foldButton,
		foldStatus ? foldedIcon : unfoldedIcon,
	)

	// fencePreElement.setAttribute(FOLD_ATTRIBUTE, (!foldStatus).toString())
}

export function animateIconChange(
	iconContainer: HTMLElement,
	newIcon: string,
	halfTransitionDuration: number = FOLD_TRANSITION / 2,
): void {
	iconContainer.style.setProperty("transition-property", `opacity`)
	iconContainer.style.setProperty("transition-duration", `${halfTransitionDuration}ms`)
	iconContainer.style.setProperty("opacity", "0")

	setTimeout(
		() => {
			setIcon(iconContainer, newIcon)
			iconContainer.style.setProperty("opacity", "1")
		},
		halfTransitionDuration,
	)
	setTimeout(
		() => {
			iconContainer.style.removeProperty("transition-property")
			iconContainer.style.removeProperty("transition-duration")
			iconContainer.style.removeProperty("opacity")
		},
		2 * halfTransitionDuration,
	)

	// const oldPath = iconContainer.querySelector("svg path") as SVGPathElement | null;
	// if (!oldPath)
	// 	return

	// const newPath = createDiv(
	// 	{},
	// 	(element) => setIcon(element, newIcon)
	// ).querySelector("svg path") as SVGPathElement | null;
	// if (!newPath)
	// 	return

	// //TODO:
}

export function getCodeblockLines(
	lineElement: Element,
	backward: boolean = false,
	inclusive: boolean = false,
): Array<Element> {
	const lineElements: Array<Element> = [lineElement]

	let next = lineElement.nextElementSibling
	while (next && next.hasClass("HyperMD-codeblock") && (inclusive || !next.hasClass("HyperMD-codeblock-end"))) {
		// if (!next.hasAttribute(SKIP_ATTRIBUTE))
		lineElements.push(next)
		next = next.nextElementSibling
	}

	if (backward) {
		let prev = lineElement.previousElementSibling
		while (prev && prev.hasClass("HyperMD-codeblock") && (inclusive || !prev.hasClass("HyperMD-codeblock-begin"))) {
			// if (!next.hasAttribute(SKIP_ATTRIBUTE))
			lineElements.push(prev)
			prev = prev.previousElementSibling
		}

	}

	return lineElements
}
