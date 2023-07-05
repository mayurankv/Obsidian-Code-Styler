import { editorEditorField, editorInfoField, editorLivePreviewField } from "obsidian";
import { ViewPlugin, EditorView, ViewUpdate, Decoration, DecorationSet, WidgetType } from "@codemirror/view";
import { Extension, EditorState, StateField, StateEffect, StateEffectType, Range, RangeSet, RangeSetBuilder, Transaction, Line } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";
import { SyntaxNodeRef } from "@lezer/common";

import { CodeblockCustomizerSettings, CodeblockCustomizerThemeSettings } from "./Settings";
import { CodeblockParameters, parseCodeblockParameters, testOpeningLine, isLanguageExcluded, arraysEqual, trimParameterLine } from "./CodeblockParsing";
import { createHeader, getLineClass } from "./CodeblockDecorating";

export function createCodeMirrorExtensions(settings: CodeblockCustomizerSettings, languageIcons: Record<string,string>) {
	const codeblockLineNumberCharWidth = StateField.define<number>({
		create(state: EditorState): number {
			return state.field(editorEditorField).defaultCharacterWidth;
		},
		update(value: number, transaction: Transaction): number {
			let charWidths = Array.from(transaction.state.field(editorEditorField).contentDOM.querySelectorAll(".HyperMD-codeblock-end")).reduce((result: Array<number>,beginningElement: HTMLElement): Array<number> => {
				let nextElement = beginningElement.previousElementSibling as HTMLElement;
				if (!nextElement)
					return result;
				let lineNumberElement = nextElement.querySelector("[class^='codeblock-customizer-line-number']") as HTMLElement;
				if (!lineNumberElement || lineNumberElement.innerText.length <= 2)
					return result;
				let computedStyles = window.getComputedStyle(lineNumberElement, null);
				result.push((lineNumberElement.getBoundingClientRect().width - parseFloat(computedStyles.paddingLeft) - parseFloat(computedStyles.paddingRight)) / lineNumberElement.innerText.length)
				return result;
			},[])
			if (charWidths.length === 0)
				return value;
			return charWidths.reduce((result,value)=>result+value,0) / charWidths.length;
		}
	})
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
				this.view = view;
				this.buildDecorations(this.view);
				this.view.requestMeasure();
			}
		
			update(update: ViewUpdate) {
				if (update.docChanged || 
					update.viewportChanged || 
					this.settings.excludedLanguages !== this.currentSettings.excludedLanguages ||
					this.settings.currentTheme.settings.header.collapsePlaceholder !== this.currentSettings.collapsePlaceholder ||
					!arraysEqual(Object.keys(this.settings.currentTheme.colors.light.highlights.alternativeHighlights),this.currentSettings.alternativeHighlights)
				) {
					this.currentSettings = structuredClone({
						excludedLanguages: this.settings.excludedLanguages,
						collapsePlaceholder: this.settings.currentTheme.settings.header.collapsePlaceholder,
						alternativeHighlights: Object.keys(this.settings.currentTheme.colors.light.highlights.alternativeHighlights),
					});
					this.buildDecorations(update.view);
				}
			}
		
			buildDecorations(view: EditorView) {
				if (!view.visibleRanges || view.visibleRanges.length === 0 || ignore(view.state)) {
					this.decorations = RangeSet.empty;
					return true;
				}
				const decorations: Array<Range<Decoration>> = [];
				const codeblocks = findUnduplicatedCodeblocks(view);
				const settings: CodeblockCustomizerSettings = this.settings;
				for (const codeblock of codeblocks) {
					let codeblockParameters: CodeblockParameters;
					let excludedCodeblock: boolean = false;
					let lineNumber: number = 0;
					let maxLineNum: number = 0;
					let lineNumberMargin: number | undefined = 0;
					syntaxTree(view.state).iterate({from: codeblock.from, to: codeblock.to,
						enter(syntaxNode) {
							const line = view.state.doc.lineAt(syntaxNode.from);
							const lineText = view.state.sliceDoc(line.from,line.to);
							const startLine = syntaxNode.type.name.includes("HyperMD-codeblock-begin");
							const endLine = syntaxNode.type.name.includes("HyperMD-codeblock-end");
							if (startLine) {
								codeblockParameters = parseCodeblockParameters(trimParameterLine(lineText),settings.currentTheme);
								excludedCodeblock = isLanguageExcluded(codeblockParameters.language,settings.excludedLanguages) || codeblockParameters.ignore;
								lineNumber = 0;
								let lineNumberCount = line.number + 1;
								while (!view.state.doc.line(lineNumberCount).text.startsWith('```') || view.state.doc.line(lineNumberCount).text.indexOf('```', 3) !== -1) {
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
								decorations.push(Decoration.line({attributes: {style: `--line-number-gutter-width: ${lineNumberMargin?lineNumberMargin+'px':'calc(var(--line-number-gutter-min-width) - 12px)'}`, class: (settings.specialLanguages.some(regExp => new RegExp(regExp).test(codeblockParameters.language))||startLine||endLine?'codeblock-customizer-line':getLineClass(codeblockParameters,lineNumber,line.text).join(' '))+(["^$"].concat(settings.specialLanguages).some(regExp => new RegExp(regExp).test(codeblockParameters.language))?'':` language-${codeblockParameters.language}`)}}).range(syntaxNode.from))
								decorations.push(Decoration.line({}).range(syntaxNode.from));
								decorations.push(Decoration.widget({widget: new LineNumberWidget(lineNumber,codeblockParameters,maxLineNum,startLine||endLine)}).range(syntaxNode.from))
								lineNumber++;
							}
						}
					})
				}
				this.decorations = RangeSet.of(decorations,true)
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
			let startDelimiterLength: number = 3;
			for (let i = 1; i < transaction.state.doc.lines; i++) {
				const line = transaction.state.doc.line(i);
				const lineText = line.text.toString();
				let currentDelimiterLength = testOpeningLine(lineText);
				if (currentDelimiterLength) {
					if (startLine) {
						startLine = false;
						startDelimiterLength = currentDelimiterLength;
						codeblockParameters = parseCodeblockParameters(trimParameterLine(lineText),settings.currentTheme);
						if (!isLanguageExcluded(codeblockParameters.language,settings.excludedLanguages) && !codeblockParameters.ignore)
							if (!settings.specialLanguages.some(regExp => new RegExp(regExp).test(codeblockParameters.language)))
								builder.add(line.from,line.from,Decoration.widget({widget: new HeaderWidget(codeblockParameters,settings.currentTheme.settings,languageIcons),block: true}));
							else
								continue;
					} else {
						if (currentDelimiterLength === startDelimiterLength)
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
			let startDelimiterLength: number = 3;
			for (let i = 1; i < state.doc.lines; i++) {
				const line = state.doc.line(i);
				const lineText = line.text.toString();
				let currentDelimiterLength = testOpeningLine(lineText);
				if (currentDelimiterLength) {
					if (startLine) {
						startLine = false;
						startDelimiterLength = currentDelimiterLength;
						codeblockParameters = parseCodeblockParameters(trimParameterLine(lineText),settings.currentTheme);
						if (!isLanguageExcluded(codeblockParameters.language,settings.excludedLanguages) && !codeblockParameters.ignore && codeblockParameters.fold.enabled)
							if (!settings.specialLanguages.some(regExp => new RegExp(regExp).test(codeblockParameters.language)))
								collapseStart = line;
							else
								continue;
					} else {
						if (currentDelimiterLength === startDelimiterLength) {
							startLine = true;
							if (collapseStart)
								collapseEnd = line;
						}
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
		maxLineNum: number
		empty: boolean;
	
		constructor(lineNumber: number, codeblockParameters: CodeblockParameters, maxLineNum: number, empty: boolean) {
			super();
			this.lineNumber = lineNumber;
			this.codeblockParameters = codeblockParameters;
			this.maxLineNum = maxLineNum
			this.empty = empty;
		}
	
		eq(other: LineNumberWidget) {
			return this.lineNumber === other.lineNumber && this.codeblockParameters === other.codeblockParameters && this.maxLineNum === other.maxLineNum;
		}
	
		toDOM(view: EditorView): HTMLElement {
			let lineNumberDisplay = '';
			if (!this.codeblockParameters.lineNumbers.alwaysEnabled && this.codeblockParameters.lineNumbers.alwaysDisabled)
				lineNumberDisplay = '-hide'
			else if (this.codeblockParameters.lineNumbers.alwaysEnabled && !this.codeblockParameters.lineNumbers.alwaysDisabled)
				lineNumberDisplay = '-specific'
			return createSpan({attr: {style: this.maxLineNum.toString().length > (this.lineNumber + this.codeblockParameters.lineNumbers.offset).toString().length?'width: var(--line-number-gutter-width);':''}, cls: `codeblock-customizer-line-number${lineNumberDisplay}`, text: this.empty?'':(this.lineNumber + this.codeblockParameters.lineNumbers.offset).toString()});
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
		let startDelimiterLength: number = 3;
		for (let i = 1; i < view.state.doc.lines; i++) {
			const line = view.state.doc.line(i);
			const lineText = line.text.toString();
			let currentDelimiterLength = testOpeningLine(lineText);
			if (currentDelimiterLength) {
				if (startLine) {
					startDelimiterLength = currentDelimiterLength;
					startLine = false;
					if (position === line.from)
						collapseStart = line;
				} else {
					if (currentDelimiterLength === startDelimiterLength) {
						startLine = true;
						if (collapseStart)
							collapseEnd = line;
					}
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

	return [codeblockLineNumberCharWidth,codeblockLines,codeblockHeader,codeblockCollapse]
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

function isCodeblockDelimiter(line: string): boolean {
	return true;
}
