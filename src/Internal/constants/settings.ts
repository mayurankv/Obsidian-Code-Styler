import { CodeStylerSettings, CodeStylerTheme, CodeStylerThemeModeColours, CodeStylerThemeSettings } from "../types/settings";
import { EXAMPLE_CODEBLOCK_CONTENT, EXAMPLE_CODEBLOCK_PARAMETERS, EXAMPLE_INLINE_CODE } from "./interface";

export const LOCAL_PREFIX = "@/";

const THEME_DEFAULT_SETTINGS: CodeStylerThemeSettings = {
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
export const THEME_FALLBACK_COLOURS: CodeStylerThemeModeColours = {
	codeblock: {
		backgroundColour: "--code-background",
		textColour: "--code-normal",
	},
	gutter: {
		backgroundColour: "--code-background",
		textColour: "--text-faint",
		activeTextColour: "--text-muted",
	},
	header: {
		backgroundColour: "--code-background",
		title: {
			textColour: "--code-comment",
		},
		languageTag: {
			backgroundColour: "--code-background",
			textColour: "--code-comment",
		},
		externalReference: {
			displayRepositoryColour: "#00FFFF",
			displayVersionColour: "#FF00FF",
			displayTimestampColour: "#808080",
		},
		lineColour: "--color-base-30",
	},
	highlights: {
		activeCodeblockLineColour: "--color-base-30",
		activeEditorLineColour: "--color-base-20",
		defaultColour: "--text-highlight-bg",
		alternativeHighlights: {},
	},
	inline: {
		backgroundColour: "--code-background",
		textColour: "--code-normal",
		activeTextColour: "--code-normal",
		titleTextColour: "--code-comment",
	},
	advanced: {
		buttonColour: "--text-muted",
		buttonActiveColour: "--text-normal",
	}
};

const DEFAULT_THEME: CodeStylerTheme = {
	settings: THEME_DEFAULT_SETTINGS,
	colours: {
		light: THEME_FALLBACK_COLOURS,
		dark: THEME_FALLBACK_COLOURS,
	},
};

export const INBUILT_THEMES: Record<string,CodeStylerTheme> = {
	"Default": DEFAULT_THEME,
	//TODO: Add Other Themes
};

export const EXCLUDED_LANGUAGES = "ad-*, reference";
export const WHITELIST_CODEBLOCKS = "run-*, include";
export const SPECIAL_LANGUAGES = ["^reference$","^foofoo","^preview$","^include$","^output$","^run-.+$"];

export const DECORATE_ON_PRINT = true
export const EXTERNAL_REFERENCE_UPDATE_ON_LOAD = false

export const DEFAULT_SETTINGS: CodeStylerSettings = {
	themes: structuredClone(INBUILT_THEMES),
	selectedTheme: "Default",
	currentTheme: structuredClone(DEFAULT_THEME),
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
