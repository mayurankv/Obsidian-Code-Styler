import CodeStylerPlugin from "src/main";
import { FenceCodeParameters, InlineCodeParameters } from "../types/parsing";

export function createFenceHeaderElement(
	fenceCodeParameters: FenceCodeParameters,
	sourcePath: string,
	plugin: CodeStylerPlugin,
): HTMLElement {
	const fenceHeaderElement = createDiv();
	// TODO: Create element
	return fenceHeaderElement
}

export function createInlineHeaderElement(
	inlineCodeParameters: InlineCodeParameters,
	sourcePath: string,
	plugin: CodeStylerPlugin,
): HTMLElement {
	const fenceHeaderElement = createDiv();
	// TODO: Create element
	return fenceHeaderElement
}
