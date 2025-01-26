import { CodeParameters, FenceCodeParameters } from "../types/parsing";
import { removeBoundaryQuotes } from "./text";

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
				return { ...result, ...linkInfo }
			else
				return { ...result, reference: linkInfo.reference }
		}

	} else {
		if (parameterKey !== "title" || !("title" in result))
			return result

		const linkInfo = parseLink(result?.title ?? "")

		if (linkInfo === result)
			return result
		else
			return {...result, ...linkInfo}
	}
}

function parseLink(
	linkText: string,
): { title: string, reference: string } | null {
	const markdownLinkMatch = linkText.match(new RegExp(`\\[(.*?)\\]\\((.+)\\)`, "g"));
	if (markdownLinkMatch)
		return {
			title: markdownLinkMatch[1] !== ""
				? markdownLinkMatch[1].trim()
				: markdownLinkMatch[2].trim(),
			reference: markdownLinkMatch[2].trim(),
		}

	//TODO: Check match
	const wikiLinkMatch = linkText.match(new RegExp(`\\[\\[([^\\]|\\r\\n]+?)(?:\\|([^\\]|\\r\\n]+?))?\\]\\]`, "g"))
	if (wikiLinkMatch)
		return {
			title: wikiLinkMatch[2]
				? wikiLinkMatch[2].trim()
				: wikiLinkMatch[1].trim(),
			reference: wikiLinkMatch[1].trim(),
		}

	const urlLinkMatch = removeBoundaryQuotes(linkText).match(new RegExp(`^(\S+)\\.(\S+)$`, "g"));
	if (urlLinkMatch)
		return {
			title: urlLinkMatch[0].trim(),
			reference: urlLinkMatch[0].trim(),
		}

	return null
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
	return Boolean(text.match(/^(?:https?|file):\/\//)) || Boolean(text.match(/\.(?:com|io|ai|gov|co\.uk)/))
}
