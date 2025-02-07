import { MarkdownRenderer } from "obsidian";
import { ElementContent, Element } from "hast";
import { fromHtml } from "hast-util-from-html";
import CodeStylerPlugin from "src/main";
import { FenceCodeParameters, Highlights, InlineCodeParameters, LinkInfo } from "src/Internal/types/parsing";
import { PREFIX } from "../constants/general";
import { toKebabCase } from "./string";
import { LANGUAGE_NAMES } from "../constants/parsing";
import { parseLinks } from "./parsing";

// TODO: Clean up

export function getLineClasses(
	fenceCodeParameters: FenceCodeParameters,
	lineNumber: number,
	line: string,
): Array<string> {
	const classList = [
		PREFIX + "line",
		...(fenceCodeParameters.language ? [`language-${fenceCodeParameters.language}`] : []),
		...Object.entries({ default: fenceCodeParameters.highlights.default, ...fenceCodeParameters.highlights.alternative }).filter(
			([highlightName, highlights]: [string, Highlights]) => toHighlight(highlights, lineNumber + (fenceCodeParameters.lineNumbers.offset ?? 0), line)
		).map(
			([highlightName, highlights]: [string, Highlights]) => `${PREFIX}highlighted-${toKebabCase(highlightName)}`
		),
	]

	return classList;
}

export function getLanguageIcon(
	language: string | null,
	plugin: CodeStylerPlugin,
): string | null {
	if (language === null)
		return null

	return plugin.resources.languageIcons?.[getLanguageName(language)] ?? null;
}

export function getLanguageName(
	language: string | null,
): string {
	if (language === null)
		return ""

	return LANGUAGE_NAMES?.[language] ?? ((language.charAt(0).toUpperCase() + language.slice(1)) || "");
}

export function convertCommentLinks(
	commentText: string,
	sourcePath: string,
	plugin: CodeStylerPlugin,
): Array<ElementContent> {
	const linkInfos = parseLinks(commentText);

	const children = linkInfos.reduce(
		(result: Array<ElementContent>, linkInfo: LinkInfo, idx: number, linkInfos: Array<LinkInfo>): Array<ElementContent> => {

			const linkText = linkInfo.type === "wiki"
				? `[[${linkInfo.reference}|${linkInfo.title}]]`
				: `[${linkInfo.title}](${linkInfo.reference})`

			const linkContainer = createEl(
				"div",
				{
					cls: [
						PREFIX + "comment",
					],
				},
			);

			MarkdownRenderer.render(
				plugin.app,
				linkText,
				linkContainer,
				sourcePath,
				plugin,
			);

			const linkChild = (
				fromHtml(
					linkContainer.innerHTML,
					{
						fragment: true,
					},
				)?.children?.[0] as Element
			)?.children?.[0];

			result.push(linkChild);

			if (linkInfos.length - idx !== 1)
				result.push({
					type: "text",
					value: commentText.slice(linkInfo.offset + linkInfo.match.length, linkInfos[idx + 1].offset),
				})
			else
				result.push({
					type: "text",
					value: commentText.slice(linkInfo.offset + linkInfo.match.length),
				})


			return result
		},
		[
			{
				type: "text",
				value: commentText.slice(0, linkInfos?.[0]?.offset),
			},
		],
	)

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
