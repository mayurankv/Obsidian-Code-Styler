import { editorEditorField, editorInfoField, editorLivePreviewField } from "obsidian";
import { ViewPlugin, EditorView, ViewUpdate, Decoration, DecorationSet, WidgetType } from "@codemirror/view";
import { Extension, EditorState, StateField, StateEffect, StateEffectType, Range, RangeSetBuilder, Transaction, Line, SelectionRange, Compartment } from "@codemirror/state";
import { syntaxTree, tokenClassNodeProp } from "@codemirror/language";
import { SyntaxNodeRef } from "@lezer/common";

import { CodeStylerSettings, CodeStylerThemeSettings, SPECIAL_LANGUAGES } from "./Settings";
import { CodeblockParameters, parseCodeblockParameters, testOpeningLine, isExcluded, arraysEqual, trimParameterLine, InlineCodeParameters, parseInlineCode } from "./CodeblockParsing";
import { createHeader, createInlineOpener, getLanguageIcon, getLineClass, getLineNumberDisplay, isHeaderHidden } from "./CodeblockDecorating";

interface SettingsState {
	excludedCodeblocks: string;
	excludedLanguages: string;
	alternativeHighlights: Array<string>;
}

export function createCodeblockCodeMirrorExtensions(settings: CodeStylerSettings, languageIcons: Record<string,string>) {
	const livePreviewCompartment = new Compartment;
	const ignoreCompartment = new Compartment;

	const ignoreListener = EditorView.updateListener.of((update: ViewUpdate) => { //TODO (@mayurankv) Can I make this startState only? Does it need to be?
		const livePreviewExtensions = livePreviewCompartment.get(update.state);
		const toIgnore = isSourceMode(update.state);
		const fileIgnore = isFileIgnored(update.state) && !(Array.isArray(livePreviewExtensions) && livePreviewExtensions.length === 0);
		const fileUnignore = !toIgnore && !isFileIgnored(update.state) && (Array.isArray(livePreviewExtensions) && livePreviewExtensions.length === 0);
		if (isSourceMode(update.startState) !== toIgnore || fileIgnore || fileUnignore) {
			update.view.dispatch({effects: livePreviewCompartment.reconfigure((toIgnore||fileIgnore)?[]:[headerDecorations,foldDecorations,hiddenDecorations])});
			if (!toIgnore && !fileIgnore)
				update.view.dispatch({effects: foldAll.of({})});
		}
	});
	const ignoreFileListener = EditorView.updateListener.of((update: ViewUpdate) => {
		const ignoreExtensions = ignoreCompartment.get(update.state);
		const fileIgnore = isFileIgnored(update.state) && !(Array.isArray(ignoreExtensions) && ignoreExtensions.length === 0);
		const fileUnignore = !isFileIgnored(update.state) && (Array.isArray(ignoreExtensions) && ignoreExtensions.length === 0);
		if (fileIgnore || fileUnignore)
			update.view.dispatch({effects: ignoreCompartment.reconfigure(fileIgnore?[]:inlineDecorations)});
	});

	const livePreviewCodeblockLines = ViewPlugin.fromClass( //TODO (@mayurankv) Update - could this be a statefield?
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
				if (update.docChanged || update.viewportChanged || 
					update.state.field(editorLivePreviewField) !== update.startState.field(editorLivePreviewField) ||
					!settingsEqual(update.state.field(settingsState),update.startState.field(settingsState))
				) {
					this.buildDecorations(update.view);
				}
			}
		
			buildDecorations(view: EditorView) {
				if (!view?.visibleRanges?.length || isFileIgnored(view.state) || isSourceMode(view.state)) {
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
								lineNumberMargin = (maxLineNum.toString().length > 2)?maxLineNum.toString().length * view.state.field(charWidthState):undefined;
							}
							if (excludedCodeblock)
								return;
							if (syntaxNode.type.name.includes("HyperMD-codeblock")) {
								builder.add(syntaxNode.from,syntaxNode.from,Decoration.line({attributes: {style: `--line-number-gutter-width: ${lineNumberMargin?lineNumberMargin+"px":"calc(var(--line-number-gutter-min-width) - 12px)"};`, class: ((SPECIAL_LANGUAGES.some(regExp => new RegExp(regExp).test(codeblockParameters.language))||startLine||endLine)?"code-styler-line":getLineClass(codeblockParameters,lineNumber,line.text).join(" "))+(["^$"].concat(SPECIAL_LANGUAGES).some(regExp => new RegExp(regExp).test(codeblockParameters.language))?"":` language-${codeblockParameters.language}`)}}));
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
	const charWidthState = StateField.define<number>({ //TODO (@mayurankv) Improve implementation
		create(state: EditorState): number {
			return getCharWidth(state,state.field(editorEditorField).defaultCharacterWidth);
		},
		update(value: number, transaction: Transaction): number {
			return getCharWidth(transaction.state,value);
		}
	});
	const headerDecorations = StateField.define<DecorationSet>({ //TODO (@mayurankv) Update (does this need to be updated in this manner?)
		create(state: EditorState): DecorationSet {
			return buildHeaderDecorations(state);
		},
		update(value: DecorationSet, transaction: Transaction): DecorationSet {
			return buildHeaderDecorations(transaction.state,(position)=>isFolded(transaction.state,position));
		},
		provide(field: StateField<DecorationSet>): Extension {
			return EditorView.decorations.from(field);
		}
	});
	const lineDecorations = StateField.define<DecorationSet>({
		create(state: EditorState): DecorationSet {
			return buildLineDecorations(state);
		},
		update(value: DecorationSet, transaction: Transaction): DecorationSet { //source mode and settings state
			return buildLineDecorations(transaction.state);
		},
		provide(field: StateField<DecorationSet>): Extension {
			return EditorView.decorations.from(field);
		}
	});
	const foldDecorations = StateField.define<DecorationSet>({
		create(state: EditorState): DecorationSet { //TODO (@mayurankv) Can I change this?
			const builder = new RangeSetBuilder<Decoration>();
			for (let iter = (state.field(headerDecorations,false) ?? Decoration.none).iter(); iter.value !== null; iter.next()) {
				if (!iter.value.spec.widget.codeblockParameters.fold.enabled)
					continue;
				codeblockFoldCallback(iter.from,state,(foldStart,foldEnd)=>{
					builder.add(foldStart.from,foldEnd.to,foldDecoration((iter.value as Decoration).spec.widget.codeblockParameters.language));
				});
			}
			return builder.finish();
		},
		update(value: DecorationSet, transaction: Transaction): DecorationSet {
			value = value.map(transaction.changes).update({filter: (from: number, to: number)=>from!==to});
			value = value.update({add: transaction.effects.filter(effect=>(effect.is(fold)||effect.is(unhideFold))).map(effect=>foldRegion(effect.value))}); //TODO (@mayurankv) Can I remove `, sort: true`
			transaction.effects.filter(effect=>(effect.is(unfold)||effect.is(hideFold))).forEach(effect=>value=value.update(unfoldRegion(effect.value)));
			transaction.effects.filter(effect=>effect.is(removeFold)).forEach(effect=>value=value.update(removeFoldLanguages(effect.value)));
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
			if (transaction.effects.some(effect=>effect.is(foldAll)))
				return Decoration.none;
			value = value.map(transaction.changes).update({filter: (from: number, to: number)=>from!==to});
			value = value.update({add: transaction.effects.filter(effect=>effect.is(hideFold)).map(effect=>effect.value)}); //TODO (@mayurankv) Can I remove `, sort: true`
			transaction.effects.filter(effect=>effect.is(unhideFold)).forEach(effect=>value=value.update(unhideFoldUpdate(effect.value)));
			transaction.effects.filter(effect=>effect.is(removeFold)).forEach(effect=>value=value.update(removeFoldLanguages(effect.value)));
			return value;
		}
	});
	const inlineDecorations = StateField.define<DecorationSet>({
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
	function cursorFoldExtender() {
		return EditorState.transactionExtender.of((transaction: Transaction) => {
			const addEffects: Array<StateEffect<unknown>> = [];
			const foldDecorationsState = transaction.startState.field(foldDecorations,false)?.map(transaction.changes) ?? Decoration.none;
			const hiddenDecorationsState = transaction.startState.field(hiddenDecorations,false)?.map(transaction.changes) ?? Decoration.none;
			transaction.newSelection.ranges.forEach((range: SelectionRange)=>{
				foldDecorationsState.between(range.from, range.to, (foldFrom, foldTo, decorationValue) => {
					if (rangeInteraction(foldFrom,foldTo,range))
						addEffects.push(hideFold.of({from: foldFrom, to: foldTo, value: decorationValue}));
				});
				for (let iter = hiddenDecorationsState.iter(); iter.value !== null; iter.next()) {
					if (!rangeInteraction(iter.from,iter.to,range))
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
	//TODO (@mayurankv) Urgent: Auto add temp unfold on type of fold and remove both fold and temp unfold for removal

	class LineNumberWidget extends WidgetType {
		lineNumber: number;
		codeblockParameters: CodeblockParameters;
		maxLineNum: number;
		empty: boolean;
	
		constructor(lineNumber: number, codeblockParameters: CodeblockParameters, maxLineNum: number, empty: boolean = false) {
			super();
			this.lineNumber = lineNumber;
			this.codeblockParameters = codeblockParameters;
			this.maxLineNum = maxLineNum;
			this.empty = empty;
		}
	
		eq(other: LineNumberWidget): boolean {
			return this.lineNumber === other.lineNumber && this.codeblockParameters.lineNumbers.alwaysEnabled === other.codeblockParameters.lineNumbers.alwaysEnabled && this.codeblockParameters.lineNumbers.alwaysDisabled === other.codeblockParameters.lineNumbers.alwaysDisabled && this.codeblockParameters.lineNumbers.offset === other.codeblockParameters.lineNumbers.offset && this.maxLineNum === other.maxLineNum && this.empty === other.empty;
		}
	
		toDOM(): HTMLElement {
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
			headerContainer.onclick = () => {foldOnClick(view,headerContainer,this.folded,this.codeblockParameters.language);};
			return headerContainer;
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

		toDOM(): HTMLElement {
			return createInlineOpener(this.inlineCodeParameters,this.languageIcons,["code-styler-inline-opener","cm-inline-code"]);
		}
	}

	function buildHeaderDecorations(state: EditorState, foldValue: (position: number, defaultFold: boolean)=>boolean = (position,defaultFold)=>defaultFold): DecorationSet {
		const builder = new RangeSetBuilder<Decoration>();
		let startLine: Line | null = null;
		let startDelimiter: string = "```";
		let codeblockParameters: CodeblockParameters;
		for (let i = 1; i < state.doc.lines; i++) {
			const line = state.doc.line(i);
			const lineText = line.text.toString();
			const currentDelimiter = testOpeningLine(lineText);
			if (currentDelimiter) {
				if (startLine === null) {
					startLine = line;
					startDelimiter = currentDelimiter;
				} else {
					if (currentDelimiter === startDelimiter) {
						codeblockParameters = parseCodeblockParameters(trimParameterLine(startLine.text.toString()),settings.currentTheme);
						if (!isExcluded(codeblockParameters.language,[settings.excludedCodeblocks,settings.excludedLanguages].join(",")) && !codeblockParameters.ignore) {
							if (!SPECIAL_LANGUAGES.some(regExp => new RegExp(regExp).test(codeblockParameters.language)))
								builder.add(startLine.from,startLine.from,Decoration.widget({widget: new HeaderWidget(codeblockParameters,foldValue(startLine.from,codeblockParameters.fold.enabled),settings.currentTheme.settings,languageIcons), block: true, side: -1}));
						}
						startLine = null;
					}
				}
			}
		}
		return builder.finish();
	}
	function buildLineDecorations(state: EditorState): DecorationSet {
		const builder = new RangeSetBuilder<Decoration>();
		for (let iter = (state.field(headerDecorations,false) ?? Decoration.none).iter(); iter.value !== null; iter.next()) {
			const foldStart = state.doc.lineAt(iter.from);
			const startDelimiter = testOpeningLine(foldStart.text.toString());
			const codeblockParameters = iter.value.spec.widget.codeblockParameters;
			let foldEnd: Line | null = null;
			//TODO (@mayurankv) Can I improve below 5 lines
			const lineNumberCount = foldStart.number + 1;
			// while (startDelimiter !== testOpeningLine(state.doc.line(lineNumberCount).text)) {
			// 	lineNumberCount += 1;
			// }
			const maxLineNum = lineNumberCount - foldStart.number - 1 + codeblockParameters.lineNumbers.offset;
			const lineNumberMargin = (maxLineNum.toString().length > 2)?maxLineNum.toString().length * state.field(charWidthState):undefined;
			builder.add(foldStart.from,foldStart.from,Decoration.line({attributes: {style: `--line-number-gutter-width: ${lineNumberMargin?lineNumberMargin+"px":"calc(var(--line-number-gutter-min-width) - 12px)"};`, class: "code-styler-line"+(["^$"].concat(SPECIAL_LANGUAGES).some(regExp => new RegExp(regExp).test(codeblockParameters.language))?"":` language-${codeblockParameters.language}`)}}));
			builder.add(foldStart.from,foldStart.from,Decoration.widget({widget: new LineNumberWidget(0,codeblockParameters,maxLineNum,true)}));
			for (let i = foldStart.number+1; i <= state.doc.lines; i++) {
				const line = state.doc?.line(i);
				if (!line)
					break;
				const lineText = line.text.toString();
				if (testOpeningLine(lineText) === startDelimiter) {
					foldEnd = line;
					break;
				}
				builder.add(line.from,line.from,Decoration.line({attributes: {style: `--line-number-gutter-width: ${lineNumberMargin?lineNumberMargin+"px":"calc(var(--line-number-gutter-min-width) - 12px)"};`, class: ((SPECIAL_LANGUAGES.some(regExp => new RegExp(regExp).test((iter.value as Decoration).spec.widget.codeblockParameters.language)))?"code-styler-line":getLineClass(codeblockParameters,i-foldStart.number,line.text).join(" "))+(["^$"].concat(SPECIAL_LANGUAGES).some(regExp => new RegExp(regExp).test(codeblockParameters.language))?"":` language-${codeblockParameters.language}`)}}));
				builder.add(line.from,line.from,Decoration.widget({widget: new LineNumberWidget(i-foldStart.number,codeblockParameters,maxLineNum,false)}));
			}
			if (foldEnd !== null) {
				builder.add(foldEnd.from,foldEnd.from,Decoration.line({attributes: {style: `--line-number-gutter-width: ${lineNumberMargin?lineNumberMargin+"px":"calc(var(--line-number-gutter-min-width) - 12px)"};`, class: "code-styler-line"+(["^$"].concat(SPECIAL_LANGUAGES).some(regExp => new RegExp(regExp).test(codeblockParameters.language))?"":` language-${codeblockParameters.language}`)}}));
				builder.add(foldEnd.from,foldEnd.from,Decoration.widget({widget: new LineNumberWidget(0,codeblockParameters,maxLineNum,true)}));
			}
		}
		return builder.finish();
	}
	function buildInlineDecorations(state: EditorState): DecorationSet {
		const builder = new RangeSetBuilder<Decoration>();
		const sourceMode = isSourceMode(state);
		syntaxTree(state).iterate({
			enter: (syntaxNode)=>{
				const ranges = getInlineCodeRanges(state,syntaxNode);
				if (ranges === null)
					return;
				const {parameters,text,section} = ranges;
				if (parameters.value === null)
					addUnstyledInlineDecorations(state,builder,parameters as {from: number, to: number, value: null},text,section,sourceMode);
				else
					addStyledInlineDecorations(state,builder,parameters as {from: number, to: number, value: InlineCodeParameters},text,section,sourceMode);
			},
		});
		return builder.finish();
	}
	function addStyledInlineDecorations(state: EditorState, builder: RangeSetBuilder<Decoration>, parameters: {from: number, to: number, value: InlineCodeParameters}, text: {from: number, to: number, value: string}, section: {from: number, to: number}, sourceMode: boolean) {
		if (sourceMode || state.selection.ranges.some((range: SelectionRange)=>range.to >= section.from && range.from <= section.to))
			builder.add(parameters.from, parameters.to, Decoration.mark({class: "code-styler-inline-parameters"}));
		else {
			builder.add(parameters.from, parameters.to, Decoration.replace({}));
			if (parameters.value?.title || (parameters.value?.icon && getLanguageIcon(parameters.value.language,languageIcons)))
				builder.add(parameters.from, parameters.from, Decoration.replace({widget: new OpenerWidget(parameters.value,languageIcons)}));
		}
		if (!settings.currentTheme.settings.inline.syntaxHighlight)
			return;
		modeHighlight({start: parameters.to, text: text.value, language: parameters.value.language},builder);
	}
	
	function convertReaddFold(transaction: Transaction, readdLanguages: Array<string>) {
		const addEffects: Array<StateEffect<unknown>> = [];
		for (let iter = (transaction.state.field(headerDecorations,false) ?? Decoration.none).iter(); iter.value !== null; iter.next()) { //TODO (@mayurankv) Refactor: Try and make this startState
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
		for (let iter = (state.field(headerDecorations,false) ?? Decoration.none).iter(); iter.value !== null; iter.next()) {
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
		ignoreListener,ignoreFileListener,
		cursorFoldExtender(),documentFoldExtender(),settingsChangeExtender(),
		settingsState,charWidthState,livePreviewCompartment.of([]),ignoreCompartment.of([]),
		lineDecorations,
		// livePreviewCodeblockLines,
	];
}

const fold: StateEffectType<{from: number, to: number, value: {spec: {language: string}}}> = StateEffect.define();
const unfold: StateEffectType<{from: number, to: number}> = StateEffect.define();
const hideFold: StateEffectType<Range<Decoration>> = StateEffect.define();
const unhideFold: StateEffectType<Range<Decoration>> = StateEffect.define();
const removeFold: StateEffectType<Array<string>> = StateEffect.define();
const foldAll: StateEffectType<{toFold?: boolean}> = StateEffect.define();

function getInlineCodeRanges(state: EditorState, syntaxNode: SyntaxNodeRef): {parameters: {from: number, to: number, value: InlineCodeParameters | null}, text: {from: number, to: number, value: string}, section: {from: number, to: number}} | null {
	const delimiterSize = getInlineDelimiterSize(syntaxNode);
	if (delimiterSize === null)
		return null;
	const inlineCodeText = state.doc.sliceString(syntaxNode.from, syntaxNode.to);
	const {parameters,text} = parseInlineCode(inlineCodeText);
	const parametersLength = inlineCodeText.lastIndexOf(text);
	return {parameters: {from: syntaxNode.from, to: syntaxNode.from+parametersLength, value: parameters}, text: {from: syntaxNode.from+parametersLength+1,to: syntaxNode.to ,value: text}, section: {from: syntaxNode.from-delimiterSize, to: syntaxNode.to+delimiterSize}};
}
function getInlineDelimiterSize(syntaxNode: SyntaxNodeRef): number | null {
	const properties = new Set(syntaxNode.node.type.prop<string>(tokenClassNodeProp)?.split(" "));
	if (!(properties.has("inline-code") && !properties.has("formatting")))
		return null;
	const previousSibling = syntaxNode.node.prevSibling;
	if (!previousSibling)
		return null;
	return previousSibling.to-previousSibling.from;
}
function addUnstyledInlineDecorations(state: EditorState, builder: RangeSetBuilder<Decoration>, parameters: {from: number, to: number, value: null}, text: {from: number, to: number, value: string}, section: {from: number, to: number}, sourceMode: boolean) {
	if (text.value) {
		if (!state.selection.ranges.some((range: SelectionRange)=>range.to >= section.from && range.from <= section.to) && !sourceMode)
			builder.add(parameters.from, parameters.to, Decoration.replace({}));
	}
}
function modeHighlight({start,text,language}: {start: number, text: string, language: string}, builder: RangeSetBuilder<Decoration>) {
	//@ts-expect-error Undocumented Obsidian API
	const mode = window.CodeMirror.getMode(window.CodeMirror.defaults,window.CodeMirror.findModeByName(language)?.mime);
	const state = window.CodeMirror.startState(mode);
	if (mode?.token) {
		const stream = new window.CodeMirror.StringStream(text);
		while (!stream.eol()) {
			const style = mode.token(stream,state);
			if (style)
				builder.add(start+stream.start, start+stream.pos, Decoration.mark({class: `cm-${style}`}));
			stream.start = stream.pos;
		}
	}
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
function removeFoldLanguages(languages: Array<string>) {
	return {filter: (from: number, to: number, value: Decoration) => !languages.includes(value?.spec?.language)};
}
function unhideFoldUpdate(range: Range<Decoration>) {
	return {filterFrom: range.from, filterTo: range.to, filter: (from: number, to: number)=>!(from === range.from && to === range.to)};
}
function foldDecoration(language: string): Decoration {
	return Decoration.replace({block: true, language: language});
}
function rangeInteraction(from: number, to: number, range: SelectionRange): boolean {
	return (from <= range.head && range.head <= to) || (from <= range.anchor && range.anchor <= to);
}

function codeblockFoldCallback(startPosition: number, state: EditorState, foldCallback: (foldStart: Line, foldEnd: Line)=>void) {
	const foldStart = state.doc.lineAt(startPosition);
	const startDelimiter = testOpeningLine(foldStart.text.toString());
	let foldEnd: Line | null = null;
	for (let i = foldStart.number+1; i <= state.doc.lines; i++) {
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

function isFileIgnored(state: EditorState): boolean {
	const filePath = state.field(editorInfoField)?.file?.path;
	if (typeof filePath !== "undefined")
		return this.app.metadataCache.getCache(filePath)?.frontmatter?.["code-styler-ignore"]?.toString() === "true";
	return false;
}
function isSourceMode(state: EditorState): boolean {
	return !state.field(editorLivePreviewField);
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
