import { CodeblockCustomizerSettings, CodeblockCustomizerThemeColors, CodeblockCustomizerThemeModeColors, CodeblockCustomizerThemeSettings, Color } from "./Settings";
import { isCss } from "./SettingsTab";

export function updateStyling(settings: CodeblockCustomizerSettings): void {
	let styleId = 'codeblock-customizer-styles';
	let styleTag = document.getElementById(styleId);
	if (!styleTag) {
		styleTag = document.createElement('style');
		styleTag.id = styleId;
		document.getElementsByTagName('head')[0].appendChild(styleTag);
	}
	styleTag.innerText = (styleThemeColors(settings.currentTheme.colors)+styleThemeSettings(settings.currentTheme.settings)).trim().replace(/\s+/g,' ');
	addThemeSettingsClasses(settings.currentTheme.settings);
}

function styleThemeColors (themeColors: CodeblockCustomizerThemeColors): string {
	return Object.keys(themeColors.light.highlights.alternativeHighlights).reduce((result: string, alternativeHighlight: string) => {
		return result + `
			body.codeblock-customizer .codeblock-customizer-line-highlighted-${alternativeHighlight.replace(/\s+/g, '-').toLowerCase()} {
				background: linear-gradient(to right, var(--codeblock-customizer-${alternativeHighlight.replace(/\s+/g, '-').toLowerCase()}-highlight-color), var(--gradient-highlights-color-stop), transparent) !important;
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
		'header-background-color': themeModeColors.header.backgroundColor,
		'header-title-text-color': themeModeColors.header.title.textColor,
		'header-language-tag-background-color': themeModeColors.header.languageTag.backgroundColor,
		'header-language-tag-text-color': themeModeColors.header.languageTag.textColor,
		'header-separator-color': themeModeColors.header.lineColor,
		'active-codeblock-line-color': themeModeColors.highlights.activeCodeblockLineColor,
		'active-editor-line-color': themeModeColors.highlights.activeEditorLineColor,
		'default-highlight-color': themeModeColors.highlights.defaultColor,
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
			${themeSettings.header.languageTag.textFont===''?'':`
				font-family: ${themeSettings.header.languageTag.textFont};
			`}
		}
		body.codeblock-customizer .codeblock-customizer-header-text {
			--codeblock-customizer-header-title-text-bold: ${themeSettings.header.title.textBold?'bold':'normal'};
			--codeblock-customizer-header-title-text-italic: ${themeSettings.header.title.textItalic?'italic':'normal'};
			${themeSettings.header.title.textFont===''?'':`
				font-family: ${themeSettings.header.title.textFont};
			`}
		}
		body.codeblock-customizer {
			--border-radius: ${themeSettings.codeblock.curvature}px !important;
			--language-icon-size: ${themeSettings.advanced.iconSize}px !important;
			--gradient-highlights-color-stop: ${themeSettings.advanced.gradientHighlights?themeSettings.advanced.gradientHighlightsColorStop:'100%'} !important;
			--language-border-width: ${themeSettings.advanced.languageBorderColor?themeSettings.advanced.languageBorderWidth:0}px !important;
		}
		${themeSettings.header.languageIcon.displayColor?'':`
			.codeblock-customizer-icon {
				filter: grayscale(1);
			}
		`}
	`;
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
	else if (themeSettings.header.languageTag.display === 'title_only')
		document.body.classList.add("codeblock-customizer-show-langnames");

	document.body.classList.remove("codeblock-customizer-show-langicons","codeblock-customizer-show-langicons-always");
	if (themeSettings.header.languageIcon.display === 'always')
		document.body.classList.add("codeblock-customizer-show-langicons-always");
	else if (themeSettings.header.languageIcon.display === 'title_only')
		document.body.classList.add("codeblock-customizer-show-langicons");
}
