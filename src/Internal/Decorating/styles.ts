import CodeStylerPlugin from "src/main";
import { CodeStylerSettings } from "../types/settings";
import { BODY_CLASS, STYLE_ELEMENT_ID } from "../constants/decoration";
import { PREFIX } from "../constants/general";
import { getTheme } from "../utils/themes";
import { convertStylesToVars } from "../utils/settings";
import { BASE_THEME_MODE_STYLES } from "../constants/settings";

const BODY_CLASSES = [
	PREFIX+"active-line-highlight",
	PREFIX+"active-line-highlight-codeblock",
	PREFIX+"active-line-highlight-editor",
	PREFIX+"show-line-numbers",
	PREFIX+"gutter-highlight",
	PREFIX+"gutter-active-line",
	PREFIX+"style-inline",
	BODY_CLASS,
]

export function applyStyling(
	plugin: CodeStylerPlugin,
): void {
	const styleTag = document.getElementById(STYLE_ELEMENT_ID) ?? document.head.appendChild(Object.assign(document.createElement("style"), { id: STYLE_ELEMENT_ID }));
	styleTag.innerText = getStyleText(
		plugin,
		getCurrentTheme(plugin),
	).trim().replace(/\s+/g, " ");

	document.body.classList.remove(...BODY_CLASSES)
	document.body.classList.add(BODY_CLASS, ...getBodyClasses(plugin))
}

export function removeStyling(): void {
	document.getElementById(STYLE_ELEMENT_ID)?.remove();

	document.body.classList.remove(...BODY_CLASSES)
}

function getStyleText(
	plugin: CodeStylerPlugin,
	obsidianTheme: string,
): string {

	let styleString = ""

	styleString += convertStylesToVars(BASE_THEME_MODE_STYLES)


	// TODO:
	console.log(styleString)
	// styleThemeColours(plugin.settings.currentTheme.colours) + styleThemeSettings(plugin.settings.currentTheme.settings, obsidianTheme) + styleLanguageColours(plugin.settings.currentTheme.settings, plugin.settings.redirectLanguages, obsidianTheme)

	return styleString
}

function getBodyClasses(
	plugin: CodeStylerPlugin,
): Array<string> {
	const themeSettings = getTheme(plugin).settings

	return Object.entries({
		"line-numbers-enabled-false": !themeSettings.fence.gutter.lineNumbers,
		"unwrap-false": themeSettings.fence.lineUnwrap === false,
		"unwrap-inactive": themeSettings.fence.lineUnwrap === "inactive",
		"gutter-highlight": themeSettings.fence.gutter.highlight,
		"fence-line-highlight": themeSettings.fence.highlights.active === "fence",
		"editor-line-highlight": themeSettings.fence.highlights.active === "editor",
		"language-border-disabled": themeSettings.fence.gutter.languageBorder,
	}).filter(
		([cssclass, setting]) => setting,
	).map(
		([cssclass, setting]) => PREFIX + cssclass,
	)
}

function setBodyClass(
	cssClass: string,
	add: boolean | null,
): void {
	if(add === null)
		document.body.classList.toggle(cssClass)
	else if (add)
		document.body.classList.add(cssClass)
	else
		document.body.classList.remove(cssClass)
}

function getCurrentTheme(
	plugin: CodeStylerPlugin,
): string {
	//@ts-expect-error Undocumented Obsidian API
	return plugin.app.vault.getConfig("cssTheme");
}
