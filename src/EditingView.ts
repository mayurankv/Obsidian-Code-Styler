import { parseYaml } from "obsidian";
import { ViewPlugin, EditorView, ViewUpdate, Decoration, DecorationSet, WidgetType } from "@codemirror/view";
import { Extension, EditorState, StateField, StateEffect, StateEffectType, Range, RangeSet, RangeSetBuilder, Transaction, Line, Text } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";
import { SyntaxNodeRef } from "@lezer/common";

import { CodeblockCustomizerSettings, CodeblockCustomizerThemeSettings } from "./Settings";
import { CodeblockParameters, parseCodeblockParameters, isLanguageExcluded } from "./CodeblockParsing";
import { createHeader, getLineClass } from "./CodeblockDecorating";

export function createCodeMirrorExtensions(settings: CodeblockCustomizerSettings) {
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
					excludedLanguages: '',
					collapsePlaceholder: '',
					alternativeHighlights: [],
				}
				this.view = view;
				this.decorations = this.buildDecorations(this.view);
				this.mutationObserver = new MutationObserver((mutations) => {
					for (const mutation of mutations) {
						if (
							mutation.type === "attributes" &&
							mutation.attributeName === "class" &&
							(
								(mutation.target as HTMLElement).classList.contains("HyperMD-codeblock-begin") ||
								(mutation.target as HTMLElement).classList.contains("HyperMD-codeblock_HyperMD-codeblock-bg") ||
								(mutation.target as HTMLElement).classList.contains("HyperMD-codeblock-end")
							)
						) {
							this.forceUpdate(this.view);
						}
					}
				});
				this.mutationObserver.observe(this.view.dom, {
					attributes: true,
					childList: true,
					subtree: true,
					attributeFilter: ['class'], // Only observe changes to the 'class' attribute
				});
			}
		
			forceUpdate(view: EditorView) {
				this.view = view;
				this.decorations = this.buildDecorations(this.view);
				this.view.requestMeasure();
			}
		
			update(update: ViewUpdate) {
				if (
					update.docChanged || 
					update.viewportChanged || 
					this.settings.excludedLanguages !== this.currentSettings.excludedLanguages ||
					this.settings.currentTheme.settings.header.collapsePlaceholder !== this.currentSettings.collapsePlaceholder ||
					arraysEqual(Object.keys(this.settings.currentTheme.colors.light.highlights.alternativeHighlights),this.currentSettings.alternativeHighlights)
				) {
					this.currentSettings = {
						excludedLanguages: this.settings.excludedLanguages,
						collapsePlaceholder: this.settings.currentTheme.settings.header.collapsePlaceholder,
						alternativeHighlights: Object.keys(this.settings.currentTheme.colors.light.highlights.alternativeHighlights),
					};
					this.decorations = this.buildDecorations(update.view);
				}
			}
		
			buildDecorations(view: EditorView): DecorationSet {
				if (!view.visibleRanges || view.visibleRanges.length === 0 || parseIgnoreFrontmatter(view.state.doc))
					return RangeSet.empty;
				const decorations: Array<Range<Decoration>> = [];
				const codeblocks = findUnduplicatedCodeblocks(view);
				const settings: CodeblockCustomizerSettings = this.settings;
				for (const codeblock of codeblocks) {
					let codeblockParameters: CodeblockParameters;
					let excludedCodeblock: boolean = false;
					let lineNumber: number = 0;
					syntaxTree(view.state).iterate({from: codeblock.from, to: codeblock.to,
						enter(node) {
							const line = view.state.doc.lineAt(node.from);
							const lineText = view.state.sliceDoc(line.from,line.to);
							const startLine = node.type.name.includes("HyperMD-codeblock-begin");
							const endLine = node.type.name.includes("HyperMD-codeblock-end");
							if (startLine) {
								codeblockParameters = parseCodeblockParameters(lineText,settings.currentTheme);
								excludedCodeblock = isLanguageExcluded(codeblockParameters.language,settings.excludedLanguages) || codeblockParameters.ignore;
								lineNumber = 0;
							}
							if (excludedCodeblock)
								return;
							if (node.type.name.includes("HyperMD-codeblock")) {
								decorations.push(Decoration.line({attributes: {class: (settings.specialLanguages.includes(codeblockParameters.language)||startLine||endLine?'codeblock-customizer-line':getLineClass(codeblockParameters,lineNumber).join(' '))+([''].concat(settings.specialLanguages).includes(codeblockParameters.language)?'':` language-${codeblockParameters.language}`)}}).range(node.from))
								decorations.push(Decoration.line({}).range(node.from));
								decorations.push(Decoration.widget({widget: new LineNumberWidget(lineNumber,codeblockParameters,startLine||endLine)}).range(node.from))
								lineNumber++;
							}
						}
					})
				}
				return RangeSet.of(decorations,true);
			}


		
			destroy() {
				this.mutationObserver.disconnect();
			}
		},
		{decorations: (value) => value.decorations}
	)
	const codeblockHeader = StateField.define<DecorationSet>({
		create(state: EditorState): DecorationSet {
			return Decoration.none;    
		},
		update(value: DecorationSet, transaction: Transaction): DecorationSet {
			if (parseIgnoreFrontmatter(transaction.state.doc))
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
							if (!settings.specialLanguages.includes(codeblockParameters.language))
								builder.add(line.from,line.from,Decoration.widget({widget: new HeaderWidget(codeblockParameters,settings.currentTheme.settings),block: true}));
							else if (codeblockParameters.language === 'preview')
								continue;
							else if (codeblockParameters.language === 'include')
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
			if (parseIgnoreFrontmatter(state.doc))
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
							if (!settings.specialLanguages.includes(codeblockParameters.language))
								collapseStart = line;
							else if (codeblockParameters.language === 'preview')
								continue;
							else if (codeblockParameters.language === 'include')
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
			return createSpan({cls: `codeblock-customizer-line-number${lineNumberDisplay}`, text: this.empty?'':(this.lineNumber + this.codeblockParameters.lineNumbers.offset).toString()});
		}
	}
	class HeaderWidget extends WidgetType {
		codeblockParameters: CodeblockParameters;
		themeSettings: CodeblockCustomizerThemeSettings;
		view: EditorView;
		mutationObserver: MutationObserver;
	
		constructor(codeblockParameters: CodeblockParameters, themeSettings: CodeblockCustomizerThemeSettings) {
			super();
			this.codeblockParameters = codeblockParameters;
			this.themeSettings = themeSettings;
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
			const headerContainer = createHeader(this.codeblockParameters, this.themeSettings);
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
		enter: (node) => {
			if (
				node.type.name.includes("HyperMD-codeblock-begin") ||
				node.type.name === "HyperMD-codeblock_HyperMD-codeblock-bg" ||
				node.type.name.includes("HyperMD-codeblock-end")
			) {
				codeblocks.push(node);
			}
		}
	})
	return codeblocks;
}

function parseIgnoreFrontmatter(doc: Text): boolean {
	//TODO (@mayurankv) Improve this function to use plugin.app.metadataCache.getCache(filePath)?.frontmatter?.['codeblock-customizer-ignore'] - need filePath
	if (typeof doc?.text === 'undefined')
		return false
	const start = doc.text.indexOf('---');
	if (start === -1 || doc.text.slice(0,start).some((line: string) => line.trim()!==''))
		return false;
	const end = doc.text.indexOf('---',start+1);
	if (end === -1)
		return false;
	try {
		const parsedYaml = parseYaml(doc.text.slice(start+1,end).join('\n'));
		if ('codeblock-customizer-ignore' in parsedYaml)
			return parsedYaml['codeblock-customizer-ignore'] === true;
		return false;
	} catch(error) {
		return false;
	}
}

function arraysEqual(array1: Array<any>,array2: Array<any>): boolean {
	return array1.length === array2.length && array1.every((el) => array2.includes(el));
}
