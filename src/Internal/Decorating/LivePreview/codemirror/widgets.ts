import { EditorView, WidgetType } from "@codemirror/view";
import { MarkdownRenderer } from "obsidian";
import { PREFIX } from "src/Internal/constants/general";
import { FenceCodeParameters, InlineCodeParameters, LineParameters } from "src/Internal/types/parsing";
import { isDeepStrictEqual } from "util";
import { createHeaderElement } from "../../elements";
import { foldOnClick } from "./actions";

export class FenceHeaderWidget extends WidgetType {
	fenceCodeParameters: FenceCodeParameters;
	sourcePath: string;

	constructor(
		fenceCodeParameters: FenceCodeParameters,
		sourcePath: string,
	) {
		super();

		this.fenceCodeParameters = structuredClone(fenceCodeParameters);
		this.sourcePath = sourcePath;
	}

	eq(
		other: FenceHeaderWidget,
	): boolean {
		this.iconURL = getLanguageIcon(this.fenceCodeParameters.language,plugin.languageIcons);
		this.hidden = isHeaderHidden(this.fenceCodeParameters,this.themeSettings,this.iconURL);
		return (
			isDeepStrictEqual(this, other) &&
			this.fenceCodeParameters.language === other.fenceCodeParameters.language &&
			this.fenceCodeParameters.title === other.fenceCodeParameters.title &&
			this.fenceCodeParameters.reference === other.fenceCodeParameters.reference &&
			// isDeepStrictEqual(this.fenceCodeParameters.fold, other.fenceCodeParameters.fold) &&
			this.fenceCodeParameters.fold.enabled === other.fenceCodeParameters.fold.enabled &&
			this.fenceCodeParameters.fold.placeholder === other.fenceCodeParameters.fold.placeholder &&
			this.themeSettings.header.foldPlaceholder === other.themeSettings.header.foldPlaceholder &&
			this.themeSettings.header.languageIcon.display === other.themeSettings.header.languageIcon.display &&
			this.themeSettings.header.languageTag.display === other.themeSettings.header.languageTag.display &&
			this.folded === other.folded &&
			this.iconURL === other.iconURL
		);
	}

	toDOM(
		view: EditorView,
	): HTMLElement {
		const headerContainer = createHeaderElement(
			this.fenceCodeParameters,
			true,
			this.sourcePath,
			plugin,
		);

		headerContainer.onclick = (event) => {
			if ((event.target as HTMLElement)?.hasClass("internal-link") || (event.target as HTMLElement)?.hasClass("external-link"))
				return;

			foldOnClick(
				view,
				headerContainer,
				this.folded,
				this.fenceCodeParameters.language,
			);
		};

		return headerContainer;
	}
}

export class InlineHeaderWidget extends WidgetType {
	inlineCodeParameters: InlineCodeParameters;

	constructor(
		inlineCodeParameters: InlineCodeParameters,
	) {
		super();

		this.inlineCodeParameters = inlineCodeParameters;
	}

	eq(
		other: InlineHeaderWidget,
	): boolean {
		return (
			this.inlineCodeParameters.language == other.inlineCodeParameters.language &&
			this.inlineCodeParameters.title == other.inlineCodeParameters.title &&
			this.inlineCodeParameters.icon == other.inlineCodeParameters.icon &&
			getLanguageIcon(this.inlineCodeParameters.language,this.plugin.languageIcons) == getLanguageIcon(other.inlineCodeParameters.language,other.plugin.languageIcons)
		);
	}

	toDOM(): HTMLElement {
		return createHeaderElement(
			this.inlineCodeParameters,
			false,
			sourcePath,
			plugin,
		);
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

	constructor(
		linkText: string,
		sourcePath: string,
	) {
		super();

		this.linkText = linkText;
		this.sourcePath = sourcePath;
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
			plugin.app,
			this.linkText,
			linkParentElement,
			this.sourcePath,
			plugin,
		);

		return linkParentElement;
	}
}
