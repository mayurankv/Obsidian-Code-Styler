import { readFileSync, writeFileSync } from "fs";
import { exec } from "child_process";

// Get new version
const newVersion = process.env.npm_package_version;

// Read minAppVersion from manifest.json and bump version to target version
let manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const { minAppVersion } = manifest;
manifest.version = newVersion;
writeFileSync("manifest.json", JSON.stringify(manifest, null, "\t"));

// Update versions.json with target version and minAppVersion from manifest.json
let versions = JSON.parse(readFileSync("versions.json", "utf8"));
versions[newVersion] = minAppVersion;
writeFileSync("versions.json", JSON.stringify(versions, null, "\t"));

// Update CHANGELOG.md
let changelogText = readFileSync("CHANGELOG.md", "utf8");
const lastVersion = /\[Unreleased\]: \/..\/..\/compare\/(\d+.\d+.\d+)...HEAD/.exec(changelogText)?.[1] ?? "0.0.0";
process.env.release_notes = /(?<=## \[Unreleased\])[\s\S]*?\n(?=## )/.exec(changelogText)[0].trim();
writeFileSync("CHANGELOG.md",changelogText.replace(/## \[Unreleased\]/,`## [Unreleased]\n\n## [${newVersion}] - ${new Date().toISOString().slice(0, 10)}`).replace(/(?<=\[Unreleased\]: \/..\/..\/compare\/)(\d+.\d+.\d+)...HEAD/,`${newVersion}...HEAD\n[${newVersion}]: /../../compare/${lastVersion}...${newVersion}`));

// Update settings
let settingsText = readFileSync("src/settings.ts", "utf8");
const settingsUpdaterText = /const settingsUpdaters: Record<string,\(settings: CodeStylerSettings\)=>CodeStylerSettings> = {[\s\S]*?\n(?=})/.exec(settingsText)?.[0];
writeFileSync("src/settings.ts",settingsText.replace(/(?<=export const DEFAULT_SETTINGS: CodeStylerSettings = {[\s\S]*?version: ")(.*)(?="[\s\S]*?})/,newVersion).replace(settingsUpdaterText,settingsUpdaterText+(settingsUpdaterText.split("\n").some(line=>line.trim().startsWith(`"${newVersion}"`))?"":`\t"${newVersion}": settingsPreserve,\n`)));


// Push to origin
exec(`git add . && git commit -m 'Ready release ${newVersion}' && git push && git tag -a $npm_package_version -F- <<EOF && git push origin $npm_package_version && git push origin $npm_package_version
$release_notes
EOF`,(error)=>console.log(error));
