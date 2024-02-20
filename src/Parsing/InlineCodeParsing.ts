
export interface InlineCodeParameters {
	language: string;
	title: string;
	icon: boolean;
}

export function parseInlineCode(codeText: string): {parameters: InlineCodeParameters | null, text: string} {
	const match = /^{((?:[^"'{}\\]|\\.|"([^"\\]|\\.)*"|'([^'\\]|\\.)*')*)} *?([^ ].*?)$/.exec(codeText);

	if (typeof match?.[1] !== "undefined" && typeof match?.[2] !== "undefined") {
		if (match[1] === "")
			return {parameters: null, text: match[2]};
		else
			return {parameters: parseInlineCodeParameters(match[1]), text: match[2]};
	} else
		return {parameters: null, text: codeText};
}
function parseInlineCodeParameters(parameterLine: string): InlineCodeParameters {
	const inlineCodeParameters: InlineCodeParameters = {
		language: "",
		title: "",
		icon: false,
	};
	const languageBreak = parameterLine.indexOf(" ");
	inlineCodeParameters.language = parameterLine.slice(0,languageBreak !== -1?languageBreak:parameterLine.length).toLowerCase();
	if (languageBreak === -1)
		return inlineCodeParameters;
	const parameterStrings = parameterLine.slice(languageBreak+1).match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g);
	if (!parameterStrings)
		return inlineCodeParameters;
	parameterStrings.forEach((parameterString) => parseInlineCodeParameterString(parameterString,inlineCodeParameters));
	return inlineCodeParameters;
}
function parseInlineCodeParameterString(parameterString: string, inlineCodeParameters: InlineCodeParameters): void {
	if (parameterString.startsWith("title:")) {
		const titleMatch = /(["']?)([^\1]+)\1/.exec(parameterString.slice("title:".length));
		if (titleMatch)
			inlineCodeParameters.title = titleMatch[2].trim().replace(/\\{/g, "{");
	} else if (parameterString === "icon" || (parameterString.startsWith("icon:") && parameterString.toLowerCase() === "icon:true"))
		inlineCodeParameters.icon = true;
}
