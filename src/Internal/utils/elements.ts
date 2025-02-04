import { Notice, setIcon } from "obsidian";
import { BUTTON_TIMEOUT, BUTTON_TRANSITION, FOLD_TRANSITION } from "../constants/interface";
import { Colour } from "../types/decoration";

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
	button.style.setProperty("transition", `opacity, background-color`)
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
		clickTimeout - 1,
	)
	setTimeout(
		() => {
			button.style.removeProperty("transition")
			button.style.removeProperty("transition-duration")
			Object.keys(properties).forEach(
				(property: string) => button.style.removeProperty(property),
			)
			setIcon(button, baseIcon)
		},
		clickTimeout,
	)
}

export function animateIconChange(
	iconContainer: HTMLElement,
	newIcon: string,
): void {
	const oldPath = iconContainer.querySelector("svg path") as SVGPathElement | null;
	if (!oldPath)
		return

	const newPath = createDiv(
		{},
		(element) => setIcon(element, newIcon)
	).querySelector("svg path") as SVGPathElement | null;
	if (!newPath)
		return

	//TODO:
}
// lucide-chevron-up
