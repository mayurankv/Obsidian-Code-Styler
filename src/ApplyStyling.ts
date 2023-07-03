import { CodeblockCustomizerSettings, CodeblockCustomizerThemeColors, CodeblockCustomizerThemeModeColors, CodeblockCustomizerThemeSettings, Color, LANGUAGE_NAMES, LANGUAGE_COLORS } from "./Settings";
import { isCss } from "./SettingsTab";

const STYLE_ID = 'codeblock-customizer-styles';

export function updateStyling(settings: CodeblockCustomizerSettings): void {
	let styleTag = document.getElementById(STYLE_ID);
	if (!styleTag) {
		styleTag = document.createElement('style');
		styleTag.id = STYLE_ID;
		document.getElementsByTagName('head')[0].appendChild(styleTag);
	}
	styleTag.innerText = (styleThemeColors(settings.currentTheme.colors)+styleThemeSettings(settings.currentTheme.settings)+styleLanguageColors(settings.currentTheme.settings,settings.redirectLanguages)).trim().replace(/\s+/g,' ');
	addThemeSettingsClasses(settings.currentTheme.settings);
}

function styleThemeColors (themeColors: CodeblockCustomizerThemeColors): string {
	return Object.keys(themeColors.light.highlights.alternativeHighlights).reduce((result: string, alternativeHighlight: string) => {
		return result + `
			body.codeblock-customizer .codeblock-customizer-line-highlighted-${alternativeHighlight.replace(/\s+/g, '-').toLowerCase()} {
				--gradient-background-color: var(--codeblock-customizer-${alternativeHighlight.replace(/\s+/g, '-').toLowerCase()}-highlight-color) !important;
			}
		`;
	},`
		body.codeblock-customizer.theme-light {
			${getThemeColors(themeColors.light)}
		}
		body.codeblock-customizer.theme-dark {
			${getThemeColors(themeColors.dark)}
		}
	`);
}

function getThemeColors (themeModeColors: CodeblockCustomizerThemeModeColors): string {
	return Object.entries({
		'codeblock-background-color': themeModeColors.codeblock.backgroundColor,
		'codeblock-text-color': themeModeColors.codeblock.textColor,
		'gutter-background-color': themeModeColors.gutter.backgroundColor,
		'gutter-text-color': themeModeColors.gutter.textColor,
		'gutter-active-text-color': themeModeColors.gutter.activeTextColor,
		'header-background-color': themeModeColors.header.backgroundColor,
		'header-title-text-color': themeModeColors.header.title.textColor,
		'header-language-tag-background-color': themeModeColors.header.languageTag.backgroundColor,
		'header-language-tag-text-color': themeModeColors.header.languageTag.textColor,
		'header-separator-color': themeModeColors.header.lineColor,
		'active-codeblock-line-color': themeModeColors.highlights.activeCodeblockLineColor,
		'active-editor-line-color': themeModeColors.highlights.activeEditorLineColor,
		'default-highlight-color': themeModeColors.highlights.defaultColor,
		'button-color': themeModeColors.advanced.buttonColor,
		'button-active-color': themeModeColors.advanced.buttonActiveColor,
		...Object.entries(themeModeColors.highlights.alternativeHighlights).reduce((result: Record<string,Color>,[alternativeHighlight,color]: [string,Color]): Record<string,Color> => {
			result[`${alternativeHighlight.replace(/\s+/g, '-').toLowerCase()}-highlight-color`] = color;
			return result;
		},{})
	}).reduce((result: string, [cssVariable,color]: [string,Color]): string => {
		const styleColor = isCss(color)?`var(${color})`:color;
		return result + `--codeblock-customizer-${cssVariable}: ${styleColor};`
	},``)
}

function styleThemeSettings (themeSettings: CodeblockCustomizerThemeSettings): string {
	return `
		body.codeblock-customizer [class^="codeblock-customizer-header-language-tag"] {
			--codeblock-customizer-header-language-tag-text-bold: ${themeSettings.header.languageTag.textBold?'bold':'normal'};
			--codeblock-customizer-header-language-tag-text-italic: ${themeSettings.header.languageTag.textItalic?'italic':'normal'};
			font-family: ${themeSettings.header.languageTag.textFont!==''?themeSettings.header.languageTag.textFont:'var(--font-text)'};
		}
		body.codeblock-customizer .codeblock-customizer-header-text {
			--codeblock-customizer-header-title-text-bold: ${themeSettings.header.title.textBold?'bold':'normal'};
			--codeblock-customizer-header-title-text-italic: ${themeSettings.header.title.textItalic?'italic':'normal'};
			font-family: ${themeSettings.header.languageTag.textFont!==''?themeSettings.header.languageTag.textFont:'var(--font-text)'};
		}
		body.codeblock-customizer {
			--border-radius: ${themeSettings.codeblock.curvature}px;
			--language-icon-size: ${themeSettings.advanced.iconSize}px;
			--gradient-highlights-color-stop: ${themeSettings.advanced.gradientHighlights?themeSettings.advanced.gradientHighlightsColorStop:'100%'};
			--header-font-size: ${themeSettings.header.fontSize}px;
			--line-wrapping: ${themeSettings.codeblock.unwrapLines?'pre':'pre-wrap'};
			${!themeSettings.codeblock.wrapLinesActive?'':'--line-active-wrapping: pre-wrap;'}
			${themeSettings.header.languageIcon.displayColor?'':'--icon-filter: grayscale(1);'}
		}
	`;
}

function styleLanguageColors (themeSettings: CodeblockCustomizerThemeSettings, redirectLanguages: Record<string,{color?: Color, icon?: string}>): string {
	return Object.entries(LANGUAGE_NAMES).reduce((result: string,[languageName, languageDisplayName]: [string,string]): string => {
		if (languageDisplayName in LANGUAGE_COLORS || (languageName in redirectLanguages && 'color' in redirectLanguages[languageName]))
			result += `
				.language-${languageName} {
					--language-border-color: ${redirectLanguages?.[languageName]?.['color'] ?? LANGUAGE_COLORS[languageDisplayName]};
					--language-border-width: ${themeSettings.advanced.languageBorderColor?themeSettings.advanced.languageBorderWidth:0}px;
				}
			`;
		return result;
	},'')
}

function addThemeSettingsClasses (themeSettings: CodeblockCustomizerThemeSettings): void {
	if (themeSettings.codeblock.lineNumbers)
		document.body.classList.add("codeblock-customizer-show-line-numbers");
	else
		document.body.classList.remove("codeblock-customizer-show-line-numbers");

	if (themeSettings.gutter.highlight)
		document.body.classList.add('codeblock-customizer-gutter-highlight');
	else
		document.body.classList.remove('codeblock-customizer-gutter-highlight');

	if (themeSettings.gutter.activeLine)
		document.body.classList.add('codeblock-customizer-gutter-active-line');
	else
		document.body.classList.remove('codeblock-customizer-gutter-active-line');
	
	document.body.classList.remove("codeblock-customizer-active-line-highlight","codeblock-customizer-active-line-highlight-codeblock","codeblock-customizer-active-line-highlight-editor")
	if (themeSettings.highlights.activeEditorLine && themeSettings.highlights.activeCodeblockLine) // Inside and outside of codeblocks with different colors
		document.body.classList.add("codeblock-customizer-active-line-highlight");
	else if (themeSettings.highlights.activeEditorLine && !themeSettings.highlights.activeCodeblockLine) // Only outside codeblocks
		document.body.classList.add("codeblock-customizer-active-line-highlight-editor");
	else if (!themeSettings.highlights.activeEditorLine && themeSettings.highlights.activeCodeblockLine) // Only inside codeblocks
		document.body.classList.add("codeblock-customizer-active-line-highlight-codeblock");
	
	document.body.classList.remove("codeblock-customizer-show-langnames","codeblock-customizer-show-langnames-always");
	if (themeSettings.header.languageTag.display === 'always')
		document.body.classList.add("codeblock-customizer-show-langnames-always");
	else if (themeSettings.header.languageTag.display === 'if_header_shown')
		document.body.classList.add("codeblock-customizer-show-langnames");

	document.body.classList.remove("codeblock-customizer-show-langicons","codeblock-customizer-show-langicons-always");
	if (themeSettings.header.languageIcon.display === 'always')
		document.body.classList.add("codeblock-customizer-show-langicons-always");
	else if (themeSettings.header.languageIcon.display === 'if_header_shown')
		document.body.classList.add("codeblock-customizer-show-langicons");
}

export function removeStylesAndClasses(): void {
	document.getElementById(STYLE_ID)?.remove();
	document.body.classList.remove(
		'codeblock-customizer',
		"codeblock-customizer-show-line-numbers",
		'codeblock-customizer-gutter-highlight',
		'codeblock-customizer-gutter-active-line',
		"codeblock-customizer-show-langnames",
		"codeblock-customizer-show-langnames-always",
		"codeblock-customizer-show-langicons",
		"codeblock-customizer-show-langicons-always",
	);
}
