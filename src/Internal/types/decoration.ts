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
	start: number = 0;
	lineNumber: number = 0;
	lineStart: number = 0;
	lineEnd: number = 0;
	lineText: string = "";
	parameters: FenceCodeParameters = new FenceCodeParameters({});
	inCode: boolean = false;
	toDecorate: boolean = false;
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
