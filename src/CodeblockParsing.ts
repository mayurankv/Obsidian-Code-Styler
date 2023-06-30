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
export function isLanguageExcluded(language: string, excludedLanguagesString: string): boolean {
	return parseRegexExcludedLanguages(excludedLanguagesString).some(regexExcludedLanguage => {
		if (regexExcludedLanguage.test(language))
			return true;
	});
}
function parseRegexExcludedLanguages(excludedLanguagesString: string): Array<RegExp> {
	return excludedLanguagesString.split(",").map(regexLanguage => new RegExp(`^${regexLanguage.trim().replace(/\*/g,'.+')}$`,'i'))
}
