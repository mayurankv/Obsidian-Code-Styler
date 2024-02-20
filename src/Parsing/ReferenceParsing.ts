import { parseYaml, requestUrl } from "obsidian";

export interface Reference {
	startLine: number;
	code: string;
	language: string;
	path: string;
	external?: {
		storePath: string,
		website: string,
		info: ExternalReferenceInfo;
	}
}

type LineIdentifier = null | string | number | RegExp;

export interface ReferenceParameters {
	filePath: string;
	language: string;
	start: LineIdentifier;
	end: LineIdentifier;
}

export interface ExternalReferenceInfo {
	title: string;
	url: string;
	site: string;
	datetime: string;
	rawUrl: string;
	displayUrl?: string;
	author?: string;
	repository?: string;
	path?: string;
	fileName?: string;
	refInfo?: {
		ref: string;
		type: string;
		hash: string;
	};
}

interface PassedParameters {
	filePath?: string;
	file?: string;
	path?: string;
	link?: string;
	language?: string;
	lang?: string;
	start?: string | number;
	end?: string | number;
}

export function parseReferenceParameters(source: string): ReferenceParameters {
	source = source.replace(/^([^:]+):(.+)\n/, "$1: $2\n").replace(/(?<!")\[\[(.*?)\]\](?!")/, "\"[[$1]]\"");
	let passedParameters: PassedParameters | string | null = parseYaml(source);
	if (passedParameters as string === source || passedParameters === null)
		throw Error("YAML Parse Error");
	passedParameters = passedParameters as PassedParameters;
	const filePath = passedParameters?.filePath ?? passedParameters?.file ?? passedParameters?.path ?? passedParameters?.link;
	if (typeof filePath === "undefined")
		throw Error("No file specified");
	const referenceParameters: ReferenceParameters = {filePath: filePath, language: passedParameters?.language ?? passedParameters?.lang ?? getLanguage(filePath), start: null, end: null};
	referenceParameters.start = getLineIdentifier(passedParameters.start);
	referenceParameters.end = getLineIdentifier(passedParameters.end);
	return referenceParameters;
}

export async function parseExternalReference(reference: Reference): Promise<Partial<ExternalReferenceInfo>> {
	const HEADERS = { "Accept": "application/json", "Content-Type": "application/json" };
	try {
		if (reference.external?.website === "github") {
			reference.path = (reference.path.split("?")[0]).replace(/(?<=github.com\/.*\/.*\/)raw(?=\/)/,"blob");
			const info = (await requestUrl({url: reference.path, method: "GET", headers: HEADERS})).json;
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
		throw Error(`Could not parse external URL: ${error}`);
	}
}

function getLanguage(filePath: string): string {
	if (filePath.startsWith("[[") && filePath.endsWith("]]"))
		filePath = filePath.slice(2, -2);
	return filePath.slice((filePath.lastIndexOf(".") - 1 >>> 0) + 2);
}

export function getLineLimits(codeContent: string, referenceParameters: ReferenceParameters): { codeSection: string, startLine: number } {
	try {
		const lines = codeContent.split("\n");
		let startIndex: number;
		let endIndex: number;
		if (referenceParameters.start === null)
			startIndex = 0;
		else if (typeof referenceParameters.start === "number")
			startIndex = referenceParameters.start - 1;
		else if ((referenceParameters.start as string)?.startsWith("/") && (referenceParameters.start as string)?.endsWith("/")) {
			const startRegex = new RegExp((referenceParameters.start as string).replace(/^\/(.*)\/$/, "$1"));
			startIndex = lines.findIndex((line) => startRegex.test(line));
		} else
			startIndex = lines.findIndex((line) => line.indexOf(referenceParameters.start as string) > -1);
		if (referenceParameters.end === null)
			endIndex = lines.length - 1;
		else if (typeof referenceParameters.end === "number")
			endIndex = referenceParameters.end - 1;
		else if ((referenceParameters.end as string)?.startsWith("/") && (referenceParameters.end as string)?.endsWith("/")) {
			const endRegex = new RegExp((referenceParameters.end as string).replace(/^\/(.*)\/$/, "$1"));
			endIndex = lines.findIndex((line) => endRegex.test(line));
		} else if ((referenceParameters.end as string)?.startsWith("+"))
			endIndex = startIndex + Number((referenceParameters.end as string).slice(1));
		else
			endIndex = lines.findIndex((line) => line.indexOf(referenceParameters.end as string) > -1);
		if (startIndex > endIndex)
			throw Error("Specified Start line is afterthe specified End line");
		else if (startIndex === -1)
			throw Error("Start line could not be found");
		else if (endIndex === -1)
			throw Error("End line could not be found");
		return { codeSection: lines.slice(startIndex, endIndex + 1).join("\n"), startLine: startIndex + 1 };
	} catch (error) {
		throw Error(error);
	}
}

function getLineIdentifier(lineIdentifier: string | number | undefined): LineIdentifier {
	if (typeof lineIdentifier === "undefined")
		return null;
	else if (typeof lineIdentifier === "number")
		return lineIdentifier;
	else if (/^\/(.*)\/$/.test(lineIdentifier)) { // Regex
		try {
			return new RegExp(lineIdentifier.replace(/^\/(.*)\/$/, "$1"));
		} catch {
			throw Error("Invalid Regular Expression");
		}
	}  else if (/".*"/.test(lineIdentifier)) // Plain Text
		return lineIdentifier.substring(1,lineIdentifier.length-1);
	else if (/'.*'/.test(lineIdentifier)) // Plain Text
		return lineIdentifier.substring(1,lineIdentifier.length-1);
	else if (/\D/.test(lineIdentifier)) // Plain Text //TODO (@mayurankv) Should this be \D+ ??
		return lineIdentifier;
	else if (/\d+/.test(lineIdentifier)) // Plain Number
		return parseInt(lineIdentifier);
	return null;
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
