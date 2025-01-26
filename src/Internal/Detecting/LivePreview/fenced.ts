import { syntaxTree } from "@codemirror/language";
import { EditorState, Line, Range, RangeSetBuilder, SelectionRange } from "@codemirror/state";
import { Decoration, DecorationSet } from "@codemirror/view";
import { SyntaxNodeRef } from "@lezer/common";
import { getInlineDelimiterSize, isFileIgnored } from "src/Internal/Decorating/LivePreview/codemirror/utils";
import { parseInlineCodeParameters, splitInlineCodeRaw } from "src/Internal/Parsing/inline";
import { CommentInfo, InlineCodeInfo } from "src/Internal/types/detecting";
import CodeStylerPlugin from "src/main";

function buildCommentDecorations(
	state: EditorState,
	line: Line,
	builder: RangeSetBuilder<Decoration>,
	plugin: CodeStylerPlugin,
	buildCommentDecoration: (
		state: EditorState,
		commentInfo: CommentInfo | null,
		plugin: CodeStylerPlugin,
	) => Array<Range<Decoration>>,
) {
	if (isFileIgnored(state))
		return Decoration.none;

	syntaxTree(state).iterate({
		enter: (syntaxNode) => buildCommentDecoration(
			state,
			getCommentInfo(state, syntaxNode),
			plugin,
		).sort(
			(a, b) => (a.from === b.from)
				? a.value.startSide < b.value.startSide ? -1 : a.value.startSide > b.value.startSide ? 1 : 0
				: a.from < b.from ? -1 : 1
		).forEach(
			({from, to, value}) => builder.add(from, to, value),
		),
		from: line.from,
		to: line.to
	});
}

function getCommentInfo(
	state: EditorState,
	syntaxNode: SyntaxNodeRef,
): CommentInfo | null {
	if (!syntaxNode.type.name.includes("comment_hmd-codeblock"))
		return null

	const commentText = state.sliceDoc(syntaxNode.from, syntaxNode.to);
	getLinks(commentText)

	return {
		from: syntaxNode.from + linkMatch.index,
		to: syntaxNode.from + linkMatch.index + linkMatch[0].length,
		...linkInfo,
		seperatorPosition,
	}
}

function foo() {
	const linkMatches = [...commentText.matchAll(/(?:\[\[[^\]|\r\n]+?(?:\|[^\]|\r\n]+?)?\]\]|\[.*?\]\(.+\))/g)];
	linkMatches.forEach((linkMatch: RegExpMatchArray) => {

	});
}


function baz() {
	const foo = bar
}
