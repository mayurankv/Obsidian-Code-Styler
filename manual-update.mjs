import { readFileSync, writeFileSync } from "fs";

const url = "https://raw.githubusercontent.com/twibiral/obsidian-execute-code/master/src/main.ts";
let settingsText = readFileSync("src/Settings.ts", "utf8");
fetch(url).then(r => r.text()).then(text=>{
	const languageAliases = /export const languageAliases = \[([\s\S]*?)\]/.exec(text)?.[1]?.replace(/\s*/g,"");
	const canonicalLanguages = /export const canonicalLanguages = \[([\s\S]*?)\]/.exec(text)?.[1]?.replace(/\s*/g,"");
	writeFileSync("src/Settings.ts",settingsText.replace(/const EXECUTE_CODE_LANGUAGE_ALIASES: Array<string> = \[([\s\S]*?)\]/,`const EXECUTE_CODE_LANGUAGE_ALIASES: Array<string> = [${languageAliases}]`).replace(/const EXECUTE_CODE_CANONICAL_LANGUAGES: Array<string> = \[([\s\S]*?)\]/,`const EXECUTE_CODE_CANONICAL_LANGUAGES: Array<string> = [${canonicalLanguages}]`));
});
