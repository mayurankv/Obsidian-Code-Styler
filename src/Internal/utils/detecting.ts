import { PARAMETERS_ATTRIBUTE } from "src/Internal/constants/detecting";
export function cleanFenceCodeParametersLine(
	fenceCodeParametersLine: string,
): string {
	fenceCodeParametersLine = fenceCodeParametersLine.replace(new RegExp(`^[> ]*`), '')
	fenceCodeParametersLine = fenceCodeParametersLine.replace(new RegExp(`^[\`~]+`), '');
	fenceCodeParametersLine += " "

	return fenceCodeParametersLine
}

export function isUndetectedCodeElement(
	codeElement: HTMLElement,
): boolean {
	const parsed = codeElement.getAttribute(PARAMETERS_ATTRIBUTE)
	if (parsed)
		return false;

	return true
}
