import CodeStylerPlugin from "src/main";
import { EditorState, Range } from "@codemirror/state";
import { Decoration } from "@codemirror/view";
import { CommentInfo } from "src/Internal/types/detecting";
import { areRangesInteracting, isSourceMode } from "./codemirror/utils";
import { CommentLinkWidget } from "./codemirror/widgets";
import { PREFIX } from "src/Internal/constants/general";
import { editorInfoField } from "obsidian";

export function getFenceCodemirrorExtensions(
	plugin: CodeStylerPlugin,
) {
	return [
	]
}

function buildCommentDecoration(
	state: EditorState,
	commentInfo: CommentInfo | null,
	plugin: CodeStylerPlugin,
): Array<Range<Decoration>> {
	if (!commentInfo)
		return []

	return commentInfo.reduce(
		(result: Array<Range<Decoration>>, extendedLinkInfo) => {
			if (isSourceMode(state) || areRangesInteracting(state, extendedLinkInfo.from, extendedLinkInfo.to)) {
				result.push({
					from: extendedLinkInfo.from + (extendedLinkInfo.type === "wiki" ? 2 : 1),
					to: (extendedLinkInfo.type === "wiki" ? (extendedLinkInfo.to - 2) : (extendedLinkInfo.from + extendedLinkInfo.title.length + 3)),
					value: Decoration.mark({
						class: (extendedLinkInfo.type === "wiki" ? "cm-hmd-internal-link" : "cm-link") + ` ${PREFIX}-source-link`,
						attributes: {
							destination: extendedLinkInfo.reference,
						},
					}),
				})

				if (extendedLinkInfo.type !== "wiki")
					result.push({
						from: extendedLinkInfo.from + extendedLinkInfo.title.length + 3,
						to: extendedLinkInfo.to - 1,
						value: Decoration.mark({
							class: "cm-sttring cm-url",
						})
					})

			}  else
				result.push({
					from: extendedLinkInfo.from,
					to: extendedLinkInfo.to,
					value: Decoration.replace({
						widget: new CommentLinkWidget(
							extendedLinkInfo.type === "wiki"
								? `[[${extendedLinkInfo.reference}|${extendedLinkInfo.title}]]`
								: `[${extendedLinkInfo.title}](${extendedLinkInfo.reference})`,
							state.field(editorInfoField)?.file?.path ?? "",
							plugin,
						)
					}),
				})

			return result
		},
		[],
	)
}
