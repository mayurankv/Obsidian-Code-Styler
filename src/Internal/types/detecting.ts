import { InlineCodeParameters, LinkType } from "./parsing"

export type CodeDetectingContext = "settings" | "export" | "slides" | "admonition" | "callout" | "standalone"

export interface InlineCodeInfo {
	parameters: {
		from: number,
		to: number,
		value: InlineCodeParameters,
	},
	content: {
		from: number,
		to: number,
		value: string,
	},
	section: {
		from: number,
		to: number,
	}
}
