export function toKebabCase(
	text: string,
): string {
	return text.replace(/(?:\s+|_)/g, "-").toLowerCase()
}

export function camelCaseToKebabCase(
	text: string,
): string {
	return text.split('').map(
		(letter: string, idx: number) => (letter.toUpperCase() === letter && letter !== "-")
			? `${idx !== 0 ? '-' : ''}${letter.toLowerCase()}`
			: letter,
	).join('');
}

export function convertBoolean(
	text: string,
): boolean | null {
	if (text.toLowerCase().trim() === "true")
		return true
	if (text.toLowerCase().trim() === "false")
		return false
	else
		return null
}

export function removeBoundaryQuotes(
	text: string,
): string {
	if (text.startsWith("\"") && text.endsWith("\""))
		return text.slice(1, -1)

	if (text.startsWith("'") && text.endsWith("'"))
		return text.slice(1, -1)

	return text
}

export function removeCurlyBraces(
	text: string,
): string {
	if (text.startsWith("{") && text.endsWith("}"))
		return text.slice(1, -1)

	return text
}
