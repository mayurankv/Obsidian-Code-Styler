import { App } from "obsidian";

import { CodeStylerSettings, CodeStylerThemeColours, CodeStylerThemeModeColours, CodeStylerThemeSettings, Colour, LANGUAGE_NAMES, LANGUAGE_COLOURS } from "./Settings";
import { isCss } from "./SettingsTab";

interface ThemeStyle {
	border?: {
		size: number;
		style: string;
	},
	scrollbar?: boolean;
	extra?: string;
}

const STYLE_ID = "code-styler-styles";
const THEME_STYLES: Record<string,ThemeStyle> = {
	"Prism": {
		border: {
			size: 1,
			style: "1px solid var(--window-border-color)",
		},
	},
	"Shimmering Focus": {
		border: {
			size: 1,
			style: "var(--thin-muted-border)",
		},
	},
	"Minimal": {
		extra: `
			.markdown-source-view.mod-cm6.is-readable-line-width :not(pre.code-styler-pre) > .code-styler-header-container {
				box-sizing: border-box;
			}
		`,
	},
	"Obsidianite": {
		scrollbar: true,
	}
};

export function updateStyling(settings: CodeStylerSettings, app: App): void {
	const currentTheme = getCurrentTheme(app);
	let styleTag = document.getElementById(STYLE_ID);
	if (!styleTag) {
		styleTag = document.createElement("style");
		styleTag.id = STYLE_ID;
		document.getElementsByTagName("head")[0].appendChild(styleTag);
	}
	styleTag.innerText = (styleThemeColours(settings.currentTheme.colours)+styleThemeSettings(settings.currentTheme.settings,currentTheme)+styleLanguageColours(settings.currentTheme.settings,settings.redirectLanguages,currentTheme)).trim().replace(/\s+/g," ");
	addThemeSettingsClasses(settings.currentTheme.settings);
}

function styleThemeColours (themeColours: CodeStylerThemeColours): string {
	return Object.keys(themeColours.light.highlights.alternativeHighlights).reduce((result: string, alternativeHighlight: string) => {
		return result + `
			body.code-styler .code-styler-line-highlighted-${alternativeHighlight.replace(/\s+/g,"-").toLowerCase()} {
				--gradient-background-colour: var(--code-styler-${alternativeHighlight.replace(/\s+/g,"-").toLowerCase()}-highlight-colour) !important;
			}
		`;
	},`
		body.code-styler.theme-light {
			${getThemeColours(themeColours.light)}
		}
		body.code-styler.theme-dark {
			${getThemeColours(themeColours.dark)}
		}
	`);
}

function getThemeColours (themeModeColours: CodeStylerThemeModeColours): string {
	return Object.entries({
		"codeblock-background-colour": themeModeColours.codeblock.backgroundColour,
		"codeblock-text-colour": themeModeColours.codeblock.textColour,
		"gutter-background-colour": themeModeColours.gutter.backgroundColour,
		"gutter-text-colour": themeModeColours.gutter.textColour,
		"gutter-active-text-colour": themeModeColours.gutter.activeTextColour,
		"header-background-colour": themeModeColours.header.backgroundColour,
		"header-title-text-colour": themeModeColours.header.title.textColour,
		"header-language-tag-background-colour": themeModeColours.header.languageTag.backgroundColour,
		"header-language-tag-text-colour": themeModeColours.header.languageTag.textColour,
		"header-separator-colour": themeModeColours.header.lineColour,
		"active-codeblock-line-colour": themeModeColours.highlights.activeCodeblockLineColour,
		"active-editor-line-colour": themeModeColours.highlights.activeEditorLineColour,
		"default-highlight-colour": themeModeColours.highlights.defaultColour,
		"button-colour": themeModeColours.advanced.buttonColour,
		"button-active-colour": themeModeColours.advanced.buttonActiveColour,
		"inline-colour": themeModeColours.inline.textColour,
		"inline-colour-active": themeModeColours.inline.activeTextColour,
		"inline-background-colour": themeModeColours.inline.backgroundColour,
		"inline-title-colour": themeModeColours.inline.titleTextColour,
		...Object.entries(themeModeColours.highlights.alternativeHighlights).reduce((result: Record<string,Colour>,[alternativeHighlight,colour]: [string,Colour]): Record<string,Colour> => {
			result[`${alternativeHighlight.replace(/\s+/g,"-").toLowerCase()}-highlight-colour`] = colour;
			return result;
		},{})
	}).reduce((result: string, [cssVariable,colour]: [string,Colour]): string => {
		const styleColour = isCss(colour)?`var(${colour})`:colour;
		return result + `--code-styler-${cssVariable}: ${styleColour};`;
	},"");
}

function styleThemeSettings (themeSettings: CodeStylerThemeSettings, currentTheme: string): string {
	return `
		body.code-styler .code-styler-header-language-tag {
			--code-styler-header-language-tag-text-bold: ${themeSettings.header.languageTag.textBold?"bold":"normal"};
			--code-styler-header-language-tag-text-italic: ${themeSettings.header.languageTag.textItalic?"italic":"normal"};
			font-family: ${themeSettings.header.languageTag.textFont!==""?themeSettings.header.languageTag.textFont:"var(--font-text)"};
		}
		body.code-styler .code-styler-header-text {
			--code-styler-header-title-text-bold: ${themeSettings.header.title.textBold?"bold":"normal"};
			--code-styler-header-title-text-italic: ${themeSettings.header.title.textItalic?"italic":"normal"};
			font-family: ${themeSettings.header.languageTag.textFont!==""?themeSettings.header.languageTag.textFont:"var(--font-text)"};
		}
		body.code-styler {
			--border-radius: ${themeSettings.codeblock.curvature}px;
			--language-icon-size: ${themeSettings.advanced.iconSize}px;
			--gradient-highlights-colour-stop: ${themeSettings.advanced.gradientHighlights?themeSettings.advanced.gradientHighlightsColourStop:"100%"};
			--header-font-size: ${themeSettings.header.fontSize}px;
			--line-wrapping: ${themeSettings.codeblock.unwrapLines?"pre":"pre-wrap"};
			--code-styler-inline-font-weight: ${themeSettings.inline.fontWeight}00;
			--code-styler-inline-border-radius: ${themeSettings.inline.curvature}px;
			--code-styler-inline-padding-vertical: ${themeSettings.inline.paddingVertical}px;
			--code-styler-inline-padding-horizontal: ${themeSettings.inline.paddingHorizontal}px;
			--code-styler-inline-margin-horizontal: ${themeSettings.inline.marginHorizontal}px;
			--code-styler-inline-title-font-weight: ${themeSettings.inline.titleFontWeight}00;
			${!themeSettings.codeblock.wrapLinesActive?"":"--line-active-wrapping: pre-wrap;"}
			${themeSettings.header.languageIcon.displayColour?"":"--icon-filter: grayscale(1);"}
		}
		${THEME_STYLES?.[currentTheme]?.border?`
			.markdown-source-view :not(pre.code-styler-pre) > .code-styler-header-container {
				--code-styler-header-border:`+ //@ts-expect-error Does Exist
					THEME_STYLES[currentTheme].border.style+`;
				--header-separator-width-padding: calc(var(--header-separator-width) - `+ //@ts-expect-error Does Exist
					THEME_STYLES[currentTheme].border.size+`px);
				--folded-bottom-border: var(--code-styler-header-border);
			}
		`:""}
		${THEME_STYLES?.[currentTheme]?.scrollbar?`
			pre.code-styler-pre::-webkit-scrollbar,
			pre.code-styler-pre > code::-webkit-scrollbar {
				width: var(--code-padding);
				height: var(--code-padding);
				background-color: var(--code-styler-codeblock-background-colour);
			}
		`:""}
		${THEME_STYLES?.[currentTheme]?.extra?THEME_STYLES[currentTheme].extra:""}
	`;
}

function styleLanguageColours (themeSettings: CodeStylerThemeSettings, redirectLanguages: Record<string,{colour?: Colour, icon?: string}>, currentTheme: string): string {
	return Object.entries(LANGUAGE_NAMES).reduce((result: string,[languageName, languageDisplayName]: [string,string]): string => {
		if (languageDisplayName in LANGUAGE_COLOURS || (languageName in redirectLanguages && "colour" in redirectLanguages[languageName])) {
			result += `
				.language-${languageName} {
					--language-border-colour: ${redirectLanguages?.[languageName]?.["colour"] ?? LANGUAGE_COLOURS[languageDisplayName]};
					--language-border-width: ${themeSettings.advanced.languageBorderColour?themeSettings.advanced.languageBorderWidth:0}px;
				}
			`;
			if (THEME_STYLES?.[currentTheme]?.border) {
				result += `
					.markdown-source-view :not(pre.code-styler-pre) > .code-styler-header-container.language-${languageName}  {
						--language-border-width: ${ //@ts-expect-error Does exist
	themeSettings.advanced.languageBorderColour?themeSettings.advanced.languageBorderWidth+THEME_STYLES[currentTheme].border.size:0}px;
					}`;
			}
		}
		return result;
	},"");
}

function addThemeSettingsClasses (themeSettings: CodeStylerThemeSettings): void {
	themeSettings.codeblock.lineNumbers ? document.body.classList.add("code-styler-show-line-numbers") : document.body.classList.remove("code-styler-show-line-numbers");
	themeSettings.gutter.highlight ? document.body.classList.add("code-styler-gutter-highlight") : document.body.classList.remove("code-styler-gutter-highlight");
	themeSettings.gutter.activeLine ? document.body.classList.add("code-styler-gutter-active-line") : document.body.classList.remove("code-styler-gutter-active-line");
	
	document.body.classList.remove("code-styler-active-line-highlight","code-styler-active-line-highlight-codeblock","code-styler-active-line-highlight-editor"); //TODO (@mayurankv) Is this section necessary? Is this function necessary?
	if (themeSettings.highlights.activeEditorLine && themeSettings.highlights.activeCodeblockLine) // Inside and outside of codeblocks with different colours
		document.body.classList.add("code-styler-active-line-highlight");
	else if (themeSettings.highlights.activeEditorLine && !themeSettings.highlights.activeCodeblockLine) // Only outside codeblocks
		document.body.classList.add("code-styler-active-line-highlight-editor");
	else if (!themeSettings.highlights.activeEditorLine && themeSettings.highlights.activeCodeblockLine) // Only inside codeblocks
		document.body.classList.add("code-styler-active-line-highlight-codeblock");
}

export function removeStylesAndClasses(): void {
	document.getElementById(STYLE_ID)?.remove();
	document.body.classList.remove(
		"code-styler",
		"code-styler-show-line-numbers",
		"code-styler-gutter-highlight",
		"code-styler-gutter-active-line",
	);
}

function getCurrentTheme(app: App): string {
	//@ts-expect-error Undocumented Obsidian API
	return app.vault.getConfig("cssTheme");
}
