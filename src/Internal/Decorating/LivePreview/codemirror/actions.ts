import { StateEffect } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { fold, unfold } from "./stateEffects";

export function foldOnClick(
	view: EditorView,
	target: HTMLElement,
	folded: boolean,
	language: string | null,
) {
	codeblockFoldCallback(
		view.posAtDOM(target),
		view.state,
		(foldStart, foldEnd) => {
			view.dispatch(
				{
					effects: foldLines(
						!folded,
						{
							from: foldStart.from,
							to: foldEnd.to,
							value: {
								spec: {
									language: language
								}
							}
						})
				},
			);
			view.requestMeasure();
		},
	);
}

function foldLines(
	toFold: boolean,
	foldInfo: {
		from: number,
		to: number,
		value: {
			spec: {
				language: string
			}
		}
	},
): StateEffect<unknown> {
	return toFold
		? fold.of(foldInfo)
		: unfold.of({ from: foldInfo.from, to: foldInfo.to });
}
