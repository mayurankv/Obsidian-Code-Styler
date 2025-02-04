import { syntaxTree } from "@codemirror/language";
import { EditorState, Line, Range, RangeSetBuilder } from "@codemirror/state";
import { Decoration, DecorationSet } from "@codemirror/view";
import { SyntaxNodeRef } from "@lezer/common";
import { isFileIgnored, isSourceMode } from "src/Internal/Decorating/LivePreview/codemirror/utils";
import { FillerWidget } from "src/Internal/Decorating/LivePreview/codemirror/widgets";
import { parseFenceCodeParameters, toDecorateFenceCode } from "src/Internal/Parsing/fenced";
import { FenceInfo } from "src/Internal/types/decoration";
import { FenceCodeParameters } from "src/Internal/types/parsing";
import { cleanFenceCodeParametersLine } from "src/Internal/utils/detecting";
import CodeStylerPlugin from "src/main";

export function updateFenceInfo(
	state: EditorState,
	syntaxNode: SyntaxNodeRef,
	fenceInfo: FenceInfo,
	plugin: CodeStylerPlugin,
): FenceInfo {
	if (isFenceLine(syntaxNode)) {
		const line = state.doc.lineAt(syntaxNode.from)
		fenceInfo.lineText = line.text.toString()
		fenceInfo.lineStart = line.from
		fenceInfo.lineEnd = line.to
		fenceInfo.lineNumber += 1
		// fenceInfo.inCode
	}

	if (isFenceStart(syntaxNode)) {
		fenceInfo = {
			...fenceInfo,
			lineNumber: 0,
			headerStart: syntaxNode.from,
			parameters: parseFenceCodeParameters(
				cleanFenceCodeParametersLine(fenceInfo.lineText),
				plugin,
			),
			decorations: [],
		}

		fenceInfo.toDecorate = toDecorateFenceCode(fenceInfo.parameters, plugin) && !isSourceMode(state);
	}

	if (isFenceEnd(syntaxNode)) {
		fenceInfo.lineNumber = 0
		fenceInfo.bodyEnd = syntaxNode.from - 1
		fenceInfo.footerEnd = syntaxNode.to
	}

	if (isFenceLine(syntaxNode) && fenceInfo.lineNumber === 1)
		fenceInfo.bodyStart = syntaxNode.from

	return fenceInfo
}

export function isFenceStart(
	syntaxNode: SyntaxNodeRef,
): boolean {
	return  syntaxNode.type.name.includes("HyperMD-codeblock-begin")
}

export function isFenceLine(
	syntaxNode: SyntaxNodeRef,
): boolean {
	return  syntaxNode.type.name.includes("HyperMD-codeblock")
}

export function isFenceEnd(
	syntaxNode: SyntaxNodeRef,
): boolean {
	return  syntaxNode.type.name.includes("HyperMD-codeblock-end")
}

export function isFenceComment(
	syntaxNode: SyntaxNodeRef,
	fenceInfo: FenceInfo,
): boolean {
	return (fenceInfo.lineNumber !== 0) && (syntaxNode.type.name.includes("comment_hmd-codeblock") && (syntaxNode.from >= fenceInfo.lineStart)  && (syntaxNode.to <= fenceInfo.lineEnd))
}
