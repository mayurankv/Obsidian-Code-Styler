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
	language: string | null = null;
	title: string | null = null;
	reference: string | null = null;
	theme: string | null = null;
	dark: boolean | null = null;
	icon: boolean = true;
	ignore: boolean = false;
}

export interface LineParameters {
	enabled: boolean | null;
	offset: number | null;
}

export interface FoldParameters {
	enabled: boolean | null;
	placeholder: string | null;
}

export class FenceCodeParameters extends CodeParameters {
	fold: FoldParameters = {enabled: null, placeholder: null};
	lineNumbers: LineParameters = {enabled: null, offset: null};
	lineUnwrap: boolean | null | "inactive" = null;
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
