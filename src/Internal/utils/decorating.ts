import { MarkdownRenderer } from "obsidian";
import { ElementContent, Element } from "hast";
import { fromHtml } from "hast-util-from-html";
import CodeStylerPlugin from "src/main";
import { FenceCodeParameters, Highlights, InlineCodeParameters } from "src/Internal/types/parsing";
import { PREFIX } from "../constants/general";
import { toKebabCase } from "./text";
import { LANGUAGE_NAMES } from "../constants/parsing";

// TODO: Clean up

export function getLineClasses(
	fenceCodeParameters: FenceCodeParameters,
	lineNumber: number,
	line: string,
): Array<string> {
	const classList = [
		PREFIX + "line",
		...Object.entries({ default: fenceCodeParameters.highlights.default, ...fenceCodeParameters.highlights.alternative }).filter(
			([highlightName, highlights]: [string, Highlights]) => toHighlight(highlights, lineNumber + fenceCodeParameters.lineNumbers.offset, line)
		).map(
			([highlightName, highlights]: [string, Highlights]) => `${PREFIX}highlighted-${toKebabCase(highlightName)}`
		),
	]

	return classList;
}

export function getLanguageIcon(
	language: string,
	plugin: CodeStylerPlugin,
): string | null {
	return plugin.resources.languageIcons?.[getLanguageName(language)] ?? null;
}

export function getLanguageName(
	language: string,
): string {
	return LANGUAGE_NAMES?.[language] ?? ((language.charAt(0).toUpperCase() + language.slice(1)) || "");
}

export function convertCommentLinks(
	commentText: string,
	sourcePath: string,
	plugin: CodeStylerPlugin,
): Array<ElementContent> {
	const linkMatches = [...commentText.matchAll(/(?:\[\[[^\]|\r\n]+?(?:\|[^\]|\r\n]+?)?\]\]|\[.*?\]\(.+\))/g)].reverse();

	const newChildren = linkMatches.reduce(
		(result: Array<ElementContent>, linkMatch: RegExpMatchArray): Array<ElementContent> => {
			if (typeof linkMatch?.index === "undefined")
				return result;

			const ending = commentText.slice(linkMatch.index + linkMatch[0].length);
			const linkText = commentText.slice(linkMatch.index, linkMatch.index + linkMatch[0].length);
			const linkContainer = createDiv();
			MarkdownRenderer.render(plugin.app, linkText, linkContainer, sourcePath, plugin);
			const linkChild = (
				fromHtml(
					linkContainer.innerHTML,
					{ fragment: true },
				)?.children?.[0] as Element
			)?.children?.[0];

			result.push({type: "text",value: ending}, linkChild);

			commentText = commentText.slice(0, linkMatch.index); //TODO: Needed?

			return result;
		},
		[],
	).reverse();

	const children = [
		{ type: "text", value: commentText } as ElementContent,
		...newChildren,
	]

	return children;
}

export function toHighlight(
	highlights: Highlights,
	lineNumber: number,
	line: string,
) {
	return highlights.lineNumbers.includes(lineNumber) || highlights.plainText.some(text => line.indexOf(text) > -1) || highlights.regularExpressions.some(regExp => regExp.test(line))
}

export function getIndentation(text: string): number {
	//TODO (@mayurankv) Make work with space indentation too
	let count = 0;
	let index = 0;
	while (text.charAt(index++) === "\t")
		count++;
	return count;
}
