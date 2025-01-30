import { CodeStylerSettings, CodeStylerTheme, CodeStylerThemeSettings } from "../types/settings";
import { EXAMPLE_CODEBLOCK_CONTENT, EXAMPLE_CODEBLOCK_PARAMETERS, EXAMPLE_INLINE_CODE } from "./interface";
import { convertColoursToTheme, THEME_COLOURS } from "./themes";

export const USE_SHIKI = true;

export const THEME_DEFAULT_SETTINGS: CodeStylerThemeSettings = {
	codeblock: {
		lineNumbers: true,
		unwrapLines: true,
		wrapLinesActive: false,
		curvature: 4,
	},
	gutter: {
		highlight: true,
		activeLine: false,
	},
	header: {
		title: {
			textFont: "",
			textBold: false,
			textItalic: true,
		},
		languageTag: {
			display: "none",
			textFont: "",
			textBold: true,
			textItalic: false,
		},
		languageIcon: {
			display: "none",
			displayColour: true,
		},
		externalReference: {
			displayRepository: true,
			displayVersion: true,
			displayTimestamp: true,
		},
		fontSize: 14,
		foldPlaceholder: "",
	},
	highlights: {
		activeCodeblockLine: false,
		activeEditorLine: false,
	},
	inline: {
		syntaxHighlight: true,
		style: true,
		fontWeight: 4,
		curvature: 6,
		paddingVertical: 5,
		paddingHorizontal: 5,
		marginHorizontal: 0,
		titleFontWeight: 8,
	},
	advanced: {
		gradientHighlights: false,
		gradientHighlightsColourStop: "70%",
		languageBorderColour: false,
		languageBorderWidth: 5,
		iconSize: 28,
	},
};

export const INBUILT_THEMES: Record<string, CodeStylerTheme> = Object.fromEntries(Object.keys(THEME_COLOURS).map(
	(theme) => [
		theme,
		{
			settings: THEME_DEFAULT_SETTINGS,
			colours: {
				light: convertColoursToTheme(theme, "light"),
				dark: convertColoursToTheme(theme, "dark"),
			}
		}
	]),
);

export const EXCLUDED_LANGUAGES = "ad-*";
export const WHITELIST_CODEBLOCKS = "run-*, include";
export const SPECIAL_LANGUAGES = ["^reference$","^preview$","^include$","^output$","^run-.+$"];

export const DECORATE_ON_PRINT = true
export const EXTERNAL_REFERENCE_UPDATE_ON_LOAD = false

export const DEFAULT_SETTINGS: CodeStylerSettings = {
	themes: structuredClone(INBUILT_THEMES),
	selectedTheme: "Default",
	currentTheme: structuredClone(INBUILT_THEMES["default"]),
	newTheme: "",
	newHighlight: "",
	exampleCodeblockParameters: EXAMPLE_CODEBLOCK_PARAMETERS,
	exampleCodeblockContent: EXAMPLE_CODEBLOCK_CONTENT,
	exampleInlineCode: EXAMPLE_INLINE_CODE,
	decoratePrint: DECORATE_ON_PRINT,
	excludedLanguages: EXCLUDED_LANGUAGES,
	externalReferenceUpdateOnLoad: EXTERNAL_REFERENCE_UPDATE_ON_LOAD,
	processedCodeblocksWhitelist: WHITELIST_CODEBLOCKS,
	redirectLanguages: {},
	version: "1.1.7",
};
