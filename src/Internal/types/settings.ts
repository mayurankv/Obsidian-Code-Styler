import { Colour, CSS, FontFamily, FontStyle, FontWeight, Percentage, Size, Filter } from "./decoration";
import { LineUnwrap } from "./parsing";

export interface ElementStyles {
	backgroundColour: Colour;
}

export interface TextStyles {
	textColour: Colour;
	fontFamily: FontFamily;
	fontStyle: FontStyle;
	fontWeight: FontWeight;
}

export interface TextElementStyles extends TextStyles, ElementStyles {

}

export interface ActiveTextElementStyles extends TextElementStyles {
	activeTextColour: Colour,
}

export interface GutterStyles extends ActiveTextElementStyles {
	languageBorderSize: Size,
	borderColour: Colour,
	borderWidth: Size,
}

export interface IconStyles {
	size: Size;
	grayScale: Filter;
}

export interface ExternalReferenceStyles extends TextElementStyles {
	repositoryColour: Colour;
	versionColour: Colour;
	timestampColour: Colour;
}

export interface HeaderStyles extends ElementStyles {
	icon: IconStyles,
	languageTitle: TextElementStyles;
	namedTitle: TextElementStyles;
	externalReferenceTitle: ExternalReferenceStyles;
	executeCodeTitle: TextElementStyles;
	separator: ElementStyles;
}

export interface HighlightsStyles {
	activeLineColour: Colour;
	defaultHighlightColour: Colour;
	alternativeHighlightColours: Record<string, Colour>;
	gradientHighlightsColourStop: Percentage;
}

export interface ButtonStyle extends ElementStyles {
	colour: Colour;
}

export interface ButtonStyles {
	inactive: ButtonStyle;
	hover: ButtonStyle;
	active: ButtonStyle;
}

export interface CodeStyles extends ElementStyles {
	textColour: Colour,
	curvature: number | CSS;
	header: HeaderStyles;
	button: ButtonStyles;
}

export interface FenceStyles extends CodeStyles {
	fadeWidth: Size,
	fadeGradientStop: Percentage,
	gutter: GutterStyles;
	highlights: HighlightsStyles;
}

export interface InlineStyles extends CodeStyles {
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
