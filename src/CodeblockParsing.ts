import { Plugin, TFile } from "obsidian";

import CodeStylerPlugin from "./main";
import { CodeStylerTheme, EXECUTE_CODE_SUPPORTED_LANGUAGES } from "./Settings";

export interface CodeblockParameters {
	language: string;
	title: string;
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
export interface InlineCodeParameters {
	language: string;
	title: string;
	icon: boolean;
}

export interface Highlights {
	lineNumbers: Array<number>;
	plainText: Array<string>;
	regularExpressions: Array<RegExp>;
}

interface ExternalPlugin extends Plugin {
	supportedLanguages?: Array<string>;
	code?: (source: string, sourcePath: string)=>{
		start: number;
		code: string;
		language: string;
		highlight: string;
		lines: Array<string>;
		filePath: string;
		linenumber: number;
	};
	analyzeHighLightLines?: (lines: string[], source: string | string[])=>Map<number,boolean>;
}

export async function parseCodeblockSource(codeSection: Array<string>, sourcePath: string, plugin: CodeStylerPlugin): Promise<{codeblocksParameters: Array<CodeblockParameters>, nested: boolean}> {
	//@ts-expect-error Undocumented Obsidian API
	const plugins: Record<string,ExternalPlugin> = plugin.app.plugins.plugins;
	const admonitions: boolean = "obsidian-admonition" in plugins;
	const codeblocks: Array<Array<string>> = [];
	const codeblocksParameters: Array<CodeblockParameters> = [];
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
	for (const codeblockLines of codeblocks) {
		const parameterLine = getParameterLine(codeblockLines);
		if (!parameterLine)
			continue;
		let codeblockParameters = parseCodeblockParameters(parameterLine,plugin.settings.currentTheme);
			
		if (isExcluded(codeblockParameters.language,plugin.settings.excludedCodeblocks))
			continue;
		
		codeblockParameters = await pluginAdjustParameters(codeblockParameters,plugins,codeblockLines,sourcePath);
		codeblocksParameters.push(codeblockParameters);
	}
	return {codeblocksParameters: codeblocksParameters, nested: codeblocks[0]?!arraysEqual(codeSection,codeblocks[0]):true};
}
export function parseInlineCode(codeText: string): {parameters: InlineCodeParameters | null, text: string} {
	
	const match = /^({} ?)?{([^}]*)} ?(.*)$/.exec(codeText);
	
	if (!match?.[1] && !(match?.[2] && match?.[3]))
		return {parameters: null, text: ""};
	else if (match?.[1])
		return {parameters: null, text: match[0].substring(match[1].length)};
	else
		return {parameters: parseInlineCodeParameters(match[2]), text: match[3]};
}

export function parseCodeblockParameters(parameterLine: string, theme: CodeStylerTheme): CodeblockParameters {
	const codeblockParameters: CodeblockParameters = {
		language: "",
		title: "",
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
	if (parameterLine.startsWith("```")) {
		parameterLine = parameterLine.replace(/^```+(?=[^`]|$)/,"");
	} else if (parameterLine.startsWith("~~~")) {
		parameterLine = parameterLine.replace(/^~~~+(?=[^~]|$)/,"");
	} else {
		return codeblockParameters;
	}
	const languageBreak = parameterLine.indexOf(" ");
	codeblockParameters.language = parameterLine.slice(0,languageBreak !== -1?languageBreak:parameterLine.length).toLowerCase();
	if (languageBreak === -1)
		return codeblockParameters;
	const parameterStrings = parameterLine.slice(languageBreak+1).match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g);
	if (!parameterStrings)
		return codeblockParameters;
	parameterStrings.forEach((parameterString) => parseCodeblockParameterString(parameterString,codeblockParameters,theme));
	return codeblockParameters;
}
export async function pluginAdjustParameters(codeblockParameters: CodeblockParameters, plugins: Record<string,ExternalPlugin>, codeblockLines: Array<string>, sourcePath: string): Promise<CodeblockParameters> {
	if (codeblockParameters.language === "preview") {
		if (plugins?.["obsidian-code-preview"]?.code && plugins?.["obsidian-code-preview"]?.analyzeHighLightLines) {
			const codePreviewParams = await plugins["obsidian-code-preview"].code(codeblockLines.slice(1,-1).join("\n"),sourcePath);
			if (!codeblockParameters.lineNumbers.alwaysDisabled && !codeblockParameters.lineNumbers.alwaysEnabled) {
				if (typeof codePreviewParams.start === "number")
					codeblockParameters.lineNumbers.offset = codePreviewParams.start - 1;
				codeblockParameters.lineNumbers.alwaysEnabled = Boolean(codePreviewParams.linenumber);
			}
			codeblockParameters.highlights.default.lineNumbers = [...new Set(codeblockParameters.highlights.default.lineNumbers.concat(Array.from(plugins["obsidian-code-preview"].analyzeHighLightLines(codePreviewParams.lines,codePreviewParams.highlight),([num,_]: [number,boolean])=>(num))))]; // eslint-disable-line @typescript-eslint/no-unused-vars
			if (codeblockParameters.title === "")
				codeblockParameters.title = codePreviewParams.filePath.split("\\").pop()?.split("/").pop() ?? "";
			codeblockParameters.language = codePreviewParams.language;
		}
	} else if (codeblockParameters.language === "include") {
		if ("file-include" in plugins) {
			const fileIncludeLanguage = codeblockLines[0].match(/include(?:[:\s]+(?<lang>\w+))?/)?.groups?.lang;
			if (typeof fileIncludeLanguage !== "undefined")
				codeblockParameters.language = fileIncludeLanguage;
		}
	} else if (/run-\w*/.test(codeblockParameters.language)) {
		if ("execute-code" in plugins) {
			if (codeblockParameters.language.slice(4) in EXECUTE_CODE_SUPPORTED_LANGUAGES)
				codeblockParameters.language = codeblockParameters.language.slice(4);
		}
	}
	return codeblockParameters;
}
function parseInlineCodeParameters(parameterLine: string): InlineCodeParameters {
	const inlineCodeParameters: InlineCodeParameters = {
		language: "",
		title: "",
		icon: false,
	};
	const languageBreak = parameterLine.indexOf(" ");
	inlineCodeParameters.language = parameterLine.slice(0,languageBreak !== -1?languageBreak:parameterLine.length).toLowerCase();
	if (languageBreak === -1)
		return inlineCodeParameters;
	const parameterStrings = parameterLine.slice(languageBreak+1).match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g);
	if (!parameterStrings)
		return inlineCodeParameters;
	parameterStrings.forEach((parameterString) => parseInlineCodeParameterString(parameterString,inlineCodeParameters));
	return inlineCodeParameters;
}

function parseCodeblockParameterString(parameterString: string, codeblockParameters: CodeblockParameters, theme: CodeStylerTheme): void {
	if (parameterString.startsWith("title:")) {
		const titleMatch = /(["']?)([^\1]+)\1/.exec(parameterString.slice("title:".length));
		if (titleMatch)
			codeblockParameters.title = titleMatch[2].trim();
	} else if (parameterString.startsWith("fold:")) {
		const foldPlaceholderMatch = /(["']?)([^\1]+)\1/.exec(parameterString.slice("fold:".length));
		if (foldPlaceholderMatch) {
			codeblockParameters.fold = {
				enabled: true,
				placeholder: foldPlaceholderMatch[2].trim(),
			};
		}
	} else if (parameterString === "fold") {
		codeblockParameters.fold = {
			enabled: true,
			placeholder: "",
		};
	} else if (parameterString === "ignore") {
		codeblockParameters.ignore = true;
	} else if (parameterString.startsWith("ln:")) {
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
	} else if (parameterString === "wrap") {
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
	} else if (parameterString.startsWith("unwrap:")) {
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
	} else {
		const highlightMatch = /^(\w+):(.+)$/.exec(parameterString);
		if (highlightMatch) {
			const highlights = parseHighlightedLines(highlightMatch[2]);
			if (highlightMatch[1] === "hl")
				codeblockParameters.highlights.default = highlights;
			else {
				if (highlightMatch[1] in theme.colours.light.highlights.alternativeHighlights)
					codeblockParameters.highlights.alternative[highlightMatch[1]] = highlights;
			}
		}
	}
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
				regularExpressions.add(new RegExp(highlightRule.replace(/^\/(.*)\/$/,"$1")));
			} catch {
				//pass
			}
		} else if (/".*"/.test(highlightRule)) { // Plain Text
			plainText.add(highlightRule.substring(1,highlightRule.length-1));
		} else if (/'.*'/.test(highlightRule)) { // Plain Text
			plainText.add(highlightRule.substring(1,highlightRule.length-1));
		} else if (/\D/.test(highlightRule)) { // Plain Text
			plainText.add(highlightRule);
		} else if (/\d+/.test(highlightRule)) { // Plain Number
			lineNumbers.add(parseInt(highlightRule));
		}
	});
	return {
		lineNumbers: [...lineNumbers],
		plainText: [...plainText],
		regularExpressions: [...regularExpressions],
	};
}
export function isExcluded(language: string, excludedLanguagesString: string): boolean {
	return parseRegexExcludedLanguages(excludedLanguagesString).some(regexExcludedLanguage=>regexExcludedLanguage.test(language));
}
function parseRegexExcludedLanguages(excludedLanguagesString: string): Array<RegExp> {
	return excludedLanguagesString.split(",").map(regexLanguage => new RegExp(`^${regexLanguage.trim().replace(/\*/g,".+")}$`,"i"));
}
function parseInlineCodeParameterString(parameterString: string, inlineCodeParameters: InlineCodeParameters): void {
	if (parameterString.startsWith("title:")) {
		const titleMatch = /(["']?)([^\1]+)\1/.exec(parameterString.slice("title:".length));
		if (titleMatch)
			inlineCodeParameters.title = titleMatch[2].trim();
	} else if (parameterString === "icon" || (parameterString.startsWith("icon:") && parameterString.toLowerCase() === "icon:true"))
		inlineCodeParameters.icon = true;
}

export function getParameterLine(codeblockLines: Array<string>): string | undefined {
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

export function arraysEqual(array1: Array<unknown>,array2: Array<unknown>): boolean {
	return array1.length === array2.length && array1.every((el) => array2.includes(el));
}
