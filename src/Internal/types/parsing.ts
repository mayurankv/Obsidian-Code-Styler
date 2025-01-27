import { Reference } from "./reference";

export type LinkType = "markdown" | "wiki" | "url"
export interface LinkInfo {
	title: string,
	reference: string,
	type: LinkType,
	match: string,
	offset: number,
}

export class CodeParameters {
	language: string = "";
	title: string = "";
	reference: string = "";
	icon: boolean = true;
	ignore: boolean = false;
}

export interface LineParameters {
	alwaysEnabled: boolean;
	alwaysDisabled: boolean;
	offset: number;
}

export class FenceCodeParameters extends CodeParameters {
	fold: {
		enabled: boolean;
		placeholder: string;
	} = {enabled: false, placeholder: ""};
	lineNumbers: LineParameters = {alwaysEnabled: false, alwaysDisabled: false, offset: 0};
	lineUnwrap: {
		alwaysEnabled: boolean;
		alwaysDisabled: boolean;
		activeWrap: boolean;
	} = {alwaysEnabled: false, alwaysDisabled: false, activeWrap: false};
	highlights: {
		default: Highlights;
		alternative: Record<string, Highlights>
	} = { default: { lineNumbers: [], plainText: [], regularExpressions: []}, alternative: {} };
	externalReference?: Reference;

	public constructor(init?: Partial<FenceCodeParameters>) {
		super()
        Object.assign(this, init);
    }
}

export interface Highlights {
	lineNumbers: Array<number>;
	plainText: Array<string>;
	regularExpressions: Array<RegExp>;
}

export class InlineCodeParameters extends CodeParameters {
    public constructor(init?:Partial<InlineCodeParameters>) {
		super()
        Object.assign(this, init);
    }
}
