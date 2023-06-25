import { LANGUAGE_NAMES, LANGUAGE_ICONS, CodeblockCustomizerThemeSettings } from "./Settings";
import { CodeblockParameters } from "./CodeblockParsing";

export function createHeader(codeblockParameters: CodeblockParameters, themeSettings: CodeblockCustomizerThemeSettings): HTMLElement {
	const headerContainer = createDiv({cls: `codeblock-customizer-header-container${(codeblockParameters.fold.enabled || codeblockParameters.title !== '')?'-specific':''}`});
	if (codeblockParameters.language !== ''){
		const IconURL = getLanguageIcon(codeblockParameters.language)
		if (IconURL !== null) {
			const imageWrapper = createDiv();
			const img = document.createElement("img");
			img.classList.add("codeblock-customizer-icon");
			img.src = IconURL;
			imageWrapper.appendChild(img);
			headerContainer.appendChild(imageWrapper);
		}
		headerContainer.appendChild(createDiv({cls: `codeblock-customizer-header-language-tag-${codeblockParameters.language}`, text: getLanguageTag(codeblockParameters.language)}));
	}
	
	let headerText = ''
	if (codeblockParameters.title !== '')
		headerText = codeblockParameters.title;
	else if (codeblockParameters.fold.enabled)
		headerText = codeblockParameters.fold.placeholder!==''?codeblockParameters.fold.placeholder:themeSettings.header.collapsePlaceholder!==''?themeSettings.header.collapsePlaceholder:'Collapsed Code';
	headerContainer.appendChild(createDiv({cls: "codeblock-customizer-header-text", text: headerText}));   

	return headerContainer;
}

function getLanguageTag(language: string) {
	if (language in LANGUAGE_NAMES)
		return LANGUAGE_NAMES[language];
	else if (language !== '')
		return language.charAt(0).toUpperCase() + language.slice(1);
	return "";
}
function getLanguageIcon(language: string) {
	language = getLanguageTag(language);
	if (language in LANGUAGE_ICONS)
		return LANGUAGE_ICONS[language];
	return null;
}

export function getLineClass(codeblockParameters: CodeblockParameters, lineNumber: number): Array<string> {
	//TODO (@mayurankv) Future: Speed this up by setting up a reverse dictionary for line number to highlights
	let classList: Array<string> = [];
	if (codeblockParameters.highlights.default.includes(lineNumber))
		classList.push('codeblock-customizer-line-highlighted');
	Object.entries(codeblockParameters.highlights.alternative).forEach(([alternativeHighlight,highlightedLineNumbers]: [string,Array<number>]) => {
		if (highlightedLineNumbers.includes(lineNumber))
			classList.push(`codeblock-customizer-line-highlighted-${alternativeHighlight.replace(/\s+/g, '-').toLowerCase()}`);
	})
	if (classList.length === 0)
		classList = ['codeblock-customizer-line']
	return classList;
}
