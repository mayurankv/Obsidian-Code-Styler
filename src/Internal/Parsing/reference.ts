import { parseYaml, requestUrl } from "obsidian";
import { ExternalReferenceInfo, LineIdentifier, PassedParameters, Reference, ReferenceParameters } from "../types/reference";
import { timeStamp } from "../utils/reference";


export function parseReferenceParameters(
	source: string,
): ReferenceParameters {
	source = source.replace(/^([^:]+):(.+)\n/, "$1: $2\n").replace(/(?<!")\[\[(.*?)\]\](?!")/, "\"[[$1]]\"");

	let passedParameters: PassedParameters | string | null = parseYaml(source);
	if (typeof passedParameters === "string" || passedParameters === null)
		throw new Error("YAML Parse Error");

	const filePath = passedParameters?.filePath ?? passedParameters?.file ?? passedParameters?.path ?? passedParameters?.link;
	if (typeof filePath === "undefined")
		throw Error("No file specified");

	const referenceParameters = new ReferenceParameters({
		filePath: filePath,
		language: passedParameters?.language ?? passedParameters?.lang ?? getLanguage(filePath),
		start: getLineIdentifier(passedParameters?.start ?? null),
		end: getLineIdentifier(passedParameters?.end ?? null),
	});

	return referenceParameters;
}

function getLineIdentifier(lineIdentifier: string | number | null): LineIdentifier {
	if (lineIdentifier === null)
		return null;

	else if (typeof lineIdentifier === "number")
		return lineIdentifier;

	else if (/^\/(.*)\/$/.test(lineIdentifier)) { // Regex
		try {
			return new RegExp(lineIdentifier.replace(/^\/(.*)\/$/, "$1"));
		} catch { throw new Error("Invalid Regular Expression"); }

	} else if (/".*"/.test(lineIdentifier))
		return lineIdentifier.substring(1,lineIdentifier.length-1);

	else if (/'.*'/.test(lineIdentifier))
		return lineIdentifier.substring(1,lineIdentifier.length-1);

	else if (/\D+/.test(lineIdentifier))
		return lineIdentifier;

	else if (/\d+/.test(lineIdentifier))
		return parseInt(lineIdentifier);

	return null;
}

function getLanguage(
	filePath: string,
): string {
	if (filePath.startsWith("[[") && filePath.endsWith("]]"))
		filePath = filePath.slice(2, -2);

	filePath = filePath.split("/").pop() ?? "";
	filePath = filePath.split(".").pop() ?? "";
	// filePath = filePath.slice((filePath.lastIndexOf(".") - 1 >>> 0) + 2);

	return filePath;
}

export async function parseExternalReference(
	reference: Reference,
): Promise<Partial<ExternalReferenceInfo>> {
	const HEADERS = { "Accept": "application/json", "Content-Type": "application/json" };

	try {
		if (reference.external?.website === "github") {
			reference.path = (reference.path.split("?")[0]).replace(/(?<=github.com\/.*\/.*\/)raw(?=\/)/,"blob");

			const info = (await requestUrl({ url: reference.path, method: "GET", headers: HEADERS })).json;

			return {
				title: info.payload.blob.displayName, // title: info.title,
				rawUrl: info.payload.blob.rawBlobUrl,
				datetime: timeStamp(),
				displayUrl: reference.path,
				author: info.payload.repo.ownerLogin,
				repository: info.payload.repo.name,
				path: info.payload.path,
				fileName: info.payload.blob.displayName,
				refInfo: {
					ref: info.payload.refInfo.name,
					type: info.payload.refInfo.refType,
					hash: info.payload.refInfo.currentOid
				},
			};

		} else if (reference.external?.website === "gitlab") {
			reference.path = (reference.path.split("?")[0]).replace(/(?<=gitlab.com\/.*\/.*\/)raw(?=\/)/, "blob");

			const info = (await requestUrl({ url: reference.path, method: "GET", headers: HEADERS })).json;

			//TODO (@mayurankv) Update
			return {
				title: info.name,
				rawUrl: "https://gitlab.com" + info.raw_path,
				datetime: timeStamp(),
				displayUrl: reference.path,
				author: reference.path.match(/(?<=^https?:\/\/gitlab.com\/).*?(?=\/)/)?.[0] ?? "",
				repository: reference.path.match(/(?<=^https?:\/\/gitlab.com\/.*?\/).*?(?=\/)/)?.[0] ?? "",
				path: info.path,
				fileName: info.name,
				refInfo: {
					ref: "", //TODO (@mayurankv) Parse from url
					type: "",  //TODO (@mayurankv) Parse from url
					hash: info.last_commit_sha
				},
			};
		}  else if (reference.external?.website === "bitbucket") {
			//TODO (@mayurankv) Update
			return {
				title: "",
				rawUrl: "",
				datetime: timeStamp(),
			};

		} else if (reference.external?.website === "sourceforge") {
			//TODO (@mayurankv) Update
			return {
				title: "",
				rawUrl: "",
				datetime: timeStamp(),
			};

		} else {
			//TODO (@mayurankv) Update
			return {
				title: "",
				rawUrl: reference.path,
				datetime: timeStamp(),
			};
		}
	} catch (error) {
		throw new Error(`Could not parse external URL: ${error}`);
	}
}

export function getLineLimits(codeContent: string, referenceParameters: ReferenceParameters): { codeSection: string, startLine: number } {
	try {
		const lines = codeContent.split("\n");

		const startIndex = referenceParameters.start === null
			? 0
			: typeof referenceParameters.start === "number"
			? referenceParameters.start - 1
			: (referenceParameters.start as string)?.startsWith("/") && (referenceParameters.start as string)?.endsWith("/")
			? lines.findIndex((line) => new RegExp((referenceParameters.start as string).slice(1, -1)).test(line))
			: lines.findIndex((line) => line.indexOf(referenceParameters.start as string) > -1);

		const endIndex = referenceParameters.end === null
			? lines.length - 1
			: typeof referenceParameters.end === "number"
			? referenceParameters.end - 1
			: (referenceParameters.end as string)?.startsWith("/") && (referenceParameters.end as string)?.endsWith("/")
			? lines.findIndex((line) => new RegExp((referenceParameters.end as string).slice(1,-1)).test(line))
			: (referenceParameters.end as string)?.startsWith("+")
			? startIndex + Number((referenceParameters.end as string).slice(1))
			: lines.findIndex((line) => line.indexOf(referenceParameters.end as string) > -1)

		if (startIndex > endIndex)
			throw new Error("Specified Start line is afterthe specified End line");
		else if (startIndex === -1)
			throw new Error("Start line could not be found");
		else if (endIndex === -1)
			throw new Error("End line could not be found");

		return {
			codeSection: lines.slice(startIndex, endIndex + 1).join("\n"),
			startLine: startIndex + 1,
		};

	} catch (error) {
		throw new Error(error);
	}
}
