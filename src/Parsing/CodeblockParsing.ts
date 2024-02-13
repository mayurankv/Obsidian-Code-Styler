import { MarkdownPreviewRenderer, Plugin, TFile } from "obsidian";

import CodeStylerPlugin from "../main";
import { CodeStylerTheme, EXECUTE_CODE_SUPPORTED_LANGUAGES } from "../Settings";
import { CodeBlockArgs, getArgs } from "../External/ExecuteCode/CodeBlockArgs";
import { getReference } from "src/Referencing";

export interface CodeblockParameters {
	language: string;
	title: string;
	reference: string;
	fold: {
		enabled: boolean;
		placeholder: string;
	}
	lineNumbers: {
		alwaysEnabled: boolean;
		alwaysDisabled: boolean;
		offset: number;
	},
	lineUnwrap: {
		alwaysEnabled: boolean;
		alwaysDisabled: boolean;
		activeWrap: boolean;
	},
	highlights: {
		default: Highlights;
		alternative: Record<string,Highlights>
	},
	ignore: boolean;
}
export interface Highlights {
	lineNumbers: Array<number>;
	plainText: Array<string>;
	regularExpressions: Array<RegExp>;
}
interface ExternalPlugin extends Plugin {
	supportedLanguages?: Array<string>;
	code?: (source: string, sourcePath?: string)=>Promise<{
		start: number;
		code: string;
		language: string;
		highlight: string;
		lines: Array<string>;
		filePath: string;
		linenumber: number;
	}>;
	analyzeHighLightLines?: (lines: string[], source: string | string[])=>Map<number,boolean>;
}

export async function parseCodeblockSource(codeSection: Array<string>, plugin: CodeStylerPlugin, sourcePath?: string): Promise<{codeblocksParameters: Array<CodeblockParameters>, nested: boolean}> {
	// @ts-expect-error Undocumented Obsidian API
	const plugins: Record<string,ExternalPlugin> = plugin.app.plugins.plugins;
	const admonitions: boolean = ("obsidian-admonition" in plugins);
	const codeblocks: Array<Array<string>> = [];
	function parseCodeblockSection(codeSection: Array<string>): void {
		if (codeSection.length === 0)
			return;

		const openingCodeblockLine = getOpeningLine(codeSection);
		if (!openingCodeblockLine)
			return;

		const openDelimiter = /^\s*(?:>\s*)*((?:```+|~~~+)).*$/.exec(openingCodeblockLine)?.[1];
		if (!openDelimiter)
			return;

		const openDelimiterIndex = codeSection.indexOf(openingCodeblockLine);
		const closeDelimiterIndex = codeSection.slice(openDelimiterIndex+1).findIndex((line)=>new RegExp(`^\\s*(?:>\\s*)*${openDelimiter}(?!${openDelimiter[0]})$`).test(line));
		if (!admonitions || !/^\s*(?:>\s*)*(?:```+|~~~+) *ad-.*$/.test(openingCodeblockLine))
			codeblocks.push(codeSection.slice(0,openDelimiterIndex+2+closeDelimiterIndex));
		else
			parseCodeblockSection(codeSection.slice(openDelimiterIndex+1,openDelimiterIndex+1+closeDelimiterIndex));

		parseCodeblockSection(codeSection.slice(openDelimiterIndex+1+closeDelimiterIndex+1));
	}
	parseCodeblockSection(codeSection);
	return {codeblocksParameters: await (typeof sourcePath !== "undefined"?parseCodeblocks(codeblocks,plugin,plugins,sourcePath):parseCodeblocks(codeblocks,plugin,plugins)), nested: codeblocks[0]?!arraysEqual(codeSection,codeblocks[0]):true};
}

async function parseCodeblocks(codeblocks: Array<Array<string>>, plugin: CodeStylerPlugin, plugins: Record<string,ExternalPlugin>, sourcePath?: string): Promise<Array<CodeblockParameters>> {
	const codeblocksParameters: Array<CodeblockParameters> = [];
	for (const codeblockLines of codeblocks) {
		const codeblockParameters = await (typeof sourcePath !== "undefined"?parseCodeblock(codeblockLines,plugin,plugins,sourcePath):parseCodeblock(codeblockLines,plugin,plugins));
		if (codeblockParameters !== null)
			codeblocksParameters.push(codeblockParameters);
	}
	return codeblocksParameters;
}
async function parseCodeblock(codeblockLines: Array<string>, plugin: CodeStylerPlugin, plugins: Record<string,ExternalPlugin>, sourcePath?: string): Promise<CodeblockParameters | null> {
	const parameterLine = getParameterLine(codeblockLines);
	if (!parameterLine)
		return null;
	const codeblockParameters = parseCodeblockParameters(parameterLine,plugin.settings.currentTheme);

	if (isCodeblockIgnored(codeblockParameters.language,plugin.settings.processedCodeblocksWhitelist) && codeblockParameters.language !== "reference")
		return null;

	return await (typeof sourcePath !== "undefined"?pluginAdjustParameters(codeblockParameters,plugin,plugins,codeblockLines,sourcePath):pluginAdjustParameters(codeblockParameters,plugin,plugins,codeblockLines));
}
export function parseCodeblockParameters(parameterLine: string, theme: CodeStylerTheme): CodeblockParameters {
	const codeblockParameters: CodeblockParameters = {
		language: "",
		title: "",
		reference: "",
		fold: {
			enabled: false,
			placeholder: "",
		},
		lineNumbers: {
			alwaysEnabled: false,
			alwaysDisabled: false,
			offset: 0,
		},
		lineUnwrap: {
			alwaysEnabled: false,
			alwaysDisabled: false,
			activeWrap: false,
		},
		highlights: {
			default: {
				lineNumbers: [],
				plainText: [],
				regularExpressions: [],
			},
			alternative: {},
		},
		ignore: false,
	};

	if (parameterLine.startsWith("```"))
		parameterLine = parameterLine.replace(/^```+(?=[^`]|$)/,"");
	else if (parameterLine.startsWith("~~~"))
		parameterLine = parameterLine.replace(/^~~~+(?=[^~]|$)/,"");
	else
		return codeblockParameters;

	const rmdMatch = /^\{(.+)\} *$/.exec(parameterLine);
	if (rmdMatch)
		parameterLine = rmdMatch[1];

	const languageBreak = parameterLine.indexOf(" ");
	codeblockParameters.language = parameterLine.slice(0,(languageBreak !== -1)?languageBreak:parameterLine.length).toLowerCase();
	if (languageBreak === -1)
		return codeblockParameters;
	parameterLine = parameterLine.slice(languageBreak+1);
	if (rmdMatch)
		parameterLine = "title:" + parameterLine;

	const parameterStrings = parameterLine.match(/(?:(?:ref|reference|title):(?:\[\[.*?\]\]|\[.*?\]\(.+\))|[^\s"']+|"[^"]*"|'[^']*')+/g);
	if (!parameterStrings)
		return codeblockParameters;

	parameterStrings.forEach((parameterString) => parseCodeblockParameterString(parameterString.replace(/(?:^,|,$)/g, ""),codeblockParameters,theme));
	return codeblockParameters;
}
async function pluginAdjustParameters(codeblockParameters: CodeblockParameters, plugin: CodeStylerPlugin, plugins: Record<string,ExternalPlugin>, codeblockLines: Array<string>, sourcePath?: string): Promise<CodeblockParameters> {
	if (codeblockParameters.language === "reference") {
		if (sourcePath === undefined)
			throw Error("Reference block has undefined sourcePath");
		codeblockParameters = await adjustReference(codeblockParameters, codeblockLines, sourcePath, plugin);
	}  else if (codeblockParameters.language === "preview")
		codeblockParameters = await (typeof sourcePath !== "undefined"?pluginAdjustPreviewCode(codeblockParameters,plugins,codeblockLines,sourcePath):pluginAdjustPreviewCode(codeblockParameters,plugins,codeblockLines));
	else if (codeblockParameters.language === "include")
		codeblockParameters = pluginAdjustFileInclude(codeblockParameters,plugins,codeblockLines);
	else if (/run-\w*/.test(codeblockParameters.language))
		codeblockParameters = pluginAdjustExecuteCodeRun(codeblockParameters,plugin,plugins);
	codeblockParameters = pluginAdjustExecuteCode(codeblockParameters,plugins,codeblockLines);
	return codeblockParameters;
}
async function adjustReference(codeblockParameters: CodeblockParameters, codeblockLines: Array<string>, sourcePath: string, plugin: CodeStylerPlugin): Promise<CodeblockParameters> {
	const reference = await getReference(codeblockLines, sourcePath, plugin);
	if (!codeblockParameters.lineNumbers.alwaysDisabled && !codeblockParameters.lineNumbers.alwaysEnabled) {
		codeblockParameters.lineNumbers.offset = reference.startLine - 1;
		codeblockParameters.lineNumbers.alwaysEnabled = Boolean(reference.startLine !== 1);
	}
	if (codeblockParameters.title === "")
		//TODO (@mayurankv) Set Local Title
		codeblockParameters.title = reference.external?.info?.title ?? "file title";
	if (codeblockParameters.reference === "")
		//TODO (@mayurankv) Set Local Link
		codeblockParameters.reference = reference.external?.info?.displayUrl ?? reference.external?.info?.url ?? "file uri";
	codeblockParameters.language = reference.language;
	return codeblockParameters;
}
async function pluginAdjustPreviewCode(codeblockParameters: CodeblockParameters, plugins: Record<string,ExternalPlugin>, codeblockLines: Array<string>, sourcePath?: string): Promise<CodeblockParameters> {
	if (plugins?.["obsidian-code-preview"]?.code && plugins?.["obsidian-code-preview"]?.analyzeHighLightLines) {
		const codePreviewParams = await plugins["obsidian-code-preview"].code(codeblockLines.slice(1,-1).join("\n"),sourcePath);
		if (!codeblockParameters.lineNumbers.alwaysDisabled && !codeblockParameters.lineNumbers.alwaysEnabled) {
			if (typeof codePreviewParams.start === "number")
				codeblockParameters.lineNumbers.offset = codePreviewParams.start - 1;
			codeblockParameters.lineNumbers.alwaysEnabled = Boolean(codePreviewParams.linenumber);
		}
		codeblockParameters.highlights.default.lineNumbers = [...new Set(codeblockParameters.highlights.default.lineNumbers.concat(Array.from(plugins["obsidian-code-preview"].analyzeHighLightLines(codePreviewParams.lines,codePreviewParams.highlight),(pair: [number,boolean])=>(pair[0]))))];
		if (codeblockParameters.title === "")
			codeblockParameters.title = codePreviewParams.filePath.split("\\").pop()?.split("/").pop() ?? "";
		codeblockParameters.language = codePreviewParams.language;
	}
	return codeblockParameters;
}
function pluginAdjustFileInclude(codeblockParameters: CodeblockParameters, plugins: Record<string,ExternalPlugin>, codeblockLines: Array<string>): CodeblockParameters {
	if ("file-include" in plugins) {
		const fileIncludeLanguage = /include (\w+)/.exec(codeblockLines[0])?.[1];
		if (typeof fileIncludeLanguage !== "undefined")
			codeblockParameters.language = fileIncludeLanguage;
	}
	return codeblockParameters;
}
function pluginAdjustExecuteCode(codeblockParameters: CodeblockParameters, plugins: Record<string,ExternalPlugin>, codeblockLines: Array<string>): CodeblockParameters {
	if ("execute-code" in plugins) {
		const codeblockArgs: CodeBlockArgs = getArgs(codeblockLines[0]);
		codeblockParameters.title = codeblockParameters.title ?? codeblockArgs?.label ?? "";
	}
	return codeblockParameters;
}
function pluginAdjustExecuteCodeRun(codeblockParameters: CodeblockParameters, plugin: CodeStylerPlugin, plugins: Record<string,ExternalPlugin>): CodeblockParameters {
	if ("execute-code" in plugins) {
		if (EXECUTE_CODE_SUPPORTED_LANGUAGES.includes(codeblockParameters.language.slice(4)) && !isCodeblockIgnored(codeblockParameters.language,plugin.settings.processedCodeblocksWhitelist))
			codeblockParameters.language = codeblockParameters.language.slice(4);
	}
	return codeblockParameters;
}

function parseCodeblockParameterString(parameterString: string, codeblockParameters: CodeblockParameters, theme: CodeStylerTheme): void {
	if (parameterString === "ignore")
		codeblockParameters.ignore = true;
	else if (/^title[:=]/.test(parameterString))
		manageTitle(parameterString,codeblockParameters);
	else if (/^ref[:=]/.test(parameterString) || /^reference[:=]/.test(parameterString))
		manageReference(parameterString,codeblockParameters);
	else if (/^fold[:=]?/.test(parameterString))
		manageFolding(parameterString,codeblockParameters);
	else if (/^ln[:=]/.test(parameterString))
		manageLineNumbering(parameterString,codeblockParameters);
	else if (/^unwrap[:=]?/.test(parameterString) || parameterString === "wrap")
		manageWrapping(parameterString,codeblockParameters);
	else
		addHighlights(parameterString,codeblockParameters,theme);
}
function manageTitle(parameterString: string, codeblockParameters: CodeblockParameters) {
	const titleMatch = /(["']?)([^\1]+)\1/.exec(parameterString.slice("title:".length));
	if (titleMatch)
		codeblockParameters.title = titleMatch[2].trim();
	parameterString = parameterString.slice("title:".length);
	const linkInfo = manageLink(parameterString);
	if (linkInfo) {
		codeblockParameters.title = linkInfo.title;
		codeblockParameters.reference = linkInfo.reference;
	}
}
function manageReference(parameterString: string, codeblockParameters: CodeblockParameters) {
	parameterString = parameterString.slice(((/^ref[:=]/.test(parameterString))?"ref:":"reference:").length);
	const linkInfo = manageLink(parameterString);
	if (linkInfo) {
		codeblockParameters.reference = linkInfo.reference;
		if (codeblockParameters.title === "")
			codeblockParameters.title = linkInfo.title;
	}
}
export function manageLink(parameterString: string): {title: string, reference: string} | undefined {
	const refWikiMatch = /\[\[([^\]|\r\n]+?)(?:\|([^\]|\r\n]+?))?\]\]/.exec(parameterString);
	const refMdMatch = /\[(.*?)\]\((.+)\)/.exec(parameterString);
	let title = "";
	let reference = "";
	if (refWikiMatch) {
		title = refWikiMatch[2]?refWikiMatch[2].trim():refWikiMatch[1].trim();
		reference = refWikiMatch[1].trim();
	} else if (refMdMatch) {
		title = refMdMatch[1].trim();
		reference = refMdMatch[2].trim();
	} else
		return;
	return {title: title, reference: reference};
}
function manageFolding(parameterString: string, codeblockParameters: CodeblockParameters) {
	if (parameterString === "fold") {
		codeblockParameters.fold = {
			enabled: true,
			placeholder: "",
		};
	} else {
		const foldPlaceholderMatch = /(["']?)([^\1]+)\1/.exec(parameterString.slice("fold:".length));
		if (foldPlaceholderMatch) {
			codeblockParameters.fold = {
				enabled: true,
				placeholder: foldPlaceholderMatch[2].trim(),
			};
		}
	}
}
function manageLineNumbering(parameterString: string, codeblockParameters: CodeblockParameters) {
	parameterString = parameterString.slice("ln:".length);
	if (/^\d+$/.test(parameterString)) {
		codeblockParameters.lineNumbers = {
			alwaysEnabled: true,
			alwaysDisabled: false,
			offset: parseInt(parameterString)-1,
		};
	} else if (parameterString.toLowerCase() === "true") {
		codeblockParameters.lineNumbers = {
			alwaysEnabled: true,
			alwaysDisabled: false,
			offset: 0,
		};
	} else if (parameterString.toLowerCase() === "false") {
		codeblockParameters.lineNumbers = {
			alwaysEnabled: false,
			alwaysDisabled: true,
			offset: 0,
		};
	}
}
function manageWrapping(parameterString: string, codeblockParameters: CodeblockParameters) {
	if (parameterString === "wrap") {
		codeblockParameters.lineUnwrap = {
			alwaysEnabled: false,
			alwaysDisabled: true,
			activeWrap: false,
		};
	} else if (parameterString === "unwrap") {
		codeblockParameters.lineUnwrap = {
			alwaysEnabled: true,
			alwaysDisabled: false,
			activeWrap: false,
		};
	} else {
		parameterString = parameterString.slice("unwrap:".length);
		if (parameterString.toLowerCase() === "inactive") {
			codeblockParameters.lineUnwrap = {
				alwaysEnabled: true,
				alwaysDisabled: false,
				activeWrap: true,
			};
		} else if (parameterString.toLowerCase() === "true") {
			codeblockParameters.lineUnwrap = {
				alwaysEnabled: true,
				alwaysDisabled: false,
				activeWrap: false,
			};
		} else if (parameterString.toLowerCase() === "false") {
			codeblockParameters.lineUnwrap = {
				alwaysEnabled: false,
				alwaysDisabled: true,
				activeWrap: false,
			};
		}
	}
}
function addHighlights(parameterString: string, codeblockParameters: CodeblockParameters, theme: CodeStylerTheme) {
	const highlightMatch = /^(\w+)[:=](.+)$/.exec(parameterString);
	if (highlightMatch) {
		if (highlightMatch[1] === "hl")
			codeblockParameters.highlights.default = parseHighlightedLines(highlightMatch[2]);
		else if (highlightMatch[1] in theme.colours.light.highlights.alternativeHighlights)
			codeblockParameters.highlights.alternative[highlightMatch[1]] = parseHighlightedLines(highlightMatch[2]);
	} else if (/^{[\d-,]+}$/.test(parameterString))
		codeblockParameters.highlights.default = parseHighlightedLines(parameterString.slice(1,-1));
}
function parseHighlightedLines(highlightedLinesString: string): Highlights {
	const highlightRules = highlightedLinesString.split(",");
	const lineNumbers: Set<number> = new Set();
	const plainText: Set<string> = new Set();
	const regularExpressions: Set<RegExp> = new Set();
	highlightRules.forEach(highlightRule => {
		if (/\d+-\d+/.test(highlightRule)) { // Number Range
			const [start,end] = highlightRule.split("-").map(num => parseInt(num));
			if (start && end && start <= end)
				Array.from({length:end-start+1}, (_,num) => num + start).forEach(lineNumber => lineNumbers.add(lineNumber));
		} else if (/^\/(.*)\/$/.test(highlightRule)) { // Regex
			try {
				regularExpressions.add(new RegExp(highlightRule.replace(/^\/(.*)\/$/, "$1")));
			} catch {
				//pass
			}
		}  else if (/".*"/.test(highlightRule)) // Plain Text
			plainText.add(highlightRule.substring(1,highlightRule.length-1));
		else if (/'.*'/.test(highlightRule)) // Plain Text
			plainText.add(highlightRule.substring(1,highlightRule.length-1));
		else if (/\D/.test(highlightRule)) // Plain Text //TODO (@mayurankv) Should this be \D+ ??
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
export function isLanguageIgnored(language: string, excludedLanguagesString: string): boolean {
	return parseRegexExcludedLanguages(excludedLanguagesString).some(regexExcludedLanguage=>regexExcludedLanguage.test(language));
}
export function isCodeblockIgnored(language: string, whitelistedCodeblocksString: string): boolean {
	//@ts-expect-error Undocumented Obsidian API
	return (language in MarkdownPreviewRenderer.codeBlockPostProcessors) && !parseRegexExcludedLanguages(whitelistedCodeblocksString).some(regexExcludedLanguage=>regexExcludedLanguage.test(language));
}
function parseRegexExcludedLanguages(excludedLanguagesString: string): Array<RegExp> {
	return excludedLanguagesString.split(",").map(regexLanguage => new RegExp(`^${regexLanguage.trim().replace(/\*/g,".+")}$`,"i"));
}

function getParameterLine(codeblockLines: Array<string>): string | undefined {
	let openingCodeblockLine = getOpeningLine(codeblockLines);
	if (openingCodeblockLine && (openingCodeblockLine !== codeblockLines[0] || />\s*(?:[`~])/.test(openingCodeblockLine)))
		openingCodeblockLine = cleanParameterLine(openingCodeblockLine);
	return openingCodeblockLine;
}
function getOpeningLine(codeblockLines: Array<string>): string | undefined {
	return codeblockLines.find((line: string)=>Boolean(testOpeningLine(line)));
}
export function testOpeningLine(codeblockLine: string): string {
	const lineMatch = /^(\s*(?:>\s*)*)(```+|~~~+)/.exec(codeblockLine);
	if (!lineMatch)
		return "";
	if (codeblockLine.indexOf(lineMatch[2],lineMatch[1].length+lineMatch[2].length+1)===-1)
		return lineMatch[2];
	return "";
}
function cleanParameterLine(parameterLine: string): string {
	return trimParameterLine(parameterLine).replace(/^(?:>\s*)*(```+|~~~+)/,"$1");
}
export function trimParameterLine(parameterLine: string): string {
	return parameterLine.trim();
}

export async function getFileContentLines(sourcePath: string, plugin: CodeStylerPlugin): Promise<Array<string> | undefined> {
	const file = plugin.app.vault.getAbstractFileByPath(sourcePath);
	if (!file) {
		console.error(`File not found: ${sourcePath}`);
		return;
	}
	const fileContent = await plugin.app.vault.cachedRead(<TFile> file).catch((error) => {
		console.error(`Error reading file: ${error.message}`);
		return "";
	});
	if (!fileContent)
		return;
	return fileContent.split(/\n/g);
}

function arraysEqual(array1: Array<unknown>,array2: Array<unknown>): boolean {
	return array1.length === array2.length && array1.every((el) => array2.includes(el));
}
