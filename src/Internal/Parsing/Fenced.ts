import CodeStylerPlugin from "src/main";
import { FenceCodeParameters, Highlights } from "../types/parsing";
import { isLanguageMatched, separateParameters } from "./utils";
import { FENCE_PARAMETERS_KEY_VALUE, FENCE_PARAMETERS_SHORTHAND, PLUGIN_CODEBLOCK_WHITELIST } from "../constants/parsing";
import { convertBoolean, removeBoundaryQuotes, removeCurlyBraces } from "../utils/text";
import { MarkdownPreviewRenderer, Plugin } from "obsidian";
import { getArgs } from "src/External/ExecuteCode/CodeBlockArgs";
import { EXECUTE_CODE_SUPPORTED_LANGUAGES } from "../constants/external";

export async function parseFenceCodeParameters(
	fenceCodeParametersLine: string,
	plugin: CodeStylerPlugin,
): Promise<FenceCodeParameters> {
	fenceCodeParametersLine = fenceCodeParametersLine.trim()

	const rmarkdownParameters = fenceCodeParametersLine.startsWith("{") && fenceCodeParametersLine.endsWith("}")

	let separatedParameters: Array<string> = separateParameters(removeCurlyBraces(fenceCodeParametersLine))
	if (separatedParameters.every((parameterSection: string, idx: number, separatedParameters: Array<string>) => parameterSection.endsWith(",") || (idx === (separatedParameters.length - 1)) || (idx === 0)))
		separatedParameters = separatedParameters.map((parameterSection: string, idx: number, separatedParameters: Array<string>) => idx === (separatedParameters.length - 1) ? parameterSection : parameterSection.slice(0,-1))

	const fenceCodeParametersParsed = separatedParameters.reduce(
		(result: Partial<FenceCodeParameters>, parameterSection: string, idx: number) => {
			if (idx === 0) //TODO: Check whether this matches how Obsidian parses
				return { language: parameterSection.toLowerCase(), ...result }

			if ((idx === 1) && rmarkdownParameters)
				parameterSection = "title:" + parameterSection

			//TODO: managing of reference and title
			for (const parameterKey of ["title", "reference", "ref"])
				if (new RegExp(`^${parameterKey}[:=]`, "g").test(parameterSection))
					return setTitleAndReference(
						parameterKey,
						removeBoundaryQuotes(parameterSection.slice(parameterKey.length + 1)).trim(),
						result,
					);
				else if (parameterSection === parameterKey)
					return setTitleAndReference(
						parameterKey,
						null,
						result,
					);

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

	const fenceCodeParameters = await pluginAdjustFenceCodeParameters(
		new FenceCodeParameters(fenceCodeParametersParsed),
		fenceCodeParametersLine,
		plugin,
	)


	//todo: Adjust parameters

	return fenceCodeParameters
}

async function pluginAdjustFenceCodeParameters(
	fenceCodeParameters: FenceCodeParameters,
	fenceCodeParametersLine: string,
	plugin: CodeStylerPlugin,
): Promise<FenceCodeParameters> {
	const adjustedParameters: Partial<FenceCodeParameters> = {}

	// @ts-expect-error Undocumented Obsidian API
	const plugins: Record<string, Plugin> = plugin.app.plugins.plugins
	if ("execute-code" in plugins) {
		const executeCodeCodeblockArgs = getArgs(fenceCodeParametersLine)
		if (fenceCodeParameters.title === "")
			adjustedParameters.title = executeCodeCodeblockArgs?.label ?? fenceCodeParameters.title

		if (fenceCodeParameters.language.startsWith("run-")) {
			const executeCodeLanguage = fenceCodeParameters.language.slice(4)
			if (EXECUTE_CODE_SUPPORTED_LANGUAGES.includes(executeCodeLanguage) && !isLanguageMatched(fenceCodeParameters.language, plugin.settings.processedCodeblocksWhitelist))
				adjustedParameters.language = executeCodeLanguage
		}
	}
	if ("file-include" in plugins) {
		if (fenceCodeParameters.language === "include")
			adjustedParameters.language = fenceCodeParametersLine.match(new RegExp(`^include +(\w+)$`, "g"))?.[1] ?? "include"
	}
	if ("obsidian-code-preview" in plugins) {
		if (fenceCodeParameters.language === "preview") {
			const codePreviewPlugin = plugins["obsidian-code-preview"]
			if (
				"code" in codePreviewPlugin && typeof codePreviewPlugin.code === "function" &&
				"analyzeHighLightLines" in codePreviewPlugin && typeof codePreviewPlugin.analyzeHighLightLines === "function"
			) {
				//TODO:
				const codePreviewParameters = await codePreviewPlugin.code(
					codeblockLines.slice(1, -1).join("\n"),
					sourcePath,
				);

				adjustedParameters.language = codePreviewParameters.language;

				if (fenceCodeParameters.title === "")
					adjustedParameters.title = codePreviewParameters.filePath.split("\\").pop()?.split("/").pop() ?? "";

				if (!fenceCodeParameters.lineNumbers.alwaysDisabled && !fenceCodeParameters.lineNumbers.alwaysEnabled) {
					adjustedParameters.lineNumbers = fenceCodeParameters.lineNumbers
					if (typeof codePreviewParameters.start === "number")
						adjustedParameters.lineNumbers.offset = codePreviewParameters.start - 1;
					adjustedParameters.lineNumbers.alwaysEnabled = Boolean(codePreviewParameters.linenumber);
				}

				const codePreviewHighlightLines = Array.from(
					codePreviewPlugin.analyzeHighLightLines(
						codePreviewParameters.lines,
						codePreviewParameters.highlight,
					),
					(pair: [number, boolean]) => (pair[0]),
				)
				fenceCodeParameters.highlights.default.lineNumbers = [...new Set([...codePreviewHighlightLines, ...fenceCodeParameters.highlights.default.lineNumbers])];
			}
		}
	}

	return {...adjustedParameters, ...fenceCodeParameters}
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
	if (parameterValue !== null) {
		const linkInfo = parseLink(parameterValue)
		if (linkInfo === null)
			if (parameterKey === "title")
				return { title: parameterValue, ...result }
			else
				return result
		else
			if ((parameterKey === "title") || !("title" in result))
				return {...linkInfo, ...result}
			else
				return { reference: linkInfo.reference, ...result }

	} else {
		if (parameterKey !== "title" || !("title" in result))
			return result

		const linkInfo = parseLink(result?.title ?? "")

		if (linkInfo === result)
			return result
		else
			return ({...linkInfo, ...result})
	}
}

function parseLink(
	linkText: string,
): { title: string, reference: string } | null {
	const markdownLinkMatch = linkText.match(new RegExp(`\\[(.*?)\\]\\((.+)\\)`, "g"));
	if (markdownLinkMatch)
		return {
			title: markdownLinkMatch[1] !== ""
				? markdownLinkMatch[1].trim()
				: markdownLinkMatch[2].trim(),
			reference: markdownLinkMatch[2].trim(),
		}

	//TODO: Check match
	const wikiLinkMatch = linkText.match(new RegExp(`\\[\\[([^\\]|\\r\\n]+?)(?:\\|([^\\]|\\r\\n]+?))?\\]\\]`, "g"))
	if (wikiLinkMatch)
		return {
			title: wikiLinkMatch[2]
				? wikiLinkMatch[2].trim()
				: wikiLinkMatch[1].trim(),
			reference: wikiLinkMatch[1].trim(),
		}

	const urlLinkMatch = removeBoundaryQuotes(linkText).match(new RegExp(`^(\S+)\\.(\S+)$`, "g"));
	if (urlLinkMatch)
		return {
			title: urlLinkMatch[0].trim(),
			reference: urlLinkMatch[0].trim(),
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

	if (
		// @ts-expect-error Undocumented Obsidian API
		(fenceCodeParameters.language in MarkdownPreviewRenderer.codeBlockPostProcessors) &&
		!isLanguageMatched(fenceCodeParameters.language, plugin.settings.processedCodeblocksWhitelist + "," + PLUGIN_CODEBLOCK_WHITELIST)
	)
		return false

	if (fenceCodeParameters.ignore)
		return false

	return true
}
