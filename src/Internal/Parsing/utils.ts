export function separateParameters(
	parametersLine: string,
): Array<string> {
	return parametersLine.match(new RegExp(`(?:[^\\s"']+|"[^"]*"|'[^']*')+`, "gi")) ?? [];
}
