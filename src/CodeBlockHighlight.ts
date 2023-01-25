import { ViewPlugin, Decoration } from "@codemirror/view";
import { RangeSetBuilder  } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";

import { splitAndTrimString, searchString, getHighlightedLines } from "./Utils";

let prevBGColor;
let prevHLColor
let prevExcludeLangs;

export function codeblockHighlight(settings: MyPluginSettings) {
  const viewPlugin = ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      settings: MyPluginSettings;
        
      constructor(view: EditorView) {
        this.settings = settings;
        this.decorations = this.buildDecorations(view);
      }

      update(update: ViewUpdate) {
        const currentBGColor = this.settings.backgroundColor;        
        const currentHLColor = this.settings.highlightColor;
        const currentExcludeLangs = this.settings.ExcludeLangs;
        if (update.docChanged || update.viewportChanged || currentBGColor !== prevBGColor || currentHLColor !== prevHLColor
            || currentExcludeLangs !== prevExcludeLangs ) {
          prevBGColor = this.settings.backgroundColor;
          prevHLColor = this.settings.highlightColor;
          prevExcludeLangs = this.settings.ExlcudeLangs;
          this.decorations = this.buildDecorations(update.view);
        }
      }
      
      destroy() {}

      buildDecorations(view: EditorView): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>();
        let lineNumber = 1;
        let HL = [];
        const BgColor = this.settings.backgroundColor;
        const HLColor = this.settings.highlightColor;
        const Exclude = this.settings.ExcludeLangs;
        const bGutter = this.settings.bEnableLineNumbers;
        const ExcludeLangs = splitAndTrimString(Exclude);
        let bExclude = false;
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
                const radius = (bGutter) ? `border-top-left-radius: 0px` : "";
                builder.add( node.from, node.from, Decoration.line({
                  attributes : {class: "codeblock-customizer-line-background", style: `background-color: ${BgColor}; ${radius}`}}));
              }
              if (node.type.name ===("HyperMD-codeblock_HyperMD-codeblock-bg") ) {
                if (bExclude)
                  return;
                const backgroundClass = (HL != null && HL.includes(lineNumber)) ? "codeblock-customizer-line-highlighted" : "codeblock-customizer-line-background";
                const Color = (backgroundClass === "codeblock-customizer-line-background") ? BgColor : HLColor;
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
                  attributes : {class: "codeblock-customizer-line-background", style: `background-color: ${BgColor};  ${radius}`}}));
                lineNumber = 1;
              }
            },// enter            
          });// syntaxTree
        }// for
        return builder.finish();
      }// buildDecorations
    },// LineNumberPlugin
    {
      decorations: (value: CodeblockActiveLingHighlight) => value.decorations,
    }
  );// viewPlugin
  
  viewPlugin.name = 'codeblockHighlight';
  return viewPlugin;
}// codeblockActiveLingHighlight
