// import { EditorState, Extension, Line, Range, RangeSetBuilder, SelectionRange, StateEffect, StateField, Transaction } from "@codemirror/state";
// import { Decoration, DecorationSet, EditorView, ViewUpdate } from "@codemirror/view";
// import { editorEditorField } from "obsidian";
// import { hideFold, unhideFold } from "src/Internal/Decorating/LivePreview/codemirror/stateEffects";
// import { areRangesInteracting, isFileIgnored, isRangeInteracting, isSourceMode } from "src/Internal/Decorating/LivePreview/codemirror/utils";
// import { CodeStylerSettings } from "src/Internal/types/settings";
// import CodeStylerPlugin from "src/main";

// interface SettingsState {
// 	excludedLanguages: string;
// 	processedCodeblocksWhitelist: string;
// }

// export function createCodeblockCodeMirrorExtensions(
// 	settings: CodeStylerSettings,
// 	plugin: CodeStylerPlugin,
// ) {
// 	const ignoreListener = EditorView.updateListener.of((update: ViewUpdate) => { //TODO (@mayurankv) Can I make this startState only? Does it need to be?
// 		const livePreviewExtensions = livePreviewCompartment.get(update.state);

// 		const fileIgnore = isFileIgnored(update.state) && !(Array.isArray(livePreviewExtensions) && livePreviewExtensions.length === 0);
// 		const fileUnignore = !isFileIgnored(update.state) && (Array.isArray(livePreviewExtensions) && livePreviewExtensions.length === 0);

// 		if (isSourceMode(update.startState) !== fileIgnore || fileUnignore) {
// 			update.view.dispatch({effects: livePreviewCompartment.reconfigure((fileIgnore)?[]:[foldDecorations,hiddenDecorations])});
// 			if (!fileIgnore)
// 				update.view.dispatch({effects: foldAll.of({})});
// 		}
// 	});

// 	const settingsState = StateField.define<SettingsState>({
// 		create(
// 			state: EditorState,
// 		): SettingsState {
// 			return {
// 				excludedLanguages: settings.excludedLanguages,
// 				processedCodeblocksWhitelist: settings.processedCodeblocksWhitelist,
// 			};
// 		},
// 		update(
// 			value: SettingsState,
// 			transaction: Transaction,
// 		): SettingsState {
// 			if (value.processedCodeblocksWhitelist !== settings.processedCodeblocksWhitelist || value.excludedLanguages !== settings.excludedLanguages)
// 				return {
// 					excludedLanguages: settings.excludedLanguages,
// 					processedCodeblocksWhitelist: settings.processedCodeblocksWhitelist,
// 				};
// 			return value;
// 		}
// 	});

// 	function settingsChangeExtender() {
// 		return EditorState.transactionExtender.of((transaction) => {
// 			let addEffects: Array<StateEffect<unknown>> = [];
// 			const initialSettings = transaction.startState.field(settingsState);
// 			let readdFoldLanguages: Array<string> = [];
// 			let removeFoldLanguages: Array<string> = [];
// 			if (initialSettings.processedCodeblocksWhitelist !== settings.processedCodeblocksWhitelist) {
// 				//@ts-expect-error Undocumented Obsidian API
// 				const codeblockProcessors = Object.keys(MarkdownPreviewRenderer.codeBlockPostProcessors);
// 				const initialExcludedCodeblocks = codeblockProcessors.filter(lang=>!initialSettings.processedCodeblocksWhitelist.split(",").map(lang=>lang.trim()).includes(lang));
// 				const currentExcludedCodeblocks = codeblockProcessors.filter(lang=>!settings.processedCodeblocksWhitelist.split(",").map(lang=>lang.trim()).includes(lang));
// 				removeFoldLanguages = removeFoldLanguages.concat(setDifference(currentExcludedCodeblocks,initialExcludedCodeblocks) as Array<string>);
// 				readdFoldLanguages = readdFoldLanguages.concat(setDifference(initialExcludedCodeblocks,currentExcludedCodeblocks) as Array<string>);
// 			}
// 			if (initialSettings.excludedLanguages !== settings.excludedLanguages) {
// 				const initialExcludedLanguages = initialSettings.excludedLanguages.split(",").map(lang=>lang.trim());
// 				const currentExcludedLanguages = settings.excludedLanguages.split(",").map(lang=>lang.trim());
// 				removeFoldLanguages = removeFoldLanguages.concat(setDifference(currentExcludedLanguages,initialExcludedLanguages) as Array<string>);
// 				readdFoldLanguages = readdFoldLanguages.concat(setDifference(initialExcludedLanguages,currentExcludedLanguages) as Array<string>);
// 			}
// 			if (removeFoldLanguages.length !== 0)
// 				addEffects.push(removeFold.of(removeFoldLanguages));
// 			if (readdFoldLanguages.length !== 0)
// 				addEffects = addEffects.concat(convertReaddFold(transaction,readdFoldLanguages));
// 			return (addEffects.length !== 0)?{effects: addEffects}:null;
// 		});
// 	}

// 	const foldDecorations = StateField.define<DecorationSet>({
// 		create(state: EditorState): DecorationSet { //TODO (@mayurankv) Can I change this?
// 			const builder = new RangeSetBuilder<Decoration>();

// 			for (let iter = (state.field(headerDecorations, false) ?? Decoration.none).iter(); iter.value !== null; iter.next()) {
// 				if (!iter.value.spec.widget.codeblockParameters.fold.enabled)
// 					continue;

// 				codeblockFoldCallback(iter.from, state, (foldStart, foldEnd) => {
// 					builder.add(foldStart.from,foldEnd.to,foldDecoration((iter.value as Decoration).spec.widget.codeblockParameters.language));
// 				});
// 			}

// 			return builder.finish();
// 		},
// 		update(value: DecorationSet, transaction: Transaction): DecorationSet {
// 			value = value.map(transaction.changes).update({filter: (from: number, to: number)=>from!==to});
// 			value = value.update({add: transaction.effects.filter(effect=>(effect.is(fold)||effect.is(unhideFold))).map(effect=>foldRegion(effect.value))}); //TODO (@mayurankv) Can I remove `, sort: true`
// 			transaction.effects.filter(effect=>(effect.is(unfold)||effect.is(hideFold))).forEach(effect=>value=value.update(unfoldRegion(effect.value)));
// 			transaction.effects.filter(effect=>effect.is(removeFold)).forEach(effect=>value=value.update(removeFoldLanguages(effect.value)));
// 			return value;
// 		},
// 		provide(field: StateField<DecorationSet>): Extension {
// 			return EditorView.decorations.from(field);
// 		},
// 	});

// 	const hiddenDecorations = StateField.define<DecorationSet>({
// 		create(): DecorationSet {
// 			return Decoration.none;
// 		},
// 		update(value: DecorationSet, transaction: Transaction): DecorationSet {
// 			if (transaction.effects.some(effect=>effect.is(foldAll)))
// 				return Decoration.none;
// 			value = value.map(transaction.changes).update({filter: (from: number, to: number)=>from!==to});
// 			value = value.update({add: transaction.effects.filter(effect=>effect.is(hideFold)).map(effect=>effect.value)}); //TODO (@mayurankv) Can I remove `, sort: true`
// 			transaction.effects.filter(effect=>effect.is(unhideFold)).forEach(effect=>value=value.update(unhideFoldUpdate(effect.value)));
// 			transaction.effects.filter(effect=>effect.is(removeFold)).forEach(effect=>value=value.update(removeFoldLanguages(effect.value)));
// 			return value;
// 		}
// 	});


// 	//!====================================================================

// 	function cursorFoldExtender() {
// 		return EditorState.transactionExtender.of(
// 			(transaction: Transaction) => {
// 				const addEffects: Array<StateEffect<unknown>> = [];

// 				const foldDecorationsState = transaction.startState.field(foldDecorations, false)?.map(transaction.changes) ?? Decoration.none;
// 				const hiddenDecorationsState = transaction.startState.field(hiddenDecorations,false)?.map(transaction.changes) ?? Decoration.none;

// 				transaction.newSelection.ranges.forEach(
// 					(range: SelectionRange) => {
// 						foldDecorationsState.between(
// 							range.from,
// 							range.to,
// 							(foldFrom, foldTo, decorationValue) => {
// 								if (isRangeInteracting(foldFrom,foldTo,range))
// 									addEffects.push(
// 										hideFold.of({
// 											from: foldFrom,
// 											to: foldTo,
// 											value: decorationValue,
// 										}),
// 									);
// 							},
// 						);

// 						for (let iter = hiddenDecorationsState.iter(); iter.value !== null; iter.next()) {
// 							if (!isRangeInteracting(iter.from,iter.to,range))
// 								addEffects.push(
// 									unhideFold.of({
// 										from: iter.from,
// 										to: iter.to,
// 										value: iter.value,
// 									}),
// 								);
// 						}
// 					},
// 				);

// 				return (addEffects.length !== 0) ? { effects: addEffects } : null;
// 			},
// 		);
// 	}

// 	function documentFoldExtender() {
// 		return EditorState.transactionExtender.of((transaction) => {
// 			let addEffects: Array<StateEffect<unknown>> = [];
// 			transaction.effects.filter(effect=>effect.is(foldAll)).forEach(effect=>{
// 				if (typeof effect.value?.toFold !== "undefined")
// 					addEffects = addEffects.concat(documentFold(transaction.startState,effect.value.toFold)); //TODO (@mayurankv) Does this need to be state
// 				else
// 					addEffects = addEffects.concat(documentFold(transaction.startState));
// 			});
// 			return (addEffects.length !== 0)?{effects: addEffects}:null;
// 		});
// 	}
// 	//TODO (@mayurankv) Urgent: Auto add temp unfold on type of fold and remove both fold and temp unfold for removal

// 	//!====================================================================

// 	function convertReaddFold(transaction: Transaction, readdLanguages: Array<string>) {
// 		const addEffects: Array<StateEffect<unknown>> = [];
// 		for (let iter = (transaction.state.field(headerDecorations,false) ?? Decoration.none).iter(); iter.value !== null; iter.next()) { //TODO (@mayurankv) Refactor: Try and make this startState
// 			if (!iter.value.spec.widget.codeblockParameters.fold.enabled || !readdLanguages.includes(iter.value.spec.widget.codeblockParameters.language))
// 				continue;
// 			codeblockFoldCallback(iter.from,transaction.state,(foldStart,foldEnd)=>{
// 				addEffects.push(fold.of({from: foldStart.from,to: foldEnd.to,value: {spec: {language: (iter.value as Decoration).spec.widget.codeblockParameters.language}}}));
// 			});
// 		}
// 		return addEffects;
// 	}

// 	function isFolded(
// 		state: EditorState,
// 		position: number,
// 	): boolean {
// 		let folded = false;

// 		state.field(foldDecorations, false)?.between(position, position, () => {
// 			folded = true;
// 		});

// 		return folded;
// 	}

// 	function documentFold(state: EditorState, toFold?: boolean): Array<StateEffect<unknown>> {
// 		const addEffects: Array<StateEffect<unknown>> = [];
// 		const reset = (typeof toFold === "undefined");
// 		for (let iter = (state.field(headerDecorations,false) ?? Decoration.none).iter(); iter.value !== null; iter.next()) {
// 			if (!iter.value.spec.widget.visible)
// 				continue;

// 			const folded = iter.value.spec.widget.folded;
// 			const defaultFold = iter.value.spec.widget.codeblockParameters.fold.enabled;

// 			codeblockFoldCallback(iter.from, state, (foldStart, foldEnd) => {
// 				if ((!reset && toFold && !folded) || (reset && !folded && defaultFold))
// 					addEffects.push(fold.of({from: foldStart.from, to: foldEnd.to, value: {spec: {language: (iter.value as Decoration).spec.widget.codeblockParameters.language}}}));

// 				else if ((!reset && !toFold && folded) || (reset && folded && !defaultFold))
// 					addEffects.push(unfold.of({from: foldStart.from, to: foldEnd.to}));
// 			});
// 		}
// 		return addEffects;
// 	}

// 	return [
// 		ignoreListener,
// 		foldDecorations,hiddenDecorations,
// 		cursorFoldExtender(),documentFoldExtender(),settingsChangeExtender(),
// 		settingsState,charWidthState,
// 	];
// }












// function codeblockFoldCallback(
// 	startPosition: number,
// 	state: EditorState,
// 	foldCallback: (foldStart: Line, foldEnd: Line) => void,
// ): void {
// 	const foldStart = state.doc.lineAt(startPosition);
// 	const startDelimiter = testOpeningLine(foldStart.text.toString());

// 	let foldEnd: Line | null = null;
// 	for (let i = foldStart.number+1; i <= state.doc.lines; i++) {
// 		const line = state.doc.line(i);
// 		const lineText = line.text.toString();
// 		if (testOpeningLine(lineText) === startDelimiter) {
// 			foldEnd = line;
// 			break;
// 		}
// 	}

// 	if (foldEnd !== null)
// 		foldCallback(foldStart,foldEnd);
// }





// export function editingDocumentFold(view: EditorView, toFold?: boolean) {
// 	view.dispatch({effects: foldAll.of((typeof toFold !== "undefined")?{toFold: toFold}:{})});
// 	view.requestMeasure();
// }


// function foldRegion({from: foldFrom, to: foldTo, value: {spec: {language}}}: {from: number, to: number,value: {spec: {language: string}}}): Range<Decoration> {
// 	return foldDecoration(language).range(foldFrom,foldTo);
// }
// function unfoldRegion({from: foldFrom, to: foldTo}: {from: number, to: number}) {
// 	return {filter: (from: number, to: number) => (to <= foldFrom || from >= foldTo), filterFrom: foldFrom, filterTo: foldTo};
// }

// function removeFoldLanguages(languages: Array<string>) {
// 	return {filter: (from: number, to: number, value: Decoration) => !languages.includes(value?.spec?.language)};
// }

// function unhideFoldUpdate(range: Range<Decoration>) {
// 	return {filterFrom: range.from, filterTo: range.to, filter: (from: number, to: number)=>!(from === range.from && to === range.to)};
// }
// function foldDecoration(language: string): Decoration {
// 	return Decoration.replace({block: true, language: language});
// }

// function setDifference(array1: Array<unknown>, array2: Array<unknown>) {
// 	return array1.filter(element => !array2.includes(element));
// }
