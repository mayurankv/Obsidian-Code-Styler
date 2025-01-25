import { Colour } from "./decoration";

export type Percentage = `${number}%`;
export type Display = "none" | "if_header_shown" | "always";

export interface CodeStylerThemeModeColours {
	codeblock: {
		backgroundColour: Colour;
		textColour: Colour;
	},
	gutter: {
		backgroundColour: Colour;
		textColour: Colour;
		activeTextColour: Colour;
	},
	header: {
		backgroundColour: Colour;
		title: {
			textColour: Colour;
		},
		languageTag: {
			backgroundColour: Colour;
			textColour: Colour;
		},
		externalReference: {
			displayRepositoryColour: Colour;
			displayVersionColour: Colour;
			displayTimestampColour: Colour;
		}
		lineColour: Colour;
	},
	highlights: {
		activeCodeblockLineColour: Colour;
		activeEditorLineColour: Colour;
		defaultColour: Colour;
		alternativeHighlights: Record<string,Colour>;
	},
	inline: {
		backgroundColour: Colour;
		textColour: Colour;
		activeTextColour: Colour;
		titleTextColour: Colour
	}
	advanced: {
		buttonColour: Colour;
		buttonActiveColour: Colour;
	}
}
export interface CodeStylerThemeSettings {
	codeblock: {
		lineNumbers: boolean;
		unwrapLines: boolean;
		wrapLinesActive: boolean;
		curvature: number;
	},
	gutter: {
		highlight: boolean;
		activeLine: boolean;
	},
	header: {
		title: {
			textFont: string;
			textBold: boolean;
			textItalic: boolean;
		},
		languageTag: {
			display: Display;
			textFont: string;
			textBold: boolean;
			textItalic: boolean;
		},
		languageIcon: {
			display: Display;
			displayColour: boolean;
		},
		externalReference: {
			displayRepository: boolean;
			displayVersion: boolean;
			displayTimestamp: boolean;
		}
		fontSize: number;
		foldPlaceholder: string;
	},
	highlights: {
		activeCodeblockLine: boolean;
		activeEditorLine: boolean;
	},
	inline: {
		syntaxHighlight: boolean;
		style: boolean;
		fontWeight: number;
		curvature: number;
		paddingVertical: number;
		paddingHorizontal: number;
		marginHorizontal: number;
		titleFontWeight: number;
	},
	advanced: {
		gradientHighlights: boolean;
		gradientHighlightsColourStop: Percentage;
		languageBorderColour: boolean;
		languageBorderWidth: number;
		iconSize: number;
	};
}
export interface CodeStylerThemeColours {
	light: CodeStylerThemeModeColours;
	dark: CodeStylerThemeModeColours;
}
export interface CodeStylerTheme {
	settings: CodeStylerThemeSettings;
	colours: CodeStylerThemeColours;
}
export interface CodeStylerSettings {
	themes: Record<string,CodeStylerTheme>;
	selectedTheme: string;
	currentTheme: CodeStylerTheme;
	newTheme: string;
	newHighlight: string;
	exampleCodeblockParameters: string;
	exampleCodeblockContent: string;
	exampleInlineCode: string;
	decoratePrint: boolean;
	excludedLanguages: string;
	externalReferenceUpdateOnLoad: boolean;
	processedCodeblocksWhitelist: string;
	redirectLanguages: Record<string,{colour?: Colour, icon?: string}>;
	version: string;
}
