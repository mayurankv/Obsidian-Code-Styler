export function separateParameters(
	parametersLine: string,
): Array<string> {
	return parametersLine.match(new RegExp(`(?:[^\\s"']+|"[^"]*"|'[^']*')+`, "gi")) ?? [];
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
