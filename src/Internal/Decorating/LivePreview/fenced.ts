import { EditorState, Range, StateField, Transaction, Extension } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView } from "@codemirror/view";
import { editorInfoField } from "obsidian";
import { PREFIX } from "src/Internal/constants/general";
import { CommentInfo, HeaderInfo } from "src/Internal/types/detecting";
import CodeStylerPlugin from "src/main";
import { areRangesInteracting, isSourceMode } from "./codemirror/utils";
import { CommentLinkWidget, HeaderWidget } from "./codemirror/widgets";
import { parseFenceCodeParameters } from "src/Internal/Parsing/fenced";
import { buildFenceCodeDecorations } from "src/Internal/Detecting/LivePreview/fenced";

export function getFenceCodemirrorExtensions(
	plugin: CodeStylerPlugin,
) {
	return [
		createFenceCodeDecorationsStateField(plugin),
	]
}

function createFenceCodeDecorationsStateField(
	plugin: CodeStylerPlugin,
) {
	return StateField.define<DecorationSet>({
		create(
			state: EditorState,
		): DecorationSet {
			return buildFenceCodeDecorations(state, plugin, 1, 2 ,3);
		},

		update(
			value: DecorationSet,
			transaction: Transaction,
		): DecorationSet {
			return buildFenceCodeDecorations(transaction.state, plugin, 1, 2 ,3);
		},

		provide(
			field: StateField<DecorationSet>,
		): Extension {
			return EditorView.decorations.from(field);
		}
	});
}

function buildHeaderDecoration(
	state: EditorState,
	headerInfo: HeaderInfo | null,
	plugin: CodeStylerPlugin,
): Array<Range<Decoration>> | null {
	if (!headerInfo)
		return []

	const fenceCodeParameters = parseFenceCodeParameters(headerInfo.fenceCodeParametersLine, plugin);

	// TODO: Check if these are needed?
	// !isLanguageIgnored(codeblockParameters.language, settings.excludedLanguages) &&
	// !isCodeblockIgnored(codeblockParameters.language, settings.processedCodeblocksWhitelist) &&
	// !SPECIAL_LANGUAGES.some(regExp => new RegExp(regExp).test(codeblockParameters.language))
	if (fenceCodeParameters.ignore)
		return null

	if (isSourceMode(state))
		return []

	return [{
		from: headerInfo.position,
		to: headerInfo.position,
		value: Decoration.widget({
			widget: new HeaderWidget(
				fenceCodeParameters,
				state.field(editorInfoField)?.file?.path ?? "",
				true,
				plugin,
			)
		}),
	}]
}

function buildLineDecoration(
	state: EditorState,
	lineInfo: LineInfo | null,
	plugin: CodeStylerPlugin,
): Array<Range<Decoration>> {
	if (!lineInfo)
		return []

	const fenceCodeParameters = parseFenceCodeParameters(headerInfo.fenceCodeParametersLine, plugin);

	return [{
		from: headerInfo.position,
		to: headerInfo.position,
		value: Decoration.widget({
			widget: new HeaderWidget(
				fenceCodeParameters,
				state.field(editorInfoField)?.file?.path ?? "",
				true,
				plugin,
			)
		}),
	}]
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
