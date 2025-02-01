export type HEX = `#${string}`;
export type CSS = `--${string}`;
export type Colour = HEX | CSS;
export type Percentage = `${number}%` | CSS;
export type Size = `${number}em` | `${number}rem` | `${number}px` | Percentage
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
