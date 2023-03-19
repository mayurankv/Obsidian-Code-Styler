import { ViewPlugin, Decoration } from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";

import { splitAndTrimString, searchString, getHighlightedLines } from "./Utils";

let prevBGColor;
let prevHLColor;
let prevExcludeLangs;

export function codeblockHighlight(settings: CodeblockCustomizerSettings) {
  const viewPlugin = ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      settings: CodeblockCustomizerSettings;
      prevAlternateColors: { name: string; currentColor: string }[];
      
      constructor(view: EditorView) {
        this.settings = settings;
        this.decorations = this.buildDecorations(view);
        this.prevAlternateColors = [];
        //this.prevAlternateColors = Array.from(this.settings.alternateColors);
      }

      update(update: ViewUpdate) {
        const currentBGColor = this.settings.backgroundColor;        
        const currentHLColor = this.settings.highlightColor;
        const currentExcludeLangs = this.settings.ExcludeLangs;
        const currentAlternateColors = this.settings.alternateColors;
        // update.focusChanged is just a workaround for the bug. Bug in Obsidian or in CodeMirror?
        if (update.docChanged || update.viewportChanged || update.focusChanged || currentBGColor !== prevBGColor || currentHLColor !== prevHLColor
            || currentExcludeLangs !== prevExcludeLangs || !compareArrays(currentAlternateColors, this.prevAlternateColors) ) {
          prevBGColor = this.settings.backgroundColor;
          prevHLColor = this.settings.highlightColor;
          prevExcludeLangs = this.settings.ExcludeLangs;
          this.prevAlternateColors = this.settings.alternateColors.map(({name, currentColor}) => {
            return {name, currentColor};
          });
          this.decorations = this.buildDecorations(update.view);
        }
      }
      
      destroy() {}

      buildDecorations(view: EditorView): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>();
        let lineNumber = 1;
        let HL = [];
        let altHL = [];
        const BgColor = this.settings.backgroundColor;
        const HLColor = this.settings.highlightColor;
        const Exclude = this.settings.ExcludeLangs;
        const bGutter = this.settings.bEnableLineNumbers;
        const ExcludeLangs = splitAndTrimString(Exclude);
        let bExclude = false;
        const alternateColors = this.settings.alternateColors || [];
        for (const { from, to } of view.visibleRanges) {
          syntaxTree(view.state).iterate({ from, to,
            enter(node) {
              const line = view.state.doc.lineAt(node.from);
              const lineText = view.state.sliceDoc(line.from, line.to);
              const lang = searchString(lineText, "```");
              if (lang && (ExcludeLangs.includes(lang.toLowerCase()))) {
                bExclude = true;
              }
              if (node.type.name.includes("HyperMD-codeblock-begin") ) {
                if (bExclude)
                  return;
                
                const params = searchString(lineText, "HL:");
                HL = getHighlightedLines(params);
                altHL = [];
                for (const { name, currentColor } of alternateColors) {
                  const altParams = searchString(lineText, `${name}:`);
                  altHL = altHL.concat(getHighlightedLines(altParams).map((lineNumber) => ({ name, currentColor, lineNumber })));
                }
                const radius = (bGutter) ? `border-top-left-radius: 0px` : "";
                builder.add( node.from, node.from, Decoration.line({
                  attributes : {class: "codeblock-customizer-line-background", style: `background-color: ${BgColor}; ${radius}`}}));
              }
              if (node.type.name ===("HyperMD-codeblock_HyperMD-codeblock-bg") ) {
                if (bExclude)
                  return;

                let backgroundClass = "codeblock-customizer-line-background";
                let Color = BgColor;
                const altHLMatch = altHL.filter((hl) => hl.lineNumber === lineNumber);
                if (HL.includes(lineNumber)) {
                  backgroundClass = "codeblock-customizer-line-highlighted";
                  Color = HLColor;
                } else if (altHLMatch.length > 0) {
                  backgroundClass = `codeblock-customizer-line-highlighted-${altHLMatch[0].name}`;
                  Color = altHLMatch[0].currentColor;
                }                
                builder.add( node.from, node.from, Decoration.line({
                  attributes : {class: backgroundClass, style: `background-color: ${Color};`}}));
                lineNumber++;
              }
              if (node.type.name.includes("HyperMD-codeblock-end") ) {
                if (bExclude){
                  bExclude = false;
                  return;
                }
                const radius = (bGutter) ? `border-bottom-left-radius: 0px` : "";
                builder.add( node.from, node.from, Decoration.line({
                  attributes : {class: "codeblock-customizer-line-background", style: `background-color: ${BgColor}; ${radius}`}}));
                lineNumber = 1;
              }
            },
          });
        }
        return builder.finish();
      }
    },// LineNumberPlugin
    {
      decorations: (value: codeblockHighlight) => value.decorations,
    }
  );// viewPlugin
  
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
