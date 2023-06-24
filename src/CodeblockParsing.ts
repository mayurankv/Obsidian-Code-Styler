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
	}
	highlights: {
		default: Array<number>;
		alternative: Record<string,Array<number>>
	}
}

function parseHighlightedLines(highlightedLinesString: string): Array<number> {
	const lineSections = highlightedLinesString.split(',');
	return lineSections.map(lineSection => {
		if (lineSection.includes('-')) {
			const [start,end] = lineSection.split('-').map(num => parseInt(num));
			if (start && end)
				return Array.from({length:end-start+1}, (_,num) => num + start);
		} else {
			return parseInt(lineSection);
		}
		return [];
	}).flat();
}
function parseParameterString(parameterString: string, codeblockParameters: CodeblockParameters, theme: CodeblockCustomizerTheme): void {
	if (parameterString.startsWith('title:')) {
		let titleMatch = /(["']?)([^\1 ]+)\1/.exec(parameterString.slice('title:'.length));
		if (titleMatch)
			codeblockParameters.title = titleMatch[2].trim();
	} else if (parameterString.startsWith('fold:')) {
		let foldPlaceholderMatch = /(["']?)([^\1 ]+)\1/.exec(parameterString.slice('fold:'.length));
		if (foldPlaceholderMatch) {
			codeblockParameters.fold.enabled = true;
			codeblockParameters.fold.placeholder = foldPlaceholderMatch[2].trim();
		}
	} else if (parameterString === 'fold') {
		codeblockParameters.fold.enabled = true;
		codeblockParameters.fold.placeholder = '';
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
	} else {
		let highlightMatch = /^(\w+):((?:\d+-\d+|\d+)(?:,\d+-\d+|,\d+)*)$/.exec(parameterString);
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
		highlights: {
			default: [],
			alternative: {},
		},
	}
	if (parameterLine.startsWith('```')) {
		let languageBreak = parameterLine.indexOf(' ');
		codeblockParameters.language = parameterLine.slice('```'.length,languageBreak !== -1?languageBreak:parameterLine.length).toLowerCase();
		if (languageBreak === -1)
			return codeblockParameters;
		const parameterStrings = parameterLine.slice(languageBreak+1).match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g);
		if (!parameterStrings)
			return codeblockParameters;
		parameterStrings.forEach((parameterString) => parseParameterString(parameterString,codeblockParameters,theme))
	}
	return codeblockParameters;
}
function parseRegexExcludedLanguages(excludedLanguagesString: string): Array<RegExp> {
	return excludedLanguagesString.split(",").map(regexLanguage => new RegExp(`^${regexLanguage.trim().replace(/\*/g,'.+')}$`,'i'))
}
export function isLanguageExcluded(language: string, excludedLanguagesString: string): boolean {
	return parseRegexExcludedLanguages(excludedLanguagesString).some(regexExcludedLanguage => {
		if (regexExcludedLanguage.test(language))
			return true;
	});
}
