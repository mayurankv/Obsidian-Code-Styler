import { AnyRange, BaseRange } from "./decoration"
import { InlineCodeParameters, LinkType } from "./parsing"

export type CodeDetectingContext = "settings" | "export" | "slides" | "admonition" | "callout" | "standalone"

export interface InlineCodeInfo {
	parameters: AnyRange<InlineCodeParameters>,
	content: AnyRange<string>,
	section: BaseRange,
}
