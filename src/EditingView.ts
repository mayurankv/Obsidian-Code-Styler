import { editorEditorField, editorInfoField, editorLivePreviewField } from "obsidian";
import { ViewPlugin, EditorView, ViewUpdate, Decoration, DecorationSet, WidgetType } from "@codemirror/view";
import { Extension, EditorState, StateField, StateEffect, StateEffectType, Range, RangeSetBuilder, Transaction, Line, SelectionRange } from "@codemirror/state";
import { syntaxTree, tokenClassNodeProp } from "@codemirror/language";
import { SyntaxNodeRef } from "@lezer/common";

import { CodeStylerSettings, CodeStylerThemeSettings } from "./Settings";
import { CodeblockParameters, parseCodeblockParameters, testOpeningLine, isExcluded, arraysEqual, trimParameterLine, InlineCodeParameters, parseInlineCode } from "./CodeblockParsing";
import { createHeader, createInlineOpener, getLanguageIcon, getLineClass, getLineNumberDisplay, isHeaderHidden } from "./CodeblockDecorating";

interface SettingsState {
	excludedCodeblocks: string;
	excludedLanguages: string;
	alternativeHighlights: Array<string>;
}

export function createCodeblockCodeMirrorExtensions(settings: CodeStylerSettings, languageIcons: Record<string,string>) {
	const codeblockLines = ViewPlugin.fromClass( //TODO (@mayurankv) Update
		class CodeblockLines {
			settings: CodeStylerSettings;
			decorations: DecorationSet;
			mutationObserver: MutationObserver;
		
			constructor(view: EditorView) {
				this.settings = settings;
				this.decorations = Decoration.none;
				this.buildDecorations(view);
				this.mutationObserver = new MutationObserver((mutations) => {mutations.forEach((mutation: MutationRecord) => {
					if (mutation.type === "attributes" && mutation.attributeName === "class" && (
						(mutation.target as HTMLElement).classList.contains("HyperMD-codeblock-begin") ||
							(mutation.target as HTMLElement).classList.contains("HyperMD-codeblock_HyperMD-codeblock-bg") ||
							(mutation.target as HTMLElement).classList.contains("HyperMD-codeblock-end")
					)) {
						this.buildDecorations(view);
						view.requestMeasure();
					}
				});
				});
				this.mutationObserver.observe(view.contentDOM,  {
					attributes: true,
					childList: true,
					subtree: true,
					attributeFilter: ["class"],
				});
			}
		
			update(update: ViewUpdate) {
				if (update.docChanged || 
					update.viewportChanged || 
					update.state.field(editorLivePreviewField) !== update.startState.field(editorLivePreviewField) ||
					!settingsEqual(update.state.field(settingsState),update.startState.field(settingsState))
				) {
					this.buildDecorations(update.view);
				}
			}
		
			buildDecorations(view: EditorView) {
				if (!view?.visibleRanges?.length || editingViewIgnore(view.state)) {
					this.decorations = Decoration.none;
					return;
				}
				const builder = new RangeSetBuilder<Decoration>();
				const codeblocks = findUnduplicatedCodeblocks(view);
				for (const codeblock of codeblocks) {
					let codeblockParameters: CodeblockParameters;
					let excludedCodeblock = false;
					let lineNumber = 0;
					let maxLineNum = 0;
					let lineNumberMargin: number | undefined = 0;
					syntaxTree(view.state).iterate({from: codeblock.from, to: codeblock.to,
						enter: (syntaxNode)=>{
							const line = view.state.doc.lineAt(syntaxNode.from);
							const lineText = view.state.sliceDoc(line.from,line.to);
							const startLine = syntaxNode.type.name.includes("HyperMD-codeblock-begin");
							const endLine = syntaxNode.type.name.includes("HyperMD-codeblock-end");
							if (startLine) {
								codeblockParameters = parseCodeblockParameters(trimParameterLine(lineText),this.settings.currentTheme);
								excludedCodeblock = isExcluded(codeblockParameters.language,[this.settings.excludedCodeblocks,this.settings.excludedLanguages].join(",")) || codeblockParameters.ignore;
								lineNumber = 0;
								let lineNumberCount = line.number + 1;
								const startDelimiter = testOpeningLine(lineText);
								while (startDelimiter !== testOpeningLine(view.state.doc.line(lineNumberCount).text)) {
									lineNumberCount += 1;
								}
								maxLineNum = lineNumberCount - line.number - 1 + codeblockParameters.lineNumbers.offset;
								if (maxLineNum.toString().length > 2)
									lineNumberMargin = maxLineNum.toString().length * view.state.field(charWidthState);
								else
									lineNumberMargin = undefined;
							}
							if (excludedCodeblock)
								return;
							if (syntaxNode.type.name.includes("HyperMD-codeblock")) {
								builder.add(syntaxNode.from,syntaxNode.from,Decoration.line({attributes: {style: `--line-number-gutter-width: ${lineNumberMargin?lineNumberMargin+"px":"calc(var(--line-number-gutter-min-width) - 12px)"}`, class: ((this.settings.specialLanguages.some(regExp => new RegExp(regExp).test(codeblockParameters.language))||startLine||endLine)?"code-styler-line":getLineClass(codeblockParameters,lineNumber,line.text).join(" "))+(["^$"].concat(this.settings.specialLanguages).some(regExp => new RegExp(regExp).test(codeblockParameters.language))?"":` language-${codeblockParameters.language}`)}}));
								builder.add(syntaxNode.from,syntaxNode.from,Decoration.line({}));
								builder.add(syntaxNode.from,syntaxNode.from,Decoration.widget({widget: new LineNumberWidget(lineNumber,codeblockParameters,maxLineNum,startLine||endLine)}));
								lineNumber++;
							}
						}
					});
				}
				this.decorations = builder.finish();
			}
		
			destroy() {
				this.mutationObserver.disconnect();
			}
		},
		{
			decorations: (value) => value.decorations,
			provide: (plugin) => EditorView.atomicRanges.of((view)=>view.state.field(foldDecorations) || Decoration.none), // eslint-disable-line @typescript-eslint/no-unused-vars
		}
	);
	const inlineCodeDecorator = ViewPlugin.fromClass( //TODO (@mayurankv) Update
		class InlineCodeDecoration {
			decorations: DecorationSet;
			settings: CodeStylerSettings;
			syntaxHighlight: boolean;

			constructor(view: EditorView) {
				this.decorations = Decoration.none;
				this.settings = settings;
				this.syntaxHighlight = settings.currentTheme.settings.inline.syntaxHighlight;
				this.buildDecorations(view);
			}

			update(update: ViewUpdate) {
				if (update.docChanged || update.viewportChanged || update.selectionSet || update.state.field(editorLivePreviewField)!==update.startState.field(editorLivePreviewField) || this.settings.currentTheme.settings.inline.syntaxHighlight !== this.syntaxHighlight) {
					this.syntaxHighlight = this.settings.currentTheme.settings.inline.syntaxHighlight;
					if (update.docChanged) 
						this.decorations = this.decorations.map(update.changes);
					this.buildDecorations(update.view);
				}
			}

			buildDecorations(view: EditorView): void {
				if (!view?.visibleRanges?.length) {
					this.decorations = Decoration.none;
					return;
				}
				const sourceMode = editingViewIgnore(view.state);
				for (const {from,to} of view.visibleRanges) {
					syntaxTree(view.state).iterate({from: from, to: to,
						enter: (syntaxNode)=>{
							const properties = new Set(syntaxNode.node.type.prop<string>(tokenClassNodeProp)?.split(" "));
							if (!(properties.has("inline-code") && !properties.has("formatting")))
								return;
							const previousSibling = syntaxNode.node.prevSibling;
							if (!previousSibling)
								return;
							const delimiterSize = previousSibling.to-previousSibling.from;
							const inlineCodeText = view.state.doc.sliceString(syntaxNode.from, syntaxNode.to);
							const {parameters,text} = parseInlineCode(inlineCodeText);
							const endOfParameters = inlineCodeText.lastIndexOf(text);
							if (!parameters) {
								if (text) {
									if (view.state.selection.ranges.some((range: SelectionRange)=>range.to >= syntaxNode.from-delimiterSize && range.from <= syntaxNode.to+delimiterSize) || editingViewIgnore(view.state))
										this.decorations = this.decorations.update({filterFrom: syntaxNode.from, filterTo: syntaxNode.from, filter: ()=>false});
									else
										this.decorations = this.decorations.update({add: [{from: syntaxNode.from, to: syntaxNode.from + endOfParameters, value: Decoration.replace({})}]});
								}
							} else {
								if (view.state.selection.ranges.some((range: SelectionRange)=>range.to >= syntaxNode.from-delimiterSize && range.from <= syntaxNode.to+delimiterSize)) {
									this.decorations.between(syntaxNode.from, syntaxNode.from, (from: number, to: number)=>{
										this.decorations = this.decorations.update({filterFrom: from, filterTo: to, filter: ()=>false});
									});
									this.decorations = this.decorations.update({add: [{from: syntaxNode.from, to: syntaxNode.from + endOfParameters, value: Decoration.mark({class: "code-styler-inline-parameters"})}]});
								} else {
									let decorated = false;
									this.decorations.between(syntaxNode.from, syntaxNode.from, (from: number, to: number, decorationValue: Decoration)=>{
										if (!decorationValue.spec?.class)
											decorated = true;
									});
									if (!decorated && !sourceMode) {
										this.decorations = this.decorations.update({add: [{from: syntaxNode.from, to: syntaxNode.from + endOfParameters, value: Decoration.replace({})}]});
										if (parameters?.title || (parameters?.icon && getLanguageIcon(parameters.language,languageIcons)))
											this.decorations = this.decorations.update({add: [{from: syntaxNode.from, to: syntaxNode.from, value: Decoration.replace({widget: new OpenerWidget(parameters,languageIcons)})}]});
									}
								}
								this.decorations = this.decorations.update({filterFrom: syntaxNode.from + endOfParameters+1, filterTo: syntaxNode.to, filter: ()=>false});
								if (sourceMode)
									this.decorations = this.decorations.update({filterFrom: syntaxNode.from, filterTo: syntaxNode.from + endOfParameters, filter: (from: number, to: number, value: Decoration)=>"class" in value.spec}); // eslint-disable-line @typescript-eslint/no-unused-vars
								if (!settings.currentTheme.settings.inline.syntaxHighlight)
									return;
								this.decorations = this.decorations.update({add: modeHighlight({start: syntaxNode.from + endOfParameters, text: text, language: parameters.language})});
							}
						},
					});
				}
			}
		},
		{
			decorations: (value) => value.decorations,
		}
	);
	
	const settingsState = StateField.define<SettingsState>({
		create(): SettingsState {
			return {
				excludedCodeblocks: settings.excludedCodeblocks,
				excludedLanguages: settings.excludedLanguages,
				alternativeHighlights: Object.keys(settings.currentTheme.colours.light.highlights.alternativeHighlights),
			};
		},
		update(value: SettingsState): SettingsState {
			if (settingsChanges(value,settings)) {
				return {
					excludedCodeblocks: settings.excludedCodeblocks,
					excludedLanguages: settings.excludedLanguages,
					alternativeHighlights: Object.keys(settings.currentTheme.colours.light.highlights.alternativeHighlights),
				};
			}
			return value;
		}
	});
	const charWidthState = StateField.define<number>({
		create(state: EditorState): number {
			return getCharWidth(state,state.field(editorEditorField).defaultCharacterWidth);
		},
		update(value: number, transaction: Transaction): number {
			return getCharWidth(transaction.state,value);
		}
	});
	const headerDecorations = StateField.define<DecorationSet>({ //TODO (@mayurankv) Update (does this need to be updated in this manner?)
		create(state: EditorState): DecorationSet {
			if (editingViewIgnore(state))
				return Decoration.none;
			return buildHeaders(state);
		},
		update(value: DecorationSet, transaction: Transaction): DecorationSet {
			if (editingViewIgnore(transaction.state))
				return Decoration.none;
			return buildHeaders(transaction.state,(position)=>isFolded(transaction.state,position));
		},
		provide(field: StateField<DecorationSet>): Extension {
			return EditorView.decorations.from(field);
		}
	});
	const foldDecorations = StateField.define<DecorationSet>({
		create(state: EditorState): DecorationSet {
			if (editingViewIgnore(state))
				return Decoration.none;
			const builder = new RangeSetBuilder<Decoration>();
			const headerDecorationsState = state.field(headerDecorations,false) ?? Decoration.none;
			for (let iter = headerDecorationsState.iter(); iter.value !== null; iter.next()) {
				if (!iter.value.spec.widget.codeblockParameters.fold.enabled)
					continue;
				codeblockFoldCallback(iter.from,state,(foldStart,foldEnd)=>{
					builder.add(foldStart.from,foldEnd.to,foldDecoration((iter.value as Decoration).spec.widget.codeblockParameters.language));
				});
			}
			return builder.finish();
		},
		update(value: DecorationSet, transaction: Transaction): DecorationSet {
			// if (editingViewIgnore(transaction.state))
			// 	return Decoration.none;
			value = value.map(transaction.changes);
			value = value.update({add: transaction.effects.filter(effect=>(effect.is(fold)||effect.is(unhideFold))).map(effect=>foldRegion(effect.value))}); //TODO (@mayurankv) Can I remove `, sort: true`
			transaction.effects.filter(effect=>(effect.is(unfold)||effect.is(hideFold))).forEach(effect=>value=value.update(unfoldRegion(effect.value)));
			transaction.effects.filter(effect=>effect.is(removeFold)).forEach(effect=>value=value.update(removeFoldLanguage(effect.value)));
			return value;
		},
		provide(field: StateField<DecorationSet>): Extension {
			return EditorView.decorations.from(field);
		},
	});
	const hiddenDecorations = StateField.define<DecorationSet>({
		create(): DecorationSet {
			return Decoration.none;
		},
		update(value: DecorationSet, transaction: Transaction): DecorationSet {
			if (transaction.effects.some(effect=>effect.is(foldAll))) //editingViewIgnore(transaction.state) || 
				return Decoration.none;
			value = value.map(transaction.changes);
			value = value.update({add: transaction.effects.filter(effect=>effect.is(hideFold)).map(effect=>effect.value)}); //TODO (@mayurankv) Can I remove `, sort: true`
			transaction.effects.filter(effect=>effect.is(unhideFold)).forEach(effect=>value=value.update(unhideFoldUpdate(effect.value)));
			transaction.effects.filter(effect=>effect.is(removeFold)).forEach(effect=>value=value.update(removeFoldLanguage(effect.value)));
			return value;
		}
	});

	function cursorFoldExtender() {
		return EditorState.transactionExtender.of((transaction: Transaction) => {
			const addEffects: Array<StateEffect<unknown>> = [];
			const foldDecorationsState = transaction.startState.field(foldDecorations,false)?.map(transaction.changes) ?? Decoration.none;
			const hiddenDecorationsState = transaction.startState.field(hiddenDecorations,false)?.map(transaction.changes) ?? Decoration.none;
			transaction.newSelection.ranges.forEach((range: SelectionRange)=>{
				foldDecorationsState.between(range.from, range.to, (foldFrom, foldTo, decorationValue) => {
					if (foldFrom <= range.head && range.head <= foldTo)
						addEffects.push(hideFold.of({from: foldFrom, to: foldTo, value: decorationValue}));
				});
				for (let iter = hiddenDecorationsState.iter(); iter.value !== null; iter.next()) {
					if (!(iter.from <= range.head && range.head <= iter.to))
						addEffects.push(unhideFold.of({from: iter.from, to: iter.to, value: iter.value}));
				}
			});
			return (addEffects.length !== 0)?{effects: addEffects}:null;
		});
	}
	function documentFoldExtender() {
		return EditorState.transactionExtender.of((transaction) => {
			let addEffects: Array<StateEffect<unknown>> = [];
			transaction.effects.filter(effect=>effect.is(foldAll)).forEach(effect=>{
				if (typeof effect.value?.toFold !== "undefined")
					addEffects = addEffects.concat(documentFold(transaction.startState,effect.value.toFold)); //TODO (@mayurankv) Does this need to be state
				else
					addEffects = addEffects.concat(documentFold(transaction.startState));
			});
			return (addEffects.length !== 0)?{effects: addEffects}:null;
		});
	}
	function settingsChangeExtender() {
		return EditorState.transactionExtender.of((transaction) => {
			let addEffects: Array<StateEffect<unknown>> = [];
			const initialSettings = transaction.startState.field(settingsState);
			let readdFoldLanguages: Array<string> = [];
			let removeFoldLanguages: Array<string> = [];
			if (initialSettings.excludedCodeblocks !== settings.excludedCodeblocks) {
				const initialExcludedCodeblocks = initialSettings.excludedCodeblocks.split(",").map(lang=>lang.trim());
				const currentExcludedCodeblocks = settings.excludedCodeblocks.split(",").map(lang=>lang.trim());
				removeFoldLanguages = removeFoldLanguages.concat(setDifference(currentExcludedCodeblocks,initialExcludedCodeblocks) as Array<string>);
				readdFoldLanguages = readdFoldLanguages.concat(setDifference(initialExcludedCodeblocks,currentExcludedCodeblocks) as Array<string>);
			}
			if (initialSettings.excludedLanguages !== settings.excludedLanguages) {
				const initialExcludedLanguages = initialSettings.excludedLanguages.split(",").map(lang=>lang.trim());
				const currentExcludedLanguages = settings.excludedLanguages.split(",").map(lang=>lang.trim());
				removeFoldLanguages = removeFoldLanguages.concat(setDifference(currentExcludedLanguages,initialExcludedLanguages) as Array<string>);
				readdFoldLanguages = readdFoldLanguages.concat(setDifference(initialExcludedLanguages,currentExcludedLanguages) as Array<string>);
			}
			if (removeFoldLanguages.length !== 0)
				addEffects.push(removeFold.of(removeFoldLanguages));
			if (readdFoldLanguages.length !== 0)
				addEffects = addEffects.concat(convertReaddFold(transaction,readdFoldLanguages));
			return (addEffects.length !== 0)?{effects: addEffects}:null;
		});
	}
	//TODO (@mayurankv) Urgent: Auto add temp unfold on type of fold and remove both fold and temp unfold for removal

	class LineNumberWidget extends WidgetType {
		lineNumber: number;
		codeblockParameters: CodeblockParameters;
		maxLineNum: number;
		empty: boolean;
	
		constructor(lineNumber: number, codeblockParameters: CodeblockParameters, maxLineNum: number, empty: boolean) {
			super();
			this.lineNumber = lineNumber;
			this.codeblockParameters = codeblockParameters;
			this.maxLineNum = maxLineNum;
			this.empty = empty;
		}
	
		eq(other: LineNumberWidget): boolean {
			return this.lineNumber === other.lineNumber && this.codeblockParameters.lineNumbers.alwaysEnabled === other.codeblockParameters.lineNumbers.alwaysEnabled && this.codeblockParameters.lineNumbers.alwaysDisabled === other.codeblockParameters.lineNumbers.alwaysDisabled && this.codeblockParameters.lineNumbers.offset === other.codeblockParameters.lineNumbers.offset && this.maxLineNum === other.maxLineNum && this.empty === other.empty;
		}
	
		toDOM(view: EditorView): HTMLElement { // eslint-disable-line @typescript-eslint/no-unused-vars
			return createSpan({attr: {style: this.maxLineNum.toString().length > (this.lineNumber + this.codeblockParameters.lineNumbers.offset).toString().length?"width: var(--line-number-gutter-width);":""}, cls: `code-styler-line-number${getLineNumberDisplay(this.codeblockParameters)}`, text: this.empty?"":(this.lineNumber + this.codeblockParameters.lineNumbers.offset).toString()});
		}
	}
	class HeaderWidget extends WidgetType {
		codeblockParameters: CodeblockParameters;
		themeSettings: CodeStylerThemeSettings;
		languageIcons: Record<string,string>;
		iconURL: string | undefined;
		folded: boolean;
		hidden: boolean;
	
		constructor(codeblockParameters: CodeblockParameters, folded: boolean, themeSettings: CodeStylerThemeSettings, languageIcons: Record<string,string>) {
			super();
			this.codeblockParameters = structuredClone(codeblockParameters);
			this.themeSettings = structuredClone(themeSettings);
			this.languageIcons = languageIcons;
			this.iconURL = getLanguageIcon(this.codeblockParameters.language,languageIcons);
			this.folded = folded;
			this.hidden = isHeaderHidden(this.codeblockParameters,this.themeSettings,this.iconURL);
		}
			
		eq(other: HeaderWidget): boolean {
			return (
				this.codeblockParameters.language === other.codeblockParameters.language &&
				this.codeblockParameters.title === other.codeblockParameters.title &&
				this.codeblockParameters.fold.enabled === other.codeblockParameters.fold.enabled &&
				this.codeblockParameters.fold.placeholder === other.codeblockParameters.fold.placeholder &&
				this.themeSettings.header.foldPlaceholder === other.themeSettings.header.foldPlaceholder &&
				this.themeSettings.header.languageIcon.display === other.themeSettings.header.languageIcon.display &&
				this.themeSettings.header.languageTag.display === other.themeSettings.header.languageTag.display &&
				this.folded === other.folded &&
				this.iconURL === other.iconURL
			);
		}
			
		toDOM(view: EditorView): HTMLElement {
			const headerContainer = createHeader(this.codeblockParameters,this.themeSettings,this.languageIcons);
			if (this.codeblockParameters.language!=="")
				headerContainer.classList.add(`language-${this.codeblockParameters.language}`);
			if (this.folded)
				headerContainer.classList.add("code-styler-header-folded");
			headerContainer.onclick = event => {foldOnClick(view,headerContainer,this.folded,this.codeblockParameters.language);}; // eslint-disable-line @typescript-eslint/no-unused-vars
			return headerContainer;
		}
	
		// ignoreEvent() { //TODO (@mayurankv) Can I remove this?
		// 	return false;
		// }
	}
	class OpenerWidget extends WidgetType {
		inlineCodeParameters: InlineCodeParameters;
		languageIcons: Record<string,string>;

		constructor (inlineCodeParameters: InlineCodeParameters, languageIcons: Record<string,string>) {
			super();
			this.inlineCodeParameters = inlineCodeParameters;
			this.languageIcons = languageIcons;
		}

		eq(other: OpenerWidget): boolean {
			return (
				this.inlineCodeParameters.language == other.inlineCodeParameters.language &&
				this.inlineCodeParameters.title == other.inlineCodeParameters.title &&
				this.inlineCodeParameters.icon == other.inlineCodeParameters.icon &&
				getLanguageIcon(this.inlineCodeParameters.language,this.languageIcons) == getLanguageIcon(other.inlineCodeParameters.language,other.languageIcons)
			);
		}

		toDOM(view: EditorView): HTMLElement { // eslint-disable-line @typescript-eslint/no-unused-vars
			return createInlineOpener(this.inlineCodeParameters,this.languageIcons,["code-styler-inline-opener","cm-inline-code"]);
		}
	}

	function buildHeaders(state: EditorState, foldValue: (position: number, defaultFold: boolean)=>boolean = (position,defaultFold)=>defaultFold): DecorationSet {
		const builder = new RangeSetBuilder<Decoration>();
		let startLine: boolean = true;
		let startDelimiter: string = "```";
		let codeblockParameters: CodeblockParameters;
		for (let i = 1; i < state.doc.lines; i++) {
			const line = state.doc.line(i);
			const lineText = line.text.toString();
			const currentDelimiter = testOpeningLine(lineText);
			if (currentDelimiter) {
				if (startLine) {
					startLine = false;
					startDelimiter = currentDelimiter;
					codeblockParameters = parseCodeblockParameters(trimParameterLine(lineText),settings.currentTheme);
					if (!isExcluded(codeblockParameters.language,[settings.excludedCodeblocks,settings.excludedLanguages].join(",")) && !codeblockParameters.ignore) {
						if (!settings.specialLanguages.some(regExp => new RegExp(regExp).test(codeblockParameters.language)))
							builder.add(line.from,line.from,Decoration.widget({widget: new HeaderWidget(codeblockParameters,foldValue(line.from,codeblockParameters.fold.enabled),settings.currentTheme.settings,languageIcons), block: true, side: -1}));
						else
							continue;
					}
				} else {
					if (currentDelimiter === startDelimiter)
						startLine = true;
				}
			}
		}
		return builder.finish();
	}
	function convertReaddFold(transaction: Transaction, readdLanguages: Array<string>) {
		const addEffects: Array<StateEffect<unknown>> = [];
		const headerDecorationsState = transaction.state.field(headerDecorations,false) ?? Decoration.none; //TODO (@mayurankv) Refactor: Try and make this startState
		for (let iter = headerDecorationsState.iter(); iter.value !== null; iter.next()) {
			if (!iter.value.spec.widget.codeblockParameters.fold.enabled || !readdLanguages.includes(iter.value.spec.widget.codeblockParameters.language))
				continue;
			codeblockFoldCallback(iter.from,transaction.state,(foldStart,foldEnd)=>{
				addEffects.push(fold.of({from: foldStart.from,to: foldEnd.to,value: {spec: {language: (iter.value as Decoration).spec.widget.codeblockParameters.language}}}));
			});
		}
		return addEffects;
	}
	function isFolded(state: EditorState, position: number): boolean {
		let folded = false;
		state.field(foldDecorations,false)?.between(position,position,()=>{
			folded = true;
		});
		return folded;
	}
	function documentFold(state: EditorState, toFold?: boolean): Array<StateEffect<unknown>> {
		const addEffects: Array<StateEffect<unknown>> = [];
		const reset = (typeof toFold === "undefined");
		const headerDecorationsState = state.field(headerDecorations,false) ?? Decoration.none;
		for (let iter = headerDecorationsState.iter(); iter.value !== null; iter.next()) {
			if (iter.value.spec.widget.hidden)
				continue;
			const folded = iter.value.spec.widget.folded;
			const defaultFold = iter.value.spec.widget.codeblockParameters.fold.enabled;
			codeblockFoldCallback(iter.from,state,(foldStart,foldEnd)=>{
				if ((!reset && toFold && !folded) || (reset && !folded && defaultFold))
					addEffects.push(fold.of({from: foldStart.from, to: foldEnd.to, value: {spec: {language: (iter.value as Decoration).spec.widget.codeblockParameters.language}}}));
				else if ((!reset && !toFold && folded) || (reset && folded && !defaultFold))
					addEffects.push(unfold.of({from: foldStart.from, to: foldEnd.to}));
			});
		}
		return addEffects;
	}

	return [
		settingsState,charWidthState,headerDecorations,foldDecorations,hiddenDecorations,
		codeblockLines,inlineCodeDecorator,
		cursorFoldExtender(),documentFoldExtender(),settingsChangeExtender()
		// ,readdConversionExtender()
	];
}

const fold: StateEffectType<{from: number, to: number, value: {spec: {language: string}}}> = StateEffect.define();
const unfold: StateEffectType<{from: number, to: number}> = StateEffect.define();
const hideFold: StateEffectType<Range<Decoration>> = StateEffect.define();
const unhideFold: StateEffectType<Range<Decoration>> = StateEffect.define();
const removeFold: StateEffectType<Array<string>> = StateEffect.define();
const foldAll: StateEffectType<{toFold?: boolean}> = StateEffect.define();

function modeHighlight ({start,text,language}: {start: number, text: string, language: string}): Array<Range<Decoration>> {
	const markDecorations: Array<Range<Decoration>> = [];
	//@ts-expect-error Undocumented Obsidian API
	const mode = window.CodeMirror.getMode(window.CodeMirror.defaults,window.CodeMirror.findModeByName(language)?.mime); // Alternatives: `text/x-${parameters.language}`, window.CodeMirror.findModeByName('js').mime
	const state = window.CodeMirror.startState(mode);
	if (mode?.token) {
		const stream = new window.CodeMirror.StringStream(text);
		while (!stream.eol()) {
			const style = mode.token(stream,state);
			if (style)
				markDecorations.push({from: start+stream.start, to: start+stream.pos, value: Decoration.mark({class: `cm-${style}`})});
			stream.start = stream.pos;
		}
	}
	return markDecorations;
}

export function editingDocumentFold(view: EditorView, toFold?: boolean) {
	view.dispatch({effects: foldAll.of((typeof toFold !== "undefined")?{toFold: toFold}:{})});
	view.requestMeasure();
}
function foldOnClick(view: EditorView, target: HTMLElement, folded: boolean, language: string) {
	codeblockFoldCallback(view.posAtDOM(target),view.state,(foldStart,foldEnd)=>{
		view.dispatch({effects: foldLines(!folded,{from: foldStart.from, to: foldEnd.to, value: {spec: {language: language}}})});
		view.requestMeasure();
	});
}
function foldLines(toFold: boolean, foldInfo: {from: number, to: number,value: {spec: {language: string}}}): StateEffect<unknown> {
	return toFold?fold.of(foldInfo):unfold.of({from: foldInfo.from, to: foldInfo.to});
}
function foldRegion({from: foldFrom, to: foldTo, value: {spec: {language}}}: {from: number, to: number,value: {spec: {language: string}}}): Range<Decoration> {
	return foldDecoration(language).range(foldFrom,foldTo);
}
function unfoldRegion({from: foldFrom, to: foldTo}: {from: number, to: number}) {
	return {filter: (from: number, to: number) => (to <= foldFrom || from >= foldTo), filterFrom: foldFrom, filterTo: foldTo};
}
function removeFoldLanguage(languages: Array<string>) {
	return {filter: (from: number, to: number, value: Decoration) => !languages.includes(value?.spec?.language)};
}
function unhideFoldUpdate(range: Range<Decoration>) {
	return {filterFrom: range.from, filterTo: range.to, filter: (from: number, to: number)=>!(from === range.from && to === range.to)};
}
function foldDecoration(language: string): Decoration {
	return Decoration.replace({block: true, language: language});
}

function codeblockFoldCallback(startPosition: number, state: EditorState, foldCallback: (foldStart: Line, foldEnd: Line)=>void) {
	const foldStart = state.doc.lineAt(startPosition);
	const startDelimiter = testOpeningLine(foldStart.text.toString());
	let foldEnd: Line | null = null;
	for (let i = foldStart.number+1; i < state.doc.lines; i++) {
		const line = state.doc.line(i);
		const lineText = line.text.toString();
		if (testOpeningLine(lineText) === startDelimiter) {
			foldEnd = line;
			break;
		}
	}
	if (foldEnd !== null)
		foldCallback(foldStart,foldEnd);
}
function findUnduplicatedCodeblocks(view: EditorView): Array<SyntaxNodeRef> { //TODO (@mayurankv) Can I get around this?
	const codeblocks = findVisibleCodeblocks(view);
	const unduplicatedCodeblocks: Array<SyntaxNodeRef> = [];
	for (let i = 0; i < codeblocks.length; i++)
		if (i === 0 || codeblocks[i].from !== codeblocks[i - 1].from)
			unduplicatedCodeblocks.push(codeblocks[i]);
	return unduplicatedCodeblocks;
}
function findVisibleCodeblocks(view: EditorView): Array<SyntaxNodeRef> {
	return findCodeblocks(view).filter((codeblock) => {
		return view.visibleRanges.some((visibleRange) => codeblock.from < visibleRange.to && codeblock.to > visibleRange.from);
	});
}
function findCodeblocks(view: EditorView): Array<SyntaxNodeRef> {
	const codeblocks: Array<SyntaxNodeRef> = [];
	syntaxTree(view.state).iterate({
		enter: (syntaxNode) => {
			if (syntaxNode.type.name.includes("HyperMD-codeblock-begin") || syntaxNode.type.name === "HyperMD-codeblock_HyperMD-codeblock-bg" || syntaxNode.type.name.includes("HyperMD-codeblock-end"))
				codeblocks.push(syntaxNode);
		}
	});
	return codeblocks;
}

function editingViewIgnore(state: EditorState): boolean {
	if (!state.field(editorLivePreviewField))
		return true;
	const filePath = state.field(editorInfoField)?.file?.path;
	if (typeof filePath !== "undefined")
		return this.app.metadataCache.getCache(filePath)?.frontmatter?.["code-styler-ignore"] === true;
	return false;
}
function getCharWidth(state: EditorState, default_value: number): number {
	const charWidths = Array.from(state.field(editorEditorField).contentDOM.querySelectorAll(".HyperMD-codeblock-end")).reduce((result: Array<number>,beginningElement: HTMLElement): Array<number> => {
		const nextElement = beginningElement.previousElementSibling as HTMLElement;
		if (!nextElement)
			return result;
		const lineNumberElement = nextElement.querySelector("[class^='code-styler-line-number']") as HTMLElement;
		if (!lineNumberElement || lineNumberElement.innerText.length <= 2)
			return result;
		const computedStyles = window.getComputedStyle(lineNumberElement, null);
		result.push((lineNumberElement.getBoundingClientRect().width - parseFloat(computedStyles.paddingLeft) - parseFloat(computedStyles.paddingRight)) / lineNumberElement.innerText.length);
		return result;
	},[]);
	if (charWidths.length === 0)
		return default_value;
	return charWidths.reduce((result,value)=>result+value,0) / charWidths.length;
}
function settingsChanges(settingsState: SettingsState,settings: CodeStylerSettings) {
	return !settingsEqual(settingsState,{excludedCodeblocks: settings.excludedCodeblocks, excludedLanguages: settings.excludedLanguages, alternativeHighlights: Object.keys(settings.currentTheme.colours.light.highlights.alternativeHighlights)});
}
function settingsEqual(initialSettingsState: SettingsState, newSettingsState: SettingsState) {
	return initialSettingsState.excludedCodeblocks === newSettingsState.excludedCodeblocks && initialSettingsState.excludedLanguages === newSettingsState.excludedLanguages && arraysEqual(initialSettingsState.alternativeHighlights,newSettingsState.alternativeHighlights);
}
function setDifference(array1: Array<unknown>, array2: Array<unknown>) {
	return array1.filter(element => !array2.includes(element));
}
