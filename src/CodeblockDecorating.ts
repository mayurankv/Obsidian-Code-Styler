import { LANGUAGE_NAMES, CodeStylerThemeSettings, FOLD_PLACEHOLDER, GIT_ICONS } from "./Settings";
import { CodeblockParameters, Highlights } from "./Parsing/CodeblockParsing";
import { InlineCodeParameters } from "./Parsing/InlineCodeParsing";
import { MarkdownRenderer } from "obsidian";
import CodeStylerPlugin from "./main";

export function createHeader(codeblockParameters: CodeblockParameters, themeSettings: CodeStylerThemeSettings, sourcePath: string, plugin: CodeStylerPlugin): HTMLElement {
	const headerContainer = createDiv();
	const iconURL = codeblockParameters.language?getLanguageIcon(codeblockParameters.language,plugin.languageIcons):undefined;
	if (!isHeaderHidden(codeblockParameters,themeSettings,iconURL)) {
		headerContainer.classList.add("code-styler-header-container");
		if (codeblockParameters.language !== "") {
			if (isLanguageIconShown(codeblockParameters,themeSettings,iconURL))
				headerContainer.appendChild(createImageWrapper(iconURL as string,createDiv()));
			if (isLanguageTagShown(codeblockParameters,themeSettings))
				headerContainer.appendChild(createDiv({cls: "code-styler-header-language-tag", text: getLanguageTag(codeblockParameters.language)}));
		}
		headerContainer.appendChild(createTitleContainer(codeblockParameters, themeSettings, sourcePath, plugin));
		if (codeblockParameters?.externalReference) //TODO (@mayurankv) Add settings toggle
			headerContainer.appendChild(createExternalReferenceContainer(codeblockParameters, themeSettings));
		if (false) //TODO (@mayurankv) Add settings toggle
			headerContainer.appendChild(createExecuteCodeContainer(codeblockParameters, themeSettings, plugin));
	} else
		headerContainer.classList.add("code-styler-header-container-hidden");
	return headerContainer;
}
function createTitleContainer(codeblockParameters: CodeblockParameters, themeSettings: CodeStylerThemeSettings, sourcePath: string, plugin: CodeStylerPlugin): HTMLElement {
	const titleContainer = createDiv({cls: "code-styler-header-text"});
	const title = codeblockParameters.title || (codeblockParameters.fold.enabled?(codeblockParameters.fold.placeholder || themeSettings.header.foldPlaceholder || FOLD_PLACEHOLDER):"");
	if (codeblockParameters.reference === "")
		titleContainer.innerText = title;
	else if (/^(?:https?|file):\/\//.test(codeblockParameters.reference))
		MarkdownRenderer.render(plugin.app,`[${title}](${codeblockParameters.reference})`,titleContainer,sourcePath,plugin);
	else
		MarkdownRenderer.render(plugin.app,`[[${codeblockParameters.reference}|${title}]]`,titleContainer,sourcePath,plugin); //TODO (@mayurankv) Add links to metadata cache properly
	return titleContainer;
}
function createExternalReferenceContainer(codeblockParameters: CodeblockParameters, themeSettings: CodeStylerThemeSettings): HTMLElement {
	//TODO (@mayurankv) Add theme settings to conditionally set sections
	const externalReferenceContainer = createDiv({ cls: "code-styler-header-external-reference" });
	externalReferenceContainer.appendChild(createDiv({cls: "external-reference-repo", text: codeblockParameters?.externalReference?.author+"/"+codeblockParameters?.externalReference?.repository}));
	const refIcon = createDiv({ cls: "external-reference-ref-icon" });
	if (codeblockParameters?.externalReference?.refInfo?.type === "branch")
		refIcon.innerHTML = GIT_ICONS["branch"];
	else if (codeblockParameters?.externalReference?.refInfo?.type === "tree")
		refIcon.innerHTML = GIT_ICONS["commit"];
	else
		refIcon.innerHTML = GIT_ICONS["branch"];
	// refIcon.innerHTML = "<svgxmlns=\"http://www.w3.org/2000/svg\"viewBox=\"00100100\"><style>svg{font-family:'code-styler-nerdfon';font-size:50px;fill:black;}</style>&#xe0a0;</svg>";
	// refIcon.innerHTML = `<svgxmlns="http://www.w3.org/2000/svg><style>
	// 	@font-face{
	// 		font-family:'MesloLGLDZNerdFont-Regular';
	// 		src:url('https://github.com/ryanoasis/nerd-fonts/blob/master/patched-fonts/Meslo/L-DZ/Regular/MesloLGLDZNerdFont-Regular.ttf') format('ttf');
	// 	}
	// 	text{
	// 		font-family:'MesloLGLDZNerdFont-Regular';
	// 		font-size:50px;
	// 	}
	// </style>&#xe0a0;</svg>`;
	externalReferenceContainer.appendChild(refIcon);
	externalReferenceContainer.appendChild(createDiv({cls: "external-reference-ref", text: codeblockParameters?.externalReference?.refInfo?.ref as string}));
	return externalReferenceContainer;
}
function createExecuteCodeContainer(codeblockParameters: CodeblockParameters, themeSettings: CodeStylerThemeSettings, plugin: CodeStylerPlugin): HTMLElement {
	const executeCodeContainer = createDiv({cls: "code-styler-header-execute-code"});
	//TODO (@mayurankv) Finish
	return executeCodeContainer;
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
