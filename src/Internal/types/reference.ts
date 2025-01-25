export interface Reference {
	startLine: number;
	code: string;
	language: string;
	path: string;
	external?: {
		id: string,
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

export type Cache = Record<string, IdCache>
export interface IdCache {
	sourcePaths: Array<string>;
	reference: Reference;
}
export type ReferenceByFile = Record<string,Array<string>>
