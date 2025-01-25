import { Reference } from "./reference";

export class FenceCodeParameters {
	language: string = "";
	title: string = "";
	reference: string = "";
	// icon //TODO: Add
	fold: {
		enabled: boolean;
		placeholder: string;
	} = {enabled: false, placeholder: ""};
	lineNumbers: {
		alwaysEnabled: boolean;
		alwaysDisabled: boolean;
		offset: number;
	} = {alwaysEnabled: false, alwaysDisabled: false, offset: 0};
	lineUnwrap: {
		alwaysEnabled: boolean;
		alwaysDisabled: boolean;
		activeWrap: boolean;
	} = {alwaysEnabled: false, alwaysDisabled: false, activeWrap: false};
	highlights: {
		default: Highlights;
		alternative: Record<string, Highlights>
	} = { default: { lineNumbers: [], plainText: [], regularExpressions: []}, alternative: {} };
	ignore: boolean = false;
	externalReference?: Reference;

    public constructor(init?:Partial<FenceCodeParameters>) {
        Object.assign(this, init);
    }
}

export interface Highlights {
	lineNumbers: Array<number>;
	plainText: Array<string>;
	regularExpressions: Array<RegExp>;
}

export class InlineCodeParameters {
	language: string = "";
	title: string = "";
	icon: boolean = false;
	ignore: boolean = false;

    public constructor(init?:Partial<InlineCodeParameters>) {
        Object.assign(this, init);
    }
}
