import { MarkdownPostProcessorContext, MarkdownRenderer, MarkdownSectionInformation, normalizePath, request } from "obsidian";
import { Reference, parseExternalReference, parseReferenceParameters } from "src/Parsing/ReferenceParsing";
import { EXTERNAL_REFERENCE_PATH, EXTERNAL_REFERENCE_INFO_SUFFIX, LOCAL_PREFIX, REFERENCE_CODEBLOCK } from "src/Settings";
import CodeStylerPlugin from "src/main";
import { renderSpecificReadingSection } from "./ReadingView";

export async function referenceCodeblockProcessor(source: string, codeblockElement: HTMLElement, context: MarkdownPostProcessorContext, plugin: CodeStylerPlugin) {
	const codeblockSectionInfo: MarkdownSectionInformation | null = context.getSectionInfo(codeblockElement);
	if (codeblockSectionInfo === null)
		throw Error("Could not retrieve codeblock information");

	const codeblockLines = [codeblockSectionInfo.text.split("\n")[codeblockSectionInfo.lineStart], ...source.split("\n")];
	if (codeblockLines[codeblockLines.length - 1] !== "")
		codeblockLines.push("");
	const reference = await getReference(codeblockLines, context.sourcePath, plugin);
	renderFile(reference, codeblockElement, context, plugin);
	renderSpecificReadingSection(Array.from(codeblockElement.querySelectorAll("pre:not(.frontmatter)")), context.sourcePath, codeblockSectionInfo, plugin);
}

function renderFile(reference: Reference, codeblockElement: HTMLElement, context: MarkdownPostProcessorContext, plugin: CodeStylerPlugin) {
	MarkdownRenderer.render(plugin.app, reference.code, codeblockElement, context.sourcePath, plugin);
}

export async function getReference(codeblockLines: Array<string>, sourcePath: string, plugin: CodeStylerPlugin): Promise<Reference> {
	const referenceParameters = parseReferenceParameters(codeblockLines.slice(1,-1).join("\n"));
	const reference: Reference = {
		code: "",
		language: referenceParameters.language,
		startLine: 1,
		path: referenceParameters.filePath,
	};

	try {
		if (/^https?:\/\//.test(referenceParameters.filePath)) {
			const externalReferenceId = idExternalReference(reference.path);
			reference.external = {
				website: externalReferenceId.website,
				storePath: EXTERNAL_REFERENCE_PATH + externalReferenceId.id,
				info: {title: "", url: reference.path, site: externalReferenceId.website, rawUrl: reference.path},
			};
			referenceParameters.filePath = await accessExternalReference(reference, plugin);
			reference.external.info = { ...reference.external.info, ...JSON.parse(await plugin.app.vault.adapter.read(reference.external.storePath + EXTERNAL_REFERENCE_INFO_SUFFIX)) };
		}
		const vaultPath = getPath(referenceParameters.filePath, sourcePath, plugin);
		if (referenceParameters.filePath.startsWith("[[") && referenceParameters.filePath.endsWith("]]"))
			reference.path = vaultPath;
		if (!(await plugin.app.vault.adapter.exists(vaultPath)))
			throw Error(`Local File does not exist at ${vaultPath}`);
		const codeContent = (await plugin.app.vault.adapter.read(vaultPath)).trim();
		//TODO (@mayurankv) Get starting line number
		reference.code = ["```", referenceParameters.language," ",codeblockLines[0].substring(REFERENCE_CODEBLOCK.length).trim(), "\n", codeContent, "\n", "```"].join("");
	} catch (error) {
		reference.code = `> [!error] ${(error instanceof Error) ? error.message : String(error)}`;
	}
	return reference;
}

async function accessExternalReference(reference: Reference, plugin: CodeStylerPlugin): Promise<string> {
	try {
		if (!(await plugin.app.vault.adapter.exists(reference?.external?.storePath as string)))
			await updateExternalReference(reference, plugin);
		return reference?.external?.storePath as string;
	} catch (error) {
		throw Error(error);
	}
}

async function updateExternalReference(reference: Reference, plugin: CodeStylerPlugin) {
	try {
		const sourceInfo = await parseExternalReference(reference);
		const content = await request(sourceInfo.rawUrl ?? reference.path);
		await plugin.app.vault.adapter.write(reference?.external?.storePath as string, content);
		await plugin.app.vault.adapter.write(reference?.external?.storePath as string + EXTERNAL_REFERENCE_INFO_SUFFIX, JSON.stringify(sourceInfo));
	} catch(error) {
		throw Error(`Could not download file: ${error}`);
	}
}

function idExternalReference(fileLink: string): {id: string, website: string} {
	const linkInfo = /^https?:\/\/(.+)\.com\/(.+)$/.exec(fileLink);
	if (!linkInfo?.[1] || !linkInfo?.[2])
		throw Error("No such repository could be found");
	return {id: [linkInfo[1], ...linkInfo[2].split("/")].join("-"), website: linkInfo[1]};
}

function getPath(filePath: string, sourcePath: string, plugin: CodeStylerPlugin): string {
	filePath = filePath.trim();
	if (filePath.startsWith("[[") && filePath.endsWith("]]"))
		return plugin.app.metadataCache.getFirstLinkpathDest(filePath.slice(2,-2), sourcePath)?.path ?? filePath;
	filePath = filePath.replace("\\", "/");
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
