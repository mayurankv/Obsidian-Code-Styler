import { PARAMETERS_ATTRIBUTE } from "src/Internal/constants/parameters";

export function isUndetectedCodeElement(
	codeElement: HTMLElement,
): boolean {
	const parsed = codeElement.getAttribute(PARAMETERS_ATTRIBUTE)
	if (parsed)
		return false;

	return true
}
