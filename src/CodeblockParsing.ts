import CodeblockCustomizerPlugin from "./main";
import { CodeblockCustomizerTheme } from "./Settings";

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

export interface Highlights {
	lineNumbers: Array<number>;
	plainText: Array<string>;
	regularExpressions: Array<RegExp>;
}

export async function parseCodeblockSource(codeSection: Array<string>, sourcePath: string, plugin: CodeblockCustomizerPlugin): Promise<{codeblocksParameters: Array<CodeblockParameters>, nested: boolean}> {
	let codeblocks: Array<Array<string>> = [];
	function parseCodeblockSection(codeSection: Array<string>): void {
        if (codeSection.length === 0)
            return;
        let openingCodeblockLine = getOpeningLine(codeSection);
		if (!openingCodeblockLine)
            return;
        let openDelimiter = /^\s*(?:>\s*)*(```+).*$/.exec(openingCodeblockLine)?.[1];
		if (!openDelimiter)
            return;
		let openDelimiterIndex = codeSection.indexOf(openingCodeblockLine);
		let closeDelimiterIndex = codeSection.slice(openDelimiterIndex+1).findIndex((line)=>line.indexOf(openDelimiter as string)!==-1);
		if (!/^\s*(?:>\s*)*```+ad-.*$/.test(openingCodeblockLine))
            codeblocks.push(codeSection.slice(0,openDelimiterIndex+2+closeDelimiterIndex))
        else
            parseCodeblockSection(codeSection.slice(openDelimiterIndex+1,openDelimiterIndex+1+closeDelimiterIndex));
        
		parseCodeblockSection(codeSection.slice(openDelimiterIndex+1+closeDelimiterIndex+1));
	}
	parseCodeblockSection(codeSection);
	let codeblocksParameters = [];
	for (let codeblockLines of codeblocks) {
		let parameterLine = getParameterLine(codeblockLines);
		if (!parameterLine)
			continue;
		console.log(parameterLine)
		let codeblockParameters = parseCodeblockParameters(parameterLine,plugin.settings.currentTheme);
			
		if (isLanguageExcluded(codeblockParameters.language,plugin.settings.excludedLanguages) || codeblockParameters.ignore)
			continue;
		
		codeblockParameters = await pluginAdjustParameters(codeblockParameters,plugin,codeblockLines,sourcePath);
		codeblocksParameters.push(codeblockParameters);
	}
	return {codeblocksParameters: codeblocksParameters, nested: codeblocks[0]?!arraysEqual(codeSection,codeblocks[0]):true}
}

export function parseCodeblockParameters(parameterLine: string, theme: CodeblockCustomizerTheme): CodeblockParameters {
	let codeblockParameters: CodeblockParameters = {
		language: '',
		title: '',
		fold: {
			enabled: false,
			placeholder: '',
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
	}
	if (parameterLine.startsWith('```')) {
		parameterLine = parameterLine.replace(/^```+(?=[^`]|$)/,'');
		let languageBreak = parameterLine.indexOf(' ');
		codeblockParameters.language = parameterLine.slice(0,languageBreak !== -1?languageBreak:parameterLine.length).toLowerCase();
		if (languageBreak === -1)
			return codeblockParameters;
		const parameterStrings = parameterLine.slice(languageBreak+1).match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g);
		if (!parameterStrings)
			return codeblockParameters;
		parameterStrings.forEach((parameterString) => parseParameterString(parameterString,codeblockParameters,theme))
	}
	return codeblockParameters;
}
function parseParameterString(parameterString: string, codeblockParameters: CodeblockParameters, theme: CodeblockCustomizerTheme): void {
	if (parameterString.startsWith('title:')) {
		let titleMatch = /(["']?)([^\1]+)\1/.exec(parameterString.slice('title:'.length));
		if (titleMatch)
			codeblockParameters.title = titleMatch[2].trim();
	} else if (parameterString.startsWith('fold:')) {
		let foldPlaceholderMatch = /(["']?)([^\1]+)\1/.exec(parameterString.slice('fold:'.length));
		if (foldPlaceholderMatch) {
			codeblockParameters.fold.enabled = true;
			codeblockParameters.fold.placeholder = foldPlaceholderMatch[2].trim();
		}
	} else if (parameterString === 'fold') {
		codeblockParameters.fold.enabled = true;
		codeblockParameters.fold.placeholder = '';
	} else if (parameterString === 'ignore') {
		codeblockParameters.ignore = true;
	} else if (parameterString.startsWith('ln:')) {
		parameterString = parameterString.slice('ln:'.length)
		if (/^\d+$/.test(parameterString)) {
			codeblockParameters.lineNumbers.alwaysEnabled = true;
			codeblockParameters.lineNumbers.alwaysDisabled = false;
			codeblockParameters.lineNumbers.offset = parseInt(parameterString)-1;
		} else if (parameterString.toLowerCase() === 'true') {
			codeblockParameters.lineNumbers.alwaysEnabled = true;
			codeblockParameters.lineNumbers.alwaysDisabled = false;
			codeblockParameters.lineNumbers.offset = 0;
		} else if (parameterString.toLowerCase() === 'false') {
			codeblockParameters.lineNumbers.alwaysEnabled = false;
			codeblockParameters.lineNumbers.alwaysDisabled = true;
			codeblockParameters.lineNumbers.offset = 0;
		}
	} else if (parameterString.startsWith('unwrap:')) {
		parameterString = parameterString.slice('unwrap:'.length)
		if (parameterString.toLowerCase() === 'inactive') {
			codeblockParameters.lineUnwrap.alwaysEnabled = true;
			codeblockParameters.lineUnwrap.alwaysDisabled = false;
			codeblockParameters.lineUnwrap.activeWrap = true;
		} else if (parameterString.toLowerCase() === 'true') {
			codeblockParameters.lineUnwrap.alwaysEnabled = true;
			codeblockParameters.lineUnwrap.alwaysDisabled = false;
			codeblockParameters.lineUnwrap.activeWrap = false;
		} else if (parameterString.toLowerCase() === 'false') {
			codeblockParameters.lineUnwrap.alwaysEnabled = false;
			codeblockParameters.lineUnwrap.alwaysDisabled = true;
			codeblockParameters.lineUnwrap.activeWrap = false;
		}
	} else {
		let highlightMatch = /^(\w+):(.+)$/.exec(parameterString);
		if (highlightMatch) {
			let highlights = parseHighlightedLines(highlightMatch[2]);
			if (highlightMatch[1] === 'hl')
				codeblockParameters.highlights.default = highlights;
			else
				if (highlightMatch[1] in theme.colors.light.highlights.alternativeHighlights)
					codeblockParameters.highlights.alternative[highlightMatch[1]] = highlights;
		}
	}
}
function parseHighlightedLines(highlightedLinesString: string): Highlights {
	const highlightRules = highlightedLinesString.split(',');
	let lineNumbers: Set<number> = new Set();
	let plainText: Set<string> = new Set();
	let regularExpressions: Set<RegExp> = new Set();
	highlightRules.forEach(highlightRule => {
		if (/\d+-\d+/.test(highlightRule)) { // Number Range
			const [start,end] = highlightRule.split('-').map(num => parseInt(num));
			if (start && end && start <= end)
				Array.from({length:end-start+1}, (_,num) => num + start).forEach(lineNumber => lineNumbers.add(lineNumber));
		} else if (/^\/(.*)\/$/.test(highlightRule)) { // Regex
			try {
				regularExpressions.add(new RegExp(highlightRule.replace(/^\/(.*)\/$/,"$1")));
			} catch { }
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

export async function pluginAdjustParameters(codeblockParameters: CodeblockParameters, plugin: CodeblockCustomizerPlugin, codeblockLines: Array<string>, sourcePath: string): Promise<CodeblockParameters> {
	//@ts-expect-error Undocumented Obsidian API
	const plugins: Record<string,any> = plugin.app.plugins.plugins;
	if (codeblockParameters.language === 'preview') {
		if ('obsidian-code-preview' in plugins) {
			let codePreviewParams = await plugins['obsidian-code-preview'].code(codeblockLines.slice(1,-1).join('\n'),sourcePath);
			if (!codeblockParameters.lineNumbers.alwaysDisabled && !codeblockParameters.lineNumbers.alwaysEnabled) {
				if (typeof codePreviewParams.start === 'number')
					codeblockParameters.lineNumbers.offset = codePreviewParams.start - 1;
				codeblockParameters.lineNumbers.alwaysEnabled = codePreviewParams.lineNumber;
			}
			codeblockParameters.highlights.default.lineNumbers = [...new Set(codeblockParameters.highlights.default.lineNumbers.concat(Array.from(plugins['obsidian-code-preview'].analyzeHighLightLines(codePreviewParams.lines,codePreviewParams.highlight),([num,_])=>(num))))];
			if (codeblockParameters.title === '')
				codeblockParameters.title = codePreviewParams.filePath.split('\\').pop().split('/').pop();
			codeblockParameters.language = codePreviewParams.language;
		}
	} else if (codeblockParameters.language === 'include') {
		if ('file-include' in plugins) {
			const fileIncludeLanguage = codeblockLines[0].match(/include(?:[:\s]+(?<lang>\w+))?/)?.groups?.lang;
			if (typeof fileIncludeLanguage !== 'undefined')
				codeblockParameters.language = fileIncludeLanguage;
		}
	}
	return codeblockParameters
}

export function getParameterLine(codeblockLines: Array<string>): string | undefined {
	let openingCodeblockLine = getOpeningLine(codeblockLines);
	if (openingCodeblockLine && (openingCodeblockLine !== codeblockLines[0] || />\s*`/.test(openingCodeblockLine)))
		openingCodeblockLine = cleanParameterLine(openingCodeblockLine);
	return openingCodeblockLine
}
function getOpeningLine(codeblockLines: Array<string>): string | undefined {
	return codeblockLines.find((line: string)=>Boolean(testOpeningLine(line)));
}
export function testOpeningLine(codeblockLine: string): number {
	let lineMatch = /^(\s*(?:>\s*)*)(```+)/.exec(codeblockLine);
	if (!lineMatch)
		return 0;
	if (codeblockLine.indexOf('`'.repeat(lineMatch[2].length),lineMatch[1].length+lineMatch[2].length+1)===-1)
		return lineMatch[2].length;
	return 0;
}
function cleanParameterLine(parameterLine: string): string {
	return trimParameterLine(parameterLine).replace(/^(?:>\s*)*```/,'```');
}
export function trimParameterLine(parameterLine: string): string {
	return parameterLine.trim();
}

export function isLanguageExcluded(language: string, excludedLanguagesString: string): boolean {
	return parseRegexExcludedLanguages(excludedLanguagesString).some(regexExcludedLanguage => {
		if (regexExcludedLanguage.test(language))
			return true;
	});
}
function parseRegexExcludedLanguages(excludedLanguagesString: string): Array<RegExp> {
	return excludedLanguagesString.split(",").map(regexLanguage => new RegExp(`^${regexLanguage.trim().replace(/\*/g,'.+')}$`,'i'))
}

export function arraysEqual(array1: Array<any>,array2: Array<any>): boolean {
	return array1.length === array2.length && array1.every((el) => array2.includes(el));
}
