import { Colour, CSS, FontFamily, FontStyle, FontWeight, Percentage, Size } from "./decoration";
import { LineUnwrap } from "./parsing";

// export type Display = "none" | "if_header_shown" | "always";

interface ElementStyles {
	backgroundColour: Colour;
}

interface TextStyles extends ElementStyles {
	textColour: Colour;
	fontFamily: FontFamily;
	fontStyle: FontStyle;
	fontWeight: FontWeight;
}

interface TextElementStyles extends TextStyles, ElementStyles {

}

interface ActiveTextElementStyles extends TextElementStyles {
	activeTextColour: Colour,
}

interface GutterStyles extends ActiveTextElementStyles {
	languageBorderSize: Size,
}

interface IconStyles {
	size: Size;
	grayScale: Boolean;
}

interface ExternalReferenceStyles extends TextElementStyles {
	repositoryColour: Colour;
	versionColour: Colour;
	timestampColour: Colour;
}

interface HeaderStyles extends ElementStyles {
	icon: IconStyles,
	languageTitle: TextElementStyles;
	namedTitle: TextElementStyles;
	externalReferenceTitle: ExternalReferenceStyles;
	executeCodeTitle: TextElementStyles;
	separator: ElementStyles;
}

interface HighlightsStyles {
	activeLineColour: Colour;
	defaultHighlightColour: Colour;
	alternativeHighlightColours: Record<string, Colour>;
	gradientHighlightsColourStop: Percentage;
}

interface ButtonStyle extends ElementStyles {
	colour: Colour;
}

interface ButtonStyles {
	inactive: ButtonStyle;
	hover: ButtonStyle;
	active: ButtonStyle;
}

interface CodeStyles extends ElementStyles {
	curvature: number | CSS;
	header: HeaderStyles;
	button: ButtonStyles;
}

interface FenceStyles extends CodeStyles {
	gutter: GutterStyles;
	highlights: HighlightsStyles;
}

interface InlineStyles extends CodeStyles {
	parameters: TextStyles,
}

export interface CodeStylerThemeModeStyles {
	fence: FenceStyles;
	inline: InlineStyles;
}

export interface CodeStylerThemeStyles {
	light: CodeStylerThemeModeStyles;
	dark: CodeStylerThemeModeStyles;
}

interface HeaderSettings {
	display: {
		icon: boolean | null,
		languageTitle: boolean | null,
		namedTitle: boolean | null,
		externalReferenceTitle: {
			repository: boolean | null;
			version: boolean | null;
			timestamp: boolean | null;
		},
		executeCodeTitle: boolean | null,
		separator: boolean | null,
	};

}

interface CodeSettings {
	syntaxHighlight: boolean;
	header: HeaderSettings;
}

interface FenceSettings extends CodeSettings {
	foldPlaceholder: string;
	lineUnwrap: LineUnwrap
	gutter: {
		lineNumbers: boolean,
		languageBorder: boolean,
		highlight: boolean,
	}
	highlights: {
		active: "editor" | "fence" | false,
	};
}

interface inlineSettings extends CodeSettings {

}

export interface CodeStylerThemeSettings {
	fence: FenceSettings;
	inline: inlineSettings;
}

export interface CodeStylerTheme {
	settings: CodeStylerThemeSettings;
	colours: CodeStylerThemeStyles;
}

type CodeStylerThemes = Record<string, CodeStylerTheme>

export interface CodeStylerSettings {
	detecting: {
		languages: {
			addedLanguages: Record<string, { colour?: Colour, icon?: string }>;
			processedCodeblocksWhitelist: string;
			blacklist: string;
		}
		contexts: {
			admonition: boolean;
			canvas: boolean;
			slides: boolean;
			export: boolean;
		};
	};
	decorating: {
		theme: string;
		themes: CodeStylerThemes;
	};
	settings: {
		examples: {
			fence: {
				content: string;
				parameters: string;
			};
			inline: {
				content: string;
				parameters: string;
			};
		};
	};
	reference: {
		updateExternalOnLoad: boolean;
	};

	internal: {
		version: string;
		themes: CodeStylerThemes;
	};
}

export interface CodeStylerTemporarySettings {
	newTheme: string;
	newHighlight: string;
}
