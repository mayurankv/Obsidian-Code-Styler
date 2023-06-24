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
			prevExcludeLangs: string;
			prevHighlightGutter: boolean;

			forceUpdate(editorView: EditorView) {
				this.view = editorView;
				this.decorations = this.buildDecorations(this.view);
				this.view.requestMeasure();
			}// forceUpdate

			compareSettings() {
				return (
					// exluded languages
					// alternative highlights list
					// currentThemeSettings
					this.settings.ExcludeLangs === this.prevExcludeLangs &&
					compareArrays(this.settings.alternateColors, this.prevAlternateColors) &&
					this.settings.bGutterHighlight === this.prevHighlightGutter &&
					this.settings.bEnableLineNumbers === this.prevLineNumbers
				);
			}// compareSettings
			
			updateSettings() {
				this.prevExcludeLangs = this.settings.ExcludeLangs;
				this.prevAlternateColors = this.settings.alternateColors.map(({name}) => {
					return {name};
				});
				this.prevHighlightGutter = this.settings.bGutterHighlight;
			}// updateSettings

			update(update: ViewUpdate) {
				if (this.shouldUpdate(update)) {
					this.updateSettings();
					this.decorations = this.buildDecorations(update.view);
				}
			}// update

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

							//if includes HyperMD-codeblock
							if (node.type.name === "HyperMD-codeblock_HyperMD-codeblock-bg" || startLine || endLine) {
								decorations.push(Decoration.line({attributes: {class: lineClass}}).range(node.from));

								decorations.push(Decoration.line({}).range(node.from)); //todo Can I remove this?
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
