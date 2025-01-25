import CodeStylerPlugin from "src/main";
import { CodeStylerSettings } from "../types/settings";
import { BODY_CLASS, STYLE_ELEMENT_ID } from "../constants/decoration";
import { PREFIX } from "../constants/general";

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
	// TODO:
	// styleThemeColours(plugin.settings.currentTheme.colours) + styleThemeSettings(plugin.settings.currentTheme.settings, obsidianTheme) + styleLanguageColours(plugin.settings.currentTheme.settings, plugin.settings.redirectLanguages, obsidianTheme)
	return ""
}

function getBodyClasses(
	plugin: CodeStylerPlugin,
): Array<string> {
	const themeSettings = plugin.settings.currentTheme.settings

	return Object.entries({
		"code-styler-style-inline": themeSettings.inline.style,
		"code-styler-gutter-highlight": themeSettings.gutter.highlight,
		"code-styler-gutter-active-line": themeSettings.gutter.activeLine,
		"code-styler-active-line-highlight": themeSettings.highlights.activeEditorLine && themeSettings.highlights.activeCodeblockLine, // Inside and outside of codeblocks with different colours
		"code-styler-active-line-highlight-editor": themeSettings.highlights.activeEditorLine && !themeSettings.highlights.activeCodeblockLine, // Only outside codeblocks
		"code-styler-active-line-highlight-codeblock": !themeSettings.highlights.activeEditorLine && themeSettings.highlights.activeCodeblockLine, // Only inside codeblocks
	}).filter(
		([cssclass, setting]) => setting,
	).map(
		([cssclass, setting]) => cssclass,
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
