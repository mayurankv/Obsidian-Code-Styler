import { CodeblockCustomizerSettings } from "./Settings";

// Setting Management
export function getCurrentMode() {
	const body = document.querySelector('body');
	if (body !== null){
		if (body.classList.contains('theme-light')) {
			return "light";
		} else if (body.classList.contains('theme-dark')) {
			return "dark";
		}
	}
	console.log('Warning: Couldn\'t get current theme');
	return "light";
}


























const stylesDict = {
	activeCodeBlockLineColor: 'codeblock-active-line-color',
	activeLineColor: 'editor-active-line-color',
	backgroundColor: 'codeblock-background-color',
	highlightColor: 'highlight-color',
	headerColor: 'header-background-color',
	headerTextColor: 'header-text-color',
	headerLineColor: 'header-line-color',
	gutterTextColor: 'gutter-text-color',
	gutterBackgroundColor: 'gutter-background-color',
	codeBlockLangColor: 'language-tag-text-color',
	codeBlockLangBackgroundColor: 'language-tag-background-color',
}

export function updateSettingStyles(settings: CodeblockCustomizerSettings) {
	let colorThemes = settings.colorThemes;
	let styleId = 'codeblock-customizer-styles'
	let styleTag = document.getElementById(styleId);
	if (typeof(styleTag) == 'undefined' || styleTag == null) {
		styleTag = document.createElement('style');
		styleTag.id = styleId;
		document.getElementsByTagName('head')[0].appendChild(styleTag);
	}
	let currentMode = getCurrentMode()
	let defaultColors = settings.colorThemes.find((theme) => {return theme['name'] == `${currentMode.charAt(0).toUpperCase()+currentMode.slice(1)} Theme`})['colors'];
	let themeColors = settings.colorThemes.find((theme) => {return theme['name'] == settings.SelectedTheme})['colors'];
	let currentTheme = {name: 'current', colors: {}};
	for (const key of Object.keys(stylesDict)) {
		let defaultValue = accessSetting(key,defaultColors).toLowerCase();
		let themeValue = accessSetting(key,themeColors).toLowerCase();
		let settingsValue = accessSetting(key,settings).toLowerCase();
		if (defaultValue !== settingsValue) {
			currentTheme['colors'][key] = settingsValue;
		} else if (defaultValue !== themeValue) {
			currentTheme['colors'][key] = themeValue;
		}
	}
	let altHighlightStyling = settings.alternateColors.reduce((styling,altHighlight) => {return styling + `
		.codeblock-customizer-line-highlighted-${altHighlight['name'].replace(/\s+/g, '-').toLowerCase()} {
			background-color: var(--codeblock-customiser-highlight-${altHighlight['name'].replace(/\s+/g, '-').toLowerCase()}-color) !important;
		}
	`},'');
	let textSettingsStyles = `
		body.codeblock-customizer [class^="codeblock-customizer-header-language-tag"] {
			--codeblock-customizer-language-tag-text-bold: ${settings.header.bCodeblockLangBold?'bold':'normal'};
			--codeblock-customizer-language-tag-text-italic: ${settings.header.bCodeblockLangItalic?'italic':'normal'};
		}
		body.codeblock-customizer .codeblock-customizer-header-text {
			--codeblock-customizer-header-text-bold: ${settings.header.bHeaderBold?'bold':'normal'};
			--codeblock-customizer-header-text-italic: ${settings.header.bHeaderItalic?'italic':'normal'};
		}
	`;
	styleTag.innerText = colorThemes.reduce((styles,theme) => {
		return styles + formatStyles(theme,settings.alternateColors);
	},formatStyles(currentTheme,settings.alternateColors)+altHighlightStyling+textSettingsStyles).trim().replace(/[\r\n\s]+/g, ' ');
	updateSettingClasses(settings);
}// setStyles

function updateSettingClasses(settings) {
	document.body.classList.remove("codeblock-customizer-active-line-highlight","codeblock-customizer-active-line-highlight-codeblock","codeblock-customizer-active-line-highlight-editor")
	if (settings.bActiveLineHighlight && settings.bActiveCodeblockLineHighlight) {
		// Inside and outside of codeblocks with different colors
		document.body.classList.add("codeblock-customizer-active-line-highlight");
	} else if (settings.bActiveLineHighlight && !settings.bActiveCodeblockLineHighlight) {
		// Only outside codeblocks
		document.body.classList.add("codeblock-customizer-active-line-highlight-editor");
	} else if (!settings.bActiveLineHighlight && settings.bActiveCodeblockLineHighlight) {
		// Only inside codeblocks
		document.body.classList.add("codeblock-customizer-active-line-highlight-codeblock");
	}
	
	if (settings.bEnableLineNumbers) {
		document.body.classList.add("codeblock-customizer-show-line-numbers");
	} else {
		document.body.classList.remove("codeblock-customizer-show-line-numbers");
	}

	document.body.classList.remove("codeblock-customizer-show-langnames","codeblock-customizer-show-langnames-always");
	if (settings.header.bAlwaysDisplayCodeblockLang && settings.bDisplayCodeBlockLanguage) {
		document.body.classList.add("codeblock-customizer-show-langnames-always");
	} else if (settings.bDisplayCodeBlockLanguage) {
		document.body.classList.add("codeblock-customizer-show-langnames");
	}

	document.body.classList.remove("codeblock-customizer-show-langicons","codeblock-customizer-show-langicons-always");
	if (settings.header.bAlwaysDisplayCodeblockIcon && settings.bDisplayCodeBlockIcon) {
		document.body.classList.add("codeblock-customizer-show-langicons-always");
	} else if (settings.bDisplayCodeBlockIcon) {
		document.body.classList.add("codeblock-customizer-show-langicons");
	}

	if (settings.bGutterHighlight) {
		document.body.classList.add('codeblock-customizer-gutter-highlight');
	} else {
		document.body.classList.remove('codeblock-customizer-gutter-highlight');
	}
}// updateSettingStyles

function formatStyles(theme: {name: string, colors: CodeblockCustomizerColors},alternateColors) { //TODO (@mayurankv) Add type hint for alternateColors
	let current = theme['name'] == "current";
	let themeClass = ''
	let altHighlightStyles = ''
	if (theme['name'] == 'Light Theme') {
		themeClass = '.theme-light';
		altHighlightStyles = addAltHighlightColors(alternateColors,true);
	} else if (theme['name'] == 'Dark Theme') {
		themeClass = '.theme-dark';
		altHighlightStyles = addAltHighlightColors(alternateColors,false);
	} else if (theme['name'] != 'current') {
		return '';
		// themeClass = theme['name'].replace(/\s+/g, '-').toLowerCase();
	}
	return `
		body.codeblock-customizer${current ?'':themeClass} {
			${Object.keys(stylesDict).reduce((variables,key)=>{
				let cssVariable = `--codeblock-customizer-${stylesDict[key]}`;
				let cssValue = accessSetting(key,theme['colors']);
				let cssImportant = (current?' !important':'');
				if (cssValue != null) {
					return variables + `${cssVariable}: ${cssValue + cssImportant};`;
				} else {
					return variables;
				}
			},altHighlightStyles)}
		}
	`;
}// formatStyles

function addAltHighlightColors(alternateColors, lightTheme: boolean) { //TODO (@mayurankv) Add type hint for alternateColors
	let key = lightTheme?'lightColor':'darkColor';
	return alternateColors.reduce((altHighlightStyles,altHighlight) => {return altHighlightStyles + `--codeblock-customiser-highlight-${altHighlight['name'].replace(/\s+/g, '-').toLowerCase()}-color: ${altHighlight[key]};`},'')
}

function accessSetting(key: string, settings: CodeblockCustomizerSettings) {
	if (key in settings) {
		return settings[key];
	} else if ('header' in settings) {
		if (key in settings['header']) {
			return settings['header'][key];
		} else {
			let alt_key = key.charAt(6).toLowerCase()+key.slice(7);
			if (alt_key in settings['header']) {
				return settings['header'][alt_key];
			} 
		}
	} else {
		return null;
	}
}
