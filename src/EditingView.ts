import { editorEditorField, editorInfoField, editorLivePreviewField } from "obsidian";
import { ViewPlugin, EditorView, ViewUpdate, Decoration, DecorationSet, WidgetType } from "@codemirror/view";
import { Extension, EditorState, StateField, StateEffect, StateEffectType, Range, RangeSet, RangeSetBuilder, Transaction, Line } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";
import { SyntaxNodeRef } from "@lezer/common";

import { CodeblockCustomizerSettings, CodeblockCustomizerThemeSettings, PRIMARY_DELAY } from "./Settings";
import { CodeblockParameters, parseCodeblockParameters, isLanguageExcluded } from "./CodeblockParsing";
import { createHeader, getLineClass } from "./CodeblockDecorating";

export function createCodeMirrorExtensions(settings: CodeblockCustomizerSettings, languageIcons: Record<string,string>) {
	const codeblockLines = ViewPlugin.fromClass(
		class CodeblockLines {
			settings: CodeblockCustomizerSettings;
			currentSettings: {
				excludedLanguages: string;
				collapsePlaceholder: string;
				alternativeHighlights: Array<string>;
			}
			view: EditorView;
			decorations: DecorationSet;
			mutationObserver: MutationObserver;
		
			constructor(view: EditorView) {
				console.log('construct')
				this.settings = settings;
				this.currentSettings = {
					excludedLanguages: settings.excludedLanguages,
					collapsePlaceholder: '',
					alternativeHighlights: [],
				}
				this.view = view;
				this.decorations = RangeSet.empty;
				this.buildDecorations(this.view);
				this.mutationObserver = new MutationObserver((mutations) => {mutations.forEach((mutation: MutationRecord) => {
						if (mutation.type === "attributes" && mutation.attributeName === "class" && (
							(mutation.target as HTMLElement).classList.contains("HyperMD-codeblock-begin") ||
							(mutation.target as HTMLElement).classList.contains("HyperMD-codeblock_HyperMD-codeblock-bg") ||
							(mutation.target as HTMLElement).classList.contains("HyperMD-codeblock-end")
						)) {
							this.forceUpdate(this.view);
						}
					});
				});
				this.mutationObserver.observe(this.view.contentDOM,  {
					attributes: true,
					childList: true,
					subtree: true,
					attributeFilter: ['class'], // Only observe changes to the 'class' attribute
				});
			}
		
			forceUpdate(view: EditorView) {
				console.log('force update')
				this.view = view;
				this.buildDecorations(this.view);
				this.view.requestMeasure();
			}
		
			update(update: ViewUpdate) {
				if (
					update.docChanged || 
					update.viewportChanged || 
					this.settings.excludedLanguages !== this.currentSettings.excludedLanguages ||
					this.settings.currentTheme.settings.header.collapsePlaceholder !== this.currentSettings.collapsePlaceholder ||
					!arraysEqual(Object.keys(this.settings.currentTheme.colors.light.highlights.alternativeHighlights),this.currentSettings.alternativeHighlights)
				) {
					console.log('update')
					console.log(update.docChanged,update.viewportChanged,this.settings.excludedLanguages !== this.currentSettings.excludedLanguages,this.settings.currentTheme.settings.header.collapsePlaceholder !== this.currentSettings.collapsePlaceholder,!arraysEqual(Object.keys(this.settings.currentTheme.colors.light.highlights.alternativeHighlights),this.currentSettings.alternativeHighlights))
					this.currentSettings = structuredClone({
						excludedLanguages: this.settings.excludedLanguages,
						collapsePlaceholder: this.settings.currentTheme.settings.header.collapsePlaceholder,
						alternativeHighlights: Object.keys(this.settings.currentTheme.colors.light.highlights.alternativeHighlights),
					});
					this.buildDecorations(update.view);
					// update.view.requestMeasure();
				}
			}
		
			buildDecorations(view: EditorView) {
				if (!view.visibleRanges || view.visibleRanges.length === 0 || ignore(view.state))
					this.decorations = RangeSet.empty;
				const decorations: Array<Range<Decoration>> = [];
				// setTimeout(()=>{
				const codeblocks = findUnduplicatedCodeblocks(view);
				const lineNumberMargins = findCodeblockLineNumberMargins(view);
				console.log('lNM',lineNumberMargins)
				const settings: CodeblockCustomizerSettings = this.settings;
				for (const codeblock of codeblocks) {
					let codeblockParameters: CodeblockParameters;
					let excludedCodeblock: boolean = false;
					let lineNumber: number = 0;
					let lineNumberMargin: number | undefined = 0;
					syntaxTree(view.state).iterate({from: codeblock.from, to: codeblock.to,
						enter(syntaxNode) {
							const line = view.state.doc.lineAt(syntaxNode.from);
							const lineText = view.state.sliceDoc(line.from,line.to);
							const startLine = syntaxNode.type.name.includes("HyperMD-codeblock-begin");
							const endLine = syntaxNode.type.name.includes("HyperMD-codeblock-end");
							if (startLine) {
								codeblockParameters = parseCodeblockParameters(lineText,settings.currentTheme);
								excludedCodeblock = isLanguageExcluded(codeblockParameters.language,settings.excludedLanguages) || codeblockParameters.ignore;
								lineNumber = 0;
								// console.log(lineNumberMargins)
								// console.log(lineNumberMargins.find(({start,lineNumberMargin}) => start === syntaxNode.from || start === syntaxNode.from - 1 || start === syntaxNode.from + 1))
								// console.log(syntaxNode.from)
								lineNumberMargin = lineNumberMargins.find(({start,lineNumberMargin}) => start === syntaxNode.from || start === syntaxNode.from - 1 || start === syntaxNode.from + 1)?.lineNumberMargin;
								const a = view.requestMeasure({
									read() {
										return view.domAtPos(syntaxNode.from)
									}

								})
								console.log(view.defaultCharacterWidth)
								// console.log(lineNumberMargin)
								if (typeof lineNumberMargin === 'undefined') {
									// excludedCodeblock = true;
								}
							}
							if (excludedCodeblock)
								return;
							if (syntaxNode.type.name.includes("HyperMD-codeblock")) {
								// console.log(lineNumberMargin)
								// console.log(!lineNumberMargin?'':`--line-number-gutter-width: ${lineNumberMargin}px`)
								decorations.push(Decoration.line({attributes: {style: !lineNumberMargin?'':`--line-number-gutter-width: ${lineNumberMargin}px`, class: (settings.specialLanguages.some(regExp => new RegExp(regExp).test(codeblockParameters.language))||startLine||endLine?'codeblock-customizer-line':getLineClass(codeblockParameters,lineNumber,line.text).join(' '))+(["^$"].concat(settings.specialLanguages).some(regExp => new RegExp(regExp).test(codeblockParameters.language))?'':` language-${codeblockParameters.language}`)}}).range(syntaxNode.from))
								decorations.push(Decoration.line({}).range(syntaxNode.from));
								decorations.push(Decoration.widget({widget: new LineNumberWidget(lineNumber,codeblockParameters,startLine||endLine)}).range(syntaxNode.from))
								lineNumber++;
							}
						}
					})
				}
				this.decorations = RangeSet.of(decorations,true)
				console.log(this.decorations)
				// },3000)
			}

			resizeGutter(view: EditorView) {
				setTimeout(()=>{
					view.contentDOM.querySelectorAll(".markdown-source-view .HyperMD-codeblock[class^='codeblock-customizer-line']:has( .codeblock-customizer-line-number-specific)").forEach(element => {
						const lineNumberElement = element.querySelector("[class^='codeblock-customizer-line-number']") as HTMLElement | null;
						let numberWidth: number;
						if (!lineNumberElement)
							return;
						if (lineNumberElement.innerText === '') {
							if (element.classList.contains('HyperMD-codeblock-begin'))
								numberWidth = 0;
							else if (element.classList.contains('HyperMD-codeblock-end'))
								numberWidth = 0;
							else
								numberWidth = 0
						} else
							numberWidth = lineNumberElement.scrollWidth;
						(element as HTMLElement).style.setProperty('--line-number-gutter-width',`${numberWidth}px`)
					});
				},PRIMARY_DELAY);
			}
		
			destroy() {
				this.mutationObserver.disconnect();
			}
		},
		{
			decorations: (value) => value.decorations,
		}
	);
	const codeblockHeader = StateField.define<DecorationSet>({
		create(state: EditorState): DecorationSet {
			return Decoration.none;    
		},
		update(value: DecorationSet, transaction: Transaction): DecorationSet {
			if (ignore(transaction.state))
				return Decoration.none;
			const builder = new RangeSetBuilder<Decoration>();
			let codeblockParameters: CodeblockParameters;
			let startLine: boolean = true;
			for (let i = 1; i < transaction.state.doc.lines; i++) {
				const line = transaction.state.doc.line(i);
				const lineText = line.text.toString();
				const codeblockDelimiterLine = (lineText.startsWith('```') && lineText.indexOf('```', 3) === -1);
				if (codeblockDelimiterLine) {
					if (startLine) {
						startLine = false;
						codeblockParameters = parseCodeblockParameters(lineText,settings.currentTheme);
						if (!isLanguageExcluded(codeblockParameters.language,settings.excludedLanguages) && !codeblockParameters.ignore)
							if (!settings.specialLanguages.some(regExp => new RegExp(regExp).test(codeblockParameters.language)))
								builder.add(line.from,line.from,Decoration.widget({widget: new HeaderWidget(codeblockParameters,settings.currentTheme.settings,languageIcons),block: true}));
							else
								continue;
					} else {
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
	const codeblockCollapse = StateField.define({
		create(state: EditorState): DecorationSet {
			if (ignore(state))
				return Decoration.none;
			const builder = new RangeSetBuilder<Decoration>();
			let codeblockParameters: CodeblockParameters;
			let collapseStart: Line | null = null;
			let collapseEnd: Line | null = null;
			let startLine: boolean = true;
			for (let i = 1; i < state.doc.lines; i++) {
				const line = state.doc.line(i);
				const lineText = line.text.toString();
				const codeblockDelimiterLine = (lineText.startsWith('```') && lineText.indexOf('```', 3) === -1);
				if (codeblockDelimiterLine) {
					if (startLine) {
						startLine = false;
						codeblockParameters = parseCodeblockParameters(lineText,settings.currentTheme);
						if (!isLanguageExcluded(codeblockParameters.language,settings.excludedLanguages) && !codeblockParameters.ignore && codeblockParameters.fold.enabled)
							if (!settings.specialLanguages.some(regExp => new RegExp(regExp).test(codeblockParameters.language)))
								collapseStart = line;
							else
								continue;
					} else {
						startLine = true;
						if (collapseStart)
							collapseEnd = line;
					}
				}
				if (collapseStart && collapseEnd) {
					builder.add(collapseStart.from,collapseEnd.to,Decoration.replace({effect: collapse.of([Decoration.replace({block: true}).range(collapseStart.from,collapseEnd.to)]), block: true, side: -1}))
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
					value = value.update({add: effect.value, sort: true});
				else if (effect.is(uncollapse))
					value = value.update({filter: effect.value});
			}
			return value;
		},
		provide(field: StateField<DecorationSet>): Extension {
			return EditorView.decorations.from(field);
		}
	})

	class LineNumberWidget extends WidgetType {
		lineNumber: number;
		codeblockParameters: CodeblockParameters;
		empty: boolean;
	
		constructor(lineNumber: number, codeblockParameters: CodeblockParameters, empty: boolean) {
			super();
			this.lineNumber = lineNumber;
			this.codeblockParameters = codeblockParameters;
			this.empty = empty;
		}
	
		eq(other: LineNumberWidget) {
			return this.lineNumber === other.lineNumber && this.codeblockParameters === other.codeblockParameters;
		}
	
		toDOM(view: EditorView): HTMLElement {
			let lineNumberDisplay = '';
			if (!this.codeblockParameters.lineNumbers.alwaysEnabled && this.codeblockParameters.lineNumbers.alwaysDisabled)
				lineNumberDisplay = '-hide'
			else if (this.codeblockParameters.lineNumbers.alwaysEnabled && !this.codeblockParameters.lineNumbers.alwaysDisabled)
				lineNumberDisplay = '-specific'
			return createSpan({attr: {style: ''}, cls: `codeblock-customizer-line-number${lineNumberDisplay}`, text: this.empty?'':(this.lineNumber + this.codeblockParameters.lineNumbers.offset).toString()});
		}
	}
	class HeaderWidget extends WidgetType {
		codeblockParameters: CodeblockParameters;
		themeSettings: CodeblockCustomizerThemeSettings;
		languageIcons: Record<string,string>;
		view: EditorView;
		mutationObserver: MutationObserver;
	
		constructor(codeblockParameters: CodeblockParameters, themeSettings: CodeblockCustomizerThemeSettings, languageIcons: Record<string,string>) {
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
			
		eq(other: HeaderWidget) {
			return this.codeblockParameters == other.codeblockParameters
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
	
	function collapseOnClick(view: EditorView, target: HTMLElement) {
		const position = view.posAtDOM(target);
		let folded = false;
		view.state.field(codeblockCollapse,false)?.between(position,position,()=>{
			folded = true;
		})

		let collapseStart: Line | null = null;
		let collapseEnd: Line | null = null;
		let startLine: boolean = true;
		for (let i = 1; i < view.state.doc.lines; i++) {
			const line = view.state.doc.line(i);
			const lineText = line.text.toString();
			const codeblockDelimiterLine = (lineText.startsWith('```') && lineText.indexOf('```', 3) === -1);
			if (codeblockDelimiterLine) {
				if (startLine) {
					startLine = false;
					if (position === line.from)
						collapseStart = line;
				} else {
					startLine = true;
					if (collapseStart)
						collapseEnd = line;
				}
			}
			if (collapseStart && collapseEnd) {
				if (folded)
					view.dispatch({effects: uncollapse.of((from,to) => {return (to <= (collapseStart as Line).from || from >= (collapseEnd as Line).to)})});
				else
					view.dispatch({effects: collapse.of([Decoration.replace({block: true}).range(collapseStart.from,collapseEnd.to)])})
				view.requestMeasure();
				collapseStart = null;
				collapseEnd = null;
			}
		}
	}

	const collapse: StateEffectType<Array<Range<Decoration>>> = StateEffect.define();
	const uncollapse: StateEffectType<(from: any, to: any) => boolean> = StateEffect.define();

	function handleMouseDown(event: MouseEvent): void {
		this.setAttribute("data-clicked","true")
	}

	return [codeblockLines,codeblockHeader,codeblockCollapse]
}

function findCodeblockLineNumberMargins(view: EditorView): Array<{start: number, lineNumberMargin: number}> {
	let lineNumberMargins: Array<{start: number, lineNumberMargin: number}> = [];
	// console.log(view.contentDOM.querySelectorAll(".HyperMD-codeblock-begin"),'what?')
	for (let codeblockLineElement of Array.from(view.contentDOM.querySelectorAll(".HyperMD-codeblock-begin"))) {
		// console.log(codeblockLineElement)
		const startElement = codeblockLineElement as HTMLElement;
		let start: number = view.posAtDOM(startElement);
		// start = await returnStartPos(view,startElement);
		// setTimeout(()=>{
		// 	console.log(view.posAtDOM(startElement))
		// },50)
		// console.log(start,'first?')
		let breakLoop = false;
		let lineNumberMargin = 0;
		let currentLineNumberWidth: number;
		if (!codeblockLineElement.nextElementSibling)
			continue;
		codeblockLineElement = codeblockLineElement.nextElementSibling as HTMLElement;
		while (!breakLoop && !codeblockLineElement.classList.contains('HyperMD-codeblock-end')) {
			if (!codeblockLineElement.firstElementChild || !codeblockLineElement.nextElementSibling) {
				breakLoop = true;
				break
			}
			currentLineNumberWidth = (codeblockLineElement.firstElementChild as HTMLElement).offsetWidth;
			// console.log(currentLineNumberWidth)
			if (currentLineNumberWidth > lineNumberMargin)
				lineNumberMargin = currentLineNumberWidth;
			codeblockLineElement = codeblockLineElement.nextElementSibling as HTMLElement;
		}
		if (!breakLoop)
			lineNumberMargins.push({start: start, lineNumberMargin: lineNumberMargin});
	}
	return lineNumberMargins;
}
async function returnStartPos(view: EditorView, startElement: HTMLElement): Promise<number> {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve(view.posAtDOM(startElement));
		});
	});
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

function ignore(state: EditorState): boolean {
	if (!state.field(editorLivePreviewField))
		return true;
	const filePath = state.field(editorInfoField)?.file?.path;
	if (typeof filePath !== 'undefined')
		return this.app.metadataCache.getCache(filePath)?.frontmatter?.['codeblock-customizer-ignore'] === true;
	return false;
}

function arraysEqual(array1: Array<any>,array2: Array<any>): boolean {
	return array1.length === array2.length && array1.every((el) => array2.includes(el));
}
