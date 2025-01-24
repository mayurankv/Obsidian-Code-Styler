const SOLARIZED = {
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
}
const GRUVBOX: Record<string, Colour> = {
	dark0_hard: "#1d2021",
	dark0: "#282828",
	dark0_soft: "#32302f",
	dark1: "#3c3836",
	dark2: "#504945",
	dark3: "#665c54",
	dark4: "#7c6f64",

	gray_245: "#928374",
	gray_244: "#928374",

	light0_hard: "#f9f5d7",
	light0: "#fbf1c7",
	light0_soft: "#f2e5bc",
	light1: "#ebdbb2",
	light2: "#d5c4a1",
	light3: "#bdae93",
	light4: "#a89984",

	bright_red: "#fb4934",
	bright_green: "#b8bb26",
	bright_yellow: "#fabd2f",
	bright_blue: "#83a598",
	bright_purple: "#d3869b",
	bright_aqua: "#8ec07c",
	bright_orange: "#fe8019",

	neutral_red: "#cc241d",
	neutral_green: "#98971a",
	neutral_yellow: "#d79921",
	neutral_blue: "#458588",
	neutral_purple: "#b16286",
	neutral_aqua: "#689d6a",
	neutral_orange: "#d65d0e",

	faded_red: "#9d0006",
	faded_green: "#79740e",
	faded_yellow: "#b57614",
	faded_blue: "#076678",
	faded_purple: "#8f3f71",
	faded_aqua: "#427b58",
	faded_orange: "#af3a03",
};

const GRUVBOX_THEME = {
	colours: {
		light: {
			codeblock: {
				backgroundColour: GRUVBOX.light0,
				textColour: "#bababa",
			},
			gutter: {
				backgroundColour: GRUVBOX.light1,
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
				lineColour: "#EDD489",
			},
			highlights: {
				activeCodeblockLineColour: GRUVBOX.light1,
				activeEditorLineColour: "#60460633",
				defaultColour: "#E9DFBA",
				alternativeHighlights: {},
			},
			inline: {
				backgroundColour: GRUVBOX.light0,
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
				backgroundColour: GRUVBOX.dark0,
				textColour: "#bababa",
			},
			gutter: {
				backgroundColour: GRUVBOX.dark1,
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
				lineColour: "#46cced",
			},
			highlights: {
				activeCodeblockLineColour: GRUVBOX.dark1,
				activeEditorLineColour: "#468eeb33",
				defaultColour: "#054b5c",
				alternativeHighlights: {},
			},
			inline: {
				backgroundColour: GRUVBOX.dark0,
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
const SOLARIZED_THEME = {
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
