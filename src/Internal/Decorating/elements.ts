import CodeStylerPlugin from "src/main";
import { PREFIX } from "../constants/general";
import { CodeParameters, FenceCodeParameters, InlineCodeParameters } from "../types/parsing";
import { getLanguageIcon, getLanguageName } from "../utils/decorating";
import { FOLD_PLACEHOLDER, GIT_ICONS, SITE_ICONS, STAMP_ICON, UPDATE_ICON } from "../constants/decoration";
import { MarkdownPostProcessorContext, MarkdownRenderer } from "obsidian";
import { isUrl } from "../utils/parsing";
import { rerenderCodeElement } from "src/Internal/Interface/Actions/clicks";
import { updateExternalReference } from "../utils/reference";
import { Reference } from "../types/reference";

export function createHeaderElement(
	codeParameters: CodeParameters,
	fence: boolean,
	sourcePath: string,
	plugin: CodeStylerPlugin,
): HTMLElement {
	const fenceHeaderElement = createEl(
		fence ? "div" : "span",
		{
			cls: [
				PREFIX + "header",
				...( fence ? [] : ["cm-inline-code"])
			],
		},
	);

	fenceHeaderElement.append(
		createIcon(
			codeParameters,
			fence,
			plugin,
		),
		createLanguageTitle(
			codeParameters,
			fence,
			plugin,
		),
		createNamedTitle(
			codeParameters,
			fence,
			sourcePath,
			plugin,
		),
		createExternalReferenceTitle(
			codeParameters,
			fence,
			plugin,
		),
		createExecuteCodeTitle(
			codeParameters,
			fence,
			plugin,
		),
		createHeaderSeparator(
			codeParameters,
			fence,
			plugin,
		)
	)

	return fenceHeaderElement
}

export function createFooterElement(
	codeParameters: CodeParameters,
	fence: boolean,
	sourcePath: string,
	plugin: CodeStylerPlugin,
): HTMLElement {
	const fenceFooterElement = createEl(
		fence ? "div" : "span",
		{
			cls: [
				PREFIX + "footer",
				...(fence ? [] : ["cm-inline-code"]),
			],
		},
	);

	fenceFooterElement.append(
		createFooterSeparator(
			codeParameters,
			fence,
			plugin,
		),
		createCopyIcon(
			codeParameters,
			fence,
			plugin,
		),
	)

	return fenceFooterElement
}

function createIcon(
	codeParameters: CodeParameters,
	fence: boolean,
	plugin: CodeStylerPlugin,
): HTMLElement {
	const iconUrl = getLanguageIcon(codeParameters.language, plugin)
	const imgContainer = createEl(
		fence ? "div" : "span",
		{
			cls: [
				PREFIX + "icon-container",
				...(codeParameters.icon && (iconUrl !== null) ? [] : [PREFIX + "hidden"]),
			],
		},
	)

	imgContainer.appendChild(
		createEl(
			"img",
			{ cls: PREFIX + "icon" },
			(imgElement) => imgElement.src = (iconUrl === null ? "" : iconUrl),
		)
	)

	return imgContainer
}

function createLanguageTitle(
	codeParameters: CodeParameters,
	fence: boolean,
	plugin: CodeStylerPlugin,
): HTMLElement {
	return createEl(
		fence ? "div" : "span",
		{
			cls: [
				PREFIX + "language-title",
				...(codeParameters.language !== "" ? [] : [PREFIX + "hidden"]),
			],
			text: getLanguageName(codeParameters.language)
		},
	)
}

function createNamedTitle(
	codeParameters: CodeParameters,
	fence: boolean,
	sourcePath: string,
	plugin: CodeStylerPlugin,
): HTMLElement {
	const title = fence
		? codeParameters.title || (codeParameters as FenceCodeParameters).fold.placeholder || plugin.settings.currentTheme.settings.header.foldPlaceholder || FOLD_PLACEHOLDER || ""
		: codeParameters.title || ""
	const namedTitleContainer = createEl(
		fence ? "div" : "span",
		{
			cls: [
				PREFIX + "title",
				...(codeParameters.title !== "" ? [] : [PREFIX + "hidden"]),
			],
			text: title,
		},
	)

	if (codeParameters.reference !== "")
		MarkdownRenderer.render( //TODO (@mayurankv) Add links to metadata cache properly
			plugin.app,
			isUrl(codeParameters.reference)
				? `[${title}](${codeParameters.reference})`
				: `[[${codeParameters.reference}|${title}]]`,
			namedTitleContainer,
			sourcePath,
			plugin,
		);

	return namedTitleContainer
}

function createExternalReferenceTitle(
	codeParameters: CodeParameters,
	fence: boolean,
	plugin: CodeStylerPlugin,
): HTMLElement {
	//TODO (@mayurankv) Add theme settings to conditionally set sections
	const tagName = fence ? "div" : "span"
	const externalReferenceContainer = createEl(
		tagName,
		{
			cls: [
				"code-styler-header-external-reference",
				...((fence && (codeParameters as FenceCodeParameters)?.externalReference) ? [] : [PREFIX + "hidden"])
			],
		},
	);

	if (fence)
		externalReferenceContainer.append(
			createEl(
				tagName,
				{
					cls: [
						PREFIX + "external-reference-repo-icon",
					],
				},
				(element) => element.innerHTML = SITE_ICONS?.[(codeParameters as FenceCodeParameters)?.externalReference?.external?.info?.site as string]?? SITE_ICONS["generic"],
			),
			createEl(
				tagName,
				{
					cls: [
						PREFIX + "external-reference-repo",
					],
					text: [
						(codeParameters as FenceCodeParameters)?.externalReference?.external?.info?.author,
						(codeParameters as FenceCodeParameters)?.externalReference?.external?.info?.repository,
					].join("/")
				},
			),
			createEl(
				tagName,
				{
					cls: [
						PREFIX + "external-reference-ref-icon",
					],
				},
				(element) => element.innerHTML = GIT_ICONS?.[(codeParameters as FenceCodeParameters)?.externalReference?.external?.info?.refInfo?.type as string] ?? GIT_ICONS["branch"],
			),
			createEl(
				tagName,
				{
					cls: [
						PREFIX + "external-reference-ref",
					],
					text: (codeParameters as FenceCodeParameters)?.externalReference?.external?.info?.refInfo?.ref as string,
				}),
			createEl(
				tagName,
				{
					cls: [
						PREFIX + "external-reference-timestamp-icon",
					],
				},
				(element) => element.innerHTML = STAMP_ICON,
			),
			createEl(
				tagName,
				{
					cls: [
						PREFIX + "external-reference-timestamp",
					],
					text: (codeParameters as FenceCodeParameters)?.externalReference?.external?.info?.datetime as string,
				},
			),
			createEl(
				"button",
				{
					cls: [
						PREFIX + "external-reference-update-icon",
					],
				},
				(buttonElement) => {
					buttonElement.innerHTML = UPDATE_ICON;
					buttonElement.title = "Update Reference";
					buttonElement.addEventListener(
						"click",
						async (event) => {
							event.stopImmediatePropagation()

							await updateExternalReference(
								(codeParameters as FenceCodeParameters)?.externalReference as Reference,
								plugin,
							)

							rerenderCodeElement(
								event.target,
								plugin,
							)
						}
					);
				},
			),
		)


	return externalReferenceContainer

	//TODO:
	return createEl(
		fence ? "div" : "span",
		{
			cls: [
				PREFIX + "reference-title",
				...(codeParameters.title !== ""  ? [] : [PREFIX + "hidden"]),
			],
			text: fence
				? codeParameters.title || (codeParameters as FenceCodeParameters).fold.placeholder || plugin.settings.currentTheme.settings.header.foldPlaceholder || FOLD_PLACEHOLDER || ""
				: ""
		},
	)
}

function createExecuteCodeTitle(
	codeParameters: CodeParameters,
	fence: boolean,
	plugin: CodeStylerPlugin,
): HTMLElement {
	//TODO (@mayurankv) Finish
	console.debug("Execute code title section uncomplete")
	return createEl(
		fence ? "div" : "span",
		{
			cls: [
				PREFIX + "execute-code-title",
				...(false ? [] : [PREFIX + "hidden"]),
			],
		},
	)
}

function createHeaderSeparator(
	codeParameters: CodeParameters,
	fence: boolean,
	plugin: CodeStylerPlugin,
): HTMLElement {
	return createEl(
		fence ? "div" : "span",
		{
			cls: [
				PREFIX + "separator",
				...((!fence &&((codeParameters.title !== "") || codeParameters.icon)) ? [] : [PREFIX + "hidden"]),
			],
			text: '\uff5c',
		},
	)
}

function createFooterSeparator(
	codeParameters: CodeParameters,
	fence: boolean,
	plugin: CodeStylerPlugin,
): HTMLElement {
	return createEl(
		fence ? "div" : "span",
		{
			cls: [
				PREFIX + "separator",
				...(false ? [] : [PREFIX + "hidden"]),
			],
			text: '\uff5c',
		},
	)
}

function createCopyIcon(
	codeParameters: CodeParameters,
	fence: boolean,
	plugin: CodeStylerPlugin,
): HTMLElement {
	return createEl(
		fence ? "div" : "span",
		{
			cls: [
				PREFIX + "copy-icon",
				...(true ? [] : [PREFIX + "hidden"]),
			],
			text: "C",
		},
	)
}
