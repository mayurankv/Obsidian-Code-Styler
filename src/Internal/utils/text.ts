export function toKebabCase(
	text: string,
): string {
	return text.replace(/(?:\s+|_)/g, "-").toLowerCase()
}
