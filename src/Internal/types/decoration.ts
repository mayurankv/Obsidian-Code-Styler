import { Colour } from "./settings";

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
