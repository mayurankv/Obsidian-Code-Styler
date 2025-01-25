export type HEX = `#${string}`;
export type CSS = `--${string}`;
export type Colour = HEX | CSS;

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
