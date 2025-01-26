import { syntaxTree } from "@codemirror/language";
import { EditorState, Extension, RangeSetBuilder, SelectionRange, StateField, Transaction } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView } from "@codemirror/view";
import { SyntaxNodeRef } from "@lezer/common";
import { PREFIX } from "src/Internal/constants/general";
import { parseInlineCodeParameters, splitInlineCodeRaw, toHighlightInlineCode } from "src/Internal/Parsing/inline";
import { InlineCodeInfo } from "src/Internal/types/detecting";
import { getInlineDelimiterSize, isRangeInteracting, isSourceMode } from "./codemirror/utils";
import { InlineHeaderWidget } from "./codemirror/widgets";
import CodeStylerPlugin from "src/main";

export function getInlineCodeMirrorExtensions(
	plugin: CodeStylerPlugin,
) {
	return [
	]
}


export const inlineDecorations = StateField.define<DecorationSet>({
	create(state: EditorState): DecorationSet {
		return buildInlineDecorations(state);
	},
	update(value: DecorationSet, transaction: Transaction): DecorationSet {
		return buildInlineDecorations(transaction.state);
	},
	provide(field: StateField<DecorationSet>): Extension {
		return EditorView.decorations.from(field);
	}
});

function buildInlineDecorations(
	state: EditorState,
): DecorationSet {
	if (!toHighlightInlineCode(plugin))
		return Decoration.none;

	let builder = new RangeSetBuilder<Decoration>();

	syntaxTree(state).iterate({
		enter: (syntaxNode)=>{
			builder = addInlineDecorations(
				state,
				builder,
				getInlineCodeInfo(state, syntaxNode),
			);
		},
	});

	return builder.finish();
}

function getInlineCodeInfo(
	state: EditorState,
	syntaxNode: SyntaxNodeRef,
): InlineCodeInfo | null {
	const delimiterSize = getInlineDelimiterSize(syntaxNode);
	if (delimiterSize === null)
		return null;

	const inlineCodeRaw = state.doc.sliceString(syntaxNode.from, syntaxNode.to);

	const {inlineCodeParametersLine, inlineCodeContent} = splitInlineCodeRaw(inlineCodeRaw);
	const inlineCodeParameters = parseInlineCodeParameters((inlineCodeParametersLine ?? "") + " ");
	const inlineCodeParametersLineLength = (inlineCodeParametersLine ?? "").length

	return {
		parameters: {
			from: syntaxNode.from,
			to: syntaxNode.from + inlineCodeParametersLineLength,
			value: inlineCodeParameters,
		},
		content: {
			from: syntaxNode.from + inlineCodeParametersLineLength + 1,
			to: syntaxNode.to,
			value: inlineCodeContent,
		},
		section: {
			from: syntaxNode.from - delimiterSize,
			to: syntaxNode.to + delimiterSize,
		}
	};
}

function addInlineDecorations(
	state: EditorState,
	builder: RangeSetBuilder<Decoration>,
	inlineCodeInfo: InlineCodeInfo | null,
): RangeSetBuilder<Decoration> {
	if (!inlineCodeInfo)
		return builder

	if (
		!state.selection.ranges.some(
			(range: SelectionRange) => isRangeInteracting(
				inlineCodeInfo.section.from,
				inlineCodeInfo.section.to,
				range,
			),
		) &&
		!isSourceMode(state)
	) {
		// if (text.value) // TODO: Is this needed if parameters is null?
		builder.add(
			inlineCodeInfo.parameters.from,
			inlineCodeInfo.parameters.to,
			Decoration.replace({}),
		);

		if (inlineCodeInfo.parameters.from !== inlineCodeInfo.parameters.to)
			builder.add(
				inlineCodeInfo.parameters.from,
				inlineCodeInfo.parameters.from,
				Decoration.replace({
					widget: new InlineHeaderWidget(
						inlineCodeInfo.parameters.value,
					)
				}));

		builder = inlineSyntaxHighlight(
			inlineCodeInfo.parameters.value.language,
			inlineCodeInfo.content.value,
			inlineCodeInfo.parameters.to,
			builder,
		);

	}

	builder.add(
		inlineCodeInfo.parameters.from,
		inlineCodeInfo.parameters.to,
		Decoration.mark({
			class: PREFIX + "inline-parameters",
		}),
	);

	return builder
}

function inlineSyntaxHighlight(
	language: string,
	content: string,
	start: number,
	builder: RangeSetBuilder<Decoration>,
): RangeSetBuilder<Decoration> {
	// @ts-expect-error Undocumented Obsidian API
	const mode = window.CodeMirror.getMode(window.CodeMirror.defaults,window.CodeMirror.findModeByName(language)?.mime);
	const state = window.CodeMirror.startState(mode);

	if (mode?.token) {
		const stream = new window.CodeMirror.StringStream(content);
		while (!stream.eol()) {
			const style = mode.token(stream,state);
			if (style)
				builder.add(start+stream.start, start+stream.pos, Decoration.mark({class: `cm-${style}`}));
			stream.start = stream.pos;
		}
	}

	return builder;
}
