import { EditorView, WidgetType } from "@codemirror/view";
import { MarkdownRenderer } from "obsidian";
import { PREFIX } from "src/Internal/constants/general";
import { CodeParameters, FenceCodeParameters, InlineCodeParameters, LineParameters } from "src/Internal/types/parsing";
import { isDeepStrictEqual } from "util";
import { createHeaderElement } from "../../elements";
import { foldOnClick } from "./actions";
import CodeStylerPlugin from "src/main";
import { getLanguageIcon } from "src/Internal/utils/decorating";

export class HeaderWidget extends WidgetType {
	codeParameters: CodeParameters;
	sourcePath: string;
	private fence: boolean;
	private plugin: CodeStylerPlugin;

	constructor(
		codeParameters: CodeParameters,
		sourcePath: string,
		fence: boolean,
		plugin: CodeStylerPlugin,
	) {
		super();

		this.codeParameters = structuredClone(codeParameters);
		this.sourcePath = sourcePath;
		this.fence = fence;
		this.plugin = plugin;
	}

	eq(
		other: HeaderWidget,
	): boolean {
		return (
			this.fence === other.fence &&
			this.codeParameters.language === other.codeParameters.language &&
			this.codeParameters.title === other.codeParameters.title &&
			this.codeParameters.reference === other.codeParameters.reference &&
			this.codeParameters.icon === other.codeParameters.icon &&
			this.codeParameters.ignore === other.codeParameters.ignore &&
			getLanguageIcon(this.codeParameters.language, this.plugin) == getLanguageIcon(other.codeParameters.language, other.plugin) &&
			(this.codeParameters as FenceCodeParameters)?.fold?.placeholder === (other.codeParameters as FenceCodeParameters)?.fold?.placeholder &&
			(!("fold" in this.codeParameters) || this.plugin.settings.currentTheme.settings.header.foldPlaceholder === other.plugin.settings.currentTheme.settings.header.foldPlaceholder)
		);
	}

	toDOM(
		view: EditorView,
	): HTMLElement {
		const headerContainer = createHeaderElement(
			this.codeParameters,
			this.fence,
			this.sourcePath,
			this.plugin,
		);

		if (this.fence)
			headerContainer.onclick = (event) => {
				if ((event.target as HTMLElement)?.hasClass("internal-link") || (event.target as HTMLElement)?.hasClass("external-link"))
					return;

				foldOnClick(
					view,
					headerContainer,
					folded,
					this.codeParameters.language,
				);
			};

		return headerContainer;
	}
}

export class LineNumberWidget extends WidgetType {
	lineNumbers: LineParameters;
	lineNumber: number;

	constructor(
		lineNumber: number,
		fenceCodeParameters: FenceCodeParameters,
	) {
		super();

		this.lineNumbers = structuredClone(fenceCodeParameters.lineNumbers);
		this.lineNumber = lineNumber;
	}

	eq(
		other: LineNumberWidget,
	): boolean {
		return isDeepStrictEqual(this, other);
	}

	toDOM(
		view: EditorView,
	): HTMLElement {
		return createEl(
			"span",
			{
				// TODO: Needed?
				// attr: {
				// 	style: this.maxLineNum.toString().length > (this.lineNumber + this.lineNumbers.offset).toString().length
				// 		? "width: var(--line-number-gutter-width);"
				// 		: ""
				// },
				cls: [
					PREFIX + "line-number",
				],
				text: (this.lineNumber + this.lineNumbers.offset).toString(),
			});
	}
}

export class CommentLinkWidget extends WidgetType {
	linkText: string;
	sourcePath: string;
	private plugin: CodeStylerPlugin;

	constructor(
		linkText: string,
		sourcePath: string,
		plugin: CodeStylerPlugin,
	) {
		super();

		this.linkText = linkText;
		this.sourcePath = sourcePath;
		this.plugin = plugin;
	}

	eq(
		other: LineNumberWidget,
	): boolean {
		return isDeepStrictEqual(this, other);
	}

	toDOM(
		view: EditorView,
	): HTMLElement {
		const linkParentElement = createEl(
			"span",
			{
				cls: [
					PREFIX + "line-number",
				],
			},
		);

		MarkdownRenderer.render(
			this.plugin.app,
			this.linkText,
			linkParentElement,
			this.sourcePath,
			this.plugin,
		);

		return linkParentElement;
	}
}
