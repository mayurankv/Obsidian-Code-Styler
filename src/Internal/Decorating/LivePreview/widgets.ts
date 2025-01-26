import { WidgetType } from "@codemirror/view";
import { FenceCodeParameters, LineParameters } from "src/Internal/types/parsing";
import { isDeepStrictEqual } from "util";

class LineNumberWidget extends WidgetType {
	lineNumber: number;
	lineNumbers: LineParameters;
	visible: boolean;
	//TODO: Fix
	maxLineNum: number;

	constructor(
		lineNumber: number,
		fenceCodeParameters: FenceCodeParameters,
		visible: boolean = true,
		maxLineNum: number,
	) {
		super();
		this.lineNumber = lineNumber;
		this.lineNumbers = fenceCodeParameters.lineNumbers;
		this.visible = visible;
		//TODO: Fix
		this.maxLineNum = maxLineNum;
	}

	eq(
		other: LineNumberWidget,
	): boolean {
		return isDeepStrictEqual(this, other);
	}

	toDOM(): HTMLElement {
		//TODO: Fix
		return createSpan(
			{
				attr: {
					style: this.maxLineNum.toString().length > (this.lineNumber + this.lineNumbers.offset).toString().length
						? "width: var(--line-number-gutter-width);"
						: ""
				},
				cls: [
					"code-styler-line-number",
				],
				text: (this.lineNumber + this.lineNumbers.offset).toString(),
			});
	}
}
