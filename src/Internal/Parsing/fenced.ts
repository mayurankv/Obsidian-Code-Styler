import { MarkdownPreviewRenderer, Plugin } from "obsidian";
import { basename } from "path";
import { getArgs } from "src/External/ExecuteCode/CodeBlockArgs";
import CodeStylerPlugin from "src/main";
import { EXECUTE_CODE_SUPPORTED_LANGUAGES } from "../constants/external";
import { PLUGIN_CODEBLOCK_WHITELIST as BASE_PLUGIN_CODEBLOCK_WHITELIST, FENCE_PARAMETERS_KEY_VALUE, FENCE_PARAMETERS_SHORTHAND } from "../constants/parsing";
import { REFERENCE_ATTRIBUTE } from "../constants/reference";
import { EXCLUDED_LANGUAGES } from "../constants/settings";
import { FenceCodeParameters, Highlights } from "../types/parsing";
import { Reference } from "../types/reference";
import { isLanguageMatched, separateParameters, setTitleAndReference } from "../utils/parsing";
import { convertBoolean, removeBoundaryQuotes, removeCurlyBraces } from "../utils/string";

export function parseFenceCodeParameters(
	fenceCodeParametersLine: string,
	plugin: CodeStylerPlugin,
): FenceCodeParameters {
	fenceCodeParametersLine = fenceCodeParametersLine.trim()

	const rmarkdownParameters = fenceCodeParametersLine.startsWith("{") && fenceCodeParametersLine.endsWith("}")

	let separatedParameters: Array<string> = separateParameters(removeCurlyBraces(fenceCodeParametersLine))
	if (separatedParameters.every(
		(parameterSection: string, idx: number, separatedParameters: Array<string>) => parameterSection.endsWith(",") || (idx === (separatedParameters.length - 1)) || (idx === 0),
	))
		separatedParameters = separatedParameters.map((parameterSection: string, idx: number, separatedParameters: Array<string>) => ((idx === (separatedParameters.length - 1)) || idx === 0) ? parameterSection : parameterSection.slice(0,-1))

	const fenceCodeParametersParsed = separatedParameters.reduce(
		(result: Partial<FenceCodeParameters>, parameterSection: string, idx: number) => {
			if (  //TODO: Check whether this matches how Obsidian parses
				(idx === 0) &&
				(parameterSection.indexOf(" ") === -1) &&
				(parameterSection.indexOf(":") === -1) &&
				(parameterSection.indexOf("'") === -1) &&
				(parameterSection.indexOf("\"") === -1)
			)
				return { ...result, language: parameterSection.toLowerCase() }

			if ((idx === 1) && rmarkdownParameters && (parameterSection.indexOf(":") === -1) && (parameterSection.indexOf("=") === -1))
				parameterSection = "title:" + parameterSection

			for (const parameterKey of ["title", "reference", "ref"])
				if (new RegExp(`^${parameterKey}[:=]`, "g").test(parameterSection))
					return setTitleAndReference(
						parameterKey,
						removeBoundaryQuotes(parameterSection.slice(parameterKey.length + 1)).trim(),
						result,
					) as Partial<FenceCodeParameters>;
				else if (parameterSection === parameterKey)
					return setTitleAndReference(
						parameterKey,
						null,
						result,
					) as Partial<FenceCodeParameters>;

			for (const parameterKey of FENCE_PARAMETERS_KEY_VALUE)
				if (new RegExp(`^${parameterKey}[:=]`, "g").test(parameterSection))
					return { ...result, ...inferFenceValue(parameterKey, removeBoundaryQuotes(parameterSection.slice(parameterKey.length + 1)).trim()) };

			for (const parameterShorthand of FENCE_PARAMETERS_SHORTHAND)
				if (parameterSection === parameterShorthand)
					return { ...result, ...inferFenceShorthand(parameterShorthand) }

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

			return result
		},
		{ highlights: { default: {lineNumbers: [], plainText: [], regularExpressions: []}, alternative: {} } },
	)

	const fenceCodeParameters = externalPluginAdjustFenceCodeParameters(
		new FenceCodeParameters(fenceCodeParametersParsed),
		fenceCodeParametersLine,
		plugin,
	)

	return fenceCodeParameters
}

export async function referenceAdjustParameters(
	fenceCodeParameters: FenceCodeParameters,
	fenceCodeElement: HTMLElement,
	plugin: CodeStylerPlugin,
): Promise<FenceCodeParameters> {
	if (fenceCodeParameters.language === "reference") {
		const stringifiedReference = fenceCodeElement.getAttribute(REFERENCE_ATTRIBUTE)
		if (!stringifiedReference)
			throw new Error("Missing reference")

		const reference = new Reference(JSON.parse(stringifiedReference))

		fenceCodeParameters.language = reference.language;

		if (fenceCodeParameters.title === null)
			fenceCodeParameters.title = reference.external?.info?.title ?? basename(reference.path);

		if (fenceCodeParameters.reference === null)
			//@ts-expect-error Undocumented Obsidian API
			fenceCodeParameters.reference = reference.external?.info?.displayUrl ?? reference.external?.info?.url ?? plugin.app.vault.adapter.getFilePath(reference.path);

		if (reference.external)
			fenceCodeParameters.externalReference = reference;

		if (fenceCodeParameters.lineNumbers.offset === null)
			fenceCodeParameters.lineNumbers.offset = reference.startLine - 1;
	}

	return fenceCodeParameters;
}

function externalPluginAdjustFenceCodeParameters(
	fenceCodeParameters: FenceCodeParameters,
	fenceCodeParametersLine: string,
	plugin: CodeStylerPlugin,
): FenceCodeParameters {
	const adjustedParameters: Partial<FenceCodeParameters> = {}

	// @ts-expect-error Undocumented Obsidian API
	const plugins: Record<string, Plugin> = plugin.app.plugins.plugins
	if ("execute-code" in plugins) {
		const executeCodeCodeblockArgs = getArgs(fenceCodeParametersLine)
		if (fenceCodeParameters.title === "")
			adjustedParameters.title = executeCodeCodeblockArgs?.label ?? fenceCodeParameters.title

		if (fenceCodeParameters.language?.startsWith("run-")) {
			const executeCodeLanguage = fenceCodeParameters.language.slice(4)
			if (EXECUTE_CODE_SUPPORTED_LANGUAGES.includes(executeCodeLanguage) && !isLanguageMatched(fenceCodeParameters.language, plugin.settings.detecting.languages.blacklist))
				adjustedParameters.language = executeCodeLanguage
		}
	}
	if ("file-include" in plugins) {
		if (fenceCodeParameters.language === "include")
			adjustedParameters.language = fenceCodeParametersLine.match(new RegExp(`^include +(\w+)$`, "g"))?.[1] ?? "include"
	}
	//! NOTE:
	//! Cannot include due to missing values at this name space
	//! If added at later date, this needs to be updated to an async function
	//
	// if ("obsidian-code-preview" in plugins) {
	// 	if (fenceCodeParameters.language === "preview") {
	// 		const codePreviewPlugin = plugins["obsidian-code-preview"]
	// 		if (
	// 			"code" in codePreviewPlugin && typeof codePreviewPlugin.code === "function" &&
	// 			"analyzeHighLightLines" in codePreviewPlugin && typeof codePreviewPlugin.analyzeHighLightLines === "function"
	// 		) {
	// 			//TODO: Don't have access to source code or sourcePath
	// 			const codePreviewParameters = await codePreviewPlugin.code(
	// 				fenceCodeLines.slice(1, -1).join("\n"),
	// 				sourcePath,
	// 			);

	// 			adjustedParameters.language = codePreviewParameters.language;

	// 			if (fenceCodeParameters.title === "")
	// 				adjustedParameters.title = codePreviewParameters.filePath.split("\\").pop()?.split("/").pop() ?? "";

	// 			if (!fenceCodeParameters.lineNumbers.alwaysDisabled && !fenceCodeParameters.lineNumbers.alwaysEnabled) {
	// 				adjustedParameters.lineNumbers = fenceCodeParameters.lineNumbers
	// 				if (typeof codePreviewParameters.start === "number")
	// 					adjustedParameters.lineNumbers.offset = codePreviewParameters.start - 1;
	// 				adjustedParameters.lineNumbers.alwaysEnabled = Boolean(codePreviewParameters.linenumber);
	// 			}

	// 			const codePreviewHighlightLines = Array.from(
	// 				codePreviewPlugin.analyzeHighLightLines(
	// 					codePreviewParameters.lines,
	// 					codePreviewParameters.highlight,
	// 				),
	// 				(pair: [number, boolean]) => (pair[0]),
	// 			)
	// 			fenceCodeParameters.highlights.default.lineNumbers = [...new Set([...codePreviewHighlightLines, ...fenceCodeParameters.highlights.default.lineNumbers])];
	// 		}
	// 	}
	// }

	return {...fenceCodeParameters, ...adjustedParameters}
}

function inferFenceValue(
	parameterKey: string,
	parameterValue: string,
): Partial<FenceCodeParameters> {
	if (parameterKey === "label" || parameterKey === "name")
		parameterKey = "title"


	else if (parameterKey === "unwrap") {
		return { lineUnwrap: (parameterValue === "inactive") ? "inactive" : convertBoolean(parameterValue)}

	} else if (parameterKey === "fold") {
		return {
			fold: {
				enabled: true,
				placeholder: parameterValue,
			}
		}

	} else if (parameterKey === "ln") {
		if (/^\d+$/.test(parameterValue))
			return {
				lineNumbers: {
					enabled: true,
					offset: parseInt(parameterValue) - 1,
				}
			}

		const booleanParameterValue = convertBoolean(parameterValue)

		return {
			lineNumbers: {
				enabled: booleanParameterValue,
				offset: 0
			}
		}

	} else if (["ignore", "icon", "dark"].includes(parameterKey)) {
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
				placeholder: null,
			}
		}

	else if (parameterShorthand === "unfold")
		return {
			fold: {
				enabled: false,
				placeholder: null,
			}
		}

	else if (parameterShorthand === "wrap")
		return { lineUnwrap: false }

	else if (parameterShorthand === "unwrap")
		return { lineUnwrap: true }

	else if (parameterShorthand === "ln")
		return {
			lineNumbers: {
				enabled: true,
				offset: 0,
			}
		}

	else if (["ignore", "icon", "dark"].includes(parameterShorthand))
		return { [parameterShorthand]: true }

	throw new Error("Unmanaged inline shorthand parameter")
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
	if (isLanguageMatched(fenceCodeParameters.language, plugin.settings.detecting.languages.blacklist + "," + EXCLUDED_LANGUAGES))
		return false

	if (
		// @ts-expect-error Undocumented Obsidian API
		(fenceCodeParameters.language in MarkdownPreviewRenderer.codeBlockPostProcessors) &&
		!isLanguageMatched(fenceCodeParameters.language, plugin.settings.detecting.languages.processedCodeblocksWhitelist + "," + BASE_PLUGIN_CODEBLOCK_WHITELIST)
	)
		return false

	if (fenceCodeParameters.ignore)
		return false

	return true
}
