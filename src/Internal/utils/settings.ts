import { DEFAULT_SETTINGS } from "../constants/settings";
import { CodeStylerSettings, CodeStylerTheme, CodeStylerThemeModeColours, Colour } from "../types/settings";

function convertColoursToTheme(
	colours: Record<string, Colour>,
): CodeStylerThemeModeColours {
	return {
		codeblock: {
			backgroundColour: colours.backgroundColour,
			textColour: colours.foregroundColour,
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
			externalReference: {
				displayRepositoryColour: "#00FFFF",
				displayVersionColour: "#9437ff",
				displayTimestampColour: "#808080",
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
		},
	}
}

function createTheme(
	themeName: string,
): CodeStylerTheme {
	if (!COLOUR_THEMES?.[themeName])
		throw new Error("Theme not found")

	return {
		settings: THEME_DEFAULT_SETTINGS,
		colours: {
			light: convertColoursToTheme(COLOUR_THEMES[themeName]["light"]),
			dark: convertColoursToTheme(COLOUR_THEMES[themeName]["dark"]),
		},
	}
}

export function convertSettings(
	settings: CodeStylerSettings
): CodeStylerSettings {
	if (typeof settings?.version === "undefined")
		return settingsClear();

	while (semverNewer(DEFAULT_SETTINGS.version, settings.version)) {
		if (settings.version in settingsUpdaters)
			settings = settingsUpdaters[settings.version](settings);
		else
			settings = settingsClear();
	}
	return settings;
}

function semverNewer(
	newVersion: string,
	oldVersion: string
): boolean {
	return newVersion.localeCompare(oldVersion, undefined, { numeric: true }) === 1;
}

function settingsVersionUpdate(
	settings: CodeStylerSettings,
	themeUpdater: (theme: CodeStylerTheme) => CodeStylerTheme = (theme) => theme,
	otherSettingsUpdater: (settings: CodeStylerSettings) => CodeStylerSettings = (settings) => settings,
	redirectLanguagesUpdater: (redirectLanguages: Record<string, { colour?: Colour, icon?: string }>) => Record<string, { colour?: Colour, icon?: string }> = (redirectLanguages) => redirectLanguages
): CodeStylerSettings {
	for (const [name, theme] of Object.entries(settings.themes))
		settings.themes[name] = themeUpdater(theme);

	settings.currentTheme = structuredClone(settings.themes[settings.selectedTheme]);
	settings.redirectLanguages = redirectLanguagesUpdater(settings.redirectLanguages);
	settings = otherSettingsUpdater(settings);
	settings.version = Object.keys(settingsUpdaters).find((value,index,array)=>array?.[index-1]===settings.version) ?? "1.0.0";
	return settings;
}

function settingsPreserve(
	settings: CodeStylerSettings
): CodeStylerSettings {
	settings.version = Object.keys(settingsUpdaters).find(
		(value, index, array) => array?.[index - 1] === settings.version
	) ?? "1.0.0";

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
