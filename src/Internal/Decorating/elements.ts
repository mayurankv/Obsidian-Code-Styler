import CodeStylerPlugin from "src/main";
import { PREFIX } from "../constants/general";
import { CodeParameters, FenceCodeParameters, InlineCodeParameters } from "../types/parsing";
import { getLanguageIcon, getLanguageName } from "../utils/decorating";
import { FOLD_PLACEHOLDER, GIT_ICONS, SITE_ICONS, STAMP_ICON, UPDATE_ICON } from "../constants/decoration";
import { MarkdownPostProcessorContext, MarkdownRenderer, Notice, setIcon } from "obsidian";
import { isUrl } from "../utils/parsing";
import { rerenderCodeElement } from "src/Internal/Interface/Actions/clicks";
import { updateExternalReference } from "../utils/reference";
import { Reference } from "../types/reference";
import { getTheme } from "../utils/themes";
import { BUTTON_TIMEOUT, BUTTON_TRANSITION } from "../constants/interface";

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
	content: string,
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
			content,
			fence,
			plugin,
		),
		createCopyIcon(
			codeParameters,
			content,
			fence,
			plugin,
		),
		createFoldIcon(
			codeParameters,
			content,
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
				...(codeParameters.language !== null ? [] : [PREFIX + "hidden"]),
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
	const title = codeParameters.title ?? (fence && (codeParameters as FenceCodeParameters).fold.enabled ? ((codeParameters as FenceCodeParameters).fold.placeholder ?? getTheme(plugin).settings.fence.foldPlaceholder) : "")
	const namedTitleContainer = createEl(
		fence ? "div" : "span",
		{
			cls: [
				PREFIX + "named-title",
				...(codeParameters.title !== null ? [] : [PREFIX + "hidden"]),
			],
		},
	)

	if (codeParameters.reference !== null)
		MarkdownRenderer.render( //TODO (@mayurankv) Add links to metadata cache properly
			plugin.app,
			isUrl(codeParameters.reference)
				? `[${title}](${codeParameters.reference})`
				: `[[${codeParameters.reference}|${title}]]`,
			namedTitleContainer,
			sourcePath,
			plugin,
		);
	else
		namedTitleContainer.innerText = title;

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
				PREFIX+"external-reference",
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
						PREFIX + "external-reference-repository-icon",
					],
				},
				(element) => setIcon(element, SITE_ICONS?.[(codeParameters as FenceCodeParameters)?.externalReference?.external?.info?.site as string]?? SITE_ICONS["generic"]),
			),
			createEl(
				tagName,
				{
					cls: [
						PREFIX + "external-reference-repository",
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
						PREFIX + "external-reference-version-icon",
					],
				},
				(element) => setIcon(element, GIT_ICONS?.[(codeParameters as FenceCodeParameters)?.externalReference?.external?.info?.refInfo?.type as string] ?? GIT_ICONS["branch"]),
			),
			createEl(
				tagName,
				{
					cls: [
						PREFIX + "external-reference-version",
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
				(element) => setIcon(element, STAMP_ICON),
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
					setIcon(buttonElement, UPDATE_ICON);
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

							new Notice("Updated External Reference");
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
				...(codeParameters.title !== null  ? [] : [PREFIX + "hidden"]),
			],
			text: fence
				? codeParameters.title || (codeParameters as FenceCodeParameters).fold.placeholder || getTheme(plugin).settings.fence.foldPlaceholder || FOLD_PLACEHOLDER || ""
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
	console.debug("Execute code title section incomplete")
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
				...((!fence && ((codeParameters.title !== null) || (codeParameters.language !== null && (codeParameters.icon || true)))) ? [] : [PREFIX + "hidden"]), //TODO: true should be setting if to add language title
			],
			text: '\uff5c',
		},
	)
}

function createFooterSeparator(
	codeParameters: CodeParameters,
	content: string,
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
	content: string,
	fence: boolean,
	plugin: CodeStylerPlugin,
): HTMLElement {
	const copyElement = createEl(
		"button",
		{
			cls: [
				PREFIX + "copy-code-button",
				...(!fence ? [] : [PREFIX + "hidden"]),
			],
		},
		(element) => setIcon(element, "copy"),
	)

	copyElement.onclick = async (event: MouseEvent) => {
		await navigator.clipboard.writeText(content)
		new Notice("Copied to your clipboard");

		setIcon(copyElement, "check")
		copyElement.style.color = "var(--text-success)"
		copyElement.style.transition = "opacity, background-color"
		copyElement.style.transitionDuration = `${BUTTON_TRANSITION}ms`

		setTimeout(
			() => {
				copyElement.style.color = ""
			},
			BUTTON_TIMEOUT - 1,
		);

		setTimeout(
			() => {
				setIcon(copyElement, "copy")
				copyElement.style.transition = ""
				copyElement.style.transitionDuration = ""
			},
			BUTTON_TIMEOUT,
		);
	}

	return copyElement
}

function createFoldIcon(
	codeParameters: CodeParameters,
	content: string,
	fence: boolean,
	plugin: CodeStylerPlugin,
): HTMLElement {
	const foldElement = createEl(
		"button",
		{
			cls: [
				PREFIX + "fold-code-button",
				...(fence ? [] : [PREFIX + "hidden"]),
			],
		},
		(element) => setIcon(element, "chevron-up"),
	)

	return foldElement
}
