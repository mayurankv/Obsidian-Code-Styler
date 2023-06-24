// Color Typing
export type HEX = `#${string}`;
// export type RGB = `rgb(${number}, ${number}, ${number})`;
// export type RGBA = `rgba(${number},${number},${number},${number})`;
// export type HSL = `hsl(${number},${number}%,${number}%)`;
// export type HSLA = `hsl(${number},${number}%,${number}%,${number})`;
export type CSS = `--${string}`;
export type Color = HEX | CSS;
export type Percentage = `${number}%`;
export type Display = "none" | "title_only" | "always";

// Interface Creation
export interface CodeblockCustomizerThemeModeColors {
	codeblock: {
		backgroundColor: Color;
		textColor: Color;
	},
	gutter: {
		backgroundColor: Color;
		textColor: Color;
	},
	header: {
		backgroundColor: Color;
		title: {
			textColor: Color;
		},
		languageTag: {
			backgroundColor: Color;
			textColor: Color;
		},
		lineColor: Color;
	},
	highlights: {
		activeCodeblockLineColor: Color;
		activeEditorLineColor: Color;
		defaultColor: Color;
		alternativeHighlights: Record<string,Color>;
	},
}
export interface CodeblockCustomizerThemeSettings {
	codeblock: {
		lineNumbers: boolean;
		curvature: number;
	},
	gutter: {
		highlight: boolean;
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
			displayColor: boolean;
		},
		collapsePlaceholder: string;
	},
	highlights: {
		activeCodeblockLine: boolean;
		activeEditorLine: boolean;
	},
	advanced: {
		gradientHighlights: boolean;
		gradientHighlightsColorStop: Percentage;
		languageBorderColor: boolean;
		iconSize: number;
	};
}
export interface CodeblockCustomizerThemeColors {
	light: CodeblockCustomizerThemeModeColors;
	dark: CodeblockCustomizerThemeModeColors;
}
export interface CodeblockCustomizerTheme {
	settings: CodeblockCustomizerThemeSettings;
	colors: CodeblockCustomizerThemeColors;
}
export interface CodeblockCustomizerSettings {
	themes: Record<string,CodeblockCustomizerTheme>;
	selectedTheme: string;
	defaultTheme: string;
	currentTheme: CodeblockCustomizerTheme;
	newTheme: {
		name: string;
		default: boolean;
	},
	newHighlight: string;
	excludedLanguages: string;
}

// Theme Defaults
export const NEW_THEME_DEFAULT: {name: string, default: boolean} = {
	name: '',
	default: false,
}
const THEME_DEFAULT_SETTINGS: CodeblockCustomizerThemeSettings = {
	codeblock: {
		lineNumbers: true,
		curvature: 10,
	},
	gutter: {
		highlight: true,
	},
	header: {
		title: {
			textFont: '',
			textBold: false,
			textItalic: false,
		},
		languageTag: {
			display: "always",
			textFont: '',
			textBold: true,
			textItalic: true,
		},
		languageIcon: {
			display: "always",
			displayColor: true,
		},
		collapsePlaceholder: '',
	},
	highlights: {
		activeCodeblockLine: true,
		activeEditorLine: false,
	},
	advanced: {
		gradientHighlights: false,
		gradientHighlightsColorStop: '70%',
		languageBorderColor: false,
		iconSize: 28,
	},
}
export const THEME_FALLBACK_COLORS: CodeblockCustomizerThemeModeColors = {
	codeblock: {
		backgroundColor: '--code-background',
		textColor: '--code-normal',
	},
	gutter: {
		backgroundColor: '--code-background',
		textColor: '--code-comment',
	},
	header: {
		backgroundColor: '--code-background',
		title: {
			textColor: '--code-comment',
		},
		languageTag: {
			backgroundColor: '--code-background',
			textColor: '--code-comment',
		},
		lineColor: '--code-background',
	},
	highlights: {
		activeCodeblockLineColor: '--color-base-30',
		activeEditorLineColor: '--color-base-20',
		defaultColor: '--text-highlight-bg',
		alternativeHighlights: {},
	},
}

// Theme Creation
const DEFAULT_THEME: CodeblockCustomizerTheme = {
	settings: THEME_DEFAULT_SETTINGS,
	colors: {
		light: THEME_FALLBACK_COLORS,
		dark: THEME_FALLBACK_COLORS,
	},
}
const SOLARIZED_THEME: CodeblockCustomizerTheme = {
	settings: THEME_DEFAULT_SETTINGS,
	colors: {
		light: {
			codeblock: {
				backgroundColor: '#FCF6E4',
				textColor: '#bababa',
			},
			gutter: {
				backgroundColor: '#EDE8D6',
				textColor: '#6c6c6c',
			},
			header: {
				backgroundColor: '#D5CCB4',
				title: {
					textColor: '#866704',
				},
				languageTag: {
					backgroundColor: '#B8B5AA',
					textColor: '#C25F30',
				},
				lineColor: '#EDD489',
			},
			highlights: {
				activeCodeblockLineColor: '#EDE8D6',
				activeEditorLineColor: '#60460633',
				defaultColor: '#E9DFBA',
				alternativeHighlights: {},
			},
		},
		dark: {
			codeblock: {
				backgroundColor: '#002b36',
				textColor: '#bababa',
			},
			gutter: {
				backgroundColor: '#073642',
				textColor: '#6c6c6c',
			},
			header: {
				backgroundColor: '#0a4554',
				title: {
					textColor: '#dadada',
				},
				languageTag: {
					backgroundColor: '#008080',
					textColor: '#000000',
				},
				lineColor: '#46cced',
			},
			highlights: {
				activeCodeblockLineColor: '#073642',
				activeEditorLineColor: '#468eeb33',
				defaultColor: '#054b5c',
				alternativeHighlights: {},
			},
		},
	},
}

// Plugin default settings
export const DEFAULT_SETTINGS: CodeblockCustomizerSettings = {
	themes: {
		'Default': DEFAULT_THEME,
		'Solarized': SOLARIZED_THEME,
	},
	selectedTheme: 'Default',
	defaultTheme: 'Default',
	currentTheme: structuredClone(DEFAULT_THEME),
	newTheme: NEW_THEME_DEFAULT,
	newHighlight: '',
	excludedLanguages: "dataview, dataviewjs, ad-*",
}
