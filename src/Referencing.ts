import { MarkdownPostProcessorContext, MarkdownRenderer, MarkdownSectionInformation, TFile, normalizePath } from "obsidian";
import { ReferenceParameters, parseReferenceParameters } from "src/Parsing/ReferenceParsing";
import { LOCAL_PREFIX, REFERENCE_CODEBLOCK } from "src/Settings";
import CodeStylerPlugin from "src/main";

export async function referenceCodeblockProcessor(source: string, codeblockElement: HTMLElement, context: MarkdownPostProcessorContext, plugin: CodeStylerPlugin) {
	const codeblockSectionInfo: MarkdownSectionInformation | null = context.getSectionInfo(codeblockElement);
	if (codeblockSectionInfo === null)
		throw Error("Could not retrieve codeblock information");
	const referenceParameters = parseReferenceParameters(source);
	if (referenceParameters?.repository !== undefined) {
		// Get github file
		// Store in settings folder
		const storePath = "";

		referenceParameters.filePath = storePath;
	}
	renderLocalFile(referenceParameters, codeblockElement, context, codeblockSectionInfo, plugin);
}

export async function renderLocalFile(referenceParameters: ReferenceParameters, codeblockElement: HTMLElement, context: MarkdownPostProcessorContext, codeblockSectionInfo: MarkdownSectionInformation, plugin: CodeStylerPlugin) {
	let codeblockContent: string;
	try {
		const vaultPath = getPath(normalizePath(referenceParameters.filePath), context.sourcePath);
		const vaultFile = this.app.vault.getAbstractFileByPath(vaultPath);
		if (!(vaultFile instanceof TFile))
			throw Error(`${vaultPath} is not a file`);
		const codeContent = (await this.app.vault.read(vaultFile)).trim();
		const parameterLine = codeblockSectionInfo.text.split("\n")[codeblockSectionInfo.lineStart].substring(REFERENCE_CODEBLOCK.length).trim();
		codeblockContent = ["```", referenceParameters.language," ",parameterLine, "\n", codeContent, "\n", "```"].join("");
	} catch (error) {
		codeblockContent = `> [!error] ${(error instanceof Error) ? error.message : String(error)}`;
	}
	MarkdownRenderer.render(plugin.app, codeblockContent, codeblockElement, context.sourcePath, plugin);
}

function getPath(filePath: string, sourcePath: string): string {
	filePath = filePath.trim().replace("\\", "/");
	if (filePath.startsWith(LOCAL_PREFIX))
		return filePath.substring(2);
	else if (filePath.startsWith("./") || /^[^<:"/\\>?|*]/.test(filePath)) {
		if (!sourcePath)
			throw Error("Cannot resolve relative path because the source path is missing");
		return getRelativePath(filePath, sourcePath.trim());
	}  else if (filePath.startsWith("/"))
		throw Error(`Path should not start with "/", use "${LOCAL_PREFIX}" to reference a path relative to the vault root folder`);
	else
		throw Error("Cannot resolve path");
}

function getRelativePath(filePath: string, sourcePath: string) {
	if (filePath.startsWith("./"))
		filePath = filePath.substring(2);
	const vaultDirs = sourcePath.split("/");
	vaultDirs.pop();
	while (filePath.startsWith("../"))
		if (vaultDirs.pop() !== undefined)
			filePath = filePath.substring(3);
		else
			throw Error("Path references outside vault, too many \"../\"s used");
	return normalizePath([...vaultDirs, filePath].join("/"));
}
