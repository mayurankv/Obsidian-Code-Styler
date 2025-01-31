// import { CodeParameters } from "src/Internal/types/parsing";
// import { CodeStylerThemeSettings } from "src/Internal/types/settings";

// export function isHeaderHidden(
// 	codeParameters: CodeParameters,
// 	plugin: CodeStylerPlugin,
// 	iconURL: string | undefined,
// ): boolean {
// 	return !isHeaderRequired(codeParameters) && (codeParameters.language === "" || (plugin.settings.header.languageTag.display !== "always" && (themeSettings.header.languageIcon.display !== "always" || (typeof iconURL == "undefined"))));
// }

// function isLanguageIconShown(
// 	codeParameters: CodeParameters,
// 	themeSettings: CodeStylerThemeSettings,
// 	iconURL: string | undefined,
// ): boolean {
// 	return (typeof iconURL !== "undefined") && (themeSettings.header.languageIcon.display === "always" || (isHeaderRequired(codeParameters) && themeSettings.header.languageIcon.display === "if_header_shown"));
// }

// function isLanguageTagShown(
// 	codeParameters: CodeParameters,
// 	themeSettings: CodeStylerThemeSettings,
// ): boolean {
// 	return themeSettings.header.languageTag.display === "always" ||
// 		(
// 			isHeaderRequired(codeParameters) &&
// 			themeSettings.header.languageTag.display === "if_header_shown"
// 		);
// }

// function isHeaderRequired(
// 	codeParameters: CodeParameters,
// ): boolean {
// 	return codeParameters.fold.enabled || codeParameters.title !== null;
// }
