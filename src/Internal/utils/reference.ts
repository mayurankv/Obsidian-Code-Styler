import { normalizePath, request, SectionCache } from "obsidian";
import { LOCAL_PREFIX } from "../constants/interface";
import CodeStylerPlugin from "src/main";
import { EXTERNAL_REFERENCE_CACHE, EXTERNAL_REFERENCE_INFO_SUFFIX, EXTERNAL_REFERENCE_PATH, REFERENCE_CODEBLOCK } from "../constants/reference";
import { Cache, IdCache, Reference, ReferenceByFile } from "../types/reference";
import { getLineLimits, parseExternalReference, parseReferenceParameters } from "../Parsing/reference";
import { getFileContentLines } from "./rendered";
import { rerenderRenderedView } from "src/Internal/Interface/View/rendered";
import { isUrl } from "./parsing";

export async function getReference(
	codeblockLines: Array<string>,
	sourcePath: string,
	plugin: CodeStylerPlugin,
): Promise<Reference> {
	try {
		const parsedReference: Partial<Reference> = {}

		const referenceParameters = parseReferenceParameters(codeblockLines.slice(1, -1).join("\n"));

		parsedReference.language = referenceParameters.language
		parsedReference.path = referenceParameters.filePath

		if (isUrl(referenceParameters.filePath)) {
			const externalReferenceId = getExternalReferenceId(referenceParameters.filePath);

			parsedReference.external = {
				id: externalReferenceId.id,
				website: externalReferenceId.website,
				storePath: plugin.app.vault.configDir + EXTERNAL_REFERENCE_PATH + externalReferenceId.id,
				info: {
					title: "",
					url: referenceParameters.filePath,
					site: externalReferenceId.website,
					datetime: "",
					rawUrl: referenceParameters.filePath,
				},
			};

			referenceParameters.filePath = await accessExternalReference(
				{
					startLine: 1,
					code: "",
					language: parsedReference.language,
					path: parsedReference.path,
					external: parsedReference.external
				},
				externalReferenceId.id,
				sourcePath,
				plugin,
			);
			parsedReference.external.info = {
				...parsedReference.external.info,
				...JSON.parse(await plugin.app.vault.adapter.read(parsedReference.external.storePath + EXTERNAL_REFERENCE_INFO_SUFFIX)),
			};
		}

		const vaultPath = getPath(
			referenceParameters.filePath,
			"",
			plugin,
		);

		if (!(await plugin.app.vault.adapter.exists(vaultPath)))
			throw Error(`Local File does not exist at ${vaultPath}`);

		const codeSectionInfo = getLineLimits(
			(await plugin.app.vault.adapter.read(vaultPath)).trim(),
			referenceParameters,
		);

		parsedReference.startLine = codeSectionInfo.startLine
		parsedReference.code = `\`\`\`${referenceParameters.language} ${codeblockLines[0].substring(REFERENCE_CODEBLOCK.length).trim()}\n${codeSectionInfo.codeSection}\n\`\`\``
		parsedReference.path = referenceParameters.filePath.startsWith("[[") && referenceParameters.filePath.endsWith("]]")
			? parsedReference.path
			: vaultPath

		return new Reference(parsedReference);

	} catch (error) {
		return new Reference({
			code: `> [!error] ${((error instanceof Error) ? error.message : String(error)).replace(/\n/g, "\n>")}`,
		});
	}
}

export async function manageExternalReferencedFiles(
	plugin: CodeStylerPlugin,
	sourcePath: string | null = null,
	update: boolean = true,
): Promise<void> {
	await cleanExternalReferencedFiles(plugin);

	if (update) {
		const cache = await readCache(plugin);
		const references = (sourcePath !== null)
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
	for (const id of Object.keys(cache).filter((id) => !Object.keys(new_cache).includes(id))) {
		await plugin.app.vault.adapter.remove(plugin.app.vault.configDir + EXTERNAL_REFERENCE_PATH + id);
		await plugin.app.vault.adapter.remove(plugin.app.vault.configDir + EXTERNAL_REFERENCE_PATH + id + EXTERNAL_REFERENCE_INFO_SUFFIX);
	}

	await updateCache(new_cache, plugin);
}

function cacheToReferencesByFile(
	cache: Cache,
): ReferenceByFile {
	return Object.keys(cache).reduce(
		(result: ReferenceByFile, id: string) => {
			cache[id].sourcePaths.forEach(
				(sourcePath: string) => {
					if (!result[sourcePath])
						result[sourcePath] = [id];
					else
						result[sourcePath].push(id);
				},
			);

			return result;
		}, {},
	);
}

function referencesByFileToCache(
	referencesByFile: ReferenceByFile,
	cache: Cache,
): Cache {
	return Object.keys(referencesByFile).reduce(
		(new_cache: Cache, sourcePath: string) => {
			referencesByFile[sourcePath].forEach((id: string) => {
				if (typeof new_cache?.[id] === "undefined")
					new_cache[id] = {sourcePaths: [sourcePath], reference: cache[id].reference};
				else if (!new_cache[id].sourcePaths.includes(sourcePath))
					new_cache[id].sourcePaths.push(sourcePath);
			});

			return new_cache;
		},
		{},
	);
}

async function getFileReferences(
	sourcePath: string,
	plugin: CodeStylerPlugin,
): Promise<Array<Reference>> {
	const fileContentLines = await getFileContentLines(sourcePath, plugin.app.vault.adapter);
	if (!fileContentLines)
		throw new Error(`File could not be read: ${sourcePath}`);

	const fileReference = [];

	const sections: Array<SectionCache> = plugin.app.metadataCache.getCache(sourcePath)?.sections ?? [];
	for (const section of sections) {
		if (section.type !== "code")
			continue;

		const codeblockLines = [...fileContentLines.slice(section.position.start.line, section.position.end.line), ""];
		if (!new RegExp("[`~][`~][`~]+ *reference", "g").test(codeblockLines[0]))
			continue;

		const reference = await getReference(
			codeblockLines,
			sourcePath,
			plugin,
		);

		if (reference?.external?.id)
			fileReference.push(reference);
	}

	return fileReference;
}

async function accessExternalReference(
	reference: Reference,
	id: string,
	sourcePath: string,
	plugin: CodeStylerPlugin,
): Promise<string> {
	try {
		if (reference?.external?.storePath && !(await plugin.app.vault.adapter.exists(reference?.external?.storePath)))
			await updateExternalReference(reference, plugin);

		const cache = await readCache(plugin);
		if (!cache[id]?.sourcePaths?.includes(sourcePath)) {
			if (!cache?.[id])
				cache[id] = {sourcePaths: [], reference: reference};

			cache[id].sourcePaths.push(sourcePath);

			await updateCache(cache,plugin);
		}
		return reference?.external?.storePath as string;

	} catch (error) {
		throw new Error(error);
	}
}

export async function updateExternalReference(
	reference: Reference,
	plugin: CodeStylerPlugin,
): Promise<void> {
	try {
		const sourceInfo = await parseExternalReference(reference);
		const content = await request(sourceInfo.rawUrl ?? reference.path);

		await plugin.app.vault.adapter.write(
			reference?.external?.storePath as string,
			content,
		);
		await plugin.app.vault.adapter.write(
			reference?.external?.storePath as string + EXTERNAL_REFERENCE_INFO_SUFFIX,
			JSON.stringify(sourceInfo),
		);

	} catch (error) {
		throw new Error(`Could not download file: ${error}`);
	}
}

async function readCache(
	plugin: CodeStylerPlugin,
): Promise<Cache> {
	return JSON.parse(
		await plugin.app.vault.adapter.read(
			plugin.app.vault.configDir + EXTERNAL_REFERENCE_CACHE,
		),
	);
}

async function updateCache(
	cache: Cache,
	plugin: CodeStylerPlugin,
): Promise<void> {
	await plugin.app.vault.adapter.write(
		plugin.app.vault.configDir + EXTERNAL_REFERENCE_CACHE,
		JSON.stringify(cache),
	);
}

function getPath(
	filePath: string,
	sourcePath: string,
	plugin: CodeStylerPlugin,
): string {
	filePath = filePath.trim();

	if (filePath.startsWith("[[") && filePath.endsWith("]]"))
		return plugin.app.metadataCache.getFirstLinkpathDest(
			filePath.slice(2, -2),
			sourcePath,
		)?.path ?? filePath;

	filePath = filePath.replace("\\", "/");

	if (filePath.startsWith(LOCAL_PREFIX))
		return filePath.substring(2);

	else if (filePath.startsWith("./") || /^[^<:"/\\>?|*]/.test(filePath)) {
		if (!sourcePath && sourcePath !== "")
			throw new Error("Cannot resolve relative path because the source path is missing");

		return getRelativePath(filePath, sourcePath.trim());

	} else if (filePath.startsWith("/"))
		throw new Error(`Path should not start with "/", use "${LOCAL_PREFIX}" to reference a path relative to the vault root folder`);

	else
		throw new Error("Cannot resolve path");
}

function getRelativePath(
	filePath: string,
	sourcePath: string,
): string {
	if (filePath.startsWith("./"))
		filePath = filePath.substring(2);

	const vaultDirs = sourcePath.split("/");
	vaultDirs.pop();
	while (filePath.startsWith("../"))
		if (vaultDirs.pop() !== undefined)
			filePath = filePath.substring(3);
		else
			throw new Error("Path references outside vault, too many \"../\"s used");

	return normalizePath([...vaultDirs, filePath].join("/"));
}

function getExternalReferenceId(
	fileLink: string,
): { id: string, website: string } {
	if (!isUrl(fileLink))
		throw new Error("Invalid URL passed")

	const linkInfo = fileLink.match(/^(?:https?:\/\/)?(.+)\.(?:com|io|ai)\/(.+)$/);

	if (!linkInfo?.[1] || !linkInfo?.[2])
		throw new Error("No such repository could be found");

	return {
		id: [linkInfo[1], ...linkInfo[2].split("/")].join("-"),
		website: linkInfo[1],
	};
}

export function timeStamp(): string {
	const date = new Date();
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hour = String(date.getHours()).padStart(2, "0");
	const minute = String(date.getMinutes()).padStart(2, "0");
	// const second = String(date.getSeconds()).padStart(2, "0");

	return `${year}-${month}-${day} ${hour}:${minute}`;
}
