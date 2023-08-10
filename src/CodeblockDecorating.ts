import { LANGUAGE_NAMES, CodeStylerThemeSettings } from "./Settings";
import { CodeblockParameters, Highlights, InlineCodeParameters } from "./CodeblockParsing";

export function createHeader(codeblockParameters: CodeblockParameters, themeSettings: CodeStylerThemeSettings, languageIcons: Record<string,string>): HTMLElement {
	const headerContainer = createDiv({cls: `code-styler-header-container${(codeblockParameters.fold.enabled || codeblockParameters.title !== "")?"-specific":""}`});
	if (codeblockParameters.language !== ""){
		const iconURL = getLanguageIcon(codeblockParameters.language,languageIcons);
		if (iconURL !== null)
			headerContainer.appendChild(createImageWrapper(iconURL,createDiv()));
		headerContainer.appendChild(createDiv({cls: `code-styler-header-language-tag-${codeblockParameters.language}`, text: getLanguageTag(codeblockParameters.language)}));
	}
	
	let headerText = "";
	if (codeblockParameters.title !== "")
		headerText = codeblockParameters.title;
	else if (codeblockParameters.fold.enabled)
		if (codeblockParameters.fold.placeholder!=="")
			headerText = codeblockParameters.fold.placeholder;
		else
			headerText = themeSettings.header.collapsePlaceholder!==""?themeSettings.header.collapsePlaceholder:"Collapsed Code";
	headerContainer.appendChild(createDiv({cls: "code-styler-header-text", text: headerText}));   

	return headerContainer;
}
export function createInlineOpener(inlineCodeParameters: InlineCodeParameters, languageIcons: Record<string,string>, containerClasses: Array<string> = ["code-styler-inline-opener"]): HTMLElement {
	const openerContainer = createSpan({cls: containerClasses.join(" ")});
	if (inlineCodeParameters.icon) {
		const iconURL = getLanguageIcon(inlineCodeParameters.language,languageIcons);
		if (iconURL !== null)
			openerContainer.appendChild(createImageWrapper(iconURL,createSpan(),"code-styler-inline-icon"));
	}
	if (inlineCodeParameters.title)
		openerContainer.appendChild(createSpan({cls: "code-styler-inline-title", text: inlineCodeParameters.title}));
	return openerContainer;
}
function createImageWrapper(iconURL: string, imageWrapper: HTMLElement, imgClass = "code-styler-icon"): HTMLElement {
	const img = document.createElement("img");
	img.classList.add(imgClass);
	img.src = iconURL;
	imageWrapper.appendChild(img);
	return imageWrapper;
}

export function getLanguageIcon(language: string, languageIcons: Record<string,string>) {
	language = getLanguageTag(language);
	if (language in languageIcons)
		return languageIcons[language];
	return null;
}
function getLanguageTag(language: string) {
	if (language in LANGUAGE_NAMES)
		return LANGUAGE_NAMES[language];
	else if (language !== "")
		return language.charAt(0).toUpperCase() + language.slice(1);
	return "";
}

export function getLineClass(codeblockParameters: CodeblockParameters, lineNumber: number, line: string): Array<string> {
	let classList: Array<string> = [];
	if (codeblockParameters.highlights.default.lineNumbers.includes(lineNumber+codeblockParameters.lineNumbers.offset) || codeblockParameters.highlights.default.plainText.some(text => line.indexOf(text) > -1) || codeblockParameters.highlights.default.regularExpressions.some(regExp => regExp.test(line)))
		classList.push("code-styler-line-highlighted");
	Object.entries(codeblockParameters.highlights.alternative).forEach(([alternativeHighlight,highlightedLines]: [string,Highlights]) => {
		if (highlightedLines.lineNumbers.includes(lineNumber+codeblockParameters.lineNumbers.offset) || highlightedLines.plainText.some(text => line.indexOf(text) > -1) || highlightedLines.regularExpressions.some(regExp => regExp.test(line)))
			classList.push(`code-styler-line-highlighted-${alternativeHighlight.replace(/\s+/g, "-").toLowerCase()}`);
	});
	if (classList.length === 0)
		classList = ["code-styler-line"];
	return classList;
}
export function getLineNumberDisplay(codeblockParameters: CodeblockParameters): string {
	let lineNumberDisplay = "";
	if (!codeblockParameters.lineNumbers.alwaysEnabled && codeblockParameters.lineNumbers.alwaysDisabled)
		lineNumberDisplay = "-hide";
	else if (codeblockParameters.lineNumbers.alwaysEnabled && !codeblockParameters.lineNumbers.alwaysDisabled)
		lineNumberDisplay = "-specific";
	return lineNumberDisplay;
}
