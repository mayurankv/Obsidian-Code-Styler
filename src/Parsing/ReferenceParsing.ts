import { parseYaml } from "obsidian";

export interface ReferenceParameters {
	filePath: string;
	language: string;
	repository?: string;
	start?: string | number | RegExp;
	end?: string | number | RegExp;
}

interface PassedParameters {
	filePath?: string;
	file?: string;
	path?: string;
	link?: string;
	repository?: string;
	repo?: string;
	language?: string;
	lang?: string;
	start?: string | number;
	end?: string | number;
}

export function parseReferenceParameters(source: string): ReferenceParameters {
	source = source.replace(/^([^:]+):(.+)\n/, "$1: $2\n");
	const passedParameters: PassedParameters = parseYaml(source);
	if (passedParameters === source)
		throw Error("YAML Parse Error");
	const filePath = passedParameters?.filePath ?? passedParameters?.file ?? passedParameters?.path ?? passedParameters?.link;
	if (filePath === undefined)
		throw Error("No file specified");
	const referenceParameters: ReferenceParameters = {filePath: filePath, language: passedParameters?.language ?? passedParameters?.lang ?? getLanguage(filePath)};
	const repository = passedParameters?.repository ?? passedParameters?.repo;
	if (repository !== undefined)
		referenceParameters.repository = repository;
	const start = getLineIdentifier(String(passedParameters.start));
	if (start !== undefined)
		referenceParameters.start = start;
	const end = getLineIdentifier(String(passedParameters.end));
	if (end !== undefined)
		referenceParameters.end = end;
	return referenceParameters;
}

function getLineIdentifier(lineIdentifier: string | undefined): RegExp | string | number | undefined {
	if (lineIdentifier === undefined)
		return undefined;
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
}

function getLanguage(filePath: string): string {
	return filePath.slice((filePath.lastIndexOf(".") - 1 >>> 0) + 2);
}
