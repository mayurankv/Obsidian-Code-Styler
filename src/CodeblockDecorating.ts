import { LANGUAGE_NAMES, CodeStylerThemeSettings, FOLD_PLACEHOLDER } from "./Settings";
import { CodeblockParameters, Highlights } from "./Parsing/CodeblockParsing";
import { InlineCodeParameters } from "./Parsing/InlineCodeParsing";
import { Component, MarkdownRenderer } from "obsidian";

export function createHeader(codeblockParameters: CodeblockParameters, themeSettings: CodeStylerThemeSettings, languageIcons: Record<string,string>): HTMLElement {
	const headerContainer = createDiv();
	const iconURL = codeblockParameters.language?getLanguageIcon(codeblockParameters.language,languageIcons):undefined;
	if (!isHeaderHidden(codeblockParameters,themeSettings,iconURL)) {
		headerContainer.classList.add("code-styler-header-container");
		if (codeblockParameters.language !== "") {
			if (isLanguageIconShown(codeblockParameters,themeSettings,iconURL))
				headerContainer.appendChild(createImageWrapper(iconURL as string,createDiv()));
			if (isLanguageTagShown(codeblockParameters,themeSettings))
				headerContainer.appendChild(createDiv({cls: "code-styler-header-language-tag", text: getLanguageTag(codeblockParameters.language)})); //TODO (@mayurankv) Can I remove the language? Is this info elsewhere?
		}
		// headerContainer.appendChild(createDiv({cls: "code-styler-header-text", text: codeblockParameters.title || (codeblockParameters.fold.enabled?(codeblockParameters.fold.placeholder || themeSettings.header.foldPlaceholder || FOLD_PLACEHOLDER):"")}));
		const titleContainer = createDiv({cls: "code-styler-header-text"});
		const title = codeblockParameters.title || (codeblockParameters.fold.enabled?(codeblockParameters.fold.placeholder || themeSettings.header.foldPlaceholder || FOLD_PLACEHOLDER):"");
		if (codeblockParameters.reference === "")
			titleContainer.innerText = title;
		else
			MarkdownRenderer.render(app,`[[${title}|${codeblockParameters.reference}]]`,titleContainer,"",new Component()); 
	} else
		headerContainer.classList.add("code-styler-header-container-hidden");
	return headerContainer;
}
export function createInlineOpener(inlineCodeParameters: InlineCodeParameters, languageIcons: Record<string,string>, containerClasses: Array<string> = ["code-styler-inline-opener"]): HTMLElement {
	const openerContainer = createSpan({cls: containerClasses.join(" ")});
	if (inlineCodeParameters.icon) {
		const iconURL = getLanguageIcon(inlineCodeParameters.language,languageIcons);
		if (typeof iconURL !== "undefined")
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

export function getLanguageIcon(language: string, languageIcons: Record<string,string>): string | undefined {
	return languageIcons?.[getLanguageTag(language)];
}
function getLanguageTag(language: string) {
	return LANGUAGE_NAMES?.[language] ?? (language.charAt(0).toUpperCase() + language.slice(1) || "");
}
export function isHeaderHidden(codeblockParameters: CodeblockParameters, themeSettings: CodeStylerThemeSettings, iconURL: string | undefined): boolean {
	return !isHeaderRequired(codeblockParameters) && (codeblockParameters.language === "" || (themeSettings.header.languageTag.display !== "always" && (themeSettings.header.languageIcon.display !== "always" || (typeof iconURL == "undefined"))));
}
function isLanguageIconShown(codeblockParameters: CodeblockParameters, themeSettings: CodeStylerThemeSettings, iconURL: string | undefined): boolean {
	return (typeof iconURL !== "undefined") && (themeSettings.header.languageIcon.display === "always" || (isHeaderRequired(codeblockParameters) && themeSettings.header.languageIcon.display === "if_header_shown"));
}
function isLanguageTagShown(codeblockParameters: CodeblockParameters, themeSettings: CodeStylerThemeSettings): boolean {
	return themeSettings.header.languageTag.display === "always" || (isHeaderRequired(codeblockParameters) && themeSettings.header.languageTag.display === "if_header_shown");
}
function isHeaderRequired(codeblockParameters: CodeblockParameters): boolean {
	return codeblockParameters.fold.enabled || codeblockParameters.title !== "";
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
