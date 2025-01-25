import CodeStylerPlugin from "src/main";
import { InlineCodeParameters } from "../types/parsing";
import { separateParameters } from "./utils";
import { INLINE_PARAMETERS_KEY_VALUE, INLINE_PARAMETERS_SHORTHAND } from "../constants/parsing";
import { convertBoolean, removeBoundaryQuotes } from "../utils/text";

export function parseInlineCodeParameters(
	inlineCodeParametersLine: string,
): InlineCodeParameters {
	const separatedParameters: Array<string> = separateParameters(inlineCodeParametersLine.trim().slice(1,-1).trim())

	const inlineCodeParametersParsed = separatedParameters.reduce(
		(result: Partial<InlineCodeParameters>, parameterSection: string, idx: number) => {
			if ((idx === 0) && (parameterSection.indexOf(" ") === -1)) //TODO: Exclude any symbols existing
				return {language: parameterSection.toLowerCase(), ...result}

			for (const parameterKey of INLINE_PARAMETERS_KEY_VALUE as Array<keyof InlineCodeParameters>)
				if (new RegExp(`^${parameterKey}[:=]`, "g").test(parameterSection))
					return {...inferInlineValue(parameterKey, removeBoundaryQuotes(parameterSection.slice(parameterKey.length + 1)).trim().replace(/\\{/g, "{")), ...result};

			for (const parameterShorthand of INLINE_PARAMETERS_SHORTHAND as Array<keyof InlineCodeParameters>)
				if (parameterSection === parameterShorthand)
					return {...inferInlineShorthand(parameterShorthand), ...result}
		},
		{},
	)
	const inlineCodeParameters = new InlineCodeParameters({...inlineCodeParametersParsed})

	return inlineCodeParameters
}

function inferInlineValue(
	parameterKey: keyof InlineCodeParameters,
	parameterValue: string,
): Partial<InlineCodeParameters> {
	if (["icon", "ignore"].includes(parameterKey)) {
		const booleanParameterValue = convertBoolean(parameterValue)
		return booleanParameterValue === null ? {} : { [parameterKey]: booleanParameterValue };
	}

	return { [parameterKey]: parameterValue };
}

function inferInlineShorthand(
	parameterShorthand: keyof InlineCodeParameters,
): Partial<InlineCodeParameters> {
	if (["icon", "ignore"].includes(parameterShorthand))
		return { [parameterShorthand]: true }

	throw new Error("Unmanaged inline shorthand parameter")
}

export function toDecorateInlineCode(
	inlineCodeParameters: InlineCodeParameters,
): boolean {
	return !inlineCodeParameters.ignore
}

export function toHighlightInlineCode(
	plugin: CodeStylerPlugin,
): boolean {
	return plugin.settings.currentTheme.settings.inline.syntaxHighlight
}

export function splitInlineCodeRaw(
	inlineCodeRaw: string,
): { inlineCodeParameters: string | null, inlineCodeContent: string } {
	const match = new RegExp(`^{(.*?)}( *?)([^ ].*)$`).exec(inlineCodeRaw);
	if (!match || typeof match?.[1] === "undefined" || typeof match?.[2] === "undefined" || typeof match?.[3] === "undefined")
		return { inlineCodeParameters: null, inlineCodeContent: inlineCodeRaw };
	return {inlineCodeParameters: `{${match[1]}}${match[2]}`, inlineCodeContent: match[3]};
}
