import { Reference } from "./reference";

export interface FenceCodeParameters {
	language: string;
	title: string;
	reference: string;
	fold: {
		enabled: boolean;
		placeholder: string;
	}
	lineNumbers: {
		alwaysEnabled: boolean;
		alwaysDisabled: boolean;
		offset: number;
	},
	lineUnwrap: {
		alwaysEnabled: boolean;
		alwaysDisabled: boolean;
		activeWrap: boolean;
	},
	highlights: {
		default: Highlights;
		alternative: Record<string,Highlights>
	},
	ignore: boolean;
	externalReference?: Reference;
}

export interface Highlights {
	lineNumbers: Array<number>;
	plainText: Array<string>;
	regularExpressions: Array<RegExp>;
}

export interface InlineCodeParameters {
	language: string;
	title: string;
	icon: boolean;
}
