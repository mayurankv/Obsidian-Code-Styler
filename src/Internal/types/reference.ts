export class Reference {
	startLine: number = 1;
	code: string = "";
	language: string = "";
	path: string = "";
	external?: {
		id: string,
		storePath: string,
		website: string,
		info: ExternalReferenceInfo;
	} = undefined

    public constructor(init?:Partial<Reference>) {
        Object.assign(this, init);
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

export class ExternalReferenceInfo {
	title: string = "";
	url: string = "";
	site: string = "";
	datetime: string = "";
	rawUrl: string = "";
	displayUrl?: string = undefined;
	author?: string = undefined;
	repository?: string = undefined;
	path?: string = undefined;
	fileName?: string = undefined;
	refInfo?: {
		ref: string;
		type: string;
		hash: string;
	} = undefined;
	
    public constructor(init?:Partial<ReferenceParameters>) {
        Object.assign(this, init);
    }
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
