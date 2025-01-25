import { PARAMETERS_ATTRIBUTE } from "src/Internal/constants/detecting";

export function isUndetectedCodeElement(
	codeElement: HTMLElement,
): boolean {
	const parsed = codeElement.getAttribute(PARAMETERS_ATTRIBUTE)
	if (parsed)
		return false;

	return true
}
