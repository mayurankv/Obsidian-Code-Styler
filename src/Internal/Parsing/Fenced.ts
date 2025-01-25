import CodeStylerPlugin from "src/main";
import { FenceCodeParameters, Highlights } from "../types/parsing";
import { separateParameters } from "./utils";
import { FENCE_PARAMETERS_KEY_VALUE, FENCE_PARAMETERS_SHORTHAND } from "../constants/parsing";
import { convertBoolean, removeBoundaryQuotes, removeCurlyBraces } from "../utils/text";

export function parseFenceCodeParameters(
	fenceCodeParametersLine: string,
): FenceCodeParameters {
	let separatedParameters: Array<string> = separateParameters(removeCurlyBraces(fenceCodeParametersLine.trim()))

	if (separatedParameters.every((parameterSection: string, idx: number, separatedParameters: Array<string>) => parameterSection.endsWith(",") || (idx === (separatedParameters.length - 1)) || (idx === 0)))
		separatedParameters = separatedParameters.map((parameterSection: string, idx: number, separatedParameters: Array<string>) => idx === (separatedParameters.length - 1) ? parameterSection : parameterSection.slice(0,-1))

	const fenceCodeParametersParsed = separatedParameters.reduce(
		(result: Partial<FenceCodeParameters>, parameterSection: string, idx: number) => {
			if (idx === 0) //TODO: Check whether this matches how Obsidian parses
				return {language: parameterSection.toLowerCase(), ...result}

			//TODO: managing of reference and title
			for (const parameterKey of ["title", "reference", "ref"])
				if (new RegExp(`^${parameterKey}[:=]`, "g").test(parameterSection))
					return result; //TODO: removeBoundaryQuotes(parameterSection.slice(parameterKey.length + 1)).trim()
				else if (parameterSection === parameterKey)
					return result; //TODO:

			for (const parameterKey of FENCE_PARAMETERS_KEY_VALUE)
				if (new RegExp(`^${parameterKey}[:=]`, "g").test(parameterSection))
					return {...inferFenceValue(parameterKey, removeBoundaryQuotes(parameterSection.slice(parameterKey.length + 1)).trim()), ...result};

			for (const parameterShorthand of FENCE_PARAMETERS_SHORTHAND)
				if (parameterSection === parameterShorthand)
					return { ...inferFenceShorthand(parameterShorthand), ...result }

			const highlightMatch = parameterSection.match(new RegExp(`^(\\w+)[:=](.+)$`, "g"))
			if (highlightMatch)
				return addHighlights(
					highlightMatch[2],
					highlightMatch[1],
					result,
				)
			else if (new RegExp(`^{[\\d-,]+}$`).test(parameterSection))
				return addHighlights(
					parameterSection.slice(1, -1),
					"hl",
					result,
				)
		},
		{ highlights: { default: {lineNumbers: [], plainText: [], regularExpressions: []}, alternative: {} } },
	)

	const fenceCodeParameters = new FenceCodeParameters(fenceCodeParametersParsed)

	return fenceCodeParameters
}

function inferFenceValue(
	parameterKey: string,
	parameterValue: string,
): Partial<FenceCodeParameters> {
	if (parameterKey === "unwrap") {
		if (parameterValue === "incactive")
			return {
				lineUnwrap: {
					alwaysEnabled: true,
					alwaysDisabled: false,
					activeWrap: true
				}
			}

		const booleanParameterValue = convertBoolean(parameterValue)

		return booleanParameterValue === null
			? {}
			: {
				lineUnwrap: {
					alwaysEnabled: booleanParameterValue,
					alwaysDisabled: !booleanParameterValue,
					activeWrap: false
				}
			}

	} else if (parameterKey === "fold") {
		return {
			fold: {
				enabled: true,
				placeholder:
					parameterValue
			}
		}

	} else if (parameterKey === "ln") {
		if (/^\d+$/.test(parameterValue))
			return {
				lineNumbers: {
					alwaysEnabled: true,
					alwaysDisabled: false,
					offset: parseInt(parameterValue) - 1,
				}
			}

		const booleanParameterValue = convertBoolean(parameterValue)

		return booleanParameterValue === null ? {} : {
			lineNumbers: {
				alwaysEnabled: booleanParameterValue,
				alwaysDisabled: !booleanParameterValue,
				offset: 0
			}
		}

	} else if (parameterKey === "icon") {
		throw new Error("Icon not handled yet") //TODO: Fix

	} else if (["ignore"].includes(parameterKey)) {
		const booleanParameterValue = convertBoolean(parameterValue) //TODO:

		return booleanParameterValue === null ? {} : { [parameterKey]: booleanParameterValue };

	} else if (["ref", "reference", "title"].includes(parameterKey))
		throw new Error("References and titles should have been matched already")

	return { [parameterKey]: parameterValue };
}

function inferFenceShorthand(
	parameterShorthand: string,
): Partial<FenceCodeParameters> {
	if (parameterShorthand === "fold")
		return {
			[parameterShorthand]: {
				enabled: true,
				placeholder: ""
			}
		}

	else if (parameterShorthand === "wrap")
		return {
			lineUnwrap: {
				alwaysEnabled: true,
				alwaysDisabled: false,
				activeWrap: false
			}
		}

	else if (parameterShorthand === "unwrap")
		return {
			lineUnwrap: {
				alwaysEnabled: true,
				alwaysDisabled: false,
				activeWrap: false
			}
		}

	else if (parameterShorthand === "ln")
		return {
			lineNumbers: {
				alwaysEnabled: true,
				alwaysDisabled: false,
				offset: 0,
			}
		}

	else if (parameterShorthand === "icon")
		throw new Error("Icon not handled yet") //TODO: Fix

	else if (["ignore"].includes(parameterShorthand))
		return { [parameterShorthand]: true }

	throw new Error("Unmanaged inline shorthand parameter")
}

function setTitleAndReference(
	parameterKey: string,
	parameterValue: string | null,
	result: Partial<FenceCodeParameters>,
): Partial<FenceCodeParameters> {
	if (parameterValue === null) {

	} else {

	}
	return result
}

function parseLink(
	linkText: string,
): { title: string, reference: string } | null {
	const markdownLinkMatch = linkText.match(new RegExp(`\\[(.*?)\\]\\((.+)\\)`));
	if (markdownLinkMatch)
		return {
			title: markdownLinkMatch[1] !== ""
				? markdownLinkMatch[1].trim()
				: markdownLinkMatch[2].trim(),
			reference: markdownLinkMatch[2].trim(),
		}

	//TODO: Check match
	const wikiLinkMatch = /\[\[([^\]|\r\n]+?)(?:\|([^\]|\r\n]+?))?\]\]/.exec(linkText);
	if (wikiLinkMatch)
		return {
			title: wikiLinkMatch[2]
				? wikiLinkMatch[2].trim()
				: wikiLinkMatch[1].trim(),
			reference: markdownLinkMatch[2].trim(),
		}

	const urlLinkMatch = removeBoundaryQuotes(linkText).match(new RegExp(`^(.+)\\.(.+)$`));
	if (urlLinkMatch)
		return {
			title: ,
			reference: markdownLinkMatch[2].trim(),
		}

	return null
}

function addHighlights(
	highlightsString: string,
	highlightName: string,
	result: Partial<FenceCodeParameters>,
): Partial<FenceCodeParameters> {
	if (!result.highlights)
		return result;

	const highlights = parseHighlightedLines(highlightsString)

	if (highlightName === "hl")
		result.highlights.default = {
			lineNumbers: [...new Set([ ...result.highlights.default.lineNumbers, ...highlights.lineNumbers ])],
			plainText: [...new Set([ ...result.highlights.default.plainText, ...highlights.plainText ])],
			regularExpressions: [...new Set([ ...result.highlights.default.regularExpressions, ...highlights.regularExpressions ])],
		}
	else if (highlightName in result.highlights.alternative)
		result.highlights.alternative[highlightName] = {
			lineNumbers: [...new Set([ ...result.highlights.alternative[highlightName].lineNumbers, ...highlights.lineNumbers ])],
			plainText: [...new Set([ ...result.highlights.alternative[highlightName].plainText, ...highlights.plainText ])],
			regularExpressions: [...new Set([ ...result.highlights.alternative[highlightName].regularExpressions, ...highlights.regularExpressions ])],
		}
	else
		result.highlights.alternative[highlightName] = highlights

	return result
}

function parseHighlightedLines(
	highlightsString: string,
): Highlights {
	const highlightRules = highlightsString.split(",");

	const lineNumbers: Set<number> = new Set();
	const plainText: Set<string> = new Set();
	const regularExpressions: Set<RegExp> = new Set();

	highlightRules.forEach(highlightRule => {
		if (/\d+-\d+/.test(highlightRule)) { // Number Range
			const [start,end] = highlightRule.split("-").map(num => parseInt(num));
			if (!start || !end || start > end)
				return;

			Array.from({ length: end - start + 1 }, (_, num) => num + start).forEach(lineNumber => lineNumbers.add(lineNumber));

		} else if (/^\/(.*)\/$/.test(highlightRule)) { // Regex
			try {
				regularExpressions.add(new RegExp(highlightRule.slice(1, -1)));
			} catch { return; }

		} else if (/".*"/.test(highlightRule)) // Plain Text in "" quotes
			plainText.add(highlightRule.substring(1,highlightRule.length-1));

		else if (/'.*'/.test(highlightRule)) // Plain Text in '' quotes
			plainText.add(highlightRule.substring(1,highlightRule.length-1));

		else if (/\D+/.test(highlightRule)) // Plain Text //TODO (@mayurankv) Should this be \D ??
			plainText.add(highlightRule);

		else if (/\d+/.test(highlightRule)) // Plain Number
			lineNumbers.add(parseInt(highlightRule));
	});

	return {
		lineNumbers: [...lineNumbers],
		plainText: [...plainText],
		regularExpressions: [...regularExpressions],
	};
}

export function toDecorateFenceCode(
	fenceCodeParameters: FenceCodeParameters,
	plugin: CodeStylerPlugin,
): boolean {
	if (isLanguageMatched(fenceCodeParameters.language, plugin.settings.excludedLanguages))
		return false

	if (fenceCodeParameters.ignore)
		return false

	return true
}

export function isLanguageMatched(
	language: string,
	languagesString: string,
): boolean {
	return languagesString.split(",").map(
		regexLanguage => new RegExp(`^${regexLanguage.trim().replace(/\*/g, ".+")}$`, "i"),
	).some(
		regexLanguage => regexLanguage.test(language),
	);
}
