import { ElementContent } from "hast";
import { fromHtml } from "hast-util-from-html";
import { toHtml } from "hast-util-to-html";
import { MarkdownPostProcessorContext, sanitizeHTMLToDom } from "obsidian";
import { DECORATED_ATTRIBUTE, DEFAULT_FOLD_ATTRIBUTE, FOLD_ATTRIBUTE, WRAP_ATTRIBUTE } from "src/Internal/constants/decoration";
import { DETECTING_CONTEXT, PARAMETERS_ATTRIBUTE } from "src/Internal/constants/detecting";
import { PREFIX } from "src/Internal/constants/general";
import { CodeDetectingContext } from "src/Internal/types/detecting";
import { FenceCodeParameters } from "src/Internal/types/parsing";
import CodeStylerPlugin from "src/main";
import { visitParents } from "unist-util-visit-parents";
import { parseFenceCodeParameters, referenceAdjustParameters, toDecorateFenceCode } from "../../Parsing/fenced";
import { convertCommentLinks, getIndentation, getLineClasses } from "../../utils/decorating";
import { createFooterElement, createHeaderElement } from "../elements";
import { BUTTON_TIMEOUT, BUTTON_TRANSITION, FOLD_TRANSITION } from "src/Internal/constants/interface";
import { convertBoolean } from "src/Internal/utils/string";
import { animateIconChange, copyButton, toggleFoldIcon } from "src/Internal/utils/elements";

export async function renderedFencedCodeDecorating(
	element: HTMLElement,
	context: MarkdownPostProcessorContext,
	plugin: CodeStylerPlugin,
): Promise<void> {
	const fenceCodeElements = Array.from(element.querySelectorAll(`pre:not(frontmatter) > code[${PARAMETERS_ATTRIBUTE}]`))
	for (const fenceCodeElement of fenceCodeElements as Array<HTMLElement>) {
		if (!fenceCodeElement.hasClass("is-loaded"))
			console.debug("Code not loaded")

		asyncDecorateFenceCodeElement(fenceCodeElement, context, plugin)
	}
}

export function renderedFencedCodeUndecorating(): void {
	document.querySelectorAll(`pre.${PREFIX}pre > code.${PREFIX}code:nth-of-type(1)`).forEach((codeblockCodeElement: HTMLElement) => {
		codeblockCodeElement.innerHTML = Array.from(codeblockCodeElement.querySelectorAll("code > [class*=\"code-styler-line\"]")).reduce(
			(reconstructedCodeblockLines: Array<string>, codeblockLine: HTMLElement): Array<string> => {
					const codeblockLineText = (codeblockLine.firstChild as HTMLElement | null);
					if (codeblockLineText)
						reconstructedCodeblockLines.push(codeblockLineText.innerHTML);

					return reconstructedCodeblockLines;
				},
				[],
			).join("\n") + "\n";
		}
	);

	const removableElements = [
		...Array.from(document.querySelectorAll(`pre.${PREFIX}pre .${PREFIX}.header`)),
		...Array.from(document.querySelectorAll(`pre.${PREFIX}pre .${PREFIX}.line-number`)),
	]
	removableElements.forEach(element => element.remove());

	document.querySelectorAll(`.${PREFIX}pre-parent`).forEach(fencePreParentElement => {
		fencePreParentElement.classList.remove(`${PREFIX}pre-parent`);
		for (const cls of Array.from(fencePreParentElement.classList))
			if (cls.startsWith(`${PREFIX}pre-parent-`))
				fencePreParentElement.classList.remove(cls);
	});
	document.querySelectorAll(`pre.${PREFIX}pre`).forEach((fencePreElement: HTMLElement) => {
		fencePreElement.classList.remove(`${PREFIX}pre`);
		for (const cls of Array.from(fencePreElement.classList))
			if (cls.startsWith(`${PREFIX}pre-`))
				fencePreElement.classList.remove(cls);

		fencePreElement.removeAttribute(DEFAULT_FOLD_ATTRIBUTE);
		fencePreElement.removeAttribute(FOLD_ATTRIBUTE);
		fencePreElement.removeAttribute(WRAP_ATTRIBUTE);

		fencePreElement.style.removeProperty("max-height");
	});
	document.querySelectorAll(`code.${PREFIX}code`).forEach((fenceCodeElement: HTMLElement) => {
		fenceCodeElement.classList.remove(`${PREFIX}code`)
	});
	document.querySelectorAll("pre > code ~ code.language-output").forEach((executeCodeOutput: HTMLElement) => {
		executeCodeOutput.classList.remove(`${PREFIX}execute-code-output`);
	});
}

export function renderedViewFold(
	contentEl: HTMLElement,
	fold: boolean | null,
): void {
	const codeblockPreElements = contentEl.querySelectorAll(`pre.${PREFIX}pre`);
	codeblockPreElements.forEach(
		(codeblockPreElement: HTMLElement) => {
			renderedFoldFence(
				codeblockPreElement,
				fold ?? (codeblockPreElement.getAttribute(DEFAULT_FOLD_ATTRIBUTE) ?? "false") === "true",
			);
		},
	);
}

export const mutationObservers: Record<string, MutationObserver> = {
	// fenceCode: new MutationObserver((mutations: Array<MutationRecord>) => {
	// 	mutations.forEach((mutation: MutationRecord) => {
	// 		const fenceCodeElement = mutation.target as HTMLElement;
	// 		foo(fenceCodeElement, context, plugin)
	// 		if (mutation.type !== "childList" || (mutation.target as HTMLElement).tagName !== "PRE")
	// 			return;

	// 		const executeCodeOutput = (mutation.target as HTMLElement).querySelector("pre > code ~ code.language-output");
	// 		executeCodeOutput?.classList?.add("execute-code-output");
	// 	});
	// }),
	executeCode: new MutationObserver((mutations: Array<MutationRecord>) => {
		mutations.forEach((mutation: MutationRecord) => {
			if (mutation.type !== "childList" || (mutation.target as HTMLElement).tagName !== "PRE")
				return;

			(mutation.target as HTMLElement).querySelector("pre > code ~ code.language-output")?.classList?.add(PREFIX+"execute-code-output");
		});
	}),
};

async function asyncDecorateFenceCodeElement(
	fenceCodeElement: HTMLElement,
	context: MarkdownPostProcessorContext,
	plugin: CodeStylerPlugin,
) {
	await sleep(20)
	const decorated = fenceCodeElement.getAttribute(DECORATED_ATTRIBUTE) ?? "false"
	if (decorated === "true")
		return;

	fenceCodeElement.setAttribute(DECORATED_ATTRIBUTE, "true")

	let fenceCodeParameters = parseFenceCodeParameters(
		fenceCodeElement.getAttribute(PARAMETERS_ATTRIBUTE) ?? " ",
		plugin,
	);

	if (!toDecorateFenceCode(fenceCodeParameters, plugin))
		return;

	fenceCodeParameters = await referenceAdjustParameters(
		fenceCodeParameters,
		fenceCodeElement,
		plugin,
	)

	// const codeDetectingContext = (fenceCodeElement.getAttribute(DETECTING_CONTEXT) ?? "standalone") as CodeDetectingContext
	// const staticRender = (codeDetectingContext === "export") || (codeDetectingContext === "slides")
	const content = fenceCodeElement.getText()

	decorateFenceCodeElement(
		fenceCodeElement,
		fenceCodeParameters,
		content,
		context.sourcePath,
		plugin,
	)
}

function decorateFenceCodeElement(
	fenceCodeElement: HTMLElement,
	fenceCodeParameters: FenceCodeParameters,
	content: string,
	sourcePath: string,
	plugin: CodeStylerPlugin,
): void {
	const fencePreElement = fenceCodeElement.parentElement
	if (!fencePreElement)
		return;

	const fencePreParentElement = fencePreElement.parentElement
	if (!fencePreParentElement)
		return;

	plugin.mutationObservers.executeCode.observe(
		fencePreElement,
		{
			childList: true,
			subtree: true,
			attributes: true,
			characterData: true,
		},
	)

	markupFencePreParentElement(
		fencePreParentElement,
		fenceCodeParameters,
	)
	markupFencePreElement(
		fencePreElement,
		fenceCodeParameters,
	)
	markupFenceCodeElement(
		fenceCodeElement,
		fenceCodeParameters,
		sourcePath,
		plugin,
	)

	const foldStatus = convertBoolean(fencePreElement.getAttribute(FOLD_ATTRIBUTE) ?? "false") ?? false;

	const fenceHeaderElement = createHeaderElement(
		fenceCodeParameters,
		foldStatus,
		content,
		true,
		sourcePath,
		plugin,
	);
	const fenceFooterElement = createFooterElement(
		fenceCodeParameters,
		foldStatus,
		content,
		true,
		sourcePath,
		plugin,
	);
	fencePreElement.insertBefore(fenceHeaderElement, fencePreElement.childNodes[0]);
	fencePreElement.appendChild(fenceFooterElement)
}

function markupFencePreParentElement(
	fencePreParentElement: HTMLElement,
	fenceCodeParameters: FenceCodeParameters,
): void {
	const classList = [`${PREFIX}pre-parent`];

	if (fenceCodeParameters.language)
		classList.push(`${PREFIX}pre-parent-${fenceCodeParameters.language}`);

	fencePreParentElement.classList.add(...classList);
}

function markupFencePreElement(
	fencePreElement: HTMLElement,
	fenceCodeParameters: FenceCodeParameters,
): void {
	const classList = [`${PREFIX}pre`];

	if (fenceCodeParameters.language)
		classList.push(`${PREFIX}pre-${fenceCodeParameters.language}`);

	fencePreElement.classList.add(...classList);

	// const copyCodeButton: HTMLButtonElement | null = fencePreElement.querySelector("button.copy-code-button")
	// if (copyCodeButton)
	// 	copyCodeButton.onclick = async (event: MouseEvent) => await copyButton(copyCodeButton, "foo")

	// copyCodeButton?.o(
	// 	"click",
	// 	(event: Event) => {
	// 		copyCodeButton.style.transition = "opacity, background-color"
	// 		copyCodeButton.style.transitionDuration = `${BUTTON_TRANSITION}ms`
	// 		setTimeout(
	// 			() => {
	// 				copyCodeButton.style.color = ""
	// 			},
	// 			BUTTON_TIMEOUT - 1,
	// 		)
	// 		setTimeout(
	// 			() => {
	// 				copyCodeButton.style.transition = ""
	// 				copyCodeButton.style.transitionDuration = ""
	// 			},
	// 			BUTTON_TIMEOUT,
	// 		)
	// 	}
	// )

	if (fenceCodeParameters.fold.enabled !== null)
		fencePreElement.setAttribute(DEFAULT_FOLD_ATTRIBUTE, fenceCodeParameters.fold.enabled.toString());

	if (fenceCodeParameters.fold.enabled)
		fencePreElement.setAttribute(FOLD_ATTRIBUTE, "true");
}

function markupFenceCodeElement(
	fenceCodeElement: HTMLElement,
	fenceCodeParameters: FenceCodeParameters,
	sourcePath: string,
	plugin: CodeStylerPlugin,
): void {
	const fenceCodeLines = getFenceCodeLines(fenceCodeElement, sourcePath, plugin)

	let indentation = 0;
	fenceCodeLines.forEach(
		(line, idx, fenceCodeLines) => {
			const currentIndentation = getIndentation(line);
			if (currentIndentation > indentation) {
				//TODO (@mayurankv) Add fold start to previous line for indentation level currentIndentation
				indentation = currentIndentation;
			} else if (currentIndentation < indentation) {
				//TODO (@mayurankv) Add fold end to previous line for all indentation levels currentIndentation+1 -> indentation
				indentation = currentIndentation;
			}
			if (currentIndentation > 0) {
				//TODO (@mayurankv) Add indentation line element
			}
		},
	);

	const lineContainers = fenceCodeLines.filter(
		(line, idx, fenceCodeLines) => idx !== fenceCodeLines.length - 1,
	).map(
		(line, idx) => {
			const lineNumber = idx + (fenceCodeParameters.lineNumbers.offset ?? 0) + 1
			const lineContainer = createDiv({
				cls: getLineClasses(fenceCodeParameters, lineNumber, line)
			});
			lineContainer.append(
				createDiv({
					cls: [
						PREFIX + "line-number",
						...((fenceCodeParameters.lineNumbers.enabled === null) ? [] : [PREFIX + "line-numbers-enabled-" + fenceCodeParameters.lineNumbers.enabled]),
					],
					text: lineNumber.toString(),
				}),
				createDiv({
					cls: PREFIX + "line-text",
					text: sanitizeHTMLToDom(line !== "" ? line : "<br>"),
				}),
			);

			return lineContainer
		},
	)

	fenceCodeElement.addClass(`${PREFIX}code`)
	if (fenceCodeParameters.language)
		fenceCodeElement.addClass(`language-${fenceCodeParameters.language}`);

	if (fenceCodeParameters.lineUnwrap !== null)
		fenceCodeElement.setAttribute(
			WRAP_ATTRIBUTE,
			fenceCodeParameters.lineUnwrap === "inactive"
				? "unwrapped-inactive"
				: fenceCodeParameters.lineUnwrap
				? "unwrapped"
				: "wrapped",
		);

	fenceCodeElement.replaceChildren(...lineContainers)
}

function getFenceCodeLines(
	codeblockCodeElement: HTMLElement,
	sourcePath: string,
	plugin: CodeStylerPlugin,
): Array<string> {
	const htmlTree = fromHtml(
		codeblockCodeElement.innerHTML.replace(/\n/g, "<br>"),
		{ fragment: true },
	);

	let codeblockHTML = codeblockCodeElement.innerHTML;
	visitParents(
		htmlTree,
		["text", "element"],
		(node, ancestors) => {
			if (node.type !== "element" || node.tagName !== "br")
				return;
			codeblockHTML = codeblockHTML.replace(
				/\n/,
				ancestors.length < 2
					? "<br>"
					: ancestors.slice(1).reduce(
						(result, element) => {
							const elementCopy = structuredClone(element);
							elementCopy.children = [];

							const splitTag = toHtml(elementCopy).split(/(?<=>)(?=<\/)/);
							return splitTag.splice(-1)+result+splitTag.join("");
						}
						, "<br>"
					)
			);
		},
	);

	const splitHtmlTree = fromHtml(
		codeblockHTML,
		{ fragment: true },
	);
	visitParents(
		splitHtmlTree,
		["element"],
		(node) => {
			if (node.type !== "element" || !Array.isArray(node.properties.className) || !node.properties?.className?.includes("comment"))
				return;

			node.children = node.children.reduce(
				(result: Array<ElementContent>, child: ElementContent): Array<ElementContent> => {
					if (child.type !== "text")
						result.push(child)
					else
						result.push(...convertCommentLinks(child.value, sourcePath, plugin))

					return result;
				},
				[],
			);
		}
	);

	let codeblockLines = toHtml(splitHtmlTree).split("<br>");

	codeblockLines = codeblockLines.map((line: string) => (line === "") ? "<br>" : line)

	if (codeblockLines.length === 1)
		codeblockLines = ["<br>", "<br>"];

	return codeblockLines;
}

export function renderedFoldFence(
	fencePreElement: HTMLElement,
	fold: boolean | null | "toggle" = "toggle",
): void {
	//TODO: Fix
	console.log("fold reading")
	if (fencePreElement.firstElementChild?.hasClass(`${PREFIX}header`) && fencePreElement.firstElementChild?.hasClass(`${PREFIX}hidden`))
		return;

	fencePreElement.querySelectorAll("pre > code").forEach(
		(fenceCodeElement: HTMLElement) => fenceCodeElement.style.setProperty(
			"max-height",
			`${Math.ceil(fenceCodeElement.scrollHeight)}px`
		),
	)
	// fencePreElement.querySelectorAll(`pre > div.${PREFIX}footer`).forEach(
	// 	(fenceFooterElement: HTMLElement) => fenceFooterElement.style.setProperty(
	// 		"max-height",
	// 		`${Math.ceil(fenceFooterElement.scrollHeight)}px`
	// 	),
	// )
	fencePreElement.addClass(`${PREFIX}hide-scroll`);

	setTimeout(
		() => {
			if (fold === null)
				fencePreElement.setAttribute(
					FOLD_ATTRIBUTE,
					(convertBoolean(fencePreElement.getAttribute(DEFAULT_FOLD_ATTRIBUTE)) ?? false).toString(),
				)
			else if (fold === "toggle")
				fencePreElement.setAttribute(
					FOLD_ATTRIBUTE,
					(!(convertBoolean(fencePreElement.getAttribute(FOLD_ATTRIBUTE)) ?? false)).toString(),
				)
			else
				fencePreElement.setAttribute(
					FOLD_ATTRIBUTE,
					fold.toString(),
				)

			setTimeout(
				() => {
					fencePreElement.querySelectorAll("pre > code").forEach(
						(codeblockCodeElement: HTMLElement) => codeblockCodeElement.style.removeProperty("max-height"),
					);
					// fencePreElement.querySelectorAll(`pre > div.${PREFIX}footer`).forEach(
					// 	(fenceFooterElement: HTMLElement) => fenceFooterElement.style.removeProperty("max-height"),
					// );
					fencePreElement.removeClass(`${PREFIX}hide-scroll`);
				},
				FOLD_TRANSITION,
			)

			fencePreElement.querySelector(`.${PREFIX}header`)?.setAttribute(FOLD_ATTRIBUTE, fencePreElement.getAttribute(FOLD_ATTRIBUTE) ?? "false")
			fencePreElement.querySelector(`.${PREFIX}footer`)?.setAttribute(FOLD_ATTRIBUTE, fencePreElement.getAttribute(FOLD_ATTRIBUTE) ?? "false")

			// toggleFoldIcon(fencePreElement.querySelector(`.${PREFIX}header button.${PREFIX}fold-code-button`), "chevron-right", "chevron-down")
			toggleFoldIcon(fencePreElement.querySelector(`.${PREFIX}footer button.${PREFIX}fold-code-button`), "ellipsis", "chevron-up")
		},
		1,
	)
}
