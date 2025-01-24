import CodeStylerPlugin from "src/main";
import { FenceCodeParameters } from "../types/parsing";

export function createFenceHeaderElement(
	fenceCodeParameters: FenceCodeParameters,
	sourcePath: string,
	plugin: CodeStylerPlugin,
): HTMLElement {
	const fenceHeaderElement = createDiv();
	// TODO: Create element
	return fenceHeaderElement
}
