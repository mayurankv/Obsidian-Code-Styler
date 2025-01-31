// import CodeStylerPlugin from "src/main";

// export async function parseCodeblockSource(
// 	codeSection: Array<string>,
// 	plugin: CodeStylerPlugin,
// ): Promise<{codeblocksParameters: Array<CodeblockParameters>, nested: boolean}> {
// 	const admonitions: boolean = ("obsidian-admonition" in plugin.app.plugins.plugins);
// 	const codeblocks: Array<Array<string>> = [];
// 	function parseCodeblockSection(codeSection: Array<string>): void {
// 		if (codeSection.length === 0)
// 			return;

// 		const openingCodeblockLine = getOpeningLine(codeSection);
// 		if (!openingCodeblockLine)
// 			return;

// 		const openDelimiter = /^\s*(?:>\s*)*((?:```+|~~~+)).*$/.exec(openingCodeblockLine)?.[1];
// 		if (!openDelimiter)
// 			return;

// 		const openDelimiterIndex = codeSection.indexOf(openingCodeblockLine);
// 		const closeDelimiterIndex = codeSection.slice(openDelimiterIndex+1).findIndex((line)=>new RegExp(`^\\s*(?:>\\s*)*${openDelimiter}(?!${openDelimiter[0]})$`).test(line));
// 		if (!admonitions || !/^\s*(?:>\s*)*(?:```+|~~~+) *ad-.*$/.test(openingCodeblockLine))
// 			codeblocks.push(codeSection.slice(0,openDelimiterIndex+2+closeDelimiterIndex));
// 		else
// 			parseCodeblockSection(codeSection.slice(openDelimiterIndex+1,openDelimiterIndex+1+closeDelimiterIndex));

// 		parseCodeblockSection(codeSection.slice(openDelimiterIndex+1+closeDelimiterIndex+1));
// 	}
// 	parseCodeblockSection(codeSection);
// 	const nested = codeblocks[0] ? !arraysEqual(codeSection, codeblocks[0]) : true

// 	return codeblocks
// }

// function getParameterLine(
// 	codeblockLines: Array<string>,
// ): string | undefined {
// 	let openingCodeblockLine = getOpeningLine(codeblockLines);
// 	if (openingCodeblockLine && (openingCodeblockLine !== codeblockLines[0] || />\s*(?:[`~])/.test(openingCodeblockLine)))
// 		openingCodeblockLine = openingCodeblockLine.trim().replace(/^(?:>\s*)*(```+|~~~+)/,"$1");
// 	return openingCodeblockLine;
// }

// function getOpeningLine(
// 	codeblockLines: Array<string>,
// ): string | undefined {
// 	return codeblockLines.find((line: string)=>Boolean(testOpeningLine(line)));
// }

// export function testOpeningLine(
// 	codeblockLine: string,
// ): string {
// 	const lineMatch = /^(\s*(?:>\s*)*)(```+|~~~+)/.exec(codeblockLine);
// 	if (!lineMatch)
// 		return "";

// 	if (codeblockLine.indexOf(lineMatch[2],lineMatch[1].length+lineMatch[2].length+1)===-1)
// 		return lineMatch[2];

// 	return "";
// }
