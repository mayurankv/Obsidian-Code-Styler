import { App, PluginSettingTab } from "obsidian";

import CodeStylerPlugin from "src/main";

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
