import { StateEffect } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { fold } from "./stateEffects";

export function foldOnClick(
	view: EditorView,
	target: HTMLElement,
	folded: boolean,
	language: string | null,
) {
	if (language === null)
		return

	// codeblockFoldCallback(
	// 	view.posAtDOM(target),
	// 	view.state,
	// 	(foldStart, foldEnd) => {
	// 		view.dispatch(
	// 			{
	// 				effects: foldLines(
	// 					!folded,
	// 					{
	// 						from: foldStart.from,
	// 						to: foldEnd.to,
	// 						value: {
	// 							spec: {
	// 								language: language
	// 							}
	// 						}
	// 					})
	// 			},
	// 		);
	// 		view.requestMeasure();
	// 	},
	// );
}
