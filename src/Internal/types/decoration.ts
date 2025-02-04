import { Range, RangeValue } from "@codemirror/state";
import { FenceCodeParameters } from "./parsing";

export type HEX = `#${string}`;
export type CSS = `--${string}`;
export type Colour = HEX | "transparent" | "inherit" | CSS;
export type Percentage = `${number}%` | CSS;
export type Size = "auto" | `${number}em` | `${number}rem` | `${number}px` | Percentage
export type FontFamily = string
export type FontStyle = string
export type FontWeight = Size
export type Filter = `none` | `grayscale(${Size})` | CSS

export interface ThemeStyle {
	border?: {
		size: number;
		style: string;
	},
	scrollbar?: boolean;
	extra?: string;
}

export interface Language {
	icon?: string;
	colour?: Colour;
	inlineComment?: Array<string>;
	blockComment?: Array<{
		open: string;
		close: string;
		continuation?: string; // Default: None
		multiline?: string; // Default: true
	}>;
}

export class FenceInfo {
	parameters: FenceCodeParameters = new FenceCodeParameters({});

	headerStart: number = 0;
	bodyStart: number = 0;
	bodyEnd: number = 0;
	footerEnd: number = 0;

	lineNumber: number = 0;
	lineStart: number = 0;
	lineEnd: number = 0;
	lineText: string = "";

	toDecorate: boolean = false;
	baseFoldStatus: boolean = false;
	currentFoldStatus: boolean = false;
	content: string = "";
	sourcePath: string = "";

	decorations: Array<Range<any>> = [];

	public constructor(init?: Partial<FenceInfo>) {
        Object.assign(this, init);
    }
}

export class FenceState extends RangeValue {
	fold: boolean = false;
	scroll: number = 0;
	startFound: boolean = false;
	endFound: boolean = false;
}

export class BaseRange {
    readonly from: number;
    readonly to: number;
}
export class AnyRange<T extends any> extends BaseRange {
    readonly value: T;
}
