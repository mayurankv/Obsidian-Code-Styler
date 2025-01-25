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

export type LineIdentifier = null | string | number | RegExp;

export class ReferenceParameters {
	filePath: string = "";
	language: string = "";
	start: LineIdentifier = null;
	end: LineIdentifier = null;

    public constructor(init?:Partial<ReferenceParameters>) {
        Object.assign(this, init);
    }
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

export interface PassedParameters {
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
