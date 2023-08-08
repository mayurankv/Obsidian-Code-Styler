import { editorEditorField, editorInfoField, editorLivePreviewField } from "obsidian";
import { ViewPlugin, EditorView, ViewUpdate, Decoration, DecorationSet, WidgetType } from "@codemirror/view";
import { Extension, EditorState, StateField, StateEffect, StateEffectType, Range, RangeSetBuilder, Transaction, TransactionSpec, Line, SelectionRange, Annotation } from "@codemirror/state";
import { syntaxTree, tokenClassNodeProp, LanguageSupport } from "@codemirror/language";
import { SyntaxNodeRef } from "@lezer/common";
import { highlightTree, classHighlighter } from "@lezer/highlight";
// import { languages } from "@codemirror/language-data"; //NOTE: For future CM6 Compatibility

import { CodeStylerSettings, CodeStylerThemeSettings } from "./Settings";
import { CodeblockParameters, parseCodeblockParameters, testOpeningLine, isExcluded, arraysEqual, trimParameterLine, InlineCodeParameters, parseInlineCode } from "./CodeblockParsing";
import { createHeader, createInlineOpener, getLanguageIcon, getLineClass } from "./CodeblockDecorating";

export function createCodeblockCodeMirrorExtensions(settings: CodeStylerSettings, languageIcons: Record<string,string>) {
	const codeblockLineNumberCharWidth = StateField.define<number>({
		create(state: EditorState): number {
			return getCharWidth(state,state.field(editorEditorField).defaultCharacterWidth);
		},
		update(value: number, transaction: Transaction): number {
			return getCharWidth(transaction.state,value);
		}
	})
	const codeblockLines = ViewPlugin.fromClass(
		class CodeblockLines {
			settings: CodeStylerSettings;
			currentSettings: {
				excludedCodeblocks: string;
				excludedLanguages: string;
				collapsePlaceholder: string;
				alternativeHighlights: Array<string>;
			}
			decorations: DecorationSet;
			mutationObserver: MutationObserver;
		
			constructor(view: EditorView) {
				this.settings = settings;
				this.currentSettings = {
					excludedCodeblocks: settings.excludedCodeblocks,
					excludedLanguages: settings.excludedLanguages,
					collapsePlaceholder: '',
					alternativeHighlights: [],
				}
				this.decorations = Decoration.none;
				this.buildDecorations(view);
				this.mutationObserver = new MutationObserver((mutations) => {mutations.forEach((mutation: MutationRecord) => {
						if (mutation.type === "attributes" && mutation.attributeName === "class" && (
							(mutation.target as HTMLElement).classList.contains("HyperMD-codeblock-begin") ||
							(mutation.target as HTMLElement).classList.contains("HyperMD-codeblock_HyperMD-codeblock-bg") ||
							(mutation.target as HTMLElement).classList.contains("HyperMD-codeblock-end")
						)) {
							this.forceUpdate(view);
						}
					});
				});
				this.mutationObserver.observe(view.contentDOM,  {
					attributes: true,
					childList: true,
					subtree: true,
					attributeFilter: ['class'], // Only observe changes to the 'class' attribute
				});
			}
		
			forceUpdate(view: EditorView) {
				this.buildDecorations(view);
				view.requestMeasure();
			}
		
			update(update: ViewUpdate) {
				if (update.docChanged || 
					update.viewportChanged || 
					update.state.field(editorLivePreviewField) !== update.startState.field(editorLivePreviewField) ||
					this.settings.excludedCodeblocks !== this.currentSettings.excludedCodeblocks ||
					this.settings.excludedLanguages !== this.currentSettings.excludedLanguages ||
					this.settings.currentTheme.settings.header.collapsePlaceholder !== this.currentSettings.collapsePlaceholder ||
					!arraysEqual(Object.keys(this.settings.currentTheme.colours.light.highlights.alternativeHighlights),this.currentSettings.alternativeHighlights)
				) {
					this.currentSettings = structuredClone({
						excludedCodeblocks: this.settings.excludedCodeblocks,
						excludedLanguages: this.settings.excludedLanguages,
						collapsePlaceholder: this.settings.currentTheme.settings.header.collapsePlaceholder,
						alternativeHighlights: Object.keys(this.settings.currentTheme.colours.light.highlights.alternativeHighlights),
					});
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
					let excludedCodeblock: boolean = false;
					let lineNumber: number = 0;
					let maxLineNum: number = 0;
					let lineNumberMargin: number | undefined = 0;
					syntaxTree(view.state).iterate({from: codeblock.from, to: codeblock.to,
						enter: (syntaxNode)=>{
							const line = view.state.doc.lineAt(syntaxNode.from);
							const lineText = view.state.sliceDoc(line.from,line.to);
							const startLine = syntaxNode.type.name.includes("HyperMD-codeblock-begin");
							const endLine = syntaxNode.type.name.includes("HyperMD-codeblock-end");
							if (startLine) {
								codeblockParameters = parseCodeblockParameters(trimParameterLine(lineText),this.settings.currentTheme);
								excludedCodeblock = isExcluded(codeblockParameters.language,[this.settings.excludedCodeblocks,this.settings.excludedLanguages].join(',')) || codeblockParameters.ignore;
								lineNumber = 0;
								let lineNumberCount = line.number + 1;
								let startDelimiter = testOpeningLine(lineText);
								while (startDelimiter !== testOpeningLine(view.state.doc.line(lineNumberCount).text)) {
									lineNumberCount += 1;
								}
								maxLineNum = lineNumberCount - line.number - 1 + codeblockParameters.lineNumbers.offset;
								if (maxLineNum.toString().length > 2)
									lineNumberMargin = maxLineNum.toString().length * view.state.field(codeblockLineNumberCharWidth);
								else
									lineNumberMargin = undefined;
							}
							if (excludedCodeblock)
								return;
							if (syntaxNode.type.name.includes("HyperMD-codeblock")) {
								builder.add(syntaxNode.from,syntaxNode.from,Decoration.line({attributes: {style: `--line-number-gutter-width: ${lineNumberMargin?lineNumberMargin+'px':'calc(var(--line-number-gutter-min-width) - 12px)'}`, class: (this.settings.specialLanguages.some(regExp => new RegExp(regExp).test(codeblockParameters.language))||startLine||endLine?'code-styler-line':getLineClass(codeblockParameters,lineNumber,line.text).join(' '))+(["^$"].concat(this.settings.specialLanguages).some(regExp => new RegExp(regExp).test(codeblockParameters.language))?'':` language-${codeblockParameters.language}`)}}));
								builder.add(syntaxNode.from,syntaxNode.from,Decoration.line({}));
								builder.add(syntaxNode.from,syntaxNode.from,Decoration.widget({widget: new LineNumberWidget(lineNumber,codeblockParameters,maxLineNum,startLine||endLine)}));
								lineNumber++;
							}
						}
					})
				}
				this.decorations = builder.finish();
			}
		
			destroy() {
				this.mutationObserver.disconnect();
			}
		},
		{
			decorations: (value) => value.decorations,
			provide: (plugin) => EditorView.atomicRanges.of((view)=>view.state.field(codeblockCollapse) || Decoration.none),
		}
	);
	const codeblockHeader = StateField.define<DecorationSet>({
		create(state: EditorState): DecorationSet {
			return Decoration.none;    
		},
		update(value: DecorationSet, transaction: Transaction): DecorationSet {
			if (editingViewIgnore(transaction.state))
				return Decoration.none;
			const builder = new RangeSetBuilder<Decoration>();
			let codeblockParameters: CodeblockParameters;
			let startLine: boolean = true;
			let startDelimiter: string = '```';
			for (let i = 1; i < transaction.state.doc.lines; i++) {
				const line = transaction.state.doc.line(i);
				const lineText = line.text.toString();
				let currentDelimiter = testOpeningLine(lineText);
				if (currentDelimiter) {
					if (startLine) {
						startLine = false;
						startDelimiter = currentDelimiter;
						codeblockParameters = parseCodeblockParameters(trimParameterLine(lineText),settings.currentTheme);
						if (!isExcluded(codeblockParameters.language,[settings.excludedCodeblocks,settings.excludedLanguages].join(',')) && !codeblockParameters.ignore)
							if (!settings.specialLanguages.some(regExp => new RegExp(regExp).test(codeblockParameters.language)))
								builder.add(line.from,line.from,Decoration.widget({widget: new HeaderWidget(codeblockParameters,settings.currentTheme.settings,languageIcons), block: true, side: -1}));
							else
								continue;
					} else {
						if (currentDelimiter === startDelimiter)
							startLine = true;
					}
				}
			}
			return builder.finish();
		},
		provide(field: StateField<DecorationSet>): Extension {
			return EditorView.decorations.from(field);
		}
	})
	const codeblockCollapse = StateField.define<DecorationSet>({
		create(state: EditorState): DecorationSet {
			if (editingViewIgnore(state))
				return Decoration.none;
			const builder = new RangeSetBuilder<Decoration>();
			let codeblockParameters: CodeblockParameters;
			let collapseStart: Line | null = null;
			let collapseEnd: Line | null = null;
			let startLine: boolean = true;
			let startDelimiter: string = '```';
			for (let i = 1; i < state.doc.lines; i++) {
				const line = state.doc.line(i);
				const lineText = line.text.toString();
				let currentDelimiter = testOpeningLine(lineText);
				if (currentDelimiter) {
					if (startLine) {
						startLine = false;
						startDelimiter = currentDelimiter;
						codeblockParameters = parseCodeblockParameters(trimParameterLine(lineText),settings.currentTheme);
						if (!isExcluded(codeblockParameters.language,[settings.excludedCodeblocks,settings.excludedLanguages].join(',')) && !codeblockParameters.ignore && codeblockParameters.fold.enabled)
							if (!settings.specialLanguages.some(regExp => new RegExp(regExp).test(codeblockParameters.language)))
								collapseStart = line;
							else
								continue;
					} else {
						if (currentDelimiter === startDelimiter) {
							startLine = true;
							if (collapseStart)
								collapseEnd = line;
						}
					}
				}
				if (collapseStart && collapseEnd) {
					builder.add(collapseStart.from,collapseEnd.to,Decoration.replace({effect: collapse.of(Decoration.replace({block: true}).range(collapseStart.from,collapseEnd.to)), block: true, inclusive: true}));
					collapseStart = null;
					collapseEnd = null;
				}
			}
			return builder.finish();
		},
		update(value: DecorationSet, transaction: Transaction): DecorationSet {
			value = value.map(transaction.changes);
			for (const effect of transaction.effects) {
				if (effect.is(collapse))
					value = value.update({add: [effect.value], sort: true});
				else if (effect.is(uncollapse))
					value = value.update({filterFrom: effect.value.filterFrom, filterTo: effect.value.filterTo, filter: effect.value.filter});
			}
			return value;
		},
		provide(field: StateField<DecorationSet>): Extension {
			return EditorView.decorations.from(field);
		},
	})
	const temporarilyUncollapsed = StateField.define<DecorationSet>({
		create(state: EditorState): DecorationSet {
			return Decoration.none;
		},
		update(value: DecorationSet, transaction: Transaction): DecorationSet {
			value = value.map(transaction.changes);
			const uncollapseAnnotation = transaction.annotation(temporaryUncollapseAnnotation);
			if (uncollapseAnnotation) {
				if (uncollapseAnnotation.uncollapse)
					value = value.update({add: [uncollapseAnnotation.decorationRange], sort: true});
				else
					value = value.update({filterFrom: uncollapseAnnotation.decorationRange.from, filterTo: uncollapseAnnotation.decorationRange.to, filter: (from: number, to: number, value: Decoration)=>!(from === uncollapseAnnotation.decorationRange.from && to === uncollapseAnnotation.decorationRange.to)});
			}
			return value;
		}
	})
	const inlineCodeDecorator = ViewPlugin.fromClass(
		class InlineCodeDecoration {
			decorations: DecorationSet;
			settings: CodeStylerSettings;
			syntaxHighlight: boolean;
			// loadedLanguages: Record<string,LanguageSupport>; //NOTE: For future CM6 Compatibility

			constructor(view: EditorView) {
				this.decorations = Decoration.none;
				this.settings = settings;
				this.syntaxHighlight = settings.currentTheme.settings.inline.syntaxHighlight;
				this.buildDecorations(view);
				// this.loadedLanguages = {}; //NOTE: For future CM6 Compatibility
			}

			update(update: ViewUpdate) {
				if (update.docChanged || update.viewportChanged || update.selectionSet || update.state.field(editorLivePreviewField)!==update.startState.field(editorLivePreviewField) || this.settings.currentTheme.settings.inline.syntaxHighlight !== this.syntaxHighlight) {
					if (this.settings.currentTheme.settings.inline.syntaxHighlight !== this.syntaxHighlight)
						console.log(this.syntaxHighlight)
					this.syntaxHighlight = this.settings.currentTheme.settings.inline.syntaxHighlight;
					if (update.docChanged) 
						this.decorations = this.decorations.map(update.changes);
					this.buildDecorations(update.view);
				//NOTE: For future CM6 Compatibility
				// 	const toHighlight = this.buildDecorations(update.view);
				// 	toHighlight.forEach((highlightSet)=>{
				// 		if (!highlightSet?.language)
				// 			return;
				// 		if (highlightSet.language in this.loadedLanguages) {
				// 			this.decorations = this.decorations.update({add: languageHighlight(highlightSet)});
				// 		} else {
				// 			const languageDescription = LanguageDescription.matchLanguageName(languages,highlightSet.language);
				// 			if (!languageDescription)
				// 				return;
				// 			languageDescription.load().then((languageSupport)=>{
				// 				this.loadedLanguages[highlightSet.language] = languageSupport;
				// 				update.view.dispatch({});
				// 				update.view.dispatch({annotations: syntaxHighlightDecorations.of(markDecorations)})
				// 			});
				// 		}
				// 	});
				// } else {
				// 	update.transactions.forEach((transaction)=>{
				// 		const markDecorations = transaction.annotation(syntaxHighlightDecorations);
				// 		if (markDecorations)
				// 			this.decorations = this.decorations.update({add: markDecorations})
				// 	});
				}
			}

			buildDecorations(view: EditorView): void { //Array<{start: number, text: string, language: string}> //NOTE: For future CM6 Compatibility
				if (!view?.visibleRanges?.length || editingViewIgnore(view.state)) {
					this.decorations = Decoration.none;
					return;
					// return [];//NOTE: For future CM6 Compatibility
				}
				// let toHighlight: Array<{start: number, text: string, language: string}> = []; //NOTE: For future CM6 Compatibility
				for (const {from,to} of view.visibleRanges) {
                    syntaxTree(view.state).iterate({from: from, to: to,
						enter: (syntaxNode)=>{
                            const properties = new Set(syntaxNode.node.type.prop<string>(tokenClassNodeProp)?.split(" "));
							if (!(properties.has("inline-code") && !properties.has("formatting")))
								return;
							let previousSibling = syntaxNode.node.prevSibling;
							if (!previousSibling)
								return;
							let delimiterSize = previousSibling.to-previousSibling.from;
							let inlineCodeText = view.state.doc.sliceString(syntaxNode.from, syntaxNode.to);
							let {parameters,text} = parseInlineCode(inlineCodeText);
							let endOfParameters = inlineCodeText.lastIndexOf(text);
							if (!parameters) {
								if (text) {
									if (view.state.selection.ranges.some((range: SelectionRange)=>range.to >= syntaxNode.from-delimiterSize && range.from <= syntaxNode.to+delimiterSize))
										this.decorations = this.decorations.update({filterFrom: syntaxNode.from, filterTo: syntaxNode.from, filter: (from: number, to: number, value: Decoration)=>false});
									else
										this.decorations = this.decorations.update({add: [{from: syntaxNode.from, to: syntaxNode.from + endOfParameters, value: Decoration.replace({})}]});
								}
							} else {
								if (view.state.selection.ranges.some((range: SelectionRange)=>range.to >= syntaxNode.from-delimiterSize && range.from <= syntaxNode.to+delimiterSize)) {
									this.decorations.between(syntaxNode.from, syntaxNode.from, (from: number, to: number, decorationValue: Decoration)=>{
										this.decorations = this.decorations.update({filterFrom: from, filterTo: to, filter: (from: number, to: number, value: Decoration)=>false});
									});
									this.decorations = this.decorations.update({add: [{from: syntaxNode.from, to: syntaxNode.from + endOfParameters, value: Decoration.mark({class: 'code-styler-inline-parameters'})}]});
								} else {
									let decorated = false;
									this.decorations.between(syntaxNode.from, syntaxNode.from, (from: number, to: number, decorationValue: Decoration)=>{
										if (!decorationValue.spec?.class)
											decorated = true;
									});
									if (!decorated) {
										this.decorations = this.decorations.update({add: [{from: syntaxNode.from, to: syntaxNode.from + endOfParameters, value: Decoration.replace({})}]});
										if (parameters?.title || (parameters?.icon && getLanguageIcon(parameters.language,languageIcons)))
											this.decorations = this.decorations.update({add: [{from: syntaxNode.from, to: syntaxNode.from, value: Decoration.replace({widget: new OpenerWidget(parameters,languageIcons)})}]});
									}
								}
								this.decorations = this.decorations.update({filterFrom: syntaxNode.from + endOfParameters+1, filterTo: syntaxNode.to, filter: (from: number, to: number, decorationValue: Decoration)=>false});
								if (!settings.currentTheme.settings.inline.syntaxHighlight)
									return;
								this.decorations = this.decorations.update({add: modeHighlight({start: syntaxNode.from + endOfParameters, text: text, language: parameters.language})});
								// toHighlight.push({start: syntaxNode.from + endOfParameters, text: text, language: parameters.language}); //NOTE: For future CM6 Compatibility
							}
                        },
                    });
                };
				// return toHighlight; //NOTE: For future CM6 Compatibility
			}
		},
		{
			decorations: (value) => value.decorations,
		}
	)
	function cursorIntoCollapsedTransactionFilter() {
		return EditorState.transactionFilter.of((transaction) => {
			let extraTransactions: Array<TransactionSpec> = [];
			let collapsedRangeSet = transaction.startState.field(codeblockCollapse,false)?.map(transaction.changes) ?? Decoration.none;
			let temporarilyUncollapsedRangeSet = transaction.startState.field(temporarilyUncollapsed,false)?.map(transaction.changes) ?? Decoration.none;
			transaction.newSelection.ranges.forEach((range: SelectionRange)=>{
				collapsedRangeSet.between(range.from, range.to, (collapseStartFrom, collapseEndTo, decorationValue) => {
					if (collapseStartFrom <= range.head && range.head <= collapseEndTo)
						extraTransactions.push({effects: uncollapse.of({filter: (from,to) => (to <= collapseStartFrom || from >= collapseEndTo), filterFrom: collapseStartFrom, filterTo: collapseEndTo}), annotations: temporaryUncollapseAnnotation.of({decorationRange: {from: collapseStartFrom, to: collapseEndTo, value: decorationValue}, uncollapse: true})});
				});
				for (let iter = temporarilyUncollapsedRangeSet.iter(); iter.value !== null; iter.next()) {
					if (!(iter.from <= range.head && range.head <= iter.to))
						extraTransactions.push({effects: collapse.of(Decoration.replace({block: true}).range(iter.from,iter.to)), annotations: temporaryUncollapseAnnotation.of({decorationRange: {from: iter.from, to: iter.to, value: iter.value}, uncollapse: false})});
				}
			});
			if (extraTransactions.length !== 0)
				return [transaction,...extraTransactions];
			return transaction;
		});
	}

	//todo Finish this filter
	function manageCollapsedTransactionFilter() {
		return EditorState.transactionFilter.of((transaction) => {
			let extraTransactions: Array<TransactionSpec> = [];
			let collapsedRangeSet = transaction.startState.field(codeblockCollapse,false) ?? Decoration.none;
			let temporarilyUncollapsedRangeSet = transaction.startState.field(temporarilyUncollapsed,false) ?? Decoration.none;
			transaction.changes.iterChanges((fromA,toA,fromB,toB,inserted)=>{
				if (fromB === toB && inserted.toString() === '') {
					console.log(fromA,toA,fromB,toB,inserted)
					collapsedRangeSet.between(fromA-100, toA+100, (collapseStartFrom, collapseEndTo, decorationValue) => {
						console.log(fromA,toA,collapseStartFrom,collapseEndTo)
						if ((fromA <= collapseStartFrom && collapseStartFrom <= toA) || (fromA <= collapseEndTo && collapseEndTo <= toA))
							extraTransactions.push({effects: uncollapse.of({filter: (from,to) => (to <= collapseStartFrom || from >= collapseEndTo), filterFrom: collapseStartFrom, filterTo: collapseEndTo}), annotations: temporaryUncollapseAnnotation.of({decorationRange: {from: collapseStartFrom, to: collapseEndTo, value: decorationValue}, uncollapse: true})});
					});
				}
			});
			if (extraTransactions.length !== 0)
				console.log('foo',extraTransactions)
			if (extraTransactions.length !== 0)
				return [transaction,...extraTransactions];
			return transaction;
		});
	}

	class LineNumberWidget extends WidgetType {
		lineNumber: number;
		codeblockParameters: CodeblockParameters;
		maxLineNum: number
		empty: boolean;
	
		constructor(lineNumber: number, codeblockParameters: CodeblockParameters, maxLineNum: number, empty: boolean) {
			super();
			this.lineNumber = lineNumber;
			this.codeblockParameters = codeblockParameters;
			this.maxLineNum = maxLineNum
			this.empty = empty;
		}
	
		eq(other: LineNumberWidget): boolean {
			return this.lineNumber === other.lineNumber && this.codeblockParameters.lineNumbers.alwaysEnabled === other.codeblockParameters.lineNumbers.alwaysEnabled && this.codeblockParameters.lineNumbers.alwaysDisabled === other.codeblockParameters.lineNumbers.alwaysDisabled && this.codeblockParameters.lineNumbers.offset === other.codeblockParameters.lineNumbers.offset && this.maxLineNum === other.maxLineNum && this.empty === other.empty;
		}
	
		toDOM(view: EditorView): HTMLElement {
			let lineNumberDisplay = '';
			if (!this.codeblockParameters.lineNumbers.alwaysEnabled && this.codeblockParameters.lineNumbers.alwaysDisabled)
				lineNumberDisplay = '-hide'
			else if (this.codeblockParameters.lineNumbers.alwaysEnabled && !this.codeblockParameters.lineNumbers.alwaysDisabled)
				lineNumberDisplay = '-specific'
			return createSpan({attr: {style: this.maxLineNum.toString().length > (this.lineNumber + this.codeblockParameters.lineNumbers.offset).toString().length?'width: var(--line-number-gutter-width);':''}, cls: `code-styler-line-number${lineNumberDisplay}`, text: this.empty?'':(this.lineNumber + this.codeblockParameters.lineNumbers.offset).toString()});
		}
	}
	class HeaderWidget extends WidgetType {
		codeblockParameters: CodeblockParameters;
		themeSettings: CodeStylerThemeSettings;
		languageIcons: Record<string,string>;
		view: EditorView;
		mutationObserver: MutationObserver;
	
		constructor(codeblockParameters: CodeblockParameters, themeSettings: CodeStylerThemeSettings, languageIcons: Record<string,string>) {
			super();
			this.codeblockParameters = codeblockParameters;
			this.themeSettings = themeSettings;
			this.languageIcons = languageIcons;
			this.mutationObserver = new MutationObserver((mutations) => {
				mutations.forEach(mutation => {
					if ((mutation.target as HTMLElement).hasAttribute('data-clicked'))
						collapseOnClick(this.view,(mutation.target as HTMLElement))
				})
			});    
		}
			
		eq(other: HeaderWidget): boolean {
			return (
				this.codeblockParameters.language == other.codeblockParameters.language &&
				this.codeblockParameters.title == other.codeblockParameters.title &&
				this.codeblockParameters.fold.enabled == other.codeblockParameters.fold.enabled &&
				this.codeblockParameters.fold.placeholder == other.codeblockParameters.fold.placeholder &&
				this.themeSettings.header.collapsePlaceholder == other.themeSettings.header.collapsePlaceholder &&
				getLanguageIcon(this.codeblockParameters.language,this.languageIcons) == getLanguageIcon(other.codeblockParameters.language,other.languageIcons)
				);
		}
			
		toDOM(view: EditorView): HTMLElement {
			this.view = view;
			const headerContainer = createHeader(this.codeblockParameters, this.themeSettings, this.languageIcons);
			if (this.codeblockParameters.language!=='')
				headerContainer.classList.add(`language-${this.codeblockParameters.language}`)
			headerContainer.addEventListener("mousedown",handleMouseDown);
	
			this.mutationObserver.observe(headerContainer,{
				attributes: true,
			});
			return headerContainer;
		}
				
		destroy(dom: HTMLElement) {
			dom.removeAttribute("data-clicked");
			dom.removeEventListener("mousedown",handleMouseDown);
			this.mutationObserver.disconnect();
		}
	
		ignoreEvent() {
			return false;
		}
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

		toDOM(view: EditorView): HTMLElement {
			return createInlineOpener(this.inlineCodeParameters,this.languageIcons,['code-styler-inline-opener','cm-inline-code']);
		}
	}
	
	function collapseOnClick(view: EditorView, target: HTMLElement) {
		const position = view.posAtDOM(target);
		let folded = false;
		view.state.field(codeblockCollapse,false)?.between(position,position,()=>{
			folded = true;
		});

		let collapseStart: Line | null = null;
		let collapseEnd: Line | null = null;
		let startLine: boolean = true;
		let startDelimiter: string = '```';
		for (let i = 1; i < view.state.doc.lines; i++) {
			const line = view.state.doc.line(i);
			const lineText = line.text.toString();
			let currentDelimiter = testOpeningLine(lineText);
			if (currentDelimiter) {
				if (startLine) {
					startLine = false;
					startDelimiter = currentDelimiter;
					if (position === line.from)
						collapseStart = line;
				} else {
					if (currentDelimiter === startDelimiter) {
						startLine = true;
						if (collapseStart)
							collapseEnd = line;
					}
				}
			}
			if (collapseStart && collapseEnd) {
				if (folded)
					view.dispatch({effects: uncollapse.of({filter: (from,to) => (to <= (collapseStart as Line).from || from >= (collapseEnd as Line).to), filterFrom: collapseEnd.from, filterTo: collapseEnd.to})});
				else
					view.dispatch({effects: collapse.of(Decoration.replace({block: true}).range(collapseStart.from,collapseEnd.to))});
				view.requestMeasure();
				collapseStart = null;
				collapseEnd = null;
			}
		}
	}
	function handleMouseDown(event: MouseEvent): void {
		this.setAttribute("data-clicked","true");
	}

	const collapse: StateEffectType<Range<Decoration>> = StateEffect.define();
	const uncollapse: StateEffectType<{filter: (from: any, to: any) => boolean, filterFrom: number, filterTo: number}> = StateEffect.define();
	const temporaryUncollapseAnnotation = Annotation.define<{decorationRange: Range<Decoration>, uncollapse: boolean}>();

	return [codeblockLineNumberCharWidth,codeblockLines,codeblockHeader,codeblockCollapse,temporarilyUncollapsed,inlineCodeDecorator,cursorIntoCollapsedTransactionFilter()];
}

function getCharWidth(state: EditorState, default_value: number): number {
	let charWidths = Array.from(state.field(editorEditorField).contentDOM.querySelectorAll(".HyperMD-codeblock-end")).reduce((result: Array<number>,beginningElement: HTMLElement): Array<number> => {
		let nextElement = beginningElement.previousElementSibling as HTMLElement;
		if (!nextElement)
			return result;
		let lineNumberElement = nextElement.querySelector("[class^='code-styler-line-number']") as HTMLElement;
		if (!lineNumberElement || lineNumberElement.innerText.length <= 2)
			return result;
		let computedStyles = window.getComputedStyle(lineNumberElement, null);
		result.push((lineNumberElement.getBoundingClientRect().width - parseFloat(computedStyles.paddingLeft) - parseFloat(computedStyles.paddingRight)) / lineNumberElement.innerText.length)
		return result;
	},[])
	if (charWidths.length === 0)
		return default_value;
	return charWidths.reduce((result,value)=>result+value,0) / charWidths.length;
}

function findUnduplicatedCodeblocks(view: EditorView): Array<SyntaxNodeRef> {
	const codeblocks = findVisibleCodeblocks(view);
	const unduplicatedCodeblocks: Array<SyntaxNodeRef> = [];
	for (let i = 0; i < codeblocks.length; i++)
		if (i === 0 || codeblocks[i].from !== codeblocks[i - 1].from)
			unduplicatedCodeblocks.push(codeblocks[i]);
	return unduplicatedCodeblocks;
}
function findVisibleCodeblocks(view: EditorView): Array<SyntaxNodeRef> {
	return findCodeblocks(view).filter((codeblock) => {
		return view.visibleRanges.some((visibleRange) => codeblock.from < visibleRange.to && codeblock.to > visibleRange.from)
	})
}
function findCodeblocks(view: EditorView): Array<SyntaxNodeRef> {
	const codeblocks: Array<SyntaxNodeRef> = [];
	syntaxTree(view.state).iterate({
		enter: (syntaxNode) => {
			if (syntaxNode.type.name.includes("HyperMD-codeblock-begin") || syntaxNode.type.name === "HyperMD-codeblock_HyperMD-codeblock-bg" || syntaxNode.type.name.includes("HyperMD-codeblock-end"))
				codeblocks.push(syntaxNode);
		}
	})
	return codeblocks;
}

function languageHighlight({start,text,language}: {start: number, text: string, language: string},loadedLanguages: Record<string,LanguageSupport>): Array<Range<Decoration>> {
	//NOTE: Uses codemirror 6 implementation which Obsidian does not currently use
	let markDecorations: Array<Range<Decoration>> = [];
	const tree = loadedLanguages[language].language.parser.parse(text);
	highlightTree(tree,classHighlighter,(from,to,token) => { //todo (@mayurankv) Change this highlighter
		if (token)
			markDecorations.push({from: start+from, to: start+to, value: Decoration.mark({class: token})});
	});
	return markDecorations;
}
function modeHighlight ({start,text,language}: {start: number, text: string, language: string}): Array<Range<Decoration>> {
	//NOTE: Uses CodeMirror 5 implementation which Obsidian currently uses
	let markDecorations: Array<Range<Decoration>> = [];
	//@ts-expect-error Undocumented Obsidian API
	const mode = window.CodeMirror.getMode(window.CodeMirror.defaults,window.CodeMirror.findModeByName(language)?.mime); // Alternatives: `text/x-${parameters.language}`, window.CodeMirror.findModeByName('js').mime
	let state = window.CodeMirror.startState(mode);
	if (mode?.token) {
		let stream = new window.CodeMirror.StringStream(text);
		while (!stream.eol()) {
			let style = mode.token(stream,state);
			if (style)
				markDecorations.push({from: start+stream.start, to: start+stream.pos, value: Decoration.mark({class: `cm-${style}`})})
			stream.start = stream.pos;
		}
	}
	return markDecorations;
}

function editingViewIgnore(state: EditorState): boolean {
	if (!state.field(editorLivePreviewField))
		return true;
	const filePath = state.field(editorInfoField)?.file?.path;
	if (typeof filePath !== 'undefined')
		return this.app.metadataCache.getCache(filePath)?.frontmatter?.['code-styler-ignore'] === true;
	return false;
}
