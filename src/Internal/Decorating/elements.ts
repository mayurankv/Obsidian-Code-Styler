import CodeStylerPlugin from "src/main";
import { PREFIX } from "../constants/general";
import { CodeParameters, FenceCodeParameters, InlineCodeParameters } from "../types/parsing";
import { getLanguageIcon, getLanguageName } from "../utils/decorating";
import { FOLD_ATTRIBUTE, FOLD_PLACEHOLDER, GIT_ICONS, SITE_ICONS, STAMP_ICON, UPDATE_ICON } from "../constants/decoration";
import { editorLivePreviewField, MarkdownPostProcessorContext, MarkdownRenderer, MarkdownView, Notice, setIcon } from "obsidian";
import { isUrl } from "../utils/parsing";
import { rerenderCodeElement } from "src/Internal/Interface/Actions/clicks";
import { updateExternalReference } from "../utils/reference";
import { Reference } from "../types/reference";
import { getTheme } from "../utils/themes";
import { BUTTON_TIMEOUT, BUTTON_TRANSITION } from "../constants/interface";
import { viewDependentCallback } from "../utils/interface";
import { EditorView } from "@codemirror/view";
import { renderedFoldFence } from "./Rendered/fenced";
import { applyFold } from "./LivePreview/codemirror/stateEffects";
import { DATA_PREFIX } from "../constants/detecting";
import { convertBoolean } from "../utils/string";
import { copyButton } from "../utils/elements";

export function createHeaderElement(
	codeParameters: CodeParameters,
	foldStatus: boolean,
	content: string | null,
	fence: boolean,
	sourcePath: string,
	plugin: CodeStylerPlugin,
): HTMLElement {
	const headerElement = createEl(
		fence ? "div" : "span",
		{
			cls: [
				PREFIX + "header",
				...( fence ? [] : ["cm-inline-code"])
			],
			attr: {
				[FOLD_ATTRIBUTE]: foldStatus.toString(),
			},
		},
	);

	headerElement.append(
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
		createEditButton(
			codeParameters,
			fence,
			plugin,
		),
		createCopyIcon(
			codeParameters,
			content,
			fence,
			true,
			plugin,
		),
		createFoldIcon(
			codeParameters,
			foldStatus,
			fence,
			`chevron-down`,//`chevron-${foldStatus ? "right" : "down"}`,
			plugin,
		),
		createHeaderSeparator(
			codeParameters,
			fence,
			plugin,
		)
	)

	if (fence)
		headerElement.onClickEvent(
			async (event: Event) => {
				if (!event.target || !(event.target instanceof Element) || (event.target.tagName === "button") || event.target.hasClass("internal-link") || event.target.hasClass("external-link"))
					return

				if ((event.target?.tagName === "BUTTON") || (event.target.matchParent("button")))
					return

				await foldFence(event.target as HTMLElement, plugin)
			},
			{
				capture: true,
			}
		);

	return headerElement
}

export function createFooterElement(
	codeParameters: CodeParameters,
	foldStatus: boolean,
	content: string | null,
	fence: boolean,
	sourcePath: string,
	plugin: CodeStylerPlugin,
): HTMLElement {
	const footerElement = createEl(
		fence ? "div" : "span",
		{
			cls: [
				PREFIX + "footer",
				...(fence ? [] : ["cm-inline-code"]),
			],
			attr: {
				[FOLD_ATTRIBUTE]: foldStatus.toString(),
			},
		},
	);

	footerElement.append(
		createFooterSeparator(
			codeParameters,
			fence,
			plugin,
		),
		createCopyIcon(
			codeParameters,
			content,
			fence,
			false,
			plugin,
		),
		createFoldIcon(
			codeParameters,
			foldStatus,
			fence,
			foldStatus ? "ellipsis" : "chevron-up",
			plugin,
		),
	)

	return footerElement
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

function createEditButton(
	codeParameters: CodeParameters,
	fence: boolean,
	plugin: CodeStylerPlugin,
): HTMLElement {
	const editElement = createEl(
		"button",
		{
			cls: [
				PREFIX + "edit-code-button",
				...(fence ? [] : [PREFIX + "hidden"]),
			],
		},
		(element) => setIcon(element, `pencil`),
	)

	editElement.onclick = async (event: MouseEvent) => {
		if (!event.target)
			return

		await viewDependentCallback(
			plugin,
			async (view: MarkdownView, plugin: CodeStylerPlugin) => {
				// @ts-expect-error Undocumented Obsidian API
				await plugin.app.workspace.getActiveFileView().setState({ mode: 'source', source: false }, {})

				return false
			},
			async (view: EditorView, plugin: CodeStylerPlugin) => {
				//TODO: How to get full fence position in codemirror now and select codeblock?
				console.log("TO IMPLEMENT EDITING VIEW")
				const position = view.posAtDOM(event.target as HTMLElement)
				view.dispatch({
					selection: {
						head: position,
						anchor: position,
					}
				})

				view.focus()
			},
		)
	}

	return editElement
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
	content: string | null,
	fence: boolean,
	header: boolean,
	plugin: CodeStylerPlugin,
): HTMLElement {
	const copyElement = createEl(
		"button",
		{
			cls: [
				PREFIX + "copy-code-button",
				...(((fence && header && (content !== null)) || (!fence && !header)) ? [] : [PREFIX + "hidden"]),
			],
		},
		(element) => setIcon(element, "copy"),
	)

	if (content !== null)
		copyElement.onclick = async (event: MouseEvent) => await copyButton(copyElement, content)

	return copyElement
}

function createFoldIcon(
	codeParameters: CodeParameters,
	foldStatus: boolean,
	fence: boolean,
	icon: string,
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
		(element) => setIcon(element, icon),
	)

	foldElement.onclick = async (event: MouseEvent) => await foldFence(foldElement, plugin)

	return foldElement
}

async function foldFence(
	triggerElement: HTMLElement,
	plugin: CodeStylerPlugin,
): Promise<void> {
	await viewDependentCallback(
		plugin,
		(view: MarkdownView, plugin: CodeStylerPlugin) => {
			const fencePreElement = triggerElement.closest("pre.cs-pre") as HTMLElement | null
			if (!fencePreElement || !(fencePreElement.tagName.toLowerCase() === "pre"))
				return false

			renderedFoldFence(fencePreElement)

			return true
		},
		(view: EditorView, plugin: CodeStylerPlugin) => {
			const parentElement = (triggerElement.closest(`.${PREFIX}header`) ?? triggerElement.closest(`.${PREFIX}footer`))
			if (!parentElement)
				return

			view.dispatch({
				effects: applyFold.of({
					foldStatus: convertBoolean(parentElement.getAttribute(FOLD_ATTRIBUTE) ?? ""),
					position: view.posAtDOM(parentElement),
				})
			});
			console.log("Fold live preview should work but need to do recieving of effects")
			// view.requestMeasure(); //TODO: needed?
		},
	)
}

export function ignoreActionEvents(
	event: Event,
	containerSelector: string,
): boolean {
	if (!event.target)
		return false

	const targetElement = event.target as HTMLElement
	const containerElement = targetElement.closest(containerSelector)
	if (!containerElement)
		return false

	if (
		(targetElement.tagName.toLowerCase() === "button" && targetElement.hasClass(`${PREFIX}code-edit-button`)) ||
		(targetElement.matchParent("button")?.hasClass(`${PREFIX}code-edit-button`))
	)
		return false

	if (containerElement.contains(targetElement))
		return true

	return false
}
