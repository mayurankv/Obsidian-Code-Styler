import CodeStylerPlugin from "src/main";
import { CodeStylerTheme } from "../types/settings";
import { THEME_DEFAULT_SETTINGS } from "../constants/settings";
import { convertColoursToTheme } from "../constants/themes";

export function getTheme(
	plugin: CodeStylerPlugin,
): CodeStylerTheme {
	return plugin.settings.decorating.themes?.[plugin.settings.decorating.theme] ?? plugin.settings.decorating.themes?.[plugin.settings.decorating.theme] ?? {
		settings: THEME_DEFAULT_SETTINGS,
		colours: {
			light: convertColoursToTheme("default", "light"),
			dark: convertColoursToTheme("default", "dark"),
		}
	}
}
