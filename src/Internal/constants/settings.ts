import { ButtonStyles, CodeStylerSettings, CodeStylerTheme, CodeStylerThemeModeStyles, CodeStylerThemeSettings, CodeStyles, ElementStyles, HeaderStyles, IconStyles, TextStyles } from "../types/settings";
import { FOLD_PLACEHOLDER } from "./decoration";
import { EXAMPLE_CODEBLOCK_CONTENT as EXAMPLE_FENCE_CODE_CONTENT, EXAMPLE_CODEBLOCK_PARAMETERS as EXAMPLE_FENCE_CODE_PARAMETERS, EXAMPLE_INLINE_CODE_CONTENT, EXAMPLE_INLINE_CODE_PARAMETERS } from "./interface";
import { convertColoursToTheme, THEME_COLOURS } from "./themes";

export const USE_SHIKI = false;

const BASE_ELEMENT_STYLES: ElementStyles = {
	backgroundColour: "--code-background"
}
const BASE_TEXT_STYLES: TextStyles = {
	textColour: "--code-comment",
	fontFamily: "--font-monospace",
	fontStyle: "normal",
	fontWeight: "--font-weight",
}

const BASE_ICON_STYLES: IconStyles = {
	size: "auto",
	grayScale: "none"
}

const BASE_BUTTON_STYLES: ButtonStyles = {
	inactive: {
		backgroundColour: "transparent",
		colour: "--code-comment",
	},
	hover: {
		backgroundColour: "--background-modifier-hover",
		colour: "--code-normal",
	},
	active: {
		backgroundColour: "--background-modifier-hover",
		colour: "--code-normal",
	},
}

const BASE_HEADER_STYLES: HeaderStyles = {
	...BASE_ELEMENT_STYLES,
	icon: BASE_ICON_STYLES,
	languageTitle: {
		backgroundColour: "inherit",
		...BASE_TEXT_STYLES,
		fontWeight: "--bold-weight",
	},
	namedTitle: {
		backgroundColour: "inherit",
		...BASE_TEXT_STYLES,
	},
	externalReferenceTitle: {
		backgroundColour: "inherit",
		...BASE_TEXT_STYLES,
		repositoryColour: "--sync-avatar-color-5",
		versionColour: "--sync-avatar-color-8",
		timestampColour: "--sync-avatar-color-3",
	},
	executeCodeTitle: {
		backgroundColour: "inherit",
		...BASE_TEXT_STYLES,
	},
	separator: {
		backgroundColour: "--color-base-30",
	},
}

const BASE_CODE_STYLES: CodeStyles = {
	...BASE_ELEMENT_STYLES,
	textColour: "--code-normal",
	curvature: "--code-radius",
	header: BASE_HEADER_STYLES,
	button: BASE_BUTTON_STYLES,
}

export const BASE_THEME_MODE_STYLES: CodeStylerThemeModeStyles = {
	fence: {
		...BASE_CODE_STYLES,
		fadeWidth: "--size-4-3",
		fadeGradientStop: "10%",
		header: {
			...BASE_HEADER_STYLES,
			icon: {
				...BASE_ICON_STYLES,
				size: "--icon-xl",
			}
		},
		gutter: {
			...BASE_ELEMENT_STYLES,
			...BASE_TEXT_STYLES,
			activeTextColour: "--code-normal",
			languageBorderSize: "--size-4-1",
			borderColour: "--cs-fence-background-colour",
			borderWidth: "--size-2-1",
		},
		highlights: {
			activeLineColour: "--background-modifier-hover",
			defaultHighlightColour: "--text-highlight-bg",
			alternativeHighlightColours: {},
			gradientHighlightsColourStop: "30%",
		},
	},
	inline: {
		...BASE_CODE_STYLES,
		parameters: BASE_TEXT_STYLES,
	},
}


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
