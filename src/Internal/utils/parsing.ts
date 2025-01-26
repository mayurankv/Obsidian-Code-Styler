import { CodeParameters, FenceCodeParameters, LinkType } from "../types/parsing";
import { removeBoundaryQuotes } from "./text";

const MARKDOWN_REGEX = /\[(.*?)\]\((.+?)\)/;
const WIKI_REGEX = /\[\[([^\]|\r\n]+?)(?:\|([^\]|\r\n]+?))?\]\]/;
const URL_REGEX = /^(?:(?:https?|file):\/\/|.+\.(?:com|io|ai|gov|co\.uk))/;

export function separateParameters(
	parametersLine: string,
): Array<string> {
	return parametersLine.match(new RegExp(`(?:[^\\s"']+|"[^"]*"|'[^']*')+`, "gi")) ?? [];
}

export function setTitleAndReference(
	parameterKey: string,
	parameterValue: string | null,
	result: Partial<CodeParameters>,
): Partial<CodeParameters> {
	if (parameterValue !== null) {
		const linkInfo = parseLink(parameterValue)
		if (linkInfo === null) {
			if (parameterKey === "title")
				return { ...result, title: parameterValue }
			else
				return result
		} else {
			if ((parameterKey === "title") || !("title" in result))
				return { ...result, title: linkInfo.title, reference: linkInfo.reference }
			else
				return { ...result, reference: linkInfo.reference }
		}

	} else {
		if (parameterKey !== "title" || !("title" in result))
			return result

		const linkInfo = parseLink(result?.title ?? "")

		if (linkInfo === null)
			return result
		else
			return {...result, title: linkInfo.title, reference: linkInfo.reference}
	}
}

function parseLink(
	linkText: string,
): { title: string, reference: string, type: LinkType } | null {


	// let markdownLinkMatch;
	// while ((markdownLinkMatch = MARKDOWN_REGEX.exec(linkText)) !== null) {
	// 	links.push({
	// 		title: markdownLinkMatch[1] !== ""
	// 			? markdownLinkMatch[1].trim()
	// 			: markdownLinkMatch[2].trim(),
	// 		reference: markdownLinkMatch[2].trim(),
	// 		type: "markdown",
	// 	});
	// }

	const markdownLinkMatch = linkText.match(MARKDOWN_REGEX);
	if (markdownLinkMatch)
		return {
			title: markdownLinkMatch[1] !== ""
				? markdownLinkMatch[1].trim()
				: markdownLinkMatch[2].trim(),
			reference: markdownLinkMatch[2].trim(),
			type: "markdown",
		}

	//TODO: Check match
	const wikiLinkMatch = linkText.match(WIKI_REGEX)
	if (wikiLinkMatch)
		return {
			title: wikiLinkMatch[2]
				? wikiLinkMatch[2].trim()
				: wikiLinkMatch[1].trim(),
			reference: wikiLinkMatch[1].trim(),
			type: "wiki",
		}

	const urlLinkMatch = removeBoundaryQuotes(linkText).trim().match(URL_REGEX)
	if (urlLinkMatch)
		return {
			title: urlLinkMatch[0],
			reference: urlLinkMatch[0],
			type: "url",
		}

	return null
}

function getLinks(
	text: string,
): Array<string> {
	const links: Array<string> = [];

	for (const match of text.matchAll(MARKDOWN_REGEX)) {
		links.push(match[0]);
	}

	for (const match of text.matchAll(WIKI_REGEX)) {
		links.push(match[0]);
	}

	for (const match of text.matchAll(URL_REGEX)) {
		links.push(match[0]);
	}

	return links;
}

export function isLanguageMatched(
	language: string,
	languagesString: string,
): boolean {
	return languagesString.split(",").filter(
		regexLanguage => regexLanguage !== ""
	).map(
		regexLanguage => new RegExp(`^${regexLanguage.trim().replace(/\*/g, ".+")}$`, "i"),
	).some(
		regexLanguage => regexLanguage.test(language),
	);
}

export function isUrl(
	text: string | CodeMirror.StringStream,
): boolean {
	return Boolean(text.match(URL_REGEX))
}
