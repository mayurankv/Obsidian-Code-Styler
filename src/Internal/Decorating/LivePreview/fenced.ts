import { EditorState, Range, StateField, Transaction, Extension, Line } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView } from "@codemirror/view";
import { editorInfoField } from "obsidian";
import { PREFIX } from "src/Internal/constants/general";
import { CommentInfo, HeaderInfo } from "src/Internal/types/detecting";
import CodeStylerPlugin from "src/main";
import { areRangesInteracting, isSourceMode } from "./codemirror/utils";
import { CommentLinkWidget, HeaderWidget, LineNumberWidget } from "./codemirror/widgets";
import { buildFenceCodeDecorations } from "src/Internal/Detecting/LivePreview/fenced";
import { FenceCodeParameters, LinkInfo } from "src/Internal/types/parsing";
import { getLineClasses } from "src/Internal/utils/decorating";
import { SyntaxNodeRef } from "@lezer/common";
import { parseLinks } from "src/Internal/utils/parsing";

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
			return buildFenceCodeDecorations(
				state,
				plugin,
				buildHeaderDecorations,
				buildLineDecorations,
				buildExtraDecoration,
			);
		},

		update(
			value: DecorationSet,
			transaction: Transaction,
		): DecorationSet {
			return buildFenceCodeDecorations(
				transaction.state,
				plugin,
				buildHeaderDecorations,
				buildLineDecorations,
				buildExtraDecoration,
			);
		},

		provide(
			field: StateField<DecorationSet>,
		): Extension {
			return EditorView.decorations.from(field);
		}
	});
}

function buildHeaderDecorations(
	state: EditorState,
	position: number,
	fenceCodeParameters: FenceCodeParameters,
	plugin: CodeStylerPlugin,
): Array<Range<Decoration>> {
	// TODO: Check if these are needed?
	// !isLanguageIgnored(codeblockParameters.language, settings.excludedLanguages) &&
	// !isCodeblockIgnored(codeblockParameters.language, settings.processedCodeblocksWhitelist) &&
	// !SPECIAL_LANGUAGES.some(regExp => new RegExp(regExp).test(codeblockParameters.language))

	return [{
		from: position,
		to: position,
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

function buildLineDecorations(
	state: EditorState,
	position: number,
	lineText: string,
	lineNumber: number,
	fenceCodeParameters: FenceCodeParameters,
	plugin: CodeStylerPlugin,
): Array<Range<Decoration>> {
	return [
		{
			from: position,
			to: position,
			value: Decoration.widget({
				widget: new LineNumberWidget(
					lineNumber,
					fenceCodeParameters,
				)
			}),
		},
		{
			from: position,
			to: position,
			value: Decoration.line({
				attributes: {
					style: "",
					class: getLineClasses(fenceCodeParameters, lineNumber, lineText).join(" "),
				}
			}),
		},
	]
}

function buildExtraDecoration(
	state: EditorState,
	syntaxNode: SyntaxNodeRef,
	line: Line,
	plugin: CodeStylerPlugin,
): Array<Range<Decoration>> {
	if (syntaxNode.type.name.includes("comment_hmd-codeblock") && (syntaxNode.from >= line.from)  && (syntaxNode.to <= line.to)) {
		const commentText = state.sliceDoc(syntaxNode.from, syntaxNode.to);
		const linksInfo = parseLinks(commentText)

		const commentInfo = linksInfo.map((linkInfo: LinkInfo) => {
			return {
				...linkInfo,
				fullLink: linkInfo.match,
				from: syntaxNode.from + linkInfo.offset,
				to: syntaxNode.from + linkInfo.offset + linkInfo.match.length,
			}
		})

		const decorations = commentInfo.reduce(
			(result: Array<Range<Decoration>>, extendedLinkInfo) => {
				if (isSourceMode(state) || areRangesInteracting(state, extendedLinkInfo.from, extendedLinkInfo.to)) {
					if (extendedLinkInfo.type === "wiki")
						result.push({
							from: extendedLinkInfo.from + 2,
							to: extendedLinkInfo.to - 2,
							value: Decoration.mark({
								class: `cm-hmd-internal-link ${PREFIX}-source-link`,
								attributes: {
									destination: extendedLinkInfo.reference,
								},
							}),
						})

					else {
						console.log("foo")
						let startSpaceCount = extendedLinkInfo.fullLink.slice(1).search(/\S/) + 1
						let endSpaceCount = extendedLinkInfo.fullLink.slice(1 + startSpaceCount + extendedLinkInfo.title.length).search(/\S/)

						const splitIndex = 1 + startSpaceCount + extendedLinkInfo.title.length + endSpaceCount

						console.log(extendedLinkInfo)
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

				} else
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

		return decorations
	}

	return []
}
