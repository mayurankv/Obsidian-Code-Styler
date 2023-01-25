import { ViewPlugin, DecorationSet, Decoration } from "@codemirror/view";
import { RangeSetBuilder  } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";

import { splitAndTrimString, searchString } from "./Utils";

let prevEditorLineColor, prevCBLineColor;
let previousLineNumber = -1;

export function codeblockActiveLingHighlight(settings: MyPluginSettings) {
  const viewPlugin = ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      settings: MyPluginSettings;
        
      constructor(view: EditorView) {
        this.settings = settings;
        this.decorations = this.buildDecorations(view);
      }

      update(update: ViewUpdate) {
        const currentEditorLineColor = this.settings.activeLineColor;
        const currentCBLineColor = this.settings.activeCodeBlockLineColor;
        const currentLineNumber = update.view.state.doc.lineAt(update.view.state.selection.main.head).number;
        if (update.docChanged || update.viewportChanged || previousLineNumber != currentLineNumber || currentEditorLineColor !== prevEditorLineColor
            || prevCBLineColor !== currentCBLineColor ) {
          previousLineNumber = currentLineNumber;
          prevEditorLineColor = this.settings.activeLineColor;
          prevCBLineColor = this.settings.activeCodeBlockLineColor;
          this.decorations = this.buildDecorations(update.view);
        }
      }

      buildDecorations(view: EditorView): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>();
        const Exclude = this.settings.ExcludeLangs;
        const ExcludeLangs = splitAndTrimString(Exclude);
        let bExclude = false;
        for (const { from, to } of view.visibleRanges) {
          const activeCodeBlockColor = this.settings.activeCodeBlockLineColor;
          const activeEditorColor = this.settings.activeLineColor;
          const bEditorColor = this.settings.bActiveLineHighlight;
          const bCodeBlockColor = this.settings.bActiveCodeblockLineHighlight;
          const Selection = view.state.selection.main.head
          const start = view.state.doc.lineAt(Selection).from
          let editorLineHighlighted = false;
          syntaxTree(view.state).iterate({ from, to,
            enter(node) {
              const line = view.state.doc.lineAt(node.from);
              const lineText = view.state.sliceDoc(line.from, line.to);
              const lang = searchString(lineText, "```");
              if (lang && (ExcludeLangs.includes(lang.toLowerCase()))) {
                bExclude = true;
              }
              if (/*!codeBlockLineHighlighted &&*/ bCodeBlockColor && start === node.from && (node.type.name.includes("HyperMD-codeblock-begin") || 
                node.type.name ===("HyperMD-codeblock_HyperMD-codeblock-bg") || node.type.name.includes("HyperMD-codeblock-end"))) {
                if (bExclude)
                  return;
                builder.add(line.from, line.from, Decoration.line({
                  attributes: { class: "codeblock-customizer-activeLine", style: `background-color: ${activeCodeBlockColor} !important` }}));
              }
              if (node.type.name.includes("HyperMD-codeblock-end"))
                bExclude = false;
              if (!editorLineHighlighted && bEditorColor) {
                const flag = bCodeBlockColor ? '' : ' !important';
                builder.add(start, start, Decoration.line({
                  attributes: { class: "codeblock-customizer-editor-activeLine", style: `background-color: ${activeEditorColor}${flag}` }}));
                editorLineHighlighted = true;
              }
            },// enter
          });// syntaxTree
        }// for
        return builder.finish();
      }// buildDecorations

      destroy() {}
    },//class
    {
      decorations: (value: CodeblockActiveLingHighlight) => value.decorations,
    }
  );// viewPlugin
  
  viewPlugin.name = "codeblockActiveLingHighlight";
  return viewPlugin;
}// codeblockActiveLingHighlight
