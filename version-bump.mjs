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
let changelog = readFileSync("CHANGELOG.md", "utf8");
const lastVersion = /\[Unreleased\]: \/..\/..\/compare\/(\d+.\d+.\d+)...HEAD/.exec(changelog)?.[1] ?? "0.0.0";
process.env.release_notes = /(?<=## \[Unreleased\])[\s\S]*?\n(?=## )/.exec(changelog)[0].trim().replace(/###/g,"#");
writeFileSync("CHANGELOG.md",changelog.replace(/## \[Unreleased\]/,`## [Unreleased]\n\n## [${newVersion}] - ${new Date().toISOString().slice(0, 10)}`).replace(/(?<=\[Unreleased\]: \/..\/..\/compare\/)(\d+.\d+.\d+)...HEAD/,`${newVersion}...HEAD\n[${newVersion}]: /../../compare/${lastVersion}...${newVersion}`));

// Push to origin
exec(`git add . && git commit -m 'Ready release ${newVersion}' && git push && git tag -a $npm_package_version -F- <<EOF && git push origin $npm_package_version && git push origin $npm_package_version
$release_notes
EOF`,(error)=>console.log(error));
