import { FenceCodeParameters } from "../types/parsing";

export function parseFenceCodeParameters(
	fenceCodeParametersLine: string,
): FenceCodeParameters {

}

export function toDecorateFenceCode(
	fenceCodeParameters: FenceCodeParameters,
): boolean {
	//TODO: Check if language is ignored
	//TODO: Check if codeblock arguments contain ignore
	return true
}
