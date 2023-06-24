import { StateField, StateEffect, RangeSetBuilder } from "@codemirror/state";
import { EditorView, Decoration } from "@codemirror/view";

import { searchString, getLanguageName, isExcluded } from "./Utils";

function defaultFold(state: EditorState, settings: CodeblockCustomizerSettings) {
	let CollapseStart = null;
	let CollapseEnd = null;
	let Fold = false;
	let blockFound = false;
	let bExclude = false;
	const builder = new RangeSetBuilder<Decoration>();
	for (let i = 1; i < state.doc.lines; i++) {
		const lineText = state.doc.line(i).text.toString();
		const line = state.doc.line(i);
		bExclude = isExcluded(lineText, settings.ExcludeLangs);
		if (lineText.startsWith('```') && lineText.indexOf('```', 3) === -1) {
			if (bExclude)
				continue;
			if (CollapseStart === null) {
				Fold = searchString(lineText, "fold");
				if (Fold)
					CollapseStart = line.from;
			} else {
				blockFound = true;
				CollapseEnd = line.to;
			}
		}

		if (blockFound) {
				if (CollapseStart != null && CollapseEnd != null ){            
					const decoration = Decoration.replace({ effect: Collapse.of([doFold.range(CollapseStart, CollapseEnd)]), block:true, side:-1 });
					builder.add(CollapseStart, CollapseEnd, decoration );
					CollapseStart = null;
					CollapseEnd = null;
				}
			blockFound = false;
		}
	}// for
	
	return builder.finish();
}// defaultFold

export const codeblockHeader = StateField.define<DecorationSet>({
	create(state): DecorationSet {
		return Decoration.none;    
	},
	update(oldState: DecorationSet, transaction: Transaction): DecorationSet {
		const builder = new RangeSetBuilder<Decoration>();
		let WidgetStart = null;
		let Fold = false;
		let fileName = null;
		let bExclude = false;
		let specificHeader = true;     
		for (let i = 1; i < transaction.state.doc.lines; i++) {
			const lineText = transaction.state.doc.line(i).text.toString();
			const line = transaction.state.doc.line(i);
			const lang = searchString(lineText, "```");      
			bExclude = isExcluded(lineText, this.settings.ExcludeLangs);
			specificHeader = true;
			if (lineText.startsWith('```') && lineText.indexOf('```', 3) === -1) {
				if (WidgetStart === null) {
					WidgetStart = line;
					fileName = searchString(lineText, "file:");
					Fold = searchString(lineText, "fold");
					if (!bExclude) {
						if (fileName === null || fileName === "") {
							if (Fold) {
								fileName = 'Collapsed Code';
							} else {
								fileName = '';
								specificHeader = false;
							}
						}
						builder.add(WidgetStart.from, WidgetStart.from, createDecorationWidget(fileName, getLanguageName(lang), specificHeader));
						//EditorView.requestMeasure;
					}
				} else {
					WidgetStart = null;
					Fold = false;
					fileName = null;
				}
			}
		}
	
		return builder.finish();
	},
	provide(field: StateField<DecorationSet>): Extension {
		return EditorView.decorations.from(field);
	},
});// codeblockHeader

function createDecorationWidget(textToDisplay: string, languageName: string, specificHeader: boolean) {
	return Decoration.widget({ 
		widget: new TextAboveCodeblockWidget(textToDisplay, languageName, specificHeader), block: true});
}// createDecorationWidget






const Collapse = StateEffect.define(), UnCollapse = StateEffect.define()

export const collapseField = StateField.define({  
	create(state) {
		return defaultFold(state, collapseField.pluginSettings);
		//return Decoration.none   
	},
	update(value, tr) {
		value = value.map(tr.changes)
		for (const effect of tr.effects) {
			if (effect.is(Collapse))
				value = value.update({add: effect.value, sort: true});
			else if (effect.is(UnCollapse)) 
				value = value.update({filter: effect.value});
		}
		return value;
	},
	provide: f => EditorView.decorations.from(f)
})

const doFold = Decoration.replace({block: true});

	
export function handleClick(view: EditorView, target: HTMLElement){
	const Pos = view.posAtDOM(target);

	const effect = view.state.field(collapseField, false);
	let isFolded = false;
	effect.between(Pos, Pos, () => { isFolded = true});
	
	let CollapseStart: number | null = null;
	let CollapseEnd: number | null = null;
	let WidgetStart: number | null = null;
	// NOTE: Can't use for loop over view.visibleRanges, because that way the closing backticks wouldn't be found and collapse would not be possible
	let blockFound = false;
	for (let i = 1; i < view.state.doc.lines; i++) {
		const lineText = view.state.doc.line(i).text.toString();
		const line = view.state.doc.line(i);
		if (lineText.startsWith('```') && lineText.indexOf('```', 3) === -1) {
			if (WidgetStart === null) {
				WidgetStart = line.from;
				if (Pos === line.from){
						CollapseStart = line.from;
				}
			} else {
				blockFound = true;
				CollapseEnd = line.to;
			}
		}
		
		if (blockFound) {
			if (CollapseStart != null && CollapseEnd != null ){
				if (isFolded){
					view.dispatch({ effects: UnCollapse.of((from, to) => to <= CollapseStart || from >= CollapseEnd) });
				}
				else {
					view.dispatch({ effects: Collapse.of([doFold.range(CollapseStart, CollapseEnd)]) });
				}
				view.requestMeasure();
				CollapseStart = null;
				CollapseEnd = null;
			}//if (CollapseStart
			WidgetStart = null;
			blockFound = false;
		}
	}// for
}// handleClick
