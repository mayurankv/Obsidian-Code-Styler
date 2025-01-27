import { App, PluginSettingTab, Setting, Notice, TextComponent, DropdownComponent, SliderComponent, ToggleComponent, ExtraButtonComponent, MarkdownRenderer } from "obsidian";
import Pickr from "@simonwep/pickr";
import { ColorTranslator } from "colortranslator";

import { getColour } from "src/Internal/Decorating/css";
import CodeStylerPlugin from "src/main";
import { Colour } from "src/Internal/types/decoration";
import { Display } from "src/Internal/types/settings";

export class SettingsTab extends PluginSettingTab {

	constructor(
		app: App,
		plugin: CodeStylerPlugin,
	) {

		super(app, plugin)
	}

	display() {
		
	}
}
