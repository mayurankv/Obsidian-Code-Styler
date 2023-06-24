import { ViewPlugin, EditorView, ViewUpdate, Decoration, DecorationSet, WidgetType } from "@codemirror/view";
import { StateField, StateEffect, Range, RangeSet, RangeSetBuilder } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";

import { CodeblockCustomizerSettings, CodeblockCustomizerThemeSettings } from "./Settings";
import { CodeblockParameters, parseCodeblockParameters, isLanguageExcluded } from "./CodeblockParsing";
import { createHeader, getLineClass } from "./CodeblockDecorating";



export function codeblockLines(settings: CodeblockCustomizerSettings) {
	return ViewPlugin.fromClass(
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
				if (!view.visibleRanges || view.visibleRanges.length === 0)
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
								excludedCodeblock = isLanguageExcluded(codeblockParameters.language,settings.excludedLanguages);
								lineNumber = 0;
							}
							if (excludedCodeblock)
								return;
							if (node.type.name.includes("HyperMD-codeblock")) {
								decorations.push(Decoration.line({attributes: {class: getLineClass(codeblockParameters,lineNumber).join(' ')}}).range(node.from))
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
}

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
					handleClick(this.view, mutation.target);
			})
		});    
	}
		
	eq(other: HeaderWidget) {
		return this.codeblockParameters == other.codeblockParameters
	}
		
	toDOM(view: EditorView): HTMLElement {
		this.view = view;
		const headerContainer = createHeader(this.codeblockParameters, this.themeSettings);
		headerContainer.addEventListener("mousedown", event => {
			headerContainer.setAttribute("data-clicked", "true");
		});

		this.mutationObserver.observe(headerContainer,{
			attributes: true,
		});   
		
		return headerContainer;
	}
			
	destroy(dom: HTMLElement) {
		dom.removeAttribute("data-clicked");
		dom.removeEventListener("mousedown",handleClick);
		this.mutationObserver.disconnect();
	}

	ignoreEvent() {
		return false;
	}
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
	syntaxTree(view.state).iterate({from: view.state.doc.from, to: view.state.doc.to,
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

function arraysEqual(array1: Array<any>,array2: Array<any>): boolean {
	return array1.length === array2.length && array1.every((el) => array2.includes(el));
}
