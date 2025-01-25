import { MarkdownPostProcessorContext, MarkdownRenderer, MarkdownSectionInformation, SectionCache, normalizePath, request } from "obsidian";
import { Reference, getLineLimits, parseExternalReference, parseReferenceParameters } from "src/_temp/_Old/Parsing/ReferenceParsing";
import { EXTERNAL_REFERENCE_PATH, EXTERNAL_REFERENCE_INFO_SUFFIX, LOCAL_PREFIX, REFERENCE_CODEBLOCK, EXTERNAL_REFERENCE_CACHE } from "src/_temp/_Old/Settings";
import CodeStylerPlugin from "src/main";
import { renderSpecificReadingSection } from "./ReadingView";
import { getFileContentLines } from "./Internal/Parsing/CodeblockParsing";
import { basename } from "path";
import { rerenderRenderedView } from "src/Interface/View/rendered";

async function referenceAdjustParameters(
	fenceCodeParameters: FenceCodeParameters,
	plugin: CodeStylerPlugin,
	codeblockLines: Array<string>,
	sourcePath: string,
): Promise<FenceCodeParameters> {
	if (fenceCodeParameters.language === "reference") {
		const reference = await getReference(codeblockLines, sourcePath, plugin);
		if (!fenceCodeParameters.lineNumbers.alwaysDisabled && !fenceCodeParameters.lineNumbers.alwaysEnabled) {
			fenceCodeParameters.lineNumbers.offset = reference.startLine - 1;
			fenceCodeParameters.lineNumbers.alwaysEnabled = Boolean(reference.startLine !== 1);
		}

		if (fenceCodeParameters.title === "")
			fenceCodeParameters.title = reference.external?.info?.title ?? basename(reference.path);

		if (fenceCodeParameters.reference === "")
			//@ts-expect-error Undocumented Obsidian API
			fenceCodeParameters.reference = reference.external?.info?.displayUrl ?? reference.external?.info?.url ?? plugin.app.vault.adapter.getFilePath(reference.path);

		fenceCodeParameters.language = reference.language;
		if (reference.external)
			fenceCodeParameters.externalReference = reference;
	}

	return fenceCodeParameters;
}

export async function processor(source: string, codeblockElement: HTMLElement, context: MarkdownPostProcessorContext, plugin: CodeStylerPlugin) {
	const codeblockSectionInfo: MarkdownSectionInformation | null = context.getSectionInfo(codeblockElement);
	if (codeblockSectionInfo === null)
		throw Error("Could not retrieve codeblock information");

	const codeblockLines = [codeblockSectionInfo.text.split("\n")[codeblockSectionInfo.lineStart], ...source.split("\n")];
	if (codeblockLines[codeblockLines.length - 1] !== "")
		codeblockLines.push("");
	const reference = await getReference(codeblockLines, context.sourcePath, plugin);
	MarkdownRenderer.render(plugin.app, reference.code, codeblockElement, context.sourcePath, plugin);
	renderSpecificReadingSection(Array.from(codeblockElement.querySelectorAll("pre:not(.frontmatter)")), context.sourcePath, codeblockSectionInfo, plugin);
}

export async function getReference(codeblockLines: Array<string>, sourcePath: string, plugin: CodeStylerPlugin): Promise<Reference> {
	const reference: Reference = {
		code: "",
		language: "",
		startLine: 1,
		path: "",
	};

	try {
		const referenceParameters = parseReferenceParameters(codeblockLines.slice(1, -1).join("\n"));
		reference.language = referenceParameters.language;
		reference.path = referenceParameters.filePath;
		if (/^https?:\/\//.test(referenceParameters.filePath)) {
			const externalReferenceId = idExternalReference(reference.path);
			reference.external = {
				id: externalReferenceId.id,
				website: externalReferenceId.website,
				storePath: plugin.app.vault.configDir + EXTERNAL_REFERENCE_PATH + externalReferenceId.id,
				info: {title: "", url: reference.path, site: externalReferenceId.website, datetime: "", rawUrl: reference.path},
			};
			referenceParameters.filePath = await accessExternalReference(reference, externalReferenceId.id, sourcePath, plugin);
			reference.external.info = {...reference.external.info, ...JSON.parse(await plugin.app.vault.adapter.read(reference.external.storePath + EXTERNAL_REFERENCE_INFO_SUFFIX))};
		}
		const vaultPath = getPath(referenceParameters.filePath, "", plugin);
		if (referenceParameters.filePath.startsWith("[[") && referenceParameters.filePath.endsWith("]]"))
			reference.path = vaultPath;
		if (!(await plugin.app.vault.adapter.exists(vaultPath)))
			throw Error(`Local File does not exist at ${vaultPath}`);
		const codeContent = (await plugin.app.vault.adapter.read(vaultPath)).trim();
		const codeSectionInfo = getLineLimits(codeContent, referenceParameters);
		reference.startLine = codeSectionInfo.startLine;
		reference.code = ["```", referenceParameters.language," ",codeblockLines[0].substring(REFERENCE_CODEBLOCK.length).trim(), "\n", codeSectionInfo.codeSection, "\n", "```"].join("");
	} catch (error) {
		reference.code = `> [!error] ${((error instanceof Error) ? error.message : String(error)).replace(/\n/g,"\n>")}`;
	}
	return reference;
}

export async function manageExternalReferencedFiles(
	plugin: CodeStylerPlugin,
	sourcePath: string | null = null,
	update: boolean = true,
): Promise<void> {
	await cleanExternalReferencedFiles(plugin);

	if (update) {
		const cache = await readCache(plugin);
		const references = (sourcePath === null)
			? await getFileReferences(sourcePath, plugin)
			: Object.values(cache).map((idCache: IdCache) => idCache.reference);

		for (const reference of references) {
			await updateExternalReference(reference, plugin);
			cache[reference?.external?.id as string].reference = reference;
		}
		await updateCache(cache, plugin);
	}

	rerenderRenderedView(plugin);
}

async function cleanExternalReferencedFiles(
	plugin: CodeStylerPlugin,
): Promise<void> {
	const cache = await readCache(plugin);
	const referencesByFile = cacheToReferencesByFile(cache);

	for (const sourcePath of Object.keys(referencesByFile)) {
		const fileReferenceIds = (await getFileReferences(sourcePath, plugin)).map((reference: Reference) => reference?.external?.id as string);
		referencesByFile[sourcePath] = referencesByFile[sourcePath].filter((id: string) => fileReferenceIds.includes(id));
	}
	const new_cache = referencesByFileToCache(referencesByFile, cache);
	for (const id of Object.keys(cache)) {
		if (!Object.keys(new_cache).includes(id)) {
			await plugin.app.vault.adapter.remove(plugin.app.vault.configDir + EXTERNAL_REFERENCE_PATH + id);
			await plugin.app.vault.adapter.remove(plugin.app.vault.configDir + EXTERNAL_REFERENCE_PATH + id + EXTERNAL_REFERENCE_INFO_SUFFIX);
		}
	}
	await updateCache(new_cache, plugin);
}

function cacheToReferencesByFile(cache: Cache): ReferenceByFile {
	return Object.keys(cache).reduce((result: ReferenceByFile, id: string) => {
		cache[id].sourcePaths.forEach((sourcePath: string) => {
			if (!result[sourcePath])
				result[sourcePath] = [id];
			else
				result[sourcePath].push(id);
		});
		return result;
	}, {});
}
function referencesByFileToCache(referencesByFile: ReferenceByFile, cache: Cache): Cache {
	return Object.keys(referencesByFile).reduce((new_cache: Cache, sourcePath: string) => {
		referencesByFile[sourcePath].forEach((id: string) => {
			if (typeof new_cache?.[id] === "undefined")
				new_cache[id] = {sourcePaths: [sourcePath], reference: cache[id].reference};
			else if (!new_cache[id].sourcePaths.includes(sourcePath))
				new_cache[id].sourcePaths.push(sourcePath);
		});
		return new_cache;
	}, {});
}
async function getFileReferences(sourcePath: string, plugin: CodeStylerPlugin): Promise<Array<Reference>> {
	const fileContentLines = await getFileContentLines(sourcePath, plugin);
	if (!fileContentLines)
		throw Error(`File could not be read: ${sourcePath}`);
	const fileReference = [];
	const sections: Array<SectionCache> = plugin.app.metadataCache.getCache(sourcePath)?.sections ?? [];
	for (const section of sections) {
		if (section.type !== "code")
			continue;
		const codeblockLines = [...fileContentLines.slice(section.position.start.line, section.position.end.line), ""];
		if (!codeblockLines[0].includes("```reference") && !codeblockLines[0].includes("~~~reference"))
			continue;
		const reference = await getReference(codeblockLines, sourcePath, plugin);
		if (reference?.external?.id)
			fileReference.push(reference);
	}
	return fileReference;
}

export async function updateExternalReference(reference: Reference, plugin: CodeStylerPlugin) {
	try {
		const sourceInfo = await parseExternalReference(reference);
		const content = await request(sourceInfo.rawUrl ?? reference.path);
		await plugin.app.vault.adapter.write(reference?.external?.storePath as string, content);
		await plugin.app.vault.adapter.write(reference?.external?.storePath as string + EXTERNAL_REFERENCE_INFO_SUFFIX, JSON.stringify(sourceInfo));
	} catch(error) {
		throw Error(`Could not download file: ${error}`);
	}
}
async function accessExternalReference(reference: Reference, id: string, sourcePath: string, plugin: CodeStylerPlugin): Promise<string> {
	try {
		if (!(await plugin.app.vault.adapter.exists(reference?.external?.storePath as string)))
			await updateExternalReference(reference, plugin);
		const cache = await readCache(plugin);
		if (!cache[id]?.sourcePaths?.includes(sourcePath)) {
			if (!cache?.[id])
				cache[id] = {sourcePaths: [sourcePath], reference: reference};
			else
				cache[id].sourcePaths.push(sourcePath);
			await updateCache(cache,plugin);
		}
		return reference?.external?.storePath as string;
	} catch (error) {
		throw Error(error);
	}
}
async function readCache(plugin: CodeStylerPlugin): Promise<Cache> {
	return JSON.parse(await plugin.app.vault.adapter.read(plugin.app.vault.configDir + EXTERNAL_REFERENCE_CACHE));
}
async function updateCache(cache: Cache, plugin: CodeStylerPlugin): Promise<void> {
	await plugin.app.vault.adapter.write(plugin.app.vault.configDir + EXTERNAL_REFERENCE_CACHE, JSON.stringify(cache));
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
		if (!sourcePath && sourcePath != "")
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
