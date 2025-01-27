import { CodeParameters, FenceCodeParameters, LinkInfo, LinkType } from "../types/parsing";
import { removeBoundaryQuotes } from "./text";

const MARKDOWN_REGEX = /\[(.*?)\]\((.+?)\)/;
const WIKI_REGEX = /\[\[([^\]|\r\n]+?)(?:\|([^\]|\r\n]+?))?\]\]/;
const URL_REGEX = /^(?:(?:https?|file|zotero):\/\/[!\*'\(\);:@&=\+\$,\/\?#\[\]A-Za-z0-9_\.~\-|%]+|[!\*'\(\);:@&=\+\$,\/\?#\[\]A-Za-z0-9_\.~\-|%]+\.(?:com|io|ai|gov|co\.uk))/; // !\*'\(\);:@&=\+\$,\/\?#\[\]A-Za-z0-9_\.~\-|%

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
		const linksInfo = parseLinks(parameterValue)

		if (linksInfo.length === 0) {
			if (parameterKey === "title")
				return { ...result, title: parameterValue }
			else
				return result
		} else {
			if ((parameterKey === "title") || !("title" in result))
				return { ...result, title: linksInfo[0].title, reference: linksInfo[0].reference }
			else
				return { ...result, reference: linksInfo[0].reference }
		}

	} else {
		if (parameterKey !== "title" || !("title" in result))
			return result

		const linksInfo = parseLinks(result?.title ?? "")

		if (linksInfo.length === 0)
			return result
		else
			return {...result, title: linksInfo[0].title, reference: linksInfo[0].reference}
	}
}

export function parseLinks(
	linkText: string,
): Array<LinkInfo> {
	const links: Array<LinkInfo> = []

	const markdownRegex = new RegExp(MARKDOWN_REGEX.source, "g")
	let markdownLinkMatch;
	while ((markdownLinkMatch = markdownRegex.exec(linkText)) !== null) {
		links.push({
			title: markdownLinkMatch[1] !== ""
				? markdownLinkMatch[1].trim()
				: markdownLinkMatch[2].trim(),
			reference: markdownLinkMatch[2].trim(),
			type: "markdown",
			match: markdownLinkMatch[0],
			offset: markdownLinkMatch.index,
		});
	}

	const wikiRegex = new RegExp(WIKI_REGEX.source, "g")
	let wikiLinkMatch;
	while ((wikiLinkMatch = wikiRegex.exec(linkText)) !== null) {
		links.push({
			title: wikiLinkMatch[2]
				? wikiLinkMatch[2].trim()
				: wikiLinkMatch[1].trim(),
			reference: wikiLinkMatch[1].trim(),
			type: "wiki",
			match: wikiLinkMatch[0],
			offset: wikiLinkMatch.index,
		});
	}

	const urlRegex = new RegExp(URL_REGEX.source, "g")
	let urlLinkMatch;
	while ((urlLinkMatch = urlRegex.exec(removeBoundaryQuotes(linkText).trim())) !== null) {
		links.push({
			title: urlLinkMatch[0],
			reference: urlLinkMatch[0],
			type: "url",
			match: urlLinkMatch[0],
			offset: urlLinkMatch.index,
		});
	}

	return links
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
