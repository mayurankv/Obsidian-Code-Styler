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
import { createHeaderElement } from "../elements";
import { BUTTON_TIMEOUT, BUTTON_TRANSITION } from "src/Internal/constants/interface";

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
			foldFencePreElement(
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

	const codeDetectingContext = (fenceCodeElement.getAttribute(DETECTING_CONTEXT) ?? "standalone") as CodeDetectingContext
	const staticRender = (codeDetectingContext === "export") || (codeDetectingContext === "slides")

	decorateFenceCodeElement(
		fenceCodeElement,
		fenceCodeParameters,
		staticRender,
		context.sourcePath,
		plugin,
	)
}

function decorateFenceCodeElement(
	fenceCodeElement: HTMLElement,
	fenceCodeParameters: FenceCodeParameters,
	staticRender: boolean,
	sourcePath: string,
	plugin: CodeStylerPlugin,
): void {
	const fencePreElement = fenceCodeElement.parentElement
	if (!fencePreElement)
		return;

	const fencePreParentElement = fencePreElement.parentElement
	if (!fencePreParentElement)
		return;

	if (!staticRender)
		plugin.mutationObservers.executeCode.observe(
			fencePreElement,
			{
				childList: true,
				subtree: true,
				attributes: true,
				characterData: true,
			},
		)

	const fenceHeaderElement = createHeaderElement(
		fenceCodeParameters,
		true,
		sourcePath,
		plugin,
	);
	if (!staticRender)
		fenceHeaderElement.addEventListener(
			"click",
			() => { foldFencePreElement(fencePreElement); },
		);

	markupFencePreParentElement(
		fencePreParentElement,
		fenceCodeParameters,
	)
	markupFencePreElement(
		fencePreElement,
		fenceCodeParameters,
		staticRender,
	)
	markupFenceCodeElement(
		fenceCodeElement,
		fenceCodeParameters,
		sourcePath,
		plugin,
	)
	fencePreElement.insertBefore(fenceHeaderElement, fencePreElement.childNodes[0]);
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
	staticRender: boolean,
): void {
	const classList = [`${PREFIX}pre`];

	if (fenceCodeParameters.language)
		classList.push(`${PREFIX}pre-${fenceCodeParameters.language}`);

	fencePreElement.classList.add(...classList);

	const copyCodeButton: HTMLElement | null = fencePreElement.querySelector("button.copy-code-button")
	copyCodeButton?.addEventListener(
		"click",
		(event: Event) => {
			copyCodeButton.style.transition = "opacity, background-color"
			copyCodeButton.style.transitionDuration = `${BUTTON_TRANSITION}ms`
			setTimeout(
				() => {
					copyCodeButton.style.color = ""
				},
				BUTTON_TIMEOUT - 1,
			)
			setTimeout(
				() => {
					copyCodeButton.style.transition = ""
					copyCodeButton.style.transitionDuration = ""
				},
				BUTTON_TIMEOUT,
			)
		}
	)

	if (fenceCodeParameters.fold.enabled !== null)
		fencePreElement.setAttribute(DEFAULT_FOLD_ATTRIBUTE, fenceCodeParameters.fold.enabled.toString());

	if (staticRender)
		return;

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

async function foldFencePreElement(
	codeblockPreElement: HTMLElement,
	fold?: boolean,
): Promise<void> {
	if (codeblockPreElement.firstElementChild?.classList?.contains(`${PREFIX}header`) && codeblockPreElement.firstElementChild?.classList?.contains(`${PREFIX}hidden`))
		return;

	codeblockPreElement.querySelectorAll("pre > code").forEach(() => {(fenceCodeElement: HTMLElement) => fenceCodeElement.style.setProperty(
		"max-height",
		`calc(${Math.ceil(fenceCodeElement.scrollHeight + 0.01)}px + var(--code-padding) * ${fenceCodeElement.classList.contains("execute-code-output") ? "3.5 + var(--header-separator-width)" : "2"})`
	)});
	codeblockPreElement.classList.add(`${PREFIX}hide-scroll`);

	// await sleep(1); //TODO: Needed?
	if (typeof fold === "undefined")
		codeblockPreElement.setAttribute(DEFAULT_FOLD_ATTRIBUTE, (!((codeblockPreElement.getAttribute(DEFAULT_FOLD_ATTRIBUTE) ?? "false") === "true")).toString())
	else
		codeblockPreElement.setAttribute(DEFAULT_FOLD_ATTRIBUTE, fold.toString())

	// await sleep(TRANSITION_LENGTH); //TODO: Needed?
	codeblockPreElement.querySelectorAll("pre > code").forEach((codeblockCodeElement: HTMLElement)=>codeblockCodeElement.style.removeProperty("max-height"));
	codeblockPreElement.classList.remove(`${PREFIX}hide-scroll`);
}
