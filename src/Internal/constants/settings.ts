import { CodeStylerSettings, CodeStylerTheme, CodeStylerThemeSettings } from "../types/settings";
import { FOLD_PLACEHOLDER } from "./decoration";
import { EXAMPLE_CODEBLOCK_CONTENT as EXAMPLE_FENCE_CODE_CONTENT, EXAMPLE_CODEBLOCK_PARAMETERS as EXAMPLE_FENCE_CODE_PARAMETERS, EXAMPLE_INLINE_CODE_CONTENT, EXAMPLE_INLINE_CODE_PARAMETERS } from "./interface";
import { convertColoursToTheme, THEME_COLOURS } from "./themes";

export const USE_SHIKI = false;

const HEADER_DISPLAY_SETTINGS = {
	icon: true,
	languageTitle: true,
	namedTitle: true,
	externalReferenceTitle: {
		repository: true,
		version: true,
		timestamp: true,
	},
	executeCodeTitle: true,
	separator: true,
}

export const THEME_DEFAULT_SETTINGS: CodeStylerThemeSettings = {
	fence: {
		syntaxHighlight: true,
		header: {
			display: HEADER_DISPLAY_SETTINGS,
		},
		foldPlaceholder: FOLD_PLACEHOLDER,
		lineUnwrap: true,
		gutter: {
			lineNumbers: true,
			languageBorder: false,
			highlight: true,
		},
		highlights: {
			active: false,
		},
	},
	inline: {
		syntaxHighlight: true,
		header: {
			display: HEADER_DISPLAY_SETTINGS,
		},
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
export const PROCESSED_CODEBLOCKS_WHITELIST = "run-*, include";
export const BLACKLIST = "";

export const DEFAULT_SETTINGS: CodeStylerSettings = {
	detecting: {
		languages: {
			addedLanguages: {},
			processedCodeblocksWhitelist: PROCESSED_CODEBLOCKS_WHITELIST,
			blacklist: BLACKLIST,
		},
		contexts: {
			admonition: true,
			canvas: true,
			slides: true,
			export: true,
		},
	},
	decorating: {
		theme: "default",
		themes: {},
	},
	settings: {
		examples: {
			fence: {
				content: EXAMPLE_FENCE_CODE_CONTENT,
				parameters: EXAMPLE_FENCE_CODE_PARAMETERS,
			},
			inline: {
				content: EXAMPLE_INLINE_CODE_CONTENT,
				parameters: EXAMPLE_INLINE_CODE_PARAMETERS,
			},
		},
	},
	reference: {
		updateExternalOnLoad: true,
	},

	internal: {
		version: "1.1.7",
		themes: INBUILT_THEMES,
	}
};
