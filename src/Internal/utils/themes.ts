import CodeStylerPlugin from "src/main";
import { CodeStylerTheme, CodeStylerThemeModeStyles } from "../types/settings";
import { INBUILT_THEMES, THEME_DEFAULT_SETTINGS } from "../constants/settings";
import { getThemeModeStyles } from "../constants/themes";

export function getThemeStyles(
	plugin: CodeStylerPlugin,
	mode: "light" | "dark" | null = null,
): CodeStylerThemeModeStyles {
	return getTheme(plugin).styles[mode ?? getMode()]
}
export function getTheme(
	plugin: CodeStylerPlugin,
): CodeStylerTheme {
	return structuredClone(
		plugin.settings.decorating.themes?.[plugin.settings.decorating.theme] ?? plugin.settings.internal.themes?.[plugin.settings.decorating.theme] ?? INBUILT_THEMES["default"]
	)
}

export function getMode(): "light" | "dark" {
	return document.body.hasClass("theme-light") ? "light" : "dark"
}
