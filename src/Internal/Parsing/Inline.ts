import { InlineCodeParameters } from "../types/parsing";

export function parseFenceCodeParameters(
	inlineCodeParametersLine: string,
): InlineCodeParameters {

}

export function splitInlineCodeRaw(
	inlineCodeRaw: string,
): { inlineCodeParameters: string | null, inlineCodeContent: string } {
	const match = new RegExp(`^{(.*?)}( *?)([^ ].*)$`).exec(inlineCodeRaw);
	if (!match || typeof match?.[1] === "undefined" || typeof match?.[2] === "undefined" || typeof match?.[3] === "undefined")
		return { inlineCodeParameters: null, inlineCodeContent: inlineCodeRaw };
	return {inlineCodeParameters: `{${match[1]}}${match[2]}`, inlineCodeContent: match[3]};
}
