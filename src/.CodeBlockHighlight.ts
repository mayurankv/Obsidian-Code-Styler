import { ViewPlugin, Decoration, WidgetType } from "@codemirror/view";
import { RangeSet } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";

import { searchString, getHighlightedLines, isExcluded } from "./Utils";

export function codeblockHighlight(settings: CodeblockCustomizerSettings) {
	const viewPlugin = ViewPlugin.fromClass(
		class CodeblockHighlightPlugin {
			decorations: DecorationSet;
			settings: CodeblockCustomizerSettings;
			prevAlternateColors: ColorSettings[];
			view: EditorView;
			mutationObserver: MutationObserver;
			prevBGColor: string;
			prevHLColor: string;
			prevExcludeLangs: string;
			prevTextColor: string;
			prevBackgroundColor: string;
			prevHighlightGutter: boolean;
			prevLineNumbers: boolean;

			constructor(view: EditorView) {
				this.initialize(view, settings);
			}

			initialize(view: EditorView, settings: CodeblockCustomizerSettings) {
				this.view = view;
				this.settings = settings;
				this.decorations = this.buildDecorations(view);
				this.prevAlternateColors = [];
				this.mutationObserver = setupMutationObserver(view, this);
				this.prevBGColor = '';
				this.prevHLColor = '';
				this.prevExcludeLangs = '';
				this.prevTextColor = '';
				this.prevBackgroundColor = '';
				this.prevHighlightGutter = false;
				this.prevLineNumbers = false;
			}// initialize

			forceUpdate(editorView: EditorView) {
				this.view = editorView;
				this.decorations = this.buildDecorations(this.view);
				this.view.requestMeasure();
			}// forceUpdate

			shouldUpdate(update: ViewUpdate) {
				return (update.docChanged || update.viewportChanged || !this.compareSettings());
			}// shouldUpdate

			compareSettings() {
				return (
					this.settings.backgroundColor === this.prevBGColor &&
					this.settings.highlightColor === this.prevHLColor &&
					this.settings.ExcludeLangs === this.prevExcludeLangs &&
					compareArrays(this.settings.alternateColors, this.prevAlternateColors) &&
					this.settings.gutterTextColor === this.prevTextColor &&
					this.settings.gutterBackgroundColor === this.prevBackgroundColor &&
					this.settings.bGutterHighlight === this.prevHighlightGutter &&
					this.settings.bEnableLineNumbers === this.prevLineNumbers
				);
			}// compareSettings
			
			updateSettings() {
				this.prevBGColor = this.settings.backgroundColor;
				this.prevHLColor = this.settings.highlightColor;
				this.prevExcludeLangs = this.settings.ExcludeLangs;
				this.prevAlternateColors = this.settings.alternateColors.map(({name}) => {
					return {name};
				});
				this.prevTextColor = this.settings.gutterTextColor;
				this.prevBackgroundColor = this.settings.gutterBackgroundColor;
				this.prevHighlightGutter = this.settings.bGutterHighlight;
				this.prevLineNumbers = this.settings.bEnableLineNumbers;
			}// updateSettings

			update(update: ViewUpdate) {
				if (this.shouldUpdate(update)) {
					this.updateSettings();
					this.decorations = this.buildDecorations(update.view);
				}
			}// update

			destroy() {
				this.mutationObserver.disconnect();
			}// destroy

			filterVisibleCodeblocks(view: EditorView, codeblocks: Codeblock[]): Codeblock[] {
				return codeblocks.filter((codeblock) => {
					return view.visibleRanges.some((visibleRange) => {
						return (codeblock.from < visibleRange.to && codeblock.to > visibleRange.from);
					});
				});
			}// filterVisibleCodeblocks

			deduplicateCodeblocks(codeblocks: Codeblock[]): Codeblock[] {
				const deduplicatedCodeblocks = [];
				for (let i = 0; i < codeblocks.length; i++) {
					if (i === 0 || codeblocks[i].from !== codeblocks[i - 1].from) {
						deduplicatedCodeblocks.push(codeblocks[i]);
					}
				}
				return deduplicatedCodeblocks;
			}// deduplicateCodeblocks
	
			buildDecorations(view: EditorView): DecorationSet {
				let lineNumber = 0;
				let HL = [];
				let altHL = [];
				let lineNumberOffset = 0;
				let showNumbers = true;
				// const Exclude = this.settings.ExcludeLangs;
				// const ExcludeLangs = splitAndTrimString(Exclude);
				let bExclude = false;
				const alternateColors = this.settings.alternateColors || [];
				const decorations = [];

				if (!view.visibleRanges || view.visibleRanges.length === 0) {
					return RangeSet.empty;
				}
					
				// Find all code blocks in the document
				const codeblocks = findCodeblocks(view.state, view.state.doc.from, view.state.doc.to);
				// Find code blocks that intersect with the visible range
				const visibleCodeblocks = this.filterVisibleCodeblocks(view, codeblocks);
				// remove duplicates
				const deduplicatedCodeblocks = this.deduplicateCodeblocks(visibleCodeblocks);

				for (const codeblock of deduplicatedCodeblocks) {
					syntaxTree(view.state).iterate({ from: codeblock.from, to: codeblock.to,
						enter(node) {
							const line = view.state.doc.lineAt(node.from);
							const lineText = view.state.sliceDoc(line.from, line.to);
							const lang = searchString(lineText, "```");
							const startLine = node.type.name.includes("HyperMD-codeblock-begin")
							const endLine = node.type.name.includes("HyperMD-codeblock-end")
							if (lang) {
								bExclude = isExcluded(lineText, settings.ExcludeLangs);
							}
							if (bExclude) {
								if (endLine) {
									bExclude = false;
								}
								return;
							}
							if (startLine) {
								lineNumber = 0;
								lineNumberOffset = 0; //searchString(codeBlockFirstLine, "ln:")//TODO (@mayurankv) Set line number offset here - Should be ln_value - 1 since it is offset, not starting line number - 0 if true OR false
								showNumbers = true; //TODO (@mayurankv) Set showNumbers to be true if ln:<number> or ln:true or false if ln:false
								const params = searchString(lineText, "HL:");
								HL = getHighlightedLines(params);
								altHL = [];
								for (const { name } of alternateColors) {
									const altParams = searchString(lineText, `${name}:`);
									altHL = altHL.concat(getHighlightedLines(altParams).map((lineNumber) => ({ name, lineNumber })));
								}
							}
							let lineClass = 'codeblock-customizer-line';
							if (HL.includes(lineNumber)) {
								lineClass = 'codeblock-customizer-line-highlighted';
							} else {
								const altHLMatch = altHL.filter((hl) => hl.lineNumber === lineNumber);
								if (altHLMatch.length > 0) {
									lineClass = `codeblock-customizer-line-highlighted-${altHLMatch[0].name.replace(/\s+/g, '-').toLowerCase()}`;
								}
							}

							if (node.type.name === "HyperMD-codeblock_HyperMD-codeblock-bg" || startLine || endLine) {
								decorations.push(Decoration.line({attributes: {class: lineClass}}).range(node.from));

								decorations.push(Decoration.line({}).range(node.from));
								decorations.push(Decoration.widget({ widget: new LineNumberWidget((startLine || endLine) ? " " : lineNumber+lineNumberOffset,showNumbers),}).range(node.from));
								lineNumber++;
							}
						},
					});
				}
				return RangeSet.of(decorations, true);
			}
		},// CodeblockHighlightPlugin
		{
			decorations: (value) => value.decorations,
		}
	);

	viewPlugin.name = 'codeblockHighlight';
	return viewPlugin;
}// codeblockHighlight

function compareArrays(array1, array2) {
	
	if (array1.length !== array2.length) {
		return false;
	}
	for (let i = 0; i < array1.length; i++) {
		if ((array1[i].name !== array2[i].name) || (array1[i].currentColor !== array2[i].currentColor)) {
			return false;
		}
	}
	return true;
}// compareArrays

class LineNumberWidget extends WidgetType {
	constructor(private lineNumber: number, private showNumbers: boolean) {
		super();
	}

	eq(other: LineNumberWidget) {
		return this.lineNumber === other.lineNumber && this.showNumbers === other.showNumbers;
	}

	toDOM(view: EditorView): HTMLElement {
		const container = document.createElement("span");
		container.classList.add(`codeblock-customizer-line-number${this.showNumbers?'':'-hide'}`);
		container.innerText = `${this.lineNumber}`;

		return container;
	}
}// LineNumberWidget

function findCodeblocks(doc: Text, from: number, to: number): SyntaxNode[] {
	const tree = syntaxTree(doc);
	const codeblocks: SyntaxNode[] = [];

	tree.iterate({ from, to,
		enter: (node) => {
			if (
				node.type.name.includes("HyperMD-codeblock-begin") ||
				node.type.name === "HyperMD-codeblock_HyperMD-codeblock-bg" ||
				node.type.name.includes("HyperMD-codeblock-end")
			) {
				codeblocks.push(node);
			}
		},
	});

	return codeblocks;
}// findCodeblocks

function setupMutationObserver(editorView: EditorView, pluginInstance: any) { //TODO (@mayurankv) What does this do? Work out
	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (
				mutation.type === "attributes" &&
				mutation.attributeName === "class" &&
				(mutation.target.classList.contains("HyperMD-codeblock-begin") ||
					mutation.target.classList.contains("HyperMD-codeblock_HyperMD-codeblock-bg") ||
					mutation.target.classList.contains("HyperMD-codeblock-end"))
			) {
				pluginInstance.forceUpdate(editorView);
			}
		}
	});

	observer.observe(editorView.dom, {
		attributes: true,
		childList: true,
		subtree: true,
		attributeFilter: ['class'], // Only observe changes to the 'class' attribute
	});

	return observer;
} // setupMutationObserver
