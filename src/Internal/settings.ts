// Typing
export type HEX = `#${string}`;
export type CSS = `--${string}`;
export type Colour = HEX | CSS;
export type Percentage = `${number}%`;
export type Display = "none" | "if_header_shown" | "always";

// Interface Creation
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

export interface Language {
	icon?: string;
	colour?: Colour;
	inlineComment?: Array<string>;
	blockComment?: Array<{
		open: string;
		close: string;
		continuation?: string; // Default: None
		multiline?: string; // Default: true
	}>;
}

// Theme Defaults
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

// Color Schemes
const SOLARIZED: Record<string,Colour> = {
	"base03": "#002b36",
	"base02": "#073642",
	"base01": "#586e75",
	"base00": "#657b83",
	"base0": "#839496",
	"base1": "#93a1a1",
	"base2": "#eee8d5",
	"base3": "#fdf6e3",
	"yellow": "#b58900",
	"orange": "#cb4b16",
	"red": "#dc322f",
	"magenta": "#d33682",
	"violet": "#6c71c4",
	"blue": "#268bd2",
	"cyan": "#2aa198",
	"green": "#859900",
};
// const CATPUCCIN: Record<string,Colour> = {
// 	latte: {
// 		backgroundColor: "#eff1f5",
// 		foregroundColor: "#4c4f69",
// 		selectionColor: "#acb0be",
// 		cursorColor: "#dc8a78",
// 		cursorAccentColor: "#eff1f5",
// 		colors: {
// 			black: "#5c5f77",
// 			blue: "#1e66f5",
// 			red: "#d20f39",
// 			green: "#40a02b",
// 			yellow: "#df8e1d",
// 			magenta: "#ea76cb",
// 			cyan: "#179299",
// 			white: "#acb0be",
// 			lightBlack: "#6c6f85",
// 			lightWhite: "#bcc0cc",
// 			lightBlue: "#1e66f5",
// 			lightRed: "#d20f39",
// 			lightGreen: "#40a02b",
// 			lightYellow: "#df8e1d",
// 			lightMagenta: "#ea76cb",
// 			lightCyan: "#179299",
// 		},
// 	},
// 	frappé: {
// 		backgroundColor: "#303446",
// 		foregroundColor: "#c6d0f5",
// 		selectionColor: "#626880",
// 		cursorColor: "#f2d5cf",
// 		cursorAccentColor: "#232634",
// 		colors: {
// 			black: "#51576d",
// 			blue: "#8caaee",
// 			red: "#e78284",
// 			green: "#a6d189",
// 			yellow: "#e5c890",
// 			magenta: "#f4b8e4",
// 			cyan: "#81c8be",
// 			white: "#b5bfe2",
// 			lightBlack: "#626880",
// 			lightWhite: "#a5adce",
// 			lightBlue: "#8caaee",
// 			lightRed: "#e78284",
// 			lightGreen: "#a6d189",
// 			lightYellow: "#e5c890",
// 			lightMagenta: "#f4b8e4",
// 			lightCyan: "#81c8be",
// 		},
// 	},
// 	macchiato: {
// 		backgroundColor: "#24273a",
// 		foregroundColor: "#cad3f5",
// 		selectionColor: "#5b6078",
// 		cursorColor: "#f4dbd6",
// 		cursorAccentColor: "#181926",
// 		colors: {
// 			black: "#494d64",
// 			blue: "#8aadf4",
// 			red: "#ed8796",
// 			green: "#a6da95",
// 			yellow: "#eed49f",
// 			magenta: "#f5bde6",
// 			cyan: "#8bd5ca8bd5ca",
// 			white: "#b8c0e0",
// 			lightBlack: "#5b6078",
// 			lightWhite: "#a5adcb",
// 			lightBlue: "#8aadf4",
// 			lightRed: "#ed8796",
// 			lightGreen: "#a6da95",
// 			lightYellow: "#eed49f",
// 			lightMagenta: "#f5bde6",
// 			lightCyan: "#8bd5ca",
// 		},
// 	},
// 	mocha: {
// 		backgroundColor: "#1e1e2e",
// 		foregroundColor: "#cdd6f4",
// 		selectionColor: "#585b70",
// 		cursorColor: "#f5e0dc",
// 		cursorAccentColor: "#11111b",
// 		colors: {
// 			black: "#45475A",
// 			blue: "#89b4fa",
// 			red: "#f38ba8",
// 			green: "#a6e3a1",
// 			yellow: "#f9e2af",
// 			magenta: "#f5c2e7",
// 			cyan: "#94e2d5",
// 			white: "#bac2de",
// 			lightBlack: "#585b70",
// 			lightWhite: "#a6adc8",
// 			lightBlue: "#89b4fa",
// 			lightRed: "#f38ba8",
// 			lightGreen: "#a6e3a1",
// 			lightYellow: "#f9e2af",
// 			lightMagenta: "#f5c2e7",
// 			lightCyan: "#94e2d5",
// 		},
// 	},
// };
// const GRUVBOX: Record<string,Colour> = {
// 	dark0_hard: "#1d2021",
// 	dark0: "#282828",
// 	dark0_soft: "#32302f",
// 	dark1: "#3c3836",
// 	dark2: "#504945",
// 	dark3: "#665c54",
// 	dark4: "#7c6f64",

// 	gray_245: "#928374",
// 	gray_244: "#928374",

// 	light0_hard: "#f9f5d7",
// 	light0: "#fbf1c7",
// 	light0_soft: "#f2e5bc",
// 	light1: "#ebdbb2",
// 	light2: "#d5c4a1",
// 	light3: "#bdae93",
// 	light4: "#a89984",

// 	bright_red: "#fb4934",
// 	bright_green: "#b8bb26",
// 	bright_yellow: "#fabd2f",
// 	bright_blue: "#83a598",
// 	bright_purple: "#d3869b",
// 	bright_aqua: "#8ec07c",
// 	bright_orange: "#fe8019",

// 	neutral_red: "#cc241d",
// 	neutral_green: "#98971a",
// 	neutral_yellow: "#d79921",
// 	neutral_blue: "#458588",
// 	neutral_purple: "#b16286",
// 	neutral_aqua: "#689d6a",
// 	neutral_orange: "#d65d0e",

// 	faded_red: "#9d0006",
// 	faded_green: "#79740e",
// 	faded_yellow: "#b57614",
// 	faded_blue: "#076678",
// 	faded_purple: "#8f3f71",
// 	faded_aqua: "#427b58",
// 	faded_orange: "#af3a03",
// };
// const NORD: Record<string,Colour> = {

// };
// const DRACULA: Record<string,Colour> = {

// };

// Theme Creation
const DEFAULT_THEME: CodeStylerTheme = {
	settings: THEME_DEFAULT_SETTINGS,
	colours: {
		light: THEME_FALLBACK_COLOURS,
		dark: THEME_FALLBACK_COLOURS,
	},
};
const SOLARIZED_THEME: CodeStylerTheme = {
	settings: THEME_DEFAULT_SETTINGS,
	colours: {
		light: {
			codeblock: {
				backgroundColour: SOLARIZED.base3,
				textColour: "#bababa",
			},
			gutter: {
				backgroundColour: SOLARIZED.base2,
				textColour: "#6c6c6c",
				activeTextColour: "#8c8c8c",
			},
			header: {
				backgroundColour: "#D5CCB4",
				title: {
					textColour: "#866704",
				},
				languageTag: {
					backgroundColour: "#B8B5AA",
					textColour: "#C25F30",
				},
				externalReference: {
					displayRepositoryColour: "#941100",
					displayVersionColour: "#ff9300",
					displayTimestampColour: "#808080",
				},
				lineColour: "#EDD489",
			},
			highlights: {
				activeCodeblockLineColour: SOLARIZED.base2,
				activeEditorLineColour: "#60460633",
				defaultColour: "#E9DFBA",
				alternativeHighlights: {},
			},
			inline: {
				backgroundColour: SOLARIZED.base3,
				textColour: "#bababa",
				activeTextColour: "#bababa",
				titleTextColour: "#C25F30",
			},
			advanced: {
				buttonColour: "--text-muted",
				buttonActiveColour: "--text-normal",
			}
		},
		dark: {
			codeblock: {
				backgroundColour: SOLARIZED.base03,
				textColour: "#bababa",
			},
			gutter: {
				backgroundColour: SOLARIZED.base02,
				textColour: "#6c6c6c",
				activeTextColour: "#4c4c4c",
			},
			header: {
				backgroundColour: "#0a4554",
				title: {
					textColour: "#dadada",
				},
				languageTag: {
					backgroundColour: "#008080",
					textColour: "#000000",
				},
				externalReference: {
					displayRepositoryColour: "#00FFFF",
					displayVersionColour: "#9437ff",
					displayTimestampColour: "#808080",
				},
				lineColour: "#46cced",
			},
			highlights: {
				activeCodeblockLineColour: SOLARIZED.base02,
				activeEditorLineColour: "#468eeb33",
				defaultColour: "#054b5c",
				alternativeHighlights: {},
			},
			inline: {
				backgroundColour: SOLARIZED.base03,
				textColour: "#bababa",
				activeTextColour: "#bababa",
				titleTextColour: "#000000",
			},
			advanced: {
				buttonColour: "--text-muted",
				buttonActiveColour: "--text-normal",
			}
		},
	},
};
// const NORD_THEME = {

// };
// const DRACULA_THEME = {

// };
// const CATPUCCIN_THEME = {

// };
// const GRUVBOX_THEME = {
// 	settings: THEME_DEFAULT_SETTINGS,
// 	colours: {
// 		light: {
// 			codeblock: {
// 				backgroundColour: GRUVBOX.light0,
// 				textColour: "#bababa",
// 			},
// 			gutter: {
// 				backgroundColour: GRUVBOX.light1,
// 				textColour: "#6c6c6c",
// 				activeTextColour: "#8c8c8c",
// 			},
// 			header: {
// 				backgroundColour: "#D5CCB4",
// 				title: {
// 					textColour: "#866704",
// 				},
// 				languageTag: {
// 					backgroundColour: "#B8B5AA",
// 					textColour: "#C25F30",
// 				},
// 				lineColour: "#EDD489",
// 			},
// 			highlights: {
// 				activeCodeblockLineColour: GRUVBOX.light1,
// 				activeEditorLineColour: "#60460633",
// 				defaultColour: "#E9DFBA",
// 				alternativeHighlights: {},
// 			},
// 			inline: {
// 				backgroundColour: GRUVBOX.light0,
// 				textColour: "#bababa",
// 				activeTextColour: "#bababa",
// 				titleTextColour: "#C25F30",
// 			},
// 			advanced: {
// 				buttonColour: "--text-muted",
// 				buttonActiveColour: "--text-normal",
// 			}
// 		},
// 		dark: {
// 			codeblock: {
// 				backgroundColour: GRUVBOX.dark0,
// 				textColour: "#bababa",
// 			},
// 			gutter: {
// 				backgroundColour: GRUVBOX.dark1,
// 				textColour: "#6c6c6c",
// 				activeTextColour: "#4c4c4c",
// 			},
// 			header: {
// 				backgroundColour: "#0a4554",
// 				title: {
// 					textColour: "#dadada",
// 				},
// 				languageTag: {
// 					backgroundColour: "#008080",
// 					textColour: "#000000",
// 				},
// 				lineColour: "#46cced",
// 			},
// 			highlights: {
// 				activeCodeblockLineColour: GRUVBOX.dark1,
// 				activeEditorLineColour: "#468eeb33",
// 				defaultColour: "#054b5c",
// 				alternativeHighlights: {},
// 			},
// 			inline: {
// 				backgroundColour: GRUVBOX.dark0,
// 				textColour: "#bababa",
// 				activeTextColour: "#bababa",
// 				titleTextColour: "#000000",
// 			},
// 			advanced: {
// 				buttonColour: "--text-muted",
// 				buttonActiveColour: "--text-normal",
// 			}
// 		},
// 	},
// };

export const INBUILT_THEMES: Record<string,CodeStylerTheme> = {
	"Default": DEFAULT_THEME,
	"Solarized": SOLARIZED_THEME,
};

// Default Values
export const EXAMPLE_CODEBLOCK_PARAMETERS = "python title:foo";
export const EXAMPLE_CODEBLOCK_CONTENT = "print(\"This line is very long and should be used as an example for how the plugin deals with wrapping and unwrapping very long lines given the choice of codeblock parameters and settings.\")\nprint(\"This line is highlighted.\")";
export const EXAMPLE_INLINE_CODE = "{python icon title:foo} print(\"This is inline code\")";
export const EXCLUDED_LANGUAGES = "ad-*, reference";
export const WHITELIST_CODEBLOCKS = "run-*, include";

// Plugin default settings
export const DEFAULT_SETTINGS: CodeStylerSettings = {
	themes: structuredClone(INBUILT_THEMES),
	selectedTheme: "Default",
	currentTheme: structuredClone(DEFAULT_THEME),
	newTheme: "",
	newHighlight: "",
	exampleCodeblockParameters: EXAMPLE_CODEBLOCK_PARAMETERS,
	exampleCodeblockContent: EXAMPLE_CODEBLOCK_CONTENT,
	exampleInlineCode: EXAMPLE_INLINE_CODE,
	decoratePrint: true,
	excludedLanguages: EXCLUDED_LANGUAGES,
	externalReferenceUpdateOnLoad: false,
	processedCodeblocksWhitelist: WHITELIST_CODEBLOCKS,
	redirectLanguages: {},
	version: "1.1.7",
};

export function convertSettings(settings: CodeStylerSettings): CodeStylerSettings {
	if (typeof settings?.version === "undefined")
		return settingsClear();
	while (semverNewer(DEFAULT_SETTINGS.version,settings.version)) {
		if (settings.version in settingsUpdaters)
			settings = settingsUpdaters[settings.version](settings);
		else
			settings = settingsClear();
	}
	return settings;
}
function semverNewer(newVersion: string, oldVersion: string): boolean {
	return newVersion.localeCompare(oldVersion, undefined, { numeric: true }) === 1;
}
function settingsVersionUpdate(settings: CodeStylerSettings, themeUpdater: (theme: CodeStylerTheme)=>CodeStylerTheme = (theme)=>theme, otherSettingsUpdater: (settings: CodeStylerSettings)=>CodeStylerSettings = (settings)=>settings, redirectLanguagesUpdater: (redirectLanguages: Record<string,{colour?: Colour, icon?: string}>)=>Record<string,{colour?: Colour, icon?: string}> = (redirectLanguages)=>redirectLanguages): CodeStylerSettings {
	for (const [name, theme] of Object.entries(settings.themes)) {
		settings.themes[name] = themeUpdater(theme);
	}
	settings.currentTheme = structuredClone(settings.themes[settings.selectedTheme]);
	settings.redirectLanguages = redirectLanguagesUpdater(settings.redirectLanguages);
	settings = otherSettingsUpdater(settings);
	settings.version = Object.keys(settingsUpdaters).find((value,index,array)=>array?.[index-1]===settings.version) ?? "1.0.0";
	return settings;
}
function settingsPreserve(settings: CodeStylerSettings): CodeStylerSettings {
	settings.version = Object.keys(settingsUpdaters).find((value,index,array)=>array?.[index-1]===settings.version) ?? "1.0.0";
	return settings;
}
function settingsClear(): CodeStylerSettings {
	return DEFAULT_SETTINGS;
}

const settingsUpdaters: Record<string,(settings: CodeStylerSettings)=>CodeStylerSettings> = {
	"1.0.0": settingsClear,
	"1.0.1": settingsClear,
	"1.0.2": settingsClear,
	"1.0.3": settingsClear,
	"1.0.4": settingsClear,
	"1.0.5": settingsClear,
	"1.0.6": settingsClear,
	"1.0.7": settingsPreserve,
	"1.0.8": settingsPreserve,
	"1.0.9": settingsPreserve,
	"1.0.10": (settings)=>settingsVersionUpdate(settings,(theme)=>{ // To 1.0.10
		theme.settings.inline.style = true;
		return theme;
	},(settings)=>{//@ts-expect-error Older interface versions
		delete settings.specialLanguages;
		return settings;
	}),
	"1.0.11": settingsPreserve,
	"1.1.0": settingsPreserve,
	"1.1.1": settingsPreserve,
	"1.1.2": settingsPreserve,
	"1.1.3": settingsPreserve,
	"1.1.4": (settings) => settingsVersionUpdate(settings,(theme)=>{ // To 1.1.5
		theme.settings.header.externalReference = structuredClone(THEME_DEFAULT_SETTINGS.header.externalReference);
		theme.colours.light.header.externalReference = structuredClone(THEME_FALLBACK_COLOURS.header.externalReference);
		theme.colours.dark.header.externalReference = structuredClone(THEME_FALLBACK_COLOURS.header.externalReference);
		return theme;
	}, (settings) => {
		settings.externalReferenceUpdateOnLoad = false;
		return settings;
	}),
	"1.1.5": settingsPreserve,
	"1.1.6": settingsPreserve,
};

// Constants
export const FOLD_PLACEHOLDER = "Folded Code";
export const PARAMETERS = ["title","fold","ln","wrap","unwrap","ignore"];
export const TRANSITION_LENGTH = 240; // 240ms
export const SPECIAL_LANGUAGES = ["^reference$","^foofoo","^preview$","^include$","^output$","^run-.+$"];
export const SETTINGS_SOURCEPATH_PREFIX = "@Code-Styler-Settings:";
export const LOCAL_PREFIX = "@/";
export const REFERENCE_CODEBLOCK = "reference";
export const EXTERNAL_REFERENCE_PATH = "/plugins/code-styler/reference-files/";
export const EXTERNAL_REFERENCE_CACHE = EXTERNAL_REFERENCE_PATH + "cache.json";
export const EXTERNAL_REFERENCE_INFO_SUFFIX = "-info.json";
export const GIT_ICONS: { [key: string]: string } = {
	"branch": "&#xe0a0;",
	"tree": "&#xeafc;", // commit
};
export const SITE_ICONS: { [key: string]: string } = {
	"github": "&#xf09b;",
	"gitlab": "&#xe65c;",
	"bitbucket": "&#xe703;",
	"sourceforge": "&#xf0238;",
	"generic": "&#xf059f;",
};
export const STAMP_ICON = "&#xf00f0;";
export const UPDATE_ICON = "&#xe348;";

const PRISM_LANGUAGES: {[key: string]: string} = { // Prism Languages: https://prismjs.com/plugins/show-language/
	// "none": "Plain text", // NOTE: Obsidian uses this for codeblocks without language names
	"plain": "Plain text",
	"plaintext": "Plain text",
	"text": "Plain text",
	"txt": "Plain text",
	"html": "HTML",
	"xml": "XML",
	"svg": "SVG",
	"mathml": "MathML",
	"ssml": "SSML",
	"rss": "RSS",
	"css": "CSS",
	"clike": "C-like",
	"js": "JavaScript",
	"abap": "ABAP",
	"abnf": "ABNF",
	"al": "AL",
	"antlr4": "ANTLR4",
	"g4": "ANTLR4",
	"apacheconf": "Apache Configuration",
	"apl": "APL",
	"aql": "AQL",
	"ino": "Arduino",
	"arff": "ARFF",
	"armasm": "ARM Assembly",
	"arm-asm": "ARM Assembly",
	"art": "Arturo",
	"asciidoc": "AsciiDoc",
	"adoc": "AsciiDoc",
	"aspnet": "ASP.NET (C#)",
	"asm6502": "6502 Assembly",
	"asmatmel": "Atmel AVR Assembly",
	"autohotkey": "AutoHotkey",
	"autoit": "AutoIt",
	"avisynth": "AviSynth",
	"avs": "AviSynth",
	"avro-idl": "Avro IDL",
	"avdl": "Avro IDL",
	"awk": "AWK",
	"gawk": "GAWK",
	"sh": "Shell",
	"basic": "BASIC",
	"bbcode": "BBcode",
	"bbj": "BBj",
	"bnf": "BNF",
	"rbnf": "RBNF",
	"bqn": "BQN",
	"bsl": "BSL (1C:Enterprise)",
	"oscript": "OneScript",
	"csharp": "C#",
	"cs": "C#",
	"dotnet": "C#",
	"cpp": "C++",
	"cfscript": "CFScript",
	"cfc": "CFScript",
	"cil": "CIL",
	"cilkc": "Cilk/C",
	"cilk-c": "Cilk/C",
	"cilkcpp": "Cilk/C++",
	"cilk-cpp": "Cilk/C++",
	"cilk": "Cilk/C++",
	"cmake": "CMake",
	"cobol": "COBOL",
	"coffee": "CoffeeScript",
	"conc": "Concurnas",
	"csp": "Content-Security-Policy",
	"css-extras": "CSS Extras",
	"csv": "CSV",
	"cue": "CUE",
	"dataweave": "DataWeave",
	"dax": "DAX",
	"django": "Django/Jinja2",
	"jinja2": "Django/Jinja2",
	"dns-zone-file": "DNS zone file",
	"dns-zone": "DNS zone file",
	"dockerfile": "Docker",
	"dot": "DOT (Graphviz)",
	"gv": "DOT (Graphviz)",
	"ebnf": "EBNF",
	"editorconfig": "EditorConfig",
	"ejs": "EJS",
	"etlua": "Embedded Lua templating",
	"erb": "ERB",
	"excel-formula": "Excel Formula",
	"xlsx": "Excel Formula",
	"xls": "Excel Formula",
	"fsharp": "F#",
	"firestore-security-rules": "Firestore security rules",
	"ftl": "FreeMarker Template Language",
	"gml": "GameMaker Language",
	"gamemakerlanguage": "GameMaker Language",
	"gap": "GAP (CAS)",
	"gcode": "G-code",
	"gdscript": "GDScript",
	"gedcom": "GEDCOM",
	"gettext": "gettext",
	"po": "gettext",
	"glsl": "GLSL",
	"gn": "GN",
	"gni": "GN",
	"linker-script": "GNU Linker Script",
	"ld": "GNU Linker Script",
	"go-module": "Go module",
	"go-mod": "Go module",
	"graphql": "GraphQL",
	"hbs": "Handlebars",
	"hs": "Haskell",
	"hcl": "HCL",
	"hlsl": "HLSL",
	"http": "HTTP",
	"hpkp": "HTTP Public-Key-Pins",
	"hsts": "HTTP Strict-Transport-Security",
	"ichigojam": "IchigoJam",
	"icu-message-format": "ICU Message Format",
	"idr": "Idris",
	"ignore": ".ignore",
	"gitignore": ".gitignore",
	"hgignore": ".hgignore",
	"npmignore": ".npmignore",
	"inform7": "Inform 7",
	"javadoc": "JavaDoc",
	"javadoclike": "JavaDoc-like",
	"javastacktrace": "Java stack trace",
	"jq": "JQ",
	"jsdoc": "JSDoc",
	"js-extras": "JS Extras",
	"json": "JSON",
	"webmanifest": "Web App Manifest",
	"json5": "JSON5",
	"jsonp": "JSONP",
	"jsstacktrace": "JS stack trace",
	"js-templates": "JS Templates",
	"keepalived": "Keepalived Configure",
	"kts": "Kotlin Script",
	"kt": "Kotlin",
	"kumir": "KuMir (КуМир)",
	"kum": "KuMir (КуМир)",
	"latex": "LaTeX",
	"tex": "TeX",
	"context": "ConTeXt",
	"lilypond": "LilyPond",
	"ly": "LilyPond",
	"emacs": "Lisp",
	"elisp": "Lisp",
	"emacs-lisp": "Lisp",
	"llvm": "LLVM IR",
	"log": "Log file",
	"lolcode": "LOLCODE",
	"magma": "Magma (CAS)",
	"md": "Markdown",
	"markup-templating": "Markup templating",
	"matlab": "MATLAB",
	"maxscript": "MAXScript",
	"mel": "MEL",
	"metafont": "METAFONT",
	"mongodb": "MongoDB",
	"moon": "MoonScript",
	"n1ql": "N1QL",
	"n4js": "N4JS",
	"n4jsd": "N4JS",
	"nand2tetris-hdl": "Nand To Tetris HDL",
	"naniscript": "Naninovel Script",
	"nani": "Naninovel Script",
	"nasm": "NASM",
	"neon": "NEON",
	"nginx": "nginx",
	"nsis": "NSIS",
	"objectivec": "Objective-C",
	"objc": "Objective-C",
	"ocaml": "OCaml",
	"opencl": "OpenCL",
	"openqasm": "OpenQasm",
	"qasm": "OpenQasm",
	"parigp": "PARI/GP",
	"objectpascal": "Object Pascal",
	"psl": "PATROL Scripting Language",
	"pcaxis": "PC-Axis",
	"px": "PC-Axis",
	"peoplecode": "PeopleCode",
	"pcode": "PeopleCode",
	"php": "PHP",
	"phpdoc": "PHPDoc",
	"php-extras": "PHP Extras",
	"plant-uml": "PlantUML",
	"plantuml": "PlantUML",
	"plsql": "PL/SQL",
	"powerquery": "PowerQuery",
	"pq": "PowerQuery",
	"mscript": "PowerQuery",
	"powershell": "PowerShell",
	"promql": "PromQL",
	"properties": ".properties",
	"protobuf": "Protocol Buffers",
	"purebasic": "PureBasic",
	"pbfasm": "PureBasic",
	"purs": "PureScript",
	"py": "Python",
	"qsharp": "Q#",
	"qs": "Q#",
	"q": "Q (kdb+ database)",
	"qml": "QML",
	"rkt": "Racket",
	"cshtml": "Razor C#",
	"razor": "Razor C#",
	"jsx": "React JSX",
	"tsx": "React TSX",
	"renpy": "Ren'py",
	"rpy": "Ren'py",
	"res": "ReScript",
	"rest": "reST (reStructuredText)",
	"robotframework": "Robot Framework",
	"robot": "Robot Framework",
	"rb": "Ruby",
	"sas": "SAS",
	"sass": "Sass (Sass)",
	"scss": "Sass (SCSS)",
	"shell-session": "Shell session",
	"sh-session": "Shell session",
	"shellsession": "Shell session",
	"sml": "SML",
	"smlnj": "SML/NJ",
	"solidity": "Solidity (Ethereum)",
	"sol": "Solidity (Ethereum)",
	"solution-file": "Solution file",
	"sln": "Solution file",
	"soy": "Soy (Closure Template)",
	"sparql": "SPARQL",
	"rq": "SPARQL",
	"splunk-spl": "Splunk SPL",
	"sqf": "SQF: Status Quo Function (Arma 3)",
	"sql": "SQL",
	"stata": "Stata Ado",
	"iecst": "Structured Text (IEC 61131-3)",
	"supercollider": "SuperCollider",
	"sclang": "SuperCollider",
	"systemd": "Systemd configuration file",
	"t4-templating": "T4 templating",
	"t4-cs": "T4 Text Templates (C#)",
	"t4": "T4 Text Templates (C#)",
	"t4-vb": "T4 Text Templates (VB)",
	"tap": "TAP",
	"tt2": "Template Toolkit 2",
	"toml": "TOML",
	"trickle": "trickle",
	"troy": "troy",
	"trig": "TriG",
	"ts": "TypeScript",
	"tsconfig": "TSConfig",
	"uscript": "UnrealScript",
	"uc": "UnrealScript",
	"uorazor": "UO Razor Script",
	"uri": "URI",
	"url": "URL",
	"vbnet": "VB.Net",
	"vhdl": "VHDL",
	"vim": "vim",
	"visual-basic": "Visual Basic",
	"vba": "VBA",
	"vb": "Visual Basic",
	"wasm": "WebAssembly",
	"web-idl": "Web IDL",
	"webidl": "Web IDL",
	"wgsl": "WGSL",
	"wiki": "Wiki markup",
	"wolfram": "Wolfram language",
	"nb": "Mathematica Notebook",
	"wl": "Wolfram language",
	"xeoracube": "XeoraCube",
	"xml-doc": "XML doc (.net)",
	"xojo": "Xojo (REALbasic)",
	"xquery": "XQuery",
	"yaml": "YAML",
	"yml": "YAML",
	"yang": "YANG",
};
const MANUAL_PRISM_LANGUAGES: {[key: string]: string} = { // Manually generated list from https://prismjs.com/  -  297 languages
	"css":"CSS",
	"clike":"C-like",
	"javascript":"JavaScript",
	"js":"JavaScript",
	"abap":"ABAP",
	"abnf":"ABNF",
	"actionscript":"ActionScript",
	"ada":"Ada",
	"agda":"Agda",
	"al":"AL",
	"antlr4":"ANTLR4",
	"g4":"ANTLR4",
	"apacheconf":"Apache Configuration",
	"apex":"Apex",
	"apl":"APL",
	"applescript":"AppleScript",
	"aql":"AQL",
	"arduino":"Arduino",
	"ino":"Arduino",
	"arff":"ARFF",
	"armasm":"ARM Assembly",
	"arm-asm":"ARM Assembly",
	"arturo":"Arturo",
	"art":"Arturo",
	"asciidoc":"AsciiDoc",
	"adoc":"AsciiDoc",
	"aspnet":"ASP.NET (C#)",
	"asm6502":"6502 Assembly",
	"asmatmel":"Atmel AVR Assembly",
	"autohotkey":"AutoHotkey",
	"autoit":"AutoIt",
	"avisynth":"AviSynth",
	"avs":"AviSynth",
	"avro-idl":"Avro IDL",
	"avdl":"Avro IDL",
	"awk":"AWK",
	"gawk":"GAWK",
	"bash":"Bash",
	"sh":"Shell",
	"shell":"Shell",
	"basic":"BASIC",
	"batch":"Batch",
	"bbcode":"BBcode",
	"shortcode":"BBcode",
	"bbj":"BBj",
	"birb":"Birb",
	"bison":"Bison",
	"bnf":"BNF",
	"rbnf":"BNF",
	"bqn":"BQN",
	"brainfuck":"Brainfuck",
	"brightscript":"BrightScript",
	"bro":"Bro",
	"bsl":"BSL (1C)",
	"oscript":"BSL (1C)",
	"c":"C",
	"csharp":"C#",
	"cs":"C#",
	"dotnet":"C#",
	"cpp":"C++",
	"cfscript":"CFScript",
	"cfc":"CFScript",
	"chaiscript":"ChaiScript",
	"cil":"CIL",
	"cilkc":"Cilk/C",
	"cilk-c":"Cilk/C",
	"cilkcpp":"Cilk/C++",
	"cilk-cpp":"Cilk/C++",
	"cilk":"Cilk/C++",
	"clojure":"Clojure",
	"cmake":"CMake",
	"cobol":"COBOL",
	"coffeescript":"CoffeeScript",
	"coffee":"CoffeeScript",
	"concurnas":"Concurnas",
	"conc":"Concurnas",
	"csp":"Content-Security-Policy",
	"cooklang":"Cooklang",
	"coq":"Coq",
	"crystal":"Crystal",
	"css-extras":"CSS Extras",
	"csv":"CSV",
	"cue":"CUE",
	"cypher":"Cypher",
	"d":"D",
	"dart":"Dart",
	"dataweave":"DataWeave",
	"dax":"DAX",
	"dhall":"Dhall",
	"diff":"Diff",
	"django":"Django/Jinja2",
	"jinja2":"Django/Jinja2",
	"dns-zone-file":"DNS zone file",
	"dns-zone":"DNS zone file",
	"docker":"Docker",
	"dockerfile":"Docker",
	"dot":"DOT (Graphviz)",
	"gv":"DOT (Graphviz)",
	"ebnf":"EBNF",
	"editorconfig":"EditorConfig",
	"eiffel":"Eiffel",
	"ejs":"EJS",
	"eta":"EJS",
	"elixir":"Elixir",
	"elm":"Elm",
	"etlua":"Embedded Lua templating",
	"erb":"ERB",
	"erlang":"Erlang",
	"excel-formula":"Excel Formula",
	"xlsx":"Excel Formula",
	"xls":"Excel Formula",
	"fsharp":"F#",
	"factor":"Factor",
	"false":"False",
	"firestore-security-rules":"Firestore security rules",
	"flow":"Flow",
	"fortran":"Fortran",
	"ftl":"FreeMarker Template Language",
	"gml":"GameMaker Language",
	"gamemakerlanguage":"GameMaker Language",
	"gap":"GAP (CAS)",
	"gcode":"G-code",
	"gdscript":"GDScript",
	"gedcom":"GEDCOM",
	"gettext":"gettext",
	"po":"gettext",
	"gherkin":"Gherkin",
	"git":"Git",
	"glsl":"GLSL",
	"gn":"GN",
	"gni":"GN",
	"linker-script":"GNU Linker Script",
	"ld":"GNU Linker Script",
	"go":"Go",
	"go-module":"Go module",
	"go-mod":"Go module",
	"gradle":"Gradle",
	"graphql":"GraphQL",
	"groovy":"Groovy",
	"haml":"Haml",
	"handlebars":"Handlebars",
	"hbs":"Handlebars",
	"mustache":"Handlebars",
	"haskell":"Haskell",
	"hs":"Haskell",
	"haxe":"Haxe",
	"hcl":"HCL",
	"hlsl":"HLSL",
	"hoon":"Hoon",
	"http":"HTTP",
	"hpkp":"HTTP Public-Key-Pins",
	"hsts":"HTTP Strict-Transport-Security",
	"ichigojam":"IchigoJam",
	"icon":"Icon",
	"icu-message-format":"ICU Message Format",
	"idris":"Idris",
	"idr":"Idris",
	"inform7":"Inform 7",
	"ini":"Ini",
	"io":"Io",
	"j":"J",
	"java":"Java",
	"javadoc":"JavaDoc",
	"javadoclike":"JavaDoc-like",
	"javastacktrace":"Java stack trace",
	"jexl":"Jexl",
	"jolie":"Jolie",
	"jq":"JQ",
	"jsdoc":"JSDoc",
	"js-extras":"JS Extras",
	"json":"JSON",
	"webmanifest":"JSON",
	"json5":"JSON5",
	"jsonp":"JSONP",
	"jsstacktrace":"JS stack trace",
	"js-templates":"JS Templates",
	"julia":"Julia",
	"keepalived":"Keepalived Configure",
	"keyman":"Keyman",
	"kotlin":"Kotlin",
	"kt":"Kotlin",
	"kts":"Kotlin",
	"kumir":"KuMir (КуМир)",
	"kum":"KuMir (КуМир)",
	"kusto":"Kusto",
	"latex":"LaTeX",
	"tex":"LaTeX",
	"context":"LaTeX",
	"latte":"Latte",
	"less":"Less",
	"lilypond":"LilyPond",
	"ly":"LilyPond",
	"liquid":"Liquid",
	"lisp":"Lisp",
	"emacs":"Lisp",
	"elisp":"Lisp",
	"emacs-lisp":"Lisp",
	"livescript":"LiveScript",
	"llvm":"LLVM IR",
	"log":"Log file",
	"lolcode":"LOLCODE",
	"lua":"Lua",
	"magma":"Magma (CAS)",
	"makefile":"Makefile",
	"markdown":"Markdown",
	"md":"Markdown",
	"markup-templating":"Markup templating",
	"mata":"Mata",
	"matlab":"MATLAB",
	"maxscript":"MAXScript",
	"mel":"MEL",
	"mermaid":"Mermaid",
	"metafont":"METAFONT",
	"mizar":"Mizar",
	"mongodb":"MongoDB",
	"monkey":"Monkey",
	"moonscript":"MoonScript",
	"moon":"MoonScript",
	"n1ql":"N1QL",
	"n4js":"N4JS",
	"n4jsd":"N4JS",
	"nand2tetris-hdl":"Nand To Tetris HDL",
	"naniscript":"Naninovel Script",
	"nani":"Naninovel Script",
	"nasm":"NASM",
	"neon":"NEON",
	"nevod":"Nevod",
	"nginx":"nginx",
	"nim":"Nim",
	"nix":"Nix",
	"nsis":"NSIS",
	"objectivec":"Objective-C",
	"objc":"Objective-C",
	"ocaml":"OCaml",
	"odin":"Odin",
	"opencl":"OpenCL",
	"openqasm":"OpenQasm",
	"qasm":"OpenQasm",
	"oz":"Oz",
	"parigp":"PARI/GP",
	"parser":"Parser",
	"pascal":"Pascal",
	"pascaligo":"Pascaligo",
	"psl":"PATROL Scripting Language",
	"pcaxis":"PC-Axis",
	"px":"PC-Axis",
	"peoplecode":"PeopleCode",
	"pcode":"PeopleCode",
	"perl":"Perl",
	"php":"PHP",
	"phpdoc":"PHPDoc",
	"php-extras":"PHP Extras",
	"plant-uml":"PlantUML",
	"plantuml":"PlantUML",
	"plsql":"PL/SQL",
	"powerquery":"PowerQuery",
	"pq":"PowerQuery",
	"mscript":"PowerQuery",
	"powershell":"PowerShell",
	"processing":"Processing",
	"prolog":"Prolog",
	"promql":"PromQL",
	"properties":".properties",
	"protobuf":"Protocol Buffers",
	"pug":"Pug",
	"puppet":"Puppet",
	"pure":"Pure",
	"purebasic":"PureBasic",
	"pbfasm":"PureBasic",
	"purescript":"PureScript",
	"purs":"PureScript",
	"python":"Python",
	"py":"Python",
	"qsharp":"Q#",
	"qs":"Q#",
	"q":"Q (kdb+ database)",
	"qml":"QML",
	"qore":"Qore",
	"r":"R",
	"racket":"Racket",
	"rkt":"Racket",
	"cshtml":"Razor C#",
	"jsx":"React JSX",
	"tsx":"React TSX",
	"reason":"Reason",
	"regex":"Regex",
	"rego":"Rego",
	"renpy":"Ren'py",
	"rpy":"Ren'py",
	"rescript":"ReScript",
	"res":"ReScript",
	"rest":"reST (reStructuredText)",
	"rip":"Rip",
	"roboconf":"Roboconf",
	"robotframework":"Robot Framework",
	"robot":"Robot Framework",
	"ruby":"Ruby",
	"rb":"Ruby",
	"rust":"Rust",
	"sas":"SAS",
	"sass":"Sass (Sass)",
	"scss":"Sass (SCSS)",
	"scala":"Scala",
	"scheme":"Scheme",
	"shell-session":"Shell session",
	"sh-session":"Shell session",
	"shellsession":"Shell session",
	"smali":"Smali",
	"smalltalk":"Smalltalk",
	"smarty":"Smarty",
	"sml":"SML",
	"smlnj":"SML",
	"solidity":"Solidity (Ethereum)",
	"sol":"Solidity (Ethereum)",
	"solution-file":"Solution file",
	"sln":"Solution file",
	"soy":"Soy (Closure Template)",
	"sparql":"SPARQL",
	"rq":"SPARQL",
	"splunk-spl":"Splunk SPL",
	"sqf":"SQF",
	"sql":"SQL",
	"squirrel":"Squirrel",
	"stan":"Stan",
	"stata":"Stata Ado",
	"iecst":"Structured Text (IEC 61131-3)",
	"stylus":"Stylus",
	"supercollider":"SuperCollider",
	"sclang":"SuperCollider",
	"swift":"Swift",
	"systemd":"Systemd configuration file",
	"t4-templating":"T4 templating",
	"t4-cs":"T4 Text Templates (C#)",
	"t4":"T4 Text Templates (C#)",
	"t4-vb":"T4 Text Templates (VB)",
	"tap":"TAP",
	"tcl":"Tcl",
	"tt2":"Template Toolkit 2",
	"textile":"Textile",
	"toml":"TOML",
	"tremor":"Tremor",
	"trickle":"Tremor",
	"troy":"Tremor",
	"turtle":"Turtle",
	"trig":"Turtle",
	"twig":"Twig",
	"typescript":"TypeScript",
	"ts":"TypeScript",
	"typoscript":"TypoScript",
	"tsconfig":"TSConfig",
	"unrealscript":"UnrealScript",
	"uscript":"UnrealScript",
	"uc":"UnrealScript",
	"uorazor":"UO Razor Script",
	"uri":"URI",
	"url":"URI",
	"v":"V",
	"vala":"Vala",
	"vbnet":"VB.Net",
	"velocity":"Velocity",
	"verilog":"Verilog",
	"vhdl":"VHDL",
	"vim":"vim",
	"visual-basic":"Visual Basic",
	"vb":"Visual Basic",
	"warpscript":"WarpScript",
	"wasm":"WebAssembly",
	"web-idl":"Web IDL",
	"webidl":"Web IDL",
	"wgsl":"WGSL",
	"wiki":"Wiki markup",
	"wolfram":"Wolfram language",
	"mathematica":"Wolfram language",
	"nb":"Wolfram language",
	"wl":"Wolfram language",
	"wren":"Wren",
	"xeora":"Xeora",
	"xeoracube":"Xeora",
	"xml-doc":"XML doc (.net)",
	"xojo":"Xojo (REALbasic)",
	"xquery":"XQuery",
	"yaml":"YAML",
	"yml":"YAML",
	"yang":"YANG",
	"zig":"Zig"
};
const MANUAL_LANGUAGES: {[key: string]: string} = { // Manually created list
	"fish":"Fish",
	"octave":"Octave",
	"maxima":"Maxima",
	"mysql":"SQL",
	"postgresql":"SQL",
	"rscript":"R",
	"shellscript":"Shell",
	"sqlite":"SQL",
	"zsh":"Zsh",
};
export const LANGUAGE_NAMES: {[key: string]: string} = {...PRISM_LANGUAGES,...MANUAL_PRISM_LANGUAGES,...MANUAL_LANGUAGES};

export const LANGUAGES: {[key: string]: Language} = {
	".gitignore": {
		colour: "#dd4c35",
		icon: "<path d=\"M29.472,14.753,17.247,2.528a1.8,1.8,0,0,0-2.55,0L12.158,5.067l3.22,3.22a2.141,2.141,0,0,1,2.712,2.73l3.1,3.1a2.143,2.143,0,1,1-1.285,1.21l-2.895-2.895v7.617a2.141,2.141,0,1,1-1.764-.062V12.3a2.146,2.146,0,0,1-1.165-2.814L10.911,6.314,2.528,14.7a1.8,1.8,0,0,0,0,2.551L14.753,29.472a1.8,1.8,0,0,0,2.55,0L29.472,17.3a1.8,1.8,0,0,0,0-2.551\" style=\"fill:#dd4c35\"/><path d=\"M12.158,5.067l3.22,3.22a2.141,2.141,0,0,1,2.712,2.73l3.1,3.1a2.143,2.143,0,1,1-1.285,1.21l-2.895-2.895v7.617a2.141,2.141,0,1,1-1.764-.062V12.3a2.146,2.146,0,0,1-1.165-2.814L10.911,6.314\" style=\"fill:#fff\"/>",
		inlineComment: [
			"#",
		],
	},
	".hgignore": {
		colour: "#bfbfbf",
		icon: "<path d=\"M28.042,23.172c4.989-8.3-1.054-21.751-12.1-20.384C5.955,4.022,5.794,14.53,14.593,17.026c7.614,2.162,1.573,6.992,1.749,10.208s6.62,4.382,11.7-4.063\" style=\"fill:#1b1b1b\"/><circle cx=\"9.784\" cy=\"24.257\" r=\"4.332\" style=\"fill:#1b1b1b\"/><circle cx=\"4.835\" cy=\"15.099\" r=\"2.835\" style=\"fill:#1b1b1b\"/><path d=\"M28.231,22.835c4.989-8.3-1.054-21.751-12.1-20.384C6.144,3.686,5.983,14.194,14.781,16.69c7.614,2.162,1.573,6.992,1.749,10.208s6.62,4.382,11.7-4.063\" style=\"fill:#bfbfbf\"/><circle cx=\"9.972\" cy=\"23.921\" r=\"4.332\" style=\"fill:#bfbfbf\"/><circle cx=\"5.023\" cy=\"14.762\" r=\"2.835\" style=\"fill:#bfbfbf\"/><path d=\"M17.811,28.168a.669.669,0,0,1,.635-.994,7,7,0,0,0,3.7-.746c3.247-1.841,8.244-10.7,5.731-16.285A12.77,12.77,0,0,0,25.049,5.7c-.236-.249-.1-.236.059-.152a10.08,10.08,0,0,1,2.857,3.676,14.578,14.578,0,0,1,1.1,10.279c-.494,1.817-2.2,5.928-4.691,7.706s-5.424,2.8-6.563.955M15.548,16.673c-1.7-.5-3.894-1.208-5.163-2.867A8.088,8.088,0,0,1,8.854,10.49c-.043-.27-.08-.5,0-.558a21.882,21.882,0,0,0,1.688,2.723,6.487,6.487,0,0,0,3.526,2.256,12.383,12.383,0,0,1,3.867,1.37c.739.629.8,1.989.552,2.142s-.759-1.1-2.938-1.749m-8.155,10.4c3.369,3.121,8.439-1.166,6.207-4.954-.251-.425-.576-.749-.469-.423.714,2.178.054,3.9-1.176,4.788a4.063,4.063,0,0,1-4.192.328c-.39-.2-.551.092-.37.261m-3.93-10.16c.018.2.292.458.722.576a2.969,2.969,0,0,0,2.55-.413,2.759,2.759,0,0,0,.81-3.452c-.172-.308-.4-.533-.218-.041A2.68,2.68,0,0,1,6.148,16.53a2.439,2.439,0,0,1-2.1.164c-.391-.119-.6.016-.58.223\"/><path d=\"M19.056,28.407c-.033.389.414.466,1.016.376a6.755,6.755,0,0,0,2.313-.648,9.54,9.54,0,0,0,3.314-2.63c2.662-3.473,3.6-7.582,3.46-8.173A16.172,16.172,0,0,1,27,22.692c-1.888,2.968-3.256,4.548-6.413,5.314-.879.213-1.485-.112-1.529.4m-7-13.5A7.967,7.967,0,0,0,14.6,16.089a12.2,12.2,0,0,1,2.96,1.31c.378.253.618.819.642.317s-.285-.934-.976-1.164a15.274,15.274,0,0,0-2.009-.674c-.485-.1-1.273-.285-1.949-.493-.371-.114-.748-.313-1.214-.483M10.037,27.718c.429-.09,2.924-.736,3.51-2.788.183-.64.215-.511.164-.165a3.8,3.8,0,0,1-3.358,3.123c-.289.03-.668-.1-.315-.17M5.046,17.2a7.991,7.991,0,0,0,1.195-.336,2.383,2.383,0,0,0,1.232-1.741c.064-.505.083-.378.109-.1a2.627,2.627,0,0,1-2.147,2.324c-.2.028-.56.011-.389-.143\" style=\"fill:#fff\"/><path d=\"M27.54,17.446c2.124-6.123-2.321-15.37-11.315-14.258-8.126,1-8.257,9.557-1.1,11.59,8.112,1.228,3.227,7.347,2.535,10.433-.621,2.766,6.555,3.221,9.876-7.765M7.219,26.2a2.028,2.028,0,0,1,1.332.442,3.525,3.525,0,0,0,3.755-.983A4.154,4.154,0,0,0,12.869,22c-.806-2.319-4.229-2.278-5.758-.353-1.654,2.15-.4,4.539.108,4.548M2.676,15.451a1.166,1.166,0,0,0,.908.863c.731.1.88.434,1.743.263A2.464,2.464,0,0,0,7.1,14.916a1.771,1.771,0,0,0-.824-2.14,2.689,2.689,0,0,0-3.047.363,2.263,2.263,0,0,0-.558,2.312\" style=\"fill:#999\"/><path d=\"M21.981,22.228c-2.2-.272-5.36,4.69-2.378,4.109h0a5.645,5.645,0,0,0,3.683-1.932,23.136,23.136,0,0,0,4.055-7.2c.5-1.861.251-4.745-.269-2.036-.533,2.781-2.893,7.336-5.091,7.064M10.523,26.362A2.778,2.778,0,0,0,12.5,22.99c-.165-1.276-.861,1.584-2.15,2.012-1.953.648-1.733,1.861.176,1.361m-4.978-10.2c.663-.173,1.54-1.077,1.1-1.767-.537-.85-2.033-.122-2.084.824s.277,1.127.979.943\" style=\"fill:#f3f3f3\"/>",
	},
	".npmignore": {
		colour: "#cb3837",
		icon: "<path d=\"M2,10.555H30v9.335H16v1.556H9.778V19.889H2Zm1.556,7.779H6.667V13.666H8.222v4.667H9.778V12.111H3.556Zm7.778-6.223v7.779h3.111V18.334h3.111V12.111Zm3.111,1.556H16v3.112H14.444Zm4.667-1.556v6.223h3.111V13.666h1.556v4.667h1.556V13.666h1.556v4.667h1.556V12.111Z\" style=\"fill:#cb3837\"/>",
	},
	".properties": {
		colour: "#99b8c4",
		icon: "<path d=\"M23.265,24.381l.9-.894c4.164.136,4.228-.01,4.411-.438l1.144-2.785L29.805,20l-.093-.231c-.049-.122-.2-.486-2.8-2.965V15.5c3-2.89,2.936-3.038,2.765-3.461L28.538,9.225c-.171-.422-.236-.587-4.37-.474l-.9-.93a20.166,20.166,0,0,0-.141-4.106l-.116-.263-2.974-1.3c-.438-.2-.592-.272-3.4,2.786l-1.262-.019c-2.891-3.086-3.028-3.03-3.461-2.855L9.149,3.182c-.433.175-.586.237-.418,4.437l-.893.89c-4.162-.136-4.226.012-4.407.438L2.285,11.733,2.195,12l.094.232c.049.12.194.48,2.8,2.962l0,1.3c-3,2.89-2.935,3.038-2.763,3.462l1.138,2.817c.174.431.236.584,4.369.476l.9.935a20.243,20.243,0,0,0,.137,4.1l.116.265,2.993,1.308c.435.182.586.247,3.386-2.8l1.262.016c2.895,3.09,3.043,3.03,3.466,2.859l2.759-1.115C23.288,28.644,23.44,28.583,23.265,24.381ZM11.407,17.857a4.957,4.957,0,1,1,6.488,2.824A5.014,5.014,0,0,1,11.407,17.857Z\" style=\"fill:#99b8c4\"/>",
	},
	"6502 Assembly": {
		colour: "#0000bf",
		icon: "<defs><linearGradient id=\"a\" x1=\"836.63\" y1=\"36.205\" x2=\"843.802\" y2=\"14.48\" gradientTransform=\"translate(525.922 30.249) rotate(180) scale(0.607 0.607)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#fff\" stop-opacity=\"0\"/><stop offset=\"1\" stop-color=\"#fff\" stop-opacity=\"0.275\"/></linearGradient></defs><title>file_type_assembly</title><path d=\"M16,2c-1.246,3.056-2,5.057-3.391,8.022A21.884,21.884,0,0,0,16.2,13.156a14.858,14.858,0,0,1-4-2.283C10.43,14.579,7.646,19.855,2,30c5.186-2.994,9.012-4.648,12.691-4.966V24.2h-.834v-.837h.834V24.2h1.675V22.521H14.691v-.834h-.834V20.013h.834v-.834h1.675v.834H17.2v.837h-.837v-.837H14.691v1.675h1.675v.834H17.2V24.2h-.837v.783c3.98.1,8.006,1.772,13.634,5.021-.863-1.589-1.636-3.021-2.372-4.385a25.526,25.526,0,0,0-4.833-3.333A14.436,14.436,0,0,1,26.65,23.8C19.17,9.872,18.565,8.02,16,2ZM10.511,19.179h1.671v.834h.837v5.021h-.837V22.521H10.511v2.512H9.673V20.013h.837Zm0,.834v1.675h1.671V20.013Zm7.526-.834h.837v.834h.837v.837h.834v-.837h.837v-.834h.837v5.855h-.837V20.85h-.837v.837h-.834V20.85h-.837v4.184h-.837Z\" style=\"fill:#0000bf\"/><path d=\"M23.881,18.642c-6.069-8.237-7.476-14.876-7.832-16.461A175.217,175.217,0,0,0,23.881,18.642Z\" style=\"fill:#fff;fill-opacity:0.165680468082428\"/><path d=\"M16.051,2.12,15.6,3.227c-.159.391-.311.765-.461,1.131s-.3.724-.448,1.077-.3.7-.448,1.053-.3.706-.465,1.066-.329.729-.506,1.111-.362.778-.561,1.193c-.028.057-.061.123-.089.181A21.872,21.872,0,0,0,16.2,13.156a14.879,14.879,0,0,1-3.989-2.276l-.14.287c-.065.133-.144.283-.212.42l-.106.219c-.878,1.793-2.006,3.984-3.524,6.822,3.551-2,7.381-4.887,14.338-2.4-.349-.661-.67-1.28-.971-1.863s-.581-1.128-.841-1.644-.5-1-.725-1.463-.433-.9-.629-1.313-.38-.818-.554-1.2-.339-.754-.5-1.118S18.047,6.9,17.9,6.546s-.291-.709-.434-1.066c-.036-.091-.073-.186-.109-.277C16.949,4.247,16.536,3.258,16.051,2.12Z\" style=\"fill:url(#a)\"/>",
	},
	"ActionScript": {
		colour: "#c41718",
		icon: "<path d=\"M2,15.281c1.918,0,2.11-1.055,2.11-1.918a17.119,17.119,0,0,0-.192-2.205,18.723,18.723,0,0,1-.192-2.205c0-2.4,1.63-3.452,3.836-3.452h.575V6.938H7.658c-1.534,0-2.11.767-2.11,2.205a14.412,14.412,0,0,0,.192,1.918,14.306,14.306,0,0,1,.192,2.014c0,1.726-.671,2.493-1.918,2.877v.1c1.151.288,1.918,1.151,1.918,2.877a14.306,14.306,0,0,1-.192,2.014,13,13,0,0,0-.192,1.918c0,1.438.575,2.3,2.11,2.3h.479V26.6H7.562c-2.205,0-3.836-.959-3.836-3.644a18.723,18.723,0,0,1,.192-2.205,15.68,15.68,0,0,0,.192-2.11c0-.863-.288-1.918-2.11-1.918Z\" style=\"fill:#c41718\"/><path d=\"M9.479,18.062,8.233,21.8H6.6L10.63,9.911h1.822L16.479,21.8H14.945L13.7,18.062Zm3.932-1.151L12.26,13.459a9.364,9.364,0,0,1-.575-2.205h0c-.192.671-.384,1.438-.575,2.11L9.959,16.815h3.452Z\" style=\"fill:#c41718\"/><path d=\"M17.918,19.979a5.941,5.941,0,0,0,2.781.767c1.534,0,2.493-.863,2.493-2.014s-.671-1.726-2.205-2.4c-1.918-.671-3.164-1.726-3.164-3.356,0-1.822,1.534-3.26,3.836-3.26a5.135,5.135,0,0,1,2.589.575l-.384,1.247a5.519,5.519,0,0,0-2.3-.479c-1.63,0-2.205.959-2.205,1.822,0,1.151.767,1.63,2.4,2.3,2.014.767,3.068,1.726,3.068,3.452,0,1.822-1.342,3.452-4.123,3.452a5.807,5.807,0,0,1-3.068-.767Z\" style=\"fill:#c41718\"/><path d=\"M30,16.623c-1.918,0-2.11,1.151-2.11,1.918a15.68,15.68,0,0,0,.192,2.11,15.738,15.738,0,0,1,.192,2.205c0,2.685-1.63,3.644-3.836,3.644h-.575V25.062h.479c1.438,0,2.11-.863,2.11-2.3a13,13,0,0,0-.192-1.918,14.306,14.306,0,0,1-.192-2.014c0-1.726.767-2.589,1.918-2.877v-.1c-1.151-.288-1.918-1.151-1.918-2.877a14.306,14.306,0,0,1,.192-2.014,13,13,0,0,0,.192-1.918c0-1.438-.575-2.205-2.11-2.3h-.479V5.4h.575c2.205,0,3.836,1.055,3.836,3.452a17.119,17.119,0,0,1-.192,2.205,17.119,17.119,0,0,0-.192,2.205c0,.959.288,1.918,2.11,1.918Z\" style=\"fill:#c41718\"/>",
	},
	"Ada": {
		colour: "#0f23c3",
		icon: "<path d=\"M24.554,20.075c.209.27,1.356.961,1.37,1.246a6.921,6.921,0,0,0-1.4-.324c-.468-.142-.951-.293-1.412-.48a9.2,9.2,0,0,1-2.375-1.3A3.146,3.146,0,0,1,19.3,16.75a1.722,1.722,0,0,1,1.767-1.822,3.584,3.584,0,0,1,1.593.321c.146.066,1.31.606,1.256.809a5.5,5.5,0,0,0-1.41-.112c-.649.244-.4.828-.168,1.311a7.877,7.877,0,0,0,1.078,1.554C23.58,19.005,24.3,20.082,24.554,20.075Z\" style=\"fill:#0f23c3\"/><path d=\"M24.141,16.276c.128-.59.819-1.384,1.344-.773a4.2,4.2,0,0,1,.578,1.918c.12.656.2,1.327.261,1.982.038.379.34,1.794.123,2.075a23.24,23.24,0,0,1-2.922-2.838,3.763,3.763,0,0,1-.925-1.7C22.5,15.867,23.479,16.21,24.141,16.276Z\" style=\"fill:#1a1978\"/><path d=\"M26.3,17.781c.141-.732-.406-2.592-1.067-2.949a.06.06,0,0,0,.044-.007c-.156-.444-1.359,1.116-1.228,1.174-.316-.138.774-1.984.988-2.16.7-.578,1.372-.086,1.845.543a6.036,6.036,0,0,1,.733,4.434,4.5,4.5,0,0,1-.421,1.312c-.1.22-.45,1.1-.682,1.174A14.754,14.754,0,0,0,26.3,17.781Z\" style=\"fill:#0f23c3\"/><path d=\"M3.687,8.4c.179-.188-.041-1.527.324-1.548.262-.015.553,1.741.627,1.968a9.2,9.2,0,0,0,1.127,2.329,7.529,7.529,0,0,0,4.016,2.978,4.55,4.55,0,0,0,2.366.2c.931-.208,1.82-.577,2.757-.765,1.35-.27,3.342-.352,4.438.647.7.641.376.76.043,1.421a2.445,2.445,0,0,0,.178,2.562c.235.342,1.033.827.675,1.094-.567.424-1.277-.452-1.636-.776-1.4-1.264-2.711-1.313-4.492-1.074a8.987,8.987,0,0,1-4.883-.708A9.469,9.469,0,0,1,3.687,8.4Z\" style=\"fill:#d2d2d2\"/><path d=\"M19.941,30a3.615,3.615,0,0,1-2.325-.817c.469-.092,1.021.025,1.508-.044a9.7,9.7,0,0,0,1.754-.43A10.537,10.537,0,0,0,23.9,27.155a6.55,6.55,0,0,0,2.757-5.214c.149-.088.316,1.034.319,1.091a5.789,5.789,0,0,1-.19,1.727,6.867,6.867,0,0,1-1.423,2.774A7.286,7.286,0,0,1,19.941,30Z\" style=\"fill:#d2d2d2\"/><path d=\"M18.962,19.109a5.76,5.76,0,0,1-2.05.859,13.38,13.38,0,0,1-2.224.549,8.861,8.861,0,0,1-4.435-.51,9.939,9.939,0,0,1-3.849-2.4C6.052,17.24,4.3,15.19,4.856,14.557c.248-.282.875.846,1,.992a5,5,0,0,0,1.357,1.11,10.917,10.917,0,0,0,4.035,1.456,6.693,6.693,0,0,0,2.34-.094,12.743,12.743,0,0,1,1.694-.485,4,4,0,0,1,2.113.457C17.739,18.163,18.918,18.736,18.962,19.109Z\" style=\"fill:#d2d2d2\"/><path d=\"M28.313,15.078a19.277,19.277,0,0,1-.453,3.774c-.176-.242.016-1.47,0-1.792a6.032,6.032,0,0,0-.384-2.087A4.925,4.925,0,0,0,26.1,13.312a14.728,14.728,0,0,1-1.27-1.536c-1.837-2.382-3.245-5.211-2.9-8.3.034-.308.069-1.448.411-1.445.152,0,.266,1.561.29,1.718a12.527,12.527,0,0,0,1.224,4.116c.67,1.222,1.947,2.023,2.825,3.1A6.579,6.579,0,0,1,28.313,15.078Z\" style=\"fill:#d2d2d2\"/><path d=\"M15.7,26.935a10.845,10.845,0,0,0,6.436-.687,6.941,6.941,0,0,0,4.278-4.418c.319.2-.048,1.529-.128,1.781a5.726,5.726,0,0,1-1.01,1.813,8.933,8.933,0,0,1-3.257,2.514C20.316,28.71,16.357,29.59,15.7,26.935Z\" style=\"fill:#d2d2d2\"/><path d=\"M19.151,19.376c.367,2.107-2.957,3.124-4.478,3.213-1.859.11-4.929-.292-6.06-2.031-.673-1.035.781-.09,1.188.058a8.663,8.663,0,0,0,3.06.5,11.6,11.6,0,0,0,3.305-.5,13.725,13.725,0,0,0,1.533-.576C18,19.908,18.823,19.349,19.151,19.376Z\" style=\"fill:#d2d2d2\"/><path d=\"M24.142,23.46c.4-.945-1.883-1.578-2.445-1.858a4.857,4.857,0,0,1-1.315-.867c-.181-.181-.872-.92-.807-1.219a4.912,4.912,0,0,1,1.087-.175,5.93,5.93,0,0,1,.855.588,10.323,10.323,0,0,0,.964.5A15.615,15.615,0,0,0,24.6,21.2c.308.09,1.549.208,1.727.428C26.287,21.924,24.357,23.649,24.142,23.46Z\" style=\"fill:#d2d2d2\"/><path d=\"M26.1,22.172c.265.43-1.08,1.831-1.363,2.105a9.34,9.34,0,0,1-2.566,1.728,7.748,7.748,0,0,1-2.56.753c-.679.058-1.966-.124-2.141-.979a6.951,6.951,0,0,1,1.177-.086c.462-.059.921-.149,1.376-.246a13.065,13.065,0,0,0,2.184-.645,11.506,11.506,0,0,0,2.084-1.11,10.872,10.872,0,0,0,1.078-.822C25.474,22.781,25.986,22.168,26.1,22.172Z\" style=\"fill:#d2d2d2\"/><path d=\"M18.758,11.965c-.1-1.308,2.612-1.3,3.271-1.092a5.976,5.976,0,0,1,2.982,2.475c-1.082.8-2.449.094-3.3-.654a4.324,4.324,0,0,0-1.481-1.029C19.421,11.4,19.412,11.759,18.758,11.965Z\" style=\"fill:#d2d2d2\"/><path d=\"M25.783,13.341c-.444-.029-.316.071-.647-.212-.358-.307-.614-.795-.945-1.141-.534-.558-1.242-.895-1.723-1.485a7.269,7.269,0,0,1-1.624-4.848c.018-1.489.407.187.551.675a12.276,12.276,0,0,0,1.126,2.708,46.055,46.055,0,0,0,3.4,4.321C25.882,13.361,25.824,13.338,25.783,13.341Z\" style=\"fill:#d2d2d2\"/><path d=\"M20.068,14.756c.033-.625-.911-.792-1.211-1.42-.164-.343-.211-.569.029-.7.082-.045.383.012.5-.02.271-.076.335-.273.581-.4A1.193,1.193,0,0,1,21.6,13.237,1.821,1.821,0,0,1,20.068,14.756Z\" style=\"fill:#d2d2d2\"/><path d=\"M20.5,14.745a1.931,1.931,0,0,0,1.323-1.7c.524.139.928.658,1.521.771a2.584,2.584,0,0,0,1.029-.017c.207-.045.54-.274.721-.259-.033.163-.464.546-.565.717a4.242,4.242,0,0,0-.388.9c-.229.741-.061.739-.709.311a4.284,4.284,0,0,0-1.957-.72C21.209,14.722,20.594,14.767,20.5,14.745Z\" style=\"fill:#d2d2d2\"/><path d=\"M19.905,20.734a2.008,2.008,0,0,1-1.4,1.712c-.205.091-2.018.733-2.032.348-.007-.2,1.624-.954,1.809-1.11a3.355,3.355,0,0,0,.867-1.071c.055-.112.232-.925.271-.943C19.644,19.564,19.908,20.6,19.905,20.734Z\" style=\"fill:#d2d2d2\"/><path d=\"M11.373,12.532a10.625,10.625,0,0,1,3.71-.914,10.282,10.282,0,0,1,1.865.024c.366.039,1.469.054,1.74.343a.255.255,0,0,1-.273.173c-.037.077.251.371.3.425-.034.034-1.445-.4-1.572-.424a10.632,10.632,0,0,0-2.282-.134,16,16,0,0,0-1.841.194A6.224,6.224,0,0,1,11.373,12.532Z\" style=\"fill:#d2d2d2\"/><path d=\"M22.512,10.731a1.888,1.888,0,0,1-1.517-.6c-.247-.349-.737-1.692-.385-2.021.209-.2.384.662.484.846A10.822,10.822,0,0,0,22.512,10.731Z\" style=\"fill:#d2d2d2\"/><path d=\"M27.788,19.2a19.212,19.212,0,0,1-.749,3.313c-.173-.077-.275-.778-.562-.95a4.07,4.07,0,0,0,.76-1.154C27.389,20.107,27.54,19.363,27.788,19.2Z\" style=\"fill:#d2d2d2\"/><path d=\"M19.981,11.843c-.132.268-.932,1.1-1.118.481C18.756,11.968,19.739,11.483,19.981,11.843Zm-.747.45c.228.006.012-.248.012-.266C19.245,11.984,18.878,12.293,19.234,12.293Z\" style=\"fill:#d2d2d2\"/>",
		inlineComment: [
			"--",
		],
	},
	"AL": {
		colour: "#2ea98e",
		icon: "<path d=\"M11.616,7.986A1.559,1.559,0,0,0,10.16,7H10.1a1.558,1.558,0,0,0-1.456.986L2,25H5.806l1.015-2.834h6.621L14.457,25h3.8ZM7.944,18.956l2.188-6.111,2.188,6.116Z\" style=\"fill:#2ea98e\"/><path d=\"M23.829,21.671V7.129H20.3V22.747A2.346,2.346,0,0,0,22.57,25H30V21.672Z\" style=\"fill:#2ea98e\"/>",
	},
	"ANTLR4": {
		colour: "#e44a32",
		icon: "<path d=\"M14.177,7.278a2.08,2.08,0,0,1,3.041-.8A3.571,3.571,0,0,1,18.2,8.022c1.356,3.122,2.9,6.165,4.119,9.345.645,1.5,1.429,2.938,1.994,4.468a1.455,1.455,0,0,1-2.258,1.376c-2.8-1.572-5.628-3.094-8.385-4.731,2.009.008,4.018-.008,6.025.013a19.707,19.707,0,0,0-1.288-2.918c-.781-1.858-1.6-3.7-2.358-5.565a9.783,9.783,0,0,0-1.032,2.125c-1.3,3.182-2.87,6.241-4.136,9.435-.281.59-.424,1.344-1.035,1.69a1.447,1.447,0,0,1-2.094-.738c-.241-.61.151-1.2.382-1.743.779-1.725,1.645-3.413,2.283-5.2C11.65,12.8,12.916,10.041,14.177,7.278Z\" style=\"fill:#fefefe\"/><path d=\"M13.817,2.2A13.923,13.923,0,0,1,29.526,12.549a13.733,13.733,0,0,1-2.082,11.519A14.074,14.074,0,0,1,7.738,27.293a13.852,13.852,0,0,1-5.615-9.483A14.152,14.152,0,0,1,3.451,9.85,13.961,13.961,0,0,1,13.817,2.2m.359,5.08c-1.261,2.762-2.526,5.525-3.762,8.3-.638,1.786-1.5,3.473-2.283,5.2-.231.542-.623,1.133-.382,1.743a1.447,1.447,0,0,0,2.094.738c.61-.347.753-1.1,1.035-1.69,1.266-3.194,2.833-6.253,4.136-9.435a9.783,9.783,0,0,1,1.032-2.125c.756,1.868,1.577,3.707,2.358,5.565a19.707,19.707,0,0,1,1.288,2.918c-2.007-.02-4.016-.005-6.025-.013,2.757,1.637,5.588,3.159,8.385,4.731a1.455,1.455,0,0,0,2.258-1.376c-.565-1.529-1.349-2.971-1.994-4.468-1.22-3.179-2.762-6.223-4.119-9.345a3.571,3.571,0,0,0-.982-1.544A2.08,2.08,0,0,0,14.177,7.278Z\" style=\"fill:#e44a32\"/>",
	},
	"Apache Configuration": {
		colour: "#c92037",
		icon: "<defs><linearGradient id=\"a\" x1=\"-5602.682\" y1=\"768.541\" x2=\"-5598.727\" y2=\"763.917\" gradientTransform=\"matrix(0.423, -0.906, -0.906, -0.423, 3082.853, -4748.551)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#f69923\"/><stop offset=\"0.312\" stop-color=\"#f79a23\"/><stop offset=\"0.838\" stop-color=\"#e97826\"/></linearGradient><linearGradient id=\"b\" x1=\"-5631.952\" y1=\"769.052\" x2=\"-5603.737\" y2=\"769.052\" gradientTransform=\"matrix(0.423, -0.906, -0.906, -0.423, 3082.853, -4748.551)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0.323\" stop-color=\"#9e2064\"/><stop offset=\"0.63\" stop-color=\"#c92037\"/><stop offset=\"0.751\" stop-color=\"#cd2335\"/><stop offset=\"1\" stop-color=\"#e97826\"/></linearGradient><linearGradient id=\"c\" x1=\"-5628.546\" y1=\"766.221\" x2=\"-5611.733\" y2=\"766.221\" gradientTransform=\"matrix(0.423, -0.906, -0.906, -0.423, 3082.853, -4748.551)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#282662\"/><stop offset=\"0.095\" stop-color=\"#662e8d\"/><stop offset=\"0.788\" stop-color=\"#9f2064\"/><stop offset=\"0.949\" stop-color=\"#cd2032\"/></linearGradient><linearGradient id=\"d\" x1=\"-5630.367\" y1=\"769.316\" x2=\"-5602.152\" y2=\"769.316\" xlink:href=\"#b\"/><linearGradient id=\"e\" x1=\"-5628.31\" y1=\"768.933\" x2=\"-5613.482\" y2=\"768.933\" xlink:href=\"#c\"/><linearGradient id=\"f\" x1=\"-5630.367\" y1=\"766.394\" x2=\"-5602.152\" y2=\"766.394\" xlink:href=\"#b\"/><linearGradient id=\"g\" x1=\"-5632.118\" y1=\"766.539\" x2=\"-5603.902\" y2=\"766.539\" xlink:href=\"#b\"/><linearGradient id=\"h\" x1=\"-5630.367\" y1=\"765.526\" x2=\"-5602.152\" y2=\"765.526\" xlink:href=\"#b\"/><linearGradient id=\"i\" x1=\"-5630.367\" y1=\"765.625\" x2=\"-5602.152\" y2=\"765.625\" xlink:href=\"#b\"/><linearGradient id=\"j\" x1=\"-5614.516\" y1=\"765.645\" x2=\"-5608.28\" y2=\"765.645\" xlink:href=\"#b\"/></defs><title>file_type_apache</title><path d=\"M19.993,2.133a10.267,10.267,0,0,0-2.04,2.056l.8,1.51a19.733,19.733,0,0,1,1.708-2.144c.044-.049.068-.072.068-.072l-.068.072a17.865,17.865,0,0,0-1.6,2.174,30.1,30.1,0,0,0,3.111-.385,3.288,3.288,0,0,0-.3-2.5S20.9,1.6,19.993,2.133Z\" style=\"fill:url(#a)\"/><path d=\"M18.638,10.749l.018,0-.115.013-.021.009Z\" style=\"fill:none\"/><path d=\"M17.821,13.455c-.066.015-.132.026-.2.036C17.689,13.481,17.756,13.469,17.821,13.455Z\" style=\"fill:none\"/><path d=\"M12.27,19.524c.009-.023.017-.045.025-.068q.264-.7.523-1.357.291-.741.575-1.436.3-.733.59-1.418.305-.718.6-1.384.24-.542.474-1.049.078-.169.155-.335.153-.329.3-.645.138-.291.274-.57c.03-.062.06-.123.09-.185l.015-.03-.1.011-.078-.154c-.007.015-.015.03-.023.045q-.211.418-.417.845-.119.246-.238.495-.328.689-.645,1.389T13.766,15.1q-.3.7-.594,1.4t-.567,1.387q-.289.72-.562,1.426-.062.159-.123.318-.219.569-.426,1.124l.123.243.11-.012.012-.033Q12.008,20.216,12.27,19.524Z\" style=\"fill:none\"/><path d=\"M17.57,13.5Z\" style=\"fill:none\"/><path d=\"M17.305,14.818l-.315.055h0l.161-.025C17.2,14.839,17.253,14.829,17.305,14.818Z\" style=\"fill:#be202e\"/><path d=\"M17.305,14.818l-.315.055h0l.161-.025C17.2,14.839,17.253,14.829,17.305,14.818Z\" style=\"fill:#be202e;opacity:0.3499999940395355;isolation:isolate\"/><path d=\"M17.573,13.5h0l.05-.007c.068-.01.135-.022.2-.036l-.248.042Z\" style=\"fill:#be202e\"/><path d=\"M17.573,13.5h0l.05-.007c.068-.01.135-.022.2-.036l-.248.042Z\" style=\"fill:#be202e;opacity:0.3499999940395355;isolation:isolate\"/><path d=\"M16.394,9.6q.365-.682.739-1.332.388-.674.784-1.305l.046-.075q.392-.62.79-1.191l-.8-1.51-.182.225c-.231.288-.47.6-.716.925-.277.37-.562.764-.851,1.179-.267.383-.538.784-.809,1.2-.231.353-.462.717-.692,1.09l-.026.042L15.718,10.9Q16.052,10.244,16.394,9.6Z\" style=\"fill:url(#b)\"/><path d=\"M11.651,21.192q-.207.568-.415,1.159l-.006.017-.059.167c-.093.266-.175.5-.361,1.049a2.107,2.107,0,0,1,.786.926,1.68,1.68,0,0,0-.544-1.154,3.621,3.621,0,0,0,3.489-1.42,2.791,2.791,0,0,0,.165-.313,1.451,1.451,0,0,1-1.4.513l0,0,0,0a4.059,4.059,0,0,0,2.046-1.672c.111-.178.218-.372.328-.587a3.3,3.3,0,0,1-3.109,1.01l-.842.092C11.7,21.05,11.677,21.121,11.651,21.192Z\" style=\"fill:url(#c)\"/><path d=\"M12.044,19.306q.273-.706.562-1.426.276-.69.567-1.387t.594-1.4q.308-.711.629-1.419t.645-1.389q.118-.248.238-.495.207-.426.417-.845c.007-.015.015-.03.023-.045L14.677,8.847l-.051.083c-.242.4-.484.8-.721,1.216s-.475.844-.7,1.276q-.291.547-.568,1.1l-.11.225c-.227.467-.432.918-.617,1.352q-.315.737-.556,1.406c-.107.293-.2.576-.292.847-.073.232-.142.464-.208.7q-.234.818-.4,1.631L11.5,20.748q.208-.554.426-1.124Z\" style=\"fill:url(#d)\"/><path d=\"M10.435,18.755a16.07,16.07,0,0,0-.272,1.974c0,.023,0,.046-.005.069a4.15,4.15,0,0,0-1.2-1.029,5.825,5.825,0,0,1,1.172,2.693,2.642,2.642,0,0,1-1.325-.226,2.662,2.662,0,0,0,1.13.686,3.247,3.247,0,0,0-1.571.783,3.359,3.359,0,0,1,1.861-.342C9.51,25.389,8.793,27.626,8.076,30a.625.625,0,0,0,.425-.413c.128-.43.976-3.251,2.306-6.959l.115-.318.032-.089q.211-.583.437-1.19l.1-.277,0-.005L10.45,18.684C10.445,18.707,10.439,18.731,10.435,18.755Z\" style=\"fill:url(#e)\"/><path d=\"M15.88,11.078l-.09.185q-.135.279-.274.57-.15.315-.3.645c-.052.111-.1.222-.155.335q-.234.508-.474,1.049-.3.666-.6,1.384-.291.685-.59,1.418-.284.7-.575,1.436-.259.661-.523,1.357c-.009.023-.017.045-.025.068q-.262.693-.529,1.422l-.012.033.842-.092-.05-.009a6,6,0,0,0,3.21-1.807,7.984,7.984,0,0,0,1.1-1.524,13.139,13.139,0,0,0,.706-1.467c.195-.472.382-.982.562-1.536a3.053,3.053,0,0,1-.788.274c-.051.011-.1.021-.156.03s-.107.018-.161.025h0a3.668,3.668,0,0,0,1.962-1.913,3.344,3.344,0,0,1-1.13.495c-.066.015-.132.026-.2.036l-.05.007h0a3.821,3.821,0,0,0,.839-.469c.051-.038.1-.078.148-.12.073-.063.142-.129.208-.2.042-.044.083-.09.123-.138a3.27,3.27,0,0,0,.263-.362c.025-.04.05-.08.074-.122.031-.06.061-.119.09-.178.131-.264.236-.5.319-.706.042-.1.078-.2.109-.288.013-.035.025-.07.036-.1.033-.1.06-.187.081-.265a2.605,2.605,0,0,0,.062-.275h0a1.01,1.01,0,0,1-.109.075,3.965,3.965,0,0,1-1.162.4l.773-.085-.773.085-.018,0-.119.019.021-.009-2.645.29Z\" style=\"fill:url(#f)\"/><path d=\"M18.858,5.73c-.235.361-.492.771-.768,1.236l-.044.074q-.358.6-.759,1.327-.346.626-.719,1.347-.326.629-.672,1.336l2.645-.29A3.216,3.216,0,0,0,19.99,9.62c.089-.128.178-.262.267-.4.272-.424.538-.891.776-1.355a14.074,14.074,0,0,0,.588-1.294,6.8,6.8,0,0,0,.233-.7c.048-.184.086-.358.115-.524A30.152,30.152,0,0,1,18.858,5.73Z\" style=\"fill:url(#g)\"/><path d=\"M17.149,14.848c-.053.009-.107.018-.161.025h0C17.042,14.866,17.1,14.857,17.149,14.848Z\" style=\"fill:#be202e\"/><path d=\"M17.149,14.848c-.053.009-.107.018-.161.025h0C17.042,14.866,17.1,14.857,17.149,14.848Z\" style=\"fill:#be202e;opacity:0.3499999940395355;isolation:isolate\"/><path d=\"M17.149,14.848c-.053.009-.107.018-.161.025h0C17.042,14.866,17.1,14.857,17.149,14.848Z\" style=\"fill:url(#h)\"/><path d=\"M17.57,13.5l.05-.007-.05.007Z\" style=\"fill:#be202e\"/><path d=\"M17.57,13.5l.05-.007-.05.007Z\" style=\"fill:#be202e;opacity:0.3499999940395355;isolation:isolate\"/><path d=\"M17.57,13.5l.05-.007-.05.007Z\" style=\"fill:url(#i)\"/><path d=\"M17.572,13.5h0Z\" style=\"fill:#be202e\"/><path d=\"M17.572,13.5h0Z\" style=\"fill:#be202e;opacity:0.3499999940395355;isolation:isolate\"/><path d=\"M17.572,13.5h0Z\" style=\"fill:url(#j)\"/>",
	},
	"Apex": {
		colour: "#0f9bd7",
		icon: "<path d=\"M13.652,8.338A4.906,4.906,0,0,1,17.2,6.814a4.957,4.957,0,0,1,4.32,2.56,5.972,5.972,0,0,1,2.442-.519,6.089,6.089,0,1,1-1.189,12.06,4.412,4.412,0,0,1-5.782,1.816A5.034,5.034,0,0,1,7.634,22.5a4.646,4.646,0,0,1-.96.1,4.732,4.732,0,0,1-2.337-8.812,5.438,5.438,0,0,1,9.315-5.453\" style=\"fill:#0f9bd7\"/><path d=\"M25.376,30.966h-.561a4.658,4.658,0,0,1-1.284-.137,1.9,1.9,0,0,1-.818-.482,1.726,1.726,0,0,1-.455-.843,6.77,6.77,0,0,1-.106-1.413,5.889,5.889,0,0,0-.084-1.33,1,1,0,0,0-.3-.544,1.223,1.223,0,0,0-.66-.179l-.236-.014V24.145l.236-.014a1.482,1.482,0,0,0,.549-.1.706.706,0,0,0,.273-.264,1.394,1.394,0,0,0,.181-.529,6.683,6.683,0,0,0,.044-.939,8.132,8.132,0,0,1,.112-1.643,1.7,1.7,0,0,1,.448-.841,2.144,2.144,0,0,1,.906-.492,4.514,4.514,0,0,1,1.2-.116h.561v1.9h-.25a2.589,2.589,0,0,0-.743.056.284.284,0,0,0-.148.117.839.839,0,0,0-.054.386q0,.372-.053,1.413a3.74,3.74,0,0,1-.166,1.009,1.945,1.945,0,0,1-.693,1,2.01,2.01,0,0,1,.7,1.044,4.627,4.627,0,0,1,.163,1.079c.027.657.041,1.074.041,1.256a.871.871,0,0,0,.057.408A.343.343,0,0,0,24.4,29a2.382,2.382,0,0,0,.728.06h.25Z\" style=\"fill:#fff\"/><path d=\"M21.118,25.788V24.382a1.752,1.752,0,0,0,.645-.129.936.936,0,0,0,.375-.354,1.621,1.621,0,0,0,.217-.624A6.88,6.88,0,0,0,22.4,22.3a8,8,0,0,1,.105-1.585,1.456,1.456,0,0,1,.381-.721,1.9,1.9,0,0,1,.8-.431,4.336,4.336,0,0,1,1.125-.105h.311v1.4a2.876,2.876,0,0,0-.835.073.53.53,0,0,0-.272.223,1.079,1.079,0,0,0-.088.513q0,.369-.053,1.4a3.531,3.531,0,0,1-.152.94,1.918,1.918,0,0,1-.313.595,2.47,2.47,0,0,1-.583.486,2.045,2.045,0,0,1,.565.466,1.869,1.869,0,0,1,.337.647,4.41,4.41,0,0,1,.152,1.02q.041.973.041,1.242a1.1,1.1,0,0,0,.094.539.584.584,0,0,0,.284.231,2.649,2.649,0,0,0,.823.079v1.406h-.311A4.474,4.474,0,0,1,23.6,30.59a1.644,1.644,0,0,1-.712-.419,1.478,1.478,0,0,1-.39-.724,6.621,6.621,0,0,1-.1-1.356,6.374,6.374,0,0,0-.094-1.4,1.232,1.232,0,0,0-.39-.671A1.431,1.431,0,0,0,21.118,25.788Z\" style=\"fill:#0072a0\"/><path d=\"M27.011,30.966H26.45V29.059h.25A2.329,2.329,0,0,0,27.426,29a.323.323,0,0,0,.165-.127.812.812,0,0,0,.058-.379q0-.36.05-1.375a3.725,3.725,0,0,1,.173-1.047,2.223,2.223,0,0,1,.387-.7,2.145,2.145,0,0,1,.3-.292,2.141,2.141,0,0,1-.4-.4,2.612,2.612,0,0,1-.421-1.092,17.525,17.525,0,0,1-.1-1.841,1.357,1.357,0,0,0-.053-.479c-.008-.016-.031-.062-.136-.106a2.524,2.524,0,0,0-.757-.06h-.25V19.2h.561a4.793,4.793,0,0,1,1.283.133,1.841,1.841,0,0,1,.818.485,1.781,1.781,0,0,1,.453.843,6.6,6.6,0,0,1,.109,1.414,6.359,6.359,0,0,0,.079,1.336.992.992,0,0,0,.3.537,1.226,1.226,0,0,0,.664.18l.236.014v1.879l-.236.014a1.482,1.482,0,0,0-.549.1.686.686,0,0,0-.27.262,1.484,1.484,0,0,0-.186.534,6.743,6.743,0,0,0-.043.931,8.383,8.383,0,0,1-.108,1.644,1.694,1.694,0,0,1-.446.846,2.143,2.143,0,0,1-.913.492A4.5,4.5,0,0,1,27.011,30.966Z\" style=\"fill:#fff\"/><path d=\"M30.708,25.788a1.752,1.752,0,0,0-.645.129.918.918,0,0,0-.372.354,1.725,1.725,0,0,0-.22.624,6.82,6.82,0,0,0-.047.973,8.27,8.27,0,0,1-.1,1.588,1.439,1.439,0,0,1-.378.724,1.9,1.9,0,0,1-.809.431,4.336,4.336,0,0,1-1.125.105H26.7V29.31a2.652,2.652,0,0,0,.82-.079A.572.572,0,0,0,27.8,29,1.05,1.05,0,0,0,27.9,28.5q0-.357.05-1.365a3.53,3.53,0,0,1,.158-.976,1.976,1.976,0,0,1,.343-.621A2.038,2.038,0,0,1,29,25.085a2.416,2.416,0,0,1-.633-.551,2.339,2.339,0,0,1-.375-.984,17.564,17.564,0,0,1-.094-1.8,1.571,1.571,0,0,0-.079-.586.487.487,0,0,0-.264-.226,2.8,2.8,0,0,0-.853-.079v-1.4h.311a4.576,4.576,0,0,1,1.213.123,1.587,1.587,0,0,1,.709.419,1.529,1.529,0,0,1,.39.727,6.436,6.436,0,0,1,.1,1.356,6.842,6.842,0,0,0,.088,1.4,1.223,1.223,0,0,0,.393.671,1.447,1.447,0,0,0,.8.231Z\" style=\"fill:#0072a0\"/>",
	},
	"APL": {
		colour: "#d2d2d2",
		icon: "<path d=\"M30,28.275,16,2,2,28.275H14.162V30h3.676V28.275ZM17.838,24.826V13.161l6.215,11.665Zm-9.891,0,6.215-11.665V24.826Z\" style=\"fill:#d2d2d2\"/>",
		inlineComment: [
			"⍝",
		],
	},
	"AppleScript": {
		colour: "#a8c2ab",
		icon: "<path d=\"M17.181,4.437A5.993,5.993,0,0,1,21.579,2a5.979,5.979,0,0,1-1.447,4.476,4.729,4.729,0,0,1-4.17,1.961A5.2,5.2,0,0,1,17.181,4.437Z\" style=\"fill:#a8c2ab\"/><path d=\"M16.2,10.034c.946,0,2.7-1.3,4.989-1.3a6.249,6.249,0,0,1,5.484,2.8,6.08,6.08,0,0,0-3.028,5.3,6.235,6.235,0,0,0,3.772,5.7s-2.637,7.422-6.2,7.422c-1.636,0-2.908-1.1-4.631-1.1-1.757,0-3.5,1.144-4.635,1.144C8.7,30,4.587,22.959,4.587,17.3c0-5.568,3.478-8.489,6.74-8.489C13.448,8.811,15.093,10.034,16.2,10.034Z\" style=\"fill:#a8c2ab\"/>",
		inlineComment: [
			"--",
			"#",
		],
	},
	"Arduino": {
		colour: "#2d9094",
		icon: "<defs><radialGradient id=\"a\" cx=\"767.179\" cy=\"5169.543\" r=\"14.989\" gradientTransform=\"translate(-718.112 -4953.917) scale(0.955 0.962)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#36bac0\"/><stop offset=\"1\" stop-color=\"#2d9094\"/></radialGradient></defs><title>file_type_arduino</title><path d=\"M29.645,15.925A13.77,13.77,0,1,1,15.876,2.056,13.819,13.819,0,0,1,29.645,15.925Z\" style=\"stroke:#02797e;stroke-linejoin:round;stroke-width:1.1367228454969267px;fill:url(#a)\"/><path d=\"M10.581,11.648c2.41-.076,3.359.834,4.605,2.069.285.282.579.59.9.921l.922-.991a6.223,6.223,0,0,1,3.256-1.93c1.939-.211,3.119-.122,4.311.814a5.023,5.023,0,0,1,2.245,3.9,5.653,5.653,0,0,1-3.25,5.156,5.975,5.975,0,0,1-3.913.135,7.656,7.656,0,0,1-3.541-2.987c-1.678,2.142-3.187,3.253-5.235,3.155-7.452-.354-6.842-10.075-.3-10.247Zm1.657,7.994a9.193,9.193,0,0,0,2.856-2.9c-.74-1.243-2.209-2.824-3.455-3.134a4.328,4.328,0,0,0-3.224.777,3.384,3.384,0,0,0-.762,3.686,3.674,3.674,0,0,0,4.585,1.57Zm-2.98-3.487,3.278.005v1.21l-3.283.005Zm13.448,3.6A3.843,3.843,0,0,0,24.937,17a3.458,3.458,0,0,0-1.863-3.109,3.648,3.648,0,0,0-4.2.728,7.364,7.364,0,0,0-1.649,2.151A8.936,8.936,0,0,0,19.2,19.252,4.022,4.022,0,0,0,22.706,19.754Zm-1.955-2.376-1.088-.008,0-1.217,1.091,0V15.075l1.107-.008-.007,1.093,1.085,0v1.165l-1.021-.008v1.12H20.753Z\" style=\"stroke:#000;stroke-width:0.12103096480927482px;opacity:0.1680999994277954;isolation:isolate\"/><path d=\"M4.917,16.337c0,5.348,7.354,7.34,10.987,1.894,3.765,5.647,10.824,3.28,10.824-1.9S19.7,8.656,15.9,14.441c-3.6-5.719-10.987-3.453-10.987,1.9Zm1.931,0c0-3.86,5.455-5.078,7.992,0-2.588,4.889-7.992,3.859-7.992,0Zm10.119,0c2.286-5.178,7.889-3.751,7.872.008S19.186,21.277,16.967,16.337Z\" style=\"fill:#fff;stroke:#000;stroke-width:0.24206192961854964px\"/><rect x=\"8.898\" y=\"15.795\" width=\"3.237\" height=\"1.067\" style=\"fill:#fff\"/><polygon points=\"20.644 16.846 19.576 16.846 19.576 15.712 20.644 15.712 20.644 14.644 21.779 14.644 21.779 15.712 22.847 15.712 22.847 16.846 21.779 16.846 21.779 17.914 20.644 17.914 20.644 16.846\" style=\"fill:#fff\"/>",
	},
	"ARM Assembly": {
		colour: "#0000bf",
		icon: "<defs><linearGradient id=\"a\" x1=\"836.63\" y1=\"36.205\" x2=\"843.802\" y2=\"14.48\" gradientTransform=\"translate(525.922 30.249) rotate(180) scale(0.607 0.607)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#fff\" stop-opacity=\"0\"/><stop offset=\"1\" stop-color=\"#fff\" stop-opacity=\"0.275\"/></linearGradient></defs><title>file_type_assembly</title><path d=\"M16,2c-1.246,3.056-2,5.057-3.391,8.022A21.884,21.884,0,0,0,16.2,13.156a14.858,14.858,0,0,1-4-2.283C10.43,14.579,7.646,19.855,2,30c5.186-2.994,9.012-4.648,12.691-4.966V24.2h-.834v-.837h.834V24.2h1.675V22.521H14.691v-.834h-.834V20.013h.834v-.834h1.675v.834H17.2v.837h-.837v-.837H14.691v1.675h1.675v.834H17.2V24.2h-.837v.783c3.98.1,8.006,1.772,13.634,5.021-.863-1.589-1.636-3.021-2.372-4.385a25.526,25.526,0,0,0-4.833-3.333A14.436,14.436,0,0,1,26.65,23.8C19.17,9.872,18.565,8.02,16,2ZM10.511,19.179h1.671v.834h.837v5.021h-.837V22.521H10.511v2.512H9.673V20.013h.837Zm0,.834v1.675h1.671V20.013Zm7.526-.834h.837v.834h.837v.837h.834v-.837h.837v-.834h.837v5.855h-.837V20.85h-.837v.837h-.834V20.85h-.837v4.184h-.837Z\" style=\"fill:#0000bf\"/><path d=\"M23.881,18.642c-6.069-8.237-7.476-14.876-7.832-16.461A175.217,175.217,0,0,0,23.881,18.642Z\" style=\"fill:#fff;fill-opacity:0.165680468082428\"/><path d=\"M16.051,2.12,15.6,3.227c-.159.391-.311.765-.461,1.131s-.3.724-.448,1.077-.3.7-.448,1.053-.3.706-.465,1.066-.329.729-.506,1.111-.362.778-.561,1.193c-.028.057-.061.123-.089.181A21.872,21.872,0,0,0,16.2,13.156a14.879,14.879,0,0,1-3.989-2.276l-.14.287c-.065.133-.144.283-.212.42l-.106.219c-.878,1.793-2.006,3.984-3.524,6.822,3.551-2,7.381-4.887,14.338-2.4-.349-.661-.67-1.28-.971-1.863s-.581-1.128-.841-1.644-.5-1-.725-1.463-.433-.9-.629-1.313-.38-.818-.554-1.2-.339-.754-.5-1.118S18.047,6.9,17.9,6.546s-.291-.709-.434-1.066c-.036-.091-.073-.186-.109-.277C16.949,4.247,16.536,3.258,16.051,2.12Z\" style=\"fill:url(#a)\"/>",
	},
	"AsciiDoc": {
		colour: "#e40046",
		icon: "<path d=\"M30,30H2V2H30Z\" style=\"fill:#e40046\"/><path d=\"M23.731,24.83a.589.589,0,0,1-.763-.337L16.724,9.269,13.93,15.99h1.833a.59.59,0,0,1-.024,1.18H8.9a.59.59,0,0,1,.024-1.18h3.727l0-.013L16.184,7.5a.591.591,0,0,1,.533-.363h0a.592.592,0,0,1,.557.366l6.785,16.546.009.021A.59.59,0,0,1,23.731,24.83Z\" style=\"fill:#fff\"/><path d=\"M14.516,18.791H7.679a.59.59,0,0,0-.024,1.18H11L9.309,24.043a.59.59,0,0,0,1.085.464l0-.011,1.875-4.509.005-.016h2.215a.59.59,0,0,0,.023-1.18Z\" style=\"fill:#fff\"/>",
	},
	"ASP.NET (C#)": {
		colour: "#33a9dc",
		icon: "<title>file_type_aspx</title><polygon points=\"22.75 2 6.35 2 6.35 30 29.65 30 29.65 9 22.75 2\" style=\"fill:#c5c5c5\"/><polygon points=\"27.35 27.7 8.75 27.7 8.75 4.3 20.45 4.3 20.45 11.3 27.45 11.3 27.45 27.7 27.35 27.7\" style=\"fill:#f5f5f5\"/><path d=\"M12.1,30.994A11.094,11.094,0,1,1,23.194,19.9,11.106,11.106,0,0,1,12.1,30.994Zm0-20.3A9.2,9.2,0,1,0,21.3,19.9,9.216,9.216,0,0,0,12.1,10.7Z\" style=\"fill:#33a9dc\"/><rect x=\"2.099\" y=\"19.455\" width=\"20.003\" height=\"0.89\" style=\"fill:#33a9dc;stroke:#33a9dc;stroke-miterlimit:10\"/><path d=\"M12.325,15.763a31.93,31.93,0,0,1-8.484-1.11l.242-.807a31.374,31.374,0,0,0,15.992,0l.239.807A28.076,28.076,0,0,1,12.325,15.763Z\" style=\"fill:#33a9dc;stroke:#33a9dc;stroke-miterlimit:10\"/><path d=\"M4.1,25.724l-.239-.807a31.652,31.652,0,0,1,16.472,0l-.242.807A31.38,31.38,0,0,0,4.1,25.724Z\" style=\"fill:#33a9dc;stroke:#33a9dc;stroke-miterlimit:10\"/><path d=\"M8.536,29.055A25.438,25.438,0,0,1,8,10.608l.776.331a24.558,24.558,0,0,0,.533,17.783Z\" style=\"fill:#33a9dc;stroke:#33a9dc;stroke-miterlimit:10\"/><path d=\"M15.6,29.055l-.776-.333a24.559,24.559,0,0,0,.531-17.783l.776-.331A25.443,25.443,0,0,1,15.6,29.055Z\" style=\"fill:#33a9dc;stroke:#33a9dc;stroke-miterlimit:10\"/><rect x=\"11.655\" y=\"9.898\" width=\"0.889\" height=\"20.371\" style=\"fill:#33a9dc;stroke:#33a9dc;stroke-miterlimit:10\"/>",
	},
	"AutoHotkey": {
		colour: "#d8d8d8",
		icon: "<defs><linearGradient id=\"a\" x1=\"54.604\" y1=\"168.388\" x2=\"54.604\" y2=\"194.885\" gradientTransform=\"translate(-38.604 -165.636)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#d8d8d8\"/><stop offset=\"1\" stop-color=\"#a3a3a3\"/></linearGradient><linearGradient id=\"b\" x1=\"68.756\" y1=\"209.152\" x2=\"91.638\" y2=\"209.152\" gradientTransform=\"translate(-50.601 -159.449) scale(0.832 0.837)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#d7d7d7\"/><stop offset=\"0.5\" stop-color=\"#e7e7e7\"/><stop offset=\"1\" stop-color=\"#d7d7d7\"/></linearGradient></defs><title>file_type_autohotkey</title><rect x=\"2\" y=\"2.824\" width=\"28\" height=\"26.353\" rx=\"3.088\" ry=\"3.088\" style=\"fill:url(#a)\"/><path d=\"M26.856,29.181H5.144A3.148,3.148,0,0,1,2,26.037V5.963A3.148,3.148,0,0,1,5.144,2.819H26.856A3.148,3.148,0,0,1,30,5.963V26.037A3.148,3.148,0,0,1,26.856,29.181ZM5.144,2.963a3,3,0,0,0-3,3h0V26.037a3,3,0,0,0,3,3H26.856a3,3,0,0,0,3-3V5.963a3,3,0,0,0-3-3Z\" style=\"fill:#8d8d8d\"/><rect x=\"4.313\" y=\"4.641\" width=\"23.169\" height=\"21.94\" rx=\"2.571\" ry=\"2.571\" style=\"fill:url(#b)\"/><path d=\"M24.911,26.641H6.884A2.634,2.634,0,0,1,4.253,24.01V7.212A2.634,2.634,0,0,1,6.884,4.581H24.911a2.634,2.634,0,0,1,2.631,2.631v16.8A2.634,2.634,0,0,1,24.911,26.641ZM6.884,4.7A2.514,2.514,0,0,0,4.373,7.212v16.8a2.514,2.514,0,0,0,2.511,2.511H24.911a2.514,2.514,0,0,0,2.511-2.511V7.212A2.514,2.514,0,0,0,24.911,4.7Z\" style=\"fill:#f8f8f8\"/><path d=\"M6.145,23.9l2.343-6.1h.87l2.5,6.1h-.92l-.712-1.848H7.673L7,23.9ZM7.9,21.4H9.974l-.637-1.7q-.291-.77-.433-1.265A7.776,7.776,0,0,1,8.576,19.6Z\"/><path d=\"M13.607,23.9V17.8h.807v2.5h3.171V17.8h.807v6.1h-.807V21.021h-3.17V23.9Z\"/><path d=\"M20.478,23.9V17.8h.807v3.025l3.03-3.025h1.094L22.85,20.267,25.522,23.9H24.456l-2.172-3.088-1,.974V23.9Z\"/>",
	},
	"AutoIt": {
		colour: "#5d83ac",
		icon: "<circle cx=\"16\" cy=\"16\" r=\"12.551\" style=\"fill:#5d83ac\"/><path d=\"M2,16A14,14,0,1,1,16,30,14,14,0,0,1,2,16ZM16,4.789A11.211,11.211,0,1,0,27.211,16,11.211,11.211,0,0,0,16,4.789Z\" style=\"fill:#f0f0f0\"/><path d=\"M24.576,20.156l-6.4-9.264a3.131,3.131,0,0,0-.819-.819,2.36,2.36,0,0,0-2.442.023,3.543,3.543,0,0,0-.812.8L7.533,20.156h3.752l4.808-6.8,1.838,2.71q.26.368.544.789t.5.7q-.368-.031-.865-.031h-3.53l-1.914,2.634Z\" style=\"fill:#f0f0f0\"/>",
	},
	"Avro IDL": {
		colour: "#0040ff",
		icon: "<path d=\"M2,11.649h.025a4.785,4.785,0,0,0,2.911,1.336c2.308.221,4.59-.485,6.9-.326a7.03,7.03,0,0,1,2.68.664c.5-.319.989-.662,1.486-.989.5.327.984.674,1.488.989a6.834,6.834,0,0,1,2.487-.65c1.995-.167,3.967.308,5.957.359a5.2,5.2,0,0,0,4.026-1.383H30v.236c-.178.747-.882,1.176-1.284,1.79a4.948,4.948,0,0,1-.731.791,3.8,3.8,0,0,1-.565.748,2.551,2.551,0,0,0-.594.541,2.181,2.181,0,0,1-.96.749,1.149,1.149,0,0,1-.565.56,6.69,6.69,0,0,1-1.94.184c.723.548,1.5,1.02,2.246,1.535.782.513,1.54,1.061,2.326,1.568H4.089c1.5-1.058,3.057-2.035,4.55-3.1A6.8,6.8,0,0,1,6.7,17.065a1.155,1.155,0,0,1-.569-.562,2.28,2.28,0,0,1-1.043-.86c-.268-.3-.67-.466-.853-.843-.2-.436-.658-.664-.909-1.067-.4-.642-1.137-1.076-1.327-1.846v-.239m2.939,8.528q11.059.009,22.12,0c-3.668-2.51-7.376-4.961-11.059-7.448-3.684,2.487-7.392,4.941-11.061,7.449M4.167,13.2a7.842,7.842,0,0,0,2.84.731c1.163.123,2.341.046,3.5.236a2.7,2.7,0,0,1,1.607.781c.659-.452,1.332-.885,1.987-1.342l.012-.064a5.294,5.294,0,0,0-1.877-.5c-2.693-.316-5.387.712-8.067.16m13.652.356c.688.466,1.382.925,2.07,1.392a2.488,2.488,0,0,1,1.3-.719,19.859,19.859,0,0,1,3.137-.248,9.105,9.105,0,0,0,3.5-.768c-2.582.5-5.168-.409-7.761-.2a6.256,6.256,0,0,0-2.245.545M3.339,13.166a7.264,7.264,0,0,0,2.723,1.3c-.219-.153-.376-.416-.657-.457a7.955,7.955,0,0,1-2.066-.844m23.333.825c-.317.023-.5.3-.733.473a7.232,7.232,0,0,0,2.724-1.3,8.106,8.106,0,0,1-1.991.824m-22.5.126a5.121,5.121,0,0,0,2.589,1.1c-.115-.128-.209-.312-.4-.334a10.459,10.459,0,0,1-2.19-.771m21.467.768c-.189.022-.284.2-.394.336a5.187,5.187,0,0,0,2.6-1.109,10.477,10.477,0,0,1-2.2.773M6.3,14.206a3.243,3.243,0,0,0,2.445.352c-.1-.08-.181-.215-.325-.206q-1.063-.04-2.12-.146m17.351.139c-.171-.019-.291.1-.406.211a3.108,3.108,0,0,0,2.42-.352q-1,.112-2.014.141m-16.741.538a3.669,3.669,0,0,0,2.482.319,1.107,1.107,0,0,0-.281-.376,5.158,5.158,0,0,1-2.2.057m15.7.318a3.678,3.678,0,0,0,2.487-.319,5.127,5.127,0,0,1-2.2-.057,1.1,1.1,0,0,0-.283.376M4.838,14.977a4.11,4.11,0,0,0,2.133.841c-.057-.084-.114-.168-.171-.254a6.948,6.948,0,0,1-1.962-.587m20.361.589-.169.253a4.141,4.141,0,0,0,2.136-.843,7.015,7.015,0,0,1-1.967.59m-18.1-.13a.8.8,0,0,0,.534.31,7.579,7.579,0,0,0,2.037-.073c-.009-.03-.027-.09-.036-.12-.457-.051-.923.074-1.385.047A7.054,7.054,0,0,1,7.1,15.437m16.191.151a6.28,6.28,0,0,0-.913-.041l-.042.126a7.416,7.416,0,0,0,2.045.072.7.7,0,0,0,.522-.331,4.349,4.349,0,0,1-1.613.174m-17.52.327a3.12,3.12,0,0,0,1.754.481c-.065-.24-.334-.2-.523-.236-.419-.041-.816-.186-1.231-.246M25,16.163c-.188.041-.452-.006-.521.232a2.874,2.874,0,0,0,1.732-.482c-.4.079-.8.207-1.211.251M7.735,16.119a1,1,0,0,0,.789.275,9.331,9.331,0,0,0,1.325-.158c-.021-.093-.009-.278-.163-.228a9.983,9.983,0,0,1-1.951.111m14.415.118a8.157,8.157,0,0,0,1.412.154.9.9,0,0,0,.7-.274,9.387,9.387,0,0,1-1.934-.11c-.16-.06-.155.132-.176.23m-15.438.44a1.962,1.962,0,0,0,1.3.181l-.091-.126c-.4.006-.807-.022-1.209-.055m1.615.043a1.03,1.03,0,0,0,.716.294c.179-.125.358-.252.531-.386a5.747,5.747,0,0,1-1.247.092m14.1-.093c.237.144.467.477.782.345.166-.05.369-.089.461-.257a5.271,5.271,0,0,1-1.243-.088m1.713.263a2.007,2.007,0,0,0,1.145-.213,10.269,10.269,0,0,1-1.144.049C23.993,16.667,23.984,16.961,24.138,16.89Z\" style=\"fill:#0040ff\"/><path d=\"M7.435,18.886Q11.719,16.013,16,13.137l9.3,6.244c.221.147.439.3.648.464q-9.947-.01-19.894,0c.443-.344.92-.64,1.383-.958m8.255-5.066c-.457,1.859-.907,3.719-1.375,5.576.52.015,1.041.012,1.562,0q-.013-2.841,0-5.68l-.184.1m-2.5,1.684c.255.859.48,1.728.763,2.579.289-1.238.6-2.471.9-3.707-.55.386-1.114.75-1.668,1.129m3.357-.873c-.006.682,0,1.364,0,2.046a2.1,2.1,0,0,0,1.014-.254c.193-.145.1-.409.011-.586a4.276,4.276,0,0,0-1.024-1.207M18.327,16.4c-.1.544-.666.792-1.151.9.474.7.96,1.389,1.416,2.1.469.024.94.011,1.411.009a1.631,1.631,0,0,1,.16-2.976c-.834-.6-1.7-1.14-2.544-1.727.349.5.831,1.037.708,1.7m-6.822.242c.267.921.529,1.845.794,2.767.44,0,.88.008,1.321-.007-.339-1.161-.685-2.319-1.009-3.484-.385.215-.737.482-1.1.724m8.8.452a.946.946,0,0,0,.057,1.7c.533.09.855-.533.779-.99-.026-.4-.4-.861-.836-.714M7.4,19.4q1.324.018,2.65,0c.256-.7.413-1.468.629-2.2-1.1.715-2.187,1.461-3.279,2.194m14.377-1.9a1.616,1.616,0,0,1-.876,1.9c1.233.018,2.465.015,3.7,0-.934-.644-1.883-1.266-2.822-1.9m-5.223.115c-.01.6,0,1.2,0,1.8.415,0,.831,0,1.248,0-.419-.6-.8-1.219-1.243-1.794m-5.546.941h.346c-.055-.187-.108-.376-.166-.562a3.751,3.751,0,0,0-.181.563m-.18.693c-.015.04-.045.119-.061.159.275-.026.59.071.842-.05C11.453,19.112,11.074,19.275,10.826,19.244Z\" style=\"fill:#0040ff\"/>",
	},
	"AWK": {
		colour: "#d2d2d2",
		icon: "<path d=\"M26.925,27.737C23.431,26.1,24.606,14.588,13.81,8.319,14.089,5.792,14.758-.5,7.961,3,6.845,3.128,4.907,2.331,4,4.831v.114C16.918,3.9.088,10.53,16.75,25.844c-.373.176-.674-.325-1.97.1l-.014.016c-1.722,1.135,1.933.768,4.154,1.274-1.611.417-5.594-1.137-6.3,1.645.877-.37,1,.329,1.076,1.077A26.277,26.277,0,0,1,22.379,27.5c1.1.285,4.118,2.049,5.122.551C27.519,27.93,27.221,27.876,26.925,27.737Z\"/><path d=\"M10.446,2.97l-.121.088a.266.266,0,0,0-.011.377.211.211,0,0,0,.045.039.416.416,0,0,0,.521-.063.263.263,0,0,0,.078-.364l-.01-.014c-.076-.143-.163-.177-.34-.127C10.553,2.925,10.5,2.946,10.446,2.97Z\" style=\"fill:#d2d2d2\"/><path d=\"M18,26.368c.151-.041.318-.828.174-.949A6.29,6.29,0,0,0,19.4,26.485c1.023,1.007,2.665-.032,3.482.759a10.736,10.736,0,0,0,1.957,1.027c-.139-.151-.029-.144.179-.011-.13-.338-4.421-5.156-5.226-7.18.095.293-1.608-.824-2.076-1.419-.028.056-.092-.251-.228-.434-.041.05-.2-.433-.3-.728.037.187-.462-.5-.65-.818-.056.09-.719.372-.809.286-.729-.4,2.529,4.066.122,2.559.676.683.614.4-1.095-.852.364.452-.317.312-1.553-1.523.186.2-.218-.576-.218-.576a2.692,2.692,0,0,0-.133-.483c-.056-.32-.241-.723-.12-.65-1.444-1.556,1.314-3.3.719-3.671-.111,0-.027.017-.151-.106-.09,0-.468.285-.587-.234.006.132-.034.406-.153-.1-.023.052.015.1-.03.145-.225-.576-.772-1.6-1.217-2.539-.158.155-.138-.076-.193-1.092.053.144-.225,1.921-.2.13-.128.007.108,1.258-.343.21-.141.05-.305-.363-.341-1.178-.048.623-.29.187-.5-.923-.269.508-1.6,1.743-.333,7.622-.053-.313.186.341.755,2.427.021-.039-.022-.083.038-.131a6.324,6.324,0,0,0,.677,1.365c.544.658.995,2.074.8,1.277a11.867,11.867,0,0,0,2.554,3.249A34.423,34.423,0,0,0,18,26.368Z\" style=\"fill:#d2d2d2\"/><path d=\"M10.823,2.557a.291.291,0,0,0-.051-.022c-.221-.04-.429.153-.654.032-.145.085-.257-.036-.375-.073a.224.224,0,0,0-.2.014,5.823,5.823,0,0,0-.814.582,1.037,1.037,0,0,0-.273.449c-.021.048-.037.126.05.137a2.3,2.3,0,0,0,.682.045c.177-.028.277-.152.418-.221a1.2,1.2,0,0,0,.592-.68c.064-.175.161-.167.28-.2S10.7,2.62,10.823,2.557Z\" style=\"fill:#d2d2d2\"/><path d=\"M10.325,3.058l.121-.088a.117.117,0,0,1,.12.064c.044.1.106.112.193.047.033-.025.071-.058.118-.027a.119.119,0,0,1,.041.128.276.276,0,0,1-.187.248.266.266,0,0,1-.3-.03C10.341,3.308,10.26,3.2,10.325,3.058Z\"/>",
	},
	"Batch": {
		colour: "#d9b400",
		icon: "<path d=\"M29.4,27.6H2.5V4.5H29.4Zm-25.9-1H28.4V5.5H3.5Z\" style=\"fill:#d9b400\"/><polygon points=\"6.077 19.316 5.522 18.484 10.366 15.255 5.479 11.184 6.12 10.416 12.035 15.344 6.077 19.316\" style=\"fill:#d9b400\"/><rect x=\"12.7\" y=\"18.2\" width=\"7.8\" height=\"1\" style=\"fill:#d9b400\"/><rect x=\"2.5\" y=\"5.5\" width=\"26.9\" height=\"1.9\" style=\"fill:#d9b400\"/>",
	},
	"C#": {
		colour: "#368832",
		icon: "<title>file_type_csharp</title><path d=\"M19.792,7.071h2.553V9.624H24.9V7.071h2.552V9.624H30v2.552h-2.55v2.551H30V17.28H27.449v2.552H24.9v-2.55l-2.55,0,0,2.552H19.793v-2.55l-2.553,0V14.725h2.553V12.179H17.24V9.622h2.554Zm2.553,7.658H24.9V12.176H22.345Z\" style=\"fill:#368832\"/><path d=\"M14.689,24.013a10.2,10.2,0,0,1-4.653.915,7.6,7.6,0,0,1-5.89-2.336A8.839,8.839,0,0,1,2,16.367,9.436,9.436,0,0,1,4.412,9.648a8.181,8.181,0,0,1,6.259-2.577,11.1,11.1,0,0,1,4.018.638v3.745a6.81,6.81,0,0,0-3.723-1.036,4.793,4.793,0,0,0-3.7,1.529,5.879,5.879,0,0,0-1.407,4.142,5.774,5.774,0,0,0,1.328,3.992,4.551,4.551,0,0,0,3.575,1.487,7.288,7.288,0,0,0,3.927-1.108Z\" style=\"fill:#368832\"/>",
	},
	"C": {
		colour: "#005f91",
		icon: "<title>file_type_c</title><path d=\"M10.676,15.973a10.052,10.052,0,0,0,1.175,5.151,5.446,5.446,0,0,0,6.306,2.408,4.284,4.284,0,0,0,3.09-3.6c.107-.6.109-.61.109-.61,1.737.251,4.537.658,6.274.906l-.11.44a11.256,11.256,0,0,1-2.7,5.39,9.439,9.439,0,0,1-5.366,2.688,14.61,14.61,0,0,1-8.277-.819A10.151,10.151,0,0,1,5.4,21.687a16.225,16.225,0,0,1,.019-11.45,10.538,10.538,0,0,1,8.963-7.054,13.353,13.353,0,0,1,6.666.555,9.571,9.571,0,0,1,6.167,6.9c.094.352.114.417.114.417-1.932.351-4.319.8-6.238,1.215-.362-1.915-1.265-3.428-3.2-3.9a5.263,5.263,0,0,0-6.616,3.57,10.49,10.49,0,0,0-.385,1.439A12.31,12.31,0,0,0,10.676,15.973Z\" style=\"fill:#005f91\"/>",
		inlineComment: [
			"//",
		],
	},
	"C++": {
		colour: "#984c93",
		icon: "<title>file_type_cpp</title><path d=\"M14.742,24.047a10.242,10.242,0,0,1-4.673.919A7.628,7.628,0,0,1,4.155,22.62,8.876,8.876,0,0,1,2,16.369,9.476,9.476,0,0,1,4.422,9.621a8.216,8.216,0,0,1,6.285-2.588,11.151,11.151,0,0,1,4.035.641v3.761A6.839,6.839,0,0,0,11,10.395,4.813,4.813,0,0,0,7.288,11.93a5.9,5.9,0,0,0-1.413,4.159A5.8,5.8,0,0,0,7.209,20.1a4.57,4.57,0,0,0,3.59,1.493,7.319,7.319,0,0,0,3.943-1.113Z\" style=\"fill:#984c93\"/><polygon points=\"17.112 14.829 17.112 12.485 19.456 12.485 19.456 14.829 21.8 14.829 21.8 17.172 19.456 17.172 19.456 19.515 17.112 19.515 17.112 17.172 14.77 17.172 14.77 14.828 17.112 14.829\" style=\"fill:#984c93\"/><polygon points=\"25.313 14.829 25.313 12.485 27.657 12.485 27.657 14.829 30 14.829 30 17.172 27.657 17.172 27.657 19.515 25.313 19.515 25.313 17.172 22.971 17.172 22.971 14.828 25.313 14.829\" style=\"fill:#984c93\"/>",
		inlineComment: [
			"//",
		],
	},
	"Clojure": {
		colour: "#91dc47",
		icon: "<path d=\"M16,2A14,14,0,1,0,30,16,14.016,14.016,0,0,0,16,2\" style=\"fill:#fff\"/><path d=\"M15.488,16.252c-.126.273-.265.579-.408.9A22.963,22.963,0,0,0,13.8,20.605a5.181,5.181,0,0,0-.119,1.155c0,.174.009.356.024.542a6.658,6.658,0,0,0,4.413.067,3.966,3.966,0,0,1-.44-.466c-.9-1.146-1.4-2.827-2.194-5.652\" style=\"fill:#91dc47\"/><path d=\"M12.169,10.556a6.677,6.677,0,0,0-.077,10.881c.411-1.71,1.44-3.276,2.983-6.415-.092-.252-.2-.527-.313-.817a10.207,10.207,0,0,0-1.6-2.882,4.439,4.439,0,0,0-1-.767\" style=\"fill:#91dc47\"/><path d=\"M21.84,23.7a10.877,10.877,0,0,1-2.257-.471A8.036,8.036,0,0,1,10.716,9.982a5.9,5.9,0,0,0-1.4-.171c-2.358.022-4.848,1.327-5.884,4.852a6.606,6.606,0,0,0-.074,1.361,12.649,12.649,0,0,0,23,7.274,14.737,14.737,0,0,1-3.448.459A8.881,8.881,0,0,1,21.84,23.7\" style=\"fill:#63b132\"/><path d=\"M19.463,21.244a3.53,3.53,0,0,0,.5.172A6.69,6.69,0,0,0,22.7,16.023h0a6.681,6.681,0,0,0-8.79-6.348c1.358,1.548,2.011,3.761,2.643,6.181v0s.2.673.547,1.562a15.434,15.434,0,0,0,1.363,2.788,2.924,2.924,0,0,0,1,1.036\" style=\"fill:#90b4fe\"/><path d=\"M16.013,3.372A12.632,12.632,0,0,0,5.731,8.656a6.425,6.425,0,0,1,3.48-1.009,6.8,6.8,0,0,1,3.182.772c.134.077.261.16.386.246a8.038,8.038,0,0,1,11.273,7.358h0a8.013,8.013,0,0,1-2.391,5.719,9.871,9.871,0,0,0,1.143.064,6.24,6.24,0,0,0,4.051-1.263,5.348,5.348,0,0,0,1.7-2.906A12.632,12.632,0,0,0,16.013,3.372\" style=\"fill:#5881d8\"/>",
	},
	"CMake": {
		colour: "#01a300",
		icon: "<defs><linearGradient id=\"a\" x1=\"9.955\" y1=\"9.096\" x2=\"16.68\" y2=\"23.324\" gradientTransform=\"matrix(1, 0, 0, -1, 0, 32)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#1011a1\"/><stop offset=\"1\" stop-color=\"#6969e1\"/></linearGradient><linearGradient id=\"b\" x1=\"16.231\" y1=\"19.655\" x2=\"25.618\" y2=\"3.782\" gradientTransform=\"matrix(1, 0, 0, -1, 0, 32)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#b40e0e\"/><stop offset=\"1\" stop-color=\"#ff5959\"/></linearGradient><linearGradient id=\"c\" x1=\"21.663\" y1=\"4.823\" x2=\"8.381\" y2=\"5.938\" gradientTransform=\"matrix(1, 0, 0, -1, 0, 32)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#01a300\"/><stop offset=\"1\" stop-color=\"#01df00\"/></linearGradient><linearGradient id=\"d\" x1=\"14.643\" y1=\"8.368\" x2=\"14.472\" y2=\"14.145\" gradientTransform=\"matrix(1, 0, 0, -1, 0, 32)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#848484\"/><stop offset=\"1\" stop-color=\"#d2d2d2\"/></linearGradient></defs><title>file_type_cmake</title><path d=\"M17.257,16.919,2.246,29.749,15.994,2.283Z\" style=\"fill:url(#a)\"/><path d=\"M2.262,29.768l-.038-.03L16.012,2.193l.008.088L17.283,16.93l-.01.008ZM15.977,2.374,2.324,29.649,17.23,16.908Z\"/><path d=\"M17.952,24.931,16,2.28,29.767,29.751Z\" style=\"fill:url(#b)\"/><path d=\"M29.818,29.8l-.061-.025L17.929,24.948l0-.015L15.975,2.282l.047-.013ZM17.976,24.913,29.715,29.7,16.036,2.408Z\"/><path d=\"M11.16,22.094l18.621,7.654H2.25Z\" style=\"fill:url(#c)\"/><path d=\"M29.781,29.773H2.183l.051-.044,8.921-7.665.014.006,18.622,7.655Zm-27.464-.05H29.654l-18.489-7.6Z\"/><path d=\"M11.189,22.112l6.059-5.168.843,7.98Z\" style=\"fill:url(#d)\"/><path d=\"M18.149,25l-.077-.032-6.978-2.842,6.194-5.283.01.094Zm-6.865-2.9,6.748,2.749-.824-7.8Z\"/><path d=\"M29.7,29.911H2.285a.221.221,0,0,1-.182-.088.222.222,0,0,1,.022-.2L15.864,2.187a.169.169,0,0,1,.14-.1h0a.154.154,0,0,1,.13.085L29.867,29.607a.238.238,0,0,1,.02.226A.211.211,0,0,1,29.7,29.911Zm-27.468-.16a.484.484,0,0,0,.057.011h27.4l.073-.009a.221.221,0,0,0-.028-.077L16,2.248,16,2.26,2.261,29.684a.279.279,0,0,0-.025.067Z\"/>",
	},
	"COBOL": {
		colour: "#005ca5",
		icon: "<path d=\"M22.24,6.546a4.449,4.449,0,0,0,1.765-2.522,4.636,4.636,0,0,1-.018,2.157c-.223.582-.567,1.107-.834,1.669a21.772,21.772,0,0,1,4.559-2.938C27.23,6.4,25.891,7.3,24.907,8.442c.19.409.28.989.8,1.109a5.036,5.036,0,0,0,2.5.155c.912-.313,1.345-1.258,1.8-2.035V9.14a15.738,15.738,0,0,1-.582,1.748c.2.547.409,1.092.582,1.647v.952c-.214.368-.442.726-.663,1.089a5.293,5.293,0,0,0-1.068-1.162,4.03,4.03,0,0,0-1.851-.125,3.212,3.212,0,0,0,2.413,1.47c-.359.37-.663.912-1.23.969-1.641.247-3.207-.505-4.839-.5-.282.02-.707.024-.785.372,0,.735.217,1.453.19,2.188-.059,1.258-.512,2.466-.529,3.726a13.785,13.785,0,0,0,.838,3.448c-.523-.077-1.044-.166-1.562-.26-.1.208-.184.42-.26.634A4.514,4.514,0,0,0,21.8,26.531c-.061.127-.182.381-.241.508l-.573.138c-.131.247-.263.492-.4.739a4.421,4.421,0,0,0-2.2.061c-.466-.186-.928-.376-1.389-.567a5.939,5.939,0,0,0,.407-2.315c-.282-.982-1.6-.984-2-1.877a6.233,6.233,0,0,1-1.022-2.851c-.823-.433-1.455-1.221-2.4-1.4-.048.409-.083.82-.153,1.227A6.015,6.015,0,0,1,10.481,22.6c.039.422.079.842.12,1.265.346.324.691.648,1.033.974a9.752,9.752,0,0,1-1.426.713,11.114,11.114,0,0,1-1.687.077c-.258-.254-.518-.508-.777-.764a4.871,4.871,0,0,0,.114-2.608c.171-.4.326-.812.475-1.221a5.565,5.565,0,0,1-3.01.206,5.12,5.12,0,0,1-3.29-4.33,3.859,3.859,0,0,1,1.407-3.268A6.41,6.41,0,0,0,3.2,16.259a3.038,3.038,0,0,0,2.5,2.466,3.462,3.462,0,0,0,1.96-.643,7.48,7.48,0,0,1,.363-4.133,5.524,5.524,0,0,1,3.586-2.66,4.235,4.235,0,0,0,2.011-1.566,10.67,10.67,0,0,1,1.529-1.33c-.228-.219-.453-.44-.68-.659A2.154,2.154,0,0,0,15.9,6.023c1.284-.3,2.551-.661,3.82-1.011a3.793,3.793,0,0,0,1.415.606c.317.346.494,1.157,1.1.928M18.458,19.908c.042.768-.048,1.665.674,2.155,0-.755-.046-1.507-.1-2.26Z\" style=\"fill:#005ca5\"/>",
	},
	"CoffeeScript": {
		colour: "#6f4e37",
		icon: "<path d=\"M13.114,5.728c.025.153-.051.28-.306.408a3.457,3.457,0,0,0-1.63-.229c-.637.051-1.172.255-1.1.688.1.433.713.688,1.808.586,2.674-.229,2.649-2.038,6.571-2.394,3.056-.28,4.763.662,4.992,1.808.178.891-.56,1.757-2.776,1.936-1.961.178-3.107-.357-3.209-.891-.051-.28.1-.688,1.044-.79.1.433.637.891,1.91.764C21.341,7.536,22.1,7.2,22,6.7c-.1-.535-1.07-.84-2.6-.713-3.107.28-3.871,1.987-6.52,2.216C11,8.376,9.472,7.689,9.268,6.67c-.076-.382-.076-1.273,1.91-1.452,1.019-.076,1.834.1,1.936.509ZM3.181,16.374A5.279,5.279,0,0,0,2.01,19.99a4.206,4.206,0,0,0,1.655,3.056,4,4,0,0,0,3.362.79,11.434,11.434,0,0,0,1.5-.484,4.238,4.238,0,0,1-2.751-1.019,4.13,4.13,0,0,1-1.732-2.827A3.79,3.79,0,0,1,4.658,16.5,3.977,3.977,0,0,1,7.409,15a4.806,4.806,0,0,1,3.209.942,6.95,6.95,0,0,0-.866-.866,4.1,4.1,0,0,0-3.464-.688,5.2,5.2,0,0,0-3.107,1.987ZM16.833,10.49A40.837,40.837,0,0,1,8.5,9.7C6.237,9.14,5.04,8.529,5.04,7.74c0-.331.153-.611.611-.942-1.426.56-2.19,1.019-2.19,1.732.076.79,1.35,1.579,3.948,2.19a39.443,39.443,0,0,0,9.347.942A38.993,38.993,0,0,0,26.1,10.72c2.6-.611,3.846-1.426,3.846-2.19,0-.56-.56-1.1-1.579-1.5a.862.862,0,0,1,.408.688c0,.79-1.172,1.426-3.54,1.961A39.324,39.324,0,0,1,16.833,10.49Zm9.373,2.19a42.315,42.315,0,0,1-9.347.942,44.144,44.144,0,0,1-9.424-.942c-2.19-.56-3.362-1.172-3.769-1.808a23.186,23.186,0,0,0,2.6,7.641c.942,1.426,1.885,2.674,2.827,4.024a9.883,9.883,0,0,1,.866,2.369,4.559,4.559,0,0,0,2.6,1.732,10.611,10.611,0,0,0,4.177.611h.153a11.839,11.839,0,0,0,4.3-.611,4.869,4.869,0,0,0,2.521-1.732h.076a9.592,9.592,0,0,1,.79-2.369c.942-1.35,1.885-2.6,2.827-4.024A24.62,24.62,0,0,0,30,10.872C29.491,11.585,28.319,12.2,26.205,12.681Z\" style=\"fill:#6f4e37\"/>",
	},
	"Crystal": {
		colour: "#c8c8c8",
		icon: "<path d=\"M29.941,19.816,19.8,29.928c-.028.028-.085.028-.169.028L5.8,26.267c-.028,0-.084-.028-.113-.113L2,12.352a.419.419,0,0,1,.028-.169L12.168,2.072c.028-.028.084-.028.169-.028l13.83,3.718c.028,0,.084.028.113.113l3.69,13.8C30.026,19.732,30,19.788,29.941,19.816ZM16.393,8.832,2.817,12.493q-.042,0,0,.084L12.76,22.52c.028.028.028,0,.084,0L16.506,8.972C16.449,8.832,16.393,8.832,16.393,8.832Z\" style=\"fill:#c8c8c8\"/>",
	},
	"CSS": {
		colour: "#1572b6",
		icon: "<polygon points=\"5.902 27.201 3.656 2 28.344 2 26.095 27.197 15.985 30 5.902 27.201\" style=\"fill:#1572b6\"/><polygon points=\"16 27.858 24.17 25.593 26.092 4.061 16 4.061 16 27.858\" style=\"fill:#33a9dc\"/><polygon points=\"16 13.191 20.09 13.191 20.372 10.026 16 10.026 16 6.935 16.011 6.935 23.75 6.935 23.676 7.764 22.917 16.282 16 16.282 16 13.191\" style=\"fill:#fff\"/><polygon points=\"16.019 21.218 16.005 21.222 12.563 20.292 12.343 17.827 10.67 17.827 9.24 17.827 9.673 22.68 16.004 24.438 16.019 24.434 16.019 21.218\" style=\"fill:#ebebeb\"/><polygon points=\"19.827 16.151 19.455 20.29 16.008 21.22 16.008 24.436 22.344 22.68 22.391 22.158 22.928 16.151 19.827 16.151\" style=\"fill:#fff\"/><polygon points=\"16.011 6.935 16.011 8.855 16.011 10.018 16.011 10.026 8.555 10.026 8.555 10.026 8.545 10.026 8.483 9.331 8.342 7.764 8.268 6.935 16.011 6.935\" style=\"fill:#ebebeb\"/><polygon points=\"16 13.191 16 15.111 16 16.274 16 16.282 12.611 16.282 12.611 16.282 12.601 16.282 12.539 15.587 12.399 14.02 12.325 13.191 16 13.191\" style=\"fill:#ebebeb\"/>",
	},
	"CSV": {
		colour: "#c2c2c2",
		icon: "<path d=\"M22.038,2H6.375a1.755,1.755,0,0,0-1.75,1.75v24.5A1.755,1.755,0,0,0,6.375,30h19.25a1.755,1.755,0,0,0,1.75-1.75V6.856Zm.525,2.844,1.663,1.531H22.563ZM6.375,28.25V3.75H20.813V8.125h4.813V28.25Z\" style=\"fill:#c2c2c2\"/><rect x=\"8.125\" y=\"15.097\" width=\"13.076\" height=\"1.75\" style=\"fill:#829ec2\"/><rect x=\"8.125\" y=\"24.439\" width=\"9.762\" height=\"1.75\" style=\"fill:#829ec2\"/><rect x=\"8.125\" y=\"19.763\" width=\"15.75\" height=\"1.75\" style=\"fill:#829ec2\"/><rect x=\"8.125\" y=\"10.23\" width=\"15.75\" height=\"1.75\" style=\"fill:#829ec2\"/>",
	},
	"D": {
		colour: "#b03931",
		icon: "<defs><linearGradient id=\"a\" x1=\"185.455\" y1=\"1601.641\" x2=\"181.955\" y2=\"1630.224\" gradientTransform=\"translate(-62.523 -666.646) scale(0.427)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#fff\"/><stop offset=\"1\" stop-color=\"#fff\" stop-opacity=\"0\"/></linearGradient><linearGradient id=\"b\" x1=\"176.136\" y1=\"1600.5\" x2=\"172.636\" y2=\"1629.083\" xlink:href=\"#a\"/></defs><title>file_type_dlang</title><path d=\"M3.978,15.462,3.969,8.509A.588.588,0,0,1,4.5,7.947a.658.658,0,0,1,.076,0l6.074-.009a15.7,15.7,0,0,1,6.067.95,8.9,8.9,0,0,1,2.244,1.359,4.469,4.469,0,0,1,2.946-1.083,4.11,4.11,0,0,1,4.276,3.92A4.11,4.11,0,0,1,21.907,17c-.089,0-.177-.008-.265-.012a6.617,6.617,0,0,1-.232.953,85.383,85.383,0,0,1,8.59,2.6V2H2V15.4Q2.992,15.42,3.978,15.462Zm22.8-7.944a1.32,1.32,0,0,1,1.374,1.259,1.379,1.379,0,0,1-2.747,0A1.32,1.32,0,0,1,26.78,7.517Z\" style=\"fill:#b03931\"/><path d=\"M17.861,15.787a4.114,4.114,0,0,0-1.748-3.458,5.814,5.814,0,0,0-1.508-.822,7.354,7.354,0,0,0-1.629-.438,21.629,21.629,0,0,0-2.588-.1l-2.619,0,.006,4.737a88.827,88.827,0,0,1,9.91,1.408A4.919,4.919,0,0,0,17.861,15.787Z\" style=\"fill:#b03931\"/><path d=\"M20.993,18.979a7.906,7.906,0,0,1-2.128,2.582,9.739,9.739,0,0,1-3.256,1.71,11.558,11.558,0,0,1-1.971.472h-.015a31.857,31.857,0,0,1-3.326.111l-5.625.022a.616.616,0,0,1-.686-.681l-.01-7.734Q2.992,15.42,2,15.4V30H30V20.544a85.383,85.383,0,0,0-8.59-2.6A6.985,6.985,0,0,1,20.993,18.979Z\" style=\"fill:#b03931\"/><path d=\"M20.993,18.979a7.906,7.906,0,0,1-2.128,2.582,9.739,9.739,0,0,1-3.256,1.71,11.558,11.558,0,0,1-1.971.472h-.015a31.857,31.857,0,0,1-3.326.111l-5.625.022a.616.616,0,0,1-.686-.681l-.01-7.734Q2.992,15.42,2,15.4V30H30V20.544a85.383,85.383,0,0,0-8.59-2.6A6.985,6.985,0,0,1,20.993,18.979Z\" style=\"opacity:0.300000011920929;isolation:isolate;fill:url(#a)\"/><path d=\"M10.477,20.835a16.014,16.014,0,0,0,2.877-.2,7.633,7.633,0,0,0,1.628-.5,5.628,5.628,0,0,0,1.187-.748,4.457,4.457,0,0,0,1.518-2.271,88.691,88.691,0,0,0-9.91-1.408l.006,5.133Z\" style=\"fill:#b03931\"/><path d=\"M10.477,20.835a16.014,16.014,0,0,0,2.877-.2,7.633,7.633,0,0,0,1.628-.5,5.628,5.628,0,0,0,1.187-.748,4.457,4.457,0,0,0,1.518-2.271,88.691,88.691,0,0,0-9.91-1.408l.006,5.133Z\" style=\"opacity:0.300000011920929;isolation:isolate;fill:url(#b)\"/><path d=\"M20.383,11.746a6.993,6.993,0,0,1,1.36,4.148,6.618,6.618,0,0,1-.1,1.1c.088,0,.176.012.265.012a4.11,4.11,0,0,0,4.276-3.92,4.11,4.11,0,0,0-4.276-3.92,4.47,4.47,0,0,0-2.946,1.083A8.123,8.123,0,0,1,20.383,11.746Z\" style=\"fill:#fff\"/><ellipse cx=\"26.78\" cy=\"8.777\" rx=\"1.374\" ry=\"1.259\" style=\"fill:#fff\"/><path d=\"M4.673,23.877l5.625-.022a31.871,31.871,0,0,0,3.326-.111h.015a11.49,11.49,0,0,0,1.971-.472,9.739,9.739,0,0,0,3.256-1.71,7.906,7.906,0,0,0,2.128-2.582,6.985,6.985,0,0,0,.417-1.034,7.056,7.056,0,0,0,.332-2.051,6.992,6.992,0,0,0-1.36-4.148,8.1,8.1,0,0,0-1.421-1.5,8.878,8.878,0,0,0-2.244-1.359,15.686,15.686,0,0,0-6.067-.95l-6.074.009a.658.658,0,0,0-.076,0,.588.588,0,0,0-.532.562l.009,6.952.01,7.734A.616.616,0,0,0,4.673,23.877Zm3.1-12.908,2.619,0a21.623,21.623,0,0,1,2.588.1,7.354,7.354,0,0,1,1.629.438,5.814,5.814,0,0,1,1.508.822,4.116,4.116,0,0,1,1.748,3.458,4.905,4.905,0,0,1-.175,1.327,4.457,4.457,0,0,1-1.518,2.271,5.613,5.613,0,0,1-1.187.748,7.666,7.666,0,0,1-1.628.5,16.009,16.009,0,0,1-2.877.2l-2.694,0-.006-5.133Z\" style=\"fill:#fff\"/>",
		inlineComment: [
			"//",
		],
	},
	"Dart": {
		colour: "#58b6f0",
		icon: "<path d=\"M16.739,2.037a1.314,1.314,0,0,0-.916.377l-.013.01L7.22,7.389l8.566,8.566v.006l10.3,10.3,1.963-3.536L20.968,5.728l-3.3-3.3a1.307,1.307,0,0,0-.927-.388Z\" style=\"fill:#66c3fa\"/><path d=\"M7.25,7.35,2.288,15.931l-.01.013a1.322,1.322,0,0,0-.378.919,1.3,1.3,0,0,0,.387.924L6.4,21.9l16.084,6.327,3.636-2.02-.1-.1-.025,0-10.083-10.1H15.9L7.25,7.35Z\" style=\"fill:#215896\"/><path d=\"M7.192,7.362l8.764,8.773h.013l10.087,10.1,3.839-.732L29.9,14.14l-4.054-3.973a6.521,6.521,0,0,0-3.624-1.616l0-.044L7.192,7.362Z\" style=\"fill:#235997\"/><path d=\"M7.256,7.411l8.768,8.768v.013L26.116,26.284l-.734,3.839H14.022l-3.971-4.056a6.522,6.522,0,0,1-1.614-3.625l-.044,0L7.256,7.411Z\" style=\"fill:#58b6f0\"/>",
	},
	"Dhall": {
		colour: "#b7b7b7",
		icon: "<path d=\"M16,2.07A13.93,13.93,0,1,1,2,16,13.93,13.93,0,0,1,16,2.07ZM13.28,22.32a1.49,1.49,0,1,1-1,1.83A1.49,1.49,0,0,1,13.28,22.32Zm8-15.68a.53.53,0,0,1,.38.66.52.52,0,0,1-.65.38l-.5-.13a42.67,42.67,0,0,0-.37,7.07C18.06,16.45,14.39,22,14.39,22l1.93-7.18a1,1,0,0,0,.89-.65.91.91,0,0,0-1.75-.47,1,1,0,0,0,.45,1L14,21.85a68.38,68.38,0,0,0-1.34-9.25,34.28,34.28,0,0,0,3.21-6.31l-.5-.13A.55.55,0,0,1,15,5.5a.53.53,0,0,1,.66-.38l5.68,1.52Z\" style=\"fill:#b7b7b7;fill-rule:evenodd\"/>",
	},
	"Diff": {
		colour: "#c00000",
		icon: "<rect x=\"6.975\" y=\"3\" width=\"18.05\" height=\"6.017\" style=\"fill:#c00000\"/><path d=\"M12.992,10.95v6.017H6.975v6.017h6.017V29h6.017V22.983h6.017V16.967H19.008V10.95Z\" style=\"fill:green\"/>",
	},
	"Django/Jinja2": {
		colour: "#ff0000",
		icon: "<defs><radialGradient id=\"a\" cx=\"16\" cy=\"-119.283\" r=\"13.5\" gradientTransform=\"matrix(1, 0, 0, -0.945, 0, -96.735)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#575757\"/><stop offset=\"1\" stop-color=\"#2f2f2f\"/></radialGradient></defs><title>file_type_jinja</title><path d=\"M29.34,3.241a38.271,38.271,0,0,1-9.451,3.04c-4.241.55-12.329,1.1-13.935.712A23.3,23.3,0,0,1,3.2,6.151l.334,1.132L2.5,8.188l.183.323.424.032,1.3.162.183.582.727.066.364,1.228s1.544.13,2,.13,1.363-.064,1.363-.064l.03.485.334.064v.55l-.728.648.183.032v.225a15.816,15.816,0,0,1-2.3.034c-.666-.1-.788-.1-.788-.1l-.06.064-.03.291h.151l.06,1.262,3.363-.13-.243,4.365-.03.549-2.848-.162-.03-1.164h.635l.061-.453.575-.13.091-.128-2.151-.518-1.636.485.273.227h.273l.03.389.575.032V18.7l-.635.162.121.257.151.1v.873h.394v4.041l-.637.1.091,1.164.393.066-.06,2.651,1.727.032-.364-2.619,2.605-.064-.181,1.422-.243,1,2.635.032.03-2.586,1.817-.162-.09,1.649-.061.969h1.546l-.061-2.651.213.034.06-1.262h-.243l-.09-.518L13.8,21.9l.06-1.713h.333V19.149l-.424.032.061-1.22.493-.049.023-.4.28-.041.287-.218L13.187,16.9l-1.712.379.167.274.181-.015.211-.008.039.5.477-.023.009,1.082-2.053-.047.069-1.156.067-1.051V15.455L10.7,14l4.111-.21,4.892-.282.046.929-.174,2.231L19.5,18.744l-1.8-.032-.009-1.455.667-.024.03-.411.273-.041-.014-.081.273-.015.151-.2L17.034,16,15,16.44l.144.251.227-.017v.114h.28v.46l.6.008-.007,1.277h-.605l-.009.291.213.024-.023,1.108.447.024-.053,4.39-.591.12.007.21h.206v1.124h.34l-.09,1.536L15.974,28.7l2.151.056-.069-1.164-.158-.969-.031-.841,1.826-.032-.053,1.3-.009,1.374,1.031.081,1.4-.056.44-.13-.243-.736-.06-1.156-.114-.824,1.742-.064-.076,1.01-.007,1.585.7.064.69-.015.333-.105-.2-1.5L25.2,25.445l.3-.032L25.5,24.4l.083-.017-.014-.218h-.341l-.069-.744L25.13,20.2l.257-.008V19.133l.107.017v-.21l-.38-.034.009-1.228.635-.056-.037-.413.28-.024-.016-.081.371-.186-1.886-.379-1.916.389.121.226.3-.024.016.1h.25l.014.485.621-.008.053,1.188-2.2-.017-.257-1.786-.206-.946-.166-1.7.1-.993,4.377-.332.014-1.479.22-.056-.014-.225-.167-.1s-2.393.355-3.151.436l-.371.04-.023-.274-.905-.474.011-.552.311-.009.023-.759a24.807,24.807,0,0,0,2.544-.283c.689-.162,1.666-.323,1.666-.323L26.2,7.809l.917-.267.076-.21,2.074-.574.236-.194-.788-1.722.076-.389.4-.21.288-.881ZM19.374,9.8l-.011.626.47.02-.03.594-.921.6-.057.174.371,0,0,.146-2.814.137.019-.416.128-.207.009-.133,0-.286.08-.19.03-.154v-.11l.121-.485Zm-5.885.533-.069.421.22.259-.014.453.2.315-.053.372.151.218-2.871.113-.007-.1.333-.041.016-.122-.727-.395-.039-.631.348-.017.03-.68Zm4.249,9.7,1.742.113L19.42,22.5l.227,1.923L17.8,24.354Zm-11.663.1,2.788.145L8.62,21.9v1.359l.2.759-2.727.13Zm17.843.015v4.01l-1.772.13-.061-2.118-.2-1.973ZM10.5,20.24l2.06.008.021,3.718L10.657,24l-.1-1.205-.007-1.2Z\" style=\"stroke:red;stroke-width:0.5px;fill:url(#a)\"/>",
	},
	"Docker": {
		colour: "#0096e6",
		icon: "<path d=\"M16.54,12.663H19.4v2.924h1.446a6.272,6.272,0,0,0,1.988-.333,5.091,5.091,0,0,0,.966-.436,3.584,3.584,0,0,1-.67-1.849,3.907,3.907,0,0,1,.7-2.753l.3-.348.358.288a4.558,4.558,0,0,1,1.795,2.892,4.375,4.375,0,0,1,3.319.309l.393.226-.207.4a4.141,4.141,0,0,1-4.157,1.983c-2.48,6.168-7.871,9.088-14.409,9.088-3.378,0-6.476-1.263-8.241-4.259l-.029-.049L2.7,20.227a8.316,8.316,0,0,1-.659-4.208l.04-.433H4.526V12.663H7.387V9.8h5.721V6.942H16.54v5.721Z\" style=\"fill:#0096e6\"/><path d=\"M12.006,24.567a6.022,6.022,0,0,1-3.14-3.089,10.329,10.329,0,0,1-2.264.343q-.5.028-1.045.028-.632,0-1.331-.037a9.051,9.051,0,0,0,7,2.769Q11.618,24.581,12.006,24.567Z\" style=\"fill:#fff\"/><path d=\"M7.08,13.346h.2v2.067h-.2Zm-.376,0h.2v2.067H6.7V13.346Zm-.376,0h.2v2.067h-.2Zm-.376,0h.2v2.067h-.2Zm-.376,0h.2v2.067h-.2Zm-.368,0h.2v2.067h-.2V13.346ZM5,13.14H7.482v2.479H5Zm2.859-2.861h2.48v2.479H7.863Zm2.077.207h.2v2.066h-.2Zm-.376,0h.2v2.066h-.2Zm-.376,0h.2v2.066h-.2V10.486Zm-.376,0h.2v2.066h-.2Zm-.376,0h.2v2.066h-.2Zm-.368,0h.2v2.066h-.2Zm-.207,2.653h2.48v2.48H7.863V13.14Zm2.077.207h.2v2.067h-.2Zm-.376,0h.2v2.067h-.2Zm-.376,0h.2v2.067h-.2V13.346Zm-.376,0h.2v2.067h-.2Zm-.376,0h.2v2.067h-.2Zm-.368,0h.2v2.067h-.2Zm2.654-.207H13.2v2.48h-2.48V13.14Zm2.076.207H13v2.067h-.2Zm-.376,0h.2v2.067h-.2Zm-.376,0h.2v2.067h-.2Zm-.376,0h.2v2.067h-.2Zm-.376,0h.2v2.067h-.2Zm-.368,0h.2v2.067h-.2Zm-.206-3.067H13.2v2.479h-2.48V10.279Zm2.076.207H13v2.066h-.2Zm-.376,0h.2v2.066h-.2Zm-.376,0h.2v2.066h-.2Zm-.376,0h.2v2.066h-.2Zm-.376,0h.2v2.066h-.2Zm-.368,0h.2v2.066h-.2Zm2.654,2.653h2.479v2.48h-2.48V13.14Zm2.076.207h.2v2.067h-.2Zm-.376,0h.2v2.067h-.2Zm-.376,0h.2v2.067h-.2Zm-.376,0h.2v2.067h-.2Zm-.376,0h.2v2.067h-.2Zm-.368,0h.192v2.067h-.2V13.346Zm-.206-3.067h2.479v2.479h-2.48V10.279Zm2.076.207h.2v2.066h-.2Zm-.376,0h.2v2.066h-.2Zm-.376,0h.2v2.066h-.2Zm-.376,0h.2v2.066h-.2Zm-.376,0h.2v2.066h-.2Zm-.368,0h.192v2.066h-.2V10.486Zm-.206-3.067h2.479V9.9h-2.48V7.419Zm2.076.206h.2V9.691h-.2Zm-.376,0h.2V9.691h-.2Zm-.376,0h.2V9.691h-.2Zm-.376,0h.2V9.691h-.2Zm-.376,0h.2V9.691h-.2Zm-.368,0h.192V9.691h-.2V7.625Zm2.654,5.514h2.479v2.48h-2.48V13.14Zm2.076.207h.195v2.067h-.2V13.346Zm-.376,0h.206v2.067h-.206Zm-.376,0h.2v2.067h-.2Zm-.376,0h.2v2.067h-.2Zm-.376,0h.2v2.067h-.205V13.346Zm-.368,0h.2v2.067h-.194V13.346Z\" style=\"fill:#fff\"/><path d=\"M10.188,19.638a.684.684,0,1,1-.684.684A.684.684,0,0,1,10.188,19.638Zm0,.194a.489.489,0,0,1,.177.033.2.2,0,1,0,.275.269.49.49,0,1,1-.453-.3Z\" style=\"fill:#fff\"/>",
	},
	"DOT (Graphviz)": {
		colour: "#4ed1f8",
		icon: "<polygon points=\"23.942 30 12.679 30 1.417 30 1.417 16 1.417 2 12.679 2 23.942 2 23.942 16 23.942 30\" style=\"fill:#e6e6e6\"/><rect x=\"2.132\" y=\"3.202\" width=\"21.135\" height=\"0.264\" style=\"fill:#4ed1f8\"/><rect x=\"2.132\" y=\"7.42\" width=\"21.135\" height=\"0.264\" style=\"fill:#4ed1f8\"/><rect x=\"2.132\" y=\"11.638\" width=\"21.135\" height=\"0.264\" style=\"fill:#4ed1f8\"/><rect x=\"2.132\" y=\"15.856\" width=\"21.135\" height=\"0.264\" style=\"fill:#4ed1f8\"/><rect x=\"2.132\" y=\"20.074\" width=\"21.135\" height=\"0.264\" style=\"fill:#4ed1f8\"/><rect x=\"2.132\" y=\"24.293\" width=\"21.135\" height=\"0.264\" style=\"fill:#4ed1f8\"/><rect x=\"2.132\" y=\"28.511\" width=\"21.135\" height=\"0.264\" style=\"fill:#4ed1f8\"/><rect x=\"2\" y=\"3.202\" width=\"0.264\" height=\"25.573\" style=\"fill:#4ed1f8\"/><rect x=\"6.218\" y=\"3.333\" width=\"0.264\" height=\"25.331\" style=\"fill:#4ed1f8\"/><rect x=\"10.436\" y=\"3.333\" width=\"0.264\" height=\"25.331\" style=\"fill:#4ed1f8\"/><rect x=\"14.655\" y=\"3.333\" width=\"0.264\" height=\"25.331\" style=\"fill:#4ed1f8\"/><rect x=\"18.873\" y=\"3.333\" width=\"0.264\" height=\"25.331\" style=\"fill:#4ed1f8\"/><rect x=\"23.091\" y=\"3.202\" width=\"0.264\" height=\"25.573\" style=\"fill:#4ed1f8\"/><g style=\"opacity:0.5\"><rect x=\"2.132\" y=\"27.456\" width=\"21.135\" height=\"0.264\" style=\"fill:#4ed1f8\"/><rect x=\"2.132\" y=\"26.402\" width=\"21.135\" height=\"0.264\" style=\"fill:#4ed1f8\"/><rect x=\"2.132\" y=\"25.347\" width=\"21.135\" height=\"0.264\" style=\"fill:#4ed1f8\"/><rect x=\"2.132\" y=\"23.238\" width=\"21.135\" height=\"0.264\" style=\"fill:#4ed1f8\"/><rect x=\"2.132\" y=\"22.184\" width=\"21.135\" height=\"0.264\" style=\"fill:#4ed1f8\"/><rect x=\"2.132\" y=\"21.129\" width=\"21.135\" height=\"0.264\" style=\"fill:#4ed1f8\"/><rect x=\"2.132\" y=\"19.02\" width=\"21.135\" height=\"0.264\" style=\"fill:#4ed1f8\"/><rect x=\"2.132\" y=\"17.965\" width=\"21.135\" height=\"0.264\" style=\"fill:#4ed1f8\"/><rect x=\"2.132\" y=\"16.911\" width=\"21.135\" height=\"0.264\" style=\"fill:#4ed1f8\"/><rect x=\"2.132\" y=\"14.802\" width=\"21.135\" height=\"0.264\" style=\"fill:#4ed1f8\"/><rect x=\"2.132\" y=\"13.747\" width=\"21.135\" height=\"0.264\" style=\"fill:#4ed1f8\"/><rect x=\"2.132\" y=\"12.693\" width=\"21.135\" height=\"0.264\" style=\"fill:#4ed1f8\"/><rect x=\"2.132\" y=\"10.583\" width=\"21.135\" height=\"0.264\" style=\"fill:#4ed1f8\"/><rect x=\"2.132\" y=\"9.529\" width=\"21.135\" height=\"0.264\" style=\"fill:#4ed1f8\"/><rect x=\"2.132\" y=\"8.474\" width=\"21.135\" height=\"0.264\" style=\"fill:#4ed1f8\"/><rect x=\"2.132\" y=\"6.365\" width=\"21.135\" height=\"0.264\" style=\"fill:#4ed1f8\"/><rect x=\"2.132\" y=\"5.311\" width=\"21.135\" height=\"0.264\" style=\"fill:#4ed1f8\"/><rect x=\"2.132\" y=\"4.256\" width=\"21.135\" height=\"0.264\" style=\"fill:#4ed1f8\"/></g><g style=\"opacity:0.5\"><rect x=\"22.036\" y=\"3.333\" width=\"0.264\" height=\"25.331\" style=\"fill:#4ed1f8\"/><rect x=\"20.982\" y=\"3.333\" width=\"0.264\" height=\"25.331\" style=\"fill:#4ed1f8\"/><rect x=\"19.927\" y=\"3.333\" width=\"0.264\" height=\"25.331\" style=\"fill:#4ed1f8\"/><rect x=\"17.818\" y=\"3.333\" width=\"0.264\" height=\"25.331\" style=\"fill:#4ed1f8\"/><rect x=\"16.764\" y=\"3.333\" width=\"0.264\" height=\"25.331\" style=\"fill:#4ed1f8\"/><rect x=\"15.709\" y=\"3.333\" width=\"0.264\" height=\"25.331\" style=\"fill:#4ed1f8\"/><rect x=\"13.6\" y=\"3.333\" width=\"0.264\" height=\"25.331\" style=\"fill:#4ed1f8\"/><rect x=\"12.545\" y=\"3.333\" width=\"0.264\" height=\"25.331\" style=\"fill:#4ed1f8\"/><rect x=\"11.491\" y=\"3.333\" width=\"0.264\" height=\"25.331\" style=\"fill:#4ed1f8\"/><rect x=\"9.382\" y=\"3.333\" width=\"0.264\" height=\"25.331\" style=\"fill:#4ed1f8\"/><rect x=\"8.327\" y=\"3.333\" width=\"0.264\" height=\"25.331\" style=\"fill:#4ed1f8\"/><rect x=\"7.273\" y=\"3.333\" width=\"0.264\" height=\"25.331\" style=\"fill:#4ed1f8\"/><rect x=\"5.164\" y=\"3.333\" width=\"0.264\" height=\"25.331\" style=\"fill:#4ed1f8\"/><rect x=\"4.109\" y=\"3.333\" width=\"0.264\" height=\"25.331\" style=\"fill:#4ed1f8\"/><rect x=\"3.055\" y=\"3.333\" width=\"0.264\" height=\"25.331\" style=\"fill:#4ed1f8\"/></g><path d=\"M13,8.976c-2.308,0-4.131-1.274-4.193-2.969h0a2.775,2.775,0,0,1,1.253-2.32,5.3,5.3,0,0,1,2.943-.963,5.294,5.294,0,0,1,3.006.743,2.775,2.775,0,0,1,1.421,2.221c.065,1.752-1.779,3.194-4.2,3.283C13.158,8.974,13.08,8.976,13,8.976Zm.232-5.2q-.095,0-.19,0a4.238,4.238,0,0,0-2.354.756,1.761,1.761,0,0,0-.828,1.435C9.9,7.09,11.428,7.978,13.2,7.917s3.223-1.069,3.181-2.191a1.761,1.761,0,0,0-.932-1.369A4.165,4.165,0,0,0,13.234,3.773Z\" style=\"fill:#656565\"/><path d=\"M6.4,29.281A5.238,5.238,0,0,1,3.6,28.519a2.775,2.775,0,0,1-1.41-2.229c-.056-1.752,1.8-3.185,4.213-3.262s4.356,1.236,4.412,2.988A2.775,2.775,0,0,1,9.548,28.33a5.3,5.3,0,0,1-2.948.948Q6.5,29.281,6.4,29.281Zm.186-5.2-.156,0c-1.766.056-3.229,1.052-3.193,2.174a1.761,1.761,0,0,0,.924,1.374,4.235,4.235,0,0,0,2.4.593,4.235,4.235,0,0,0,2.357-.744,1.761,1.761,0,0,0,.835-1.43C9.724,24.961,8.29,24.08,6.591,24.08Z\" style=\"fill:#656565\"/><path d=\"M19.261,29.26a5.238,5.238,0,0,1-2.807-.762,2.775,2.775,0,0,1-1.41-2.229h0c-.055-1.752,1.8-3.185,4.213-3.262a5.3,5.3,0,0,1,3,.759A2.6,2.6,0,0,1,22.4,28.31a5.3,5.3,0,0,1-2.948.948Q19.358,29.26,19.261,29.26ZM16.1,26.236a1.761,1.761,0,0,0,.924,1.374,4.57,4.57,0,0,0,4.757-.151,1.558,1.558,0,0,0-.089-2.8,4.226,4.226,0,0,0-2.4-.593c-1.766.056-3.228,1.052-3.193,2.174Z\" style=\"fill:#656565\"/><path d=\"M6.2,23.477A27.4,27.4,0,0,1,9.769,8.986l.687.391A26.609,26.609,0,0,0,6.986,23.45Z\" style=\"fill:#656565\"/><path d=\"M10.853,7.957a7.171,7.171,0,0,0-.075,2.32l-.758-.93-1.178-.23A7.165,7.165,0,0,0,10.853,7.957Z\" style=\"fill:#656565\"/><path d=\"M19.854,23.477l-.79-.027a26.59,26.59,0,0,0-.915-7.884,26.624,26.624,0,0,0-2.554-6.189l.687-.391a27.423,27.423,0,0,1,2.63,6.373A27.372,27.372,0,0,1,19.854,23.477Z\" style=\"fill:#656565\"/><path d=\"M15.2,7.957a7.171,7.171,0,0,0,2.011,1.159l-1.178.23-.758.93A7.165,7.165,0,0,0,15.2,7.957Z\" style=\"fill:#656565\"/><rect x=\"11.348\" y=\"9.945\" width=\"3.515\" height=\"0.791\" transform=\"matrix(0.016, -1, 1, 0.016, 2.557, 23.279)\" style=\"fill:#656565\"/><path d=\"M13.054,13.529a7.171,7.171,0,0,0-1.1-2.046l1.122.426,1.135-.39A7.165,7.165,0,0,0,13.054,13.529Z\" style=\"fill:#656565\"/><rect x=\"7.809\" y=\"20.081\" width=\"4.757\" height=\"0.791\" transform=\"translate(-12.56 18.108) rotate(-57.603)\" style=\"fill:#656565\"/><path d=\"M8.147,23.694a7.171,7.171,0,0,0,.133-2.317l.734.949,1.171.26A7.165,7.165,0,0,0,8.147,23.694Z\" style=\"fill:#656565\"/><rect x=\"15.418\" y=\"18.051\" width=\"0.791\" height=\"4.919\" transform=\"translate(-8.257 10.951) rotate(-30.708)\" style=\"fill:#656565\"/><path d=\"M17.8,23.856a7.171,7.171,0,0,0-2.006-1.168l1.179-.225.762-.927A7.165,7.165,0,0,0,17.8,23.856Z\" style=\"fill:#656565\"/><path d=\"M13.024,19.125a5.238,5.238,0,0,1-2.807-.762,2.775,2.775,0,0,1-1.41-2.229,2.775,2.775,0,0,1,1.266-2.314,5.3,5.3,0,0,1,2.948-.948,6.712,6.712,0,0,1,2.134.313l-.331,1a5.668,5.668,0,0,0-1.769-.261,4.238,4.238,0,0,0-2.358.744,1.761,1.761,0,0,0-.835,1.43,1.761,1.761,0,0,0,.924,1.374,4.242,4.242,0,0,0,2.4.593,5.7,5.7,0,0,0,1.678-.378l.378.985a6.844,6.844,0,0,1-2.022.448Q13.121,19.125,13.024,19.125Z\" style=\"fill:#656565\"/><path d=\"M15.435,12.876a4.338,4.338,0,0,0-.984,1.622,2.064,2.064,0,0,1-.016,2.806,4.4,4.4,0,0,0,.982,1.6,3.932,3.932,0,0,0,.078-5.986C15.476,12.9,15.454,12.893,15.435,12.876Z\" style=\"fill:#656565\"/><path d=\"M19.525,15.278a27.931,27.931,0,0,0-1.263-3.742,4.376,4.376,0,0,0-1.777.517,26.063,26.063,0,0,1,1.253,3.685,26.038,26.038,0,0,1,.734,4.534,4.347,4.347,0,0,0,1.825-.351A27.9,27.9,0,0,0,19.525,15.278Z\" style=\"fill:#656565\"/><path d=\"M16.153,12.229A4.437,4.437,0,1,0,22.3,13.5,4.437,4.437,0,0,0,16.153,12.229Zm4.812,7.332a4.346,4.346,0,1,1,1.249-6.018A4.346,4.346,0,0,1,20.965,19.561Z\" style=\"fill:#2c2928\"/><path d=\"M22.015,19.186a.822.822,0,0,0-.192-.209,4.347,4.347,0,0,1-.333.319,4.522,4.522,0,0,1-.446.337,4.73,4.73,0,0,1-.94.477.669.669,0,0,0,.031.1.64.64,0,0,0,.047.094l.487.8L22.5,19.984Z\" style=\"fill:#282828\"/><rect x=\"20.793\" y=\"20.784\" width=\"2.147\" height=\"0.44\" transform=\"translate(-7.74 14.465) rotate(-31.394)\" style=\"fill:#282828\"/><rect x=\"22.868\" y=\"20.96\" width=\"2.147\" height=\"6.887\" transform=\"translate(-9.207 16.044) rotate(-31.394)\" style=\"fill:#282828\"/><path d=\"M27.054,27.443l-.236-.387-1.833,1.119.236.387a.924.924,0,0,0,1.279.159l.11-.067A.924.924,0,0,0,27.054,27.443Z\" style=\"fill:#282828\"/><path d=\"M20.68,14.845a.315.315,0,0,1,.338.027,1.078,1.078,0,0,1,.294.578,1.1,1.1,0,0,1,.029.654.327.327,0,0,1-.278.2.468.468,0,0,1-.37-.1.922.922,0,0,1-.262-.5.955.955,0,0,1-.01-.585A.466.466,0,0,1,20.68,14.845Zm.06.227a.149.149,0,0,0-.074.063.247.247,0,0,0-.027.132,1.626,1.626,0,0,0,.064.355,1.592,1.592,0,0,0,.112.329.268.268,0,0,0,.094.11.142.142,0,0,0,.094.015.121.121,0,0,0,.078-.048.211.211,0,0,0,.028-.128,2.643,2.643,0,0,0-.186-.722.235.235,0,0,0-.093-.107A.116.116,0,0,0,20.739,15.072Z\" style=\"fill:#00ff80\"/><path d=\"M21.694,14.4a.3.3,0,0,1,.346.057,1.493,1.493,0,0,1,.325.7,1.521,1.521,0,0,1,.06.771.31.31,0,0,1-.27.228.446.446,0,0,1-.379-.137,1.31,1.31,0,0,1-.292-.617,1.341,1.341,0,0,1-.041-.7A.441.441,0,0,1,21.694,14.4Zm.072.273a.136.136,0,0,0-.072.069.315.315,0,0,0-.021.155,2.351,2.351,0,0,0,.084.427,2.31,2.31,0,0,0,.131.4.347.347,0,0,0,.1.135.13.13,0,0,0,.1.021.11.11,0,0,0,.076-.054.275.275,0,0,0,.022-.15,3.773,3.773,0,0,0-.224-.862.311.311,0,0,0-.1-.132A.1.1,0,0,0,21.766,14.674Z\" style=\"fill:#00ff80\"/><path d=\"M23.472,15.934l-.269.038-.379-1.439a.955.955,0,0,1-.257.392l-.087-.331a.841.841,0,0,0,.169-.26.874.874,0,0,0,.075-.383l.2-.089Z\" style=\"fill:#00ff80\"/><path d=\"M24.455,15.794l-.269.038-.429-1.625a1,1,0,0,1-.247.429l-.1-.376a.874.874,0,0,0,.162-.284,1.028,1.028,0,0,0,.064-.424l.2-.089Z\" style=\"fill:#00ff80\"/><path d=\"M24.636,13.117c.127-.055.249-.008.369.144a3.11,3.11,0,0,1,.416,1.034,3.143,3.143,0,0,1,.151,1.11c-.029.19-.111.294-.247.312s-.272-.059-.4-.231a2.855,2.855,0,0,1-.381-.95,2.871,2.871,0,0,1-.132-1.039A.437.437,0,0,1,24.636,13.117Zm.107.4a.124.124,0,0,0-.067.088.584.584,0,0,0,0,.221,5.218,5.218,0,0,0,.139.635,5.153,5.153,0,0,0,.184.6.66.66,0,0,0,.12.208.118.118,0,0,0,.1.04.1.1,0,0,0,.071-.072.528.528,0,0,0,0-.216,5.442,5.442,0,0,0-.144-.653,5.447,5.447,0,0,0-.189-.619.612.612,0,0,0-.119-.205A.093.093,0,0,0,24.743,13.522Z\" style=\"fill:#00ff80\"/><path d=\"M26.638,15.488l-.269.038-.54-2.039A1.151,1.151,0,0,1,25.6,14l-.126-.475a.99.99,0,0,0,.148-.337,1.436,1.436,0,0,0,.039-.515l.2-.088Z\" style=\"fill:#00ff80\"/><path d=\"M26.666,12.236c.127-.055.255.012.385.2a4.584,4.584,0,0,1,.478,1.268,4.62,4.62,0,0,1,.213,1.343c-.018.229-.1.352-.232.37s-.278-.081-.421-.3a4.284,4.284,0,0,1-.443-1.179,4.283,4.283,0,0,1-.194-1.272C26.468,12.438,26.539,12.291,26.666,12.236Zm.131.5q-.046.018-.064.1a.829.829,0,0,0,.009.266,7.856,7.856,0,0,0,.178.779q.143.541.221.738a.947.947,0,0,0,.134.258.119.119,0,0,0,.1.052q.048-.009.068-.085a.762.762,0,0,0-.008-.262,8.117,8.117,0,0,0-.182-.8q-.148-.557-.227-.757a.892.892,0,0,0-.133-.256Q26.843,12.714,26.8,12.732Z\" style=\"fill:#00ff80\"/><path d=\"M27.681,11.8c.127-.055.257.023.393.234a5.431,5.431,0,0,1,.509,1.385,5.467,5.467,0,0,1,.244,1.46c-.013.249-.088.381-.224.4s-.281-.092-.43-.328a5.11,5.11,0,0,1-.473-1.294,5.1,5.1,0,0,1-.225-1.388C27.486,12.008,27.555,11.851,27.681,11.8Zm.144.542q-.046.018-.062.106a.97.97,0,0,0,.015.289q.04.259.2.851t.24.807a1.112,1.112,0,0,0,.14.284q.057.067.106.059t.066-.091a.9.9,0,0,0-.014-.284q-.04-.26-.2-.867t-.245-.827a1.053,1.053,0,0,0-.14-.281Q27.871,12.32,27.825,12.338Z\" style=\"fill:#00ff80\"/><path d=\"M29.915,15.034l-.27.037-.706-2.661a1.478,1.478,0,0,1-.192.636l-.166-.625A1.248,1.248,0,0,0,28.708,12a2.214,2.214,0,0,0,0-.653l.2-.088Z\" style=\"fill:#00ff80\"/><path d=\"M29.712,10.921c.127-.054.263.043.409.294a7.345,7.345,0,0,1,.572,1.619A7.382,7.382,0,0,1,31,14.527c0,.288-.072.44-.209.458s-.286-.114-.447-.393a6.984,6.984,0,0,1-.535-1.524,6.944,6.944,0,0,1-.287-1.621C29.523,11.151,29.586,10.975,29.712,10.921Zm.168.633q-.046.018-.059.119a1.287,1.287,0,0,0,.027.334q.051.3.235.994t.277.946a1.484,1.484,0,0,0,.154.334q.06.08.109.071t.063-.1a1.2,1.2,0,0,0-.026-.33q-.051-.3-.239-1.011t-.282-.965a1.42,1.42,0,0,0-.153-.332Q29.926,11.536,29.88,11.553Z\" style=\"fill:#00ff80\"/><path d=\"M21.167,16.362a.422.422,0,0,1,.318.185,1.005,1.005,0,0,1-.277,1.03.42.42,0,0,1-.366,0,.59.59,0,0,1-.311-.261.808.808,0,0,1,.254-.893A.561.561,0,0,1,21.167,16.362Zm-.051.189a.175.175,0,0,0-.192.087,1.487,1.487,0,0,0-.155.567.216.216,0,0,0,.039.124.191.191,0,0,0,.084.058.145.145,0,0,0,.188-.069,1.666,1.666,0,0,0,.164-.6.189.189,0,0,0-.04-.121A.163.163,0,0,0,21.117,16.551Z\" style=\"fill:#00ff80\"/><path d=\"M22.376,16.548a.382.382,0,0,1,.311.212,1.024,1.024,0,0,1-.019.66,1.022,1.022,0,0,1-.315.581.38.38,0,0,1-.373.025.533.533,0,0,1-.3-.29,1.189,1.189,0,0,1,.309-1.1A.5.5,0,0,1,22.376,16.548Zm-.062.23a.167.167,0,0,0-.1.013.235.235,0,0,0-.1.1,2.219,2.219,0,0,0-.189.694.269.269,0,0,0,.033.147.167.167,0,0,0,.083.064.143.143,0,0,0,.1,0,.206.206,0,0,0,.094-.1,2.436,2.436,0,0,0,.2-.727.24.24,0,0,0-.034-.144A.141.141,0,0,0,22.314,16.778Z\" style=\"fill:#00ff80\"/><path d=\"M23.37,18.541l-.281-.11.328-1.225a1,1,0,0,1-.442.152l.075-.281a.881.881,0,0,0,.292-.1.68.68,0,0,0,.259-.238l.242.037Z\" style=\"fill:#00ff80\"/><path d=\"M24.793,16.919a.348.348,0,0,1,.3.266,1.751,1.751,0,0,1-.075.87,1.749,1.749,0,0,1-.371.791.345.345,0,0,1-.388.078.488.488,0,0,1-.288-.348,1.587,1.587,0,0,1,.067-.79,1.577,1.577,0,0,1,.354-.727A.457.457,0,0,1,24.793,16.919Zm-.084.312a.143.143,0,0,0-.107.025.353.353,0,0,0-.106.141,4.126,4.126,0,0,0-.257.948.408.408,0,0,0,.021.192.143.143,0,0,0,.08.075.12.12,0,0,0,.1-.011.318.318,0,0,0,.105-.137,4.418,4.418,0,0,0,.266-.981.374.374,0,0,0-.022-.189A.119.119,0,0,0,24.71,17.231Z\" style=\"fill:#00ff80\"/><path d=\"M25.649,19.43l-.281-.11.428-1.6a1.033,1.033,0,0,1-.462.227l.1-.371a.9.9,0,0,0,.3-.151.93.93,0,0,0,.281-.321l.242.037Z\" style=\"fill:#00ff80\"/><path d=\"M27.211,17.291a.344.344,0,0,1,.282.319,2.692,2.692,0,0,1-.131,1.08,2.69,2.69,0,0,1-.427,1,.34.34,0,0,1-.4.13.487.487,0,0,1-.273-.405,2.494,2.494,0,0,1,.122-1,2.47,2.47,0,0,1,.41-.937A.451.451,0,0,1,27.211,17.291Zm-.106.394a.133.133,0,0,0-.11.036.509.509,0,0,0-.117.182,6.622,6.622,0,0,0-.325,1.2.591.591,0,0,0,.009.237.133.133,0,0,0,.077.086.11.11,0,0,0,.107-.023.465.465,0,0,0,.116-.178,4.639,4.639,0,0,0,.2-.619,4.658,4.658,0,0,0,.136-.615.552.552,0,0,0-.01-.235A.11.11,0,0,0,27.105,17.685Z\" style=\"fill:#00ff80\"/><path d=\"M27.927,20.32l-.281-.11.528-1.971a1.134,1.134,0,0,1-.482.3l.123-.46a.972.972,0,0,0,.317-.2,1.248,1.248,0,0,0,.3-.4l.242.037Z\" style=\"fill:#00ff80\"/><path d=\"M28.953,20.721l-.281-.11.573-2.139a1.2,1.2,0,0,1-.491.336l.134-.5a1.02,1.02,0,0,0,.323-.22,1.413,1.413,0,0,0,.314-.44l.242.037Z\" style=\"fill:#00ff80\"/><path d=\"M30.717,17.83c.151.023.238.155.262.4a4.436,4.436,0,0,1-.213,1.385,4.434,4.434,0,0,1-.509,1.307c-.14.195-.28.263-.422.207s-.226-.22-.25-.489a4.194,4.194,0,0,1,.2-1.3,4.143,4.143,0,0,1,.492-1.241C30.42,17.9,30.566,17.807,30.717,17.83Zm-.137.513a.132.132,0,0,0-.115.053.8.8,0,0,0-.133.241,7.587,7.587,0,0,0-.244.791,7.539,7.539,0,0,0-.18.779.93.93,0,0,0-.009.3.131.131,0,0,0,.073.1.108.108,0,0,0,.111-.039.742.742,0,0,0,.132-.237,7.8,7.8,0,0,0,.248-.806,7.835,7.835,0,0,0,.185-.8.884.884,0,0,0,.008-.3Q30.633,18.353,30.58,18.343Z\" style=\"fill:#00ff80\"/>",
	},
	"EditorConfig": {
		colour: "#e3e3f8",
		icon: "<path d=\"M8.709,18.351a1.267,1.267,0,0,0,.532-1.379C8.692,17.207,8.718,17.749,8.709,18.351Z\" style=\"fill:#e3e3f8\"/><path d=\"M14.924,19.852a.871.871,0,0,0,.62-1.135A1.43,1.43,0,0,0,14.924,19.852Z\" style=\"fill:#e3e3f8\"/><path d=\"M2.713,27.079a1.538,1.538,0,0,0,.524,1.353c1.414.794,6.372.175,8.056-.2a14.994,14.994,0,0,0,2.426-1.213,22.643,22.643,0,0,0,4.713-2.557c1.082-.794,2.8-3.029,2.985-4.364l-1.475-.332c-.035,1.5-.375,1.842-1.711,2.191a10.662,10.662,0,0,1-3.57.14,3.362,3.362,0,0,1-2.313-1.562c-1.065-1.414.236-2.4-1.449-2.5-1.772,2.173-4.9.611-6.267.393a30.066,30.066,0,0,0-1.938,7.6,2.748,2.748,0,0,1,2.138.323c2.688,1.039.34,1.955-.733,1.685C3.368,27.864,3.141,27.384,2.713,27.079Z\" style=\"fill:#fdfdfd\"/><path d=\"M6.231,14.537a11.539,11.539,0,0,1,2.985,1.126c1.51.751,1.781.646,1.92,1.693.017.192-.017.3.532.471.925.288-.532-.227,1.946-.218A16.64,16.64,0,0,1,19.559,18.9c.454.288.367.655,1.9.611a18.767,18.767,0,0,0-1.2-6.162c-.864-2.007-2.007-2.313-4.338-3.064-1.362-.436-5.359-.916-6.6-.148-1.161.724-1.379,1.589-2.461,3.107A5.366,5.366,0,0,0,6.231,14.537Z\" style=\"fill:#fdfdfd\"/><path d=\"M15.84,18.246c.873.358-.044,2.671-1.257,2.112-.393-1.108.541-1.737.794-2.234a8.51,8.51,0,0,0-2.461-.148c-.576.218-.707,1.449-.41,2.025,1.4,2.741,7.567,2.156,6.913.026-.262-.864-.506-1-1.388-1.3A6.885,6.885,0,0,0,15.84,18.246Z\" style=\"fill:#fdfdfd\"/><path d=\"M4.869,17.941c.7.672,2.278.777,3.3.829C8.3,17.417,8.413,16.4,9.5,16.483a1.6,1.6,0,0,1-.305,2.13,1.386,1.386,0,0,0,1.362-1.763,14.542,14.542,0,0,0-4.46-1.894A9.506,9.506,0,0,0,4.869,17.941Z\" style=\"fill:#fdfdfd\"/><path d=\"M3.228,26.581c.576-.052,2.077.384,2.2.873C4.494,27.568,3.307,27.48,3.228,26.581Zm-.515.5c.428.305.655.786,1.388.96,1.074.271,3.421-.646.733-1.685A2.748,2.748,0,0,0,2.7,26.032a30.066,30.066,0,0,1,1.938-7.6c1.37.218,4.495,1.781,6.267-.393,1.685.1.384,1.082,1.449,2.5A3.362,3.362,0,0,0,14.662,22.1a10.662,10.662,0,0,0,3.57-.14c1.335-.349,1.676-.69,1.711-2.191l1.475.332c-.183,1.335-1.9,3.57-2.985,4.364a22.643,22.643,0,0,1-4.713,2.557,14.994,14.994,0,0,1-2.426,1.213c-1.685.375-6.642,1-8.056.2A1.538,1.538,0,0,1,2.713,27.079Zm12.211-7.227a1.43,1.43,0,0,1,.62-1.135A.871.871,0,0,1,14.924,19.852Zm.916-1.606a6.885,6.885,0,0,1,2.191.48c.882.3,1.126.436,1.388,1.3.655,2.13-5.516,2.714-6.913-.026-.3-.576-.166-1.807.41-2.025a8.51,8.51,0,0,1,2.461.148c-.253.5-1.187,1.126-.794,2.234C15.8,20.917,16.713,18.6,15.84,18.246Zm-7.131.1c.009-.6-.017-1.143.532-1.379A1.267,1.267,0,0,1,8.709,18.351Zm-3.84-.41a9.506,9.506,0,0,1,1.222-2.985,14.542,14.542,0,0,1,4.46,1.894A1.386,1.386,0,0,1,9.19,18.613a1.6,1.6,0,0,0,.305-2.13c-1.082-.079-1.2.934-1.327,2.287C7.147,18.717,5.567,18.613,4.869,17.941ZM4,17.242c-.323-.89-.323-2.278,1.047-2.392l-.7,1.946C4.162,17.216,4.162,17.12,4,17.242Zm2.234-2.706a5.366,5.366,0,0,1,.628-1.292c1.082-1.519,1.3-2.383,2.461-3.107,1.239-.768,5.237-.288,6.6.148,2.33.751,3.474,1.056,4.338,3.064a18.767,18.767,0,0,1,1.2,6.162c-1.536.044-1.449-.323-1.9-.611a16.64,16.64,0,0,0-5.944-1.292c-2.479-.009-1.021.506-1.946.218-.55-.175-.515-.279-.532-.471-.14-1.047-.41-.943-1.92-1.693A11.539,11.539,0,0,0,6.231,14.537Zm15.449-.428c-.166-.55.14-.515.672-.89a9.021,9.021,0,0,1,.925-.655c1.405-.786,4.024-.916,5.141.017A2.479,2.479,0,0,1,29.5,14.65a5.838,5.838,0,0,1-2.618,3.832,5.213,5.213,0,0,1-4.783,1.2c-.157-.384-.035-2.819-.218-3.718-.166-.8-.079-.89.384-1.37,1.362-1.414,4.312-2.444,5.988-1.231.707.524.506.724.873,1.126.454-.489-.393-2.13-3.517-2.025C23.486,12.529,22.57,14.187,21.68,14.109ZM8.971,9.143a8.094,8.094,0,0,1,2.278-4.6C12.6,3.5,14.016,2.509,16.094,3.687c.515.288.489.436.541,1.152a3.312,3.312,0,0,1-.192,1.5c-1.379,4.451-2.531,1.894-6.948,2.95a6.374,6.374,0,0,1,2.121-3.413c1.2-1.161,2.06-1.911,3.858-1.667a1.842,1.842,0,0,1-.052,2.322c-.8,1.292-1,1.213-.882,2.095.628-.157.82-.768,1.108-1.379,1.754-3.666-.794-4.111-2.357-3.439A10.372,10.372,0,0,0,9.766,7.554c-.122.244-.253.559-.367.829Zm6.913.183C16.067,8.235,17.15,7.964,17.15,4.6c0-1.449-1.781-2.749-4.111-1.781-2,.82-2.3,1.449-3.369,3.055-1,1.519-.969,3.186-1.833,4.591-.253.4-.48.541-.759.943-.2.3-.349.672-.55,1.021A12.94,12.94,0,0,0,5.367,14.4c-1.047.026-1.929.044-2.034,1.126-.14,1.484.559,1.85.559,2.409-.009.6-2.453,6.677-1.772,10.3.192,1,.847,1,1.894,1.126a17.93,17.93,0,0,0,8.056-.707l4.1-1.964a18.85,18.85,0,0,0,3.561-2.5,12.383,12.383,0,0,0,1.309-1.719,3.213,3.213,0,0,0,.8-2.208,8.473,8.473,0,0,1,2.985,1c-.061.6-.358.314-.358.855a1.355,1.355,0,0,0,1.047-.89c-.358-.524-.733-.436-1.248-.855a8.212,8.212,0,0,1,1.719-.707c1.222-.506,3.308-2.042,3.823-3.439a4.449,4.449,0,0,0-.559-3.736,5.444,5.444,0,0,0-3.648-1.161c-1.58,0-3.212,1.135-4.486,1.623-.489-.428-.524-.916-.882-1.388A12.281,12.281,0,0,0,15.884,9.326Z\" style=\"fill:#020202\"/><path d=\"M21.68,14.109c.89.079,1.807-1.58,3.928-1.65,3.125-.1,3.971,1.536,3.517,2.025-.367-.4-.166-.6-.873-1.126-1.676-1.213-4.626-.183-5.988,1.231-.463.48-.55.567-.384,1.37.183.9.061,3.334.218,3.718a5.213,5.213,0,0,0,4.783-1.2A5.838,5.838,0,0,0,29.5,14.65a2.479,2.479,0,0,0-1.082-2.069c-1.117-.934-3.736-.8-5.141-.017a9.021,9.021,0,0,0-.925.655C21.819,13.594,21.514,13.559,21.68,14.109Z\" style=\"fill:#fdf2f2\"/><path d=\"M8.971,9.143,9.4,8.383c.113-.271.244-.585.367-.829A10.372,10.372,0,0,1,13.292,3.81c1.562-.672,4.111-.227,2.357,3.439-.288.611-.48,1.222-1.108,1.379-.122-.882.079-.8.882-2.095a1.842,1.842,0,0,0,.052-2.322c-1.8-.244-2.662.506-3.858,1.667A6.374,6.374,0,0,0,9.5,9.291c4.416-1.056,5.569,1.5,6.948-2.95a3.312,3.312,0,0,0,.192-1.5c-.052-.716-.026-.864-.541-1.152-2.077-1.178-3.491-.192-4.844.855A8.094,8.094,0,0,0,8.971,9.143Z\" style=\"fill:#fef3f3\"/><path d=\"M4,17.242c.166-.122.166-.026.349-.445l.7-1.946C3.673,14.964,3.673,16.352,4,17.242Z\" style=\"fill:#efefef\"/><path d=\"M5.428,27.454c-.122-.489-1.623-.925-2.2-.873C3.307,27.48,4.494,27.568,5.428,27.454Z\" style=\"fill:#faf1f1\"/>",
	},
	"EJS": {
		colour: "#90a93a",
		icon: "<path d=\"M2,17.672V14.328l11.86-6.2V11.2L5.1,15.939l8.762,4.835v3.1Zm27.814-8.88L19.465,23.229H15.912L26.281,8.791ZM26.947,21.5a.794.794,0,0,0,.619-.278,1.061,1.061,0,0,0,.248-.732,1.141,1.141,0,0,0-.248-.753.768.768,0,0,0-1.217,0,1.141,1.141,0,0,0-.248.753,1.09,1.09,0,0,0,.237.732A.763.763,0,0,0,26.947,21.5Zm2.186,1.042a3.237,3.237,0,0,1-4.352-.01,2.864,2.864,0,0,1,0-4.1,3.223,3.223,0,0,1,4.352,0A2.773,2.773,0,0,1,30,20.486,2.74,2.74,0,0,1,29.134,22.538ZM18.821,13.061a.794.794,0,0,0,.619-.278,1.061,1.061,0,0,0,.248-.732,1.141,1.141,0,0,0-.248-.753.769.769,0,0,0-1.217,0,1.141,1.141,0,0,0-.248.753,1.09,1.09,0,0,0,.237.732A.763.763,0,0,0,18.821,13.061ZM21.007,14.1a3.237,3.237,0,0,1-4.352-.01,2.864,2.864,0,0,1,0-4.1,3.223,3.223,0,0,1,4.352,0,2.773,2.773,0,0,1,.866,2.063A2.74,2.74,0,0,1,21.007,14.1Z\" style=\"fill:#90a93a\"/>",
	},
	"Elixir": {
		colour: "#452459",
		icon: "<defs><linearGradient id=\"a\" x1=\"17.249\" y1=\"-335.597\" x2=\"14.973\" y2=\"-309.994\" gradientTransform=\"matrix(1, 0, 0, -1, 0, -306)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#fff\" stop-opacity=\"0\"/><stop offset=\"0.01\" stop-color=\"#f7f6f8\" stop-opacity=\"0.04\"/><stop offset=\"0.09\" stop-color=\"#aa9cb3\" stop-opacity=\"0.39\"/><stop offset=\"0.2\" stop-color=\"#6f567e\" stop-opacity=\"0.66\"/><stop offset=\"0.32\" stop-color=\"#452459\" stop-opacity=\"0.86\"/><stop offset=\"0.5\" stop-color=\"#2d0843\" stop-opacity=\"0.97\"/><stop offset=\"1\" stop-color=\"#26003d\"/></linearGradient></defs><title>file_type_elixir</title><path d=\"M17.8,8.591c2.079,4.584,7.64,6.5,7.141,12.474-.582,7.017-5.551,8.784-8.316,8.909a8.815,8.815,0,0,1-9.4-7.485C5.618,15.046,12.655,3.632,16.709,2A15.083,15.083,0,0,0,17.8,8.591Zm-.166,18.857a.423.423,0,0,0-.057-.327c-.593-1.1-5.81-1.645-6.907-1.752a8.272,8.272,0,0,0,1.635,1.3,7.766,7.766,0,0,0,2.814,1.041C15.922,27.831,17.467,27.933,17.635,27.447Z\" style=\"fill:#7c648f\"/><g style=\"opacity:0.25\"><path d=\"M18.248,10.618c4.47,4.823,6.445,4.979,6.237,10.478-.249,6.476-4.543,8.191-7.058,8.42-4.2.551-7.495-1.528-8.358-5.686C7.312,17.063,12.978,6.023,16.637,4.36A15.323,15.323,0,0,0,18.258,10.6Z\" style=\"fill:#26003d\"/></g><g style=\"opacity:0.75\"><path d=\"M17.385,9.921C20.369,14,24.319,13.7,25,19.641c.094,6.923-3.6,9.283-6.237,9.948-4.5,1.279-8.514-.645-10.094-5-3.035-7,2.651-18.514,6.31-20.915a15.083,15.083,0,0,0,2.37,6.237Z\" style=\"fill:url(#a)\"/></g>",
	},
	"Elm": {
		colour: "#8cd636",
		icon: "<path d=\"M16,16.768,2.768,30H29.232Z\" style=\"fill:#5fb4cb\"/><path d=\"M24.13,23.362,30,29.232V17.492Z\" style=\"fill:#eea400\"/><path d=\"M15.232,16,2,2.768V29.232Z\" style=\"fill:#596277\"/><path d=\"M30,14.448V2H17.552Z\" style=\"fill:#5fb4cb\"/><path d=\"M23.392,9.376l6.594,6.594-6.624,6.624L16.768,16ZM2.768,2,8.863,8.1H22.111L16.016,2Z\" style=\"fill:#8cd636\"/><path d=\"M16,15.232l6.051-6.051H9.949Z\" style=\"fill:#eea400\"/>",
	},
	"ERB": {
		colour: "#921a1e",
		icon: "<path d=\"M7.25,24.75h17.5L12.5,12.5,7.25,17.75ZM2,30H30V2H16L2,16Zm25.375-2.625H4.625v-10.5l12.25-12.25h10.5Z\" style=\"fill:#921a1e\"/>",
	},
	"Erlang": {
		colour: "#a2003e",
		icon: "<path d=\"M6.388,23.867a11.012,11.012,0,0,1-3.441-8.234,10.765,10.765,0,0,1,2.864-7.5H2v15.73Zm20.066,0a16.44,16.44,0,0,0,2.537-3.136l-4.218-1.873a8.306,8.306,0,0,1-6.641,4.12c-4.359-.014-6.072-3.329-6.063-7.584H28.36a6.465,6.465,0,0,0,0-.935,9.057,9.057,0,0,0-2.029-6.326H30v15.73H26.456ZM12.332,11.742a3.723,3.723,0,0,1,3.9-3.23,3.29,3.29,0,0,1,3.532,3.23Z\" style=\"fill:#a2003e\"/>",
	},
	"F#": {
		colour: "#378bba",
		icon: "<path d=\"M2,16,15.288,2.712V9.356L8.644,16l6.644,6.644v6.644Z\" style=\"fill:#378bba\"/><path d=\"M10.542,16l4.746-4.746v9.492Z\" style=\"fill:#378bba\"/><path d=\"M30,16,16.237,2.712V9.356L22.881,16l-6.644,6.644v6.644Z\" style=\"fill:#30b9db\"/>",
	},
	"Firestore security rules": {
		colour: "#f6820c",
		icon: "<path d=\"M5.8,24.6l.17-.237L13.99,9.149l.017-.161-3.535-6.64a.656.656,0,0,0-1.227.207Z\" style=\"fill:#ffc24a\"/><path d=\"M5.9,24.42l.128-.25L13.965,9.114,10.439,2.448a.6.6,0,0,0-1.133.206Z\" style=\"fill:#ffa712\"/><path d=\"M16.584,14.01l2.632-2.7L16.583,6.289a.678.678,0,0,0-1.195,0L13.981,8.971V9.2Z\" style=\"fill:#f4bd62\"/><path d=\"M16.537,13.9,19.1,11.28,16.537,6.4a.589.589,0,0,0-1.074-.047L14.049,9.082l-.042.139Z\" style=\"fill:#ffa50e\"/><polygon points=\"5.802 24.601 5.879 24.523 6.158 24.41 16.418 14.188 16.548 13.834 13.989 8.956 5.802 24.601\" style=\"fill:#f6820c\"/><path d=\"M16.912,29.756,26.2,24.577,23.546,8.246A.635.635,0,0,0,22.471,7.9L5.8,24.6l9.233,5.155a1.927,1.927,0,0,0,1.878,0\" style=\"fill:#fde068\"/><path d=\"M26.115,24.534,23.483,8.326a.557.557,0,0,0-.967-.353L5.9,24.569l9.131,5.1a1.912,1.912,0,0,0,1.863,0Z\" style=\"fill:#fcca3f\"/><path d=\"M16.912,29.6a1.927,1.927,0,0,1-1.878,0L5.876,24.522,5.8,24.6l9.233,5.155a1.927,1.927,0,0,0,1.878,0L26.2,24.577l-.023-.14Z\" style=\"fill:#eeab37\"/><polygon points=\"23.201 13 15.405 16.534 15.405 27.603 21.625 24.785 21.625 31 31 26.743 31 16.534 23.201 13\" style=\"fill:#252525\"/><polygon points=\"23.201 14.73 16.985 17.549 16.985 20.327 23.201 17.507 29.421 20.327 29.421 17.549 23.201 14.73\" style=\"fill:#fff\"/><polygon points=\"23.201 19.564 16.985 22.381 16.985 25.158 23.201 22.337 29.421 25.158 29.421 22.381 23.201 19.564\" style=\"fill:#fff\"/><polygon points=\"28.606 26.098 25.551 24.712 23.201 25.778 23.201 28.548 28.606 26.098\" style=\"fill:#fff\"/>",
	},
	"Flow": {
		colour: "#ffb047",
		icon: "<defs><linearGradient id=\"a\" x1=\"-67.907\" y1=\"-308.551\" x2=\"-67.857\" y2=\"-308.564\" gradientTransform=\"matrix(87.822, 0, 0, -88.533, 5984.532, -27290.617)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#ffd441\"/><stop offset=\"1\" stop-color=\"#ffb047\"/></linearGradient><linearGradient id=\"b\" x1=\"-67.674\" y1=\"-310.121\" x2=\"-67.647\" y2=\"-310.063\" gradientTransform=\"matrix(87.822, 0, 0, -88.533, 5964.667, -27443)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#ffd754\"/><stop offset=\"1\" stop-color=\"#ffb532\"/></linearGradient><linearGradient id=\"c\" x1=\"-67.029\" y1=\"-310.91\" x2=\"-67.029\" y2=\"-310.86\" gradientTransform=\"matrix(87.822, 0, 0, -88.533, 5902.8, -27518.733)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#ffd642\"/><stop offset=\"0\" stop-color=\"#ffd441\"/><stop offset=\"1\" stop-color=\"#ffb532\"/></linearGradient><linearGradient id=\"d\" x1=\"-66.252\" y1=\"-310.377\" x2=\"-66.32\" y2=\"-310.362\" gradientTransform=\"matrix(106.198, 0, 0, -88.551, 7048.428, -27474.167)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#ffd441\"/><stop offset=\"1\" stop-color=\"#ffa829\"/></linearGradient></defs><title>file_type_flow</title><path d=\"M23.426,29.41V22.172h-7.18l7.18,7.238\" style=\"fill:#ffdf51;fill-opacity:0.699999988079071\"/><path d=\"M24.231,25.306V17.477H16.466l7.766,7.829\" style=\"fill:#ff8900;fill-opacity:0.699999988079071\"/><path d=\"M19.515,22.171V30h7.766l-7.766-7.829\" style=\"fill-opacity:0.699999988079071;fill:url(#a)\"/><path d=\"M22.608,18V11.809H16.466L22.608,18\" style=\"fill:#ffdf4f;fill-opacity:0.699999988079071\"/><path d=\"M25.524,16.525V8.7H17.759l7.766,7.829\" style=\"fill-opacity:0.799999952316284;fill:url(#b)\"/><path d=\"M12.288,2V9.829h7.766L12.288,2\" style=\"fill-opacity:0.800000011920929;fill:url(#c)\"/><path d=\"M14.11,14.262V6.433H4.719l7.732,7.83,1.659,0\" style=\"fill-opacity:0.879999995231628;fill:url(#d)\"/><path d=\"M14.11,29.958V20.487H4.719l9.391,9.471\" style=\"fill:#ffb700;fill-opacity:0.699999988079071\"/><path d=\"M14.112,22.114V14.285H6.346l7.766,7.829\" style=\"fill:#ffb700;fill-opacity:0.5\"/><path d=\"M16.465,11.809v7.829h7.766l-7.766-7.829\" style=\"fill:#ffcd25;fill-opacity:0.699999988079071\"/><path d=\"M14.092,12.691V4.862H6.326l7.766,7.829\" style=\"fill:#ff8900;fill-opacity:0.700000047683716\"/><path d=\"M16.246,22.171V30h7.766l-7.766-7.829\" style=\"fill:#ff8900;fill-opacity:0.699999988079071\"/><polygon points=\"21.122 22.172 18.609 19.638 16.465 19.638 16.466 11.809 20.847 11.809 18.882 9.829 14.092 9.829 14.11 14.262 14.11 20.487 14.11 30 16.246 30 16.246 22.172 21.122 22.172\" style=\"fill:#fff\"/>",
	},
	"Fortran": {
		colour: "#734f96",
		icon: "<g id=\"g3768\"><rect id=\"rect881\" x=\"2.34\" y=\"2.34\" width=\"27.33\" height=\"27.33\" rx=\"5.08\" style=\"fill:#734f96\"/><path id=\"path1412\" d=\"M6.06,25.5c0-1.09,0-1.19.1-1.19l1.25-.06c1,0,1.18-.06,1.42-.19a.74.74,0,0,0,.39-.37c.12-.23.12-.29.12-7.72,0-7,0-7.5-.1-7.67a1.06,1.06,0,0,0-.63-.5,10.23,10.23,0,0,0-1.38-.1l-1.17,0V5.32H25.94v8.82H24.89a8.56,8.56,0,0,1-1.2-.05c-.14,0-.15-.05-.22-.95a12.73,12.73,0,0,0-.35-2.43,3.22,3.22,0,0,0-2.63-2.81c-.57-.1-3.1-.2-5.19-.2H13.87v6.63l.75,0A6.33,6.33,0,0,0,16.49,14a1.88,1.88,0,0,0,.89-.91,5.86,5.86,0,0,0,.39-1.75c0-.33.08-.66.1-.73s0-.13,1.18-.13H20.2V21.06H17.85l0-.61a7.85,7.85,0,0,0-.54-2.66c-.36-.68-1.05-1-2.45-1.08l-.76-.07-.2,0,0,3.34c0,3.51,0,3.65.3,3.94s.43.32,3.22.42c.05,0,.07.28.07,1.19v1.18H6.06Z\" style=\"fill:#fff\"/></g>",
	},
	"FreeMarker Template Language": {
		colour: "#0050b2",
		icon: "<path d=\"M24.023,20.9,25.408,23l4.615-7L25.408,9l-1.385,2.1L27.255,16Z\" style=\"fill:#0050b2\"/><path d=\"M7.977,11.1,6.592,9,1.977,16l4.615,7,1.385-2.1L4.745,16Z\" style=\"fill:#0050b2\"/><path d=\"M13.035,9h2.8l-.494,2.8h2.8L18.635,9h2.8l-.494,2.8h2.8l-.495,2.8h-2.8l-.493,2.8h2.8l-.494,2.8h-2.8L18.967,23h-2.8l.493-2.8-2.8,0L13.375,23H10.567l.493-2.8-2.8,0,.494-2.8h2.8l.493-2.793h-2.8L9.741,11.8h2.8Zm1.319,8.4h2.8l.494-2.8h-2.8Z\" style=\"fill:#0050b2\"/>",
	},
	"GameMaker Language": {
		colour: "#8bc34a",
		icon: "<path d=\"M14.216,24.167h-.989a3.24,3.24,0,0,1-2.811-1.649L6.667,16l4.681-8.167H16.2l-4.34,8.176.057.032L13.936,19.5H16.82ZM8.455,10.535l-1.27-2.21a1,1,0,0,0-.859-.492H2l4,6.992ZM21.54,9.482a3.239,3.239,0,0,0-2.812-1.649H17.523L15.045,12.5H18.02L20.083,16l-4.531,8.167h5.056L25.333,16ZM26,17.172l-2.47,4.27,1.283,2.233a1,1,0,0,0,.859.492H30Z\" style=\"fill:#8bc34a\"/>",
	},
	"G-code": {
		colour: "#ba0000",
		icon: "<path d=\"M17.333,16.356h0L17.309,20.8l-2.1-1.018.023-4.437h0l10.558-3.038,2.106,1.013Z\" style=\"fill:#8e0000\"/><path d=\"M24.492,18.576a14.909,14.909,0,0,1-1.343,3.074,7.86,7.86,0,0,1-1.39,1.829,6.8,6.8,0,0,1-1.7,1.324,7.405,7.405,0,0,1-2.006.855,6,6,0,0,1-3.072.23A4.668,4.668,0,0,1,12.44,24.64a5.322,5.322,0,0,1-.636-.629l-.508-.244a4.717,4.717,0,0,0,.457.181,5.52,5.52,0,0,1-1.015-1.758,8.135,8.135,0,0,1-.43-1.533c-.023-.131-.043-.239-.061-.34a7.292,7.292,0,0,0,.377,1.354,5.836,5.836,0,0,0,1.614,2.319c.06.054.127.1.19.148.04.008.078.022.119.029a6.454,6.454,0,0,0,2.928-.219,8.4,8.4,0,0,0,1.91-.807,7.658,7.658,0,0,0,1.589-1.227,8.662,8.662,0,0,0,1.29-1.69,12.667,12.667,0,0,0,1.019-2.194L23.3,19c.056-.153.091-.254.091-.254Z\" style=\"fill:#8e0000\"/><path d=\"M24.524,4.013a11.6,11.6,0,0,0-6.588-1.994,13.8,13.8,0,0,0-9.373,4.84A18.243,18.243,0,0,0,4,18.8c.021,3.851,1.481,7.806,5.112,9.575a13.563,13.563,0,0,0,4.159,1.564,12.114,12.114,0,0,0,6.869-1.529c-2.734,1.333-6.12,1.993-8.894.4-2.689-1.543-3.983-4.724-4.221-7.7-.512-6.4,3.1-13.64,9.132-16.281,3.512-1.537,7.307-1.585,10.239,1.1C26.727,5.244,25,4.305,24.524,4.013Zm-14.359,24.8-.138-.093Z\" style=\"fill:#8e0000\"/><path d=\"M22.529,26.788c-3.044,2.582-7.92,4.149-11.554,1.857C7.24,26.289,6.53,21.089,7.212,17.083a17.218,17.218,0,0,1,6.7-10.97c3.771-2.636,8.88-3.49,12.489-.182l-2.27,3.291c-2.51-2.355-6.3-1.956-8.945-.052A12.434,12.434,0,0,0,10.5,16.2c-.662,2.623-.5,6.011,1.5,8.047,2.088,2.129,5.112,2.116,7.656.8A10.334,10.334,0,0,0,24.5,18.636L17.307,20.8l.022-4.438L27.89,13.319l.1.806h0A16.625,16.625,0,0,1,22.529,26.788Z\" style=\"fill:#ba0000\"/>",
	},
	"GDScript": {
		colour: "#478cbf",
		icon: "<path d=\"M28.166,21.029v1.652a.374.374,0,0,1-.26.357l-2.6.841a.367.367,0,0,1-.335-.054.374.374,0,0,1-.155-.3v-1.8l-2.438.464V24.02a.375.375,0,0,1-.325.371l-3.525.483c-.016,0-.034,0-.051,0A.374.374,0,0,1,18.1,24.5V22.557l-1.819.008h-.267l-1.819-.008V24.5a.375.375,0,0,1-.375.376c-.017,0-.034,0-.052,0l-3.525-.483a.375.375,0,0,1-.324-.371V22.184l-2.439-.464v1.8a.374.374,0,0,1-.154.3.37.37,0,0,1-.336.054l-2.6-.841a.374.374,0,0,1-.259-.357V21.029l-1.608-.541a4.558,4.558,0,0,0-.124,1.04c0,4.317,6.082,7.65,13.6,7.674h.019c7.517-.024,13.6-3.356,13.6-7.674a4.54,4.54,0,0,0-.1-.95Z\" fill=\"#478cbf\"/><path d=\"M3.711,13.373V20.1l.907.306a.374.374,0,0,1,.256.355v1.65l1.855.6V21.267a.376.376,0,0,1,.445-.369l3.189.609a.374.374,0,0,1,.305.368v1.818l2.775.379v-1.89a.374.374,0,0,1,.376-.375h0l2.327.009,2.326-.009a.374.374,0,0,1,.377.375v1.89l2.775-.379V21.874a.373.373,0,0,1,.3-.368l3.189-.609a.377.377,0,0,1,.446.369v1.741l1.855-.6V20.76a.374.374,0,0,1,.255-.355l.618-.208V13.373h.017A26.792,26.792,0,0,0,30,10.931a19.02,19.02,0,0,0-2.509-3.288A24.507,24.507,0,0,0,25,9.091a13.01,13.01,0,0,0-1.279-1.052,15.365,15.365,0,0,0-1.375-.894,28.353,28.353,0,0,0,.232-3.071A15.968,15.968,0,0,0,18.847,2.8a26.44,26.44,0,0,0-1.385,2.7,9.46,9.46,0,0,0-1.453-.116h-.018a9.457,9.457,0,0,0-1.454.116,26.275,26.275,0,0,0-1.385-2.7A15.961,15.961,0,0,0,9.422,4.075a28.142,28.142,0,0,0,.232,3.071,15.312,15.312,0,0,0-1.376.894A13.06,13.06,0,0,0,7,9.091a24.553,24.553,0,0,0-2.49-1.448A19.02,19.02,0,0,0,2,10.931a26.792,26.792,0,0,0,1.694,2.443Z\" fill=\"#478cbf\"/><path d=\"m12.462 16.6a2.739 2.739 0 1 1-2.74-2.738 2.739 2.739 0 0 1 2.74 2.738\" fill=\"#fff\"/><path d=\"m11.8 16.764a1.819 1.819 0 1 1-1.819-1.819 1.817 1.817 0 0 1 1.819 1.819\" fill=\"#414042\"/><path d=\"M16.166,19.59a.844.844,0,0,1-.882-.8V16.267a.886.886,0,0,1,1.764,0v2.522a.845.845,0,0,1-.883.8\" fill=\"#fff\"/><path d=\"m19.871 16.6a2.739 2.739 0 1 0 2.74-2.738 2.739 2.739 0 0 0-2.74 2.738\" fill=\"#fff\"/><path d=\"m20.531 16.764a1.818 1.818 0 1 0 1.817-1.819 1.817 1.817 0 0 0-1.817 1.819\" fill=\"#414042\"/>",
	},
	"Git": {
		colour: "#dd4c35",
		icon: "<path d=\"M29.472,14.753,17.247,2.528a1.8,1.8,0,0,0-2.55,0L12.158,5.067l3.22,3.22a2.141,2.141,0,0,1,2.712,2.73l3.1,3.1a2.143,2.143,0,1,1-1.285,1.21l-2.895-2.895v7.617a2.141,2.141,0,1,1-1.764-.062V12.3a2.146,2.146,0,0,1-1.165-2.814L10.911,6.314,2.528,14.7a1.8,1.8,0,0,0,0,2.551L14.753,29.472a1.8,1.8,0,0,0,2.55,0L29.472,17.3a1.8,1.8,0,0,0,0-2.551\" style=\"fill:#dd4c35\"/><path d=\"M12.158,5.067l3.22,3.22a2.141,2.141,0,0,1,2.712,2.73l3.1,3.1a2.143,2.143,0,1,1-1.285,1.21l-2.895-2.895v7.617a2.141,2.141,0,1,1-1.764-.062V12.3a2.146,2.146,0,0,1-1.165-2.814L10.911,6.314\" style=\"fill:#fff\"/>",
	},
	"GLSL": {
		colour: "#4386b5",
		icon: "<path d=\"M7.779,18.923A2.333,2.333,0,0,1,5.4,17.16c.306,1.462,1.961,2.892,7.183,3.529a14.228,14.228,0,0,0,9.232-1.612s.733-.322.293.176c0,0-3.107,2.873-9.2,2.9S1.97,19.107,2,16c-.029-3.107,4.806-6.185,10.9-6.155s9.2,2.9,9.2,2.9c.44.5-.293.176-.293.176-1.084-.7-4.286-2.089-9.232-1.612-4.866.469-6.453,2.122-6.981,3.235a3.254,3.254,0,0,0-.318,1.24,2.424,2.424,0,0,1,2.5-2.316A2.507,2.507,0,0,1,10.3,16.195,2.506,2.506,0,0,1,7.779,18.92Zm19.647-1.074H30v.937H26.344V13.609h1.082v4.24ZM23.454,16h2.163v2.791H24.9l-.108-.649a1.9,1.9,0,0,1-1.614.786,2.414,2.414,0,0,1-2.379-2.711,2.485,2.485,0,0,1,2.531-2.74A2.053,2.053,0,0,1,25.6,15.217H24.515a1.136,1.136,0,0,0-1.132-.851c-.771,0-1.485.534-1.485,1.86,0,1.413.771,1.781,1.506,1.781a1.28,1.28,0,0,0,1.254-1.139h-1.2V16ZM7.781,14.1a1.86,1.86,0,0,0-1.8,2.105,1.86,1.86,0,0,0,1.8,2.105,1.86,1.86,0,0,0,1.8-2.105A1.86,1.86,0,0,0,7.781,14.1Zm2.911,1.383h.525v.468h.013a1.12,1.12,0,0,1,.987-.563,1.565,1.565,0,0,1,1.506,1.677,1.675,1.675,0,0,1-1.583,1.824,1,1,0,0,1-.88-.443h-.013V20.1h-.557V15.479ZM12.1,18.4c.608,0,1.019-.527,1.019-1.254,0-.424-.171-1.264-1.032-1.264-.8,0-.893.867-.893,1.406,0,.88.551,1.114.905,1.114Zm5-.652a1.378,1.378,0,0,1-1.488,1.133,1.487,1.487,0,0,1-1.482-1.658c0-1.025.494-1.842,1.588-1.842.956,0,1.424.76,1.424,1.931H14.721c0,.69.323,1.089.962,1.089a.841.841,0,0,0,.854-.652H17.1Zm-.59-.88c-.032-.513-.247-.987-.924-.987a.972.972,0,0,0-.918.987h1.842Zm3.713,1.917h-.557V16.751c0-.576-.165-.867-.709-.867-.317,0-.874.2-.874,1.1v1.8h-.557V15.479h.525v.468h.013a1.2,1.2,0,0,1,1-.563,1.046,1.046,0,0,1,1.158,1.152v2.253\" style=\"fill:#4386b5\"/>",
	},
	"Go module": {
		colour: "#ce3262",
		icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 254.5 225\"><title>file_type_go_package</title><path d=\"M61.949,13.068c16.06-.147,32.143,0,48.211-.062-3.81,16.408-7.466,32.862-11.261,49.277H25.548c-2.319,0-4.637.077-6.956-.093C33,45.775,47.566,29.5,61.949,13.068Z\" style=\"fill:#f2e6c9\"/><path d=\"M143.509,13.014h48.072c14.437,16.431,29.013,32.723,43.411,49.177-9.274.193-18.549,0-27.823.085H154.654C151.006,45.837,147.111,29.46,143.509,13.014Z\" style=\"fill:#f2e6c9\"/><path d=\"M110.16,13.014h33.349c3.6,16.446,7.489,32.823,11.16,49.254H98.9C102.694,45.868,106.35,29.422,110.16,13.014Z\" style=\"fill:#efc75e\"/><path d=\"M18.592,62.183c2.319.17,4.637.085,6.956.093H98.9q0,26.026.054,52.052a18.857,18.857,0,0,0,1.979.139h52.114a14.693,14.693,0,0,0,1.546-.108c.147-17.366,0-34.732.07-52.1h52.516c9.274-.046,18.549.108,27.823-.085V212.62H18.6Q18.592,137.405,18.592,62.183Z\" style=\"fill:#e7bf55\"/><path d=\"M98.9,62.291h55.769c-.062,17.366.085,34.732-.07,52.1-.518.054-1.036.093-1.546.108H100.94a18.857,18.857,0,0,1-1.971-.131C98.861,96.993,98.969,79.634,98.9,62.291Z\" style=\"fill:#dbb551\"/><rect x=\"34.389\" y=\"163.682\" width=\"72.417\" height=\"27.885\" style=\"fill:#f2f2f2\"/><path d=\"M61.422,137.085c-.388,0-.487-.194-.291-.487l2.041-2.625a1.393,1.393,0,0,1,1.069-.487h34.7c.388,0,.487.291.291.584L97.582,136.6a1.481,1.481,0,0,1-.972.584Z\" style=\"fill:#ce3262\"/><path d=\"M46.74,146.028c-.388,0-.487-.194-.291-.487l2.041-2.625a1.393,1.393,0,0,1,1.069-.487H93.89a.447.447,0,0,1,.487.584l-.778,2.333a.85.85,0,0,1-.875.584Z\" style=\"fill:#ce3262\"/><path d=\"M70.264,154.971c-.388,0-.487-.291-.291-.584l1.357-2.43a1.289,1.289,0,0,1,.972-.584H91.747c.388,0,.584.291.584.681l-.194,2.333a.731.731,0,0,1-.681.681Z\" style=\"fill:#ce3262\"/><path d=\"M171.163,135.335c-6.124,1.556-10.3,2.722-16.33,4.28-1.462.388-1.556.487-2.819-.972a13.011,13.011,0,0,0-4.569-3.694c-6.124-3.013-12.054-2.138-17.594,1.462a20.671,20.671,0,0,0-9.918,18.469,15.242,15.242,0,0,0,13.123,15.261c6.61.875,12.151-1.462,16.525-6.415.875-1.069,1.653-2.236,2.625-3.6H133.446c-2.041,0-2.528-1.263-1.847-2.916,1.263-3.013,3.6-8.068,4.958-10.6a2.625,2.625,0,0,1,2.43-1.556h35.384c-.194,2.625-.194,5.249-.584,7.874a41.456,41.456,0,0,1-7.967,19.042c-6.995,9.234-16.136,14.97-27.7,16.525-9.526,1.263-18.374-.584-26.148-6.415A30.533,30.533,0,0,1,99.625,160.51c-1.263-10.6,1.847-20.122,8.262-28.481A43.137,43.137,0,0,1,135.1,115.212c9.137-1.653,17.886-.584,25.76,4.763A30.471,30.471,0,0,1,172.14,133.68C172.719,134.558,172.33,135.044,171.163,135.335Z\" style=\"fill:#ce3262\"/><path d=\"M203.338,189.09c-8.846-.194-16.913-2.722-23.719-8.554a30.485,30.485,0,0,1-10.5-18.761c-1.75-10.984,1.263-20.7,7.874-29.356,7.1-9.331,15.651-14.192,27.218-16.233,9.918-1.75,19.247-.778,27.7,4.958,7.68,5.249,12.442,12.345,13.706,21.676,1.653,13.123-2.138,23.816-11.179,32.953a44.542,44.542,0,0,1-23.329,12.442C208.49,188.7,205.866,188.8,203.338,189.09Zm23.135-39.271a27.978,27.978,0,0,0-.291-3.208,16.013,16.013,0,0,0-18.375-13.235q-.734.119-1.454.306c-9.04,2.041-14.873,7.777-17.011,16.913a16.009,16.009,0,0,0,8.943,18.374,17.82,17.82,0,0,0,15.845-.584c7.679-3.985,11.859-10.206,12.348-18.566Z\" style=\"fill:#ce3262\"/></svg>",
	},
	"Go": {
		colour: "#00acd7",
		icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 254.5 225\"><title>file_type_go</title><path d=\"M-46.926,89c-.621,0-.777-.311-.466-.777l3.262-4.194a2.225,2.225,0,0,1,1.708-.777H13.026c.621,0,.777.466.466.932l-2.64,4.038a2.367,2.367,0,0,1-1.553.932Z\" style=\"fill:#00acd7\"/><path d=\"M-70.379,103.285c-.621,0-.777-.311-.466-.777l3.262-4.194a2.225,2.225,0,0,1,1.708-.777H4.95a.714.714,0,0,1,.777.932L4.484,102.2a1.358,1.358,0,0,1-1.4.932Z\" style=\"fill:#00acd7\"/><path d=\"M-32.792,117.574c-.621,0-.777-.466-.466-.932l2.174-3.883a2.06,2.06,0,0,1,1.553-.932H1.533c.621,0,.932.466.932,1.087l-.311,3.728a1.167,1.167,0,0,1-1.087,1.087Z\" style=\"fill:#00acd7\"/><path d=\"M128.426,86.2c-9.785,2.485-16.464,4.349-26.093,6.834-2.33.621-2.485.777-4.5-1.553-2.33-2.64-4.038-4.349-7.3-5.9-9.785-4.815-19.259-3.417-28.112,2.33-10.561,6.834-16,16.929-15.842,29.51.155,12.425,8.7,22.676,20.968,24.385,10.561,1.4,19.414-2.33,26.4-10.251,1.4-1.708,2.64-3.572,4.194-5.747H68.163c-3.262,0-4.038-2.019-2.951-4.659,2.019-4.815,5.747-12.891,7.921-16.929a4.194,4.194,0,0,1,3.883-2.485h56.535c-.311,4.194-.311,8.387-.932,12.581a66.239,66.239,0,0,1-12.736,30.442C108.7,159.51,94.1,168.673,75.618,171.158c-15.221,2.019-29.355-.932-41.78-10.251a48.785,48.785,0,0,1-19.725-34.48c-2.019-16.929,2.951-32.15,13.2-45.508C38.342,66.475,52.942,57.312,70.8,54.05c14.6-2.64,28.578-.932,41.159,7.61a48.686,48.686,0,0,1,18.017,21.9C130.911,84.958,130.289,85.735,128.426,86.2Z\" style=\"fill:#00acd7\"/><path d=\"M179.835,172.09c-14.134-.311-27.025-4.349-37.9-13.668a48.711,48.711,0,0,1-16.774-29.976c-2.8-17.551,2.019-33.082,12.581-46.905,11.338-14.91,25.006-22.676,43.488-25.938,15.842-2.8,30.753-1.243,44.265,7.921,12.27,8.387,19.88,19.725,21.9,34.635,2.64,20.968-3.417,38.052-17.861,52.652a71.17,71.17,0,0,1-37.276,19.88C188.067,171.469,183.874,171.624,179.835,172.09ZM216.8,109.343a44.7,44.7,0,0,0-.466-5.125c-2.8-15.376-16.929-24.074-31.684-20.657-14.444,3.262-23.763,12.425-27.18,27.025a25.579,25.579,0,0,0,14.289,29.355c8.542,3.728,17.085,3.262,25.317-.932C209.345,132.64,216.024,122.7,216.8,109.343Z\" style=\"fill:#00acd7\"/></svg>",
	},
	"Gradle": {
		colour: "#006533",
		icon: "<path d=\"M13.5,6.965h7.923l4,6.887H29.98A14.1,14.1,0,0,0,11.024,2.932L13.5,6.965\" style=\"fill:#006533\"/><path d=\"M25.628,18l-4.209,7.252H10.806L5.5,16.108,9.739,8.8,7.4,4.981A14.03,14.03,0,1,0,30,18H25.628\" style=\"fill:#82b816\"/><path d=\"M21.061,15.963a5.026,5.026,0,1,1-5.026-5,5.013,5.013,0,0,1,5.026,5\" style=\"fill:#006532\"/>",
	},
	"GraphQL": {
		colour: "#e10098",
		icon: "<rect x=\"-0.43\" y=\"12.534\" width=\"22.901\" height=\"1.187\" transform=\"translate(-5.858 16.107) rotate(-59.999)\" style=\"fill:#e10098\"/><rect x=\"4.545\" y=\"21.162\" width=\"22.902\" height=\"1.187\" style=\"fill:#e10098\"/><rect x=\"10.43\" y=\"18.008\" width=\"1.187\" height=\"13.227\" transform=\"translate(-15.812 21.857) rotate(-59.999)\" style=\"fill:#e10098\"/><rect x=\"20.381\" y=\"0.771\" width=\"1.187\" height=\"13.227\" transform=\"translate(4.092 21.856) rotate(-59.999)\" style=\"fill:#e10098\"/><rect x=\"4.412\" y=\"6.787\" width=\"13.227\" height=\"1.187\" transform=\"translate(-2.213 6.502) rotate(-30.001)\" style=\"fill:#e10098\"/><rect x=\"20.389\" y=\"1.677\" width=\"1.187\" height=\"22.901\" transform=\"translate(-3.753 12.25) rotate(-30.001)\" style=\"fill:#e10098\"/><rect x=\"5.454\" y=\"9.386\" width=\"1.187\" height=\"13.228\" style=\"fill:#e10098\"/><rect x=\"25.36\" y=\"9.386\" width=\"1.187\" height=\"13.228\" style=\"fill:#e10098\"/><rect x=\"15.222\" y=\"24.097\" width=\"11.504\" height=\"1.037\" transform=\"translate(-9.498 13.785) rotate(-30.001)\" style=\"fill:#e10098\"/><path d=\"M28.12,23a2.5,2.5,0,1,1-.915-3.411A2.5,2.5,0,0,1,28.12,23\" style=\"fill:#e10098\"/><path d=\"M8.2,11.5a2.5,2.5,0,1,1-.915-3.411A2.5,2.5,0,0,1,8.2,11.5\" style=\"fill:#e10098\"/><path d=\"M3.88,23a2.5,2.5,0,1,1,3.411.915A2.5,2.5,0,0,1,3.88,23\" style=\"fill:#e10098\"/><path d=\"M23.8,11.5a2.5,2.5,0,1,1,3.411.915A2.5,2.5,0,0,1,23.8,11.5\" style=\"fill:#e10098\"/><path d=\"M16,30a2.5,2.5,0,1,1,2.5-2.5A2.493,2.493,0,0,1,16,30\" style=\"fill:#e10098\"/><path d=\"M16,6.991a2.5,2.5,0,1,1,2.5-2.5,2.493,2.493,0,0,1-2.5,2.5\" style=\"fill:#e10098\"/>",
	},
	"Groovy": {
		colour: "#6398aa",
		icon: "<path d=\"M7.453,29.865c0-.074.494-1.717,1.1-3.651A21.808,21.808,0,0,0,9.5,22.6c-.079-.056-.35.045-.6.224-.764.538-.92.4-1.491-1.356-.617-1.9-.639-2.091-.317-2.81.21-.47.2-.579-.147-1.277a3.75,3.75,0,0,1-.377-1.044c0-.26-1.413-1.438-3.647-3.04A3.845,3.845,0,0,1,2,12.5a10.477,10.477,0,0,1,2.378-.039l2.378.1.232-.741c.981-3.13,2.463-5.957,3.122-5.957.137,0,.416.265.619.588.331.527.376.853.435,3.126a23.013,23.013,0,0,0,.165,2.739c.055.11.228-.035.385-.322.2-.367.412-.467.71-.335s.485.043.646-.345c.242-.582,1.455-4.513,1.455-4.717,0-.069.24-.9.534-1.846s.631-2.036.751-2.424c.213-.688.246-.607,1.524,3.726,1.32,4.474,2.03,6.124,2.385,5.544.248-.4,1.55-.428,1.914-.034.207.224.338.221.453-.01.237-.48.8-.4.953.14.117.423.147.423.32,0a.812.812,0,0,1,.692-.466c.389,0,.538.164.666.735l.165.735,2.558-.183A11.521,11.521,0,0,1,30,12.468a20.79,20.79,0,0,1-2.321,1.889c-1.277.96-2.342,1.775-2.368,1.81a17.607,17.607,0,0,0,.128,1.867,11.075,11.075,0,0,1-.544,5.713,4.308,4.308,0,0,1-1.021,1.49c-.278.186-.506.4-.506.486s.3,1.077.66,2.212A9.682,9.682,0,0,1,24.568,30c-.109,0-2.757-2.07-6.876-5.373a11.143,11.143,0,0,0-1.643-1.184c-.171,0-1.649,1.133-5.984,4.588-2.514,2-2.612,2.073-2.612,1.835Zm5.158-4.727c1.337-1.051,2.664-2.078,2.947-2.282.488-.351.651-.263,3.021,1.631,1.378,1.1,2.737,2.174,3.021,2.384s.868.666,1.3,1.013c.491.4.742.492.674.256-.77-2.634-.793-2.678-1.327-2.476-.644.244-1.043-.006-1.249-.783a1.739,1.739,0,0,1,.24-1.451,2.377,2.377,0,0,0-.221-2.731,4.289,4.289,0,0,1-.686-1.53l-.241-1.023-.517.71c-.636.873-1.411.918-2.059.119l-.477-.588-.554.762c-.555.763-1.194.862-1.844.284-.179-.159-.258-.1-.258.2a1.24,1.24,0,0,1-.375.777c-.619.57-1.223.419-1.633-.409L12,19.249l-.3.775a7.032,7.032,0,0,1-.853,1.479,13.891,13.891,0,0,0-1.455,3.663c-.5,1.627-.9,3.042-.9,3.143s.381-.141.847-.538,1.942-1.582,3.279-2.633Zm11.343-1.131c1.015-1.154,1.25-3.288.8-7.271-.375-3.329-.562-4.419-.784-4.565-.154-.1-.177.01-.091.426.562,2.7.593,4.053.1,4.434-.337.262-.695-.719-.976-2.675-.218-1.515-.445-2.2-.617-1.85a3.359,3.359,0,0,0,.16,1.07,26.718,26.718,0,0,1,.394,3.381,21.757,21.757,0,0,0,.375,3.151c.309.985.8.747,1.118-.54s.35-.425.044,1.055c-.317,1.536-1.26,2-2.352,1.15-.175-.136-.234,0-.234.555a4.988,4.988,0,0,1-.3,1.5l-.3.765.408.139A2.247,2.247,0,0,0,23.954,24.007ZM9.346,21.468c2.118-1.232,2.5-2.668,1.793-6.805a21.941,21.941,0,0,1-.3-2.3c0-1.029-.256-.554-.448.832-.254,1.832-1.016,3.389-1.657,3.383-.557-.005-.738-.21-.968-1.094-.413-1.585.037-4.018,1.184-6.406.84-1.749,1.3-1.908,1.3-.448,0,2.276-.776,5.625-1.184,5.115a3.814,3.814,0,0,1,.065-2.2c.2-.72.157-1.818-.066-1.818-.259,0-.773,1.91-.841,3.127-.06,1.076-.022,1.338.231,1.612.888.962,2.052-1.973,2.111-5.323.031-1.759-.138-2.254-.674-1.982-.781.4-2.883,5.883-2.883,7.523,0,1.283.319,2.186.88,2.491.954.519,1.876-.4,2.529-2.531l.275-.894V14.97c0,1.759-.567,2.686-2.357,3.852a8.893,8.893,0,0,0-.852.6,9.758,9.758,0,0,0,.892,2.534,5.283,5.283,0,0,0,.969-.484Zm12.764-2.184c.213-.475.25-.992.2-2.817-.05-1.986-.1-2.337-.486-3.144-.691-1.458-1.544-1.086-1.045.455.265.82.589.68.475-.205-.091-.7.079-.723.375-.041.556,1.281.416,3.055-.242,3.055-.45,0-.59-.39-.883-2.459a6.752,6.752,0,0,0-.362-1.714c-.217,0-.314.388-.179.718a28.23,28.23,0,0,1,.452,2.859c.441,3.507,1.057,4.707,1.69,3.293Zm-8.38.056a3.385,3.385,0,0,0,.095-1.33c-.06-1.008-.094-1.081-.364-.79-.387.419-.8-.375-.944-1.8-.107-1.082-.14-1.061.64-.415.1.081.346-.194.553-.611.377-.763.5-1.68.228-1.68-.081,0-.147.134-.147.3,0,.429-.4.368-.494-.075-.053-.258-.166-.167-.367.3-.16.369-.356.671-.434.671s-.185-.3-.237-.671c-.09-.646-.1-.65-.3-.113a.951.951,0,0,0-.01.964,18.818,18.818,0,0,1,.521,3.791c0,1.174.8,2.1,1.267,1.463Zm2.688-1.556a7.055,7.055,0,0,0,.416-4.259c-.236-1.141-.645-1.568-1.222-1.275-.429.218-1.082,2.746-1.084,4.2,0,2.262,1.06,3.015,1.89,1.337Zm-1.007-1.792a3.77,3.77,0,0,1-.29-1.416c0-.745.022-.772.2-.3.22.586.611.688.761.2a1.035,1.035,0,0,0-.065-.656c-.232-.469-.2-1.107.049-1.107.28,0,.672,1.154.672,1.982,0,.609-.613,1.893-.9,1.893-.07,0-.26-.268-.422-.6ZM19.348,17.7a6.447,6.447,0,0,0-.141-4.918c-.358-.773-1.153-.906-1.479-.248a11.607,11.607,0,0,0-.489,3.895C17.477,18.348,18.716,19.1,19.348,17.7ZM18.1,15.527a2.492,2.492,0,0,1-.318-1.565c.008-.909.031-.991.135-.472.153.764.473,1.052.753.679.174-.231.166-.341-.05-.676-.288-.447-.344-1.079-.1-1.079a5.037,5.037,0,0,1,1.017,2.25c0,.48-.564,1.327-.884,1.327C18.527,15.991,18.276,15.782,18.1,15.527Zm8.662-1.318,1.547-1.175-1.658-.012c-1.484-.011-1.658.043-1.656.51a11.532,11.532,0,0,0,.2,1.857c.011,0,.716-.534,1.567-1.18ZM6.535,14l.158-.949L5.3,12.956c-.764-.052-1.389-.012-1.389.088a14.1,14.1,0,0,0,2.447,1.934C6.371,14.961,6.448,14.521,6.535,14Zm9.526-2.941a1.624,1.624,0,0,1,.819.6c.192.349.276.326.573-.163.191-.315.44-.572.553-.572s.2-.066.2-.146c0-.278-2.122-7.306-2.2-7.3s-2.27,7.386-2.337,7.925c-.028.226.06.309.231.219.152-.081.363.063.468.319.17.415.24.382.644-.306.384-.654.544-.742,1.048-.579Z\" style=\"fill:#333\"/><path d=\"M14.5,12.175a.85.85,0,0,1-.115-.2.737.737,0,0,0-.194-.29.281.281,0,0,0-.3-.061c-.087.035-.111.039-.15.024-.065-.026-.089-.106-.07-.242.023-.169.2-.825.548-2.054.711-2.5,1.666-5.646,1.772-5.839.012-.021.012-.021.024,0,.063.114.432,1.266.937,2.922.682,2.24,1.25,4.21,1.25,4.339,0,.079-.06.127-.186.147-.157.026-.339.212-.587.6a1.674,1.674,0,0,1-.226.31c-.048.046-.052.048-.1.048s-.056,0-.1-.043a.958.958,0,0,1-.1-.144,1.268,1.268,0,0,0-.414-.422,1.525,1.525,0,0,0-.738-.281.434.434,0,0,0-.4.156,2.718,2.718,0,0,0-.416.6c-.257.425-.348.513-.441.426Z\" style=\"fill:#6398aa\"/><path d=\"M6.252,14.928a19.055,19.055,0,0,1-2.3-1.838c-.031-.038-.034-.044-.025-.057a2.7,2.7,0,0,1,1.14-.085c.23.012,1.619.1,1.621.108s-.3,1.779-.321,1.881C6.357,14.981,6.337,14.979,6.252,14.928Z\" style=\"fill:#6398aa\"/><path d=\"M25.177,15.35A14.239,14.239,0,0,1,25,13.56a.553.553,0,0,1,.044-.29c.081-.151.245-.205.7-.23.228-.013,1.281-.015,2.025,0l.521.008L27.029,14c-1.144.867-1.81,1.369-1.834,1.382-.006,0-.012-.006-.018-.027h0Z\" style=\"fill:#6398aa\"/><path d=\"M8.506,28.281c0-.071.149-.6.527-1.878.905-3.057,1.319-4.165,1.827-4.892a7.664,7.664,0,0,0,.969-1.792L12,19.292l.225.448c.394.784.632,1.011,1.062,1.016a1.239,1.239,0,0,0,1.1-1.137c0-.124.044-.251.086-.251a1.119,1.119,0,0,1,.226.14,1.271,1.271,0,0,0,.666.3.879.879,0,0,0,.609-.148,2.47,2.47,0,0,0,.711-.764c.187-.252.347-.459.354-.459s.143.159.3.352a5.091,5.091,0,0,0,.422.467,1.049,1.049,0,0,0,1.549-.08,6.111,6.111,0,0,0,.467-.572c.168-.228.307-.41.31-.4s.066.269.141.584.169.67.209.789a3.826,3.826,0,0,0,.642,1.234,2.17,2.17,0,0,1,.466,1.246,3.051,3.051,0,0,1-.352,1.447,2.07,2.07,0,0,0-.267.934,2.017,2.017,0,0,0,.213.851.773.773,0,0,0,1.069.413,1.351,1.351,0,0,1,.316-.068c.2,0,.315.193.542.881.157.474.5,1.637.5,1.695,0,.03-.016.051-.039.051a1.486,1.486,0,0,1-.407-.224c-.2-.144-2.612-2.029-3.408-2.663-2.128-1.693-2.828-2.233-3.171-2.446-.37-.23-.622-.285-.827-.177-.254.133-3.726,2.847-5.751,4.5A10.846,10.846,0,0,1,8.65,28.251c-.149.083-.143.081-.143.03Z\" style=\"fill:#6398aa\"/>",
	},
	"Haml": {
		colour: "#ecdfa7",
		icon: "<path d=\"M15.311,16.043,13.4,29.726a6.322,6.322,0,0,1-5.956-1.25l3.1-13.266L4.69,3.34a8.031,8.031,0,0,1,3.79-.646l5.144,9.7,8.914-7.581s3,1.041,3.27,2.041l-10.5,9.184Z\" style=\"fill:#ecdfa7\"/><path d=\"M27.016,17.411a4.244,4.244,0,0,0-.541-.812,5.7,5.7,0,0,0-1.458-1.187,7.331,7.331,0,0,0-1.687-.791l-.229-.062-.187-.062c-.125-.042-.229-.1-.333-.146a1.282,1.282,0,0,1-.458-.417A1.754,1.754,0,0,1,22,12.642a2.518,2.518,0,0,1,.1-.375c.042-.125.083-.25.125-.4a2.691,2.691,0,0,0,.062-.6l.1-.083,1.25-1.041c.229-.187.458-.4.687-.583a2.2,2.2,0,0,1,.229.146s.646.062,1-.916l-.187-.125.125-.1.312-.271a.613.613,0,0,0,.229-.375.529.529,0,0,0-.417.125l-.333.25-.229.167L22.184,6.478c.146-.125.271-.229.417-.354l.6-.541.062-.062c.062.042.1.083.167.125.146.1.312.208.458.292l.916.5c.292.167.6.333.916.479a3.323,3.323,0,0,0,.479.208c.083.021.167.062.25.083.042,0,.1.021.146.021h.1a.151.151,0,0,0,.125-.083V7.123a.077.077,0,0,1,.021-.062V6.977a.108.108,0,0,0-.042-.083c-.021-.042-.062-.083-.083-.125a1.59,1.59,0,0,0-.187-.187c-.125-.125-.271-.229-.4-.333-.271-.208-.562-.4-.854-.583a7.545,7.545,0,0,0-.9-.5,3.323,3.323,0,0,0-.479-.208c-.083-.021-.167-.062-.271-.083-.042,0-.1-.021-.167-.021a.31.31,0,0,0-.125.021.522.522,0,0,0-.167.1,1.6,1.6,0,0,0-.375.208l-.625.354c-.187.146-.4.312-.583.458l-.208-.146s-.875.083-.583.646l.083.083c-.833.687-1.645,1.4-2.457,2.083-.833.708-1.645,1.416-2.478,2.145l-1.229,1.083a1.878,1.878,0,0,1-.208.187c-.042-.125-.1-.229-.146-.333l-.292-.625-.562-1.25c-.375-.833-.75-1.666-1.145-2.5L11.209,4.895l-.187-.375h.25s.083-.687-.417-.812a1.4,1.4,0,0,0-.208.021c-.187-.375-.354-.75-.541-1.125h0l-.083-.312A.33.33,0,0,0,9.9,2.1a.352.352,0,0,0-.1-.042c-.062-.021-.1-.021-.167-.042A1.281,1.281,0,0,0,9.355,2a4.057,4.057,0,0,0-.521.042,8.767,8.767,0,0,0-1.02.187c-.333.083-.666.167-1,.271a3.272,3.272,0,0,0-.479.187l-.25.125c-.042.021-.083.062-.125.083L5.9,2.958c-.021.021-.021.042-.042.062v.062h0V3.1a.164.164,0,0,0,.1.125c.042.021.062.042.083.042a1.327,1.327,0,0,1,.146.042,1.188,1.188,0,0,0,.271.021,4.384,4.384,0,0,0,.521-.042c.333-.042.687-.083,1.02-.146l1.02-.167c.167-.021.333-.062.521-.1.146.292.292.6.437.9-.958.083-2.457.208-3.395.312-.1-.187-.187-.354-.292-.541a.127.127,0,0,0-.146-.062.108.108,0,0,0-.062.146c.062.167.125.312.187.479a1.167,1.167,0,0,0-.5.125A1.828,1.828,0,0,0,6.4,5.645a3.567,3.567,0,0,1,.458-.125l.437,1,1.25,2.832,1.27,2.832c.417.937.854,1.874,1.291,2.832h0a.02.02,0,0,0,.021.021l-.187.625-.5,1.749c-.312,1.166-.6,2.353-.9,3.52L9.105,22.7l-.417,1.77c-.292,1.187-.562,2.353-.9,3.52a.125.125,0,0,0,.021.083,3.076,3.076,0,0,0,.6.562,6.048,6.048,0,0,0,.687.417,9.4,9.4,0,0,0,1.5.6,6.972,6.972,0,0,0,1.624.271,3.728,3.728,0,0,0,.833-.042,6.547,6.547,0,0,0,.833-.167.254.254,0,0,0,.167-.187v-.021c.229-1.145.417-2.312.625-3.457l.583-3.478c.187-1.166.4-2.312.583-3.478.021-.125.042-.271.062-.4.042.042.062.1.1.146a4.137,4.137,0,0,0,.708.646,7.212,7.212,0,0,0,1.583.833,11.774,11.774,0,0,0,1.666.5,10.182,10.182,0,0,0,1.1.187,2.621,2.621,0,0,0-.25,1.208.115.115,0,0,0,.062.1h.021a5.164,5.164,0,0,0,1.27.479,4.333,4.333,0,0,0,1.375.062,2.627,2.627,0,0,0,1.333-.562,2.824,2.824,0,0,0,.812-1.166l.021-.021V21.1l.062-.562v-.021a5.427,5.427,0,0,0,.625-.417,2.71,2.71,0,0,0,.646-.729,1.833,1.833,0,0,0,.25-1,2.563,2.563,0,0,0-.292-.958Zm-.4-10.5Zm-1.479-1.1a7.12,7.12,0,0,1,.833.541c.125.1.271.187.4.312a1.257,1.257,0,0,1,.167.167l.042.042h-.042c-.083-.021-.146-.042-.229-.062-.146-.062-.312-.125-.458-.187a7.132,7.132,0,0,1-.875-.479A5.61,5.61,0,0,1,24.2,5.52a2.5,2.5,0,0,1-.229-.25l.312.125a6.4,6.4,0,0,1,.854.417Zm-1.416-.916.021.021v.042a.02.02,0,0,0-.021-.021V4.895ZM8.876,2.562a5.021,5.021,0,0,1-.937.333,5.347,5.347,0,0,1-.979.167,4.013,4.013,0,0,1-.5.021.781.781,0,0,1-.229-.021H6.169c.021,0,.021-.021.042-.021.062-.042.146-.062.208-.1.146-.062.312-.1.458-.167.312-.083.646-.167.979-.229a8.4,8.4,0,0,1,.979-.125A1.576,1.576,0,0,0,9.147,2.4a1.536,1.536,0,0,1-.271.167Zm14.453,7.1-1.291,1-1.291,1.02c-.354.292-.708.583-1.062.854.021-.021.042-.062.062-.083.167-.229.333-.437.5-.646.354-.417.687-.854,1.062-1.25s.771-.791,1.166-1.145a4.872,4.872,0,0,1,.646-.5l.187-.125c.187.146.4.292.583.437-.167.146-.375.292-.562.437ZM8.064,7.1l.1.1a5.63,5.63,0,0,1,.583.646,2.21,2.21,0,0,1,.375.729.921.921,0,0,1-.062.625l-.021-.062L8.064,7.1Zm1.02,2.166a.72.72,0,0,0,.146-.25.866.866,0,0,0,.042-.458A1.7,1.7,0,0,0,8.9,7.727a4.015,4.015,0,0,0-.979-.9l-.229-.479c-.146-.312-.292-.625-.458-.916.312-.083.687-.208,1.1-.312A20.313,20.313,0,0,1,9.355,7a7.963,7.963,0,0,1,.771,2.541c.021.208,0,.437,0,.666s0,.458.021.687a7.609,7.609,0,0,0,.146.958L9.084,9.268ZM14,26.242a.9.9,0,0,1-.187.208.4.4,0,0,1-.333.1.358.358,0,0,1-.229-.229.981.981,0,0,1-.083-.354,2.275,2.275,0,0,1,.042-.75,2.816,2.816,0,0,1,.229-.708,1.478,1.478,0,0,1,.208-.292.341.341,0,0,1,.292-.125c.1,0,.208.1.271.208a.74.74,0,0,1,.083.187l-.25,1.479c-.021.1-.021.187-.042.271Zm1.229-7.185-.375,2.187a3.329,3.329,0,0,0-.1-.437c-.1-.4-.229-.771-.354-1.145a15.537,15.537,0,0,0-.958-2.166c.229.771.5,1.5.771,2.249.146.375.271.75.4,1.1l.187.562c0,.021.021.062.021.083-.062.333-.125.666-.167,1.02l-.312,1.9c-.021-.042-.021-.083-.042-.125a.486.486,0,0,0-.312-.292.525.525,0,0,0-.417.125,1.944,1.944,0,0,0-.271.312,2.036,2.036,0,0,0-.271.75,2.131,2.131,0,0,0,0,.812,1.021,1.021,0,0,0,.146.4.486.486,0,0,0,.333.271.428.428,0,0,0,.375-.167c.042-.042.083-.1.125-.146-.146.979-.312,1.958-.458,2.957a2.727,2.727,0,0,1-.562.125c-.25.042-.5.062-.75.083a5.531,5.531,0,0,1-1.541-.146,7.846,7.846,0,0,1-1.5-.479,3.625,3.625,0,0,1-1.229-.854c.312-1.145.666-2.291,1.02-3.436l.541-1.729.521-1.749c.354-1.166.708-2.333,1.041-3.5.167-.583.312-1.166.479-1.749a3.626,3.626,0,0,0,.187-1.833v-.021c-.021-.021-.042-.021-.042,0a3.109,3.109,0,0,0-.25.292c-.229-.521-.479-1.02-.708-1.541a4.765,4.765,0,0,1-.167-.583,7.165,7.165,0,0,1-.208-1.312c-.021-.229-.021-.437-.021-.666s.021-.458,0-.687a7.625,7.625,0,0,0-.833-2.6,12.587,12.587,0,0,0-1.1-1.833c.687-.187,1.416-.375,2-.479.083.187.187.354.271.541L11.938,7.6l1.25,2.437.625,1.208.312.6c.083.125.125.271.208.375l-.812.75a.069.069,0,0,0,0,.1.073.073,0,0,0,.1.021c.437-.312.875-.646,1.312-.979l1.312-1c.875-.666,1.729-1.333,2.582-2s1.708-1.354,2.562-2.041l.021-.021a24.316,24.316,0,0,0,1.874,1.645,6.162,6.162,0,0,0-.875.541,8.943,8.943,0,0,0-1.229,1.125,12.279,12.279,0,0,0-1.041,1.291,11.778,11.778,0,0,0-.646,1c-1.27,1.041-2.52,2.1-3.728,3.207a.128.128,0,0,0-.021.146.138.138,0,0,0,.146.042,9.134,9.134,0,0,0-.312,1.25c-.125.583-.25,1.166-.354,1.749Zm9.205,2.791a2.527,2.527,0,0,1-1.02.458,3.767,3.767,0,0,1-1.187.042,7.361,7.361,0,0,1-1.145-.208,2.037,2.037,0,0,1,.167-1.041c.146.021.271.021.417.042a.114.114,0,0,0,.125-.083.124.124,0,0,0-.083-.167h0c-.1-.042-.187-.062-.292-.1a2.771,2.771,0,0,1,.292-.4c.125-.125.25-.25.375-.354a3.992,3.992,0,0,0,.854.4,2.881,2.881,0,0,0,1.125.1,1.55,1.55,0,0,0,1.02-.541,1.524,1.524,0,0,0,.354-.916.85.85,0,0,1,.021.4,4.511,4.511,0,0,1-.083.521l-.062.312L25,20.494a.919.919,0,0,0-.333.354.751.751,0,0,0,.479,0c.021,0,.021-.021.042-.021-.021.062-.021.1-.042.167a2.552,2.552,0,0,1-.708.854ZM26.5,19.119a2.2,2.2,0,0,1-.458.625,2.638,2.638,0,0,1-.271.229,2.585,2.585,0,0,0-.062-.562,1.534,1.534,0,0,0-.083-.292.531.531,0,0,0-.187-.25h0c-.021,0-.042,0-.042.021h0a1.95,1.95,0,0,1-.562.771,1.429,1.429,0,0,1-.812.292,2.857,2.857,0,0,1-.916-.125c-.312-.083-.625-.187-.937-.292l-.042-.021a.2.2,0,0,0-.187.042c-.167.208-.292.4-.437.6-.1.167-.187.312-.271.479-.375-.146-.729-.271-1.1-.417-.521-.208-1.041-.417-1.52-.666a7.648,7.648,0,0,1-1.4-.812,2.949,2.949,0,0,1-.979-1.062v-.021a.409.409,0,0,0-.187-.187c0-.042.021-.1.021-.146a7.37,7.37,0,0,0,.1-1.52c1.687-1.187,3.332-2.437,4.957-3.728l-.062.187a3.27,3.27,0,0,0-.146,1.02A2.089,2.089,0,0,0,22.122,15.1a2.825,2.825,0,0,0,.479.187l.25.062.208.042a6.645,6.645,0,0,1,1.541.625,6.156,6.156,0,0,1,1.312.979,2.275,2.275,0,0,1,.708,1.333,1.51,1.51,0,0,1-.125.791Z\" style=\"fill:#3f3e29\"/><path d=\"M12.667,23.909a2.161,2.161,0,0,0-.354.771,1.556,1.556,0,0,0-.062.417l-.021.417a4.533,4.533,0,0,0,.146,1.666,7.647,7.647,0,0,0,.666,1.52c-.083-.271-.187-.521-.271-.771s-.167-.521-.229-.791a5.89,5.89,0,0,1-.1-1.6l.021-.417a2.552,2.552,0,0,1,.042-.4,3.137,3.137,0,0,1,.292-.729,2.967,2.967,0,0,1,.521-.625,2.591,2.591,0,0,1,.666-.479,2.76,2.76,0,0,0-1.312,1.02Z\" style=\"fill:#3f3e29\"/>",
	},
	"Handlebars": {
		colour: "#c19770",
		icon: "<path d=\"M12.3,13.1a4.238,4.238,0,0,1,2.728.9A4.592,4.592,0,0,1,16,15.127a4.144,4.144,0,0,1,2.039-1.747,4.757,4.757,0,0,1,3.286.019,7.833,7.833,0,0,1,2.443,1.558c.568.5,1.094,1.05,1.679,1.533a3.4,3.4,0,0,0,1.019.614,1.42,1.42,0,0,0,1.46-.379.965.965,0,0,0-.055-1.323.545.545,0,0,0-.8.108.659.659,0,0,0,.05.686,1.222,1.222,0,0,1-.6-.926,1.022,1.022,0,0,1,.691-1.032,2.005,2.005,0,0,1,2.312.661,3.258,3.258,0,0,1,.44,2.308,2.762,2.762,0,0,1-1.137,1.872,5.051,5.051,0,0,1-3.013.8,8.488,8.488,0,0,1-2.932-.63c-1.558-.626-3.016-1.492-4.625-1.992a13.977,13.977,0,0,0-1.7-.363c-.43.007-.861-.015-1.29.015a5.692,5.692,0,0,0-1.534.349c-1.636.509-3.116,1.4-4.7,2.024a7.625,7.625,0,0,1-4.249.474,3.74,3.74,0,0,1-2.125-1.14A2.856,2.856,0,0,1,2,16.668a2.722,2.722,0,0,1,.555-1.874,1.994,1.994,0,0,1,1.687-.68,1.425,1.425,0,0,1,1.063.52,1.04,1.04,0,0,1,.122.911,1.457,1.457,0,0,1-.556.644.643.643,0,0,0,.051-.681.547.547,0,0,0-.831-.079.975.975,0,0,0-.151,1.11,1.331,1.331,0,0,0,1.032.623,2.332,2.332,0,0,0,1.6-.7A28.526,28.526,0,0,1,9.4,14.053,5.251,5.251,0,0,1,12.3,13.1Z\" style=\"fill:#c19770\"/>",
	},
	"Haskell": {
		colour: "#C04504",
		icon: "<defs><linearGradient id=\"a\" x1=\"0.996\" y1=\"-206.057\" x2=\"0.951\" y2=\"-206.057\" gradientTransform=\"matrix(259.941, 0, 0, -183.487, -237.941, -37792.788)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#faba09\"/><stop offset=\"1\" stop-color=\"#b42c01\"/></linearGradient></defs><title>file_type_haskell2</title><path d=\"M2,25.882,8.588,16,2,6.118H6.941L13.529,16,6.941,25.882Zm6.588,0L15.177,16,8.588,6.118h4.941L26.706,25.882H21.765l-4.117-6.176-4.118,6.176ZM24.51,20.118l-2.2-3.294H30v3.294Zm-3.294-4.941-2.2-3.294H30v3.294Z\" style=\"fill:url(#a)\"/>",
	},
	"Haxe": {
		colour: "#f68712",
		icon: "<path d=\"M16,5.5,5.5,16,16,26.5,26.5,16,16,5.5\" style=\"fill:#f68712\"/><path d=\"M2,2,16,5.5,5.5,16,2,2\" style=\"fill:#fab20b\"/><path d=\"M30,2,26.5,16,16,5.5,30,2\" style=\"fill:#f47216\"/><path d=\"M30,30,16,26.5,26.5,16,30,30\" style=\"fill:#f25c19\"/><path d=\"M2,30,5.5,16,16,26.5,2,30\" style=\"fill:#f89c0e\"/><path d=\"M16,5.5,2,2H9l7,3.5\" style=\"fill:#fbc707\"/><path d=\"M16,5.5,30,2H23L16,5.5\" style=\"fill:#fbc707\"/><path d=\"M16,26.5,30,30H23l-7-3.5\" style=\"fill:#f68712\"/><path d=\"M16,26.5,2,30H9l7-3.5\" style=\"fill:#f25c19\"/><path d=\"M5.5,16,2,30V23l3.5-7\" style=\"fill:#fff200\"/><path d=\"M5.5,16,2,2V9l3.5,7\" style=\"fill:#fff200\"/><path d=\"M26.5,16,30,2V9l-3.5,7\" style=\"fill:#f1471d\"/><path d=\"M26.5,16,30,30V23l-3.5-7\" style=\"fill:#f1471d\"/>",
	},
	"HLSL": {
		colour: "#0000ff",
		icon: "<polygon points=\"9.525 21.947 7.56 21.947 7.56 17.1 3.958 17.1 3.958 21.947 2 21.947 2 10.044 3.958 10.044 3.958 14.792 7.56 14.792 7.56 10.044 9.525 10.044 9.525 21.947\" style=\"fill:blue\"/><polygon points=\"16.692 21.947 11.513 21.947 11.513 10.044 13.472 10.044 13.472 19.773 16.692 19.773 16.692 21.947\" style=\"fill:blue\"/><path d=\"M17.462,21.491V18.834a3.676,3.676,0,0,0,1.146.909,2.809,2.809,0,0,0,1.249.3,2.05,2.05,0,0,0,.646-.092,1.309,1.309,0,0,0,.461-.252,1.029,1.029,0,0,0,.276-.382,1.231,1.231,0,0,0,.091-.478,1.3,1.3,0,0,0-.145-.623,1.907,1.907,0,0,0-.4-.506,4.077,4.077,0,0,0-.6-.448q-.346-.215-.746-.439a4.045,4.045,0,0,1-1.519-1.419,3.884,3.884,0,0,1-.5-2.026,4.232,4.232,0,0,1,.273-1.6,3.02,3.02,0,0,1,.744-1.1,2.938,2.938,0,0,1,1.088-.634,4.167,4.167,0,0,1,1.31-.2,5.816,5.816,0,0,1,1.2.111,3.8,3.8,0,0,1,.967.345v2.482a2.859,2.859,0,0,0-.476-.365,3.212,3.212,0,0,0-.53-.262A3.1,3.1,0,0,0,21.46,12a2.794,2.794,0,0,0-.512-.05,1.994,1.994,0,0,0-.606.087,1.347,1.347,0,0,0-.461.245,1.092,1.092,0,0,0-.291.377,1.144,1.144,0,0,0-.1.494,1.2,1.2,0,0,0,.115.536,1.657,1.657,0,0,0,.328.448,3.461,3.461,0,0,0,.515.415c.2.136.43.275.686.419a7.094,7.094,0,0,1,.936.635,3.712,3.712,0,0,1,.713.759,3.269,3.269,0,0,1,.455.967,4.573,4.573,0,0,1,.158,1.266,4.439,4.439,0,0,1-.277,1.672,2.888,2.888,0,0,1-.749,1.1,2.823,2.823,0,0,1-1.1.6,4.742,4.742,0,0,1-1.325.182,5.476,5.476,0,0,1-1.361-.166A3.41,3.41,0,0,1,17.462,21.491Z\" style=\"fill:blue\"/><polygon points=\"30 21.947 24.822 21.947 24.822 10.044 26.78 10.044 26.78 19.773 30 19.773 30 21.947\" style=\"fill:blue\"/>",
	},
	"HTML": {
		colour: "#e44f26",
		icon: "<polygon points=\"5.902 27.201 3.655 2 28.345 2 26.095 27.197 15.985 30 5.902 27.201\" style=\"fill:#e44f26\"/><polygon points=\"16 27.858 24.17 25.593 26.092 4.061 16 4.061 16 27.858\" style=\"fill:#f1662a\"/><polygon points=\"16 13.407 11.91 13.407 11.628 10.242 16 10.242 16 7.151 15.989 7.151 8.25 7.151 8.324 7.981 9.083 16.498 16 16.498 16 13.407\" style=\"fill:#ebebeb\"/><polygon points=\"16 21.434 15.986 21.438 12.544 20.509 12.324 18.044 10.651 18.044 9.221 18.044 9.654 22.896 15.986 24.654 16 24.65 16 21.434\" style=\"fill:#ebebeb\"/><polygon points=\"15.989 13.407 15.989 16.498 19.795 16.498 19.437 20.507 15.989 21.437 15.989 24.653 22.326 22.896 22.372 22.374 23.098 14.237 23.174 13.407 22.341 13.407 15.989 13.407\" style=\"fill:#fff\"/><polygon points=\"15.989 7.151 15.989 9.071 15.989 10.235 15.989 10.242 23.445 10.242 23.445 10.242 23.455 10.242 23.517 9.548 23.658 7.981 23.732 7.151 15.989 7.151\" style=\"fill:#fff\"/>",
	},
	"HTTP": {
		colour: "#3b61a6",
		icon: "<defs><radialGradient id=\"a\" cx=\"12.278\" cy=\"24.557\" r=\"18.371\" gradientTransform=\"matrix(1, 0, 0, -1, -0.001, 34.001)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#d3e9ff\"/><stop offset=\"0.155\" stop-color=\"#d3e9ff\"/><stop offset=\"0.75\" stop-color=\"#4074ae\"/><stop offset=\"1\" stop-color=\"#36486c\"/></radialGradient><radialGradient id=\"b\" cx=\"10.657\" cy=\"26.746\" r=\"26.66\" gradientTransform=\"matrix(1, 0, 0, -1, -0.001, 34.001)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#fff\"/><stop offset=\"1\" stop-color=\"#fff\" stop-opacity=\"0.165\"/></radialGradient><radialGradient id=\"c\" cx=\"-45.05\" cy=\"9.285\" r=\"4.115\" gradientTransform=\"translate(-21.971 41.942) rotate(143.734)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#fff\"/><stop offset=\"1\" stop-color=\"#fff\" stop-opacity=\"0\"/></radialGradient><radialGradient id=\"d\" cx=\"-41.456\" cy=\"32.154\" r=\"4.115\" gradientTransform=\"translate(3.571 87.075) rotate(143.734) scale(1.297)\" xlink:href=\"#c\"/><radialGradient id=\"e\" cx=\"-48.485\" cy=\"13.239\" r=\"4.115\" gradientTransform=\"translate(-23.084 55.413) rotate(143.734)\" xlink:href=\"#c\"/><radialGradient id=\"f\" cx=\"-40.883\" cy=\"16.036\" r=\"4.115\" gradientTransform=\"matrix(-0.87, 0.639, -0.638, -0.87, -9.351, 47.706)\" xlink:href=\"#c\"/><linearGradient id=\"g\" x1=\"-66.502\" y1=\"2.219\" x2=\"-64.626\" y2=\"6.749\" gradientTransform=\"matrix(0.939, -0.879, -0.683, -0.73, 84.81, -33.628)\" xlink:href=\"#c\"/><linearGradient id=\"h\" x1=\"-26.791\" y1=\"39.159\" x2=\"-24.999\" y2=\"44.683\" gradientTransform=\"matrix(1.131, 0.613, 0.477, -0.879, 21.648, 69.071)\" xlink:href=\"#c\"/><linearGradient id=\"i\" x1=\"-63.384\" y1=\"8.177\" x2=\"-63.57\" y2=\"4.69\" gradientTransform=\"matrix(0.918, -0.859, -0.668, -0.713, 77.857, -36.493)\" xlink:href=\"#c\"/><linearGradient id=\"j\" x1=\"-99.259\" y1=\"89.545\" x2=\"-98.825\" y2=\"93.023\" gradientTransform=\"matrix(-1.28, -0.126, -0.098, 0.995, -101.637, -93.015)\" xlink:href=\"#c\"/><radialGradient id=\"k\" cx=\"-20.712\" cy=\"57.61\" r=\"2.836\" gradientTransform=\"matrix(0, -0.843, -0.721, 0, 26.625, -21.696)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#729fcf\"/><stop offset=\"1\" stop-color=\"#3b61a6\"/></radialGradient><radialGradient id=\"l\" cx=\"-20.712\" cy=\"39.858\" r=\"2.836\" gradientTransform=\"translate(26.625 63.096) rotate(90) scale(0.843 0.721)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#729fcf\"/><stop offset=\"1\" stop-color=\"#509e2f\"/></radialGradient></defs><title>file_type_http</title><path d=\"M28.026,14.2A11.877,11.877,0,1,1,16.149,2.325,11.878,11.878,0,0,1,28.026,14.2Z\" style=\"fill:url(#a)\"/><path d=\"M16.149,26.386A12.183,12.183,0,1,1,28.333,14.2,12.2,12.2,0,0,1,16.149,26.386Zm0-23.754A11.571,11.571,0,1,0,27.72,14.2,11.584,11.584,0,0,0,16.149,2.632Z\" style=\"fill:#39396c\"/><path d=\"M27.693,12.424h0l-.328.371a7,7,0,0,0-.656-.644l-.5.074-.46-.519v.643l.394.3.262.3.35-.4c.088.165.175.33.263.5v.495l-.394.445-.722.5-.546.545-.35-.4.175-.445-.35-.4-.591-1.262-.5-.569L23.6,12.1l.2.718.371.421a17.069,17.069,0,0,0,.7,1.783,9.979,9.979,0,0,0,1.268-.1v.347l-.525,1.287-.481.544-.394.843V19.33l.132.545-.219.247-.482.3-.5.421.416.47-.569.5.109.321-.853.966H22.2l-.481.3h-.307v-.4l-.13-.793c-.169-.5-.346-.991-.525-1.484,0-.364.022-.725.044-1.089l.219-.495-.307-.595.022-.817-.416-.47.208-.68-.338-.384H19.6l-.2-.223-.591.372-.24-.273-.547.47L16.911,15.27l-.437-1.04.394-.593-.219-.247.481-1.139c.395-.491.807-.963,1.225-1.436l.744-.2.831-.1.569.149.809.816.284-.321.393-.049.744.247H23.3l.394-.347.175-.247-.394-.247-.656-.049a6.6,6.6,0,0,0-.568-.743l-.219.1-.088.644-.394-.445-.087-.5-.437-.346h-.176l.438.495-.175.445-.35.1.219-.445-.394-.2-.349-.4-.657.148-.087.2-.394.248-.219.545-.546.272-.241-.272H17.83V9.428l.569-.3h.437l-.088-.346L18.4,8.438l.59-.124.328-.371.262-.446h.482l-.132-.346.307-.2v.4l.656.148.656-.544.044-.248.568-.4a4.353,4.353,0,0,0-.612.1V5.963l.219-.5h-.219l-.48.445-.132.248.132.347-.219.593-.35-.2-.306-.346-.482.346-.175-.792.831-.544v-.3l.525-.346.831-.2.569.2,1.049.2-.262.3H22.51l.569.594.437-.495.133-.218a15.53,15.53,0,0,1,2.635,3.147A11.452,11.452,0,0,1,27.693,12.424Z\" style=\"fill:#204a87;fill-opacity:0.7134503126144409\"/><path d=\"M16.861,5.517l-.044.3.307.2.524-.346-.262-.3-.35.2-.174-.05\" style=\"fill:#204a87;fill-opacity:0.7134503126144409\"/><path d=\"M17.343,3.488l-1.138-.446-1.312.148-1.619.445-.306.3,1.006.693v.4l-.394.4.525,1.04.349-.2.438-.693a15.053,15.053,0,0,0,1.924-.743l.525-1.337\" style=\"fill:#204a87;fill-opacity:0.7134503126144409\"/><path d=\"M18.524,7.647,18.349,7.2l-.307.1.088.544.394-.2\" style=\"fill:#204a87;fill-opacity:0.7134503126144409\"/><path d=\"M18.7,7.547l-.088.595.481-.1.35-.346-.306-.3c-.1-.274-.221-.529-.35-.792h-.262v.3l.174.2v.445\" style=\"fill:#204a87;fill-opacity:0.7134503126144409\"/><path d=\"M12.225,16.953l-.35-.693-.656-.148-.35-.94-.875.1-.743-.544-.788.693v.109a3,3,0,0,1-.743-.209l-.175-.495V14.28l-.525.049q.066-.52.131-1.039H6.845l-.306.4-.306.148L5.8,13.587l-.044-.545.088-.594.656-.495H7.02l.087-.3.656.148.481.595.088-.991.831-.693.306-.743.612-.247.35-.495.787-.149.394-.593H10.432l.744-.347H11.7l.744-.248.088-.3-.263-.248-.306-.1.088-.3-.219-.445-.525.2.088-.4-.612-.347L10.3,6.8l.044.3-.481.2-.306.643-.131-.594L8.594,7l-.131-.445,1.094-.644.481-.445.044-.544-.262-.149-.35-.05-.219.545s-.366.072-.46.095A12.5,12.5,0,0,0,4.6,13.371a6.789,6.789,0,0,0,.409.711l.918.544.918.248.394.5.612.445.35-.049.262.118v.08l-.35.94-.263.4.088.2-.219.742.787,1.436.787.693.35.495L9.6,21.9l.263.593L9.6,23.637s-.021-.007.013.107a5.278,5.278,0,0,0,1.488.809l.161-.123-.087-.247.35-.347.131-.347.569-.2.437-1.089-.131-.3.306-.445.656-.149.35-.792-.088-.99.525-.743.088-.743c-.718-.356-1.43-.723-2.143-1.089\" style=\"fill:#204a87;fill-opacity:0.7134503126144409\"/><path d=\"M11.263,5.715l.437.3h.35V5.666l-.437-.2-.35.247\" style=\"fill:#204a87;fill-opacity:0.7134503126144409\"/><path d=\"M10.126,5.319l-.219.544h.438l.219-.5c.189-.133.376-.268.568-.4l.438.149.875.594.438-.4-.482-.2-.219-.446-.831-.1-.044-.248-.394.1-.175.346-.219-.446-.087.2.044.5-.35.3\" style=\"fill:#204a87;fill-opacity:0.7134503126144409\"/><path d=\"M11.7,4.081l.219-.2.438-.1a6.9,6.9,0,0,1,.918-.347l-.174-.3-.565.081-.267.266-.44.064-.391.184-.19.092-.116.155.568.1\" style=\"fill:#204a87;fill-opacity:0.7134503126144409\"/><path d=\"M12.444,8.785l.263-.4-.394-.3.131.693\" style=\"fill:#204a87;fill-opacity:0.7134503126144409\"/><path d=\"M16.149,25.783A11.58,11.58,0,1,1,27.729,14.2,11.593,11.593,0,0,1,16.149,25.783Zm0-22.548A10.968,10.968,0,1,0,27.117,14.2,10.98,10.98,0,0,0,16.149,3.235Z\" style=\"opacity:0.3956044018268585;isolation:isolate;fill:url(#b)\"/><path d=\"M5.541,10.241a4.115,4.115,0,1,0,6.636-4.866h0A4.115,4.115,0,0,0,5.54,10.24Z\" style=\"fill:url(#c)\"/><path d=\"M7.836,8.558a1.268,1.268,0,1,0,2.046-1.5h0a1.268,1.268,0,0,0-2.046,1.5Z\" style=\"fill:#fff\"/><path d=\"M17.952,24.8a5.337,5.337,0,1,0,8.607-6.312v0A5.337,5.337,0,0,0,17.95,24.8Z\" style=\"fill:url(#d)\"/><path d=\"M20.928,22.616a1.645,1.645,0,1,0,2.653-1.946h0a1.645,1.645,0,0,0-2.653,1.946Z\" style=\"fill:#fff\"/><path d=\"M4.859,18.493A4.115,4.115,0,1,0,11.5,13.626h0a4.115,4.115,0,0,0-6.636,4.866Z\" style=\"fill:url(#e)\"/><path d=\"M7.154,16.809a1.268,1.268,0,1,0,2.046-1.5h0a1.268,1.268,0,0,0-2.046,1.5Z\" style=\"fill:#fff\"/><path d=\"M12.408,10.269A4.441,4.441,0,1,0,19.57,5.016h0a4.441,4.441,0,1,0-7.162,5.253Z\" style=\"fill:url(#f)\"/><path d=\"M14.885,8.452a1.369,1.369,0,1,0,2.208-1.619h0a1.369,1.369,0,1,0-2.208,1.619Z\" style=\"fill:#fff\"/><path d=\"M12.68,26.238a3.83,3.83,0,0,1-2.909-1.087c-1.133-1.21-1.2-3.255-.2-5.757a21.542,21.542,0,0,1,5.307-7.326C20.064,7.215,25.945,5.356,28.27,7.839c1.133,1.211,1.2,3.255.2,5.757a21.553,21.553,0,0,1-5.308,7.326A21.551,21.551,0,0,1,15.5,25.733,9.229,9.229,0,0,1,12.68,26.238ZM25.342,7.28c-2.7,0-6.6,1.908-10.1,5.183A21,21,0,0,0,10.071,19.6c-.921,2.3-.887,4.138.094,5.187s2.817,1.2,5.169.437a21,21,0,0,0,7.46-4.692,21,21,0,0,0,5.175-7.132c.921-2.3.888-4.138-.095-5.187A3.34,3.34,0,0,0,25.342,7.28Z\" style=\"fill:url(#g)\"/><path d=\"M21.681,22.094a20.633,20.633,0,0,1-9.339-2.759C6.1,15.95,2.473,10.957,4.094,7.968c.79-1.458,2.7-2.175,5.4-2.012A21.542,21.542,0,0,1,18.12,8.674a21.545,21.545,0,0,1,6.987,5.746c1.6,2.167,2.051,4.163,1.261,5.621C25.622,21.416,23.915,22.094,21.681,22.094ZM8.759,6.474c-2.1,0-3.572.612-4.19,1.751C3.117,10.9,6.72,15.674,12.6,18.86s11.843,3.6,13.294.924c.685-1.263.251-3.054-1.22-5.042a21,21,0,0,0-6.81-5.593A21,21,0,0,0,9.459,6.5Q9.1,6.474,8.759,6.474Z\" style=\"fill:url(#h)\"/><path d=\"M10,24.078a3.757,3.757,0,0,1-2.851-1.065c-1.11-1.187-1.181-3.189-.2-5.639a21.062,21.062,0,0,1,5.189-7.163c5.073-4.747,10.83-6.563,13.1-4.132h0c2.275,2.431.083,8.053-4.99,12.8a21.059,21.059,0,0,1-7.491,4.7A9.024,9.024,0,0,1,10,24.078ZM22.373,5.553c-2.63,0-6.439,1.864-9.856,5.062A20.5,20.5,0,0,0,7.463,17.58c-.9,2.239-.866,4.034.09,5.055s2.745,1.172,5.038.424a20.513,20.513,0,0,0,7.284-4.582c4.766-4.46,6.994-9.853,4.965-12.02h0A3.256,3.256,0,0,0,22.373,5.553Z\" style=\"fill:url(#i)\"/><path d=\"M17.512,19.413c-.86,0-1.748-.043-2.659-.133C7.784,18.584,2.507,15.388,2.84,12h0c.333-3.383,6.133-5.49,13.2-4.791s12.345,3.892,12.012,7.275C27.763,17.436,23.324,19.413,17.512,19.413ZM3.378,12.057c-.3,3.031,4.873,6.03,11.528,6.686s12.312-1.277,12.611-4.308S22.644,8.406,15.988,7.75,3.677,9.027,3.378,12.057Z\" style=\"fill:url(#j)\"/><path d=\"M6.251,29.966h6.674V20.809h2.981L9.548,11.434,3.295,20.782l2.958.031Z\" style=\"fill:url(#k)\"/><path d=\"M12.924,30.045H6.251a.049.049,0,0,1-.039-.023c-.01-.015-.016-3.135-.016-3.156l0-5.975-2.9-.03a.06.06,0,0,1-.051-.048.1.1,0,0,1,.011-.085L9.508,11.38a.056.056,0,0,1,.041-.025.05.05,0,0,1,.04.024l6.357,9.375a.1.1,0,0,1,.011.086.059.059,0,0,1-.051.048H12.98v9.078C12.98,30.01,12.955,30.045,12.924,30.045Zm-6.618-.158h6.562V20.809c0-.044.025-.079.056-.079h2.85L9.549,11.549,3.424,20.7l2.83.03c.031,0,.055.036.055.079Z\" style=\"fill:#183868\"/><path d=\"M19.053,20.587l-2.958.031,6.254,9.348,6.357-9.375H25.724V11.434H19.051Z\" style=\"fill:url(#l)\"/><path d=\"M25.78,11.434v9.078h2.925a.059.059,0,0,1,.051.048.1.1,0,0,1-.011.086l-6.357,9.375a.05.05,0,0,1-.04.024.056.056,0,0,1-.041-.025l-6.254-9.348a.1.1,0,0,1-.011-.085.06.06,0,0,1,.051-.048l2.9-.03,0-5.975c0-.021.006-3.141.016-3.156a.049.049,0,0,1,.039-.023h6.674C25.755,11.355,25.78,11.39,25.78,11.434Zm-6.672,9.153c0,.043-.025.079-.055.079l-2.83.03,6.125,9.156,6.226-9.181h-2.85c-.031,0-.056-.035-.056-.079V11.513H19.107Z\" style=\"fill:#183868\"/>",
	},
	"Idris": {
		colour: "#8a0819",
		icon: "<path d=\"M13.376,6.2c3.6,1.1,4.5,2,5.8,5.2-.3-4-1.9-5.6-5.8-5.2Z\" style=\"fill:#8a0819\"/><path d=\"M8.376,12.4c2.3.7,5,1.3,6,5.7.4-5.5-2.2-5.8-6-5.7Z\" style=\"fill:#8a0819\"/><path d=\"M9.976,8.8c3.5.7,5.7,1.7,7,6.2.3-5.8-2.9-6.4-7-6.2Z\" style=\"fill:#8a0819\"/><path d=\"M14.576,2c19.1,12.4-4.2,12.7.8,27.1l3,.9c-8.3-11.2,18.4-17-3.8-28Z\" style=\"fill:#8a0819\"/>",
	},
	"Ini": {
		colour: "#99b8c4",
		icon: "<path d=\"M23.265,24.381l.9-.894c4.164.136,4.228-.01,4.411-.438l1.144-2.785L29.805,20l-.093-.231c-.049-.122-.2-.486-2.8-2.965V15.5c3-2.89,2.936-3.038,2.765-3.461L28.538,9.225c-.171-.422-.236-.587-4.37-.474l-.9-.93a20.166,20.166,0,0,0-.141-4.106l-.116-.263-2.974-1.3c-.438-.2-.592-.272-3.4,2.786l-1.262-.019c-2.891-3.086-3.028-3.03-3.461-2.855L9.149,3.182c-.433.175-.586.237-.418,4.437l-.893.89c-4.162-.136-4.226.012-4.407.438L2.285,11.733,2.195,12l.094.232c.049.12.194.48,2.8,2.962l0,1.3c-3,2.89-2.935,3.038-2.763,3.462l1.138,2.817c.174.431.236.584,4.369.476l.9.935a20.243,20.243,0,0,0,.137,4.1l.116.265,2.993,1.308c.435.182.586.247,3.386-2.8l1.262.016c2.895,3.09,3.043,3.03,3.466,2.859l2.759-1.115C23.288,28.644,23.44,28.583,23.265,24.381ZM11.407,17.857a4.957,4.957,0,1,1,6.488,2.824A5.014,5.014,0,0,1,11.407,17.857Z\" style=\"fill:#99b8c4\"/>",
	},
	"Io": {
		colour: "#c2c2c2",
		icon: "<path d=\"M2,2.887H7.075V7.51H2Zm.052,6.83H7.04V28.626H2.052Z\" style=\"fill:#c2c2c2\"/><path d=\"M13.271,26.454a9.791,9.791,0,0,1-2.616-7.178,10.148,10.148,0,0,1,2.616-7.343,9.321,9.321,0,0,1,7.047-2.72,9.34,9.34,0,0,1,7.075,2.72A10.168,10.168,0,0,1,30,19.276a9.809,9.809,0,0,1-2.607,7.178,9.456,9.456,0,0,1-7.075,2.659A9.436,9.436,0,0,1,13.271,26.454Zm10.436-2.972a6.7,6.7,0,0,0,1.166-4.258,6.943,6.943,0,0,0-1.166-4.354,4.047,4.047,0,0,0-3.389-1.486,4.022,4.022,0,0,0-3.38,1.486,6.991,6.991,0,0,0-1.156,4.354,6.744,6.744,0,0,0,1.156,4.258,4.053,4.053,0,0,0,3.38,1.46A4.078,4.078,0,0,0,23.707,23.482Z\" style=\"fill:#c2c2c2\"/>",
	},
	"Java": {
		colour: "#5382a1",
		icon: "<path d=\"M12.325,23.654s-1.07.622.761.833a16.023,16.023,0,0,0,5.8-.246,10.088,10.088,0,0,0,1.541.752c-5.481,2.349-12.405-.136-8.1-1.339\" style=\"fill:#5382a1\"/><path d=\"M11.656,20.588s-1.2.888.633,1.078a22.618,22.618,0,0,0,7.481-.359,3.32,3.32,0,0,0,1.152.7c-6.627,1.938-14.009.153-9.266-1.421\" style=\"fill:#5382a1\"/><path d=\"M17.3,15.388a2.051,2.051,0,0,1-.355,2.954s3.429-1.77,1.854-3.987c-1.471-2.067-2.6-3.095,3.508-6.636,0,0-9.586,2.394-5.007,7.669\" style=\"fill:#5382a1\"/><path d=\"M24.552,25.921s.792.652-.872,1.157c-3.164.958-13.168,1.248-15.948.038-1-.435.874-1.038,1.464-1.164a3.8,3.8,0,0,1,.966-.108c-1.111-.783-7.181,1.537-3.083,2.2,11.176,1.812,20.372-.816,17.473-2.124\" style=\"fill:#5382a1\"/><path d=\"M12.84,17.412s-5.089,1.209-1.8,1.648a38.225,38.225,0,0,0,6.731-.072c2.106-.178,4.221-.555,4.221-.555a8.934,8.934,0,0,0-1.28.685c-5.168,1.359-15.151.727-12.277-.663a9.629,9.629,0,0,1,4.407-1.042\" style=\"fill:#5382a1\"/><path d=\"M21.969,22.515c5.253-2.73,2.824-5.353,1.129-5a3.932,3.932,0,0,0-.6.161.957.957,0,0,1,.449-.346c3.354-1.179,5.933,3.478-1.083,5.322a.458.458,0,0,0,.106-.138\" style=\"fill:#5382a1\"/><path d=\"M18.8,2s2.909,2.91-2.759,7.386c-4.546,3.59-1.037,5.637,0,7.975-2.653-2.394-4.6-4.5-3.294-6.463C14.664,8.019,19.976,6.623,18.8,2\" style=\"fill:#5382a1\"/><path d=\"M13.356,29.912c5.042.323,12.786-.179,12.969-2.565,0,0-.353.9-4.167,1.623a41.458,41.458,0,0,1-12.76.2s.645.533,3.959.746\" style=\"fill:#5382a1\"/>",
		inlineComment: [
			"//",
		],
	},
	"JavaScript": {
		colour: "#f5de19",
		icon: "<rect x=\"2\" y=\"2\" width=\"28\" height=\"28\" style=\"fill:#f5de19\"/><path d=\"M20.809,23.875a2.866,2.866,0,0,0,2.6,1.6c1.09,0,1.787-.545,1.787-1.3,0-.9-.716-1.222-1.916-1.747l-.658-.282c-1.9-.809-3.16-1.822-3.16-3.964,0-1.973,1.5-3.476,3.853-3.476a3.889,3.889,0,0,1,3.742,2.107L25,18.128A1.789,1.789,0,0,0,23.311,17a1.145,1.145,0,0,0-1.259,1.128c0,.789.489,1.109,1.618,1.6l.658.282c2.236.959,3.5,1.936,3.5,4.133,0,2.369-1.861,3.667-4.36,3.667a5.055,5.055,0,0,1-4.795-2.691Zm-9.295.228c.413.733.789,1.353,1.693,1.353.864,0,1.41-.338,1.41-1.653V14.856h2.631v8.982c0,2.724-1.6,3.964-3.929,3.964a4.085,4.085,0,0,1-3.947-2.4Z\"/>",
		inlineComment: [
			"//",
		],
	},
	"JSON": {
		colour: "#f5de19",
		icon: "<path d=\"M4.014,14.976a2.51,2.51,0,0,0,1.567-.518A2.377,2.377,0,0,0,6.386,13.1,15.261,15.261,0,0,0,6.6,10.156q.012-2.085.075-2.747a5.236,5.236,0,0,1,.418-1.686,3.025,3.025,0,0,1,.755-1.018A3.046,3.046,0,0,1,9,4.125,6.762,6.762,0,0,1,10.544,4h.7V5.96h-.387a2.338,2.338,0,0,0-1.723.468A3.4,3.4,0,0,0,8.709,8.52a36.054,36.054,0,0,1-.137,4.133,4.734,4.734,0,0,1-.768,2.06A4.567,4.567,0,0,1,6.1,16a3.809,3.809,0,0,1,1.992,1.754,8.861,8.861,0,0,1,.618,3.865q0,2.435.05,2.9A1.755,1.755,0,0,0,9.264,25.7a2.639,2.639,0,0,0,1.592.337h.387V28h-.7a5.655,5.655,0,0,1-1.773-.2,2.97,2.97,0,0,1-1.324-.93,3.353,3.353,0,0,1-.681-1.63A24.175,24.175,0,0,1,6.6,22.006,16.469,16.469,0,0,0,6.386,18.9a2.408,2.408,0,0,0-.805-1.361,2.489,2.489,0,0,0-1.567-.524Z\" style=\"fill:#f5de19\"/><path d=\"M27.986,17.011a2.489,2.489,0,0,0-1.567.524,2.408,2.408,0,0,0-.805,1.361,16.469,16.469,0,0,0-.212,3.109,24.175,24.175,0,0,1-.169,3.234,3.353,3.353,0,0,1-.681,1.63,2.97,2.97,0,0,1-1.324.93,5.655,5.655,0,0,1-1.773.2h-.7V26.04h.387a2.639,2.639,0,0,0,1.592-.337,1.755,1.755,0,0,0,.506-1.186q.05-.462.05-2.9a8.861,8.861,0,0,1,.618-3.865A3.809,3.809,0,0,1,25.9,16a4.567,4.567,0,0,1-1.7-1.286,4.734,4.734,0,0,1-.768-2.06,36.054,36.054,0,0,1-.137-4.133,3.4,3.4,0,0,0-.425-2.092,2.338,2.338,0,0,0-1.723-.468h-.387V4h.7A6.762,6.762,0,0,1,23,4.125a3.046,3.046,0,0,1,1.149.581,3.025,3.025,0,0,1,.755,1.018,5.236,5.236,0,0,1,.418,1.686q.062.662.075,2.747a15.261,15.261,0,0,0,.212,2.947,2.377,2.377,0,0,0,.805,1.355,2.51,2.51,0,0,0,1.567.518Z\" style=\"fill:#f5de19\"/>",
	},
	"JSON5": {
		colour: "#909090",
		icon: "<path d=\"M12.815,15.167l.68-5.676h6.489v2h-4.4L15.329,13.7a2.4,2.4,0,0,1,.252-.122,2.962,2.962,0,0,1,.374-.13,2.9,2.9,0,0,1,.458-.106,2.834,2.834,0,0,1,.512-.046,3.983,3.983,0,0,1,1.466.252,2.736,2.736,0,0,1,1.076.723,3.167,3.167,0,0,1,.664,1.168,5,5,0,0,1,.228,1.588,4.157,4.157,0,0,1-.236,1.387,3.307,3.307,0,0,1-1.9,2.029,4.3,4.3,0,0,1-1.715.312,4.75,4.75,0,0,1-1.458-.228,4.054,4.054,0,0,1-1.252-.656,3.359,3.359,0,0,1-.878-1.046,2.787,2.787,0,0,1-.32-1.382H15.18a1.458,1.458,0,0,0,.39.97,1.383,1.383,0,0,0,1.558.206,1.089,1.089,0,0,0,.4-.412,1.749,1.749,0,0,0,.206-.618,4.3,4.3,0,0,0,.062-.74,2.709,2.709,0,0,0-.092-.74,1.506,1.506,0,0,0-.282-.558,1.229,1.229,0,0,0-.5-.349,1.78,1.78,0,0,0-.718-.13,2.121,2.121,0,0,0-.5.054,1.805,1.805,0,0,0-.382.138,1.318,1.318,0,0,0-.274.19,1.28,1.28,0,0,0-.19.2l-2.048-.482\" style=\"fill:#fff\"/><path d=\"M5.985,23.343a4.45,4.45,0,0,1-1.311-.58,3.2,3.2,0,0,1-.848-.824,3.012,3.012,0,0,1-.458-1.008,4.879,4.879,0,0,1-.13-1.143v-1.55a2.3,2.3,0,0,0-.076-.618,1.184,1.184,0,0,0-.222-.466.969.969,0,0,0-.382-.306A1.324,1.324,0,0,0,2,16.744V15.012a1.074,1.074,0,0,0,.937-.4,1.841,1.841,0,0,0,.3-1.1v-1.55a4.879,4.879,0,0,1,.13-1.143,3.037,3.037,0,0,1,.458-1.008A3.17,3.17,0,0,1,4.671,9a4.482,4.482,0,0,1,1.311-.58l.48,1.344a1.222,1.222,0,0,0-.488.328,1.742,1.742,0,0,0-.306.5,2.524,2.524,0,0,0-.16.634,5.827,5.827,0,0,0-.046.74v1.55A2.844,2.844,0,0,1,5.126,14.9a2.37,2.37,0,0,1-1.076.983,2.356,2.356,0,0,1,1.076.992,2.808,2.808,0,0,1,.336,1.374v1.55a5.827,5.827,0,0,0,.046.74,2.586,2.586,0,0,0,.16.634,1.684,1.684,0,0,0,.306.5A1.222,1.222,0,0,0,6.462,22c0-.005-.477,1.344-.477,1.344\" style=\"fill:#999\"/><path d=\"M8.215,19.393a1.289,1.289,0,0,1,.1-.512,1.212,1.212,0,0,1,.29-.4,1.373,1.373,0,0,1,.45-.274,1.637,1.637,0,0,1,.58-.1,1.555,1.555,0,0,1,.572.1,1.269,1.269,0,0,1,.45.274,1.077,1.077,0,0,1,.29.4,1.294,1.294,0,0,1,0,1.024,1.151,1.151,0,0,1-.29.412,1.388,1.388,0,0,1-.45.268,1.613,1.613,0,0,1-.572.1,1.578,1.578,0,0,1-.58-.1,1.409,1.409,0,0,1-.45-.268,1.229,1.229,0,0,1-.39-.924m0-6.088a1.289,1.289,0,0,1,.1-.512,1.212,1.212,0,0,1,.29-.4,1.373,1.373,0,0,1,.45-.274,1.637,1.637,0,0,1,.58-.1,1.555,1.555,0,0,1,.572.1,1.269,1.269,0,0,1,.45.274,1.077,1.077,0,0,1,.29.4,1.294,1.294,0,0,1,0,1.024,1.151,1.151,0,0,1-.29.412,1.388,1.388,0,0,1-.45.268,1.613,1.613,0,0,1-.572.1,1.578,1.578,0,0,1-.58-.1,1.409,1.409,0,0,1-.45-.268,1.229,1.229,0,0,1-.39-.924\" style=\"fill:#999\"/><path d=\"M24.24,20.293a3.648,3.648,0,0,1-.122.929,4.534,4.534,0,0,1-.336.891,4.706,4.706,0,0,1-.5.807,4.005,4.005,0,0,1-.61.664l-1.3-.61c.081-.173.168-.349.26-.526a4.846,4.846,0,0,0,.268-.558,4.443,4.443,0,0,0,.206-.656,3.406,3.406,0,0,0,.084-.8V18.656h2.059l-.008,1.636\" style=\"fill:#999\"/><path d=\"M25.538,21.994a1.251,1.251,0,0,0,.488-.328,1.707,1.707,0,0,0,.306-.5,2.525,2.525,0,0,0,.16-.634,5.826,5.826,0,0,0,.046-.74v-1.55a2.844,2.844,0,0,1,.336-1.382,2.364,2.364,0,0,1,1.084-.983,2.364,2.364,0,0,1-1.084-.983,2.844,2.844,0,0,1-.336-1.382v-1.55a5.827,5.827,0,0,0-.046-.74,2.586,2.586,0,0,0-.16-.634,1.684,1.684,0,0,0-.306-.5,1.222,1.222,0,0,0-.488-.328l.48-1.338A4.45,4.45,0,0,1,27.329,9a3.092,3.092,0,0,1,.848.815,2.892,2.892,0,0,1,.45,1.008,4.606,4.606,0,0,1,.138,1.143v1.55a2.655,2.655,0,0,0,.068.626,1.448,1.448,0,0,0,.222.474,1.037,1.037,0,0,0,.382.3,1.376,1.376,0,0,0,.564.106v1.731a1.077,1.077,0,0,0-.946.412,1.828,1.828,0,0,0-.29,1.084v1.55a4.606,4.606,0,0,1-.138,1.143,2.915,2.915,0,0,1-.45,1.008,3.157,3.157,0,0,1-.848.824,4.482,4.482,0,0,1-1.311.58l-.48-1.352\" style=\"fill:#999\"/>",
	},
	"Julia": {
		colour: "#4063d8",
		icon: "<path d=\"M7.448,21.983V13.775l-2.432.669v8.729a2.66,2.66,0,0,1-.106.929.336.336,0,0,1-.308.239.405.405,0,0,1-.212-.074,1.282,1.282,0,0,1-.287-.3,2.813,2.813,0,0,0-.377-.409.874.874,0,0,0-.611-.207,1.22,1.22,0,0,0-.812.255.789.789,0,0,0-.3.627A.907.907,0,0,0,2.542,25a3.115,3.115,0,0,0,1.561.319,7.065,7.065,0,0,0,1.37-.122,2.361,2.361,0,0,0,1.057-.483,2.292,2.292,0,0,0,.68-1.014,5.094,5.094,0,0,0,.239-1.715Z\" style=\"fill:#252525\"/><path d=\"M10.825,14.008H8.4v5.618a2.241,2.241,0,0,0,.218.977,2.489,2.489,0,0,0,.6.8,2.9,2.9,0,0,0,.892.536,3.045,3.045,0,0,0,1.1.2,2.55,2.55,0,0,0,1.051-.244,4.347,4.347,0,0,0,1.019-.648v.743H15.71V14.008H13.289v5.756a2.764,2.764,0,0,1-.648.706,1.139,1.139,0,0,1-.648.281,1.155,1.155,0,0,1-.457-.09,1.263,1.263,0,0,1-.372-.239,1.06,1.06,0,0,1-.25-.356,1.091,1.091,0,0,1-.09-.441Z\" style=\"fill:#252525\"/><path d=\"M19.074,21.983V10.132l-2.411.669V21.983Z\" style=\"fill:#252525\"/><path d=\"M20.038,14.444v7.54h2.421V13.775Z\" style=\"fill:#252525\"/><path d=\"M27.568,17.863v2.3q-.372.276-.674.457a1.165,1.165,0,0,1-.6.181.468.468,0,0,1-.276-.09,1,1,0,0,1-.234-.239,1.138,1.138,0,0,1-.165-.356,1.576,1.576,0,0,1-.058-.43.968.968,0,0,1,.181-.552,2.306,2.306,0,0,1,.473-.5,4.572,4.572,0,0,1,.648-.43,7.612,7.612,0,0,1,.706-.345ZM30,21.983V16a2.083,2.083,0,0,0-.191-.9,1.779,1.779,0,0,0-.595-.69,3.006,3.006,0,0,0-1.025-.441,6.225,6.225,0,0,0-1.481-.154,5.735,5.735,0,0,0-1.327.149,4.6,4.6,0,0,0-1.1.4,2.373,2.373,0,0,0-.759.611,1.216,1.216,0,0,0-.281.77.958.958,0,0,0,.319.738,1.178,1.178,0,0,0,.828.292,1.364,1.364,0,0,0,.547-.1.8.8,0,0,0,.335-.255.986.986,0,0,0,.165-.372,1.978,1.978,0,0,0,.048-.435,1.031,1.031,0,0,1,.223-.669.975.975,0,0,1,.8-.276,1.008,1.008,0,0,1,.781.319,1.594,1.594,0,0,1,.292,1.083v.786l-.265.064q-.488.149-.988.313t-.961.361a7.884,7.884,0,0,0-.865.43,3.511,3.511,0,0,0-.706.531,2.319,2.319,0,0,0-.478.669,1.918,1.918,0,0,0-.175.828,2.034,2.034,0,0,0,.165.823,1.876,1.876,0,0,0,.473.653,2.255,2.255,0,0,0,.749.435,2.907,2.907,0,0,0,.993.159,3.679,3.679,0,0,0,.7-.058,2.509,2.509,0,0,0,.536-.165,2.209,2.209,0,0,0,.43-.25q.191-.143.393-.313v.637Z\" style=\"fill:#252525\"/><circle cx=\"6.204\" cy=\"11.672\" r=\"1.5\" style=\"fill:#6682df\"/><path d=\"M6.2,13.287a1.615,1.615,0,1,1,1.615-1.615A1.617,1.617,0,0,1,6.2,13.287Zm0-3a1.385,1.385,0,1,0,1.385,1.385A1.386,1.386,0,0,0,6.2,10.287Z\" style=\"fill:#4063d8\"/><circle cx=\"21.417\" cy=\"11.672\" r=\"1.5\" style=\"fill:#d5635c\"/><path d=\"M21.417,13.287a1.615,1.615,0,1,1,1.615-1.615A1.617,1.617,0,0,1,21.417,13.287Zm0-3A1.385,1.385,0,1,0,22.8,11.672,1.386,1.386,0,0,0,21.417,10.287Z\" style=\"fill:#cb3c33\"/><circle cx=\"23.385\" cy=\"8.297\" r=\"1.5\" style=\"fill:#60ad51\"/><path d=\"M23.385,9.912A1.615,1.615,0,1,1,25,8.3,1.617,1.617,0,0,1,23.385,9.912Zm0-3A1.385,1.385,0,1,0,24.77,8.3,1.386,1.386,0,0,0,23.385,6.912Z\" style=\"fill:#389826\"/><circle cx=\"25.354\" cy=\"11.672\" r=\"1.5\" style=\"fill:#aa79c1\"/><path d=\"M25.354,13.287a1.615,1.615,0,1,1,1.615-1.615A1.617,1.617,0,0,1,25.354,13.287Zm0-3a1.385,1.385,0,1,0,1.385,1.385A1.386,1.386,0,0,0,25.354,10.287Z\" style=\"fill:#9558b2\"/>",
	},
	"Kotlin": {
		colour: "#9d4b9d",
		icon: "<defs><linearGradient id=\"a\" x1=\"311.336\" y1=\"1452.064\" x2=\"283.342\" y2=\"1480.058\" gradientTransform=\"translate(-281.4 -1450)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#e44857\"/><stop offset=\"0.47\" stop-color=\"#9d4b9d\"/><stop offset=\"1\" stop-color=\"#6d5faa\"/></linearGradient></defs><title>file_type_kotlin</title><path d=\"M30,30H2V2H30L16,16Z\" style=\"fill:url(#a)\"/>",
	},
	"Kusto": {
		colour: "#59b4d9",
		icon: "<rect x=\"0.55\" y=\"22.339\" width=\"15.433\" height=\"2.796\" rx=\"0.439\" transform=\"translate(-14.363 12.797) rotate(-44.999)\" style=\"fill:#b8d432\"/><rect x=\"1.372\" y=\"16.382\" width=\"9.859\" height=\"2.796\" rx=\"0.439\" transform=\"translate(-10.727 9.663) rotate(-44.999)\" style=\"fill:#b8d432\"/><rect x=\"9.232\" y=\"24.301\" width=\"9.859\" height=\"2.796\" rx=\"0.439\" transform=\"translate(-14.024 17.541) rotate(-44.999)\" style=\"fill:#b8d432\"/><polygon points=\"30 2 2 2 30 29.999 30 2\" style=\"fill:#0078d4\"/><polygon points=\"10.282 10.282 21.718 21.718 30 13.436 30 2 18.564 2 10.282 10.282\" style=\"fill:#59b4d9\"/><polygon points=\"30 29.999 30 2 16 16 30 29.999\" style=\"fill:#fff;opacity:0.20000000298023224;isolation:isolate\"/><rect x=\"16.226\" y=\"9.001\" width=\"2.796\" height=\"2.796\" rx=\"0.622\" transform=\"translate(-2.192 15.507) rotate(-44.999)\" style=\"fill:#fff\"/><rect x=\"20.18\" y=\"5.048\" width=\"2.796\" height=\"2.796\" rx=\"0.622\" transform=\"translate(1.762 17.146) rotate(-44.999)\" style=\"fill:#fff\"/><rect x=\"20.18\" y=\"12.955\" width=\"2.796\" height=\"2.796\" rx=\"0.622\" transform=\"translate(-3.829 19.461) rotate(-44.999)\" style=\"fill:#fff\"/><rect x=\"24.133\" y=\"9.002\" width=\"2.796\" height=\"2.796\" rx=\"0.622\" transform=\"translate(0.124 21.099) rotate(-44.999)\" style=\"fill:#fff\"/>",
	},
	"LaTeX": {
		colour: "#cfcfcf",
		icon: "<path d=\"M11.333,13.122c-.128-1.562-.241-2.756-2.287-2.756H7.91v8.4h2.145v.611l-3.083-.029-3.082.029v-.611H6.034v-8.4H4.884c-2.046,0-2.159,1.208-2.287,2.756H2l.284-3.367h9.362l.284,3.367h-.6Z\" style=\"fill:#cfcfcf\"/><path d=\"M19.289,22.53H10.41V21.92h1.506V13.467H10.41v-.611h8.637l.412,3.367h-.6c-.213-1.833-.682-2.756-2.855-2.756H13.791V17.2h.838c1.364,0,1.505-.6,1.505-1.662h.6v3.935h-.6c0-1.08-.142-1.662-1.505-1.662h-.838v4.106h2.216c2.472,0,3-1.108,3.3-3.225h.6Z\" style=\"fill:#cfcfcf\"/><path d=\"M27.727,19.186c-.54,0-1.96,0-2.415.029V18.6h1.179l-2.557-3.552-2.529,3.381A4.1,4.1,0,0,0,22.7,18.6v.611c-.355-.029-1.576-.029-2.017-.029-.4,0-1.548,0-1.875.029V18.6h.383a7.459,7.459,0,0,0,.824-.043c.5-.043.54-.085.667-.256L23.536,14.5l-3.153-4.418H19V9.47c.384.028,1.79.028,2.273.028.582,0,1.918,0,2.429-.028v.611H22.528l2.117,2.955,2.074-2.784a4.1,4.1,0,0,0-1.293-.17V9.47c.356.028,1.591.028,2.032.028.4,0,1.534,0,1.861-.028v.611h-.369a5.264,5.264,0,0,0-.838.043c-.469.043-.526.071-.667.256l-2.4,3.21L28.636,18.6H30v.611C29.645,19.186,28.182,19.186,27.727,19.186Z\" style=\"fill:#cfcfcf\"/>",
		inlineComment: [
			"%",
		],
	},
	"Less": {
		colour: "#2a4f84",
		icon: "<defs><linearGradient id=\"a\" x1=\"-3.609\" y1=\"-492.685\" x2=\"-3.609\" y2=\"-480.271\" gradientTransform=\"translate(19.712 502.891)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0.15\" stop-color=\"#2a4f84\"/><stop offset=\"0.388\" stop-color=\"#294e82\"/><stop offset=\"1\" stop-color=\"#172e4e\"/></linearGradient></defs><title>file_type_less</title><path d=\"M28.559,20.226a2.4,2.4,0,0,1-2.394,2.394H6.04a2.4,2.4,0,0,1-2.394-2.394V12.6A2.4,2.4,0,0,1,6.04,10.206H26.165A2.4,2.4,0,0,1,28.559,12.6Z\" style=\"fill:url(#a)\"/><path d=\"M24.349,16.25a1.972,1.972,0,0,1,1.578,1.891,1.69,1.69,0,0,1-.653,1.4,2.934,2.934,0,0,1-1.862.559,4.558,4.558,0,0,1-2.241-.618,1.986,1.986,0,0,1,.16-.669,1.83,1.83,0,0,1,.35-.576,3.7,3.7,0,0,0,1.649.493.965.965,0,0,0,.51-.112.339.339,0,0,0,.178-.3q0-.353-.546-.529l-.653-.247q-1.482-.54-1.482-1.762a1.753,1.753,0,0,1,.623-1.416,2.587,2.587,0,0,1,1.678-.648,5.094,5.094,0,0,1,1.15.147,4.555,4.555,0,0,1,1.032.472,1.668,1.668,0,0,1-.13.722,1.22,1.22,0,0,1-.38.558,4.261,4.261,0,0,0-1.66-.446.544.544,0,0,0-.362.106.338.338,0,0,0-.124.27q0,.282.451.446l.736.259Z\" style=\"fill:#f6f6f6\"/><path d=\"M19.1,16.25a1.972,1.972,0,0,1,1.577,1.891,1.691,1.691,0,0,1-.652,1.4,2.937,2.937,0,0,1-1.862.559,4.56,4.56,0,0,1-2.241-.618,1.981,1.981,0,0,1,.16-.669,1.821,1.821,0,0,1,.35-.576,3.7,3.7,0,0,0,1.649.493.963.963,0,0,0,.51-.112.34.34,0,0,0,.178-.3q0-.353-.546-.529l-.653-.247q-1.482-.54-1.482-1.762a1.752,1.752,0,0,1,.623-1.416,2.585,2.585,0,0,1,1.677-.648,5.088,5.088,0,0,1,1.15.147,4.552,4.552,0,0,1,1.032.472,1.668,1.668,0,0,1-.13.722,1.22,1.22,0,0,1-.38.558,4.263,4.263,0,0,0-1.661-.446.543.543,0,0,0-.362.106.339.339,0,0,0-.124.27q0,.282.451.446l.736.259Z\" style=\"fill:#f6f6f6\"/><path d=\"M15.264,16.333a2.822,2.822,0,0,0-.172-1,2.239,2.239,0,0,0-.492-.787,2.28,2.28,0,0,0-.777-.517,2.737,2.737,0,0,0-1.026-.314,2.8,2.8,0,0,0-1.18.361,2.256,2.256,0,0,0-.83.646,2.765,2.765,0,0,0-.487.969,4.4,4.4,0,0,0-.16,1.216,5.681,5.681,0,0,0,.13,1.257,2.628,2.628,0,0,0,.445,1,2.107,2.107,0,0,0,.818.657,2.935,2.935,0,0,0,1.251.277,3.952,3.952,0,0,0,2.324-.712,1.865,1.865,0,0,0-.484-1.081,6.188,6.188,0,0,1-.857.262,3.208,3.208,0,0,1-.656.079,1.017,1.017,0,0,1-.815-.29,1.187,1.187,0,0,1-.271-.77h3.083A4.447,4.447,0,0,0,15.264,16.333Zm-3.248.081a2.433,2.433,0,0,1,.218-1,.632.632,0,0,1,.559-.264.66.66,0,0,1,.582.282,1.749,1.749,0,0,1,.194.856v.13H12.016Z\" style=\"fill:#f6f6f6\"/><path d=\"M29.18,17.2a1.605,1.605,0,0,0-.53,1.265v2.051a1.81,1.81,0,0,1-.683,1.557,2.8,2.8,0,0,1-1.654.549l-.373,0V21.594a1.241,1.241,0,0,0,.595-.334,1.369,1.369,0,0,0,.419-1.047V18.556a2.545,2.545,0,0,1,.257-1.323,2.5,2.5,0,0,1,1.2-.838,2.528,2.528,0,0,1-1.324-1.179,2.956,2.956,0,0,1-.135-1.165V12.533a1.458,1.458,0,0,0-.366-1.054,1.152,1.152,0,0,0-.648-.314v-.96c.445,0,.669,0,.928,0a1.676,1.676,0,0,1,1.023.442,2,2,0,0,1,.673,1.009,2.33,2.33,0,0,1,.086.7v1.757a1.846,1.846,0,0,0,.5,1.383,2.113,2.113,0,0,0,.854.479v.794a1.943,1.943,0,0,0-.82.426Z\" style=\"fill:#f6f6f6;stroke:#404040;stroke-miterlimit:10;stroke-width:0.25px\"/><path d=\"M5.594,10.206H5.26a1.673,1.673,0,0,0-1.023.442,1.71,1.71,0,0,0-.673,1.009,3.531,3.531,0,0,0-.038.7v1.757A1.867,1.867,0,0,1,2.981,15.5,2.847,2.847,0,0,1,2,15.977v.793a2.552,2.552,0,0,1,.947.426,1.638,1.638,0,0,1,.577,1.265v2.051A1.781,1.781,0,0,0,4.16,22.07a2.8,2.8,0,0,0,1.654.55l.421,0V21.594a1.47,1.47,0,0,1-.643-.334,1.355,1.355,0,0,1-.371-1.047V18.557a2.516,2.516,0,0,0-.305-1.323,2.5,2.5,0,0,0-1.2-.838,2.529,2.529,0,0,0,1.324-1.178,2.857,2.857,0,0,0,.183-1.165V12.534A1.462,1.462,0,0,1,5.54,11.48a1.313,1.313,0,0,1,.575-.271l.428,0V10.206H5.594Z\" style=\"fill:#f6f6f6;stroke:#404040;stroke-miterlimit:10;stroke-width:0.25px\"/><path d=\"M9.537,18.529h-.32c-.348,0-.479-.183-.479-.551V11.219a1.256,1.256,0,0,0-.268-.856c-.15-.164-.411-.162-.783-.162H6.964l-.085,0v8.106a1.875,1.875,0,0,0,.352,1.24,1.441,1.441,0,0,0,1.145.393,7.859,7.859,0,0,0,1.269-.118,2.23,2.23,0,0,0,.036-.509,2.278,2.278,0,0,0-.142-.782Z\" style=\"fill:#f6f6f6\"/>",
	},
	"Liquid": {
		colour: "#004999",
		icon: "<path d=\"M29.988,22.372l-.748.048a5.209,5.209,0,0,1-2.99-.671,7.8,7.8,0,0,0-7.8,0,5.275,5.275,0,0,1-5.3.01A7.262,7.262,0,0,0,9.263,20.7a7.229,7.229,0,0,0-3.94,1.06,4.751,4.751,0,0,1-2.47.7l-.838,0c0,.889-.009,1.739-.015,2.515l.861,0a7.237,7.237,0,0,0,3.75-1.052,4.763,4.763,0,0,1,2.659-.7,4.835,4.835,0,0,1,2.634.718,7.794,7.794,0,0,0,7.8,0,5.287,5.287,0,0,1,5.319,0,7.709,7.709,0,0,0,4.4.989L30,24.888C29.995,24.1,29.991,23.249,29.988,22.372Z\" style=\"fill:#004999\"/><path d=\"M29.983,15.581l-.743.047a5.226,5.226,0,0,1-2.99-.671,7.8,7.8,0,0,0-7.8,0,5.278,5.278,0,0,1-5.3.01A7.312,7.312,0,0,0,9.263,13.91a7.3,7.3,0,0,0-3.941,1.06,4.742,4.742,0,0,1-2.469.7l-.828,0c0,.849,0,1.693,0,2.515l.84,0a7.237,7.237,0,0,0,3.75-1.052,4.7,4.7,0,0,1,2.659-.7,4.8,4.8,0,0,1,2.634.718,7.794,7.794,0,0,0,7.8,0,5.287,5.287,0,0,1,5.319,0,7.709,7.709,0,0,0,4.4.989l.568-.037C29.983,17.269,29.983,16.424,29.983,15.581Z\" style=\"fill:#004999\"/><path d=\"M29.24,9.137a5.254,5.254,0,0,1-2.99-.671,7.8,7.8,0,0,0-7.8,0,5.275,5.275,0,0,1-5.3.009A7.16,7.16,0,0,0,9.263,7.42a7.159,7.159,0,0,0-3.94,1.059,4.738,4.738,0,0,1-2.469.7l-.834,0c0,.82,0,1.664,0,2.517l.836,0a7.237,7.237,0,0,0,3.75-1.052,4.738,4.738,0,0,1,2.659-.706,4.814,4.814,0,0,1,2.634.719,7.791,7.791,0,0,0,7.8,0,5.293,5.293,0,0,1,5.319,0,7.732,7.732,0,0,0,4.4.988l.568-.037c0-.859,0-1.7.007-2.516Z\" style=\"fill:#004999\"/>",
	},
	"Lisp": {
		colour: "#8381c5",
		icon: "<defs><linearGradient id=\"a\" x1=\"1925.785\" y1=\"-1383.075\" x2=\"2302.351\" y2=\"-1868.557\" gradientTransform=\"matrix(0.048, 0, 0, -0.045, -82.539, -54.65)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#8381c5\"/><stop offset=\"0.566\" stop-color=\"#7e55b3\" stop-opacity=\"0.996\"/><stop offset=\"1\" stop-color=\"#a52ecb\" stop-opacity=\"0.992\"/></linearGradient><linearGradient id=\"b\" x1=\"2214.187\" y1=\"-1750.225\" x2=\"1930.974\" y2=\"-1408.342\" gradientTransform=\"matrix(0.054, 0, 0, -0.054, -95.188, -68.487)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#411f5d\"/><stop offset=\"1\" stop-color=\"#5b2a85\"/></linearGradient></defs><title>file_type_emacs</title><path d=\"M29.363,16A13.364,13.364,0,1,1,16,2.5,13.432,13.432,0,0,1,29.363,16Z\" style=\"stroke-width:0.75px;fill:url(#a);stroke:url(#b)\"/><path d=\"M11.406,25.483a18.157,18.157,0,0,0,2.587-.048,41.728,41.728,0,0,0,4.5-.639,30.671,30.671,0,0,0,3.132-.839c1.142-.421,1.764-.778,2.043-1.284a.62.62,0,0,0-.441-.692c-1.347-.565-2.908-.463-6-.528-3.427-.118-4.567-.691-5.174-1.153-.582-.469-.29-1.765,2.206-2.907a54.266,54.266,0,0,1,6.184-1.73c-1.659-.82-4.753-2.262-5.389-2.573-.558-.273-1.451-.684-1.644-1.182-.219-.478.518-.889.93-1.007a20.3,20.3,0,0,1,4.9-.647,4.308,4.308,0,0,0,1-.069A1.767,1.767,0,0,0,21.879,7.9a2.775,2.775,0,0,0-3.286-1.81C17.22,6.338,13.908,7.3,13.908,7.3c4.093-.035,4.779.033,5.085.461.181.253-.082.6-1.174.777-1.189.194-3.659.428-3.659.428-2.37.141-4.04.15-4.54,1.21-.327.693.349,1.3.645,1.688a12.728,12.728,0,0,0,4.225,2.7c.438.208,1.723.6,1.723.6a11.52,11.52,0,0,0-8.1,2.287c-1.807,1.672-1.008,3.665,2.695,4.891a12.755,12.755,0,0,0,6.534.772c1.922-.1,2.224-.042,2.244.116.027.222-2.134.773-2.724.944-1.5.433-5.436,1.307-5.456,1.312Z\" style=\"fill:#fff\"/>",
	},
	"LiveScript": {
		colour: "#317eac",
		icon: "<polygon points=\"5.504 2.007 8.986 2 8.986 21.746 10.759 19.987 10.759 3.755 12.497 3.755 12.497 18.24 14.253 16.487 14.253 3.755 15.997 3.755 15.997 14.729 17.735 12.962 17.735 3.755 19.461 3.755 19.461 11.225 21.245 9.461 21.245 3.755 22.972 3.755 22.972 7.723 24.738 5.975 24.739 3.755 26.483 3.755 26.483 5.482 28.209 5.482 28.209 7.267 25.911 7.268 24.184 8.993 28.209 8.993 28.209 10.719 22.438 10.719 20.698 12.504 28.209 12.504 28.209 14.23 18.961 14.23 17.205 16.014 28.209 16.014 28.209 17.741 15.455 17.741 13.715 19.496 28.209 19.496 28.209 21.252 11.98 21.252 10.242 22.978 29.982 22.978 29.989 26.489 8.986 26.489 8.986 30 5.504 30 5.504 26.489 2.011 26.489 2.011 22.978 5.504 22.978 5.503 2 5.504 2.007\" style=\"fill:#317eac\"/>",
	},
	"Log file": {
		colour: "#00bd02",
		icon: "<path d=\"M29.4,27.6H2.5V4.5H29.4Zm-25.9-1H28.4V5.5H3.5Z\" style=\"fill:#00bd02\"/><rect x=\"2.5\" y=\"5.5\" width=\"26.9\" height=\"1.9\" style=\"fill:#00bd02\"/><rect x=\"11.333\" y=\"9.5\" width=\"8.167\" height=\"1\" style=\"fill:#00bd02\"/><rect x=\"11.333\" y=\"12.083\" width=\"12.5\" height=\"1\" style=\"fill:#00bd02\"/><rect x=\"11.333\" y=\"14.75\" width=\"10.617\" height=\"1\" style=\"fill:#00bd02\"/><rect x=\"11.333\" y=\"17.583\" width=\"14.167\" height=\"1\" style=\"fill:#00bd02\"/><rect x=\"11.333\" y=\"20.5\" width=\"9.834\" height=\"1\" style=\"fill:#00bd02\"/><rect x=\"11.5\" y=\"23.083\" width=\"12.167\" height=\"1\" style=\"fill:#00bd02\"/><rect x=\"5.5\" y=\"9.5\" width=\"4.333\" height=\"1\" style=\"fill:#00bd02\"/><rect x=\"5.5\" y=\"12.083\" width=\"4.333\" height=\"1\" style=\"fill:#00bd02\"/><rect x=\"5.5\" y=\"12.083\" width=\"4.333\" height=\"1\" style=\"fill:#00bd02\"/><rect x=\"5.5\" y=\"14.667\" width=\"4.333\" height=\"1\" style=\"fill:#00bd02\"/><rect x=\"5.5\" y=\"17.25\" width=\"4.333\" height=\"1\" style=\"fill:#00bd02\"/><rect x=\"5.5\" y=\"20.5\" width=\"4.333\" height=\"1\" style=\"fill:#00bd02\"/><rect x=\"5.5\" y=\"23.083\" width=\"4.333\" height=\"1\" style=\"fill:#00bd02\"/>",
	},
	"LOLCODE": {
		colour: "#8d2701",
		icon: "<path d=\"M21.3,3.73a3.94,3.94,0,0,1,1.041-.62,8.435,8.435,0,0,1,.556,3.385,24.865,24.865,0,0,1-.643,5.019c-.368-.18-.736-.364-1.1-.554a11.754,11.754,0,0,0,.273-3.747,3.08,3.08,0,0,0-.255-.865,5.142,5.142,0,0,0-2.016,2.07c-.319-.24-.652-.459-.985-.676A15.716,15.716,0,0,1,21.3,3.73Z\" style=\"fill:#ededed\"/><path d=\"M19.451,8.6a4.574,4.574,0,0,1,1.509-1.563,6.685,6.685,0,0,1,.09,2.671C20.517,9.343,19.975,8.987,19.451,8.6Z\" style=\"fill:#ededed\"/><path d=\"M16.461,10.076c-.038-1.134-.031-2.269-.026-3.4-.9.493-1.758,1.071-2.648,1.589-.453.27-.908.536-1.36.808.224-.163.457-.312.69-.462-.861-1.224-1.971-2.5-3.53-2.748a10.964,10.964,0,0,0-.365,5.147c.318-.195.633-.4.962-.572-.474.319-.964.615-1.446.92-.957.6-1.922,1.192-2.892,1.777a1.232,1.232,0,0,0-.391.32c-.1,1.395-.34,4.392-.34,4.392-.254,3.668-.522,7.336-.826,11,4.062.343,8.118.742,12.179,1.076C16.458,23.3,16.472,16.69,16.461,10.076Z\" style=\"fill:#ededed\"/><path d=\"M21.1,2.977A5.884,5.884,0,0,1,22.706,2a10.064,10.064,0,0,1,.772,4.606,24.591,24.591,0,0,1-.508,4.459c1.2.846,2.433,1.645,3.618,2.509q.44,6.38.907,12.758c.066.839.094,1.68.216,2.513-3.029.279-6.057.591-9.085.886a19.137,19.137,0,0,0-2.158.27v-.083c-.01-6.614,0-13.227-.007-19.841-.038-1.134-.031-2.269-.026-3.4v-.1c.406.292.826.562,1.243.839A16.274,16.274,0,0,1,21.1,2.977Zm.2.752a15.716,15.716,0,0,0-3.128,4.011c.334.217.666.437.985.676a5.142,5.142,0,0,1,2.016-2.07,3.08,3.08,0,0,1,.255.865,11.754,11.754,0,0,1-.273,3.747c.364.19.731.374,1.1.554a24.865,24.865,0,0,0,.643-5.019,8.435,8.435,0,0,0-.556-3.385A3.94,3.94,0,0,0,21.3,3.73ZM19.451,8.6c.524.383,1.066.739,1.6,1.108a6.685,6.685,0,0,0-.09-2.671A4.574,4.574,0,0,0,19.451,8.6Z\" style=\"fill:#8d2701\"/><path d=\"M9.219,5.062a3.581,3.581,0,0,1,2.205.748A12.9,12.9,0,0,1,13.788,8.26c-.453.27-.908.536-1.36.808.224-.163.457-.312.69-.462-.861-1.224-1.971-2.5-3.53-2.748a10.964,10.964,0,0,0-.365,5.147c.318-.195.633-.4.962-.572-.474.319-.964.615-1.446.92A14.1,14.1,0,0,1,9.219,5.062Z\" style=\"fill:#8d2701\"/><path d=\"M10.507,8.476a2.455,2.455,0,0,1,1.517.88l-.36.2A2.69,2.69,0,0,0,10.739,9a3.318,3.318,0,0,0-.165,1.281l-.344.11A7.021,7.021,0,0,1,10.507,8.476Z\" style=\"fill:#8d2701\"/><path d=\"M12.139,10.693a.487.487,0,0,1,.542.01,1.552,1.552,0,0,1,.062.6c-.039.784.024,1.573-.076,2.354a1.013,1.013,0,0,1-1.012.886c-.233-.05-.278-.341-.278-.541,0-.675.1-1.347.066-2.024A1.3,1.3,0,0,1,12.139,10.693Zm.15,1.084a.891.891,0,0,0,.251-.866C12.218,11.061,11.9,11.507,12.289,11.777Z\" style=\"fill:#8d2701\"/><path d=\"M14.5,13.728a17.671,17.671,0,0,1,1.928-.822c-.024.064-.069.191-.092.255-.649.358-1.36.6-2.021.938a12.118,12.118,0,0,0-3.238,2.248A7.2,7.2,0,0,1,10,17.381a4.166,4.166,0,0,1,.98-1.246A12.727,12.727,0,0,1,14.5,13.728Z\" style=\"fill:#8d2701\"/><path d=\"M7.628,13.231a.989.989,0,0,1,.594-.152,18.114,18.114,0,0,1-.1,2.654.713.713,0,0,1-.892.658,21.1,21.1,0,0,1,.082-2.226A1.383,1.383,0,0,1,7.628,13.231Zm.179.831c.268-.112.319-.413.412-.654C7.82,13.312,7.775,13.783,7.807,14.062Z\" style=\"fill:#8d2701\"/><path d=\"M10.823,17.094a13.934,13.934,0,0,1,4.612-1.968c-.01.068-.029.206-.039.274a14.273,14.273,0,0,0-4.475,1.914,2.626,2.626,0,0,1-.681.343C10.3,17.356,10.6,17.249,10.823,17.094Z\" style=\"fill:#8d2701\"/><path d=\"M5.264,17.59A5.144,5.144,0,0,1,8,17.1a1.5,1.5,0,0,1,1.142.665A6.854,6.854,0,0,0,7.6,17.278a6.967,6.967,0,0,0-2.484.564Z\" style=\"fill:#8d2701\"/><path d=\"M10.578,17.725a9.59,9.59,0,0,1,3.61-.566c.24.021.321.2.313.424a3.238,3.238,0,0,0-1.956-.09,21.688,21.688,0,0,0-2.557.658C9.995,17.829,10.345,17.809,10.578,17.725Z\" style=\"fill:#8d2701\"/><path d=\"M9.268,17.676c.149-.176.533-.332.664-.062a1.3,1.3,0,0,1-.516.993C9.268,18.337,8.973,17.952,9.268,17.676Z\" style=\"fill:#8d2701\"/><path d=\"M5.744,18.629a5.9,5.9,0,0,1,3.182-.618c-.182.235-.493.178-.751.208a5.663,5.663,0,0,0-1.72.33c-.344.128-.665.31-1.02.409A.6.6,0,0,1,5.744,18.629Z\" style=\"fill:#8d2701\"/><path d=\"M6.9,19.114a9.676,9.676,0,0,1,2.2-.854c-.1.3-.441.338-.7.444a7.839,7.839,0,0,0-2.564,1.415C5.938,19.584,6.488,19.369,6.9,19.114Z\" style=\"fill:#8d2701\"/><path d=\"M11.635,19.7a3.11,3.11,0,0,0,1.91-1.383c.347-.1.273.275.26.494a2.056,2.056,0,0,1-.95,1.036,12.365,12.365,0,0,1-1.827,6.419A2.342,2.342,0,0,1,8.879,27.5a2.251,2.251,0,0,1-1.535-1.49,10.894,10.894,0,0,1-.69-4.665c-.157-.112-.369-.179-.46-.362-.13-.2.011-.425.047-.631.19.151.345.392.606.42a3.617,3.617,0,0,0,1.863-.4,1.588,1.588,0,0,0,.709-.662,3.881,3.881,0,0,0,.431.266A4.28,4.28,0,0,0,11.635,19.7Zm-2.2.835a4.132,4.132,0,0,1-2.462.809,11.049,11.049,0,0,0,.358,3.526,3.226,3.226,0,0,1,.9-1.282,2.055,2.055,0,0,1,2.3-.2,2.3,2.3,0,0,1,.884,1.172,14.659,14.659,0,0,0,1.005-4.489A5.167,5.167,0,0,1,9.435,20.532Zm-.329,3.26a2.273,2.273,0,0,0-1.5,1.434c-.123.269.1.517.225.738.331.462.795,1,1.431.893a2.868,2.868,0,0,0,1.769-1.6A1.6,1.6,0,0,0,9.106,23.792Z\" style=\"fill:#8d2701\"/>",
	},
	"Lua": {
		colour: "#050080",
		icon: "<path d=\"M16.5,30l-.011-.321c.4-.014.8-.045,1.19-.094l.039.319C17.312,29.952,16.9,29.984,16.5,30Zm-1.222-.011c-.4-.021-.814-.061-1.216-.118l.045-.318c.393.055.793.094,1.188.115ZM18.92,29.7l-.067-.314c.387-.083.776-.184,1.155-.3l.094.307C19.714,29.511,19.316,29.615,18.92,29.7Zm-6.063-.053c-.4-.091-.791-.2-1.177-.326l.1-.306c.377.122.764.23,1.15.319Zm8.4-.665-.121-.3c.364-.148.728-.314,1.08-.493l.006,0,.145.286,0,0C22,28.661,21.626,28.831,21.253,28.982Zm-10.718-.088c-.374-.158-.745-.335-1.1-.524l.15-.284c.35.186.713.358,1.078.512Zm12.893-1.021-.17-.273c.337-.21.668-.437.984-.675l.193.257C24.111,27.425,23.772,27.658,23.428,27.873ZM8.379,27.751c-.341-.22-.676-.459-1-.708l.2-.253c.312.243.64.476.972.691Zm17-1.346-.215-.239c.294-.265.58-.546.851-.836l.235.219C25.972,25.846,25.679,26.134,25.378,26.4ZM6.454,26.252c-.3-.276-.585-.569-.856-.87l.239-.215c.265.294.547.58.836.85ZM27.041,24.62l-.253-.2c.244-.312.476-.639.692-.972l.27.175C27.529,23.966,27.29,24.3,27.041,24.62ZM4.82,24.439c-.244-.324-.476-.662-.692-1.007l.272-.17c.21.337.438.668.676.984Zm23.547-1.867-.284-.151c.186-.35.358-.713.513-1.078l.3.125C28.735,21.843,28.558,22.214,28.368,22.572Zm-24.841-.2-.006-.012c-.183-.359-.352-.728-.5-1.1l.3-.121c.147.362.312.724.491,1.074l.006.012ZM29.32,20.325l-.306-.1c.122-.377.23-.764.319-1.15l.313.072C29.555,19.543,29.446,19.939,29.32,20.325ZM2.608,20.107c-.12-.388-.223-.786-.308-1.182l.314-.067c.083.387.184.776.3,1.155ZM29.87,17.946l-.318-.045c.056-.393.094-.793.115-1.188l.321.017C29.967,17.135,29.927,17.544,29.87,17.946ZM2.1,17.72c-.05-.4-.082-.812-.1-1.218l.321-.011c.014.4.046.8.094,1.19Zm27.582-2.2c-.014-.4-.045-.8-.093-1.19l.319-.039c.049.4.082.813.1,1.218ZM2.331,15.3,2.01,15.28c.021-.405.061-.814.117-1.216l.318.045C2.39,14.5,2.352,14.9,2.331,15.3Zm27.057-2.144c-.083-.387-.184-.776-.3-1.155L29.4,11.9c.119.388.223.786.307,1.183ZM2.663,12.934l-.313-.072c.091-.4.2-.791.326-1.177l.306.1C2.859,12.161,2.752,12.548,2.663,12.934Zm26.026-2.062c-.149-.366-.315-.732-.5-1.086l.286-.146c.185.363.355.736.507,1.111ZM3.4,10.665l-.3-.125c.158-.374.334-.745.524-1.1l.284.15C3.724,9.937,3.552,10.3,3.4,10.665ZM4.513,8.557l-.27-.174c.22-.341.458-.676.707-1l.254.2C4.961,7.9,4.728,8.224,4.513,8.557ZM5.977,6.676l-.235-.219c.276-.3.569-.585.87-.857l.215.239C6.533,6.1,6.247,6.386,5.977,6.676Zm1.77-1.6-.193-.257c.323-.244.662-.477,1.007-.692l.17.272C8.394,4.614,8.063,4.841,7.747,5.079Zm15.705-.558-.018-.012.175-.27.018.011Zm-1.047-.616c-.35-.186-.713-.358-1.078-.512l.125-.3c.374.158.745.334,1.1.524ZM9.769,3.815l-.146-.286.018-.009c.356-.181.724-.349,1.093-.5l.121.3c-.361.147-.72.311-1.068.488Zm10.44-.838c-.377-.122-.764-.229-1.151-.317l.072-.313c.4.091.792.2,1.178.325Zm-8.229-.06-.094-.307c.388-.119.786-.223,1.182-.308l.067.314C12.747,2.7,12.359,2.8,11.98,2.917Zm5.9-.473c-.393-.055-.793-.092-1.188-.113l.016-.321c.405.021.814.059,1.216.115Zm-3.572-.026-.04-.319c.4-.05.812-.083,1.218-.1l.012.321C15.106,2.337,14.705,2.369,14.312,2.418Z\" style=\"fill:gray\"/><circle cx=\"16\" cy=\"15.998\" r=\"10.708\" style=\"fill:navy\"/><circle cx=\"20.435\" cy=\"11.562\" r=\"3.136\" style=\"fill:#fff\"/><circle cx=\"26.708\" cy=\"5.29\" r=\"3.137\" style=\"fill:navy\"/><path d=\"M13.1,21.352v-.79H9.629V14.326h-.9v7.026H13.1\" style=\"fill:#fff\"/><path d=\"M17.916,21.352V16.3h-.8v2.785c0,1.031-.54,1.706-1.378,1.706A.95.95,0,0,1,14.7,19.8V16.3h-.8v3.817c0,.838.626,1.378,1.609,1.378a1.863,1.863,0,0,0,1.687-.925v.781h.723\" style=\"fill:#fff\"/><path d=\"M23.791,21.333v-.607a.664.664,0,0,1-.173.019c-.279,0-.434-.145-.434-.4V17.536c0-.9-.655-1.378-1.9-1.378-1.224,0-1.976.472-2.024,1.638h.81c.067-.617.434-.9,1.185-.9.723,0,1.128.27,1.128.752v.212c0,.337-.2.482-.838.559a5.763,5.763,0,0,0-1.619.308,1.327,1.327,0,0,0-.887,1.311c0,.916.636,1.455,1.658,1.455a2.363,2.363,0,0,0,1.715-.742.855.855,0,0,0,.829.665,1.967,1.967,0,0,0,.549-.087m-1.407-1.725a1.366,1.366,0,0,1-1.513,1.185c-.626,0-.993-.222-.993-.771,0-.53.357-.761,1.214-.887a4,4,0,0,0,1.291-.279v.752\" style=\"fill:#fff\"/>",
		inlineComment: [
			"--",
		],
	},
	"Markdown": {
		colour: "#755838",
		icon: "<rect x=\"2.5\" y=\"7.955\" width=\"27\" height=\"16.091\" style=\"fill:none;stroke:#755838\"/><polygon points=\"5.909 20.636 5.909 11.364 8.636 11.364 11.364 14.773 14.091 11.364 16.818 11.364 16.818 20.636 14.091 20.636 14.091 15.318 11.364 18.727 8.636 15.318 8.636 20.636 5.909 20.636\" style=\"fill:#755838\"/><polygon points=\"22.955 20.636 18.864 16.136 21.591 16.136 21.591 11.364 24.318 11.364 24.318 16.136 27.045 16.136 22.955 20.636\" style=\"fill:#755838\"/>",
	},
	"MATLAB": {
		colour: "#ef6c3e",
		icon: "<defs><linearGradient id=\"a\" x1=\"16.803\" y1=\"16.631\" x2=\"15.013\" y2=\"22.411\" gradientTransform=\"matrix(1, 0, 0, -1, 0, 32)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#512\"/><stop offset=\"0.23\" stop-color=\"#523\"/><stop offset=\"0.36\" stop-color=\"#534\"/><stop offset=\"0.51\" stop-color=\"#645\"/><stop offset=\"0.66\" stop-color=\"#568\"/><stop offset=\"0.84\" stop-color=\"#29d\"/></linearGradient><linearGradient id=\"b\" x1=\"29.71\" y1=\"18.983\" x2=\"11.71\" y2=\"14.563\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0.081\" stop-color=\"#c33\"/><stop offset=\"0.189\" stop-color=\"#de5239\"/><stop offset=\"0.313\" stop-color=\"#f06e3e\"/><stop offset=\"0.421\" stop-color=\"#fa8042\"/><stop offset=\"0.5\" stop-color=\"#fe8643\"/><stop offset=\"0.58\" stop-color=\"#fa7f42\"/><stop offset=\"0.696\" stop-color=\"#ef6c3e\"/><stop offset=\"0.833\" stop-color=\"#dc4c37\"/><stop offset=\"0.916\" stop-color=\"#cf3633\"/></linearGradient></defs><title>file_type_matlab</title><path d=\"M2,17.55l7.97-3.22a20.7,20.7,0,0,1,2.72-2.95c.66-.35,1.9-.16,4.17-2.98,2.2-2.75,2.9-5.1,3.93-5.1,1.63,0,2.83,3.52,4.65,8.85A115.629,115.629,0,0,0,30,24.12c-1.9-1.77-3.52-3.68-5.37-3.63-1.72.04-3.63,2.08-5.72,4.7-1.66,2.1-3.86,3.54-4.72,3.51,0,0-2.22-6.28-4.08-7.3a2.641,2.641,0,0,0-2.39.2L2,17.54Z\" style=\"fill:#49d\"/><path d=\"M19.8,4.02c-.67.9-1.48,2.55-2.94,4.38-2.27,2.82-3.5,2.63-4.17,2.98a19.674,19.674,0,0,0-2.72,2.95l3.3,2.41c2.8-3.82,4.3-7.96,5.47-10.64A13.579,13.579,0,0,1,19.8,4.02Z\" style=\"fill:url(#a)\"/><path d=\"M20.8,3.3c-2.18,0-3.67,11.48-11.72,17.89,2.26-.37,4.22,5.24,5.12,7.51,4-.68,7.2-8.33,10.43-8.21,1.85.07,3.47,1.86,5.37,3.63C25.66,15,23.63,3.3,20.8,3.3Z\" style=\"fill:url(#b)\"/>",
		inlineComment: [
			"%",
		],
	},
	"MAXScript": {
		colour: "#00696b",
		icon: "<path d=\"M14.4,7.568,20.212,2H7.273L4.848,7.536l9.557.032ZM4.848,7.536l6.844,2.6L14.4,7.568m-.013,3.622-2.7-1.053L5.263,16.1l6.286,5.823,2.808-1.1L14.4,7.568m0,0,12.8,8.376L20.212,2M27.2,15.944,14.391,11.19m-.035,9.636-.032,3.685M20.228,30l-8.679-8.073L4.8,24.464,7.257,30Zm0,0L27.2,15.944,14.325,24.512M27.2,15.944,14.357,20.826\" style=\"fill:none;stroke:#1d1d1b;stroke-miterlimit:22.92558479309082;stroke-width:0.028349999338388443px\"/><polygon points=\"14.391 11.19 27.2 15.944 14.405 7.568 14.391 11.19 14.391 11.19\" style=\"fill:#181b17;fill-rule:evenodd\"/><polygon points=\"27.2 15.944 14.357 20.826 14.325 24.509 14.326 24.511 27.2 15.944 27.2 15.944\" style=\"fill:#1a1d1a;fill-rule:evenodd\"/><polygon points=\"14.405 7.568 27.2 15.944 20.212 2 14.405 7.568 14.405 7.568\" style=\"fill:#005f5e;fill-rule:evenodd\"/><polygon points=\"27.2 15.944 14.326 24.511 20.228 30 27.2 15.944 27.2 15.944\" style=\"fill:#004242;fill-rule:evenodd\"/><polygon points=\"14.357 20.826 27.2 15.944 14.391 11.19 14.357 20.826 14.357 20.826\" style=\"fill:#005152;fill-rule:evenodd\"/><polygon points=\"14.357 20.826 14.391 11.19 11.692 10.137 5.263 16.104 11.549 21.927 14.357 20.826 14.357 20.826\" style=\"fill:#00696b;fill-rule:evenodd\"/><polygon points=\"11.692 10.137 14.391 11.19 14.405 7.568 11.692 10.137 11.692 10.137\" style=\"fill:#1b2725;fill-rule:evenodd\"/><polygon points=\"14.357 20.826 11.549 21.927 14.325 24.509 14.357 20.826 14.357 20.826\" style=\"fill:#1c2624;fill-rule:evenodd\"/><polygon points=\"14.325 24.512 4.8 24.464 7.257 30 20.228 30 14.326 24.511 14.325 24.512 14.325 24.512\" style=\"fill:#006466;fill-rule:evenodd\"/><polygon points=\"4.848 7.536 14.405 7.568 20.212 2 7.273 2 4.848 7.536 4.848 7.536\" style=\"fill:#00767a;fill-rule:evenodd\"/><polygon points=\"14.405 7.568 4.848 7.536 11.692 10.137 14.405 7.568 14.405 7.568\" style=\"fill:#1e3938;fill-rule:evenodd\"/><polygon points=\"11.549 21.927 4.8 24.464 14.325 24.512 14.325 24.509 11.549 21.927 11.549 21.927\" style=\"fill:#20302e;fill-rule:evenodd\"/>",
	},
	"MEL": {
		colour: "#06a0a2",
		icon: "<defs><linearGradient id=\"a\" x1=\"-611.348\" y1=\"-67.488\" x2=\"-600.272\" y2=\"-65.335\" gradientTransform=\"matrix(1.437, 0, 0, -1.437, 894.417, -82.292)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#0f6067\"/><stop offset=\"0.5\" stop-color=\"#05abac\"/><stop offset=\"1\" stop-color=\"#58bec4\"/></linearGradient><linearGradient id=\"b\" x1=\"-603.594\" y1=\"-77.699\" x2=\"-602.011\" y2=\"-59.604\" gradientTransform=\"matrix(1.437, 0, 0, -1.437, 894.417, -82.292)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#117c83\"/><stop offset=\"0.5\" stop-color=\"#21b5b5\"/><stop offset=\"1\" stop-color=\"#7ed4d4\"/></linearGradient><linearGradient id=\"c\" x1=\"-612.757\" y1=\"-59.906\" x2=\"-616.934\" y2=\"-72.76\" gradientTransform=\"matrix(1.437, 0, 0, -1.437, 894.417, -82.292)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#9accd3\"/><stop offset=\"0.5\" stop-color=\"#72aeb3\"/><stop offset=\"1\" stop-color=\"#317d7f\"/></linearGradient><linearGradient id=\"d\" x1=\"-621.851\" y1=\"-74.579\" x2=\"-614.84\" y2=\"-72.301\" gradientTransform=\"matrix(1.437, 0, 0, -1.437, 894.417, -82.292)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#21626e\"/><stop offset=\"0.5\" stop-color=\"#157c84\"/><stop offset=\"1\" stop-color=\"#03a3a5\"/></linearGradient><linearGradient id=\"e\" x1=\"-616.369\" y1=\"-64.469\" x2=\"-625.34\" y2=\"-72.835\" gradientTransform=\"matrix(1.437, 0, 0, -1.437, 894.417, -82.292)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#0b7c81\"/><stop offset=\"0.5\" stop-color=\"#068d90\"/><stop offset=\"1\" stop-color=\"#16b1b1\"/></linearGradient><linearGradient id=\"f\" x1=\"-608.072\" y1=\"-74.678\" x2=\"-603.488\" y2=\"-70.966\" gradientTransform=\"matrix(1.437, 0, 0, -1.437, 894.417, -82.292)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#0a8a8f\"/><stop offset=\"0.5\" stop-color=\"#0f7c82\"/><stop offset=\"1\" stop-color=\"#1a5964\"/></linearGradient><linearGradient id=\"g\" x1=\"-601.134\" y1=\"-70.113\" x2=\"-606.008\" y2=\"-67.067\" gradientTransform=\"matrix(1.437, 0, 0, -1.437, 894.417, -82.292)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#256a77\"/><stop offset=\"0.5\" stop-color=\"#0d9499\"/><stop offset=\"1\" stop-color=\"#06a0a2\"/></linearGradient></defs><title>file_type_maya</title><path d=\"M21.6,3.462H30L18.767,24.211s-1.893-5.5-2.706-7.459\" style=\"fill:url(#a)\"/><path d=\"M23.669,29.118H30V3.462C29.995,16.869,24.36,29.118,23.669,29.118Z\" style=\"fill:url(#b)\"/><path d=\"M18.767,24.211H13.541L2,3.462c2.047-.26,6.135-.611,8.16-.776Z\" style=\"fill:url(#c)\"/><path d=\"M8.693,16.019C6.96,22.866,1.995,29.32,2,29.314c5.752,0,6.991-.835,6.991-1.276V16.54C8.89,16.37,8.794,16.194,8.693,16.019Z\" style=\"fill:url(#d)\"/><path d=\"M2,3.462V29.314c3.147-5.2,4.981-8.6,6.6-13.45C4.6,8.794,2,3.462,2,3.462Z\" style=\"fill:url(#e)\"/><polyline points=\"23.233 28.102 23.669 29.118 23.669 15.647 23.233 16.375\" style=\"fill:url(#f)\"/><path d=\"M23.647,15.673v13.4l.016.043c.452,0,6.332-14.5,6.332-25.656C29.995,3.462,26.406,10.947,23.647,15.673Z\" style=\"fill:url(#g)\"/>",
	},
	"MongoDB": {
		colour: "#41a247",
		icon: "<defs><linearGradient id=\"a\" x1=\"-645.732\" y1=\"839.188\" x2=\"-654.59\" y2=\"839.25\" gradientTransform=\"matrix(-0.977, -0.323, -0.29, 0.877, -375.944, -928.287)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0.231\" stop-color=\"#999875\"/><stop offset=\"0.563\" stop-color=\"#9b9977\"/><stop offset=\"0.683\" stop-color=\"#a09f7e\"/><stop offset=\"0.768\" stop-color=\"#a9a889\"/><stop offset=\"0.837\" stop-color=\"#b7b69a\"/><stop offset=\"0.896\" stop-color=\"#c9c7b0\"/><stop offset=\"0.948\" stop-color=\"#deddcb\"/><stop offset=\"0.994\" stop-color=\"#f8f6eb\"/><stop offset=\"1\" stop-color=\"#fbf9ef\"/></linearGradient><linearGradient id=\"b\" x1=\"-644.287\" y1=\"823.405\" x2=\"-657.028\" y2=\"845.476\" gradientTransform=\"matrix(-0.977, -0.323, -0.29, 0.877, -375.944, -928.287)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#48a547\"/><stop offset=\"1\" stop-color=\"#3f9143\"/></linearGradient><linearGradient id=\"c\" x1=\"-643.386\" y1=\"839.485\" x2=\"-652.418\" y2=\"833.417\" gradientTransform=\"matrix(-0.977, -0.323, -0.29, 0.877, -375.944, -928.287)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#41a247\"/><stop offset=\"0.352\" stop-color=\"#4ba74b\"/><stop offset=\"0.956\" stop-color=\"#67b554\"/><stop offset=\"1\" stop-color=\"#69b655\"/></linearGradient></defs><title>file_type_mongo</title><path d=\"M16.62,30l-.751-.249s.1-3.8-1.275-4.067c-.9-1.048.133-44.741,3.423-.149a2.712,2.712,0,0,0-1.333,1.523A14.1,14.1,0,0,0,16.62,30Z\" style=\"fill:url(#a)\"/><path d=\"M17.026,26.329a13.223,13.223,0,0,0,5-13.225C20.556,6.619,17.075,4.487,16.7,3.673a9.792,9.792,0,0,1-.825-1.6l.277,18.069S15.578,25.664,17.026,26.329Z\" style=\"fill:url(#b)\"/><path d=\"M15.487,26.569S9.366,22.4,9.72,15.025A15.54,15.54,0,0,1,15.239,3.377,1.725,1.725,0,0,0,15.846,2c.381.82.319,12.243.359,13.579C16.36,20.776,15.916,25.588,15.487,26.569Z\" style=\"fill:url(#c)\"/>",
	},
	"nginx": {
		colour: "#019639",
		icon: "<path d=\"M15.948,2h.065a10.418,10.418,0,0,1,.972.528Q22.414,5.65,27.843,8.774a.792.792,0,0,1,.414.788c-.008,4.389,0,8.777-.005,13.164a.813.813,0,0,1-.356.507q-5.773,3.324-11.547,6.644a.587.587,0,0,1-.657.037Q9.912,26.6,4.143,23.274a.7.7,0,0,1-.4-.666q0-6.582,0-13.163a.693.693,0,0,1,.387-.67Q9.552,5.657,14.974,2.535c.322-.184.638-.379.974-.535\" style=\"fill:#019639\"/><path d=\"M8.767,10.538q0,5.429,0,10.859a1.509,1.509,0,0,0,.427,1.087,1.647,1.647,0,0,0,2.06.206,1.564,1.564,0,0,0,.685-1.293c0-2.62-.005-5.24,0-7.86q3.583,4.29,7.181,8.568a2.833,2.833,0,0,0,2.6.782,1.561,1.561,0,0,0,1.251-1.371q.008-5.541,0-11.081a1.582,1.582,0,0,0-3.152,0c0,2.662-.016,5.321,0,7.982-2.346-2.766-4.663-5.556-7-8.332A2.817,2.817,0,0,0,10.17,9.033,1.579,1.579,0,0,0,8.767,10.538Z\" style=\"fill:#fff\"/>",
	},
	"Nim": {
		colour: "#ffe953",
		icon: "<path d=\"M16.111,6.405s-1.073.847-2.167,1.69a15.361,15.361,0,0,0-4.527.651c-1.1-.7-2.07-1.469-2.07-1.469S6.52,8.7,6,9.535a11.382,11.382,0,0,0-2.236,1.482C2.961,10.7,2.03,10.31,2,10.3c1.063,2.145,1.778,4.292,3.722,5.583,3.1-4.889,17.48-4.439,20.639-.028C28.4,14.787,29.2,12.5,30,10.38c-.088.029-1.181.395-1.889.665a11.489,11.489,0,0,0-1.986-1.51c-.537-.984-1.319-2.313-1.319-2.313s-.927.689-2,1.44a21.265,21.265,0,0,0-4.681-.512c-1-.826-2.014-1.746-2.014-1.746Z\" style=\"fill:#f3d400\"/><path d=\"M3.1,14.854l2.554,6.185c4.435,5.85,15.759,6.257,20.7.113,1.168-2.633,2.745-6.333,2.745-6.333a13.379,13.379,0,0,1-4.6,3.869,12.217,12.217,0,0,1-2.983.793l-5.465-2.832-5.5,2.775a15.679,15.679,0,0,1-2.983-.764A14.076,14.076,0,0,1,3.1,14.854Z\" style=\"fill:#ffe953\"/>",
		inlineComment: [
			"#",
		],
	},
	"Nix": {
		colour: "#5277c3",
		icon: "<path d=\"M13,11.115,6.183,23.76,4.59,20.87l1.839-3.387-3.651-.01L2,16.029l.8-1.477,5.2.018,1.868-3.447Z\" style=\"fill:#7ebae4;fill-rule:evenodd\"/><path d=\"M13.527,21.223h13.64l-1.541,2.922-3.658-.011,1.817,3.389-.779,1.449-1.593,0-2.584-4.825-3.722-.008Z\" style=\"fill:#7ebae4;fill-rule:evenodd\"/><path d=\"M21.467,15.682,14.647,3.037l3.134-.032L19.6,6.4l1.834-3.379h1.557L23.786,4.5,21.174,9.307l1.854,3.455Z\" style=\"fill:#7ebae4;fill-rule:evenodd\"/><path d=\"M10.542,16.324l6.821,12.645L14.229,29l-1.821-3.4-1.834,3.38H9.016l-.8-1.476L10.831,22.7,8.976,19.243Z\" style=\"fill:#5277c3;fill-rule:evenodd\"/><path d=\"M18.464,10.751H4.823L6.365,7.829l3.658.011L8.207,4.451,8.986,3l1.592,0,2.584,4.825,3.722.008Z\" style=\"fill:#5277c3;fill-rule:evenodd\"/><path d=\"M19,20.888,25.817,8.244l1.593,2.89L25.571,14.52l3.651.01L30,15.979l-.8,1.477-5.2-.018-1.868,3.447Z\" style=\"fill:#5277c3;fill-rule:evenodd\"/>",
	},
	"NSIS": {
		colour: "#a42d26",
		icon: "<path d=\"M27.435,16.037,22.012,21.46l5.423,5.423\" style=\"fill:#00577b\"/><path d=\"M26.884,15.5H16.048l5.423,5.423\" style=\"fill:#0079aa\"/><path d=\"M26.884,14.712,21.461,9.289l-5.423,5.423\" style=\"fill:#0096d3\"/><path d=\"M20.528,9.131H9.683l5.423,5.423M27.435,3.325,22.012,8.748l5.423,5.423\" style=\"fill:#01b0f0\"/><path d=\"M20.528,8.356,15.105,2.933,9.683,8.356\" style=\"fill:#27bcf3\"/><path d=\"M14.172,2.775H3.327L8.749,8.2\" style=\"fill:#4fc9f5\"/><path d=\"M4.568,15.963,9.991,10.54,4.568,5.117\" style=\"fill:#79201b\"/><path d=\"M10.541,11.091,5.119,16.513H15.964\" style=\"fill:#a42d26\"/><path d=\"M5.119,17.288l5.423,5.423,5.423-5.423\" style=\"fill:#cc382f\"/><path d=\"M4.568,17.829V28.675l5.423-5.423L8.4,21.665m13.916,1.2L16.9,17.447l-5.423,5.423\" style=\"fill:#f0453f\"/><path d=\"M11.475,23.644,16.9,29.067l5.423-5.423\" style=\"fill:#f2625d\"/><path d=\"M17.84,29.225H28.685L23.263,23.8\" style=\"fill:#f47f7d\"/><path d=\"M29.889,29.337l-1.68-1.68V2.392a.374.374,0,0,0-.243-.355A.263.263,0,0,0,27.827,2a.359.359,0,0,0-.271.112L21.471,8.2,15.385,2.112,15.3,2.037h-.037A.307.307,0,0,0,15.105,2H2.4a.434.434,0,0,0-.289.112A.38.38,0,0,0,2,2.392a.359.359,0,0,0,.112.271l1.68,1.68V29.617a.374.374,0,0,0,.243.355A.387.387,0,0,0,4.185,30a.359.359,0,0,0,.271-.112L10.541,23.8l6.085,6.085.084.075h.037A.254.254,0,0,0,16.9,30H29.609a.395.395,0,0,0,.28-.663ZM27.435,3.325V14.171L22.012,8.748l5.423-5.423ZM9.991,10.54,4.568,15.963V5.117L9.991,10.54ZM9.683,9.131H20.528l-5.423,5.423L9.683,9.131Zm.859,1.96,5.423,5.423H5.119l5.423-5.423ZM16.9,17.447l5.423,5.423H11.475L16.9,17.447ZM16.048,15.5H26.893l-5.423,5.423L16.048,15.5Zm5.964,5.964,5.423-5.423V26.883L22.012,21.46Zm4.872-6.748H16.048l5.423-5.423,5.413,5.423ZM20.528,8.356H9.683l5.423-5.423,5.423,5.423ZM3.327,2.775H14.172L8.749,8.2Zm1.241,25.9V17.829L8.4,21.665l1.587,1.587L4.568,28.675Zm.551-11.387H15.964l-5.423,5.423L5.119,17.288ZM16.9,29.067l-5.423-5.423H22.32L16.9,29.067Zm.943.159L23.263,23.8l5.423,5.423Z\" style=\"fill:#464049\"/>",
	},
	"Object Pascal": {
		colour: "#FF6344",
		icon: "<defs><linearGradient id=\"a\" x1=\"16\" y1=\"-0.443\" x2=\"16\" y2=\"22.042\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0.021\" stop-color=\"#ff0c15\"/><stop offset=\"1\" stop-color=\"#9a0c0f\"/></linearGradient></defs><title>file_type_delphi</title><circle cx=\"16\" cy=\"16\" r=\"14\" style=\"fill:url(#a)\"/><path d=\"M27.545,16.243H4.924a.914.914,0,0,0-1.092.82q.033.429.1.849a12.4,12.4,0,0,0,24.532,0q.075-.5.108-1.021C28.478,16.523,28.211,16.207,27.545,16.243Z\" style=\"fill:#ff6443\"/><polyline points=\"18.48 11.64 23.707 7.266 19.787 5.88 16 11.053\" style=\"fill:#fae7e3;fill-rule:evenodd\"/><polyline points=\"15.68 11.026 18.64 5.88 14.853 5.88 13.307 11.293\" style=\"fill:#fae7e3;fill-rule:evenodd\"/><polyline points=\"13.04 11.373 13.6 6.706 10.587 7.96 11.013 12.76\" style=\"fill:#fae7e3;fill-rule:evenodd\"/><polyline points=\"10.747 13 9.787 8.76 7.707 10.84 9.653 14.68\" style=\"fill:#fae7e3;fill-rule:evenodd\"/><polyline points=\"9.387 15.053 7.493 12.376 6.64 14.466 9.04 16.517\" style=\"fill:#fae7e3;fill-rule:evenodd\"/><polyline points=\"9.04 16.757 6.64 15.213 6.48 17.4 9.2 18.333\" style=\"fill:#fae7e3;fill-rule:evenodd\"/><polyline points=\"9.227 18.846 6.64 18.04 7.227 19.8 9.547 19.8\" style=\"fill:#fae7e3;fill-rule:evenodd\"/><polyline points=\"9.707 20.093 7.707 20.386 8.627 21.746 10.267 21\" style=\"fill:#fae7e3;fill-rule:evenodd\"/><path d=\"M20.023,13.089a6.61,6.61,0,0,0-4.53-2A6.293,6.293,0,0,0,11.3,22.07l4.941.129-2.08-4.16Z\" style=\"fill:#eee;fill-rule:evenodd\"/><path d=\"M16.5,22.366l-5.267-.138-.044-.039a6.453,6.453,0,0,1,4.3-11.264,6.787,6.787,0,0,1,4.643,2.05l.123.123-5.9,4.982Zm-5.14-.455,4.616.121L13.961,18l5.825-4.919a6.43,6.43,0,0,0-4.292-1.835,6.133,6.133,0,0,0-4.131,10.667Z\" style=\"fill:#ee4b2e\"/><path d=\"M12.013,20.493c-4.173-5.813,2.109-8.172,2.478-8.453.451-.344-7.59,1.785-3.226,8.88Z\" style=\"fill:#f04e31;fill-rule:evenodd\"/><polygon points=\"20.72 12.6 13.52 17.567 13.733 18.573 21.467 17.026 20.72 12.6\" style=\"fill:#eee;fill-rule:evenodd\"/><path d=\"M13.61,18.761,13.341,17.5l7.495-5.17.814,4.828Zm.089-1.123.158.747L21.283,16.9,20.6,12.874Z\" style=\"fill:#ee4b2e\"/><path d=\"M15.723,21.319c-3.93-.668-4.283.428-4.283.428L10.267,24.44s1.12-.907,5.493,0l.76-1.388Z\" style=\"fill:#dd0c13;fill-rule:evenodd\"/><path d=\"M14.122,21.6c-.02-.2-1.1-.319-1.677-.123-.732.249-1.219,1.142-1.045,1.213a1.975,1.975,0,0,1,1.125-.986C13.447,21.493,14.142,21.8,14.122,21.6Z\" style=\"fill:#ff6e4f;fill-rule:evenodd\"/><path d=\"M15.52,18.606a11.1,11.1,0,0,0,1.547,1.487,6.9,6.9,0,0,1,2.72,4.107c-.107,1.067-1.973,1.76-1.973,1.76l-3.307-7.194Z\" style=\"fill:#eee;fill-rule:evenodd\"/><path d=\"M17.73,26.161l-3.457-7.521,1.32-.208.057.081a10.869,10.869,0,0,0,1.512,1.451,7,7,0,0,1,2.782,4.207l0,.022,0,.022c-.115,1.153-2,1.864-2.077,1.894Zm-2.99-7.27,3.155,6.863c.414-.178,1.63-.763,1.73-1.548a6.793,6.793,0,0,0-2.648-3.981l-.01-.007a11.94,11.94,0,0,1-1.517-1.439Z\" style=\"fill:#ee4b2e\"/><path d=\"M28,12.742c.025.394.034.792.025,1.194a13.946,13.946,0,0,1-19.9,12.3A12.86,12.86,0,0,0,28,12.742Z\" style=\"fill:#eae0df;fill-rule:evenodd;opacity:0.2\"/><path d=\"M2.383,13.893A13.941,13.941,0,0,1,25.7,5.83s-5.009,5.979-10.584,7.907S2.383,13.893,2.383,13.893Z\" style=\"fill:#eae0df;opacity:0.2\"/><path d=\"M3.618,18.694c-.044-.392-.072-.79-.083-1.191C3.329,9.807,10.012,4.2,17.708,3.991a14.2,14.2,0,0,1,5.719,1.458,13.128,13.128,0,0,0-7.188-2.369c-7.1.19-13.306,5.3-13.116,12.4A12.873,12.873,0,0,0,3.618,18.694Z\" style=\"fill:#eae0df;fill-rule:evenodd;opacity:0.2\"/>",
	},
	"Objective-C": {
		colour: "#c2c2c2",
		icon: "<path d=\"M11.29,15.976a8.892,8.892,0,0,0,1.039,4.557,4.818,4.818,0,0,0,5.579,2.13,3.789,3.789,0,0,0,2.734-3.181c.095-.535.1-.54.1-.54,1.537.222,4.014.582,5.55.8l-.1.389A9.958,9.958,0,0,1,23.8,24.9a8.35,8.35,0,0,1-4.747,2.378,12.925,12.925,0,0,1-7.322-.725,8.98,8.98,0,0,1-5.106-5.524A14.353,14.353,0,0,1,6.642,10.9a9.323,9.323,0,0,1,7.929-6.24,11.812,11.812,0,0,1,5.9.491,8.467,8.467,0,0,1,5.456,6.1c.083.311.1.369.1.369-1.709.311-3.821.705-5.518,1.075C20.186,11,19.387,9.666,17.678,9.25a4.656,4.656,0,0,0-5.853,3.158,9.28,9.28,0,0,0-.341,1.273A10.89,10.89,0,0,0,11.29,15.976Z\" style=\"fill:#c2c2c2\"/><polygon points=\"2.033 30 2.033 2 7.967 2 7.967 4.227 4.723 4.227 4.723 27.773 7.967 27.773 7.967 30 2.033 30\" style=\"fill:#c2c2c2\"/><polygon points=\"29.967 29.999 24.033 29.999 24.033 27.771 27.277 27.771 27.277 4.226 24.033 4.226 24.033 1.999 29.967 1.999 29.967 29.999\" style=\"fill:#c2c2c2\"/>",
	},
	"OCaml": {
		colour: "#f29104",
		icon: "<defs><linearGradient id=\"a\" x1=\"-745.623\" y1=\"-92.76\" x2=\"-745.623\" y2=\"-85.108\" gradientTransform=\"translate(758 113.28)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#f29104\"/><stop offset=\"1\" stop-color=\"#ec6813\"/></linearGradient><linearGradient id=\"b\" x1=\"-741.99\" y1=\"-109.477\" x2=\"-741.99\" y2=\"-85.099\" xlink:href=\"#a\"/><linearGradient id=\"c\" x1=\"-752.111\" y1=\"-93.918\" x2=\"-752.111\" y2=\"-85.284\" xlink:href=\"#a\"/></defs><title>file_type_ocaml</title><path d=\"M16.571,25.246a4.28,4.28,0,0,0-.039-.709c-.059-.2-.2-.217-.3-.374a3.507,3.507,0,0,1-.532-1.477c-.02-.453-.2-.886-.217-1.339-.02-.217.02-.453,0-.669a1.963,1.963,0,0,0-.039-.315,1.133,1.133,0,0,0-.039-.2l.059-.138a2.72,2.72,0,0,1,.65-.039c.256,0,.512.02.768.02a7.961,7.961,0,0,0,1.536-.059,3.722,3.722,0,0,0,1.949-.847,4.946,4.946,0,0,0,1.536-2.008c.177-.394.177-1.083.551-1.4.433-.374,1.181-.335,1.693-.571a1.187,1.187,0,0,1,.807-.138c.217.039.63.315.729-.059-.079-.039-.1-.138-.138-.177.414-.039,0-1-.158-1.2A2.225,2.225,0,0,0,24.25,13a3.509,3.509,0,0,0-1.536-.217c-.886.177-.827-.335-1.339-.335-.63,0-1.733.039-1.93.63a1.54,1.54,0,0,1-.335.512c-.138.177.02.354-.039.571-.079.217-.177.985-.276,1.26-.177.453-.394,1.024-.788,1.024a3.152,3.152,0,0,1-1.437-.079c-.276-.1-.729-.256-.945-.335-1.024-.433-1.2-.906-1.2-.906a3.026,3.026,0,0,1-.512-.866c-.118-.414-.315-.768-.394-1s-.3-.591-.453-.985a2.667,2.667,0,0,0-.709-1.063c-.315-.276-.61-.729-1.26-.591a1.641,1.641,0,0,0-.866.315c-.217.177-.3.571-.492.886-.118.177-.315.709-.512,1.162a1.929,1.929,0,0,1-.335.65c-.118.079-.256.2-.414.138a.924.924,0,0,1-.315-.2,5.334,5.334,0,0,1-.709-1.122,11.1,11.1,0,0,0-.788-1.241,1.016,1.016,0,0,0-.985-.551c-1.024,0-1.1.571-1.556,1.418a5.574,5.574,0,0,1-.669,1.4c-.236.256-.945,1.339-1.457,1.516H2v7.62c.039-.1.059-.2.1-.276.2-.414.65-.807.906-1.221a3.5,3.5,0,0,0,.374-.709,3.743,3.743,0,0,1,.236-.709.794.794,0,0,1,.571-.335c.354-.059.65.492,1.083.709.2.079,1.063.394,1.319.453.433.1.906.2,1.339.276.236.039.453.079.709.1a7.3,7.3,0,0,1,1.083.1,2.277,2.277,0,0,0-.807,1.221c-.158.433-.276.925-.473,1.339-.217.473-.669.669-.61,1.221a2.668,2.668,0,0,1,.02.689,4.009,4.009,0,0,1-.217.689c-.1.315-.217,1.359-.354,1.674l.906-.118h0A10.692,10.692,0,0,0,8.4,26.388a3.737,3.737,0,0,1,.729-1.28c.335-.374.315-.847.512-1.3a12.488,12.488,0,0,1,.768-1.3c.492-.807.807-1.812,1.851-2.028a3.3,3.3,0,0,1,1.024.709,4.452,4.452,0,0,1,.886,1.1,12.851,12.851,0,0,1,.886,2.678,1.227,1.227,0,0,0,.394.709,5.462,5.462,0,0,1,.433.729c.079.177.2.571.3.788a6.267,6.267,0,0,1,.315.827l.847-.02h.02v-.02A9.754,9.754,0,0,1,16.571,25.246Z\" style=\"fill:#fff\"/><path d=\"M16.217,27.235c-.1-.2-.217-.61-.3-.788a5.462,5.462,0,0,0-.433-.729,1.119,1.119,0,0,1-.394-.709,12.487,12.487,0,0,0-.886-2.678,4.452,4.452,0,0,0-.886-1.1,3.3,3.3,0,0,0-1.024-.709c-1.044.2-1.359,1.221-1.851,2.028a12.488,12.488,0,0,0-.768,1.3c-.2.433-.177.925-.512,1.3a3.443,3.443,0,0,0-.729,1.28c-.039.1-.118,1.083-.217,1.319h0l1.536-.1c1.437.1,1.024.65,3.249.532l3.525-.118h0A6.267,6.267,0,0,0,16.217,27.235Z\" style=\"fill:url(#a)\"/><path d=\"M26.456,3.8H5.544A3.521,3.521,0,0,0,2.02,7.328v7.679h0c.512-.177,1.221-1.26,1.457-1.516a5.913,5.913,0,0,0,.669-1.4c.453-.827.532-1.418,1.556-1.418a1.016,1.016,0,0,1,.985.551,9.547,9.547,0,0,1,.788,1.241,4.849,4.849,0,0,0,.709,1.122,2,2,0,0,0,.315.2c.158.059.3-.059.414-.138A1.929,1.929,0,0,0,9.246,13c.2-.453.394-.965.512-1.162.2-.315.276-.709.492-.886a1.59,1.59,0,0,1,.866-.315c.65-.138.945.315,1.26.591a3.285,3.285,0,0,1,.709,1.063c.158.394.354.768.453.985a8.946,8.946,0,0,1,.394,1,3.713,3.713,0,0,0,.512.866s.177.473,1.2.906a8.749,8.749,0,0,0,.945.335,3.152,3.152,0,0,0,1.437.079c.394,0,.61-.571.788-1.024.1-.276.217-1.044.276-1.26s-.1-.374.039-.571c.158-.217.256-.236.335-.512.2-.61,1.3-.63,1.93-.63.532,0,.453.512,1.339.335a3.243,3.243,0,0,1,1.536.217,2.225,2.225,0,0,1,1.142.551c.158.2.571,1.162.158,1.2.039.039.079.138.138.177-.1.374-.492.1-.729.059a1.187,1.187,0,0,0-.807.138c-.512.217-1.241.2-1.693.571-.374.315-.374,1-.551,1.4a5.167,5.167,0,0,1-1.536,2.008,3.9,3.9,0,0,1-1.949.847,7.961,7.961,0,0,1-1.536.059c-.256-.02-.512-.02-.768-.02-.158,0-.669-.02-.65.039l-.059.138a.7.7,0,0,0,.039.2c.02.118.02.217.039.315,0,.217-.02.453,0,.669.02.453.2.866.217,1.339a3.26,3.26,0,0,0,.532,1.477c.1.158.236.177.3.374a4.163,4.163,0,0,1,.039.709,9.685,9.685,0,0,0,.827,2.757v.02h0c.512-.079,1.044-.276,1.713-.374,1.241-.177,2.954-.1,4.056-.2,2.8-.256,4.312,1.142,6.813.571V7.328A3.551,3.551,0,0,0,26.456,3.8ZM16.02,20.343Z\" style=\"fill:url(#b)\"/><path d=\"M8.478,23.573c.2-.433.315-.906.473-1.339a2.277,2.277,0,0,1,.807-1.221,7.3,7.3,0,0,0-1.083-.1c-.236-.02-.473-.059-.709-.1-.433-.079-.925-.177-1.339-.276-.256-.059-1.142-.374-1.319-.453-.453-.2-.748-.768-1.083-.709a.794.794,0,0,0-.571.335,3.743,3.743,0,0,0-.236.709c-.1.236-.256.473-.374.709a12.289,12.289,0,0,0-.925,1.2c-.039.1-.059.2-.1.3v4.745a5.4,5.4,0,0,1,.729.158,8.77,8.77,0,0,0,4.371.354l.177-.02h0c.138-.315.256-1.359.354-1.674a5.494,5.494,0,0,0,.217-.689,2.668,2.668,0,0,0-.02-.689C7.809,24.242,8.262,24.045,8.478,23.573Z\" style=\"fill:url(#c)\"/>",
	},
	"Octave": {
		colour: "#77cce1",
		icon: "<defs id=\"defs2874\"> <radialGradient cx=\"182.9837\" cy=\"395.04871\" r=\"148.95309\" fx=\"182.9837\" fy=\"395.04871\" id=\"radialGradient3033\" xlink:href=\"#linearGradient3755\" gradientUnits=\"userSpaceOnUse\" gradientTransform=\"matrix(0.22914334,-0.24901479,0.7643572,0.83064268,-272.85337,-159.69482)\" /> <linearGradient id=\"linearGradient3755\"> <stop id=\"stop3757\" style=\"stop-color:#008cbe;stop-opacity:1\" offset=\"0\" /> <stop id=\"stop3759\" style=\"stop-color:#b2ffff;stop-opacity:1\" offset=\"1\" /> </linearGradient> </defs> <g id=\"layer1\" transform=\"scale(0.11296) translate(-233.35544,-390.71802)\"> <g transform=\"matrix(8.4519723,0,0,8.4519723,-278.45012,-403.82975)\" id=\"g3025\"> <path d=\"m 66.432103,97.488679 c -5.19584,5.646431 -3.93661,16.169031 2.81107,23.501871 6.74768,7.33285 16.42898,8.69955 21.62483,3.05312 5.19585,-5.64643 3.9402,-16.16946 -2.80749,-23.5023 -6.74768,-7.332861 -16.43256,-8.699131 -21.62841,-3.052691 z m 4.71149,2.34553 c 4.08256,-4.43659 11.589,-3.47152 16.76741,2.155961 5.17842,5.6275 6.06647,13.78491 1.98391,18.2215 -4.08256,4.43658 -11.59097,3.47369 -16.76939,-2.15381 -5.17842,-5.6275 -6.06449,-13.78704 -1.98193,-18.223651 z\" id=\"path5874\" style=\"fill:url(#radialGradient3033);fill-opacity:1;stroke:none\" /> <rect width=\"4.349854\" height=\"4.349854\" rx=\"0.76958966\" ry=\"0.76958966\" x=\"85.381561\" y=\"99.493881\" id=\"rect5876\" style=\"fill:#ff7f2a;fill-opacity:1;fill-rule:nonzero;stroke:#d45500;stroke-width:0.74403799;stroke-miterlimit:4;stroke-dasharray:none\" /> <rect width=\"10.245436\" height=\"10.245436\" rx=\"1.8126545\" ry=\"1.8126545\" x=\"60.92659\" y=\"105.2245\" id=\"rect5878\" style=\"fill:#ff7f2a;fill-opacity:1;fill-rule:nonzero;stroke:#d45500;stroke-width:0.74403799;stroke-miterlimit:4;stroke-dasharray:none\" /> <rect width=\"6.1897531\" height=\"6.1897531\" rx=\"1.0951102\" ry=\"1.0951102\" x=\"87.404739\" y=\"118.63705\" id=\"rect5880\" style=\"fill:#ff7f2a;fill-opacity:1;fill-rule:nonzero;stroke:#d45500;stroke-width:0.74403799;stroke-miterlimit:4;stroke-dasharray:none\" /> </g> </g>",
	},
	"OpenCL": {
		colour: "#FF1C1A",
		icon: "<defs><linearGradient id=\"a\" x1=\"29.662\" y1=\"18.026\" x2=\"21.419\" y2=\"20.234\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"red\"/><stop offset=\"1\" stop-color=\"#ff6a6a\"/></linearGradient><linearGradient id=\"b\" x1=\"24.588\" y1=\"9.748\" x2=\"18.776\" y2=\"15.56\" xlink:href=\"#a\"/><linearGradient id=\"c\" x1=\"18.466\" y1=\"6.619\" x2=\"15.924\" y2=\"13.603\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#cfa40c\"/><stop offset=\"1\" stop-color=\"#edd480\"/></linearGradient><linearGradient id=\"d\" x1=\"13.17\" y1=\"6.51\" x2=\"13.17\" y2=\"12.997\" xlink:href=\"#c\"/><linearGradient id=\"e\" x1=\"8.808\" y1=\"8.486\" x2=\"10.988\" y2=\"13.161\" xlink:href=\"#c\"/><linearGradient id=\"f\" x1=\"5.505\" y1=\"11.477\" x2=\"8.546\" y2=\"14.519\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#11a119\"/><stop offset=\"1\" stop-color=\"#37ae3d\"/></linearGradient><linearGradient id=\"g\" x1=\"3.639\" y1=\"14.285\" x2=\"6.883\" y2=\"16.158\" xlink:href=\"#f\"/><linearGradient id=\"h\" x1=\"2.265\" y1=\"17.799\" x2=\"5.379\" y2=\"18.933\" xlink:href=\"#f\"/><linearGradient id=\"i\" x1=\"2\" y1=\"21.614\" x2=\"4.833\" y2=\"21.614\" xlink:href=\"#f\"/><linearGradient id=\"j\" x1=\"20.662\" y1=\"18.949\" x2=\"18.026\" y2=\"17.428\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0.5\" stop-color=\"#646464\"/><stop offset=\"1\" stop-color=\"#cbcbcb\"/></linearGradient><linearGradient id=\"k\" x1=\"16.021\" y1=\"25.264\" x2=\"16.021\" y2=\"22.691\" xlink:href=\"#j\"/></defs><title>file_type_opencl</title><path d=\"M27.828,13.574a14.676,14.676,0,0,1,.835,1.542A14.964,14.964,0,0,1,29.92,22.9H22.133a10.377,10.377,0,0,0-.967-4.424Z\" style=\"fill:url(#a)\"/><path d=\"M17.753,14.43a10.074,10.074,0,0,1,2.772,2.878l6.273-5.2a15.54,15.54,0,0,0-4.988-4.15Z\" style=\"fill:url(#b)\"/><path d=\"M14.781,13.086a8.827,8.827,0,0,1,2.376.966L20.666,7.43a12.7,12.7,0,0,0-4.645-.952Z\" style=\"fill:url(#c)\"/><path d=\"M14.364,13l.612-6.488a12.46,12.46,0,0,0-3.611.813l.507,5.638A7.219,7.219,0,0,1,14.364,13\" style=\"fill:url(#d)\"/><path d=\"M10.948,13.179l-.683-5.373A14.588,14.588,0,0,0,7.773,9.379l1.74,4.42a7.518,7.518,0,0,1,1.435-.619\" style=\"fill:url(#e)\"/><path d=\"M8.86,14.206,6.474,10.511c-.453.44-.79.82-1.006,1.074q-.227.267-.436.538L7.48,15.387a8.87,8.87,0,0,1,1.38-1.182\" style=\"fill:url(#f)\"/><path d=\"M7.046,15.875,4.335,13.112a14.259,14.259,0,0,0-1.25,2.429l3.007,1.71a9.826,9.826,0,0,1,.954-1.376\" style=\"fill:url(#g)\"/><path d=\"M5.527,18.393l-2.77-1.945a15.452,15.452,0,0,0-.63,2.83l2.906.607a10.343,10.343,0,0,1,.494-1.492\" style=\"fill:url(#h)\"/><path d=\"M4.833,20.9a10.684,10.684,0,0,0-.1,2H2.093a14.333,14.333,0,0,1-.064-2.573Z\" style=\"fill:url(#i)\"/><path d=\"M22.551,12.478,14.751,23.1A1.544,1.544,0,0,1,17.5,24.428Z\" style=\"fill:url(#j)\"/><path d=\"M16.021,25.522a1.544,1.544,0,1,1,1.092-.452A1.533,1.533,0,0,1,16.021,25.522Z\" style=\"fill:#646464\"/><path d=\"M17.308,23.978a1.287,1.287,0,1,1-.377-.91A1.283,1.283,0,0,1,17.308,23.978Z\" style=\"fill:url(#k)\"/>",
	},
	"Pascal": {
		colour: "#FF6344",
		icon: "<defs><linearGradient id=\"a\" x1=\"16\" y1=\"-0.443\" x2=\"16\" y2=\"22.042\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0.021\" stop-color=\"#ff0c15\"/><stop offset=\"1\" stop-color=\"#9a0c0f\"/></linearGradient></defs><title>file_type_delphi</title><circle cx=\"16\" cy=\"16\" r=\"14\" style=\"fill:url(#a)\"/><path d=\"M27.545,16.243H4.924a.914.914,0,0,0-1.092.82q.033.429.1.849a12.4,12.4,0,0,0,24.532,0q.075-.5.108-1.021C28.478,16.523,28.211,16.207,27.545,16.243Z\" style=\"fill:#ff6443\"/><polyline points=\"18.48 11.64 23.707 7.266 19.787 5.88 16 11.053\" style=\"fill:#fae7e3;fill-rule:evenodd\"/><polyline points=\"15.68 11.026 18.64 5.88 14.853 5.88 13.307 11.293\" style=\"fill:#fae7e3;fill-rule:evenodd\"/><polyline points=\"13.04 11.373 13.6 6.706 10.587 7.96 11.013 12.76\" style=\"fill:#fae7e3;fill-rule:evenodd\"/><polyline points=\"10.747 13 9.787 8.76 7.707 10.84 9.653 14.68\" style=\"fill:#fae7e3;fill-rule:evenodd\"/><polyline points=\"9.387 15.053 7.493 12.376 6.64 14.466 9.04 16.517\" style=\"fill:#fae7e3;fill-rule:evenodd\"/><polyline points=\"9.04 16.757 6.64 15.213 6.48 17.4 9.2 18.333\" style=\"fill:#fae7e3;fill-rule:evenodd\"/><polyline points=\"9.227 18.846 6.64 18.04 7.227 19.8 9.547 19.8\" style=\"fill:#fae7e3;fill-rule:evenodd\"/><polyline points=\"9.707 20.093 7.707 20.386 8.627 21.746 10.267 21\" style=\"fill:#fae7e3;fill-rule:evenodd\"/><path d=\"M20.023,13.089a6.61,6.61,0,0,0-4.53-2A6.293,6.293,0,0,0,11.3,22.07l4.941.129-2.08-4.16Z\" style=\"fill:#eee;fill-rule:evenodd\"/><path d=\"M16.5,22.366l-5.267-.138-.044-.039a6.453,6.453,0,0,1,4.3-11.264,6.787,6.787,0,0,1,4.643,2.05l.123.123-5.9,4.982Zm-5.14-.455,4.616.121L13.961,18l5.825-4.919a6.43,6.43,0,0,0-4.292-1.835,6.133,6.133,0,0,0-4.131,10.667Z\" style=\"fill:#ee4b2e\"/><path d=\"M12.013,20.493c-4.173-5.813,2.109-8.172,2.478-8.453.451-.344-7.59,1.785-3.226,8.88Z\" style=\"fill:#f04e31;fill-rule:evenodd\"/><polygon points=\"20.72 12.6 13.52 17.567 13.733 18.573 21.467 17.026 20.72 12.6\" style=\"fill:#eee;fill-rule:evenodd\"/><path d=\"M13.61,18.761,13.341,17.5l7.495-5.17.814,4.828Zm.089-1.123.158.747L21.283,16.9,20.6,12.874Z\" style=\"fill:#ee4b2e\"/><path d=\"M15.723,21.319c-3.93-.668-4.283.428-4.283.428L10.267,24.44s1.12-.907,5.493,0l.76-1.388Z\" style=\"fill:#dd0c13;fill-rule:evenodd\"/><path d=\"M14.122,21.6c-.02-.2-1.1-.319-1.677-.123-.732.249-1.219,1.142-1.045,1.213a1.975,1.975,0,0,1,1.125-.986C13.447,21.493,14.142,21.8,14.122,21.6Z\" style=\"fill:#ff6e4f;fill-rule:evenodd\"/><path d=\"M15.52,18.606a11.1,11.1,0,0,0,1.547,1.487,6.9,6.9,0,0,1,2.72,4.107c-.107,1.067-1.973,1.76-1.973,1.76l-3.307-7.194Z\" style=\"fill:#eee;fill-rule:evenodd\"/><path d=\"M17.73,26.161l-3.457-7.521,1.32-.208.057.081a10.869,10.869,0,0,0,1.512,1.451,7,7,0,0,1,2.782,4.207l0,.022,0,.022c-.115,1.153-2,1.864-2.077,1.894Zm-2.99-7.27,3.155,6.863c.414-.178,1.63-.763,1.73-1.548a6.793,6.793,0,0,0-2.648-3.981l-.01-.007a11.94,11.94,0,0,1-1.517-1.439Z\" style=\"fill:#ee4b2e\"/><path d=\"M28,12.742c.025.394.034.792.025,1.194a13.946,13.946,0,0,1-19.9,12.3A12.86,12.86,0,0,0,28,12.742Z\" style=\"fill:#eae0df;fill-rule:evenodd;opacity:0.2\"/><path d=\"M2.383,13.893A13.941,13.941,0,0,1,25.7,5.83s-5.009,5.979-10.584,7.907S2.383,13.893,2.383,13.893Z\" style=\"fill:#eae0df;opacity:0.2\"/><path d=\"M3.618,18.694c-.044-.392-.072-.79-.083-1.191C3.329,9.807,10.012,4.2,17.708,3.991a14.2,14.2,0,0,1,5.719,1.458,13.128,13.128,0,0,0-7.188-2.369c-7.1.19-13.306,5.3-13.116,12.4A12.873,12.873,0,0,0,3.618,18.694Z\" style=\"fill:#eae0df;fill-rule:evenodd;opacity:0.2\"/>",
	},
	"Perl": {
		colour: "#3a3c5b",
		icon: "<path d=\"M29.25,13.8a6.888,6.888,0,0,0-.742-2.268,1.011,1.011,0,0,0-.172-.233,9.471,9.471,0,0,1-1.725-2.4,8.632,8.632,0,0,0-1.395-2.382A6.906,6.906,0,0,1,24.1,4.644,4.572,4.572,0,0,0,21.99,1.727a1.009,1.009,0,0,0-.1-.054,8.886,8.886,0,0,0-1.3-.468,1.022,1.022,0,0,0-.263-.035,1.009,1.009,0,0,0-.2.021,5.607,5.607,0,0,1-.807.107c-.05,0-.1-.006-.149-.006a2.842,2.842,0,0,0-1.416.453c-.094.052-.188.106-.284.149q-.041.018-.078.039A1.637,1.637,0,0,1,17.066,2a3.109,3.109,0,0,0-.772.194,1,1,0,0,0-.508.483,2.184,2.184,0,0,1-.469.5A4.382,4.382,0,0,0,14.555,4a.964.964,0,0,0-.116.234,4.687,4.687,0,0,1-1.574,2.2,6.471,6.471,0,0,0-.8.613,2.734,2.734,0,0,0-.627-1.634c-.017-.019-.035-.038-.053-.056l0-.014a2.378,2.378,0,0,0-.135-.586,1,1,0,0,0-.132-.236A5.167,5.167,0,0,0,9.511,3.113a.988.988,0,0,0-.346-.119,1.5,1.5,0,0,1-.148-.077,2.06,2.06,0,0,0-1-.311,1.476,1.476,0,0,0-.681.166.987.987,0,0,0-.274.206,1.328,1.328,0,0,1-.125.063,1.9,1.9,0,0,0-.908.778,2.539,2.539,0,0,0-.541.106,1.656,1.656,0,0,1-.383.057,2.3,2.3,0,0,0-1.5.545l-.106.1a2.533,2.533,0,0,0-1,2.525,1.08,1.08,0,0,0,.068.165A2.294,2.294,0,0,0,4.446,8.478c-.1.238-.2.473-.314.7a1.009,1.009,0,0,0-.087.293A11.052,11.052,0,0,0,4,12.039c0,.02,0,.04.007.06a5.278,5.278,0,0,1,.041.547,2.926,2.926,0,0,0,.931,2.4c.017.014.034.026.052.039l.008.031a2.8,2.8,0,0,0,.151.447,1.185,1.185,0,0,0,.632.617,1.289,1.289,0,0,0,.248.571,1,1,0,0,0,.332.279,2.453,2.453,0,0,0,.465.176l.064.018a.976.976,0,0,0,.192.171A5.879,5.879,0,0,1,7.873,18a1.13,1.13,0,0,0,1.351.427,1.5,1.5,0,0,0,.765.215,1.421,1.421,0,0,0,.624-.145l.114-.026c.024.408.033.817.028,1.223a1.043,1.043,0,0,0,.026.242,10.744,10.744,0,0,1,.266,1.828.931.931,0,0,0,.031.2,8.492,8.492,0,0,1,.268,1.815c0,.031,0,.063.008.094a6.083,6.083,0,0,1-.61,3.575.994.994,0,0,0-.089.261,1.093,1.093,0,0,0-.234.079l-.05.022a2.013,2.013,0,0,0-1.2,1.065,1.322,1.322,0,0,0,.074,1.054,1,1,0,0,0,.324.371,3.547,3.547,0,0,0,3.509.3,1.546,1.546,0,0,0,.829-1.653l-.005-.067a.989.989,0,0,0,.056-.158,11.186,11.186,0,0,0,.288-2.068,8.939,8.939,0,0,1,.259-1.822,4.727,4.727,0,0,0,.389-1.588l.042.048a12.661,12.661,0,0,0,1.255,1.129,10.3,10.3,0,0,1,1.1.989l-.011.038a.532.532,0,0,1-.342.359l-.049.017a1.921,1.921,0,0,0-1.184,1.334,1.313,1.313,0,0,0,.452,1.234,1,1,0,0,0,.441.222,4.908,4.908,0,0,0,2.735-.181,1.556,1.556,0,0,0,.266-.124,1.411,1.411,0,0,0,.97.372,2.326,2.326,0,0,0,1-.274c.049-.023.1-.045.14-.062a1,1,0,0,0,.637-.864,4.553,4.553,0,0,0-.468-2.343,1.56,1.56,0,0,0-.51-.6,10.8,10.8,0,0,1,1.3-2.15,2.193,2.193,0,0,0,.451-2.026,2.519,2.519,0,0,1-.043-.394,1.046,1.046,0,0,0,0-.148,5.756,5.756,0,0,1,.012-1.279,7.161,7.161,0,0,0,.951,1.793,7.892,7.892,0,0,1,.133,1.1,10.733,10.733,0,0,0,.133,1.186,9.36,9.36,0,0,1-.224,3.9,1,1,0,0,0-.032.34h0a.98.98,0,0,0-.1.179,2.238,2.238,0,0,0-.312,1.235,1.007,1.007,0,0,0,.039.2,1.315,1.315,0,0,0,1.328.963c.086,0,.177-.006.268-.014l.019,0,.038.013a2.109,2.109,0,0,0,2.517-1.088,1,1,0,0,0,.058-.735,5.285,5.285,0,0,1-.208-1.027,1.011,1.011,0,0,0-.046-.217,6.47,6.47,0,0,1-.221-3.22,1.112,1.112,0,0,0,.015-.114,3.907,3.907,0,0,1,.074-.443,2.738,2.738,0,0,0-.193-2.1,4.339,4.339,0,0,1,.021-.476c.011-.147.023-.3.027-.463a1.59,1.59,0,0,0,.862-.851,12.83,12.83,0,0,0,.947-2.23,1.719,1.719,0,0,0,.172-1.185,1.234,1.234,0,0,0,.111-.251A1.467,1.467,0,0,0,29.25,13.8ZM18.863,22.768c-.026,0-.053-.008-.08-.01l-.024,0a2.748,2.748,0,0,1-.236-.323c-.059-.088-.118-.175-.178-.258a2.253,2.253,0,0,0,.208-.234,1.255,1.255,0,0,0,.629-.321A3.186,3.186,0,0,1,18.863,22.768Z\" style=\"fill:#ededed\"/><path d=\"M19.289,2.3c-.548-.065-.961.3-1.419.506-.368.206-.815.152-1.185.309-.282.579-.941.908-1.3,1.443a5.7,5.7,0,0,1-1.942,2.694,5.464,5.464,0,0,0-2.368,3.394c-.145.3-.122.746-.277,1-.511.143-.239-.516-.3-.825-.074-.47.341-.77.373-1.226a1.834,1.834,0,0,0,.209-1.053c-.056-.814.189-1.807-.393-2.477-.349-.2-.239-.623-.366-.947a4.214,4.214,0,0,0-1.3-1.139c-.419-.041-.806-.542-1.232-.323-.266.309-.763.305-.922.713-.1.516-.688.374-1.068.5-.488.185-1.118.006-1.518.382-.411.41-1.034.961-.835,1.606.457.882,1.645.438,2.317.974A17.99,17.99,0,0,1,5.036,9.61a10.051,10.051,0,0,0-.044,2.332c.123.773-.083,1.772.606,2.319.38.137.357.572.5.887.134.29.427-.113.543.193.338.184.037.561.22.8.263.137.639.128.822.426a6.844,6.844,0,0,1,.975.806c.23.467.531-.454.783-.109.17.285.506.522.819.285a2.993,2.993,0,0,0,1.324-.556,18.033,18.033,0,0,1,.171,2.718,11.733,11.733,0,0,1,.29,2,9.409,9.409,0,0,1,.3,2.03,7.111,7.111,0,0,1-.709,4.16,1.012,1.012,0,0,1-.807.8c-.291.13-.9.366-.692.776a2.549,2.549,0,0,0,2.52.214c.51-.243.073-.858.334-1.226.343-1.3.174-2.691.575-3.985a3.762,3.762,0,0,0,.3-2.1c.079-.44-.105-.969.187-1.329a1.813,1.813,0,0,1,.483-1.2,14.762,14.762,0,0,0,.144-2.026,3.214,3.214,0,0,1,1.267-.127c.018.375-.272.812-.19,1.234A1.948,1.948,0,0,1,15.5,20.3a2.849,2.849,0,0,0,.168,2.308c.782.839,1.8,1.432,2.536,2.327.314.205.2.517.038.784a1.528,1.528,0,0,1-.987,1.034c-.308.121-.806.566-.442.882a3.906,3.906,0,0,0,2.178-.144c.476-.171.3-.738.488-1.088.3.233.423.765.711,1.069.3.433.807.073,1.156-.062a3.549,3.549,0,0,0-.372-1.842c-.167-.378-.8-.385-.77-.852a11.761,11.761,0,0,1,1.712-3c.51-.479.13-1.191.158-1.8A6.765,6.765,0,0,1,23.158,15.5a15.889,15.889,0,0,0,.692,2.14,6.23,6.23,0,0,0,1.1,2.246c.237.811.176,1.71.331,2.551a10.44,10.44,0,0,1-.242,4.347c.04.518-.457.9-.415,1.408.14.469.7.093.99.29a1.11,1.11,0,0,0,1.324-.572,6.212,6.212,0,0,1-.247-1.223,7.454,7.454,0,0,1-.255-3.719c.046-.669.457-1.5-.073-2.072-.148-.619.1-1.285-.049-1.915a12.877,12.877,0,0,1-.122-4.933c.093-.227.013-.649.247-.775a1.851,1.851,0,0,1,.315,1.232,3.7,3.7,0,0,1,.079,2.081c-.424.531-.163,1.248-.109,1.85.068.422.516.118.589-.144a11.851,11.851,0,0,0,.944-2.241c.269-.356.014-.77,0-1.142.413-.049.256-.506.035-.7a5.93,5.93,0,0,0-.667-2.2,10.464,10.464,0,0,1-1.941-2.723c-.528-1.639-2.042-2.726-2.556-4.379a3.556,3.556,0,0,0-1.652-2.317A7.881,7.881,0,0,0,20.32,2.17,6.5,6.5,0,0,1,19.289,2.3Zm.4,14.66a38.907,38.907,0,0,1,.5,4.291,4.175,4.175,0,0,1-.76,2.517c-.12.425-.486.012-.751-.016-.643-.018-.882-.683-1.232-1.107-.36-.344-.1-.8.133-1.131.252-.179.35-.579.708-.548.4-.007.316-.487.26-.743.238-.362.092-.892.328-1.283.419-.182.294-.82.442-1.18.115-.256.017-.749.334-.854.037-.006.049.012.042.052Z\" style=\"fill:#3a3c5b\"/>",
		inlineComment: [
			"#",
		],
	},
	"PHP": {
		colour: "#4c6b96",
		icon: "<defs><radialGradient id=\"a\" cx=\"-16.114\" cy=\"20.532\" r=\"18.384\" gradientTransform=\"translate(26.52 -9.307)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#fff\"/><stop offset=\"0.5\" stop-color=\"#4c6b96\"/><stop offset=\"1\" stop-color=\"#231f20\"/></radialGradient></defs><title>file_type_php</title><ellipse cx=\"16\" cy=\"16\" rx=\"14\" ry=\"7.365\" style=\"fill:url(#a)\"/><ellipse cx=\"16\" cy=\"16\" rx=\"13.453\" ry=\"6.818\" style=\"fill:#6280b6\"/><path d=\"M18.725,18.2l.667-3.434a1.752,1.752,0,0,0-.372-1.719,2.929,2.929,0,0,0-2-.525H15.867l.331-1.7a.219.219,0,0,0-.215-.26h-1.6a.219.219,0,0,0-.215.177l-.709,3.646a2.051,2.051,0,0,0-.477-1.054,2.783,2.783,0,0,0-2.2-.807H7.7a.219.219,0,0,0-.215.177l-1.434,7.38a.219.219,0,0,0,.215.26H7.869a.219.219,0,0,0,.215-.177l.347-1.785h1.2a5.167,5.167,0,0,0,1.568-.2,3.068,3.068,0,0,0,1.15-.689,3.538,3.538,0,0,0,.68-.844l-.287,1.475a.219.219,0,0,0,.215.26h1.6a.219.219,0,0,0,.215-.177l.787-4.051h1.094c.466,0,.6.093.64.133s.1.165.025.569l-.635,3.265a.219.219,0,0,0,.215.26h1.62A.219.219,0,0,0,18.725,18.2ZM11.33,15.366a1.749,1.749,0,0,1-.561,1.092,2.171,2.171,0,0,1-1.315.321H8.742l.515-2.651h.921c.677,0,.949.145,1.059.266A1.181,1.181,0,0,1,11.33,15.366Z\" style=\"fill:#fff\"/><path d=\"M25.546,13.332a2.783,2.783,0,0,0-2.2-.807H20.255a.219.219,0,0,0-.215.177l-1.434,7.38a.219.219,0,0,0,.215.26h1.608a.219.219,0,0,0,.215-.177l.347-1.785h1.2a5.167,5.167,0,0,0,1.568-.2,3.068,3.068,0,0,0,1.15-.689,3.425,3.425,0,0,0,1.076-1.927A2.512,2.512,0,0,0,25.546,13.332Zm-1.667,2.034a1.749,1.749,0,0,1-.561,1.092A2.171,2.171,0,0,1,22,16.778H21.29l.515-2.651h.921c.677,0,.949.145,1.059.266A1.181,1.181,0,0,1,23.879,15.366Z\" style=\"fill:#fff\"/><path d=\"M10.178,13.908a1.645,1.645,0,0,1,1.221.338,1.34,1.34,0,0,1,.145,1.161,1.945,1.945,0,0,1-.642,1.223A2.361,2.361,0,0,1,9.454,17H8.476l.6-3.089ZM6.261,20.124H7.869l.381-1.962H9.627a4.931,4.931,0,0,0,1.5-.191,2.84,2.84,0,0,0,1.07-.642,3.207,3.207,0,0,0,1.01-1.808,2.3,2.3,0,0,0-.385-2.044,2.568,2.568,0,0,0-2.035-.732H7.7Z\" style=\"fill:#000004\"/><path d=\"M14.387,10.782h1.6L15.6,12.744h1.421a2.767,2.767,0,0,1,1.85.468,1.548,1.548,0,0,1,.305,1.516l-.667,3.434H16.89l.635-3.265a.886.886,0,0,0-.08-.76,1.121,1.121,0,0,0-.8-.2H15.37l-.822,4.228h-1.6Z\" style=\"fill:#000004\"/><path d=\"M22.727,13.908a1.645,1.645,0,0,1,1.221.338,1.34,1.34,0,0,1,.145,1.161,1.945,1.945,0,0,1-.642,1.223A2.361,2.361,0,0,1,22,17h-.978l.6-3.089ZM18.81,20.124h1.608l.381-1.962h1.377a4.931,4.931,0,0,0,1.5-.191,2.84,2.84,0,0,0,1.07-.642,3.207,3.207,0,0,0,1.01-1.808,2.3,2.3,0,0,0-.385-2.044,2.568,2.568,0,0,0-2.035-.732H20.244Z\" style=\"fill:#000004\"/>",
		inlineComment: [
			"#",
			"//",
		],
	},
	"PL/SQL": {
		colour: "#ff0000",
		icon: "<path d=\"M8.562,15.256A21.159,21.159,0,0,0,16,16.449a21.159,21.159,0,0,0,7.438-1.194c1.864-.727,2.525-1.535,2.525-2V9.7a10.357,10.357,0,0,1-2.084,1.076A22.293,22.293,0,0,1,16,12.078a22.36,22.36,0,0,1-7.879-1.3A10.28,10.28,0,0,1,6.037,9.7v3.55C6.037,13.724,6.7,14.528,8.562,15.256Z\" style=\"fill:red\"/><path d=\"M8.562,21.961a15.611,15.611,0,0,0,2.6.741A24.9,24.9,0,0,0,16,23.155a24.9,24.9,0,0,0,4.838-.452,15.614,15.614,0,0,0,2.6-.741c1.864-.727,2.525-1.535,2.525-2v-3.39a10.706,10.706,0,0,1-1.692.825A23.49,23.49,0,0,1,16,18.74a23.49,23.49,0,0,1-8.271-1.348,10.829,10.829,0,0,1-1.692-.825V19.96C6.037,20.426,6.7,21.231,8.562,21.961Z\" style=\"fill:red\"/><path d=\"M16,30c5.5,0,9.963-1.744,9.963-3.894V23.269a10.5,10.5,0,0,1-1.535.762l-.157.063A23.487,23.487,0,0,1,16,25.445a23.422,23.422,0,0,1-8.271-1.351c-.054-.02-.106-.043-.157-.063a10.5,10.5,0,0,1-1.535-.762v2.837C6.037,28.256,10.5,30,16,30Z\" style=\"fill:red\"/><ellipse cx=\"16\" cy=\"5.894\" rx=\"9.963\" ry=\"3.894\" style=\"fill:red\"/>",
	},
	"Plain text": {
		colour: "#c2c2c2",
		icon: "<path d=\"M22.038,2H6.375a1.755,1.755,0,0,0-1.75,1.75v24.5A1.755,1.755,0,0,0,6.375,30h19.25a1.755,1.755,0,0,0,1.75-1.75V6.856Zm.525,2.844,1.663,1.531H22.563ZM6.375,28.25V3.75H20.813V8.125h4.813V28.25Z\" style=\"fill:#c2c2c2\"/><rect x=\"8.125\" y=\"15.097\" width=\"13.076\" height=\"1.75\" style=\"fill:#829ec2\"/><rect x=\"8.125\" y=\"24.439\" width=\"9.762\" height=\"1.75\" style=\"fill:#829ec2\"/><rect x=\"8.125\" y=\"19.763\" width=\"15.75\" height=\"1.75\" style=\"fill:#829ec2\"/><rect x=\"8.125\" y=\"10.23\" width=\"15.75\" height=\"1.75\" style=\"fill:#829ec2\"/>",
	},
	"PlantUML": {
		colour: "#A11F41",
		icon: "<defs><linearGradient id=\"a\" x1=\"-33.423\" y1=\"-250.911\" x2=\"-33.353\" y2=\"-250.858\" gradientTransform=\"matrix(37.134, 26.001, 13.575, -19.387, 4673.473, -3982.019)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#767676\"/><stop offset=\"1\"/></linearGradient><linearGradient id=\"b\" x1=\"-32.107\" y1=\"-242.563\" x2=\"-32.028\" y2=\"-242.586\" gradientTransform=\"matrix(81.081, 56.774, 17.306, -24.715, 6804.021, -4149.644)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#0079b9\"/><stop offset=\"1\"/></linearGradient><linearGradient id=\"c\" x1=\"-33.282\" y1=\"-243.423\" x2=\"-33.224\" y2=\"-243.455\" gradientTransform=\"matrix(60.003, 42.015, 34.184, -48.82, 10343.005, -10469.084)\" xlink:href=\"#b\"/><linearGradient id=\"d\" x1=\"12.356\" y1=\"26.268\" x2=\"14.011\" y2=\"26.268\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#595959\"/><stop offset=\"0.087\" stop-color=\"#6e6e6e\"/><stop offset=\"0.242\" stop-color=\"#8c8c8c\"/><stop offset=\"0.405\" stop-color=\"#a4a4a4\"/><stop offset=\"0.577\" stop-color=\"#b5b5b5\"/><stop offset=\"0.765\" stop-color=\"#bfbfbf\"/><stop offset=\"1\" stop-color=\"#c2c2c2\"/></linearGradient><linearGradient id=\"e\" x1=\"18.291\" y1=\"26.171\" x2=\"19.946\" y2=\"26.171\" xlink:href=\"#d\"/><linearGradient id=\"f\" x1=\"24.44\" y1=\"26.171\" x2=\"26.096\" y2=\"26.171\" xlink:href=\"#d\"/></defs><title>file_type_plantuml</title><polygon points=\"20.305 17.872 27.16 22.418 21.72 25.493 14.861 20.999 20.305 17.872\" style=\"fill:#1c0a42\"/><path d=\"M21.716,25.619l-.055-.036-7.005-4.59,5.653-3.247,7.056,4.68Zm-6.65-4.613,6.658,4.362,5.231-2.957L20.3,18Z\"/><polygon points=\"26.401 11.909 29.418 13.592 27.07 15.088 24.213 13.247 26.401 11.909\" style=\"fill:url(#a)\"/><path d=\"M27.069,15.215l-3.058-1.97,2.387-1.46,3.228,1.8Zm-2.654-1.966L27.07,14.96,29.208,13.6l-2.8-1.565Z\"/><polygon points=\"14.498 17.807 21.354 22.354 15.914 25.429 9.055 20.935 14.498 17.807\" style=\"fill:#ffbd3f\"/><path d=\"M15.91,25.554l-.055-.036L8.85,20.929,14.5,17.681l7.056,4.68ZM9.26,20.941,15.918,25.3l5.231-2.957-6.654-4.413Z\"/><polygon points=\"7.99 17.966 14.954 22.366 9.577 25.504 2.218 20.849 7.99 17.966\" style=\"fill:#a11f40\"/><path d=\"M9.575,25.629,2,20.838l6-3,7.164,4.527ZM2.436,20.86,9.58,25.378l5.168-3.016L7.984,18.089Z\"/><polygon points=\"2.111 21.021 9.443 25.515 9.443 29.063 2.111 24.332 2.111 21.021\" style=\"fill:url(#b)\"/><path d=\"M9.55,29.26,2,24.391V20.829L9.55,25.455ZM2.218,24.274l7.118,4.592V25.575L2.218,21.213Z\"/><polygon points=\"24.071 13.343 27.009 15.222 27.009 22.131 24.071 20.247 24.071 13.343\" style=\"fill:url(#c)\"/><path d=\"M27.063,22.229l-3.045-1.953V13.245l3.045,1.947Zm-2.938-2.012,2.831,1.815V15.251l-2.831-1.81Z\"/><polygon points=\"27.149 22.526 27.149 15.194 29.514 13.775 29.514 29.149 28.331 29.149 9.646 29.149 9.646 25.601 15.086 22.526 15.785 25.601 15.796 25.601 21.472 22.526 21.891 25.601 21.945 25.601 27.149 22.526\" style=\"fill:#fff\"/><path d=\"M29.621,29.256H9.539V25.538l5.62-3.177.7,3.083,5.7-3.087.422,3.1,5.061-2.991V15.133l2.58-1.548ZM9.753,29.041H29.407V13.964l-2.151,1.29v7.332l-.053.031-5.229,3.09H21.8l-.411-3.014-5.564,3.014H15.7l-.686-3.018-5.26,2.973Z\"/><rect x=\"12.356\" y=\"25.44\" width=\"1.656\" height=\"1.656\" rx=\"0.215\" ry=\"0.215\" style=\"fill:url(#d)\"/><path d=\"M13.8,27.2H12.57a.322.322,0,0,1-.322-.322V25.655a.322.322,0,0,1,.322-.322H13.8a.322.322,0,0,1,.322.322v1.226A.322.322,0,0,1,13.8,27.2ZM12.57,25.547a.108.108,0,0,0-.107.107v1.226a.108.108,0,0,0,.107.107H13.8a.108.108,0,0,0,.107-.107V25.655a.108.108,0,0,0-.107-.107Z\"/><rect x=\"18.291\" y=\"25.343\" width=\"1.656\" height=\"1.656\" rx=\"0.215\" ry=\"0.215\" style=\"fill:url(#e)\"/><path d=\"M19.732,27.106H18.505a.322.322,0,0,1-.322-.322V25.558a.322.322,0,0,1,.322-.322h1.226a.322.322,0,0,1,.322.322v1.226A.322.322,0,0,1,19.732,27.106Zm-1.226-1.656a.108.108,0,0,0-.107.107v1.226a.108.108,0,0,0,.107.107h1.226a.108.108,0,0,0,.107-.107V25.558a.108.108,0,0,0-.107-.107Z\"/><rect x=\"24.44\" y=\"25.343\" width=\"1.656\" height=\"1.656\" rx=\"0.215\" ry=\"0.215\" style=\"fill:url(#f)\"/><path d=\"M25.881,27.106H24.655a.322.322,0,0,1-.322-.322V25.558a.322.322,0,0,1,.322-.322h1.226a.322.322,0,0,1,.322.322v1.226A.322.322,0,0,1,25.881,27.106Zm-1.226-1.656a.108.108,0,0,0-.107.107v1.226a.108.108,0,0,0,.107.107h1.226a.108.108,0,0,0,.107-.107V25.558a.108.108,0,0,0-.107-.107Z\"/><path d=\"M27.215,11.23c-.052.069-.417-.262-.653-.526a4.408,4.408,0,0,1-.516-.73A2.6,2.6,0,0,1,25.7,9.2a2.358,2.358,0,0,1-.052-.682,2.959,2.959,0,0,1,.129-.749,3.142,3.142,0,0,1,.787-1.207,15.532,15.532,0,0,0,1.283-1.4,3.062,3.062,0,0,0,.479-.927,3.979,3.979,0,0,0,.151-.855c.019-.364-.025-.593.023-.613s.215.274.287.564a3.167,3.167,0,0,1-.458,2.1,6.9,6.9,0,0,1-1.094,1.448,2.8,2.8,0,0,0-.849,1.234A2.466,2.466,0,0,0,26.3,8.8a3.465,3.465,0,0,0,.476,1.542C27.064,10.914,27.256,11.175,27.215,11.23Z\" style=\"fill:#ea2d2e\"/><path d=\"M27.193,11.266c-.124,0-.492-.365-.651-.544a4.478,4.478,0,0,1-.52-.734,2.628,2.628,0,0,1-.346-.781,2.375,2.375,0,0,1-.053-.69,2.978,2.978,0,0,1,.13-.756,3.208,3.208,0,0,1,.793-1.216c.294-.331.5-.528.659-.686a4.393,4.393,0,0,0,.622-.711,3.052,3.052,0,0,0,.476-.919,3.951,3.951,0,0,0,.15-.849c.008-.159,0-.294,0-.393,0-.159-.006-.225.038-.243a.05.05,0,0,1,.043,0,1.226,1.226,0,0,1,.28.579,3.167,3.167,0,0,1-.46,2.121,6.928,6.928,0,0,1-1.1,1.453c-.055.06-.109.116-.162.171a2.3,2.3,0,0,0-.681,1.052,2.47,2.47,0,0,0-.082.673,3.458,3.458,0,0,0,.473,1.53c.114.231.215.415.289.549.129.235.178.323.142.369h0a.051.051,0,0,1-.04.02ZM28.512,2.8a.863.863,0,0,0,0,.19c0,.1.007.236,0,.4a4.021,4.021,0,0,1-.152.861,3.106,3.106,0,0,1-.483.934,4.437,4.437,0,0,1-.629.719c-.162.158-.364.354-.657.683a3.168,3.168,0,0,0-.782,1.2,2.933,2.933,0,0,0-.128.743,2.325,2.325,0,0,0,.052.675,2.59,2.59,0,0,0,.341.767,4.422,4.422,0,0,0,.513.725,2.035,2.035,0,0,0,.611.526,1.183,1.183,0,0,0-.147-.31c-.074-.134-.175-.318-.29-.551A3.5,3.5,0,0,1,26.278,8.8a2.53,2.53,0,0,1,.084-.688,2.375,2.375,0,0,1,.694-1.075c.052-.055.106-.111.161-.171a6.879,6.879,0,0,0,1.09-1.442,3.119,3.119,0,0,0,.456-2.083A1.281,1.281,0,0,0,28.512,2.8Z\"/><path d=\"M29.972,6.087c-.019-.088-.432-.04-.766.073a2.6,2.6,0,0,0-1.059.722,2.8,2.8,0,0,0-.916,1.855,2.972,2.972,0,0,0,.258,1.06c.221.572.455.773.444,1.225-.007.3-.114.484-.048.549s.314-.1.462-.313a1.8,1.8,0,0,0,.259-1.022c-.046-.815-.6-1.015-.608-1.8a1.858,1.858,0,0,1,.129-.676C28.57,6.509,30.008,6.252,29.972,6.087Z\" style=\"fill:#ea2d2e\"/><path d=\"M27.934,11.617a.094.094,0,0,1-.069-.026c-.046-.046-.03-.122-.005-.237a1.718,1.718,0,0,0,.045-.331,1.374,1.374,0,0,0-.214-.72,5,5,0,0,1-.228-.495,2.98,2.98,0,0,1-.259-1.07,2.81,2.81,0,0,1,.923-1.874,2.64,2.64,0,0,1,1.07-.729,1.482,1.482,0,0,1,.766-.1A.065.065,0,0,1,30,6.081h0c.015.07-.092.121-.306.224a2.73,2.73,0,0,0-1.542,1.463,1.827,1.827,0,0,0-.127.667,1.645,1.645,0,0,0,.291.885,1.889,1.889,0,0,1,.317.914,1.814,1.814,0,0,1-.264,1.039.809.809,0,0,1-.421.342Zm1.889-5.549a2.117,2.117,0,0,0-.608.117,2.588,2.588,0,0,0-1.048.715,2.764,2.764,0,0,0-.909,1.837,2.935,2.935,0,0,0,.256,1.05,4.955,4.955,0,0,0,.225.49,1.433,1.433,0,0,1,.22.745,1.765,1.765,0,0,1-.047.341c-.019.091-.035.163-.009.188a.046.046,0,0,0,.038.01.769.769,0,0,0,.382-.32,1.793,1.793,0,0,0,.254-1.005,1.844,1.844,0,0,0-.31-.89,1.711,1.711,0,0,1-.3-.911,1.877,1.877,0,0,1,.13-.686A2.776,2.776,0,0,1,29.67,6.257c.126-.061.283-.136.277-.164l-.008-.007A.264.264,0,0,0,29.823,6.068Z\"/>",
	},
	"PowerQuery": {
		colour: "#cfcfcf",
		icon: "<path d=\"M30,25.583H25.757V15.378a8.271,8.271,0,0,0-.832-4.261A3.061,3.061,0,0,0,22.118,9.8a3.383,3.383,0,0,0-2.826,1.664,6.791,6.791,0,0,0-1.161,3.987V25.583H13.869V15.031q0-5.231-3.694-5.231a3.332,3.332,0,0,0-2.826,1.573,6.935,6.935,0,0,0-1.106,4.078V25.583H2V6.856H6.243V9.818h.073a6.488,6.488,0,0,1,5.907-3.4,5.569,5.569,0,0,1,3.393,1.07A5.328,5.328,0,0,1,17.6,10.294a6.683,6.683,0,0,1,6.218-3.877Q30,6.417,30,14.043Z\" style=\"fill:#cfcfcf\"/>",
	},
	"PowerShell": {
		colour: "#5391fe",
		icon: "<defs><linearGradient id=\"a\" x1=\"23.325\" y1=\"-118.543\" x2=\"7.26\" y2=\"-104.193\" gradientTransform=\"matrix(1, 0, 0, -1, 0, -96)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#5391fe\"/><stop offset=\"1\" stop-color=\"#3e6dbf\"/></linearGradient><linearGradient id=\"b\" x1=\"7.1\" y1=\"-104.002\" x2=\"23.001\" y2=\"-118.292\" xlink:href=\"#a\"/></defs><title>file_type_powershell</title><path d=\"M3.174,26.589a1.154,1.154,0,0,1-.928-.423,1.234,1.234,0,0,1-.21-1.052L6.233,6.78A1.8,1.8,0,0,1,7.914,5.41H28.826a1.157,1.157,0,0,1,.928.423,1.235,1.235,0,0,1,.21,1.052l-4.2,18.335a1.8,1.8,0,0,1-1.681,1.37H3.174Z\" style=\"fill-rule:evenodd;fill:url(#a)\"/><path d=\"M7.914,5.646H28.826a.913.913,0,0,1,.908,1.187l-4.2,18.334a1.575,1.575,0,0,1-1.451,1.187H3.174a.913.913,0,0,1-.908-1.187l4.2-18.334A1.574,1.574,0,0,1,7.914,5.646Z\" style=\"fill-rule:evenodd;fill:url(#b)\"/><path d=\"M16.04,21.544h5.086a1.118,1.118,0,0,1,0,2.234H16.04a1.118,1.118,0,0,1,0-2.234Z\" style=\"fill:#2c5591;fill-rule:evenodd\"/><path d=\"M19.339,16.578a1.762,1.762,0,0,1-.591.6L9.309,23.953a1.224,1.224,0,0,1-1.438-1.977l8.512-6.164v-.126L11.035,10a1.224,1.224,0,0,1,1.782-1.672l6.418,6.827A1.166,1.166,0,0,1,19.339,16.578Z\" style=\"fill:#2c5591;fill-rule:evenodd\"/><path d=\"M19.1,16.342a1.749,1.749,0,0,1-.59.6L9.074,23.718a1.225,1.225,0,0,1-1.439-1.977l8.513-6.164V15.45L10.8,9.761a1.224,1.224,0,0,1,1.783-1.672L19,14.916A1.162,1.162,0,0,1,19.1,16.342Z\" style=\"fill:#fff;fill-rule:evenodd\"/><path d=\"M15.9,21.412h5.086a1.059,1.059,0,1,1,0,2.118H15.9a1.059,1.059,0,1,1,0-2.118Z\" style=\"fill:#fff;fill-rule:evenodd\"/>",
		inlineComment: [
			"#",
		],
	},
	"Processing": {
		colour: "#1c4c70",
		icon: "<defs><linearGradient id=\"a\" x1=\"16\" y1=\"3\" x2=\"16\" y2=\"29\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#1c4c70\"/><stop offset=\"1\" stop-color=\"#0c2b42\"/></linearGradient></defs><title>file_type_processinglang</title><path d=\"M15.922,19.962a13,13,0,0,1-1.647-.077v5.552a27.76,27.76,0,0,1,3.332.461V29H5.968V25.9A27.988,27.988,0,0,1,9.3,25.438V6.715a28.215,28.215,0,0,1-3.331-.46v-3.1H8.955C10.18,3.153,13.549,3,16.23,3c6.318,0,9.8,2.948,9.8,8C26.031,16.018,22.2,19.962,15.922,19.962ZM16,7.058c-.613,0-1.149,0-1.723.038v8.615a9.694,9.694,0,0,0,1.455.115c3.025-.038,5.13-1.723,5.13-4.519C20.862,8.7,19.407,7.058,16,7.058Z\" style=\"fill:url(#a)\"/>",
	},
	"Prolog": {
		colour: "#ec1c24",
		icon: "<defs><radialGradient id=\"a\" cx=\"1341.25\" cy=\"-3396.866\" r=\"18.299\" gradientTransform=\"translate(-1327.077 3405.935)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#fff\"/><stop offset=\"0.181\" stop-color=\"#fbfbfb\"/><stop offset=\"0.365\" stop-color=\"#efeff0\"/><stop offset=\"0.552\" stop-color=\"#dadbdc\"/><stop offset=\"0.738\" stop-color=\"#bebfc2\"/><stop offset=\"0.824\" stop-color=\"#aeb0b3\"/></radialGradient><radialGradient id=\"b\" cx=\"6.678\" cy=\"84.74\" r=\"15.554\" gradientTransform=\"translate(-1.884 -86.154) scale(1.072 1.166)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#fafdff\"/><stop offset=\"0.079\" stop-color=\"#eef5fa\"/><stop offset=\"0.22\" stop-color=\"#cfdfec\"/><stop offset=\"0.407\" stop-color=\"#9dbbd5\"/><stop offset=\"0.631\" stop-color=\"#588ab5\"/><stop offset=\"0.745\" stop-color=\"#326fa4\"/><stop offset=\"0.799\" stop-color=\"#2b6698\"/><stop offset=\"0.897\" stop-color=\"#174e78\"/><stop offset=\"0.994\" stop-color=\"#003152\"/></radialGradient><radialGradient id=\"c\" cx=\"11.241\" cy=\"-9.897\" r=\"16.594\" gradientTransform=\"translate(0 22.631) scale(1 1.062)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#ffd540\"/><stop offset=\"0.667\" stop-color=\"#ec1c24\"/><stop offset=\"0.994\" stop-color=\"#760000\"/></radialGradient><radialGradient id=\"d\" cx=\"12.286\" cy=\"26.127\" r=\"2.083\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#dddfe0\"/><stop offset=\"0.174\" stop-color=\"#d9dbdc\"/><stop offset=\"0.351\" stop-color=\"#cdcfd0\"/><stop offset=\"0.531\" stop-color=\"#b8babb\"/><stop offset=\"0.711\" stop-color=\"#9c9e9f\"/><stop offset=\"0.891\" stop-color=\"#78797b\"/><stop offset=\"1\" stop-color=\"#5e5f61\"/></radialGradient><radialGradient id=\"e\" cx=\"19.064\" cy=\"26.127\" r=\"2.083\" xlink:href=\"#d\"/><radialGradient id=\"f\" cx=\"15.434\" cy=\"16.191\" r=\"2.687\" gradientTransform=\"translate(0 0.461)\" xlink:href=\"#d\"/></defs><title>file_type_prolog</title><g style=\"isolation:isolate\"><circle cx=\"16\" cy=\"16\" r=\"14\" transform=\"translate(-6.602 14.92) rotate(-42.265)\" style=\"fill:url(#a)\"/><path d=\"M19.938,6.309a9.785,9.785,0,0,0-6.5-2.339C8.564,3.97,3.774,7.7,3.405,14.961c-.4,7.8,4.75,12.862,12,12.862,10.733,0,16.672-9.78,10.027-20.388,4.671,10.6-.527,17.279-7.236,17.279-5.441,0-9.61-3.651-9.61-10.345C8.582,4.709,15.823,4.039,19.938,6.309Z\" style=\"fill:url(#b)\"/><path d=\"M22.7,10.415c-.293-.94-.645-2.788.634-3.86a3.729,3.729,0,0,0-3.844,1.534A9.165,9.165,0,0,0,12,8.1,3.729,3.729,0,0,0,8.152,6.555c1.309,1.1.91,3.005.614,3.923A10.517,10.517,0,0,0,6.1,17.524c0,2.174,1.4,4.645,1.675,7.955l1.768-1.532a11.743,11.743,0,0,0,6.212,1.433,11.741,11.741,0,0,0,6.212-1.433l1.769,1.532c.28-3.31,1.675-5.781,1.675-7.955A10.512,10.512,0,0,0,22.7,10.415Z\" style=\"fill:url(#c)\"/><path d=\"M10.722,27.867a1.621,1.621,0,1,1,3.24,0c0,.018,0,.035,0,.053a2.234,2.234,0,1,0-3.228.126C10.725,27.987,10.722,27.927,10.722,27.867Z\" style=\"fill:url(#d)\"/><path d=\"M20.629,27.867a1.621,1.621,0,1,0-3.24,0c0,.018,0,.035,0,.053a2.234,2.234,0,1,1,3.228.126A1.678,1.678,0,0,0,20.629,27.867Z\" style=\"fill:url(#e)\"/><g style=\"opacity:0.53;mix-blend-mode:multiply\"><path d=\"M8.346,18.4c-.132.667-.971.877-.971.877A1.359,1.359,0,0,1,6.809,18.1a2.929,2.929,0,0,0,.443,1.793A2.927,2.927,0,0,0,8.346,18.4Z\" style=\"fill:#231f20\"/><path d=\"M10.008,18.737c-.132.667-.972.877-.972.877a1.36,1.36,0,0,1-.566-1.182,2.929,2.929,0,0,0,.444,1.793A2.926,2.926,0,0,0,10.008,18.737Z\" style=\"fill:#231f20\"/><path d=\"M8.833,20.249c-.132.667-.971.877-.971.877A1.359,1.359,0,0,1,7.3,19.944a2.929,2.929,0,0,0,.443,1.793A2.925,2.925,0,0,0,8.833,20.249Z\" style=\"fill:#231f20\"/><path d=\"M10.5,20.583c-.132.667-.971.877-.971.877a1.36,1.36,0,0,1-.566-1.182A2.929,2.929,0,0,0,9.4,22.072,2.927,2.927,0,0,0,10.5,20.583Z\" style=\"fill:#231f20\"/><path d=\"M9.328,22.121c-.132.667-.972.877-.972.877a1.36,1.36,0,0,1-.565-1.182,2.929,2.929,0,0,0,.443,1.793A2.926,2.926,0,0,0,9.328,22.121Z\" style=\"fill:#231f20\"/><path d=\"M11.664,19.07c-.132.667-.972.877-.972.877a1.359,1.359,0,0,1-.565-1.182,2.93,2.93,0,0,0,.443,1.793A2.927,2.927,0,0,0,11.664,19.07Z\" style=\"fill:#231f20\"/></g><g style=\"opacity:0.53;mix-blend-mode:multiply\"><path d=\"M23.157,18.4c.132.667.971.877.971.877a1.359,1.359,0,0,0,.566-1.182,2.93,2.93,0,0,1-.443,1.793A2.927,2.927,0,0,1,23.157,18.4Z\" style=\"fill:#231f20\"/><path d=\"M21.495,18.737c.132.667.972.877.972.877a1.36,1.36,0,0,0,.565-1.182,2.931,2.931,0,0,1-.444,1.793A2.926,2.926,0,0,1,21.495,18.737Z\" style=\"fill:#231f20\"/><path d=\"M22.669,20.249c.132.667.971.877.971.877a1.36,1.36,0,0,0,.566-1.182,2.929,2.929,0,0,1-.443,1.793A2.926,2.926,0,0,1,22.669,20.249Z\" style=\"fill:#231f20\"/><path d=\"M21.008,20.583c.132.667.971.877.971.877a1.359,1.359,0,0,0,.565-1.182,2.928,2.928,0,0,1-.443,1.793A2.927,2.927,0,0,1,21.008,20.583Z\" style=\"fill:#231f20\"/><path d=\"M22.175,22.121c.132.667.972.877.972.877a1.36,1.36,0,0,0,.565-1.182,2.928,2.928,0,0,1-.444,1.793A2.927,2.927,0,0,1,22.175,22.121Z\" style=\"fill:#231f20\"/><path d=\"M19.838,19.07c.132.667.972.877.972.877a1.359,1.359,0,0,0,.565-1.182,2.928,2.928,0,0,1-.443,1.793A2.928,2.928,0,0,1,19.838,19.07Z\" style=\"fill:#231f20\"/></g><circle cx=\"11.339\" cy=\"14.074\" r=\"3.816\" style=\"fill:#fff\"/><circle cx=\"12.13\" cy=\"14.446\" r=\"1.861\" style=\"fill:#bdbfc1\"/><circle cx=\"12.13\" cy=\"14.446\" r=\"1.191\" style=\"fill:#231f20\"/><circle cx=\"11.603\" cy=\"14.027\" r=\"0.357\" style=\"fill:#fff\"/><circle cx=\"20.112\" cy=\"14.074\" r=\"3.816\" style=\"fill:#fff\"/><circle cx=\"20.903\" cy=\"14.446\" r=\"1.861\" style=\"fill:#bdbfc1\"/><circle cx=\"20.903\" cy=\"14.446\" r=\"1.191\" style=\"fill:#231f20\"/><circle cx=\"20.375\" cy=\"14.027\" r=\"0.357\" style=\"fill:#fff\"/><path d=\"M15.706,21.52c0-1.412,2.157-3.413,2.157-4.887a2.157,2.157,0,0,0-4.313,0C13.55,18.107,15.706,20.108,15.706,21.52Z\" style=\"fill:url(#f)\"/></g>",
	},
	"Protocol Buffers": {
		colour: "#97ff27",
		icon: "<polygon points=\"15.996 3.22 26.966 9.7 26.954 22.3 16 28.78 5.038 22.408 5.034 9.628 15.996 3.22\" style=\"fill:#fff\"/><path d=\"M16,2,3.987,9.02l0,14L16,30l12-7.1.013-13.8ZM26.954,22.3,16,28.78,5.038,22.408l0-12.78L16,3.22,26.966,9.7Z\" style=\"fill:#171c1e\"/><polygon points=\"25.569 13.654 19.946 16.964 19.943 24.89 25.59 21.565 25.569 13.654\" style=\"fill:#1ea8ff\"/><polygon points=\"23.282 12.303 25.569 13.654 19.946 16.964 19.943 24.89 17.327 23.37 17.348 15.875 23.282 12.303\" style=\"fill:#50bfff\"/><polygon points=\"22.512 10.35 22.514 11.816 16.411 15.498 16.418 23.597 14.998 24.431 14.994 14.856 22.512 10.35\" style=\"fill:#97ff27\"/><polygon points=\"20.008 8.871 22.512 10.35 14.994 14.856 14.998 24.431 12.194 22.801 12.189 13.413 20.008 8.871\" style=\"fill:#c2ff72\"/><polygon points=\"19.226 6.606 19.226 8.374 11.21 13.074 11.21 23.172 9.808 23.988 9.835 12.277 19.226 6.606\" style=\"fill:#ff274b\"/><polygon points=\"16.16 4.784 6.53 10.394 6.529 22.071 9.827 23.988 9.835 12.277 19.235 6.606 16.16 4.784\" style=\"fill:#ff5c77\"/>",
	},
	"Pug": {
		colour: "#442823",
		icon: "<path d=\"M25.514,12.846c-.052-.938.209-1.825-.209-2.554-1.043-1.825-3.649-2.867-8.863-2.867V7.372h0v.052c-5.735,0-8.185,1.043-9.227,2.867a5.6,5.6,0,0,0-.469,2.554,9.546,9.546,0,0,0-.261,2.45c.156,1.147.261,2.294.417,3.336.156.886,1.408,1.564,1.564,2.4.313,2.242,2.294,3.284,8.028,3.284v.261h-.1v-.261c5.213,0,7.4-1.043,7.716-3.284.1-.834,1.147-1.512,1.3-2.4.156-1.043.209-2.19.365-3.336A11.774,11.774,0,0,0,25.514,12.846Z\" style=\"fill:#efcca3\"/><path d=\"M16.182,13.68a3.241,3.241,0,0,1,2.19,1.147c.73.626,1.929,1.043,2.45,1.616a4.715,4.715,0,0,1,1.408,1.981,8.9,8.9,0,0,1,.313,2.242c0,.261.156.209.573,0a9.02,9.02,0,0,0,2.19-1.877c-.156.886-1.251,1.668-1.355,2.5-.313,2.242-2.5,3.336-7.872,3.336h.313\" style=\"fill:#ccac8d\"/><path d=\"M19.519,11.908c.209.678.886,3.024-.469,2.242a2.557,2.557,0,0,1,.938,1.564,1.831,1.831,0,0,0,1.3,1.408,3.479,3.479,0,0,0,2.554-.626,2.956,2.956,0,0,0,.678-3.284,2.43,2.43,0,0,0-2.137-1.616C21.4,11.334,19.31,11.126,19.519,11.908Z\" style=\"fill:#ccac8d\"/><circle cx=\"22.178\" cy=\"14.41\" r=\"1.929\"/><circle cx=\"21.656\" cy=\"13.524\" r=\"0.521\" style=\"fill:#fff\"/><path d=\"M19.206,14.306a17.68,17.68,0,0,1,2.711,2.346c.938,1.2.938,1.408.938,1.408l-.678.313a7.1,7.1,0,0,0-2.137-2.5c-1.2-.678-1.355-1.251-1.355-1.251Z\" style=\"fill:#efcca3\"/><path d=\"M16.235,13.68a3.605,3.605,0,0,0-2.346,1.147c-.73.626-2.033,1.043-2.5,1.616a4.806,4.806,0,0,0-1.46,1.981,8.9,8.9,0,0,0-.313,2.242c0,.261.052.313-.626,0A7.972,7.972,0,0,1,6.8,18.789c.156.886,1.251,1.668,1.355,2.5.313,2.19,2.5,3.284,7.872,3.284h.365\" style=\"fill:#ccac8d\"/><path d=\"M21.239,17.277a6.552,6.552,0,0,0-5.109-2.607h0a6.638,6.638,0,0,0-5.109,2.607,3.861,3.861,0,0,0-1.043,3.18c0,4.64,1.616,3.232,2.711,3.806a7.466,7.466,0,0,0,3.389.313h0a7.4,7.4,0,0,0,3.389-.313c1.095-.573,2.711.834,2.711-3.806A3.386,3.386,0,0,0,21.239,17.277Z\" style=\"fill:#56332b\"/><path d=\"M16.026,15.974a9.549,9.549,0,0,1-.469,2.554l.573-.156Z\" style=\"fill:#442823\"/><path d=\"M16.182,15.974a9.549,9.549,0,0,0,.469,2.554l-.573-.156Z\" style=\"fill:#442823\"/><path d=\"M14.358,15.453c-.209-.521.573-1.355,1.825-1.355s2.033.834,1.825,1.355-1.043.678-1.825.678C15.348,16.13,14.566,15.974,14.358,15.453Z\" style=\"fill:#56332b\"/><path d=\"M16.182,15.974c0-.1.73-.1,1.147-.365,0,0-.834.261-.991.156a.656.656,0,0,1-.209-.365.656.656,0,0,1-.209.365c-.156.1-1.095-.156-1.095-.156a8.058,8.058,0,0,1,1.2.365v.417a10.492,10.492,0,0,0,.1,2.033c.156.209.1-1.46.1-2.033A1.3,1.3,0,0,1,16.182,15.974Z\"/><path d=\"M16.182,18.945a3.35,3.35,0,0,1,1.616.678,3.121,3.121,0,0,0-1.616-1.095,3.036,3.036,0,0,0-1.825,1.2A3.312,3.312,0,0,1,16.182,18.945Z\" style=\"fill:#7f4a41\"/><path d=\"M16.078,22.8a8.9,8.9,0,0,1-2.4-.469c-.156-.052-.313.052-.469,0a6.172,6.172,0,0,1-3.18-2.137v.209c0,4.64,1.616,3.232,2.711,3.806a7.466,7.466,0,0,0,3.389.313h0a7.4,7.4,0,0,0,3.389-.313c1.095-.573,2.711.834,2.711-3.806v-.469A5.914,5.914,0,0,1,19,22.282c-.156.052-.417-.052-.573-.052A7.045,7.045,0,0,1,16.078,22.8Z\" style=\"fill:#442823\"/><path d=\"M13.941,20.3s-.573,1.668-.156,2.4l-.521-.209A15.433,15.433,0,0,1,13.941,20.3Z\" style=\"fill:#442823\"/><path d=\"M18.32,20.3s.573,1.668.156,2.4L19,22.491A10.629,10.629,0,0,0,18.32,20.3Z\" style=\"fill:#442823\"/><path d=\"M12.585,11.908c-.209.678-.886,3.024.469,2.242a2.557,2.557,0,0,0-.938,1.564,1.831,1.831,0,0,1-1.3,1.408A3.479,3.479,0,0,1,8.258,16.5a2.956,2.956,0,0,1-.678-3.284,2.43,2.43,0,0,1,2.137-1.616C10.709,11.334,12.794,11.126,12.585,11.908Z\" style=\"fill:#ccac8d\"/><path d=\"M16.13,18.528a3.393,3.393,0,0,1,2.45,2.867v-.1a3.051,3.051,0,0,0-2.45-2.919,3,3,0,0,0-2.45,2.919v.1A3.463,3.463,0,0,1,16.13,18.528Z\"/><ellipse cx=\"16.546\" cy=\"15.138\" rx=\"0.156\" ry=\"0.313\" transform=\"translate(-3.256 4.611) rotate(-14.46)\" style=\"fill:#331712\"/><ellipse cx=\"15.609\" cy=\"15.146\" rx=\"0.313\" ry=\"0.156\" transform=\"translate(-3.482 25.567) rotate(-72.765)\" style=\"fill:#331712\"/><circle cx=\"10.031\" cy=\"14.41\" r=\"1.929\"/><circle cx=\"10.552\" cy=\"13.524\" r=\"0.521\" style=\"fill:#fff\"/><path d=\"M16.7,14.41s-.521.209-.626.261a2.492,2.492,0,0,1-.626-.261H16.7Z\" style=\"fill:#7f4a41\"/><path d=\"M12.9,14.306a17.68,17.68,0,0,0-2.711,2.346c-.938,1.2-.938,1.408-.938,1.408l.678.313a7.1,7.1,0,0,1,2.137-2.5c1.2-.678,1.355-1.251,1.355-1.251Z\" style=\"fill:#efcca3\"/><path d=\"M9.092,10.813a4.519,4.519,0,0,1-1.929,2.294A2.19,2.19,0,0,0,9.092,10.813Z\" style=\"fill:#ccac8d\"/><path d=\"M22.908,10.813a4.519,4.519,0,0,0,1.929,2.294A2.19,2.19,0,0,1,22.908,10.813Z\" style=\"fill:#ccac8d\"/><path d=\"M19.31,13.836a5.16,5.16,0,0,0-3.076-1.408h.156a3.852,3.852,0,0,0-3.024,1.408,4.832,4.832,0,0,1,3.024-1.043h0A5.785,5.785,0,0,1,19.31,13.836Z\" style=\"fill:#ccac8d\"/><path d=\"M17.746,10.969a2.455,2.455,0,0,0-1.564-.938h.156a1.786,1.786,0,0,0-1.512.938,2.187,2.187,0,0,1,1.512-.678h0A1.894,1.894,0,0,1,17.746,10.969Z\" style=\"fill:#ccac8d\"/><path d=\"M10.031,17.746a2.545,2.545,0,0,1-1.773.209H8.05a3.68,3.68,0,0,1-.886-1.512A2.27,2.27,0,0,0,10.031,17.746Z\" style=\"fill:#ccac8d\"/><path d=\"M22.126,17.746a2.545,2.545,0,0,0,1.773.209H23.69a1.749,1.749,0,0,0,1.095-1.512A2.02,2.02,0,0,1,22.126,17.746Z\" style=\"fill:#ccac8d\"/><path d=\"M11.23,10.709a4.75,4.75,0,0,1,2.242.1c.938.313.209,1.564.365,1.616a2.865,2.865,0,0,1,2.242-.73c1.773.1,1.981.886,2.242.73.261-.1-.261-2.19,2.45-1.72,0,0-2.763-.73-2.659,1.251a3.675,3.675,0,0,0-3.858-.1S14.827,9.927,11.23,10.709Z\" style=\"fill:#ccac8d\"/><path d=\"M10.5,8s-2.4,2.972-2.711,4.118c-.365,1.147-.626,5.943-.938,6.621L5.756,14.045l2.033-4.9Z\" style=\"fill:#ccac8d\"/><path d=\"M21.656,8s2.4,2.972,2.711,4.118c.365,1.147.626,5.943.938,6.621L26.4,14.045l-2.033-4.9Z\" style=\"fill:#ccac8d\"/><path d=\"M21.5,8a11.617,11.617,0,0,1,3.284,4.588c.73,2.45.417,5.474.991,5.839.834.521,1.72-2.607,2.033-2.919.469-.521,2.085-1.877,2.19-2.137s-3.232-3.91-4.744-4.64C23.585,7.893,21.4,7.789,21.5,8Z\" style=\"fill:#56332b\"/><path d=\"M23.69,9.3a15.379,15.379,0,0,1,2.972,8.654l1.2-2.45A16.564,16.564,0,0,0,23.69,9.3Z\" style=\"fill:#442823\"/><path d=\"M10.5,8a11.617,11.617,0,0,0-3.284,4.588c-.73,2.45-.417,5.474-.991,5.839-.834.521-1.72-2.607-2.033-2.919-.469-.521-2.085-1.877-2.19-2.137s3.232-3.91,4.744-4.64C8.415,7.893,10.6,7.789,10.5,8Z\" style=\"fill:#56332b\"/><path d=\"M8.31,9.3a15.379,15.379,0,0,0-2.972,8.654L4.14,15.5A16.564,16.564,0,0,1,8.31,9.3Z\" style=\"fill:#442823\"/><path d=\"M6.642,18.007a4.118,4.118,0,0,0,.573,1.564c.365.365.1-.313.1-.313s-.365-.209-.313-1.72S6.642,18.007,6.642,18.007Z\" style=\"fill:#ccac8d\"/><path d=\"M25.41,18.007a4.118,4.118,0,0,1-.573,1.564c-.365.365-.1-.313-.1-.313s.365-.209.313-1.72C24.993,16.078,25.41,18.007,25.41,18.007Z\" style=\"fill:#ccac8d\"/><circle cx=\"13.889\" cy=\"17.121\" r=\"0.156\" style=\"fill:#442823\"/><circle cx=\"12.846\" cy=\"18.216\" r=\"0.156\" style=\"fill:#442823\"/><circle cx=\"12.533\" cy=\"17.121\" r=\"0.156\" style=\"fill:#442823\"/><circle cx=\"18.164\" cy=\"17.121\" r=\"0.156\" style=\"fill:#442823\"/><circle cx=\"19.154\" cy=\"18.216\" r=\"0.156\" style=\"fill:#442823\"/><circle cx=\"19.467\" cy=\"17.121\" r=\"0.156\" style=\"fill:#442823\"/>",
	},
	"Puppet": {
		colour: "#ffae1a",
		icon: "<path d=\"M25.089,11.822H18.7L15.267,8.388V2H6.911v8.357H13.3l3.422,3.422h0v4.431h0l-3.434,3.434H6.911V30h8.357V23.612h0L18.7,20.178h6.388ZM9.7,4.786h2.786V7.571H9.7ZM12.482,27.2H9.7V24.417h2.786Z\" style=\"fill:#ffae1a\"/>",
	},
	"PureScript": {
		colour: "#16171b",
		icon: "<rect width=\"32\" height=\"32\" style=\"fill:#16171b\"/><polygon points=\"21.892 22.136 19.706 20.095 10.107 20.095 12.293 22.136 21.892 22.136\" style=\"fill:#fff\"/><polygon points=\"12.293 14.98 10.107 17.021 19.706 17.021 21.892 14.98 12.293 14.98\" style=\"fill:#fff\"/><polygon points=\"21.891 11.906 19.706 9.864 10.107 9.864 12.293 11.906 21.891 11.906\" style=\"fill:#fff\"/><path d=\"M9.1,13.926,7.652,12.482,2.3,17.836a1.023,1.023,0,0,0,0,1.443l5.354,5.354L9.1,23.19,4.464,18.558Z\" style=\"fill:#fff\"/><path d=\"M29.7,12.721,24.348,7.366,22.9,8.81l4.63,4.632L22.9,18.075l1.443,1.443L29.7,14.165a1.021,1.021,0,0,0,0-1.444Z\" style=\"fill:#fff\"/>",
	},
	"Python": {
		colour: "#3671A1",
		icon: "<defs><linearGradient id=\"a\" x1=\"-133.268\" y1=\"-202.91\" x2=\"-133.198\" y2=\"-202.84\" gradientTransform=\"translate(25243.061 38519.17) scale(189.38 189.81)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#387eb8\"/><stop offset=\"1\" stop-color=\"#366994\"/></linearGradient><linearGradient id=\"b\" x1=\"-133.575\" y1=\"-203.203\" x2=\"-133.495\" y2=\"-203.133\" gradientTransform=\"translate(25309.061 38583.42) scale(189.38 189.81)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#ffe052\"/><stop offset=\"1\" stop-color=\"#ffc331\"/></linearGradient></defs><title>file_type_python</title><path d=\"M15.885,2.1c-7.1,0-6.651,3.07-6.651,3.07V8.36h6.752v1H6.545S2,8.8,2,16.005s4.013,6.912,4.013,6.912H8.33V19.556s-.13-4.013,3.9-4.013h6.762s3.772.06,3.772-3.652V5.8s.572-3.712-6.842-3.712h0ZM12.153,4.237a1.214,1.214,0,1,1-1.183,1.244v-.02a1.214,1.214,0,0,1,1.214-1.214h0Z\" style=\"fill:url(#a)\"/><path d=\"M16.085,29.91c7.1,0,6.651-3.08,6.651-3.08V23.65H15.985v-1h9.47S30,23.158,30,15.995s-4.013-6.912-4.013-6.912H23.64V12.4s.13,4.013-3.9,4.013H12.975S9.2,16.356,9.2,20.068V26.2s-.572,3.712,6.842,3.712h.04Zm3.732-2.147A1.214,1.214,0,1,1,21,26.519v.03a1.214,1.214,0,0,1-1.214,1.214h.03Z\" style=\"fill:url(#b)\"/>",
		inlineComment: [
			"#",
		],
	},
	"Q (kdb+ database)": {
		colour: "#1e78b3",
		icon: "<path d=\"M20.092,29V19.682A6.953,6.953,0,0,1,17.7,21.645a6.743,6.743,0,0,1-3.089.724A6.557,6.557,0,0,1,9.413,20,11.081,11.081,0,0,1,7,12.475,10.033,10.033,0,0,1,9.264,5.5,7.251,7.251,0,0,1,14.874,3a6.266,6.266,0,0,1,3.2.785,7.329,7.329,0,0,1,2.4,2.373V3.419H25V29Zm.157-16.542a6.492,6.492,0,0,0-1.16-4.232,3.634,3.634,0,0,0-2.905-1.387,3.742,3.742,0,0,0-2.975,1.413,6.881,6.881,0,0,0-1.2,4.485,6.767,6.767,0,0,0,1.152,4.406A3.593,3.593,0,0,0,16.009,18.5a3.786,3.786,0,0,0,2.966-1.518A6.889,6.889,0,0,0,20.249,12.458Z\" style=\"fill:#1e78b3\"/>",
	},
	"Q#": {
		colour: "#3333cc",
		icon: "<path d=\"M19.451,6.218h2.638V8.856h2.637V6.218h2.637V8.856H30V11.5H27.364v2.636H30V16.77H27.364v2.637H24.727V16.769H22.091l0,2.637H19.453V16.768H16.815V14.127h2.638V11.5H16.815V8.853h2.639Zm2.638,7.914h2.637V11.5H22.089Z\" style=\"fill:#33c\"/><path d=\"M14.018,21.524a11.436,11.436,0,0,0,1.572-6.192,10.877,10.877,0,0,0-1.858-6.6A5.889,5.889,0,0,0,8.808,6.153a5.921,5.921,0,0,0-4.94,2.581A10.842,10.842,0,0,0,2,15.333a10.853,10.853,0,0,0,1.868,6.592,5.918,5.918,0,0,0,4.941,2.588,5.743,5.743,0,0,0,3.26-.987l2.306,2.321,1.577-2.4Zm-5.17-1.218,1.117,1.121a3.229,3.229,0,0,1-1.174.217,3.335,3.335,0,0,1-2.837-1.593,8.125,8.125,0,0,1-1.18-4.719,8.1,8.1,0,0,1,1.184-4.724,3.372,3.372,0,0,1,2.87-1.588,3.31,3.31,0,0,1,2.819,1.585,8.178,8.178,0,0,1,1.172,4.726,9.113,9.113,0,0,1-.833,4.15l-1.56-1.571Z\" style=\"fill:#33c\"/>",
	},
	"QML": {
		colour: "#41cd52",
		icon: "<path d=\"M27.3,5H5.886L2,8.958V26H26.114L30,22.042V5ZM16.9,23.07l-1.828.852L13.5,21.331a3.968,3.968,0,0,1-1.082.106c-1.845,0-3.123-.5-3.85-1.49a8.03,8.03,0,0,1-1.082-4.7,8.351,8.351,0,0,1,1.1-4.773,4.379,4.379,0,0,1,3.833-1.561c1.828,0,3.087.515,3.833,1.544a8.351,8.351,0,0,1,1.1,4.773,10.809,10.809,0,0,1-.452,3.44,3.9,3.9,0,0,1-1.473,2Zm5.848-1.67a2.735,2.735,0,0,1-2.168-.692A4.192,4.192,0,0,1,20,18.1V14H19V12h1V9h2v3h2v2H22v3.9a3.907,3.907,0,0,0,.168,1.437c.112.231.393.355.86.355l1.533-.053.093,1.544A12.519,12.519,0,0,1,22.748,21.4ZM12.416,10.614a2.4,2.4,0,0,0-2.289,1.1,7.657,7.657,0,0,0-.6,3.513,7.131,7.131,0,0,0,.6,3.442A2.44,2.44,0,0,0,12.433,19.7a2.417,2.417,0,0,0,2.289-1.011,7.343,7.343,0,0,0,.586-3.442,7.692,7.692,0,0,0-.6-3.531A2.4,2.4,0,0,0,12.416,10.614Z\" style=\"fill:#41cd52\"/>",
	},
	"R": {
		colour: "#276dc3",
		icon: "<defs><linearGradient id=\"a\" x1=\"-134.811\" y1=\"-103.284\" x2=\"-134.772\" y2=\"-103.323\" gradientTransform=\"matrix(721.094, 0, 0, -482.937, 97213.595, -49874.512)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#cbced0\"/><stop offset=\"1\" stop-color=\"#84838b\"/></linearGradient><linearGradient id=\"b\" x1=\"-135.378\" y1=\"-102.985\" x2=\"-135.339\" y2=\"-103.024\" gradientTransform=\"matrix(398, 0, 0, -406.124, 53893, -41812.836)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#276dc3\"/><stop offset=\"1\" stop-color=\"#165caa\"/></linearGradient></defs><title>file_type_r</title><path d=\"M16,23.956c-7.732,0-14-4.2-14-9.376S8.268,5.2,16,5.2,30,9.4,30,14.58,23.732,23.956,16,23.956ZM18.143,8.87C12.266,8.87,7.5,11.74,7.5,15.28s4.764,6.41,10.641,6.41,10.214-1.962,10.214-6.41S24.02,8.87,18.143,8.87Z\" style=\"fill:url(#a)\"/><path d=\"M23.321,19.726a10.545,10.545,0,0,1,1.34.5,2.591,2.591,0,0,1,.68.485,1.835,1.835,0,0,1,.311.447l3.339,5.63-5.4,0-2.524-4.74a6.1,6.1,0,0,0-.835-1.145.879.879,0,0,0-.641-.291H18.311v6.173l-4.776,0V11.026h9.591S27.5,11.1,27.5,15.261,23.321,19.726,23.321,19.726Zm-2.077-5.28-2.891,0v2.681h2.893a1.323,1.323,0,0,0,1.34-1.364A1.247,1.247,0,0,0,21.244,14.447Z\" style=\"fill:url(#b)\"/>",
		inlineComment: [
			"#",
		],
	},
	"Racket": {
		colour: "#9f1d20",
		icon: "<circle cx=\"16\" cy=\"16\" r=\"14\" style=\"fill:#fff\"/><path d=\"M27.016,24.641a14,14,0,0,0-15.8-21.8C16.9,5.822,24.413,15.549,27.016,24.641Z\" style=\"fill:#3e5ba9\"/><path d=\"M13.995,10.93a24.3,24.3,0,0,0-7.22-5.46A14,14,0,0,0,5.463,25.217,39.56,39.56,0,0,1,13.995,10.93Z\" style=\"fill:#9f1d20\"/><path d=\"M16.575,14.1A32.645,32.645,0,0,0,9.43,28.365a14.016,14.016,0,0,0,13.3-.089A38.642,38.642,0,0,0,16.575,14.1Z\" style=\"fill:#9f1d20\"/>",
	},
	"Razor C#": {
		colour: "#368832",
		icon: "<path d=\"M23.844,27.692a16.332,16.332,0,0,1-6.645,1.3q-6.364,0-10.013-3.243a11.3,11.3,0,0,1-3.649-8.9A13.716,13.716,0,0,1,7.322,6.951,12.716,12.716,0,0,1,16.9,3.008a11.676,11.676,0,0,1,8.425,3.006,9.994,9.994,0,0,1,3.142,7.533,10.187,10.187,0,0,1-2.318,7.114,7.532,7.532,0,0,1-5.817,2.547,2.613,2.613,0,0,1-1.845-.642,2.323,2.323,0,0,1-.764-1.6,4.9,4.9,0,0,1-4.148,2.243,4.6,4.6,0,0,1-3.507-1.479,5.706,5.706,0,0,1-1.384-4.063,9.913,9.913,0,0,1,2.2-6.357q2.2-2.763,4.8-2.763a5.063,5.063,0,0,1,4.256,1.716l.311-1.338h2.405l-2.081,9.08a10.716,10.716,0,0,0-.352,2.243q0,.972.744.972a4.819,4.819,0,0,0,3.877-2.047,8.93,8.93,0,0,0,1.621-5.681,7.98,7.98,0,0,0-2.675-6.175,9.887,9.887,0,0,0-6.919-2.432A10.6,10.6,0,0,0,8.713,8.352a12.066,12.066,0,0,0-3.2,8.495,9.561,9.561,0,0,0,3.06,7.573q3.06,2.7,8.586,2.7a13.757,13.757,0,0,0,5.675-1.054ZM19.466,12.25a3.977,3.977,0,0,0-3.6-1.716q-1.824,0-3.263,2.23a8.726,8.726,0,0,0-1.439,4.824q0,3.635,2.905,3.635A3.771,3.771,0,0,0,16.72,20.04a6.309,6.309,0,0,0,1.7-3.2Z\" style=\"fill:#368832\"/>",
	},
	"React JSX": {
		colour: "#00d8ff",
		icon: "<circle cx=\"16\" cy=\"15.974\" r=\"2.5\" style=\"fill:#00d8ff\"/><path d=\"M16,21.706a28.385,28.385,0,0,1-8.88-1.2,11.3,11.3,0,0,1-3.657-1.958A3.543,3.543,0,0,1,2,15.974c0-1.653,1.816-3.273,4.858-4.333A28.755,28.755,0,0,1,16,10.293a28.674,28.674,0,0,1,9.022,1.324,11.376,11.376,0,0,1,3.538,1.866A3.391,3.391,0,0,1,30,15.974c0,1.718-2.03,3.459-5.3,4.541A28.8,28.8,0,0,1,16,21.706Zm0-10.217a27.948,27.948,0,0,0-8.749,1.282c-2.8.977-4.055,2.313-4.055,3.2,0,.928,1.349,2.387,4.311,3.4A27.21,27.21,0,0,0,16,20.51a27.6,27.6,0,0,0,8.325-1.13C27.4,18.361,28.8,16.9,28.8,15.974a2.327,2.327,0,0,0-1.01-1.573,10.194,10.194,0,0,0-3.161-1.654A27.462,27.462,0,0,0,16,11.489Z\" style=\"fill:#00d8ff\"/><path d=\"M10.32,28.443a2.639,2.639,0,0,1-1.336-.328c-1.432-.826-1.928-3.208-1.327-6.373a28.755,28.755,0,0,1,3.4-8.593h0A28.676,28.676,0,0,1,16.71,5.995a11.376,11.376,0,0,1,3.384-2.133,3.391,3.391,0,0,1,2.878,0c1.489.858,1.982,3.486,1.287,6.859a28.806,28.806,0,0,1-3.316,8.133,28.385,28.385,0,0,1-5.476,7.093,11.3,11.3,0,0,1-3.523,2.189A4.926,4.926,0,0,1,10.32,28.443Zm1.773-14.7a27.948,27.948,0,0,0-3.26,8.219c-.553,2.915-.022,4.668.75,5.114.8.463,2.742.024,5.1-2.036a27.209,27.209,0,0,0,5.227-6.79,27.6,27.6,0,0,0,3.181-7.776c.654-3.175.089-5.119-.713-5.581a2.327,2.327,0,0,0-1.868.089A10.194,10.194,0,0,0,17.5,6.9a27.464,27.464,0,0,0-5.4,6.849Z\" style=\"fill:#00d8ff\"/><path d=\"M21.677,28.456c-1.355,0-3.076-.82-4.868-2.361a28.756,28.756,0,0,1-5.747-7.237h0a28.676,28.676,0,0,1-3.374-8.471,11.376,11.376,0,0,1-.158-4A3.391,3.391,0,0,1,8.964,3.9c1.487-.861,4.01.024,6.585,2.31a28.8,28.8,0,0,1,5.39,6.934,28.384,28.384,0,0,1,3.41,8.287,11.3,11.3,0,0,1,.137,4.146,3.543,3.543,0,0,1-1.494,2.555A2.59,2.59,0,0,1,21.677,28.456Zm-9.58-10.2a27.949,27.949,0,0,0,5.492,6.929c2.249,1.935,4.033,2.351,4.8,1.9.8-.465,1.39-2.363.782-5.434A27.212,27.212,0,0,0,19.9,13.74,27.6,27.6,0,0,0,14.755,7.1c-2.424-2.152-4.39-2.633-5.191-2.169a2.327,2.327,0,0,0-.855,1.662,10.194,10.194,0,0,0,.153,3.565,27.465,27.465,0,0,0,3.236,8.1Z\" style=\"fill:#00d8ff\"/>",
	},
	"React TSX": {
		colour: "#007acc",
		icon: "<circle cx=\"16\" cy=\"15.974\" r=\"2.5\" style=\"fill:#007acc\"/><path d=\"M16,21.706a28.385,28.385,0,0,1-8.88-1.2,11.3,11.3,0,0,1-3.657-1.958A3.543,3.543,0,0,1,2,15.974c0-1.653,1.816-3.273,4.858-4.333A28.755,28.755,0,0,1,16,10.293a28.674,28.674,0,0,1,9.022,1.324,11.376,11.376,0,0,1,3.538,1.866A3.391,3.391,0,0,1,30,15.974c0,1.718-2.03,3.459-5.3,4.541A28.8,28.8,0,0,1,16,21.706Zm0-10.217a27.948,27.948,0,0,0-8.749,1.282c-2.8.977-4.055,2.313-4.055,3.2,0,.928,1.349,2.387,4.311,3.4A27.21,27.21,0,0,0,16,20.51a27.6,27.6,0,0,0,8.325-1.13C27.4,18.361,28.8,16.9,28.8,15.974a2.327,2.327,0,0,0-1.01-1.573,10.194,10.194,0,0,0-3.161-1.654A27.462,27.462,0,0,0,16,11.489Z\" style=\"fill:#007acc\"/><path d=\"M10.32,28.443a2.639,2.639,0,0,1-1.336-.328c-1.432-.826-1.928-3.208-1.327-6.373a28.755,28.755,0,0,1,3.4-8.593h0A28.676,28.676,0,0,1,16.71,5.995a11.376,11.376,0,0,1,3.384-2.133,3.391,3.391,0,0,1,2.878,0c1.489.858,1.982,3.486,1.287,6.859a28.806,28.806,0,0,1-3.316,8.133,28.385,28.385,0,0,1-5.476,7.093,11.3,11.3,0,0,1-3.523,2.189A4.926,4.926,0,0,1,10.32,28.443Zm1.773-14.7a27.948,27.948,0,0,0-3.26,8.219c-.553,2.915-.022,4.668.75,5.114.8.463,2.742.024,5.1-2.036a27.209,27.209,0,0,0,5.227-6.79,27.6,27.6,0,0,0,3.181-7.776c.654-3.175.089-5.119-.713-5.581a2.327,2.327,0,0,0-1.868.089A10.194,10.194,0,0,0,17.5,6.9a27.464,27.464,0,0,0-5.4,6.849Z\" style=\"fill:#007acc\"/><path d=\"M21.677,28.456c-1.355,0-3.076-.82-4.868-2.361a28.756,28.756,0,0,1-5.747-7.237h0a28.676,28.676,0,0,1-3.374-8.471,11.376,11.376,0,0,1-.158-4A3.391,3.391,0,0,1,8.964,3.9c1.487-.861,4.01.024,6.585,2.31a28.8,28.8,0,0,1,5.39,6.934,28.384,28.384,0,0,1,3.41,8.287,11.3,11.3,0,0,1,.137,4.146,3.543,3.543,0,0,1-1.494,2.555A2.59,2.59,0,0,1,21.677,28.456Zm-9.58-10.2a27.949,27.949,0,0,0,5.492,6.929c2.249,1.935,4.033,2.351,4.8,1.9.8-.465,1.39-2.363.782-5.434A27.212,27.212,0,0,0,19.9,13.74,27.6,27.6,0,0,0,14.755,7.1c-2.424-2.152-4.39-2.633-5.191-2.169a2.327,2.327,0,0,0-.855,1.662,10.194,10.194,0,0,0,.153,3.565,27.465,27.465,0,0,0,3.236,8.1Z\" style=\"fill:#007acc\"/>",
	},
	"Reason": {
		colour: "#dd4b39",
		icon: "<polyline points=\"2 2 30 2 30 30 2 30 2 2\" style=\"fill:#dd4b39\"/><path d=\"M9.051,17.527q2.537,0,5.072,0A4.947,4.947,0,0,1,17.1,18.5a3.29,3.29,0,0,1,1.128,2.267,4.117,4.117,0,0,1-.778,3.022,3.6,3.6,0,0,1-1.137.905l2.247,3.549-3.061,0-1.6-3.043-2.154,0,0,3.032H9.051V17.527m2.69,2.128,0,3.438,1.989,0a2.184,2.184,0,0,0,1.468-.452,1.814,1.814,0,0,0,.482-1.544,1.469,1.469,0,0,0-.705-1.18,2.768,2.768,0,0,0-1.437-.269C12.94,19.654,11.741,19.655,11.741,19.655Zm8.384-2.13h8.35v2.13h-5.66V21.8l5.11,0v2.119H22.82V26.1h5.824v2.142H20.125V17.525Z\" style=\"fill:#fff\"/>",
	},
	"Rego": {
		colour: "#78929a",
		icon: "<defs><clipPath id=\"a\"><path d=\"M7.055,16.241c3.415-10.22,14.759-9.473,17.924,0l.1,5.893a15.562,15.562,0,0,0-9.036,7.246A17.641,17.641,0,0,0,7.03,22.346Z\" style=\"fill:none\"/></clipPath></defs><title>file_type_rego</title><path d=\"M7.03,16.241l2.6-4.559c-2.418-.312-2.606-3.431-.8-9.062C3.809,8.853,2.42,10.228,7.03,16.241Z\" style=\"fill:#bfbfbf;fill-rule:evenodd\"/><path d=\"M24.97,16.241l-2.595-4.559c2.418-.312,2.606-3.431.8-9.062C28.191,8.853,29.58,10.228,24.97,16.241Z\" style=\"fill:#bfbfbf;fill-rule:evenodd\"/><path d=\"M7.055,16.241c3.415-10.22,14.759-9.473,17.924,0l.1,5.893a15.562,15.562,0,0,0-9.036,7.246A17.641,17.641,0,0,0,7.03,22.346Z\" style=\"fill:none\"/><g style=\"clip-path:url(#a)\"><rect x=\"16.053\" y=\"7.962\" width=\"9.549\" height=\"21.899\" style=\"fill:#536367\"/><rect x=\"5.322\" y=\"7.962\" width=\"10.732\" height=\"21.899\" style=\"fill:#78929a\"/></g><circle cx=\"16.04\" cy=\"16.241\" r=\"1.166\" style=\"fill:#fff\"/>",
	},
	"ReScript": {
		colour: "#e84f4f",
		icon: "<defs><linearGradient id=\"a\" x1=\"11.421\" y1=\"-221.705\" x2=\"21.509\" y2=\"-248.792\" gradientTransform=\"matrix(1, 0, 0, -1, 0, -218)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#e84f4f\"/><stop offset=\"0.409\" stop-color=\"#db4646\"/><stop offset=\"0.999\" stop-color=\"#cb3939\"/></linearGradient></defs><title>file_type_rescript</title><path d=\"M2,10.97c0-3.738,0-5.6.952-6.916a4.992,4.992,0,0,1,1.1-1.1C5.364,2,7.233,2,10.969,2H21.03c3.738,0,5.605,0,6.916.951a4.992,4.992,0,0,1,1.1,1.1C30,5.364,30,7.232,30,10.97V21.03c0,3.737,0,5.605-.952,6.916a4.966,4.966,0,0,1-1.1,1.1C26.636,30,24.768,30,21.03,30H10.969c-3.736,0-5.6,0-6.915-.952a4.966,4.966,0,0,1-1.1-1.1C2,26.636,2,24.767,2,21.03Z\" style=\"fill:url(#a)\"/><path d=\"M20.974,15.554a3.325,3.325,0,1,0-3.324-3.325A3.325,3.325,0,0,0,20.974,15.554Z\" style=\"fill:#fff\"/><path d=\"M9.316,11.809a4.676,4.676,0,0,1,.206-1.987A1.886,1.886,0,0,1,10.345,9a4.7,4.7,0,0,1,1.987-.205h2.64V21.045a4.686,4.686,0,0,1-.144,1.664,1.892,1.892,0,0,1-1.02,1.02,4.72,4.72,0,0,1-1.664.143,4.717,4.717,0,0,1-1.664-.143,1.892,1.892,0,0,1-1.02-1.02,4.72,4.72,0,0,1-.143-1.664Z\" style=\"fill:#fff\"/>",
	},
	"reST (reStructuredText)": {
		colour: "#ce3f31",
		icon: "<path d=\"M16,30A13.859,13.859,0,0,1,2.286,16,14.149,14.149,0,0,1,6.3,6.1,13.517,13.517,0,0,1,25.7,6.1,14.149,14.149,0,0,1,29.714,16,13.859,13.859,0,0,1,16,30Z\" style=\"fill:#ce3f31\"/><path d=\"M11.869,23.015h-.4a4.263,4.263,0,0,1-1.048-.113,1.387,1.387,0,0,1-.767-.548,2.2,2.2,0,0,1-.409-1.026A13.28,13.28,0,0,1,9.159,19.6a12.78,12.78,0,0,0-.08-1.687,1.773,1.773,0,0,0-.405-.924,1.325,1.325,0,0,0-1.026-.391V15.4a1.325,1.325,0,0,0,1.026-.391,1.773,1.773,0,0,0,.405-.924,12.78,12.78,0,0,0,.08-1.687,13.28,13.28,0,0,1,.084-1.731,2.2,2.2,0,0,1,.409-1.026,1.387,1.387,0,0,1,.767-.548,4.263,4.263,0,0,1,1.048-.113h.4v1.14h-.226q-.76,0-.931.4a7.72,7.72,0,0,0-.172,2.17,4.876,4.876,0,0,1-.416,2.316A2.117,2.117,0,0,1,8.859,16a2.089,2.089,0,0,1,1.264.986A4.876,4.876,0,0,1,10.54,19.3a7.72,7.72,0,0,0,.172,2.17q.172.4.931.4h.226Zm1.6-3.141h1.035V16.42h1.459l1.97,3.454h1.184L17.04,16.308a2.243,2.243,0,0,0,1.833-2.319c0-1.7-1.2-2.294-2.855-2.294H13.474Zm1.035-4.3V12.53h1.359c1.272,0,1.97.386,1.97,1.459s-.7,1.583-1.97,1.583Zm5.557-6.591h.4a4.263,4.263,0,0,1,1.048.113,1.387,1.387,0,0,1,.767.548,2.2,2.2,0,0,1,.409,1.026,13.28,13.28,0,0,1,.084,1.731,12.78,12.78,0,0,0,.08,1.687,1.773,1.773,0,0,0,.405.924,1.325,1.325,0,0,0,1.026.391v1.191a1.325,1.325,0,0,0-1.026.391,1.773,1.773,0,0,0-.405.924,12.78,12.78,0,0,0-.08,1.687,13.28,13.28,0,0,1-.084,1.731,2.2,2.2,0,0,1-.409,1.026,1.387,1.387,0,0,1-.767.548,4.263,4.263,0,0,1-1.048.113h-.4v-1.14h.226q.76,0,.931-.4A7.72,7.72,0,0,0,21.4,19.3a4.876,4.876,0,0,1,.416-2.316A2.089,2.089,0,0,1,23.075,16a2.117,2.117,0,0,1-1.264-.994,4.876,4.876,0,0,1-.416-2.316,7.72,7.72,0,0,0-.172-2.17q-.172-.4-.931-.4h-.226Z\" style=\"fill:#fff\"/>",
	},
	"Robot Framework": {
		icon: "<circle cx=\"16\" cy=\"16\" r=\"14\" style=\"fill:#fff\"/><path d=\"M10.387,14.6a2.727,2.727,0,0,1,5.453,0,.99.99,0,1,1-1.98,0,.746.746,0,0,0-1.492,0,.99.99,0,1,1-1.98,0m11.3,4.586a.991.991,0,0,1-.992.992H11.508a.992.992,0,0,1,0-1.984h9.184a.994.994,0,0,1,.992.992M17.391,15.16a.992.992,0,0,1,.27-1.375l2.293-1.551a.989.989,0,1,1,1.109,1.637l-2.3,1.551a.965.965,0,0,1-.551.172.994.994,0,0,1-.824-.434m6.289,6.094a.707.707,0,0,1-.207.5l-1.707,1.707a.707.707,0,0,1-.5.207H10.8a.707.707,0,0,1-.5-.207L8.6,21.754a.707.707,0,0,1-.207-.5V10.8a.707.707,0,0,1,.207-.5L10.3,8.594a.707.707,0,0,1,.5-.207H21.266a.707.707,0,0,1,.5.207L23.473,10.3a.707.707,0,0,1,.207.5ZM25.129,9.16,22.9,6.93A1.807,1.807,0,0,0,21.629,6.4H10.438a1.807,1.807,0,0,0-1.273.527L6.938,9.16a1.8,1.8,0,0,0-.527,1.27V21.621a1.8,1.8,0,0,0,.527,1.273l2.227,2.23a1.81,1.81,0,0,0,1.273.523H21.629a1.8,1.8,0,0,0,1.273-.523l2.227-2.23a1.784,1.784,0,0,0,.527-1.273V10.434a1.784,1.784,0,0,0-.527-1.273\"/>",
	},
	"Ruby": {
		colour: "#b31301",
		icon: "<defs><linearGradient id=\"a\" x1=\"-235.957\" y1=\"-308.579\" x2=\"-235.986\" y2=\"-308.527\" gradientTransform=\"matrix(202.935, 0, 0, -202.78, 47910.461, -62541.16)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#fb7655\"/><stop offset=\"0.41\" stop-color=\"#e42b1e\"/><stop offset=\"0.99\" stop-color=\"#900\"/><stop offset=\"1\" stop-color=\"#900\"/></linearGradient><linearGradient id=\"b\" x1=\"-235.571\" y1=\"-309.087\" x2=\"-235.697\" y2=\"-309.041\" gradientTransform=\"matrix(60.308, 0, 0, -111.778, 14236.351, -34525.395)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#871101\"/><stop offset=\"0.99\" stop-color=\"#911209\"/><stop offset=\"1\" stop-color=\"#911209\"/></linearGradient><linearGradient id=\"c\" x1=\"-235.896\" y1=\"-313.362\" x2=\"-235.937\" y2=\"-313.129\" gradientTransform=\"matrix(188.32, 0, 0, -21.986, 44447.302, -6856.882)\" xlink:href=\"#b\"/><linearGradient id=\"d\" x1=\"-233.515\" y1=\"-309.082\" x2=\"-233.497\" y2=\"-309.161\" gradientTransform=\"matrix(65.222, 0, 0, -97.1, 15237.802, -29991.814)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#fff\"/><stop offset=\"0.23\" stop-color=\"#e57252\"/><stop offset=\"0.46\" stop-color=\"#de3b20\"/><stop offset=\"0.99\" stop-color=\"#a60003\"/><stop offset=\"1\" stop-color=\"#a60003\"/></linearGradient><linearGradient id=\"e\" x1=\"-235.314\" y1=\"-309.534\" x2=\"-235.31\" y2=\"-309.607\" gradientTransform=\"matrix(105.32, 0, 0, -106.825, 24798.925, -33053.152)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#fff\"/><stop offset=\"0.23\" stop-color=\"#e4714e\"/><stop offset=\"0.56\" stop-color=\"#be1a0d\"/><stop offset=\"0.99\" stop-color=\"#a80d00\"/><stop offset=\"1\" stop-color=\"#a80d00\"/></linearGradient><linearGradient id=\"f\" x1=\"-235.882\" y1=\"-311.851\" x2=\"-235.869\" y2=\"-311.935\" gradientTransform=\"matrix(94.321, 0, 0, -66.418, 22271.499, -20707.004)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#fff\"/><stop offset=\"0.18\" stop-color=\"#e46342\"/><stop offset=\"0.4\" stop-color=\"#c82410\"/><stop offset=\"0.99\" stop-color=\"#a80d00\"/><stop offset=\"1\" stop-color=\"#a80d00\"/></linearGradient><linearGradient id=\"g\" x1=\"-235.412\" y1=\"-321.074\" x2=\"-235.333\" y2=\"-320.958\" gradientTransform=\"matrix(70.767, 0, 0, -24.301, 16678.116, -7798.647)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#fff\"/><stop offset=\"0.54\" stop-color=\"#c81f11\"/><stop offset=\"0.99\" stop-color=\"#bf0905\"/><stop offset=\"1\" stop-color=\"#bf0905\"/></linearGradient><linearGradient id=\"h\" x1=\"-223.821\" y1=\"-310.116\" x2=\"-223.796\" y2=\"-310.18\" gradientTransform=\"matrix(18.177, 0, 0, -72.645, 4071.017, -22510.233)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#fff\"/><stop offset=\"0.31\" stop-color=\"#de4024\"/><stop offset=\"0.99\" stop-color=\"#bf190b\"/><stop offset=\"1\" stop-color=\"#bf190b\"/></linearGradient><linearGradient id=\"i\" x1=\"-235.561\" y1=\"-309.258\" x2=\"-235.424\" y2=\"-309.116\" gradientTransform=\"matrix(158.162, 0, 0, -157.937, 37256.313, -48819.382)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#bd0012\"/><stop offset=\"0.07\" stop-color=\"#fff\"/><stop offset=\"0.17\" stop-color=\"#fff\"/><stop offset=\"0.27\" stop-color=\"#c82f1c\"/><stop offset=\"0.33\" stop-color=\"#820c01\"/><stop offset=\"0.46\" stop-color=\"#a31601\"/><stop offset=\"0.72\" stop-color=\"#b31301\"/><stop offset=\"0.99\" stop-color=\"#e82609\"/><stop offset=\"1\" stop-color=\"#e82609\"/></linearGradient><linearGradient id=\"j\" x1=\"-235.424\" y1=\"-309.143\" x2=\"-235.476\" y2=\"-309.126\" gradientTransform=\"matrix(127.074, 0, 0, -97.409, 29932.229, -30086.947)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#8c0c01\"/><stop offset=\"0.54\" stop-color=\"#990c00\"/><stop offset=\"0.99\" stop-color=\"#a80d0e\"/><stop offset=\"1\" stop-color=\"#a80d0e\"/></linearGradient><linearGradient id=\"k\" x1=\"-235.839\" y1=\"-309.604\" x2=\"-235.901\" y2=\"-309.555\" gradientTransform=\"matrix(94.011, 0, 0, -105.603, 22198.743, -32676.856)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#7e110b\"/><stop offset=\"0.99\" stop-color=\"#9e0c00\"/><stop offset=\"1\" stop-color=\"#9e0c00\"/></linearGradient><linearGradient id=\"l\" x1=\"-235.854\" y1=\"-311.24\" x2=\"-235.891\" y2=\"-311.202\" gradientTransform=\"matrix(79.702, 0, 0, -81.791, 18827.397, -25447.905)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#79130d\"/><stop offset=\"0.99\" stop-color=\"#9e120b\"/><stop offset=\"1\" stop-color=\"#9e120b\"/></linearGradient><radialGradient id=\"m\" cx=\"-235.882\" cy=\"-312.543\" r=\"0.076\" gradientTransform=\"matrix(93.113, 0, 0, -48.655, 21986.073, -15193.61)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#a80d00\"/><stop offset=\"0.99\" stop-color=\"#7e0e08\"/><stop offset=\"1\" stop-color=\"#7e0e08\"/></radialGradient><radialGradient id=\"n\" cx=\"-235.282\" cy=\"-309.704\" r=\"0.097\" gradientTransform=\"matrix(97.434, 0, 0, -75.848, 22937.057, -23467.84)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#a30c00\"/><stop offset=\"0.99\" stop-color=\"#800e08\"/><stop offset=\"1\" stop-color=\"#800e08\"/></radialGradient><linearGradient id=\"o\" x1=\"-231.241\" y1=\"-309.435\" x2=\"-231.299\" y2=\"-309.337\" gradientTransform=\"matrix(40.137, 0, 0, -81.143, 9286.998, -25078.589)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#8b2114\"/><stop offset=\"0.43\" stop-color=\"#9e100a\"/><stop offset=\"0.99\" stop-color=\"#b3100c\"/><stop offset=\"1\" stop-color=\"#b3100c\"/></linearGradient><linearGradient id=\"p\" x1=\"-235.898\" y1=\"-317.466\" x2=\"-235.831\" y2=\"-317.537\" gradientTransform=\"matrix(78.099, 0, 0, -32.624, 18447.361, -10353.553)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#b31000\"/><stop offset=\"0.44\" stop-color=\"#910f08\"/><stop offset=\"0.99\" stop-color=\"#791c12\"/><stop offset=\"1\" stop-color=\"#791c12\"/></linearGradient></defs><title>file_type_ruby</title><path d=\"M23.693,20.469,7.707,29.961l20.7-1.4L30,7.685Z\" style=\"fill:url(#a)\"/><path d=\"M28.44,28.542,26.661,16.263l-4.846,6.4Z\" style=\"fill:url(#b)\"/><path d=\"M28.464,28.542,15.43,27.519,7.776,29.934Z\" style=\"fill:url(#c)\"/><path d=\"M7.794,29.937,11.05,19.27,3.885,20.8Z\" style=\"fill:url(#d)\"/><path d=\"M21.813,22.7l-3-11.735L10.243,19Z\" style=\"fill:url(#e)\"/><path d=\"M29.32,11.127l-8.1-6.619-2.257,7.3Z\" style=\"fill:url(#f)\"/><path d=\"M25.53,2.148,20.763,4.782l-3.007-2.67Z\" style=\"fill:url(#g)\"/><path d=\"M2,24.38l2-3.642L2.382,16.4Z\" style=\"fill:url(#h)\"/><path d=\"M2.274,16.263,3.9,20.873l7.062-1.584L19.024,11.8,21.3,4.569l-3.583-2.53-6.091,2.28C9.706,6.1,5.982,9.635,5.848,9.7s-2.459,4.464-3.574,6.562Z\" style=\"fill:#fff\"/><path d=\"M7.981,7.981C12.14,3.858,17.5,1.421,19.559,3.5s-.124,7.121-4.283,11.244S5.821,21.434,3.765,19.358,3.822,12.1,7.981,7.981Z\" style=\"fill:url(#i)\"/><path d=\"M7.794,29.933l3.231-10.7,10.729,3.447c-3.879,3.638-8.194,6.713-13.96,7.254Z\" style=\"fill:url(#j)\"/><path d=\"M19.038,11.774l2.754,10.91c3.24-3.407,6.149-7.07,7.573-11.6l-10.328.691Z\" style=\"fill:url(#k)\"/><path d=\"M29.337,11.139c1.1-3.327,1.357-8.1-3.841-8.985L21.231,4.509l8.106,6.629Z\" style=\"fill:url(#l)\"/><path d=\"M2,24.332c.153,5.49,4.114,5.572,5.8,5.62l-3.9-9.1L2,24.332Z\" style=\"fill:#9e1209\"/><path d=\"M19.053,11.791c2.49,1.531,7.509,4.6,7.61,4.661a17.552,17.552,0,0,0,2.619-5.343l-10.229.683Z\" style=\"fill:url(#m)\"/><path d=\"M11.021,19.232l4.319,8.332a27.924,27.924,0,0,0,6.385-4.88l-10.7-3.452Z\" style=\"fill:url(#n)\"/><path d=\"M3.887,20.861l-.612,7.287c1.155,1.577,2.743,1.714,4.409,1.591-1.205-3-3.614-9-3.8-8.878Z\" style=\"fill:url(#o)\"/><path d=\"M21.206,4.528l8.58,1.2c-.458-1.94-1.864-3.192-4.261-3.584l-4.319,2.38Z\" style=\"fill:url(#p)\"/>",
		inlineComment: [
			"#",
		],
	},
	"Rust": {
		colour: "#a04f12",
		icon: "<defs><radialGradient id=\"a\" cx=\"-492.035\" cy=\"-883.37\" r=\"13.998\" gradientTransform=\"matrix(0.866, -0.5, -0.3, -0.52, 177.106, -689.033)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#7d7d7d\"/><stop offset=\"0.267\" stop-color=\"#7e7c7a\"/><stop offset=\"0.45\" stop-color=\"#817871\"/><stop offset=\"0.608\" stop-color=\"#867162\"/><stop offset=\"0.753\" stop-color=\"#8d684c\"/><stop offset=\"0.886\" stop-color=\"#965c30\"/><stop offset=\"1\" stop-color=\"#a04f12\"/></radialGradient></defs><title>file_type_rust</title><path d=\"M15.124,5.3a.832.832,0,1,1,.832.832h0a.831.831,0,0,1-.832-.832M5.2,12.834a.832.832,0,1,1,.832.832h0a.832.832,0,0,1-.832-.832m19.856.039a.832.832,0,1,1,.832.832.831.831,0,0,1-.832-.832h0M7.605,14.013a.76.76,0,0,0,.386-1l-.369-.835H9.074v6.545H6.144a10.247,10.247,0,0,1-.332-3.911Zm6.074.161V12.245h3.458c.179,0,1.261.206,1.261,1.016,0,.672-.83.913-1.513.913ZM8.958,24.561a.832.832,0,1,1,.832.832.831.831,0,0,1-.832-.832h0m12.331.039a.832.832,0,1,1,.832.832.832.832,0,0,1-.832-.832h0m.257-1.887a.758.758,0,0,0-.9.584l-.418,1.949a10.249,10.249,0,0,1-8.545-.041l-.417-1.949a.759.759,0,0,0-.9-.583h0l-1.721.37a10.233,10.233,0,0,1-.89-1.049h8.374c.095,0,.158-.017.158-.1V18.928c0-.086-.063-.1-.158-.1h-2.45V16.947h2.649a1.665,1.665,0,0,1,1.629,1.412c.105.413.336,1.757.494,2.187.157.483.8,1.447,1.482,1.447h4.323a10.243,10.243,0,0,1-.949,1.1Zm4.65-7.821a10.261,10.261,0,0,1,.022,1.779H25.167c-.105,0-.148.069-.148.172v.483c0,1.136-.641,1.384-1.2,1.447-.535.06-1.128-.224-1.2-.551a3.616,3.616,0,0,0-1.671-2.808c1.03-.654,2.1-1.619,2.1-2.911A3.292,3.292,0,0,0,21.44,9.8a4.559,4.559,0,0,0-2.2-.724H8.367A10.246,10.246,0,0,1,14.1,5.84l1.282,1.344a.758.758,0,0,0,1.072.026h0l1.434-1.372a10.248,10.248,0,0,1,7.015,5l-.982,2.217a.761.761,0,0,0,.386,1Zm2.448.036-.033-.343,1.011-.943a.42.42,0,0,0-.013-.595.428.428,0,0,0-.121-.081L28.2,12.483l-.1-.334.806-1.12a.422.422,0,0,0-.13-.581.43.43,0,0,0-.133-.055l-1.363-.222-.164-.306.573-1.257a.419.419,0,0,0-.236-.544.426.426,0,0,0-.146-.029l-1.383.048L25.7,7.819l.318-1.347a.421.421,0,0,0-.343-.487.435.435,0,0,0-.144,0L24.183,6.3l-.266-.219L23.966,4.7a.421.421,0,0,0-.431-.411.426.426,0,0,0-.141.028l-1.257.573-.306-.164-.222-1.363a.421.421,0,0,0-.5-.318.43.43,0,0,0-.133.055l-1.121.806-.333-.1-.483-1.293a.421.421,0,0,0-.555-.215.442.442,0,0,0-.12.08L17.418,3.39l-.343-.033L16.347,2.18a.421.421,0,0,0-.688,0l-.728,1.177-.343.033-.943-1.012a.421.421,0,0,0-.595.015.442.442,0,0,0-.08.12L12.483,3.8l-.333.1-1.12-.8a.422.422,0,0,0-.581.13.43.43,0,0,0-.055.133l-.222,1.363-.306.164L8.608,4.317a.421.421,0,0,0-.544.239.444.444,0,0,0-.028.144l.048,1.383L7.818,6.3,6.471,5.984a.421.421,0,0,0-.487.343.435.435,0,0,0,0,.144L6.3,7.819l-.218.265L4.7,8.036a.422.422,0,0,0-.383.573L4.89,9.866l-.164.306-1.363.222a.42.42,0,0,0-.318.5.43.43,0,0,0,.055.133l.806,1.12-.1.334-1.293.483a.421.421,0,0,0-.215.555.414.414,0,0,0,.081.121l1.011.943-.033.343-1.177.728a.421.421,0,0,0,0,.688l1.177.728.033.343-1.011.943a.421.421,0,0,0,.015.595.436.436,0,0,0,.119.08l1.293.483.1.334L3.1,20.972a.421.421,0,0,0,.131.581.43.43,0,0,0,.133.055l1.363.222.164.307-.573,1.257a.422.422,0,0,0,.24.545.438.438,0,0,0,.143.028l1.383-.048.219.266-.317,1.348a.42.42,0,0,0,.341.486.4.4,0,0,0,.146,0L7.818,25.7l.266.218L8.035,27.3a.419.419,0,0,0,.429.41.413.413,0,0,0,.143-.028l1.257-.573.306.164.222,1.362a.421.421,0,0,0,.5.319.407.407,0,0,0,.133-.055l1.12-.807.334.1.483,1.292a.422.422,0,0,0,.556.214.436.436,0,0,0,.119-.08l.943-1.011.343.034.728,1.177a.422.422,0,0,0,.588.1.413.413,0,0,0,.1-.1l.728-1.177.343-.034.943,1.011a.421.421,0,0,0,.595-.015.436.436,0,0,0,.08-.119l.483-1.292.334-.1,1.12.807a.421.421,0,0,0,.581-.131.43.43,0,0,0,.055-.133l.222-1.362.306-.164,1.257.573a.421.421,0,0,0,.544-.239.438.438,0,0,0,.028-.143l-.048-1.384.265-.218,1.347.317a.421.421,0,0,0,.487-.34.447.447,0,0,0,0-.146L25.7,24.183l.218-.266,1.383.048a.421.421,0,0,0,.41-.431.4.4,0,0,0-.028-.142l-.573-1.257.164-.307,1.363-.222a.421.421,0,0,0,.319-.5.434.434,0,0,0-.056-.135l-.806-1.12.1-.334,1.293-.483a.42.42,0,0,0,.215-.554.414.414,0,0,0-.081-.121l-1.011-.943.033-.343,1.177-.728a.421.421,0,0,0,0-.688Z\" style=\"fill:url(#a)\"/>",
	},
	"SAS": {
		colour: "#002bb5",
		icon: "<path d=\"M16.018,30A14,14,0,1,1,30,16.2,14,14,0,0,1,16.018,30Z\" style=\"fill:#002bb5\"/><path d=\"M9.17,22.63c.026.061.046.124.077.183,2.215,4.206,7.738,4.616,10.756,2.454a6.017,6.017,0,0,0,1.731-8.583,15.7,15.7,0,0,0-1.318-1.731c-.881-1.067-1.755-2.14-2.636-3.207-.366-.443-.767-.835-1.416-.683a1.393,1.393,0,0,0-.816,2.311c.888,1.106,1.819,2.177,2.7,3.286a3.874,3.874,0,0,1,.589,4.4,5.423,5.423,0,0,1-5,3.134A6.6,6.6,0,0,1,9.17,22.63Z\" style=\"fill:#fff\"/><path d=\"M22.494,9.609c.08-.248-.066-.37-.141-.509A7.477,7.477,0,0,0,12.6,6.237c-3.3,1.63-5.1,5.352-2.637,9.147a56.53,56.53,0,0,0,4.135,5.12,1.012,1.012,0,0,0,.709.345,1.384,1.384,0,0,0,1.428-.765,1.247,1.247,0,0,0-.173-1.507c-.876-1.051-1.769-2.088-2.615-3.162a4.13,4.13,0,0,1,.323-5.771A6.054,6.054,0,0,1,19.984,8.13,5.19,5.19,0,0,1,22.494,9.609Z\" style=\"fill:#fff\"/>",
	},
	"Sass (Sass)": {
		colour: "#cd6799",
		icon: "<path d=\"M26.11,17.572a5.8,5.8,0,0,0-2.537.588,5.345,5.345,0,0,1-.568-1.314,3.53,3.53,0,0,1-.051-1.1,9.811,9.811,0,0,1,.332-1.192c-.005-.051-.061-.292-.624-.3s-1.048.107-1.1.256a6.171,6.171,0,0,0-.235.834,19.686,19.686,0,0,1-1.713,3.294,3.186,3.186,0,0,1-.44-2.066,9.811,9.811,0,0,1,.332-1.192c-.005-.051-.061-.292-.624-.3s-1.048.107-1.1.256-.118.5-.235.834-1.483,3.386-1.841,4.173c-.184.4-.343.726-.455.946h0a.233.233,0,0,1-.02.041c-.1.189-.153.292-.153.292v.005c-.077.138-.159.266-.2.266a1.711,1.711,0,0,1,.01-.869c.2-1.059.69-2.705.685-2.762,0-.031.092-.317-.317-.465a.508.508,0,0,0-.578.1c-.036,0-.061.087-.061.087s.445-1.851-.849-1.851a3.855,3.855,0,0,0-2.475,1.683c-.348.189-1.089.593-1.882,1.028-.3.169-.614.338-.905.5-.02-.02-.041-.046-.061-.066C6.87,17.6,3.975,16.416,4.1,14.171c.046-.818.327-2.966,5.559-5.575,4.306-2.122,7.733-1.534,8.326-.23.849,1.862-1.836,5.319-6.285,5.82a3.351,3.351,0,0,1-2.813-.711c-.235-.256-.271-.271-.358-.22-.143.077-.051.307,0,.44a2.626,2.626,0,0,0,1.606,1.263,8.55,8.55,0,0,0,5.217-.517c2.7-1.043,4.8-3.943,4.184-6.372-.619-2.465-4.71-3.278-8.582-1.9A19.5,19.5,0,0,0,4.359,9.952c-2.133,1.995-2.47,3.728-2.332,4.455.5,2.578,4.051,4.255,5.472,5.5-.072.041-.138.077-.194.107-.711.353-3.421,1.77-4.1,3.268-.767,1.7.123,2.915.711,3.079a4.374,4.374,0,0,0,4.71-1.908A4.725,4.725,0,0,0,9.049,20.1a.107.107,0,0,0-.02-.031l.557-.327c.363-.215.721-.414,1.028-.578a6.74,6.74,0,0,0-.363,1.862,3.886,3.886,0,0,0,.834,2.7.921.921,0,0,0,.675.22c.6,0,.875-.5,1.176-1.094.368-.726.7-1.57.7-1.57s-.414,2.281.711,2.281c.409,0,.823-.532,1.008-.8v.005s.01-.015.031-.051l.066-.107v-.01c.164-.286.532-.936,1.079-2.015.706-1.391,1.386-3.13,1.386-3.13a8.888,8.888,0,0,0,.271,1.13,10.643,10.643,0,0,0,.583,1.309c-.164.23-.266.358-.266.358l.005.005c-.133.174-.276.363-.435.547a16.3,16.3,0,0,0-1.314,1.647.447.447,0,0,0,.123.6,1.116,1.116,0,0,0,.685.113,3.147,3.147,0,0,0,1.028-.235,3.45,3.45,0,0,0,.885-.465,1.98,1.98,0,0,0,.849-1.744,3.521,3.521,0,0,0-.322-1.233c.051-.072.1-.143.148-.215a23.428,23.428,0,0,0,1.534-2.649,8.888,8.888,0,0,0,.271,1.13,7.57,7.57,0,0,0,.5,1.125A4.861,4.861,0,0,0,20.965,20.8c-.322.931-.072,1.35.4,1.447a1.425,1.425,0,0,0,.747-.153,3.4,3.4,0,0,0,.946-.486,2.126,2.126,0,0,0,1.043-1.729,3.268,3.268,0,0,0-.235-1.023,5.356,5.356,0,0,1,2.716-.312c2.434.286,2.915,1.805,2.823,2.445a1.618,1.618,0,0,1-.772,1.094c-.169.107-.225.143-.21.22.02.113.1.107.245.087A1.9,1.9,0,0,0,30,20.7c.077-1.5-1.355-3.145-3.887-3.13ZM7.33,23.9c-.808.88-1.933,1.212-2.419.931-.522-.3-.317-1.6.675-2.532a12.884,12.884,0,0,1,1.9-1.417c.118-.072.292-.174.5-.3l.056-.031h0l.123-.077A3.493,3.493,0,0,1,7.33,23.9Zm5.881-4c-.281.685-.869,2.44-1.227,2.342-.307-.082-.5-1.412-.061-2.726a6.193,6.193,0,0,1,.956-1.754c.44-.491.926-.655,1.043-.455a9.062,9.062,0,0,1-.711,2.593Zm4.853,2.322c-.118.061-.23.1-.281.072-.036-.02.051-.1.051-.1s.609-.655.849-.951c.138-.174.3-.378.476-.609V20.7c0,.782-.757,1.309-1.094,1.524Zm3.744-.854c-.087-.061-.072-.266.22-.905a3.408,3.408,0,0,1,.834-1.074,1.448,1.448,0,0,1,.082.471,1.547,1.547,0,0,1-1.135,1.509Z\" style=\"fill:#cd6799\"/>",
	},
	"Sass (SCSS)": {
		colour: "#cd6799",
		icon: "<path d=\"M16.171,18.7c-.481.221-1.008.509-2.063,1.088-.4.225-.818.45-1.207.662-.027-.027-.055-.061-.082-.089-2.087-2.23-5.947-3.805-5.783-6.8.061-1.091.436-3.955,7.413-7.433,5.742-2.83,10.311-2.046,11.1-.307C26.683,8.3,23.1,12.913,17.17,13.582a4.469,4.469,0,0,1-3.751-.948c-.314-.341-.361-.361-.477-.293-.191.1-.068.409,0,.586a3.5,3.5,0,0,0,2.141,1.684,11.4,11.4,0,0,0,6.956-.689c3.594-1.391,6.4-5.258,5.578-8.5-.825-3.287-6.281-4.371-11.443-2.537a26,26,0,0,0-8.79,5.047c-2.844,2.66-3.294,4.972-3.11,5.94.662,3.437,5.4,5.674,7.3,7.331-.1.055-.184.1-.259.143-.948.471-4.562,2.36-5.463,4.358-1.023,2.264.164,3.887.948,4.105a5.832,5.832,0,0,0,6.281-2.544,6.3,6.3,0,0,0,.559-5.8,5.03,5.03,0,0,1,.716-.477c.484-.286.945-.568,1.354-.786l0,0a10.475,10.475,0,0,1,4.475-.989c3.246.382,3.887,2.407,3.764,3.26a2.157,2.157,0,0,1-1.03,1.459c-.225.143-.3.191-.28.293.027.15.136.143.327.116a2.535,2.535,0,0,0,1.766-2.257c.1-2-1.807-4.194-5.183-4.174a7.753,7.753,0,0,0-2.946.587q-.225.093-.437.2Zm-4.825,7.839c-1.078,1.173-2.578,1.616-3.226,1.241-.7-.4-.423-2.135.9-3.376a17.18,17.18,0,0,1,2.53-1.889c.157-.1.389-.232.668-.4.048-.027.075-.041.075-.041l.164-.1A4.658,4.658,0,0,1,11.346,26.539Z\" style=\"fill:#cd6799\"/>",
	},
	"Scala": {
		colour: "#e62d2a",
		icon: "<defs><linearGradient id=\"a\" x1=\"-134.907\" y1=\"204.572\" x2=\"-134.896\" y2=\"204.572\" gradientTransform=\"matrix(1538, 0, 0, -961.25, 207495, 196661)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#e62d2a\"/><stop offset=\"0.6\" stop-color=\"#df3f3d\"/><stop offset=\"0.8\" stop-color=\"#df3f3d\"/><stop offset=\"1\" stop-color=\"#e62d2a\"/></linearGradient><linearGradient id=\"b\" x1=\"-134.907\" y1=\"203.781\" x2=\"-134.896\" y2=\"203.781\" gradientTransform=\"matrix(1538, 0, 0, -961.25, 207495, 195892)\" xlink:href=\"#a\"/><linearGradient id=\"c\" x1=\"-134.907\" y1=\"205.363\" x2=\"-134.896\" y2=\"205.363\" gradientTransform=\"matrix(1538, 0, 0, -961.25, 207495, 197430)\" xlink:href=\"#a\"/></defs><title>file_type_scala</title><path d=\"M7.384,19.231v2.154c0,.363,7.833.971,12.937,2.154,2.465-.571,4.295-1.277,4.295-2.154V19.231c0-.877-1.83-1.582-4.295-2.154-5.1,1.183-12.937,1.791-12.937,2.154\" style=\"fill:#7f0c1d\"/><path d=\"M7.384,10.615v2.154c0,.363,7.833.971,12.937,2.154,2.465-.571,4.295-1.277,4.295-2.154V10.615c0-.877-1.83-1.582-4.295-2.154-5.1,1.183-12.937,1.791-12.937,2.154\" style=\"fill:#7f0c1d\"/><path d=\"M7.384,14.923v6.462c0-.538,17.232-1.615,17.232-4.308V10.615c0,2.692-17.232,3.769-17.232,4.308\" style=\"fill:url(#a)\"/><path d=\"M7.384,6.308V12.77c0-.538,17.232-1.615,17.232-4.308V2c0,2.692-17.232,3.769-17.232,4.308\" style=\"fill:url(#b)\"/><path d=\"M7.384,23.538V30c0-.538,17.232-1.615,17.232-4.308V19.231c0,2.692-17.232,3.769-17.232,4.308\" style=\"fill:url(#c)\"/>",
	},
	"Shell session": {
		colour: "#d9b400",
		icon: "<path d=\"M29.4,27.6H2.5V4.5H29.4Zm-25.9-1H28.4V5.5H3.5Z\" style=\"fill:#d9b400\"/><polygon points=\"6.077 19.316 5.522 18.484 10.366 15.255 5.479 11.184 6.12 10.416 12.035 15.344 6.077 19.316\" style=\"fill:#d9b400\"/><rect x=\"12.7\" y=\"18.2\" width=\"7.8\" height=\"1\" style=\"fill:#d9b400\"/><rect x=\"2.5\" y=\"5.5\" width=\"26.9\" height=\"1.9\" style=\"fill:#d9b400\"/>",
	},
	"Shell": {
		colour: "#d9b400",
		icon: "<path d=\"M29.4,27.6H2.5V4.5H29.4Zm-25.9-1H28.4V5.5H3.5Z\" style=\"fill:#d9b400\"/><polygon points=\"6.077 19.316 5.522 18.484 10.366 15.255 5.479 11.184 6.12 10.416 12.035 15.344 6.077 19.316\" style=\"fill:#d9b400\"/><rect x=\"12.7\" y=\"18.2\" width=\"7.8\" height=\"1\" style=\"fill:#d9b400\"/><rect x=\"2.5\" y=\"5.5\" width=\"26.9\" height=\"1.9\" style=\"fill:#d9b400\"/>",
	},
	"Smarty": {
		colour: "#f6e200",
		icon: "<defs><linearGradient id=\"a\" x1=\"13.859\" y1=\"29.219\" x2=\"18.106\" y2=\"29.219\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0.034\" stop-color=\"#636361\"/><stop offset=\"0.178\" stop-color=\"#6c6d70\"/><stop offset=\"0.219\" stop-color=\"#6f7175\"/><stop offset=\"0.309\" stop-color=\"#616366\"/><stop offset=\"0.481\" stop-color=\"#3c3d3f\"/><stop offset=\"0.716\" stop-color=\"#010101\"/><stop offset=\"0.719\"/><stop offset=\"1\" stop-color=\"#636a6e\"/></linearGradient><linearGradient id=\"b\" x1=\"15.178\" y1=\"29.734\" x2=\"16.787\" y2=\"29.734\" xlink:href=\"#a\"/><linearGradient id=\"c\" x1=\"15.277\" y1=\"29.881\" x2=\"16.688\" y2=\"29.881\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0.034\" stop-color=\"#9b9b98\"/><stop offset=\"0.131\" stop-color=\"#a4a5a7\"/><stop offset=\"0.219\" stop-color=\"#aeb1b8\"/><stop offset=\"0.352\" stop-color=\"#9fa4ab\"/><stop offset=\"0.605\" stop-color=\"#788188\"/><stop offset=\"0.719\" stop-color=\"#657076\"/><stop offset=\"1\" stop-color=\"#8b949a\"/></linearGradient><radialGradient id=\"d\" cx=\"-8.456\" cy=\"-16.616\" r=\"19.383\" gradientTransform=\"translate(34.042 37.063) scale(1.054)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0.034\" stop-color=\"#70706e\"/><stop offset=\"0.112\" stop-color=\"#616261\"/><stop offset=\"0.219\" stop-color=\"#46474a\"/><stop offset=\"0.408\" stop-color=\"#48494c\"/><stop offset=\"0.487\" stop-color=\"#4e5053\"/><stop offset=\"0.544\" stop-color=\"#5a5c5f\"/><stop offset=\"0.592\" stop-color=\"#6a6e71\"/><stop offset=\"0.633\" stop-color=\"#7f8588\"/><stop offset=\"0.667\" stop-color=\"#979ea1\"/><stop offset=\"0.719\" stop-color=\"#3d4447\"/><stop offset=\"1\" stop-color=\"#656c70\"/></radialGradient><linearGradient id=\"e\" x1=\"16.126\" y1=\"28.108\" x2=\"16.05\" y2=\"26.893\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0.034\" stop-color=\"#9b9b98\"/><stop offset=\"0.109\" stop-color=\"#a5a6a7\"/><stop offset=\"0.219\" stop-color=\"#babcc4\"/><stop offset=\"0.311\" stop-color=\"#abaeb5\"/><stop offset=\"0.487\" stop-color=\"#84898f\"/><stop offset=\"0.719\" stop-color=\"#485054\"/><stop offset=\"1\" stop-color=\"#8b949a\"/></linearGradient><linearGradient id=\"f\" x1=\"16.013\" y1=\"26.542\" x2=\"15.895\" y2=\"24.635\" xlink:href=\"#e\"/><linearGradient id=\"g\" x1=\"16.023\" y1=\"25.546\" x2=\"15.887\" y2=\"23.355\" xlink:href=\"#e\"/><linearGradient id=\"h\" x1=\"16.013\" y1=\"27.627\" x2=\"15.895\" y2=\"25.72\" xlink:href=\"#e\"/><linearGradient id=\"j\" x1=\"13.68\" y1=\"28.805\" x2=\"18.284\" y2=\"28.805\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0.034\" stop-color=\"#545453\"/><stop offset=\"0.071\" stop-color=\"#616262\"/><stop offset=\"0.143\" stop-color=\"#848589\"/><stop offset=\"0.219\" stop-color=\"#aeb1b8\"/><stop offset=\"0.352\" stop-color=\"#9fa4ab\"/><stop offset=\"0.605\" stop-color=\"#788188\"/><stop offset=\"0.719\" stop-color=\"#657076\"/><stop offset=\"1\" stop-color=\"#505659\"/></linearGradient><linearGradient id=\"k\" x1=\"12.159\" y1=\"25.813\" x2=\"19.475\" y2=\"25.813\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#e5e1df\"/><stop offset=\"0\" stop-color=\"#dddad6\"/><stop offset=\"0.038\" stop-color=\"#ceccc9\"/><stop offset=\"0.112\" stop-color=\"#a7a9a8\"/><stop offset=\"0.212\" stop-color=\"#697072\"/><stop offset=\"0.264\" stop-color=\"#465054\"/><stop offset=\"0.303\" stop-color=\"#636c6f\"/><stop offset=\"0.398\" stop-color=\"#a5aaac\"/><stop offset=\"0.478\" stop-color=\"#d5d7d9\"/><stop offset=\"0.539\" stop-color=\"#f3f4f5\"/><stop offset=\"0.573\" stop-color=\"#fefeff\"/><stop offset=\"0.62\" stop-color=\"#f4f5f6\"/><stop offset=\"0.699\" stop-color=\"#dadcdf\"/><stop offset=\"0.8\" stop-color=\"#b0b4b9\"/><stop offset=\"0.876\" stop-color=\"#8b9298\"/><stop offset=\"1\" stop-color=\"#d1d3d4\"/><stop offset=\"1\" stop-color=\"#a7a9ac\"/></linearGradient><linearGradient id=\"l\" x1=\"12.159\" y1=\"24.728\" x2=\"19.475\" y2=\"24.728\" xlink:href=\"#k\"/><linearGradient id=\"m\" x1=\"12.159\" y1=\"23.548\" x2=\"19.475\" y2=\"23.548\" xlink:href=\"#k\"/><linearGradient id=\"n\" x1=\"12.159\" y1=\"26.898\" x2=\"19.475\" y2=\"26.898\" xlink:href=\"#k\"/><linearGradient id=\"o\" x1=\"12.159\" y1=\"25.967\" x2=\"19.475\" y2=\"25.967\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#e5e1df\"/><stop offset=\"0\" stop-color=\"#dde8d0\"/><stop offset=\"0\" stop-color=\"#d2f3ba\"/><stop offset=\"0.036\" stop-color=\"#c5e4b1\"/><stop offset=\"0.105\" stop-color=\"#a4bd98\"/><stop offset=\"0.199\" stop-color=\"#6e7f71\"/><stop offset=\"0.264\" stop-color=\"#465054\"/><stop offset=\"0.303\" stop-color=\"#636c6f\"/><stop offset=\"0.398\" stop-color=\"#a5aaac\"/><stop offset=\"0.478\" stop-color=\"#d5d7d9\"/><stop offset=\"0.539\" stop-color=\"#f3f4f5\"/><stop offset=\"0.573\" stop-color=\"#fefeff\"/><stop offset=\"0.62\" stop-color=\"#f4f5f6\"/><stop offset=\"0.699\" stop-color=\"#dadcdf\"/><stop offset=\"0.8\" stop-color=\"#b0b4b9\"/><stop offset=\"0.876\" stop-color=\"#8b9298\"/><stop offset=\"1\" stop-color=\"#d1d3d4\"/><stop offset=\"1\" stop-color=\"#a7a9ac\"/></linearGradient><linearGradient id=\"p\" x1=\"12.159\" y1=\"24.883\" x2=\"19.475\" y2=\"24.883\" xlink:href=\"#o\"/><linearGradient id=\"q\" x1=\"12.159\" y1=\"27.05\" x2=\"19.475\" y2=\"27.05\" xlink:href=\"#o\"/><linearGradient id=\"r\" x1=\"11.902\" y1=\"23.201\" x2=\"19.884\" y2=\"23.201\" xlink:href=\"#e\"/><radialGradient id=\"s\" cx=\"-16.983\" cy=\"-22.948\" r=\"10.718\" gradientTransform=\"translate(34.042 37.063) scale(1.054)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#ffffd1\"/><stop offset=\"0.505\" stop-color=\"#ff0\"/><stop offset=\"0.568\" stop-color=\"#fdf700\"/><stop offset=\"0.664\" stop-color=\"#f6e200\"/><stop offset=\"0.782\" stop-color=\"#ebbf00\"/><stop offset=\"0.906\" stop-color=\"#de9200\"/><stop offset=\"1\" stop-color=\"#da9819\"/></radialGradient></defs><title>file_type_smarty</title><path d=\"M13.859,28.776a.242.242,0,0,0,.128.191,12,12,0,0,0,1.392.622,4.3,4.3,0,0,0,.578.072h.052a4.3,4.3,0,0,0,.578-.072,12.014,12.014,0,0,0,1.392-.622.243.243,0,0,0,.128-.191l-2.137.192Z\" style=\"fill:url(#a)\"/><path d=\"M16.014,30a1.123,1.123,0,0,0,.688-.247.175.175,0,0,0,.085-.126v-.105a3.235,3.235,0,0,0-.773-.053h-.063a3.237,3.237,0,0,0-.773.053v.105a.175.175,0,0,0,.085.126,1.122,1.122,0,0,0,.688.247Z\" style=\"fill:url(#b)\"/><path d=\"M15.951,29.807a4.732,4.732,0,0,1-.674-.044,1.105,1.105,0,0,0,.674.237h.063a1.106,1.106,0,0,0,.675-.237,4.733,4.733,0,0,1-.675.044Z\" style=\"fill:url(#c)\"/><path d=\"M19.809,26.838a1,1,0,0,0-.234.389c-.036.181-.1.585-1.326,1.406l-.025.017a.435.435,0,0,1-.086.037,9.968,9.968,0,0,1-2.155.209,9.968,9.968,0,0,1-2.156-.209.436.436,0,0,1-.085-.036l-.025-.017a4.579,4.579,0,0,1-1.12-.957c-.164-.219-.373-.257-.39-.345a21.055,21.055,0,0,0,3.855.057,13.049,13.049,0,0,0,3.761-.654A.692.692,0,0,1,19.809,26.838Z\" style=\"fill:url(#d)\"/><path d=\"M19.772,26.88a.985.985,0,0,1-.246.129c-.076.028-.245.078-.245.078a25.15,25.15,0,0,1-6.458.436c-.136-.009-.32-.028-.32-.028a1.062,1.062,0,0,1-.14-.028,1.016,1.016,0,0,1,.14.107c.16.013.319.019.319.019a26.864,26.864,0,0,0,6.743-.323l.009-.042A.885.885,0,0,1,19.772,26.88Z\" style=\"fill:url(#e)\"/><path d=\"M19.439,25.382s.245-.07.245-.162a.114.114,0,0,0-.013-.065.214.214,0,0,1-.061-.144.437.437,0,0,1,.119-.27,1.069,1.069,0,0,1-.2.1c-.076.028-.245.078-.245.078a25.151,25.151,0,0,1-6.458.436c-.136-.009-.32-.028-.32-.028a1.055,1.055,0,0,1-.181-.041.377.377,0,0,1,.078.217.716.716,0,0,1-.254.432.673.673,0,0,1,.368-.079A26.2,26.2,0,0,0,19.439,25.382Z\" style=\"fill:url(#f)\"/><path d=\"M19.439,24.229s.245-.078.245-.182a.143.143,0,0,0-.013-.073.254.254,0,0,1-.061-.162.514.514,0,0,1,.119-.3,1.026,1.026,0,0,1-.2.111c-.076.032-.245.088-.245.088a22.507,22.507,0,0,1-6.458.489c-.136-.01-.32-.032-.32-.032a.953.953,0,0,1-.181-.046.455.455,0,0,1,.078.243.825.825,0,0,1-.254.484.614.614,0,0,1,.368-.089C13.014,24.758,16.935,25.041,19.439,24.229Z\" style=\"fill:url(#g)\"/><path d=\"M19.439,26.467s.245-.07.245-.163a.115.115,0,0,0-.013-.065.214.214,0,0,1-.061-.144.435.435,0,0,1,.119-.27,1.07,1.07,0,0,1-.2.1c-.076.028-.245.078-.245.078a25.162,25.162,0,0,1-6.458.436c-.136-.009-.32-.028-.32-.028a1.042,1.042,0,0,1-.181-.041.377.377,0,0,1,.078.217.717.717,0,0,1-.254.432.67.67,0,0,1,.368-.079A26.207,26.207,0,0,0,19.439,26.467Z\" style=\"fill:url(#h)\"/><path d=\"M19.439,26.467s.245-.07.245-.163a.115.115,0,0,0-.013-.065.214.214,0,0,1-.061-.144.435.435,0,0,1,.119-.27,1.07,1.07,0,0,1-.2.1c-.076.028-.245.078-.245.078a25.168,25.168,0,0,1-6.458.436c-.136-.009-.32-.028-.32-.028a1.042,1.042,0,0,1-.181-.041.376.376,0,0,1,.078.217.717.717,0,0,1-.254.432.67.67,0,0,1,.368-.079A26.207,26.207,0,0,0,19.439,26.467Z\" style=\"fill:url(#h)\"/><path d=\"M18.224,28.65a.435.435,0,0,1-.086.037,9.968,9.968,0,0,1-2.155.209,9.968,9.968,0,0,1-2.156-.209.436.436,0,0,1-.085-.036l-.025-.017-.029-.019a.112.112,0,0,0,0,.073c.024.073.147.1.147.1a9.943,9.943,0,0,0,2.15.209,9.942,9.942,0,0,0,2.15-.209s.126-.029.147-.1a.118.118,0,0,0,0-.073l-.029.019Z\" style=\"fill:url(#j)\"/><path d=\"M19.944,25.5s.041.252-.418.423c-.076.028-.245.078-.245.078a25.162,25.162,0,0,1-6.458.436c-.136-.009-.32-.028-.32-.028-.276-.038-.467-.16-.455-.308,0,0-.033-.249.466-.249a26.2,26.2,0,0,0,6.925-.472s.245-.07.245-.162a.111.111,0,0,0-.013-.066S19.944,25.312,19.944,25.5Z\" style=\"fill:url(#k)\"/><path d=\"M19.944,24.416s.041.252-.418.423c-.076.028-.245.078-.245.078a25.151,25.151,0,0,1-6.458.436c-.136-.009-.32-.028-.32-.028-.276-.038-.467-.16-.455-.308,0,0-.033-.248.466-.248a26.193,26.193,0,0,0,6.925-.472s.245-.07.245-.162a.11.11,0,0,0-.013-.065S19.944,24.227,19.944,24.416Z\" style=\"fill:url(#l)\"/><path d=\"M19.893,24.406v-.021c-.012.076-.078.236-.417.355-.076.026-.245.073-.245.073a22.372,22.372,0,0,1-5.1.5h0a22.155,22.155,0,0,0,5.1-.441s.169-.047.245-.073C19.933,24.643,19.893,24.406,19.893,24.406Z\" style=\"fill:#fff\"/><path d=\"M19.893,25.491V25.47c-.012.076-.078.236-.417.355-.076.027-.245.073-.245.073a22.38,22.38,0,0,1-5.1.5h0a22.171,22.171,0,0,0,5.1-.441s.169-.047.245-.073C19.933,25.728,19.893,25.491,19.893,25.491Z\" style=\"fill:#fff\"/><path d=\"M19.944,23.034s.041.329-.418.552c-.076.037-.245.1-.245.1a19.409,19.409,0,0,1-6.458.569c-.136-.012-.32-.037-.32-.037-.276-.05-.467-.209-.455-.4,0,0-.033-.324.466-.324a18.283,18.283,0,0,0,6.925-.461,1.014,1.014,0,0,0,.444-.238A.53.53,0,0,1,19.944,23.034Z\" style=\"fill:url(#m)\"/><path d=\"M19.944,26.586s.041.252-.418.423c-.076.028-.245.078-.245.078a25.15,25.15,0,0,1-6.458.436c-.136-.009-.32-.028-.32-.028-.276-.038-.467-.16-.455-.308,0,0-.033-.248.466-.248a26.207,26.207,0,0,0,6.925-.472s.245-.07.245-.163a.111.111,0,0,0-.013-.065S19.944,26.4,19.944,26.586Z\" style=\"fill:url(#n)\"/><path d=\"M19.893,26.576v-.021c-.012.076-.078.236-.417.355-.076.026-.245.073-.245.073a22.372,22.372,0,0,1-5.1.5h0a22.163,22.163,0,0,0,5.1-.441s.169-.047.245-.073C19.933,26.813,19.893,26.576,19.893,26.576Z\" style=\"fill:#fff\"/><path d=\"M19.893,23.321V23.3c-.012.076-.078.236-.417.355-.076.027-.245.073-.245.073a22.372,22.372,0,0,1-5.1.5h0a22.156,22.156,0,0,0,5.1-.441s.169-.047.245-.073C19.933,23.558,19.893,23.321,19.893,23.321Z\" style=\"fill:#fff\"/><path d=\"M12.417,25.881s-.236,0-.241.08.246.085.246.085.175,0,.3.005c.619-.013,1.993-.038,3.437-.166C14.384,25.958,12.723,25.883,12.417,25.881Z\" style=\"fill:url(#o)\"/><path d=\"M12.417,24.8s-.236,0-.241.08.246.085.246.085.175,0,.3.005c.619-.012,1.993-.038,3.437-.166C14.384,24.874,12.723,24.8,12.417,24.8Z\" style=\"fill:url(#p)\"/><path d=\"M12.417,26.965s-.236,0-.241.08.246.085.246.085.175,0,.3.005c.619-.012,1.993-.038,3.437-.166C14.384,27.042,12.723,26.966,12.417,26.965Z\" style=\"fill:url(#q)\"/><path d=\"M11.965,22.779s-.274.315.319.711c0,0,5.775.587,7.6-.695C19.884,22.795,13.623,23.32,11.965,22.779Z\" style=\"fill:url(#r)\"/><path d=\"M20.035,22.779a4.449,4.449,0,0,0,.81-1.155,3.386,3.386,0,0,0,.2-1.115,6.733,6.733,0,0,1,.632-2.91c.534-1.014,2.81-4.447,2.81-7.462A8.012,8.012,0,0,0,16,2a8.012,8.012,0,0,0-8.483,8.136c0,3.015,2.276,6.448,2.81,7.462a6.731,6.731,0,0,1,.632,2.91,3.384,3.384,0,0,0,.2,1.115,4.453,4.453,0,0,0,.81,1.155,13.866,13.866,0,0,0,3.987.37A15.151,15.151,0,0,0,20.035,22.779Z\" style=\"fill:url(#s)\"/>",
	},
	"Solidity (Ethereum)": {
		colour: "#c1c1c1",
		icon: "<path d=\"M20.477,2l-4.5,8h-9l4.5-8h9\" style=\"fill:#c1c1c1;opacity:0.45;isolation:isolate\"/><path d=\"M11.52,30l4.5-8h9l-4.5,8h-9\" style=\"fill:#c1c1c1;opacity:0.45;isolation:isolate\"/><path d=\"M15.975,10h9l-4.5-8h-9Z\" style=\"fill:#c1c1c1;opacity:0.6;isolation:isolate\"/><path d=\"M16.022,22h-9l4.5,8h9Z\" style=\"fill:#c1c1c1;opacity:0.6;isolation:isolate\"/><path d=\"M11.477,18l4.5-8-4.5-8-4.5,8Z\" style=\"fill:#c1c1c1;opacity:0.8;isolation:isolate\"/><path d=\"M20.52,14l-4.5,8,4.5,8,4.5-8Z\" style=\"fill:#c1c1c1;opacity:0.8;isolation:isolate\"/>",
	},
	"Solution file": {
		colour: "#854cc7",
		icon: "<defs><linearGradient id=\"a\" x1=\"16\" y1=\"-182.072\" x2=\"16\" y2=\"-209.928\" gradientTransform=\"matrix(1, 0, 0, -1, 0, -180)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#fff\"/><stop offset=\"1\" stop-color=\"#fff\" stop-opacity=\"0\"/></linearGradient></defs><title>file_type_sln</title><path d=\"M6.045,23.991a1.166,1.166,0,0,1-1.208.191L2.718,23.3A1.168,1.168,0,0,1,2,22.222V9.778A1.165,1.165,0,0,1,2.718,8.7l2.119-.883a1.169,1.169,0,0,1,1.208.191l.476.408A.646.646,0,0,0,5.5,8.942V23.058a.646.646,0,0,0,1.021.525Z\" style=\"fill:#52218a\"/><path d=\"M2.718,23.3A1.169,1.169,0,0,1,2,22.222v-.1a.674.674,0,0,0,1.174.452L21.25,2.583a1.743,1.743,0,0,1,1.99-.338l5.769,2.778A1.749,1.749,0,0,1,30,6.6v.067a1.1,1.1,0,0,0-1.8-.854L6.521,23.583l-.476.408a1.166,1.166,0,0,1-1.208.191Z\" style=\"fill:#6c33af\"/><path d=\"M2.718,8.7A1.168,1.168,0,0,0,2,9.778v.1a.674.674,0,0,1,1.174-.452L21.25,29.416a1.743,1.743,0,0,0,1.99.338l5.769-2.778A1.747,1.747,0,0,0,30,25.4v-.068a1.1,1.1,0,0,1-1.8.855L6.521,8.417l-.476-.408a1.166,1.166,0,0,0-1.208-.191Z\" style=\"fill:#854cc7\"/><path d=\"M23.24,29.755a1.743,1.743,0,0,1-1.99-.338A1.025,1.025,0,0,0,23,28.692V3.308a1.025,1.025,0,0,0-1.75-.725,1.743,1.743,0,0,1,1.99-.338l5.768,2.774A1.749,1.749,0,0,1,30,6.6V25.405a1.751,1.751,0,0,1-.991,1.577Z\" style=\"fill:#b179f1\"/><g style=\"opacity:0.25\"><path d=\"M22.093,29.883a1.74,1.74,0,0,0,1.147-.128l5.768-2.774A1.749,1.749,0,0,0,30,25.4V6.6a1.75,1.75,0,0,0-.992-1.577L23.24,2.245a1.742,1.742,0,0,0-1.99.339l-9.3,10.284L6.521,8.416l-.476-.408a1.168,1.168,0,0,0-1.207-.191L2.719,8.7A1.167,1.167,0,0,0,2,9.689c0,.029,0,.059,0,.088V22.221c0,.03,0,.059,0,.088a1.167,1.167,0,0,0,.715.989l2.119.883a1.226,1.226,0,0,0,.155.052,1.165,1.165,0,0,0,1.052-.243l.476-.408,5.43-4.452,9.3,10.285A1.733,1.733,0,0,0,22.093,29.883ZM23,10.072,15.77,16,23,21.927ZM5.5,12l3.619,4L5.5,20Z\" style=\"fill-rule:evenodd;fill:url(#a)\"/></g>",
	},
	"SPARQL": {
		colour: "#0c479c",
		icon: "<path d=\"M26.284,20.361c-.165-.084-.359-.164-.523-.248H25.9s-1.158-.5-1.24-4.176c-.111-3.655,1.1-4.289,1.1-4.289a4.96,4.96,0,0,0,2.176-2.143,5.122,5.122,0,0,0-2.122-6.927,5.342,5.342,0,0,0-7.138,2.146,5.067,5.067,0,0,0-.523,3.214L18.1,7.855s.3,1.319-2.839,3.272c-3.115,1.95-4.549.962-4.549.962l.082.138a2.131,2.131,0,0,0-.273-.167,5.117,5.117,0,1,0,.825,8.52l-.025.055s1.129-.933,4.407.827c2.592,1.374,2.979,2.748,3.033,3.24a5.1,5.1,0,0,0,2.7,4.7,5.124,5.124,0,1,0,4.825-9.041Zm-5.79.685c-.412.138-1.6.3-4.077-1.017-2.7-1.454-3.115-2.664-3.169-3.021a5.406,5.406,0,0,0-.057-1.319l.029.026S13,14.534,16.084,12.639c2.757-1.705,4.026-1.374,4.245-1.293a2.83,2.83,0,0,0,.47.277,4.082,4.082,0,0,0,.964.383c.387.357,1.076,1.374,1.158,4.1s-.717,3.764-1.158,4.121A5.04,5.04,0,0,0,20.494,21.047Z\" style=\"fill:#0c479c\"/><path d=\"M20.135,4.229a3.861,3.861,0,0,0-.082,5.386c-.717-.685-.688-2.117.029-3.462a.673.673,0,0,1,.746-.277c.025,0,.054.029.082.029a.993.993,0,0,0,.276.026A1.056,1.056,0,0,0,22.2,4.805a.934.934,0,0,0-.3-.685c1.38-.907,2.95-1.017,3.61-.412h.029A3.826,3.826,0,0,0,20.135,4.229ZM5.145,13.846a3.859,3.859,0,0,0-.082,5.389c-.717-.689-.692-2.117.025-3.465a.668.668,0,0,1,.746-.273c.025,0,.054.029.082.029a1,1,0,0,0,.276.026A1.056,1.056,0,0,0,7.21,14.425a.945.945,0,0,0-.3-.689c1.377-.907,2.947-1.017,3.61-.412h.025A3.852,3.852,0,0,0,5.145,13.846Zm15.872,8.163a3.865,3.865,0,0,0-.082,5.389c-.717-.689-.688-2.117.029-3.465a.668.668,0,0,1,.746-.273c.025,0,.054.026.082.026a.887.887,0,0,0,.276.029,1.057,1.057,0,0,0,1.018-1.126.936.936,0,0,0-.3-.689c1.38-.907,2.95-1.017,3.61-.412h.029A3.829,3.829,0,0,0,21.017,22.009Z\" style=\"fill:#fff\"/>",
	},
	"SQF": {
		colour: "#c2c2c2",
		icon: "<path d=\"M25,23.5H7a5.015,5.015,0,0,1-5-5v-6a5.015,5.015,0,0,1,5-5H25a5.015,5.015,0,0,1,5,5v6a5.015,5.015,0,0,1-5,5Z\"/><path d=\"M7,19.461a4.81,4.81,0,0,1-1.414-.2,5.052,5.052,0,0,1-1.111-.472l-.4.432h-.5L3.5,16.052H4a8.462,8.462,0,0,0,.431.953,4.638,4.638,0,0,0,.606.9,3.177,3.177,0,0,0,.8.675,1.985,1.985,0,0,0,1.029.26,1.672,1.672,0,0,0,1.216-.411A1.382,1.382,0,0,0,8.5,17.391a1.156,1.156,0,0,0-.359-.862,2.945,2.945,0,0,0-1.111-.6q-.49-.167-.9-.31t-.773-.292a2.58,2.58,0,0,1-1.239-1.007,2.73,2.73,0,0,1-.405-1.465,2.406,2.406,0,0,1,.21-.986,2.608,2.608,0,0,1,.612-.85,2.967,2.967,0,0,1,.985-.575,3.722,3.722,0,0,1,1.306-.223,3.984,3.984,0,0,1,1.288.2,5.151,5.151,0,0,1,.944.408l.356-.37h.507l.047,2.988h-.5q-.175-.483-.411-.987a4.332,4.332,0,0,0-.5-.839,2.3,2.3,0,0,0-.659-.573,1.729,1.729,0,0,0-.875-.214A1.437,1.437,0,0,0,6,11.212a1.233,1.233,0,0,0-.4.934,1.141,1.141,0,0,0,.347.86,2.951,2.951,0,0,0,1.082.588q.431.154.88.309t.8.3a2.885,2.885,0,0,1,1.286.955,2.512,2.512,0,0,1,.44,1.512,2.632,2.632,0,0,1-.927,1.985,3.367,3.367,0,0,1-1.079.6A4.391,4.391,0,0,1,7,19.461Z\" style=\"fill:#c2c2c2\"/><path d=\"M18.921,11.434a4.338,4.338,0,0,1,.971,1.432,4.834,4.834,0,0,1,.359,1.914,4.958,4.958,0,0,1-.72,2.68,4.036,4.036,0,0,1-2.038,1.661,2.151,2.151,0,0,0,.42,1.272,1.168,1.168,0,0,0,.95.537,3.563,3.563,0,0,0,.592-.043q.254-.043.458-.1v.543a5.753,5.753,0,0,1-.985.3,6.054,6.054,0,0,1-1.37.151,2.206,2.206,0,0,1-1.612-.621,2.574,2.574,0,0,1-.708-1.732A4.579,4.579,0,0,1,13.7,19a4.186,4.186,0,0,1-1.253-.932,4.388,4.388,0,0,1-.842-1.377,4.769,4.769,0,0,1-.312-1.753,5.237,5.237,0,0,1,.347-1.948,4.5,4.5,0,0,1,.953-1.5,4.119,4.119,0,0,1,1.425-.942,4.86,4.86,0,0,1,3.5-.009A4.247,4.247,0,0,1,18.921,11.434Zm-1.5,6.266a4.857,4.857,0,0,0,.379-1.273,9.981,9.981,0,0,0,.117-1.606,10.534,10.534,0,0,0-.1-1.48,4.936,4.936,0,0,0-.347-1.282,2.41,2.41,0,0,0-.665-.9,1.571,1.571,0,0,0-1.032-.34,1.73,1.73,0,0,0-1.6,1.06,6.634,6.634,0,0,0-.548,2.993,9.583,9.583,0,0,0,.12,1.551,4.8,4.8,0,0,0,.376,1.273,2.286,2.286,0,0,0,.665.856,1.591,1.591,0,0,0,.991.306,1.611,1.611,0,0,0,.991-.309A2.135,2.135,0,0,0,17.423,17.7Z\" style=\"fill:#c2c2c2\"/><path d=\"M28.5,12.8h-.455a3.93,3.93,0,0,0-.6-1.086,1.385,1.385,0,0,0-.812-.63c-.116-.016-.272-.031-.465-.043s-.373-.019-.535-.019H24.349v3.433h.822a1.969,1.969,0,0,0,.606-.083,1.054,1.054,0,0,0,.455-.3,1.591,1.591,0,0,0,.283-.516,2.635,2.635,0,0,0,.166-.621h.443v3.686h-.443a2.471,2.471,0,0,0-.181-.676,2.094,2.094,0,0,0-.268-.528,1.012,1.012,0,0,0-.431-.293,1.842,1.842,0,0,0-.63-.1h-.822v2.9a.842.842,0,0,0,.079.38.58.58,0,0,0,.3.256,1.87,1.87,0,0,0,.353.1q.224.046.446.071v.482h-4.46v-.482l.449-.052a1.525,1.525,0,0,0,.391-.083.547.547,0,0,0,.292-.241.842.842,0,0,0,.082-.4v-6.18a.867.867,0,0,0-.073-.367.575.575,0,0,0-.3-.262,2.341,2.341,0,0,0-.431-.136q-.268-.062-.408-.08v-.482H28.5Z\" style=\"fill:#c2c2c2\"/>",
	},
	"SQF: Status Quo Function (Arma 3)": {
		colour: "#c2c2c2",
		icon: "<path d=\"M25,23.5H7a5.015,5.015,0,0,1-5-5v-6a5.015,5.015,0,0,1,5-5H25a5.015,5.015,0,0,1,5,5v6a5.015,5.015,0,0,1-5,5Z\"/><path d=\"M7,19.461a4.81,4.81,0,0,1-1.414-.2,5.052,5.052,0,0,1-1.111-.472l-.4.432h-.5L3.5,16.052H4a8.462,8.462,0,0,0,.431.953,4.638,4.638,0,0,0,.606.9,3.177,3.177,0,0,0,.8.675,1.985,1.985,0,0,0,1.029.26,1.672,1.672,0,0,0,1.216-.411A1.382,1.382,0,0,0,8.5,17.391a1.156,1.156,0,0,0-.359-.862,2.945,2.945,0,0,0-1.111-.6q-.49-.167-.9-.31t-.773-.292a2.58,2.58,0,0,1-1.239-1.007,2.73,2.73,0,0,1-.405-1.465,2.406,2.406,0,0,1,.21-.986,2.608,2.608,0,0,1,.612-.85,2.967,2.967,0,0,1,.985-.575,3.722,3.722,0,0,1,1.306-.223,3.984,3.984,0,0,1,1.288.2,5.151,5.151,0,0,1,.944.408l.356-.37h.507l.047,2.988h-.5q-.175-.483-.411-.987a4.332,4.332,0,0,0-.5-.839,2.3,2.3,0,0,0-.659-.573,1.729,1.729,0,0,0-.875-.214A1.437,1.437,0,0,0,6,11.212a1.233,1.233,0,0,0-.4.934,1.141,1.141,0,0,0,.347.86,2.951,2.951,0,0,0,1.082.588q.431.154.88.309t.8.3a2.885,2.885,0,0,1,1.286.955,2.512,2.512,0,0,1,.44,1.512,2.632,2.632,0,0,1-.927,1.985,3.367,3.367,0,0,1-1.079.6A4.391,4.391,0,0,1,7,19.461Z\" style=\"fill:#c2c2c2\"/><path d=\"M18.921,11.434a4.338,4.338,0,0,1,.971,1.432,4.834,4.834,0,0,1,.359,1.914,4.958,4.958,0,0,1-.72,2.68,4.036,4.036,0,0,1-2.038,1.661,2.151,2.151,0,0,0,.42,1.272,1.168,1.168,0,0,0,.95.537,3.563,3.563,0,0,0,.592-.043q.254-.043.458-.1v.543a5.753,5.753,0,0,1-.985.3,6.054,6.054,0,0,1-1.37.151,2.206,2.206,0,0,1-1.612-.621,2.574,2.574,0,0,1-.708-1.732A4.579,4.579,0,0,1,13.7,19a4.186,4.186,0,0,1-1.253-.932,4.388,4.388,0,0,1-.842-1.377,4.769,4.769,0,0,1-.312-1.753,5.237,5.237,0,0,1,.347-1.948,4.5,4.5,0,0,1,.953-1.5,4.119,4.119,0,0,1,1.425-.942,4.86,4.86,0,0,1,3.5-.009A4.247,4.247,0,0,1,18.921,11.434Zm-1.5,6.266a4.857,4.857,0,0,0,.379-1.273,9.981,9.981,0,0,0,.117-1.606,10.534,10.534,0,0,0-.1-1.48,4.936,4.936,0,0,0-.347-1.282,2.41,2.41,0,0,0-.665-.9,1.571,1.571,0,0,0-1.032-.34,1.73,1.73,0,0,0-1.6,1.06,6.634,6.634,0,0,0-.548,2.993,9.583,9.583,0,0,0,.12,1.551,4.8,4.8,0,0,0,.376,1.273,2.286,2.286,0,0,0,.665.856,1.591,1.591,0,0,0,.991.306,1.611,1.611,0,0,0,.991-.309A2.135,2.135,0,0,0,17.423,17.7Z\" style=\"fill:#c2c2c2\"/><path d=\"M28.5,12.8h-.455a3.93,3.93,0,0,0-.6-1.086,1.385,1.385,0,0,0-.812-.63c-.116-.016-.272-.031-.465-.043s-.373-.019-.535-.019H24.349v3.433h.822a1.969,1.969,0,0,0,.606-.083,1.054,1.054,0,0,0,.455-.3,1.591,1.591,0,0,0,.283-.516,2.635,2.635,0,0,0,.166-.621h.443v3.686h-.443a2.471,2.471,0,0,0-.181-.676,2.094,2.094,0,0,0-.268-.528,1.012,1.012,0,0,0-.431-.293,1.842,1.842,0,0,0-.63-.1h-.822v2.9a.842.842,0,0,0,.079.38.58.58,0,0,0,.3.256,1.87,1.87,0,0,0,.353.1q.224.046.446.071v.482h-4.46v-.482l.449-.052a1.525,1.525,0,0,0,.391-.083.547.547,0,0,0,.292-.241.842.842,0,0,0,.082-.4v-6.18a.867.867,0,0,0-.073-.367.575.575,0,0,0-.3-.262,2.341,2.341,0,0,0-.431-.136q-.268-.062-.408-.08v-.482H28.5Z\" style=\"fill:#c2c2c2\"/>",
	},
	"SQL": {
		colour: "#ffda44",
		icon: "<path d=\"M8.562,15.256A21.159,21.159,0,0,0,16,16.449a21.159,21.159,0,0,0,7.438-1.194c1.864-.727,2.525-1.535,2.525-2V9.7a10.357,10.357,0,0,1-2.084,1.076A22.293,22.293,0,0,1,16,12.078a22.36,22.36,0,0,1-7.879-1.3A10.28,10.28,0,0,1,6.037,9.7v3.55C6.037,13.724,6.7,14.528,8.562,15.256Z\" style=\"fill:#ffda44\"/><path d=\"M8.562,21.961a15.611,15.611,0,0,0,2.6.741A24.9,24.9,0,0,0,16,23.155a24.9,24.9,0,0,0,4.838-.452,15.614,15.614,0,0,0,2.6-.741c1.864-.727,2.525-1.535,2.525-2v-3.39a10.706,10.706,0,0,1-1.692.825A23.49,23.49,0,0,1,16,18.74a23.49,23.49,0,0,1-8.271-1.348,10.829,10.829,0,0,1-1.692-.825V19.96C6.037,20.426,6.7,21.231,8.562,21.961Z\" style=\"fill:#ffda44\"/><path d=\"M16,30c5.5,0,9.963-1.744,9.963-3.894V23.269a10.5,10.5,0,0,1-1.535.762l-.157.063A23.487,23.487,0,0,1,16,25.445a23.422,23.422,0,0,1-8.271-1.351c-.054-.02-.106-.043-.157-.063a10.5,10.5,0,0,1-1.535-.762v2.837C6.037,28.256,10.5,30,16,30Z\" style=\"fill:#ffda44\"/><ellipse cx=\"16\" cy=\"5.894\" rx=\"9.963\" ry=\"3.894\" style=\"fill:#ffda44\"/>",
		inlineComment: [
			"--",
		],
	},
	"Squirrel": {
		colour: "#a05a2c",
		icon: "<path d=\"M12.966,27.3a18.926,18.926,0,0,1-5.707-.915c-1.832-.592-4.044-1.54-4.931-3.645a.557.557,0,0,1-.025-.073,12.214,12.214,0,0,1,.763-7.531c1.522-4.008,3.71-6.739,6.5-8.116a10.422,10.422,0,0,1,7.6-.55,10.426,10.426,0,0,1,6.04,4.639,11.057,11.057,0,0,1,1.058,2.326,10.66,10.66,0,0,1-5.378,12.689l-.02.009A14.832,14.832,0,0,1,12.966,27.3Z\"/><path d=\"M22.72,11.393a10.144,10.144,0,0,0-12.9-3.869C6.7,9.061,4.784,12.2,3.593,15.334a11.9,11.9,0,0,0-.746,7.187c.783,1.86,2.779,2.744,4.582,3.327a16.206,16.206,0,0,0,11.213-.232A10.11,10.11,0,0,0,23.727,13.6,10.488,10.488,0,0,0,22.72,11.393Z\" style=\"fill:#a05a2c\"/><path d=\"M15.782,6.72A8.263,8.263,0,0,1,17.64,8.084,9.65,9.65,0,0,1,19.08,9.8a9.317,9.317,0,0,1-1.531,11.921A14.933,14.933,0,0,1,7.656,24.7a7.581,7.581,0,0,1-4.135-1.1,8.454,8.454,0,0,0,3.907,2.241,16.208,16.208,0,0,0,11.214-.233A10.112,10.112,0,0,0,23.727,13.6a10.487,10.487,0,0,0-1.007-2.211A9.973,9.973,0,0,0,15.782,6.72Z\" style=\"fill-opacity:0.3137255012989044\"/><path d=\"M23.476,13.389l-1.062-2.895.152-.236A6.875,6.875,0,0,1,27.509,7.7a2.177,2.177,0,0,1,1.879.588,3.376,3.376,0,0,1,.1,3.729c-.343.292-.751.124-1.222-.07a2.821,2.821,0,0,0-2.133-.27,10.2,10.2,0,0,0-2.047,1.209Z\"/><path d=\"M23.039,10.563c1.223-1.9,5.107-2.915,5.912-1.923a2.97,2.97,0,0,1,.177,2.945c-.245.207-1.837-1.059-3.225-.423A10.574,10.574,0,0,0,23.73,12.45Z\" style=\"fill:#502d16\"/><path d=\"M29.4,9.727a.8.8,0,0,1-.2.469c-.229.162-1.9-.506-3.238.056a12.439,12.439,0,0,0-2.071,1.07L23.2,10.34c-.057.074-.116.147-.165.223l.692,1.886A10.577,10.577,0,0,1,25.9,11.162c1.388-.636,2.98.631,3.225.423A2.846,2.846,0,0,0,29.4,9.727Z\" style=\"fill-opacity:0.3137255012989044\"/><path d=\"M21.382,25.18a2.236,2.236,0,0,1-1.147-.323.563.563,0,0,1-.082-.888c.737-.684.607-2.173-.41-4.689a36.526,36.526,0,0,0-5.123-8.825l-.35-.43c-1.512-1.865-2.358-2.815-3.554-2.3a.562.562,0,0,1-.413.016.571.571,0,0,1-.377-.592,2.119,2.119,0,0,1,1.461-2c4.716-1.481,10.26.814,12.905,5.344a11.2,11.2,0,0,1-1.431,13.991A1.919,1.919,0,0,1,21.382,25.18Z\"/><path d=\"M23.812,10.783c-2.444-4.192-7.73-6.528-12.27-5.093-1.007.248-1.065,1.535-1.052,1.517,1.776-.767,2.953.919,4.566,2.89a36.9,36.9,0,0,1,5.209,8.971c.89,2.2,1.4,4.267.27,5.312a1.5,1.5,0,0,0,1.909-.274A10.646,10.646,0,0,0,23.812,10.783Z\" style=\"fill:#502d16\"/><path d=\"M23.649,10.346a9.314,9.314,0,0,1-2.518,7.725c-.455.486-.873.177-1.263.063.138.313.271.626.4.936.89,2.2,1.4,4.266.271,5.312a1.5,1.5,0,0,0,1.909-.274C26.089,20.183,26.357,14.919,23.649,10.346Z\" style=\"fill-opacity:0.3137255012989044\"/>",
	},
	"Stan": {
		colour: "#b2001d",
		icon: "<title>file_type_stan</title><path d=\"M16,2A14,14,0,0,0,5.688,25.469c1.7-.514,3.411-.992,4.806-1.357,4.037-1.054,10.948-2.836,11.946-5.082-.28.78-1.218,2.87-1.218,2.87-1.279,1.247-7.09,2.631-10.917,3.367-1.22.235-2.614.507-4.026.806A14,14,0,0,0,28.467,9.628c-2.526.408-10.5,1.854-12.539,2.315-2.255.509-6.789,1.433-7.694,2.993C8.8,13.5,10.492,9.744,10.492,9.744c1.216-2,6.6-3.425,10.358-4.463.876-.242,1.922-.539,3.023-.858A13.934,13.934,0,0,0,16,2Z\" style=\"fill:#b2001d\"/><path d=\"M8.223,14.987c-.252,1.175,3.52,2.313,6.921,3.389a26.362,26.362,0,0,1,5.667,2.192,3.085,3.085,0,0,0,1.662-1.614c.377-1.489-3.013-3.393-5.274-4.229a33.337,33.337,0,0,1-4.407-2.042c-4.316,1.143-4.569,2.3-4.569,2.3Z\" style=\"fill:#590815\"/>",
		inlineComment: [
			"#",
		],
	},
	"Stata Ado": {
		colour: "#3c6e8f",
		icon: "<defs><linearGradient id=\"a\" x1=\"16\" y1=\"2\" x2=\"16\" y2=\"30\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#8aa7c0\"/><stop offset=\"1\" stop-color=\"#3c6e8f\"/></linearGradient></defs><title>file_type_stata</title><rect x=\"2\" y=\"2\" width=\"28\" height=\"28\" rx=\"1.556\" ry=\"1.556\" style=\"fill:url(#a)\"/><rect x=\"13.171\" y=\"6.015\" width=\"5.756\" height=\"5.756\" style=\"fill:#fff\"/><rect x=\"20.326\" y=\"6.015\" width=\"5.756\" height=\"5.756\" style=\"fill:#fff\"/><rect x=\"20.326\" y=\"13.171\" width=\"5.756\" height=\"5.756\" style=\"fill:#fff\"/><rect x=\"13.171\" y=\"13.171\" width=\"5.756\" height=\"5.756\" style=\"fill:#fff\"/><rect x=\"6.015\" y=\"13.171\" width=\"5.756\" height=\"5.756\" style=\"fill:#fff\"/><rect x=\"6.015\" y=\"20.326\" width=\"5.756\" height=\"5.756\" style=\"fill:#fff\"/><rect x=\"13.171\" y=\"20.326\" width=\"5.756\" height=\"5.756\" style=\"fill:#fff\"/>",
	},
	"Stylus": {
		colour: "#c2c2c2",
		icon: "<title>file_type_stylus</title><path d=\"M6.315,20.776c.726-.869.812-1.766.249-3.432-.356-1.054-.947-1.865-.513-2.521.463-.7,1.445-.021.627.911l.164.114c.983.114,1.467-1.232.733-1.616-1.937-1.011-3.631.933-2.884,3.183.32.954.769,1.965.406,2.77A1.794,1.794,0,0,1,3.773,21.3c-.847.043-.285-1.9.691-2.385.085-.043.206-.1.093-.242a2.134,2.134,0,0,0-2.314,1.2C1.061,22.121,4.485,22.954,6.315,20.776Z\" style=\"fill:#c2c2c2\"/><path d=\"M27.462,14.14c.278.684.7,1.36.449,1.958-.206.513-.477.726-.776.776-.42.071-.306-1.246.413-1.638.064-.036.157-.206.071-.306a1.636,1.636,0,0,0-1.7.961c-.8,1.687,1.823,2.15,3.112.491.513-.662.534-1.317.043-2.506-.313-.755-.79-1.317-.491-1.816.32-.527,1.089-.071.513.634l.128.071c.748.043,1.054-.954.484-1.2A1.834,1.834,0,0,0,27.462,14.14Z\" style=\"fill:#c2c2c2\"/><path d=\"M17.95,12.338c-.52-.413-1.979.278-2.392,1.3a16.213,16.213,0,0,1-2.043,4.037c-.8.876-.876.2-.8-.306A15.327,15.327,0,0,1,14.7,12.652c-.235-.349-1.773-.3-2.841,1.36-.4.627-1.31,2.713-2.321,4.358-.221.356-.5.107-.285-.726a39.8,39.8,0,0,1,1.873-5.682,39.072,39.072,0,0,1,6.921-.819c.263-.071.441-.306,0-.32a46.778,46.778,0,0,0-6.593.441,4.923,4.923,0,0,1,1.445-1.944,1.787,1.787,0,0,0-2.264.719,12.287,12.287,0,0,0-.819,1.453,24.194,24.194,0,0,0-3.98.862c-.783.3-.7,1.246-.221,1.068a31.631,31.631,0,0,1,3.816-1.1,30.292,30.292,0,0,0-1.865,5.682c-.441,2.492,1.1,2.478,1.858,1.5.819-1.075,2.528-4.856,2.791-5.255.078-.135.185-.064.128.057-1.908,3.809-1.744,5.283-.2,4.956a4.929,4.929,0,0,0,2.214-1.965c.064-.15.2-.135.171-.071-1.21,3.14-2.748,5.682-3.781,6.479-.94.719-1.638-.84,1.687-3.076.491-.335.263-.79-.292-.634h0a29.793,29.793,0,0,0-8.786,3.325c-.164.114-.313.206-.306.441.007.135.242.085.356.014A22.771,22.771,0,0,1,11.1,20.9a.158.158,0,0,0,.114.007c.121-.028.114.036.036.085-.178.1-.356.192-.4.206-1.766.691-2.834,2.214-2.456,2.99.32.669,2.051.427,2.869-.014,2.008-1.089,3.468-3.225,4.464-6.173C16.6,15.386,17.693,12.424,17.95,12.338Z\" style=\"fill:#c2c2c2\"/><path d=\"M29.62,18.369a48.145,48.145,0,0,0-13.429.968c-.926.242-.669.733-.2.641.007,0,.206-.05.214-.05a42.279,42.279,0,0,1,12.375-.242C29.014,19.765,30.317,18.462,29.62,18.369Z\" style=\"fill:#c2c2c2\"/><path d=\"M18.861,17.985c.911-.456,2.264-3.275,3.154-4.82.064-.114.178-.021.114.057-2.25,3.873-1.3,4.322-.406,4.265,1.189-.071,2.286-1.78,2.528-2.165.1-.15.157-.028.1.078-.057.178-.263.491-.456.919-.271.605.014.84.249.947.37.178,1.381.064,1.538-.555-1.011-.021,1.41-4.792,1.659-5.084a1.718,1.718,0,0,0-2.2.975c-1.018,2.015-1.873,3.638-2.407,3.667-1.04.057,1.2-4.493,1.559-4.635-.221-.32-1.638-.185-2.428,1.04-.285.441-2.022,3.517-2.449,4.023-.755.9-.812.128-.6-.769a10.569,10.569,0,0,1,.349-1.132,5.324,5.324,0,0,1,1.36-1.844c2.2-2.442,3.46-4.422,2.962-5.2-.441-.691-1.915-.384-2.862,1.04-1.744,2.613-3.354,6.195-3.56,7.832S18.056,18.383,18.861,17.985Zm.926-4.792c.078-.178.128-.228.263-.527h0A24.934,24.934,0,0,1,22.492,8.28c.42-.441,1.011.157-.057,1.794a16.462,16.462,0,0,1-2.115,2.642v.007c-.2.221-.377.406-.456.513C19.808,13.307,19.744,13.292,19.787,13.193Z\" style=\"fill:#c2c2c2\"/>",
	},
	"SVG": {
		colour: "#ffb13b",
		icon: "<path d=\"M7.674,14.488a2.218,2.218,0,1,0,0,3.137H24.326a2.218,2.218,0,1,0,0-3.137Z\" style=\"fill:#ffb13b;stroke:#000;stroke-width:3.73000001907349px\"/><path d=\"M11.222,9.06A2.218,2.218,0,1,0,9,11.278L20.778,23.052A2.218,2.218,0,1,0,23,20.834Z\" style=\"fill:#ffb13b;stroke:#000;stroke-width:3.73000001907349px\"/><path d=\"M17.568,7.73a2.218,2.218,0,1,0-3.137,0V24.382a2.218,2.218,0,1,0,3.137,0Z\" style=\"fill:#ffb13b;stroke:#000;stroke-width:3.73000001907349px\"/><path d=\"M23,11.278A2.218,2.218,0,1,0,20.778,9.06L9,20.834a2.218,2.218,0,1,0,2.218,2.218Z\" style=\"fill:#ffb13b;stroke:#000;stroke-width:3.73000001907349px\"/><path d=\"M7.674,14.488a2.218,2.218,0,1,0,0,3.137H24.326a2.218,2.218,0,1,0,0-3.137Z\" style=\"fill:#ffb13b\"/><path d=\"M11.222,9.06A2.218,2.218,0,1,0,9,11.278L20.778,23.052A2.218,2.218,0,1,0,23,20.834Z\" style=\"fill:#ffb13b\"/><path d=\"M17.568,7.73a2.218,2.218,0,1,0-3.137,0V24.382a2.218,2.218,0,1,0,3.137,0Z\" style=\"fill:#ffb13b\"/><path d=\"M23,11.278A2.218,2.218,0,1,0,20.778,9.06L9,20.834a2.218,2.218,0,1,0,2.218,2.218Z\" style=\"fill:#ffb13b\"/><path d=\"M2,16.056H30V25.95a4.035,4.035,0,0,1-4.106,4.106H6.106A4.035,4.035,0,0,1,2,25.95Z\"/><path d=\"M6.2,23.045A3.628,3.628,0,1,1,12.4,20.48H10.27A1.5,1.5,0,1,0,7.7,21.541h0a1.6,1.6,0,0,0,1.062.441h0a4.118,4.118,0,0,1,2.566,1.063h0a3.628,3.628,0,1,1-6.194,2.565H7.264A1.5,1.5,0,1,0,9.83,24.55h0a1.948,1.948,0,0,0-1.063-.44h0A4.465,4.465,0,0,1,6.2,23.045Z\" style=\"fill:#fff\"/><path d=\"M19.651,16.852,17.085,29.24H14.96L12.4,16.852H14.52l1.5,7.255,1.5-7.255Z\" style=\"fill:#fff\"/><path d=\"M23.28,21.983h3.628v3.628h0a3.628,3.628,0,1,1-7.257,0h0V20.48h0a3.628,3.628,0,0,1,7.257,0H24.783a1.5,1.5,0,1,0-3.005,0v5.13h0a1.5,1.5,0,0,0,3.005,0h0v-1.5h-1.5V21.983Z\" style=\"fill:#fff\"/>",
	},
	"Swift": {
		colour: "#FA5D2D",
		icon: "<defs><linearGradient id=\"a\" x1=\"-134.494\" y1=\"-171.82\" x2=\"-134.497\" y2=\"-171.89\" gradientTransform=\"matrix(240, 0, 0, -205.6, 32295, -35312.585)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#f88535\"/><stop offset=\"1\" stop-color=\"#fd2221\"/></linearGradient></defs><title>file_type_swift</title><path d=\"M19.422,4.007s6.217,3.554,7.844,9.2c1.466,5.1.292,7.534.292,7.534a8.915,8.915,0,0,1,1.742,2.8,4.825,4.825,0,0,1,.29,4.453s-.1-2.08-3.2-2.511c-2.841-.4-3.874,2.366-9.3,2.232A18.435,18.435,0,0,1,2,19.354C4.651,20.8,8.124,23.045,12.449,22.7s5.228-1.674,5.228-1.674A66.9,66.9,0,0,1,4.891,7.643c3.4,2.845,11.822,8.507,11.626,8.363A75.826,75.826,0,0,1,8.092,6.24S20.728,16.629,21.745,16.563c.418-.861,2.579-5.318-2.324-12.557Z\" style=\"fill:url(#a)\"/>",
		inlineComment: [
			"//",
		],
	},
	"Systemd configuration file": {
		colour: "#30d475",
		icon: "<path d=\"M2,12v8H5.256V18.769H3.3V13.231H5.256V12Z\" style=\"fill:#d2d2d2\"/><path d=\"M26.744,12v1.231H28.7v5.538H26.744V20H30V12Z\" style=\"fill:#d2d2d2\"/><path d=\"M17.628,16l5.21-2.769v5.538Z\" style=\"fill:#30d475\"/><ellipse cx=\"12.093\" cy=\"16\" rx=\"2.93\" ry=\"2.769\" style=\"fill:#30d475\"/>",
	},
	"T4 templating": {
		colour: "#1e88e5",
		icon: "<path d=\"M19.545,6.035H13.27V24H8.3V6.035H2.055V2h17.49Z\" style=\"fill:#1e88e5\"/><path d=\"M27.567,10V22.608h2.4V25.9h-2.4V30H23.551V25.9H14.834V22.455q1.158-1.3,2.4-2.838t2.4-3.173q1.158-1.632,2.155-3.285A32.925,32.925,0,0,0,23.481,10ZM18.781,22.608h4.77V15.621q-.488.907-1.06,1.834t-1.2,1.827q-.628.9-1.269,1.743T18.781,22.608Z\" style=\"fill:#1e88e5\"/>",
	},
	"T4 Text Templates (C#)": {
		colour: "#1e88e5",
		icon: "<path d=\"M19.545,6.035H13.27V24H8.3V6.035H2.055V2h17.49Z\" style=\"fill:#1e88e5\"/><path d=\"M27.567,10V22.608h2.4V25.9h-2.4V30H23.551V25.9H14.834V22.455q1.158-1.3,2.4-2.838t2.4-3.173q1.158-1.632,2.155-3.285A32.925,32.925,0,0,0,23.481,10ZM18.781,22.608h4.77V15.621q-.488.907-1.06,1.834t-1.2,1.827q-.628.9-1.269,1.743T18.781,22.608Z\" style=\"fill:#1e88e5\"/>",
	},
	"T4 Text Templates (VB)": {
		colour: "#1e88e5",
		icon: "<path d=\"M19.545,6.035H13.27V24H8.3V6.035H2.055V2h17.49Z\" style=\"fill:#1e88e5\"/><path d=\"M27.567,10V22.608h2.4V25.9h-2.4V30H23.551V25.9H14.834V22.455q1.158-1.3,2.4-2.838t2.4-3.173q1.158-1.632,2.155-3.285A32.925,32.925,0,0,0,23.481,10ZM18.781,22.608h4.77V15.621q-.488.907-1.06,1.834t-1.2,1.827q-.628.9-1.269,1.743T18.781,22.608Z\" style=\"fill:#1e88e5\"/>",
	},
	"Tcl": {
		colour: "#eff1cb",
		icon: "<path d=\"M21.942,2.876c.04,2.468-.033,4.91-2.169,7.23l-.079.089h.119l.873.013c-1.418,2.95-2.341,5.892-4.38,8.83l-.073.106.126-.023,1.078-.2a5.851,5.851,0,0,1-3.484,3.65c-.39-5.455,2.333-10.27,4.645-15.071l.007-.013-.086-.06c-3.786,4.233-5.491,10.2-6.136,15.127a4.582,4.582,0,0,1-2.145-2.988l.9.377.093.04-.02-.1c-.681-3.028.376-5.2,1.4-8.056l.737.493.086.06,0-.1c-.058-2.32,1.5-4.649,3.577-6.727l.288.77.04.1.056-.1.631-1.051,0-.007A6.1,6.1,0,0,1,21.942,2.876Z\" style=\"fill:#c3b15f\"/><path d=\"M21.948,2.875a6.131,6.131,0,0,0-3.926,2.388l0,.007-.631,1.051-.056.1-.04-.1L17,5.544c-2.072,2.078-3.635,4.407-3.577,6.727l0,.1-.086-.06-.737-.493c-1.025,2.856-2.083,5.029-1.4,8.056l.02.1-.093-.04-.886-.374c0,.018.007.035.01.053a4.533,4.533,0,0,0,2.126,2.932c.05-.381.105-.771.169-1.164-1.543-3.614-.2-6.271.407-8.661l.939.542c-.13-2.238,1.184-4.651,2.893-6.757l.5.873C18.555,4.769,19.56,3.72,21.948,2.875Z\" style=\"fill:#eff1cb;stroke:#eff1cb\"/><path d=\"M22.518,2l-.056.01c-2.082.363-4.121,1.128-5.015,2.959l-.377-.658-.033-.06-.05.05a20.85,20.85,0,0,0-2.939,3.5A5.939,5.939,0,0,0,12.835,11l-.532-.664-.053-.066-.036.076a27.535,27.535,0,0,0-1.693,4.7,6.73,6.73,0,0,0-.159,3.719l-.876-.509-.073-.043-.007.086a5.529,5.529,0,0,0,2.017,4.843l-.972.241-.2.05.2.053a4.258,4.258,0,0,1,1.455.6,1.325,1.325,0,0,1,.516,1.3V28.1l.01.013,1.217,1.745.1.139V25.719a3.466,3.466,0,0,1,.621-1.484A1.639,1.639,0,0,1,15.5,23.7l.182-.023-.165-.076-.641-.3a9.112,9.112,0,0,0,3.693-5.322l.02-.086-.083.023-.793.215a11.669,11.669,0,0,0,2.089-3.5C20.512,13,21.18,11.166,21.728,9.7l.03-.079-.083.007-.612.043a6.655,6.655,0,0,0,1.382-3.527,17.039,17.039,0,0,0,.079-4.086Zm-.575.876c.04,2.468-.033,4.91-2.169,7.23l-.079.089h.119l.873.013c-1.418,2.95-2.341,5.892-4.38,8.83l-.073.106.126-.023,1.078-.2a5.851,5.851,0,0,1-3.484,3.65c-.39-5.455,2.333-10.27,4.645-15.071l.007-.013-.086-.06c-3.786,4.233-5.491,10.2-6.136,15.127a4.582,4.582,0,0,1-2.145-2.988l.9.377.093.04-.02-.1c-.681-3.028.376-5.2,1.4-8.056l.737.493.086.06,0-.1c-.058-2.32,1.5-4.649,3.577-6.727l.288.77.04.1.056-.1.631-1.051,0-.007A6.1,6.1,0,0,1,21.942,2.876Z\"/>",
	},
	"Template Toolkit 2": {
		colour: "#3bcefc",
		icon: "<path d=\"M8.907,23.021H8.878a3.305,3.305,0,0,1-2.011-.661A2.561,2.561,0,0,1,5.83,20.334V16.1H4.288a3.05,3.05,0,0,1-2.738-1.69,3.3,3.3,0,0,1,.441-3.53,2.265,2.265,0,0,1,1.815-.9h9.65a3.05,3.05,0,0,1,2.738,1.69,3.3,3.3,0,0,1-.441,3.53,2.265,2.265,0,0,1-1.815.9H11.955v4.231a2.561,2.561,0,0,1-1.037,2.026A3.305,3.305,0,0,1,8.907,23.021ZM4.264,11.636a1.39,1.39,0,0,0-1.388,1.388v.033a1.39,1.39,0,0,0,1.388,1.388H7.487v5.881c0,.572.624,1.037,1.39,1.037h.029c.767,0,1.39-.465,1.39-1.037V14.446h3.223a1.39,1.39,0,0,0,1.388-1.388v-.033a1.39,1.39,0,0,0-1.388-1.388Z\" style=\"fill:#015d9a\"/><path d=\"M14.981,12.953v.033a1.533,1.533,0,0,1-1.533,1.533H10.37v5.737a1.393,1.393,0,0,1-1.535,1.181H8.806a1.393,1.393,0,0,1-1.535-1.181V14.518H4.192A1.533,1.533,0,0,1,2.66,12.986v-.033A1.533,1.533,0,0,1,4.192,11.42h9.257A1.533,1.533,0,0,1,14.981,12.953Zm-4.223,9.222a2.418,2.418,0,0,0,.98-1.912V15.888h2.127a2.114,2.114,0,0,0,1.7-.846,2.992,2.992,0,0,0-2.18-4.99H3.735a2.114,2.114,0,0,0-1.7.846,2.992,2.992,0,0,0,2.18,4.99H5.9v4.375a2.418,2.418,0,0,0,.98,1.912,3.16,3.16,0,0,0,1.923.631h.029A3.16,3.16,0,0,0,10.758,22.174Z\" style=\"fill:#3bcefc\"/><path d=\"M23.607,23.021h-.029a3.305,3.305,0,0,1-2.011-.661,2.561,2.561,0,0,1-1.037-2.026V16.1H18.988a3.05,3.05,0,0,1-2.738-1.69,3.3,3.3,0,0,1,.441-3.53,2.265,2.265,0,0,1,1.815-.9h9.65a3.05,3.05,0,0,1,2.738,1.69,3.3,3.3,0,0,1-.441,3.53,2.265,2.265,0,0,1-1.815.9H26.655v4.231a2.561,2.561,0,0,1-1.037,2.026A3.305,3.305,0,0,1,23.607,23.021ZM18.964,11.636a1.39,1.39,0,0,0-1.388,1.388v.033a1.39,1.39,0,0,0,1.388,1.388h3.223v5.881c0,.572.624,1.037,1.39,1.037h.029c.767,0,1.39-.465,1.39-1.037V14.446h3.223a1.39,1.39,0,0,0,1.388-1.388v-.033a1.39,1.39,0,0,0-1.388-1.388Z\" style=\"fill:#015d9a\"/><path d=\"M29.681,12.953v.033a1.533,1.533,0,0,1-1.533,1.533H25.07v5.737a1.393,1.393,0,0,1-1.535,1.181h-.029a1.393,1.393,0,0,1-1.535-1.181V14.518H18.892a1.533,1.533,0,0,1-1.533-1.533v-.033a1.533,1.533,0,0,1,1.533-1.533h9.257A1.533,1.533,0,0,1,29.681,12.953Zm-4.223,9.222a2.418,2.418,0,0,0,.98-1.912V15.888h2.127a2.114,2.114,0,0,0,1.7-.846,2.992,2.992,0,0,0-2.18-4.99h-9.65a2.114,2.114,0,0,0-1.7.846,2.992,2.992,0,0,0,2.18,4.99H20.6v4.375a2.418,2.418,0,0,0,.98,1.912,3.16,3.16,0,0,0,1.923.631h.029A3.16,3.16,0,0,0,25.458,22.174Z\" style=\"fill:#3bcefc\"/>",
	},
	"TeX": {
		colour: "#cfcfcf",
		icon: "<path d=\"M11.333,13.122c-.128-1.562-.241-2.756-2.287-2.756H7.91v8.4h2.145v.611l-3.083-.029-3.082.029v-.611H6.034v-8.4H4.884c-2.046,0-2.159,1.208-2.287,2.756H2l.284-3.367h9.362l.284,3.367h-.6Z\" style=\"fill:#cfcfcf\"/><path d=\"M19.289,22.53H10.41V21.92h1.506V13.467H10.41v-.611h8.637l.412,3.367h-.6c-.213-1.833-.682-2.756-2.855-2.756H13.791V17.2h.838c1.364,0,1.505-.6,1.505-1.662h.6v3.935h-.6c0-1.08-.142-1.662-1.505-1.662h-.838v4.106h2.216c2.472,0,3-1.108,3.3-3.225h.6Z\" style=\"fill:#cfcfcf\"/><path d=\"M27.727,19.186c-.54,0-1.96,0-2.415.029V18.6h1.179l-2.557-3.552-2.529,3.381A4.1,4.1,0,0,0,22.7,18.6v.611c-.355-.029-1.576-.029-2.017-.029-.4,0-1.548,0-1.875.029V18.6h.383a7.459,7.459,0,0,0,.824-.043c.5-.043.54-.085.667-.256L23.536,14.5l-3.153-4.418H19V9.47c.384.028,1.79.028,2.273.028.582,0,1.918,0,2.429-.028v.611H22.528l2.117,2.955,2.074-2.784a4.1,4.1,0,0,0-1.293-.17V9.47c.356.028,1.591.028,2.032.028.4,0,1.534,0,1.861-.028v.611h-.369a5.264,5.264,0,0,0-.838.043c-.469.043-.526.071-.667.256l-2.4,3.21L28.636,18.6H30v.611C29.645,19.186,28.182,19.186,27.727,19.186Z\" style=\"fill:#cfcfcf\"/>",
		inlineComment: [
			"%",
		],
	},
	"Textile": {
		colour: "#ffe7ac",
		icon: "<path d=\"M28.681,26.075H3.319A1.317,1.317,0,0,1,2,24.756V7.244A1.317,1.317,0,0,1,3.319,5.925H28.681A1.317,1.317,0,0,1,30,7.244V24.76A1.316,1.316,0,0,1,28.681,26.075Z\" style=\"fill:#ffe7ac\"/><path d=\"M6.066,12.848a4.987,4.987,0,0,1,1.508-.659V10.664a3.7,3.7,0,0,1,.743-.33,7.869,7.869,0,0,1,1.327-.347h.642v2.391h2.484V13.6H10.286v4.848a3.172,3.172,0,0,0,.29,1.609,1.07,1.07,0,0,0,.971.448,7.127,7.127,0,0,0,.76-.048,3.338,3.338,0,0,0,.782-.18l.132.62a2.388,2.388,0,0,1-.5.356,5.457,5.457,0,0,1-.752.356,5.837,5.837,0,0,1-.923.281A4.769,4.769,0,0,1,10,22a2.385,2.385,0,0,1-1.824-.637,2.947,2.947,0,0,1-.6-2.062V13.591H6.066Z\"/><path d=\"M14.607,20.453a1.447,1.447,0,0,1,.431-1.09,1.591,1.591,0,0,1,1.147-.413,1.649,1.649,0,0,1,1.165.413,1.422,1.422,0,0,1,.453,1.09,1.369,1.369,0,0,1-.453,1.081,1.692,1.692,0,0,1-1.165.4,1.61,1.61,0,0,1-1.147-.4A1.427,1.427,0,0,1,14.607,20.453Z\"/>",
	},
	"TOML": {
		colour: "#bfbfbf",
		icon: "<path d=\"M22.76,6.83v3.25h-5V25.17H14.26V10.08h-5V6.83Z\" style=\"fill:#7f7f7f\"/><path d=\"M2,2H8.2V5.09H5.34v21.8H8.2V30H2Z\" style=\"fill:#bfbfbf\"/><path d=\"M30,30H23.8V26.91h2.86V5.11H23.8V2H30Z\" style=\"fill:#bfbfbf\"/>",
	},
	"TSConfig": {
		colour: "#007acc",
		icon: "<path d=\"M23.827,8.243A4.424,4.424,0,0,1,26.05,9.524a5.853,5.853,0,0,1,.852,1.143c.011.045-1.534,1.083-2.471,1.662-.034.023-.169-.124-.322-.35a2.014,2.014,0,0,0-1.67-1c-1.077-.074-1.771.49-1.766,1.433a1.3,1.3,0,0,0,.153.666c.237.49.677.784,2.059,1.383,2.544,1.1,3.636,1.817,4.31,2.843a5.158,5.158,0,0,1,.416,4.333,4.764,4.764,0,0,1-3.932,2.815,10.9,10.9,0,0,1-2.708-.028,6.531,6.531,0,0,1-3.616-1.884,6.278,6.278,0,0,1-.926-1.371,2.655,2.655,0,0,1,.327-.208c.158-.09.756-.434,1.32-.761l1.024-.6.214.312a4.771,4.771,0,0,0,1.35,1.292,3.3,3.3,0,0,0,3.458-.175,1.545,1.545,0,0,0,.2-1.974c-.276-.4-.84-.727-2.443-1.422a8.8,8.8,0,0,1-3.349-2.055,4.687,4.687,0,0,1-.976-1.777,7.116,7.116,0,0,1-.062-2.268,4.332,4.332,0,0,1,3.644-3.374A9,9,0,0,1,23.827,8.243ZM15.484,9.726l.011,1.454h-4.63V24.328H7.6V11.183H2.97V9.755a13.986,13.986,0,0,1,.04-1.466c.017-.023,2.832-.034,6.245-.028l6.211.017Z\" style=\"fill:#007acc\"/><path d=\"M27.075,25.107l.363-.361c1.68.055,1.706,0,1.78-.177l.462-1.124.034-.107-.038-.093c-.02-.049-.081-.2-1.13-1.2v-.526c1.211-1.166,1.185-1.226,1.116-1.4l-.46-1.136c-.069-.17-.1-.237-1.763-.191l-.364-.367a8.138,8.138,0,0,0-.057-1.657l-.047-.106-1.2-.525c-.177-.081-.239-.11-1.372,1.124l-.509-.008c-1.167-1.245-1.222-1.223-1.4-1.152l-1.115.452c-.175.071-.236.1-.169,1.79l-.36.359c-1.68-.055-1.7,0-1.778.177L18.606,20l-.036.108.038.094c.02.048.078.194,1.13,1.2v.525c-1.211,1.166-1.184,1.226-1.115,1.4l.459,1.137c.07.174.1.236,1.763.192l.363.377a8.169,8.169,0,0,0,.055,1.654l.047.107,1.208.528c.176.073.236.1,1.366-1.13l.509.006c1.168,1.247,1.228,1.223,1.4,1.154l1.113-.45C27.082,26.827,27.143,26.8,27.075,25.107Zm-4.788-2.632a2,2,0,1,1,2.618,1.14A2.023,2.023,0,0,1,22.287,22.475Z\" style=\"fill:#99b8c4\"/>",
	},
	"Twig": {
		colour: "#78dc50",
		icon: "<path d=\"M4.574,5.463c.262.4,2.5-1.608,4.454-1.161,2.061.472,4.014,3.724,4.848,13.7a40.18,40.18,0,0,1,3.541,3.61q.53.614,1.013,1.22a11.847,11.847,0,0,1,.229-1.4,12.3,12.3,0,0,1,1.981-4.4A19.151,19.151,0,0,0,17.272,7.9c-1.03-1.445-4.6-6.478-8.546-5.843C6.182,2.465,4.3,5.054,4.574,5.463Z\" style=\"fill:#63bf6a\"/><path d=\"M24.4,30c-.32-2.567-.448-4.76-.5-6.449-.094-3.232.1-4.541.9-5.756.193-.295,1.288-1.975,2.58-1.863,1.466.128,2.213,2.414,2.362,2.337.175-.09-.36-3.543-2.532-4.431-2.6-1.063-6.312,2.07-7.8,5.154a12.223,12.223,0,0,0-.857,2.81,32.555,32.555,0,0,0-.71,8.2Z\" style=\"fill:#74d74d\"/><path d=\"M2.238,13.935c.145-.447,2.468-.259,4.54.293,2.5.666,7,2.344,11.651,8.606A12.544,12.544,0,0,1,20.279,30H10.386a21.875,21.875,0,0,0-.175-4.62,14.9,14.9,0,0,0-2.459-7.158C5.441,15.159,2.055,14.5,2.238,13.935Z\" style=\"fill:#78dc50\"/><path d=\"M17.3,21.323a1.753,1.753,0,1,1-.513-1.24A1.748,1.748,0,0,1,17.3,21.323Z\" style=\"fill:#fff\"/><path d=\"M21.975,21.323a1.753,1.753,0,1,1-.513-1.24A1.748,1.748,0,0,1,21.975,21.323Z\" style=\"fill:#fff\"/>",
	},
	"TypeScript": {
		colour: "#3178c6",
		icon: "<rect x=\"2\" y=\"2\" width=\"28\" height=\"28\" rx=\"1.312\" style=\"fill:#3178c6\"/><path d=\"M18.245,23.759v3.068a6.492,6.492,0,0,0,1.764.575,11.56,11.56,0,0,0,2.146.192,9.968,9.968,0,0,0,2.088-.211,5.11,5.11,0,0,0,1.735-.7,3.542,3.542,0,0,0,1.181-1.266,4.469,4.469,0,0,0,.186-3.394,3.409,3.409,0,0,0-.717-1.117,5.236,5.236,0,0,0-1.123-.877,12.027,12.027,0,0,0-1.477-.734q-.6-.249-1.08-.484a5.5,5.5,0,0,1-.813-.479,2.089,2.089,0,0,1-.516-.518,1.091,1.091,0,0,1-.181-.618,1.039,1.039,0,0,1,.162-.571,1.4,1.4,0,0,1,.459-.436,2.439,2.439,0,0,1,.726-.283,4.211,4.211,0,0,1,.956-.1,5.942,5.942,0,0,1,.808.058,6.292,6.292,0,0,1,.856.177,5.994,5.994,0,0,1,.836.3,4.657,4.657,0,0,1,.751.422V13.9a7.509,7.509,0,0,0-1.525-.4,12.426,12.426,0,0,0-1.9-.129,8.767,8.767,0,0,0-2.064.235,5.239,5.239,0,0,0-1.716.733,3.655,3.655,0,0,0-1.171,1.271,3.731,3.731,0,0,0-.431,1.845,3.588,3.588,0,0,0,.789,2.34,6,6,0,0,0,2.395,1.639q.63.26,1.175.509a6.458,6.458,0,0,1,.942.517,2.463,2.463,0,0,1,.626.585,1.2,1.2,0,0,1,.23.719,1.1,1.1,0,0,1-.144.552,1.269,1.269,0,0,1-.435.441,2.381,2.381,0,0,1-.726.292,4.377,4.377,0,0,1-1.018.105,5.773,5.773,0,0,1-1.969-.35A5.874,5.874,0,0,1,18.245,23.759Zm-5.154-7.638h4V13.594H5.938v2.527H9.92V27.375h3.171Z\" style=\"fill:#fff;fill-rule:evenodd\"/>",
		inlineComment: [
			"//",
		],
	},
	"TypoScript": {
		colour: "#ff8700",
		icon: "<path d=\"M23.093,21.3a3.847,3.847,0,0,1-1.18.165c-3.555,0-8.778-12.424-8.778-16.559,0-1.523.362-2.031.87-2.466C9.653,2.943,4.43,4.539,2.761,6.57a4.048,4.048,0,0,0-.58,2.321C2.181,15.348,9.072,30,13.933,30c2.248,0,6.041-3.7,9.16-8.7\" style=\"fill:#ff8700\"/><path d=\"M20.823,2c4.5,0,9,.725,9,3.264,0,5.151-3.264,11.389-4.933,11.389-2.974,0-6.673-8.269-6.673-12.4,0-1.886.725-2.249,2.611-2.249\" style=\"fill:#ff8700\"/>",
	},
	"V": {
		colour: "#5d87bf",
		icon: "<path d=\"M20.467,29.288,29.952,2.913a.5.5,0,0,0-.566-.728L21.927,2.9a1.464,1.464,0,0,0-1.141.9L12.007,29.006a.573.573,0,0,0,.578.813h7.26a.657.657,0,0,0,.577-.4Z\" style=\"fill:#536b8a\"/><path d=\"M2.614,2.185l7.459.719a1.466,1.466,0,0,1,1.142.9L20.18,29.413a.286.286,0,0,1-.289.406H12.585a1.311,1.311,0,0,1-1.152-.81L2.048,2.913A.5.5,0,0,1,2.614,2.185Z\" style=\"fill:#5d87bf\"/>",
	},
	"Vala": {
		colour: "#403757",
		icon: "<path d=\"M12.509,17.193c-.165-6.836-.325-12.455-.357-12.487A7.916,7.916,0,0,0,9.879,5.874,7.606,7.606,0,0,0,7.324,9.188a8.422,8.422,0,0,0-.587,3.543,4.665,4.665,0,0,0,.2,1.962,3.417,3.417,0,0,1,.182.56c-.012.009-.338-.018-.724-.061-1.868-.207-2.786-1.05-3-2.757A6.312,6.312,0,0,1,4.85,7.719a15.134,15.134,0,0,1,8.414-5.163,12.891,12.891,0,0,1,2.542-.235l1.748-.05.059,2.506c.032,1.378.1,6.358.161,11.067s-.252,8.29-.219,8.4C19.5,17.879,22,13.073,24.367,6.253l1.427-3.983H28.54c-.022.063-2.751,6.5-5.514,13.916l-5.473,13.55H12.976C12.976,27.906,12.535,18.486,12.509,17.193Z\" style=\"fill:#403757\"/><path d=\"M17.732,30H12.713v-.263c0-1.137-.17-5.192-.307-8.452-.081-1.929-.15-3.6-.161-4.087-.156-6.479-.286-11-.336-12.163a11.674,11.674,0,0,0-1.874,1.049,7.348,7.348,0,0,0-2.466,3.2A8.146,8.146,0,0,0,7,12.731,4.37,4.37,0,0,0,7.185,14.6c.215.569.273.723.1.859-.093.073-.107.084-.916-.007-1.976-.219-3-1.167-3.234-2.986A6.568,6.568,0,0,1,4.64,7.561,15.439,15.439,0,0,1,13.2,2.3,13.176,13.176,0,0,1,15.8,2.058L17.811,2l.065,2.77c.032,1.392.106,6.461.161,11.07.031,2.616-.052,4.915-.124,6.43.931-2.763,1.958-5.27,3.033-7.9,1.043-2.547,2.122-5.18,3.173-8.207l1.491-4.16h3.3l-.125.351c0,.007-.031.076-.084.2-1.1,2.622-3.259,7.889-5.43,13.717Zm-4.495-.526h4.14l5.407-13.386c2.124-5.7,4.243-10.876,5.362-13.555H25.979L24.614,6.342c-1.055,3.038-2.137,5.678-3.183,8.231-1.311,3.2-2.55,6.226-3.626,9.747l-.255.831-.248-.833a3.274,3.274,0,0,1,.021-.839c.074-1.35.229-4.158.188-7.633-.055-4.607-.129-9.674-.161-11.064L17.3,2.541l-1.484.043a12.729,12.729,0,0,0-2.49.228A14.887,14.887,0,0,0,5.06,7.877a6.071,6.071,0,0,0-1.4,4.524c.2,1.58,1.028,2.336,2.77,2.529l.333.035c-.019-.054-.041-.114-.066-.179a4.893,4.893,0,0,1-.219-2.055,8.7,8.7,0,0,1,.6-3.638,7.883,7.883,0,0,1,2.644-3.43c.022-.016,2.232-1.525,2.615-1.142.092.092.131.131.433,12.666h0c.01.485.08,2.149.16,4.076C13.06,24.313,13.217,28.06,13.237,29.474Z\" style=\"fill:#c8c8c8\"/>",
	},
	"VB.Net": {
		colour: "#00519a",
		icon: "<path d=\"M6.67,7.836,9,18.915,11.336,7.836H16L11.336,24.164H6.672L2,7.836Z\" style=\"fill:#00519a\"/><path d=\"M18.331,7.836h7.6a4.08,4.08,0,0,1,2.9,1.749,3.78,3.78,0,0,1,.571,2.04,3.985,3.985,0,0,1-.571,2.034,4.108,4.108,0,0,1-2.341,1.763,4.1,4.1,0,0,1,2.929,1.756,3.8,3.8,0,0,1,.58,2.1,4.663,4.663,0,0,1-.579,2.546,5.047,5.047,0,0,1-3.5,2.338H18.331ZM23,14.252h1.166a1.754,1.754,0,0,0,0-3.5H23Zm0,7H24.39a2.047,2.047,0,0,0,0-4.089H23Z\" style=\"fill:#00519a\"/>",
	},
	"VBA": {
		colour: "#d87b30",
		icon: "<polygon points=\"10.457 11.092 16.014 13.839 16.014 18.307 10.457 15.382 10.457 11.092\" style=\"fill:#6483c0\"/><path d=\"M16.2,18.613l-5.926-3.12V10.8L16.2,13.724ZM10.642,15.27,15.83,18V13.953l-5.188-2.564Z\"/><polygon points=\"16.371 13.839 16.371 18.307 21.315 15.814 21.315 11.354 16.371 13.839\" style=\"fill:#6483c0\"/><path d=\"M16.186,18.607V13.725l5.313-2.67v4.873Zm.369-4.655v4.055L21.13,15.7V11.653Z\"/><polygon points=\"10.703 10.797 16.186 13.58 21.082 11.064 15.777 8.389 10.703 10.797\" style=\"fill:#6483c0\"/><path d=\"M16.187,13.788l-5.9-3,5.5-2.608,5.709,2.879ZM11.122,10.8l5.064,2.57,4.49-2.308-4.9-2.471Z\"/><polygon points=\"18.957 15.829 24.515 18.575 24.515 23.043 18.957 20.118 18.957 15.829\" style=\"fill:#952781\"/><path d=\"M24.7,23.349l-5.926-3.12v-4.7L24.7,18.46Zm-5.557-3.343,5.188,2.731V18.689l-5.188-2.564Z\"/><polygon points=\"24.871 18.575 24.871 23.043 29.815 20.55 29.815 16.09 24.871 18.575\" style=\"fill:#952781\"/><path d=\"M24.687,23.343V18.461L30,15.791v4.873Zm.369-4.655v4.055l4.575-2.308V16.389Z\"/><polygon points=\"19.203 15.546 24.687 18.329 29.583 15.812 24.364 13.346 19.203 15.546\" style=\"fill:#952781\"/><path d=\"M24.687,18.536l-5.92-3.005,5.6-2.387L30,15.805ZM19.64,15.56l5.046,2.561,4.479-2.3-4.806-2.27Z\"/><polygon points=\"2.19 15.496 7.748 18.243 7.748 22.711 2.19 19.786 2.19 15.496\" style=\"fill:#d87b30\"/><path d=\"M7.932,23.017,2.006,19.9V15.2l5.926,2.929ZM2.375,19.674l5.188,2.731V18.357L2.375,15.793Z\"/><polygon points=\"8.104 18.243 8.104 22.711 13.048 20.218 13.048 15.758 8.104 18.243\" style=\"fill:#d87b30\"/><path d=\"M7.92,23.011V18.129l5.313-2.67v4.873Zm.369-4.655v4.055L12.864,20.1V16.057Z\"/><polygon points=\"2.436 15.213 7.92 17.997 12.816 15.48 7.597 13.014 2.436 15.213\" style=\"fill:#d87b30\"/><path d=\"M7.92,18.2,2,15.2l5.6-2.387,5.632,2.661ZM2.873,15.228l5.046,2.561,4.479-2.3-4.806-2.27Z\"/><polygon points=\"10.875 16.296 16.432 19.042 16.432 23.511 10.875 20.585 10.875 16.296\" style=\"fill:#e0d400\"/><path d=\"M16.617,23.816,10.691,20.7V16l5.926,2.929ZM11.06,20.474l5.188,2.731V19.157L11.06,16.593Z\"/><polygon points=\"16.789 19.042 16.789 23.511 21.733 21.017 21.733 16.557 16.789 19.042\" style=\"fill:#e0d400\"/><path d=\"M16.6,23.811V18.929l5.313-2.67v4.873Zm.369-4.655v4.055L21.549,20.9V16.857Z\"/><polygon points=\"11.121 16.001 16.605 18.784 21.501 16.267 16.196 13.593 11.121 16.001\" style=\"fill:#e0d400\"/><path d=\"M16.605,18.991l-5.9-3,5.5-2.608,5.709,2.879ZM11.54,16.006l5.064,2.57,4.49-2.308-4.9-2.471Z\"/>",
	},
	"Velocity": {
		colour: "#262692",
		icon: "<path d=\"M16.245,24.187A8.352,8.352,0,1,1,24.6,15.835,8.362,8.362,0,0,1,16.245,24.187Zm0-14.762a6.41,6.41,0,1,0,6.41,6.41A6.417,6.417,0,0,0,16.245,9.425Z\"/><polygon points=\"29.132 8.551 25.451 6.531 25.451 7.474 15.821 7.474 15.821 9.424 25.451 9.424 25.451 10.571 29.132 8.551\" style=\"fill:#262692\"/><polygon points=\"8.984 2 6.964 5.687 7.906 5.687 7.906 15.328 9.857 15.328 9.857 5.687 11.004 5.687 8.984 2\" style=\"fill:#262693\"/><polygon points=\"23.705 30 21.685 26.243 22.628 26.243 22.628 16.417 24.578 16.417 24.578 26.243 25.725 26.243 23.705 30\" style=\"fill:#262693\"/><polygon points=\"2.868 23.32 6.634 21.3 6.634 22.242 16.484 22.242 16.484 24.192 6.634 24.192 6.634 25.34 2.868 23.32\" style=\"fill:#262692\"/>",
	},
	"Verilog": {
		colour: "#1a348f",
		icon: "<path d=\"M29.007,17.4h.037a1.449,1.449,0,0,0,.938-.316,1.473,1.473,0,0,0,.519-1.031V15.9a1.413,1.413,0,0,0-1.376-1.3h-.009c-.687,0-1.374,0-2.062,0H25.5V11.956l3.513,0h.034A1.411,1.411,0,0,0,30.5,10.6l0-.09,0-.032a1.412,1.412,0,0,0-.646-1.1,1.455,1.455,0,0,0-.835-.225H25.456a2.96,2.96,0,0,0-.278-1.034,2.909,2.909,0,0,0-1.7-1.461,2.684,2.684,0,0,0-.629-.13V4.947c0-.69,0-1.38,0-2.063A1.414,1.414,0,0,0,21.481,1.5h-.116a1.4,1.4,0,0,0-1.319,1.388q0,1.154,0,2.306V6.5H17.4V4.981c0-.7,0-1.4,0-2.087A1.41,1.41,0,0,0,16.053,1.5H15.9a1.408,1.408,0,0,0-1.3,1.383c0,.688,0,1.376,0,2.064V6.508q-1.319,0-2.639,0V4.888c0-.666,0-1.332,0-1.989a1.366,1.366,0,0,0-.4-.975,1.4,1.4,0,0,0-.984-.424H10.5A1.41,1.41,0,0,0,9.159,2.881c0,.683,0,1.366,0,2.049v1.6a2.933,2.933,0,0,0-2.466,1.9,2.878,2.878,0,0,0-.161.726H4.957c-.693,0-1.386,0-2.073,0H2.876A1.413,1.413,0,0,0,1.5,10.5v.095a1.417,1.417,0,0,0,.575,1.091,1.463,1.463,0,0,0,.887.273h.017l3.522,0V14.6H4.948c-.686,0-1.375,0-2.057,0A1.428,1.428,0,0,0,1.5,15.913V16.1a1.4,1.4,0,0,0,1.386,1.3c.711,0,1.423,0,2.135,0H6.5V20.05l-.292,0c-.613-.007-1.226,0-1.838,0H3.087a1.633,1.633,0,0,0-.918.211A1.437,1.437,0,0,0,1.5,21.4V21.5a1.417,1.417,0,0,0,1.375,1.337h.005q.645,0,1.29,0H6.546a2.832,2.832,0,0,0,1.978,2.5,2.712,2.712,0,0,0,.631.128v1.62c0,.678,0,1.354,0,2.025a1.4,1.4,0,1,0,2.8-.092l0-3.527H14.6v3.516A1.414,1.414,0,0,0,15.947,30.5H16.1a1.411,1.411,0,0,0,1.3-1.385q.006-1.066,0-2.131V25.5h2.644V29.1A1.423,1.423,0,0,0,21.4,30.5h.119a1.408,1.408,0,0,0,1.16-.741,1.643,1.643,0,0,0,.167-.833V25.474a2.671,2.671,0,0,0,.62-.128,2.928,2.928,0,0,0,1.886-1.888,2.834,2.834,0,0,0,.123-.613h1.581c.687,0,1.375,0,2.057,0h.008A1.422,1.422,0,0,0,30.5,21.481v-.118a1.409,1.409,0,0,0-1.382-1.318h0c-.718,0-1.436,0-2.154,0H25.5V17.4Z\" style=\"fill:#c5c5c5;opacity:0.3\"/><path d=\"M10.515,2h.056a.91.91,0,0,1,.886.893c.006,1.108,0,2.216,0,3.324-.6,0-1.2,0-1.8,0,0-1.111,0-2.222,0-3.333A.907.907,0,0,1,10.515,2Z\" style=\"fill:#1a348f\"/><path d=\"M15.937,2h.116a.912.912,0,0,1,.846.889c.006,1.109,0,2.219,0,3.329H15.1c0-1.11,0-2.22,0-3.33A.911.911,0,0,1,15.937,2Z\" style=\"fill:#1a348f\"/><path d=\"M21.392,2h.089a.907.907,0,0,1,.859.881c.007,1.112,0,2.225,0,3.337h-1.8c0-1.109,0-2.217,0-3.326A.912.912,0,0,1,21.392,2Z\" style=\"fill:#1a348f\"/><path d=\"M2,10.518a.908.908,0,0,1,.882-.859c1.112-.007,2.223,0,3.334,0q0,.9,0,1.8c-1.079,0-2.158,0-3.237,0a.983.983,0,0,1-.6-.173A.924.924,0,0,1,2,10.571Z\" style=\"fill:#1a348f\"/><path d=\"M25.786,9.655h3.233a1,1,0,0,1,.561.143.924.924,0,0,1,.42.716v.058a.933.933,0,0,1-.3.651.957.957,0,0,1-.677.234c-1.079,0-2.158,0-3.237,0Q25.786,10.556,25.786,9.655Z\" style=\"fill:#1a348f\"/><path d=\"M2,15.944a.913.913,0,0,1,.888-.842c1.109-.007,2.219,0,3.328,0q0,.9,0,1.8c-1.109,0-2.217,0-3.326,0A.915.915,0,0,1,2,16.063Z\" style=\"fill:#1a348f\"/><path d=\"M25.786,15.1c1.109,0,2.218,0,3.326,0a.914.914,0,0,1,.889.835v.117a.946.946,0,0,1-.331.641.973.973,0,0,1-.651.207H25.786Q25.785,16,25.786,15.1Z\" style=\"fill:#1a348f\"/><path d=\"M2.433,20.678a1.121,1.121,0,0,1,.643-.136c1.043.006,2.086-.006,3.129.006.028.6,0,1.2.012,1.8-1.11,0-2.221,0-3.331,0A.911.911,0,0,1,2,21.483V21.4A.925.925,0,0,1,2.433,20.678Z\" style=\"fill:#1a348f\"/><path d=\"M25.786,20.543c1.108,0,2.216,0,3.324,0a.914.914,0,0,1,.89.847v.09a.911.911,0,0,1-.888.859c-1.109.007-2.218,0-3.326,0C25.786,21.743,25.785,21.143,25.786,20.543Z\" style=\"fill:#1a348f\"/><path d=\"M9.656,25.781h1.8c0,1.081,0,2.162,0,3.243a.957.957,0,0,1-.235.677.931.931,0,0,1-.653.3h-.052a.907.907,0,0,1-.86-.882C9.651,28.006,9.658,26.894,9.656,25.781Z\" style=\"fill:#1a348f\"/><path d=\"M15.1,25.781h1.8c0,1.11,0,2.22,0,3.33a.914.914,0,0,1-.836.889h-.116a.94.94,0,0,1-.619-.306.962.962,0,0,1-.228-.673Q15.1,27.4,15.1,25.781Z\" style=\"fill:#1a348f\"/><path d=\"M20.547,29.106c0-1.108,0-2.217,0-3.325h1.8c0,1.048,0,2.1,0,3.144a1.178,1.178,0,0,1-.105.59.92.92,0,0,1-.756.484H21.4A.911.911,0,0,1,20.547,29.106Z\" style=\"fill:#1a348f\"/><path d=\"M24.732,8.349A2.429,2.429,0,0,0,23.31,7.131,3.245,3.245,0,0,0,22.254,7c-4.3.008-8.6-.011-12.905.01A2.436,2.436,0,0,0,7.157,8.606,3.611,3.611,0,0,0,7,9.934q0,6.25,0,12.5a2.673,2.673,0,0,0,.268,1.219A2.431,2.431,0,0,0,8.688,24.87,3.756,3.756,0,0,0,9.927,25H22.07a3.762,3.762,0,0,0,1.243-.127A2.429,2.429,0,0,0,24.875,23.3,3.8,3.8,0,0,0,25,22.071q0-6.25,0-12.5A2.686,2.686,0,0,0,24.732,8.349Z\" style=\"fill:#1a348f\"/><path d=\"M7.5,8.307l.084-.2q.968,0,1.935.024h.394q.179,0,.394-.012.776-.036,2.807-.036.406,0,.788.006t.741.018a.234.234,0,0,1,.108.108l-.024.191q-.072.119-.358.119h-.1a10.3,10.3,0,0,0-1.1.054,2.179,2.179,0,0,0-1,.245.432.432,0,0,0-.155.346,4.05,4.05,0,0,0,.394,1.4l1.818,4.217.634,1.4q.921,2.222,1.819,4.539.1.251.179.454l.8-1.959q.62-1.481,1.252-3.154l.823-2.246q.024-.072.131-.478a17.026,17.026,0,0,0,1.157-4,.561.561,0,0,0-.161-.364,1.165,1.165,0,0,0-.52-.3,7.723,7.723,0,0,0-.932-.143l-.884-.108a.337.337,0,0,1-.108-.2l.036-.1,3.87-.036H23.6a3.1,3.1,0,0,1,.885.084l.012.1a.641.641,0,0,1-.072.251,2.449,2.449,0,0,1-.526.119,3.6,3.6,0,0,0-1.244.281,1.815,1.815,0,0,0-.5.687l-3.134,7.765q-1.466,3.5-2.086,5.423l-.345,1.039a.531.531,0,0,1-.263.1,1.383,1.383,0,0,1-.3-.036q-1.422-3.676-2.318-5.681L10.055,9.92a3.247,3.247,0,0,0-.591-.89,5.463,5.463,0,0,0-1.379-.424,4.347,4.347,0,0,1-.466-.119A.326.326,0,0,1,7.5,8.307Z\" style=\"fill:#c5c2ff\"/>",
	},
	"VHDL": {
		colour: "#0d9b35",
		icon: "<path d=\"M2,2H30V30H2Zm1.689.067A1.624,1.624,0,0,0,2.063,3.692V28.314A1.625,1.625,0,0,0,3.689,29.94H28.316a1.625,1.625,0,0,0,1.626-1.626V3.692a1.624,1.624,0,0,0-1.626-1.625ZM3.008,28.079a.911.911,0,0,0,.911.912H28.083a.911.911,0,0,0,.911-.912V3.919a.91.91,0,0,0-.911-.911H3.919a.91.91,0,0,0-.911.911Z\" style=\"fill:#0d9b35\"/><polygon points=\"25.52 5.502 18.858 26.491 13.154 26.491 6.492 5.502 10.508 5.502 16.029 22.795 21.504 5.502 25.52 5.502\" style=\"fill:#fff\"/>",
	},
	"vim": {
		colour: "#43b54a",
		icon: "<defs><clipPath id=\"a\"><polygon points=\"2 2 30 2 30 30 2 30 2 2 2 2\" style=\"fill:none;clip-rule:evenodd\"/></clipPath></defs><title>file_type_vim</title><polygon points=\"29.989 15.856 15.856 2.011 2.011 16.136 15.856 29.989 29.989 15.856 29.989 15.856\" style=\"fill:#231f20;fill-rule:evenodd\"/><g style=\"clip-path:url(#a)\"><polygon points=\"29.989 15.856 15.856 2.011 2.011 16.136 15.856 29.989 29.989 15.856 29.989 15.856\" style=\"fill:none;stroke:#231f20;stroke-miterlimit:10;stroke-width:0.216000005602837px\"/></g><polygon points=\"28.575 15.856 29.422 15.856 15.856 29.422 15.856 28.575 28.575 15.856 28.575 15.856\" style=\"fill:#29695d;fill-rule:evenodd\"/><polygon points=\"28.575 15.856 29.422 15.856 15.856 29.422 15.856 28.575 28.575 15.856 28.575 15.856\" style=\"fill:none;stroke:#231f20;stroke-miterlimit:10;stroke-width:0.216000005602837px\"/><polygon points=\"2.578 16.136 3.425 16.136 15.856 28.575 15.856 29.422 2.578 16.136 2.578 16.136\" style=\"fill:#317367;fill-rule:evenodd\"/><polygon points=\"2.578 16.136 3.425 16.136 15.856 28.575 15.856 29.422 2.578 16.136 2.578 16.136\" style=\"fill:none;stroke:#231f20;stroke-miterlimit:10;stroke-width:0.216000005602837px\"/><polygon points=\"15.856 3.418 15.856 2.578 2.578 16.136 3.425 16.136 15.856 3.418 15.856 3.418\" style=\"fill:#60c2ac;fill-rule:evenodd\"/><polygon points=\"15.856 3.418 15.856 2.578 2.578 16.136 3.425 16.136 15.856 3.418 15.856 3.418\" style=\"fill:none;stroke:#231f20;stroke-miterlimit:10;stroke-width:0.216000005602837px\"/><polygon points=\"15.856 2.578 15.856 3.418 28.575 15.856 29.422 15.856 15.856 2.578 15.856 2.578\" style=\"fill:#43b54a;fill-rule:evenodd\"/><polygon points=\"15.856 2.578 15.856 3.418 28.575 15.856 29.422 15.856 15.856 2.578 15.856 2.578\" style=\"fill:none;stroke:#231f20;stroke-miterlimit:10;stroke-width:0.216000005602837px\"/><polygon points=\"15.856 28.575 28.575 15.856 15.856 3.418 3.425 16.136 15.856 28.575 15.856 28.575\" style=\"fill:#3c8376;fill-rule:evenodd\"/><polygon points=\"15.856 28.575 28.575 15.856 15.856 3.418 3.425 16.136 15.856 28.575 15.856 28.575\" style=\"fill:none;stroke:#231f20;stroke-miterlimit:10;stroke-width:0.216000005602837px\"/><polygon points=\"18.498 6.246 19.345 7.1 13.502 13.028 13.502 7.1 14.069 7.1 14.916 6.246 14.916 3.992 14.069 3.138 4.652 3.138 3.805 3.992 3.805 6.246 4.652 7.1 5.312 7.1 5.312 26.314 6.346 27.161 9.267 27.161 29.516 6.246 29.516 3.992 28.669 3.138 19.438 3.138 18.498 3.992 18.498 6.246 18.498 6.246\" style=\"fill:#231f20;fill-rule:evenodd\"/><polygon points=\"18.498 6.246 19.345 7.1 13.502 13.028 13.502 7.1 14.069 7.1 14.916 6.246 14.916 3.992 14.069 3.138 4.652 3.138 3.805 3.992 3.805 6.246 4.652 7.1 5.312 7.1 5.312 26.314 6.346 27.161 9.267 27.161 29.516 6.246 29.516 3.992 28.669 3.138 19.438 3.138 18.498 3.992 18.498 6.246 18.498 6.246\" style=\"fill:none;stroke:#231f20;stroke-miterlimit:10;stroke-width:0.216000005602837px\"/><polygon points=\"4.932 6.533 4.365 5.966 4.365 4.272 4.932 3.705 13.789 3.698 14.349 4.272 13.789 4.544 13.502 4.272 4.932 5.679 4.932 6.533 4.932 6.533\" style=\"fill:#fff;fill-rule:evenodd\"/><polygon points=\"4.932 6.533 4.365 5.966 4.365 4.272 4.932 3.705 13.789 3.698 14.349 4.272 13.789 4.544 13.502 4.272 4.932 5.679 4.932 6.533 4.932 6.533\" style=\"fill:none;stroke:#231f20;stroke-miterlimit:10;stroke-width:0.216000005602837px\"/><polygon points=\"6.626 26.594 5.966 26.027 5.966 6.526 6.626 5.966 6.626 26.594 6.626 26.594\" style=\"fill:#fff;fill-rule:evenodd\"/><polygon points=\"6.626 26.594 5.966 26.027 5.966 6.526 6.626 5.966 6.626 26.594 6.626 26.594\" style=\"fill:none;stroke:#231f20;stroke-miterlimit:10;stroke-width:0.216000005602837px\"/><polygon points=\"20.759 6.533 21.326 5.966 21.326 7.1 11.902 16.703 12.942 14.442 20.759 6.533 20.759 6.533\" style=\"fill:#fff;fill-rule:evenodd\"/><polygon points=\"20.759 6.533 21.326 5.966 21.326 7.1 11.902 16.703 12.942 14.442 20.759 6.533 20.759 6.533\" style=\"fill:none;stroke:#231f20;stroke-miterlimit:10;stroke-width:0.216000005602837px\"/><polygon points=\"6.82 5.686 6.626 5.966 5.966 6.533 4.932 6.533 4.932 5.399 6.82 5.686 6.82 5.686\" style=\"fill:#929497;fill-rule:evenodd\"/><polygon points=\"6.82 5.686 6.626 5.966 5.966 6.533 4.932 6.533 4.932 5.399 6.82 5.686 6.82 5.686\" style=\"fill:none;stroke:#231f20;stroke-miterlimit:10;stroke-width:0.216000005602837px\"/><polygon points=\"12.942 6.533 12.942 14.442 11.902 16.696 11.902 5.958 13.502 5.958 13.789 5.678 13.502 4.272 14.349 4.272 14.349 5.966 13.789 6.533 12.942 6.533 12.942 6.533\" style=\"fill:#929497;fill-rule:evenodd\"/><polygon points=\"12.942 6.533 12.942 14.442 11.902 16.696 11.902 5.958 13.502 5.958 13.789 5.678 13.502 4.272 14.349 4.272 14.349 5.966 13.789 6.533 12.942 6.533 12.942 6.533\" style=\"fill:none;stroke:#231f20;stroke-miterlimit:10;stroke-width:0.216000005602837px\"/><polygon points=\"19.625 6.533 19.065 5.966 19.065 4.272 19.718 3.705 28.295 3.705 28.956 4.272 28.008 5.119 19.625 5.679 19.625 6.533 19.625 6.533\" style=\"fill:#fff;fill-rule:evenodd\"/><polygon points=\"19.625 6.533 19.065 5.966 19.065 4.272 19.718 3.705 28.295 3.705 28.956 4.272 28.008 5.119 19.625 5.679 19.625 6.533 19.625 6.533\" style=\"fill:none;stroke:#231f20;stroke-miterlimit:10;stroke-width:0.216000005602837px\"/><polygon points=\"28.956 5.966 9.074 26.594 6.626 26.594 6.626 25.747 8.42 25.747 28.295 5.399 28.008 4.272 28.956 4.272 28.956 5.966 28.956 5.966\" style=\"fill:#929497;fill-rule:evenodd\"/><polygon points=\"28.956 5.966 9.074 26.594 6.626 26.594 6.626 25.747 8.42 25.747 28.295 5.399 28.008 4.272 28.956 4.272 28.956 5.966 28.956 5.966\" style=\"fill:none;stroke:#231f20;stroke-miterlimit:10;stroke-width:0.216000005602837px\"/><polygon points=\"21.512 5.686 21.319 5.966 20.759 6.533 19.625 6.533 19.625 5.399 21.512 5.686 21.512 5.686\" style=\"fill:#929497;fill-rule:evenodd\"/><polygon points=\"21.512 5.686 21.319 5.966 20.759 6.533 19.625 6.533 19.625 5.399 21.512 5.686 21.512 5.686\" style=\"fill:none;stroke:#231f20;stroke-miterlimit:10;stroke-width:0.216000005602837px\"/><polygon points=\"11.902 16.696 11.902 5.958 13.502 5.958 13.789 5.679 13.789 4.544 13.502 4.265 5.212 4.265 4.932 4.544 4.932 5.679 5.212 5.958 6.626 5.958 6.626 25.747 6.992 26.027 8.607 26.027 28.389 5.399 28.389 4.588 28.102 4.265 19.912 4.265 19.625 4.544 19.625 5.686 19.912 5.966 21.326 5.966 21.326 7.1 11.902 16.696 11.902 16.696\" style=\"fill:#d0d2d3;fill-rule:evenodd\"/><polygon points=\"11.902 16.696 11.902 5.958 13.502 5.958 13.789 5.679 13.789 4.544 13.502 4.265 5.212 4.265 4.932 4.544 4.932 5.679 5.212 5.958 6.626 5.958 6.626 25.747 6.992 26.027 8.607 26.027 28.389 5.399 28.389 4.588 28.102 4.265 19.912 4.265 19.625 4.544 19.625 5.686 19.912 5.966 21.326 5.966 21.326 7.1 11.902 16.696 11.902 16.696\" style=\"fill:none;stroke:#231f20;stroke-miterlimit:10;stroke-width:0.216000005602837px\"/><polygon points=\"17.041 16.711 17.701 16.144 19.395 16.144 19.869 16.711 19.302 18.405 18.649 18.972 16.955 18.972 16.474 18.405 17.041 16.711 17.041 16.711\" style=\"fill:#231f20;fill-rule:evenodd\"/><polygon points=\"17.041 16.711 17.701 16.144 19.395 16.144 19.869 16.711 19.302 18.405 18.649 18.972 16.955 18.972 16.474 18.405 17.041 16.711 17.041 16.711\" style=\"fill:none;stroke:#231f20;stroke-miterlimit:10;stroke-width:0.216000005602837px\"/><polygon points=\"17.608 26.034 19.309 20.953 18.742 20.953 19.309 19.251 21.843 19.251 22.41 19.819 22.79 19.819 23.35 19.251 25.238 19.251 25.805 19.819 26.178 19.819 26.745 19.251 28.812 19.251 29.566 20.386 28.331 24.405 28.891 24.405 28.346 26.034 24.951 26.034 26.278 22.079 25.431 22.079 24.649 24.391 25.209 24.391 24.678 26.034 21.283 26.034 22.603 22.079 21.756 22.079 20.967 24.405 21.534 24.405 21.003 26.034 17.608 26.034 17.608 26.034\" style=\"fill:#231f20;fill-rule:evenodd\"/><polygon points=\"17.608 26.034 19.309 20.953 18.742 20.953 19.309 19.251 21.843 19.251 22.41 19.819 22.79 19.819 23.35 19.251 25.238 19.251 25.805 19.819 26.178 19.819 26.745 19.251 28.812 19.251 29.566 20.386 28.331 24.405 28.891 24.405 28.346 26.034 24.951 26.034 26.278 22.079 25.431 22.079 24.649 24.391 25.209 24.391 24.678 26.034 21.283 26.034 22.603 22.079 21.756 22.079 20.967 24.405 21.534 24.405 21.003 26.034 17.608 26.034 17.608 26.034\" style=\"fill:none;stroke:#231f20;stroke-miterlimit:10;stroke-width:0.216000005602837px\"/><polygon points=\"28.554 19.819 28.992 20.443 27.599 24.907 28.159 24.907 27.972 25.467 25.711 25.467 27.032 21.512 25.051 21.512 23.924 24.907 24.484 24.907 24.297 25.467 22.036 25.467 23.357 21.512 21.376 21.512 20.249 24.907 20.816 24.907 20.622 25.467 18.361 25.467 20.063 20.386 19.495 20.386 19.682 19.819 21.756 19.819 22.323 20.386 22.883 20.386 23.45 19.819 25.144 19.819 25.711 20.386 26.278 20.386 26.845 19.819 28.554 19.819 28.554 19.819\" style=\"fill:#d0d2d3;fill-rule:evenodd\"/><polygon points=\"28.554 19.819 28.992 20.443 27.599 24.907 28.159 24.907 27.972 25.467 25.711 25.467 27.032 21.512 25.051 21.512 23.924 24.907 24.484 24.907 24.297 25.467 22.036 25.467 23.357 21.512 21.376 21.512 20.249 24.907 20.816 24.907 20.622 25.467 18.361 25.467 20.063 20.386 19.495 20.386 19.682 19.819 21.756 19.819 22.323 20.386 22.883 20.386 23.45 19.819 25.144 19.819 25.711 20.386 26.278 20.386 26.845 19.819 28.554 19.819 28.554 19.819\" style=\"fill:none;stroke:#231f20;stroke-miterlimit:10;stroke-width:0.216000005602837px\"/><path d=\"M19.022,19.251,17.292,24.4h.589l-.56,1.637H13.933l1.694-5.082H15.06l3.962-1.7Zm-3.962,1.7.567-1.7h3.4l-3.962,1.7Z\" style=\"fill:#231f20;fill-rule:evenodd\"/><path d=\"M19.022,19.251,17.292,24.4h.589l-.56,1.637H13.933l1.694-5.082H15.06l3.962-1.7Zm-3.962,1.7.567-1.7h3.4l-3.962,1.7Z\" style=\"fill:none;stroke:#231f20;stroke-miterlimit:10;stroke-width:0.216000005602837px\"/><polygon points=\"16.947 25.467 17.134 24.907 16.567 24.907 18.268 19.819 15.914 19.819 15.72 20.386 16.38 20.386 14.686 25.467 16.947 25.467 16.947 25.467\" style=\"fill:#d0d2d3;fill-rule:evenodd\"/><polygon points=\"16.947 25.467 17.134 24.907 16.567 24.907 18.268 19.819 15.914 19.819 15.72 20.386 16.38 20.386 14.686 25.467 16.947 25.467 16.947 25.467\" style=\"fill:none;stroke:#231f20;stroke-miterlimit:10;stroke-width:0.216000005602837px\"/><polygon points=\"18.828 18.125 19.208 16.991 19.022 16.711 17.888 16.711 17.514 16.991 17.134 18.125 17.328 18.405 18.462 18.405 18.828 18.125 18.828 18.125\" style=\"fill:#d0d2d3;fill-rule:evenodd\"/><polygon points=\"18.828 18.125 19.208 16.991 19.022 16.711 17.888 16.711 17.514 16.991 17.134 18.125 17.328 18.405 18.462 18.405 18.828 18.125 18.828 18.125\" style=\"fill:none;stroke:#231f20;stroke-miterlimit:10;stroke-width:0.216000005602837px\"/>",
	},
	"Visual Basic": {
		colour: "#00519a",
		icon: "<path d=\"M6.67,7.836,9,18.915,11.336,7.836H16L11.336,24.164H6.672L2,7.836Z\" style=\"fill:#00519a\"/><path d=\"M18.331,7.836h7.6a4.08,4.08,0,0,1,2.9,1.749,3.78,3.78,0,0,1,.571,2.04,3.985,3.985,0,0,1-.571,2.034,4.108,4.108,0,0,1-2.341,1.763,4.1,4.1,0,0,1,2.929,1.756,3.8,3.8,0,0,1,.58,2.1,4.663,4.663,0,0,1-.579,2.546,5.047,5.047,0,0,1-3.5,2.338H18.331ZM23,14.252h1.166a1.754,1.754,0,0,0,0-3.5H23Zm0,7H24.39a2.047,2.047,0,0,0,0-4.089H23Z\" style=\"fill:#00519a\"/>",
	},
	"WebAssembly": {
		colour: "#654ff0",
		icon: "<path d=\"M19.153,2.35V2.5a3.2,3.2,0,1,1-6.4,0h0V2.35H2V30.269H29.919V2.35Z\" style=\"fill:#654ff0\"/><path d=\"M8.485,17.4h1.85L11.6,24.123h.023L13.14,17.4h1.731l1.371,6.81h.027l1.44-6.81h1.815l-2.358,9.885H15.329l-1.36-6.728h-.036l-1.456,6.728h-1.87Zm13.124,0h2.917l2.9,9.885H25.515l-.63-2.2H21.562l-.486,2.2H19.217Zm1.11,2.437-.807,3.627h2.512L23.5,19.832Z\" style=\"fill:#fff\"/>",
	},
	"Wolfram language": {
		colour: "#d01000",
		icon: "<path d=\"M30,20.55,25.94,16,30,11.45l-5.948-1.294.595-6.067L19.071,6.543,15.993,1.279,12.929,6.543,7.353,4.089l.595,6.067L2,11.45,6.059,16,2,20.55l5.948,1.294-.595,6.067,5.576-2.454,3.078,5.264,3.063-5.264,5.591,2.454-.61-6.067Z\" style=\"fill:#d10\"/><path d=\"M19.353,11.45a6.968,6.968,0,0,1-3.42.862,5.446,5.446,0,0,1-3.212-.862A7.1,7.1,0,0,1,12.5,14.8a6.225,6.225,0,0,1-1.874,2.914,7.454,7.454,0,0,1,3.138,1.19,9.659,9.659,0,0,1,2.216,2.721,8.194,8.194,0,0,1,2.141-2.691,7.605,7.605,0,0,1,3.242-1.2,12.562,12.562,0,0,1-1.933-2.944A6.718,6.718,0,0,1,19.353,11.45Zm-1.9,6.543a5.233,5.233,0,0,0-1.457,1.636,6.236,6.236,0,0,0-1.5-1.621,5.191,5.191,0,0,0-1.948-.848,6.839,6.839,0,0,0,1.115-2.007,6.18,6.18,0,0,0,.223-2.082,6.317,6.317,0,0,0,2.082.446,6.552,6.552,0,0,0,2.171-.461,4.521,4.521,0,0,0,.074,2.156,6.71,6.71,0,0,0,1.249,1.933A7.031,7.031,0,0,0,17.45,17.993Zm4.238-4.015c-.357-1.175.654-6.706.654-6.706S18.55,9.844,15.888,9.844s-6.23-2.572-6.23-2.572,1.175,4.015.461,6.587-4.387,5.472-4.387,5.472,4.788.283,6.6,1.5,3.658,5.948,3.658,5.948,2.454-5.2,3.48-5.948,6.8-1.5,6.8-1.5-4.223-4.178-4.58-5.353Zm-2.84,5.963a9.444,9.444,0,0,0-2.84,4.178s-1.413-3.152-2.974-4.223S8.3,18.543,8.3,18.543s2.454-2.171,3.048-4.1a11.923,11.923,0,0,0-.1-4.952,11.3,11.3,0,0,0,4.669,1.621c2.037,0,4.848-1.621,4.848-1.621s-.818,3.033-.164,4.922,3.108,4.134,3.108,4.134a10.557,10.557,0,0,0-4.862,1.4Z\" style=\"fill:#fff\"/>",
	},
	"XML": {
		colour: "#f1662a",
		icon: "<path d=\"M20.42,21.157l2.211,2.211L30,16,22.631,8.631,20.42,10.843,25.58,16Z\" style=\"fill:#f1662a\"/><path d=\"M11.58,10.843,9.369,8.631,2,16l7.369,7.369,2.211-2.211L6.42,16Z\" style=\"fill:#f1662a\"/><path d=\"M17.411,7.677l1.6.437-4.42,16.209-1.6-.437,4.42-16.209Z\" style=\"fill:#f1662a\"/>",
	},
	"XQuery": {
		colour: "#f1662a",
		icon: "<path d=\"M20.42,21.157l2.211,2.211L30,16,22.631,8.631,20.42,10.843,25.58,16ZM11.58,10.843,9.369,8.631,2,16l7.369,7.369,2.211-2.211L6.42,16Zm5.831-3.166,1.6.437-4.42,16.209-1.6-.437Z\" style=\"fill:#f1662a\"/><path d=\"M20.332,18.462a3.354,3.354,0,0,1,.975-1.423,4.014,4.014,0,0,1,1.617-.8A9.118,9.118,0,0,1,25.138,16a5.472,5.472,0,0,1,3.681,1.039A3.5,3.5,0,0,1,30,19.808a4.47,4.47,0,0,1-.24,1.491,3.124,3.124,0,0,1-.838,1.239l-1.675,1.6a1.512,1.512,0,0,0-.424.789,5.307,5.307,0,0,0-.1,1.1H23v-.54a6.32,6.32,0,0,1,.207-1.778,2.886,2.886,0,0,1,.78-1.24l1.352-1.289a1.84,1.84,0,0,0,.563-.894,3.682,3.682,0,0,0,.1-.8,1.5,1.5,0,0,0-.252-.9.9.9,0,0,0-.779-.346,1.255,1.255,0,0,0-.483.086.724.724,0,0,0-.344.337,2.347,2.347,0,0,0-.217.721,7.614,7.614,0,0,0-.081,1.24H20A6.155,6.155,0,0,1,20.332,18.462Zm6.457,8.5V30H22.936V26.962Z\" style=\"fill:#fcba00\"/>",
	},
	"YAML": {
		colour: "#ffe885",
		icon: "<path d=\"M2,12.218c.755,0,1.51-.008,2.264,0l.053.038Q5.7,13.638,7.078,15.014c.891-.906,1.8-1.794,2.7-2.7.053-.052.11-.113.192-.1.608,0,1.215,0,1.823,0a1.4,1.4,0,0,1,.353.019c-.7.67-1.377,1.369-2.069,2.05L5.545,18.8c-.331.324-.648.663-.989.975-.754.022-1.511.007-2.266.007,1.223-1.209,2.431-2.433,3.658-3.637C4.627,14.841,3.318,13.525,2,12.218Z\" style=\"fill:#ffe885\"/><path d=\"M12.7,12.218c.613,0,1.226,0,1.839,0q0,3.783,0,7.566c-.611,0-1.222.012-1.832-.008,0-1.664,0-3.329,0-4.994-1.6,1.607-3.209,3.2-4.811,4.8-.089.08-.166.217-.305.194-.824-.006-1.649,0-2.474,0Q8.916,16,12.7,12.218Z\" style=\"fill:#ffe885\"/><path d=\"M14.958,12.22c.47-.009.939,0,1.409,0,.836.853,1.69,1.689,2.536,2.532q1.268-1.267,2.539-2.532.7,0,1.4,0-.008,3.784,0,7.567c-.471,0-.943.006-1.414,0q.008-2.387,0-4.773c-.844.843-1.676,1.7-2.526,2.536-.856-.835-1.687-1.695-2.532-2.541,0,1.594-.006,3.188.006,4.781-.472,0-.943.005-1.415,0Q14.958,16,14.958,12.22Z\" style=\"fill:#ffe885\"/><path d=\"M23.259,12.217c.472,0,.944-.007,1.416,0q-.007,3.083,0,6.166c1.26,0,2.521,0,3.782,0,.063.006.144-.012.191.045.448.454.907.9,1.353,1.354q-3.371.007-6.741,0Q23.267,16,23.259,12.217Z\" style=\"fill:#ffe885\"/>",
	},
	"YANG": {
		colour: "#231f20",
		icon: "<path d=\"M8.877,23.159c0-5.535,3.992-7.168,7.894-7.168,3.357,0,5.988-3.811,5.988-6.624,0-3.621-2.487-5.831-4.882-7.12A13.881,13.881,0,1,0,14.5,29.8C10.491,28.248,8.877,25.324,8.877,23.159Z\" style=\"fill:#fff\"/><path d=\"M14.482,29.917A14,14,0,0,1,16,2a14.154,14.154,0,0,1,1.893.131l.04.013c2.255,1.213,4.944,3.452,4.944,7.223,0,2.715-2.564,6.741-6.106,6.741-2.9,0-7.776.916-7.776,7.05,0,2.022,1.451,4.946,5.542,6.531ZM16,2.236A13.765,13.765,0,0,0,13.637,29.56c-3.581-1.684-4.877-4.447-4.877-6.4,0-6.576,5.6-7.286,8.012-7.286,3.406,0,5.87-3.886,5.87-6.506,0-3.645-2.606-5.82-4.8-7.006A13.928,13.928,0,0,0,16,2.236Z\" style=\"fill:#231f20\"/><path d=\"M29.882,16a13.882,13.882,0,0,0-12-13.752c2.4,1.289,4.882,3.5,4.882,7.12,0,2.813-2.631,6.624-5.988,6.624-3.9,0-7.894,1.633-7.894,7.168,0,2.166,1.613,5.089,5.618,6.641A13.875,13.875,0,0,0,29.882,16Z\" style=\"fill:#231f20\"/><path d=\"M16,30a14.2,14.2,0,0,1-1.518-.083l-.03-.007c-4.2-1.628-5.693-4.654-5.693-6.75,0-6.576,5.6-7.286,8.012-7.286,3.406,0,5.87-3.886,5.87-6.506,0-3.655-2.621-5.833-4.82-7.016l.072-.221A14,14,0,0,1,16,30Zm-1.477-.316A13.756,13.756,0,0,0,29.764,16,13.807,13.807,0,0,0,18.5,2.466c2.115,1.272,4.377,3.441,4.377,6.9,0,2.715-2.564,6.741-6.106,6.741-2.9,0-7.776.916-7.776,7.05C9,25.178,10.443,28.1,14.523,29.684Z\" style=\"fill:#231f20\"/><circle cx=\"15.943\" cy=\"22.787\" r=\"1.506\" style=\"fill:#fff\"/><circle cx=\"16.007\" cy=\"9.142\" r=\"1.506\" style=\"fill:#231f20\"/>",
	},
	"Zig": {
		colour: "#f7a41d",
		icon: "<polygon points=\"5.733 19.731 5.733 12.264 8.533 12.264 8.533 8.531 2 8.531 2 23.464 5.547 23.464 8.907 19.731 5.733 19.731\" style=\"fill:#f7a41d\"/><polygon points=\"26.453 8.531 23.093 12.264 26.267 12.264 26.267 19.731 23.467 19.731 23.467 23.464 30 23.464 30 8.531 26.453 8.531\" style=\"fill:#f7a41d\"/><polygon points=\"26.875 6.707 20.513 8.531 9.467 8.531 9.467 12.264 16.847 12.264 5.115 25.293 11.497 23.464 22.533 23.464 22.533 19.731 15.148 19.731 26.875 6.707\" style=\"fill:#f7a41d\"/>",
	}
};

const EXECUTE_CODE_LANGUAGE_ALIASES: Array<string> = ["javascript","typescript","bash","csharp","wolfram","nb","wl","hs","py"];
const EXECUTE_CODE_CANONICAL_LANGUAGES: Array<string> = ["js","ts","cs","lean","lua","python","cpp","prolog","shell","groovy","r","go","rust","java","powershell","kotlin","mathematica","haskell","scala","swift","racket","fsharp","c","dart","ruby","batch","sql","octave","maxima","applescript","zig","ocaml"];

export const EXECUTE_CODE_SUPPORTED_LANGUAGES = [...EXECUTE_CODE_LANGUAGE_ALIASES,...EXECUTE_CODE_CANONICAL_LANGUAGES];
