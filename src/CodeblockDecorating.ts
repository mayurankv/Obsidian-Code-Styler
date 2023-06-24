import { LANGUAGE_NAMES, LANGUAGE_ICONS } from "./LanguageDetails";
import { CodeblockParameters } from "./CodeblockParsing";
import { CodeblockCustomizerThemeSettings } from "./Settings";

export function createHeader(codeblockPreElement: HTMLElement, codeblockParameters: CodeblockParameters, themeSettings: CodeblockCustomizerThemeSettings) {
	const headerContainer = createDiv({cls: `codeblock-customizer-header-container${(codeblockParameters.fold.enabled || codeblockParameters.title !== '')?'-specific':''}`});
	if (codeblockParameters.language !== ''){
		const IconURL = getLanguageIcon(codeblockParameters.language)
		if (IconURL !== null) {
			const imageWrapper = createDiv();
			const img = document.createElement("img");
			img.classList.add("codeblock-customizer-icon");
			img.width = themeSettings.advanced.iconSize;
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
		headerText = codeblockParameters.fold.placeholder!==''?codeblockParameters.fold.placeholder:themeSettings.header.collapsePlaceholder;
	headerContainer.appendChild(createDiv({cls: "codeblock-customizer-header-text", text: headerText}));   
	
	const codeblockPreParent = codeblockPreElement.parentNode;
	if (codeblockPreParent)
		codeblockPreParent.insertBefore(headerContainer, codeblockPreElement);
	
	headerContainer.addEventListener("click", ()=>{codeblockPreElement.classList.toggle("codeblock-customizer-codeblock-collapsed")});
	if (codeblockParameters.fold.enabled)
		codeblockPreElement.classList.add(`codeblock-customizer-codeblock-collapsed`);
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
