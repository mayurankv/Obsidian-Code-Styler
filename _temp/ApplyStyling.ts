// import { LANGUAGES, OBSIDIAN_THEME_STYLES } from "src/Internal/constants/decoration";
// import { LANGUAGE_NAMES } from "src/Internal/constants/parsing";
// import { isCss } from "src/Internal/Decorating/css";
// import { CodeStylerThemeStyles, CodeStylerThemeModeStyles, CodeStylerThemeSettings, Colour } from "src/Internal/types/settings";

function styleThemeColours (themeColours: CodeStylerThemeStyles): string {
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

// function getThemeColours (themeModeColours: CodeStylerThemeModeStyles): string {
// 	return Object.entries({
// 		"codeblock-background-colour": themeModeColours.codeblock.backgroundColour,
// 		"codeblock-text-colour": themeModeColours.codeblock.textColour,
// 		"gutter-background-colour": themeModeColours.gutter.backgroundColour,
// 		"gutter-text-colour": themeModeColours.gutter.textColour,
// 		"gutter-active-text-colour": themeModeColours.gutter.activeTextColour,
// 		"header-background-colour": themeModeColours.header.backgroundColour,
// 		"header-title-text-colour": themeModeColours.header.title.textColour,
// 		"header-language-tag-background-colour": themeModeColours.header.languageTag.backgroundColour,
// 		"header-language-tag-text-colour": themeModeColours.header.languageTag.textColour,
// 		"header-separator-colour": themeModeColours.header.lineColour,
// 		"header-external-reference-repository": themeModeColours.header.externalReference.displayRepositoryColour,
// 		"header-external-reference-version": themeModeColours.header.externalReference.displayVersionColour,
// 		"header-external-reference-timestamp": themeModeColours.header.externalReference.displayTimestampColour,
// 		"active-codeblock-line-colour": themeModeColours.highlights.activeCodeblockLineColour,
// 		"active-editor-line-colour": themeModeColours.highlights.activeEditorLineColour,
// 		"default-highlight-colour": themeModeColours.highlights.defaultColour,
// 		"button-colour": themeModeColours.advanced.buttonColour,
// 		"button-active-colour": themeModeColours.advanced.buttonActiveColour,
// 		"inline-colour": themeModeColours.inline.textColour,
// 		"inline-colour-active": themeModeColours.inline.activeTextColour,
// 		"inline-background-colour": themeModeColours.inline.backgroundColour,
// 		"inline-title-colour": themeModeColours.inline.titleTextColour,
// 		...Object.entries(themeModeColours.highlights.alternativeHighlights).reduce((result: Record<string,Colour>,[alternativeHighlight,colour]: [string,Colour]): Record<string,Colour> => {
// 			result[`${alternativeHighlight.replace(/\s+/g,"-").toLowerCase()}-highlight-colour`] = colour;
// 			return result;
// 		},{})
// 	}).reduce((result: string, [cssVariable,colour]: [string,Colour]): string => {
// 		const styleColour = isCss(colour)?`var(${colour})`:colour;
// 		return result + `--code-styler-${cssVariable}: ${styleColour};`;
// 	},"");
// }

// function styleThemeSettings (themeSettings: CodeStylerThemeSettings, currentTheme: string): string {
// 	return `
// 		body.code-styler .code-styler-header-language-tag {
// 			--code-styler-header-language-tag-text-bold: ${themeSettings.header.languageTag.textBold?"bold":"normal"};
// 			--code-styler-header-language-tag-text-italic: ${themeSettings.header.languageTag.textItalic?"italic":"normal"};
// 			font-family: ${themeSettings.header.languageTag.textFont!==""?themeSettings.header.languageTag.textFont:"var(--font-text)"};
// 		}
// 		body.code-styler .code-styler-header-text {
// 			--code-styler-header-title-text-bold: ${themeSettings.header.title.textBold?"bold":"normal"};
// 			--code-styler-header-title-text-italic: ${themeSettings.header.title.textItalic?"italic":"normal"};
// 			font-family: ${themeSettings.header.languageTag.textFont!==""?themeSettings.header.languageTag.textFont:"var(--font-text)"};
// 		}
// 		body.code-styler {
// 			--border-radius: ${themeSettings.codeblock.curvature}px;
// 			--language-icon-size: ${themeSettings.advanced.iconSize}px;
// 			--gradient-highlights-colour-stop: ${themeSettings.advanced.gradientHighlights?themeSettings.advanced.gradientHighlightsColourStop:"100%"};
// 			--header-font-size: ${themeSettings.header.fontSize}px;
// 			--line-wrapping: ${themeSettings.codeblock.unwrapLines?"pre":"pre-wrap"};
// 			=--code-styler-inline-font-weight: ${themeSettings.inline.fontWeight}00;
// 			--code-styler-inline-border-radius: ${themeSettings.inline.curvature}px;
// 			--code-styler-inline-padding-vertical: ${themeSettings.inline.paddingVertical}px;
// 			--code-styler-inline-padding-horizontal: ${themeSettings.inline.paddingHorizontal}px;
// 			--code-styler-inline-margin-horizontal: ${themeSettings.inline.marginHorizontal}px;
// 			--code-styler-inline-title-font-weight: ${themeSettings.inline.titleFontWeight}00;
// 			${!themeSettings.codeblock.wrapLinesActive?"":"--line-active-wrapping: pre-wrap;"}
// 			${themeSettings.header.languageIcon.displayColour?"":"--icon-filter: grayscale(1);"}
// 		}
// 		${OBSIDIAN_THEME_STYLES?.[currentTheme]?.border?`
// 			.markdown-source-view :not(pre.code-styler-pre) > .code-styler-header-container {
// 				--code-styler-header-border:`+ //@ts-expect-error Does Exist
// 					THEME_STYLES[currentTheme].border.style+`;
// 				--header-separator-width-padding: calc(var(--header-separator-width) - `+ //@ts-expect-error Does Exist
// 					THEME_STYLES[currentTheme].border.size+`px);
// 				--folded-bottom-border: var(--code-styler-header-border);
// 			}
// 		`:""}
// 		${OBSIDIAN_THEME_STYLES?.[currentTheme]?.scrollbar?`
// 			pre.code-styler-pre::-webkit-scrollbar,
// 			pre.code-styler-pre > code::-webkit-scrollbar {
// 				width: var(--code-padding);
// 				height: var(--code-padding);
// 				background-color: var(--code-styler-codeblock-background-colour);
// 			}
// 		`:""}
// 		${OBSIDIAN_THEME_STYLES?.[currentTheme]?.extra?OBSIDIAN_THEME_STYLES[currentTheme].extra:""}
// 	`;
// }

	// codeblock: {
	// 	lineNumbers: true,
	// 	unwrapLines: true,
	// 	wrapLinesActive: false,
	// },
	// gutter: {
	// 	highlight: true,
	// 	activeLine: false,
	// },
	// header: {
	// 	fontSize: 14,
	// },
	// highlights: {
	// 	activeCodeblockLine: false,
	// 	activeEditorLine: false,
	// },
	// inline: {
	// 	paddingVertical: 5,
	// 	paddingHorizontal: 5,
	// 	marginHorizontal: 0,
	// 	titleFontWeight: 8,
	// },
	// advanced: {
	// 	languageBorderColour: false,
	// 	languageBorderWidth: 5,
	// },
