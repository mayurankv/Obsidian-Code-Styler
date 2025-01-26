import { EditorState, Range, StateField, Transaction, Extension } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView } from "@codemirror/view";
import { editorInfoField } from "obsidian";
import { PREFIX } from "src/Internal/constants/general";
import { buildCommentDecorations, buildHeaderDecorations } from "src/Internal/Detecting/LivePreview/fenced";
import { CommentInfo } from "src/Internal/types/detecting";
import CodeStylerPlugin from "src/main";
import { areRangesInteracting, isSourceMode } from "./codemirror/utils";
import { CommentLinkWidget } from "./codemirror/widgets";

export function getFenceCodemirrorExtensions(
	plugin: CodeStylerPlugin,
) {
	return [
	]
}

export function createHeaderDecorationsStateField(
	plugin: CodeStylerPlugin,
) {
	return StateField.define<DecorationSet>({
		create(
			state: EditorState,
		): DecorationSet {
			return buildHeaderDecorations(state, plugin, buildHeaderDecoration);
		},

		update(
			value: DecorationSet,
			transaction: Transaction,
		): DecorationSet {
			return buildHeaderDecorations(transaction.state, plugin, buildHeaderDecoration);
		},

		provide(
			field: StateField<DecorationSet>,
		): Extension {
			return EditorView.decorations.from(field);
		}
	});
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
				if (extendedLinkInfo.type === "wiki")
					result.push({
						from: extendedLinkInfo.from + (extendedLinkInfo.type === "wiki" ? 2 : 1),
						to: extendedLinkInfo.to - 2,
						value: Decoration.mark({
							class: `cm-hmd-internal-link ${PREFIX}-source-link`,
							attributes: {
								destination: extendedLinkInfo.reference,
							},
						}),
					})

				else {
					const splitIndex = extendedLinkInfo.fullLink.match(new RegExp(`\\[\\s*${extendedLinkInfo.title}\\s*\\]`))?.length ?? 0

					result.push({
						from: extendedLinkInfo.from + 1,
						to: extendedLinkInfo.from + splitIndex + 1,
						value: Decoration.mark({
							class: `"cm-link ${PREFIX}-source-link`,
							attributes: {
								destination: extendedLinkInfo.reference,
							},
						}),
					})

					result.push({
						from: extendedLinkInfo.from + splitIndex + 1,
						to: extendedLinkInfo.to - 1,
						value: Decoration.mark({
							class: "cm-sttring cm-url",
						})
					})
				}

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
