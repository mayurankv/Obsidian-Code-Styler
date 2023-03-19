import { ViewPlugin, Decoration, WidgetType } from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";

import { splitAndTrimString, searchString, getHighlightedLines, getLanguageIcon, getLanguageName } from "./Utils";

let prevExcludeLangs, prevTextColor, prevBackgroundColor, prevHighlightGutter;
export function codeblockGutter(settings: CodeblockCustomizerSettings) {
  const viewPlugin = ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      settings: CodeblockCustomizerSettings;
        
      constructor(view: EditorView) {
        this.settings = settings;
        this.decorations = this.buildDecorations(view);
      }

      update(update: ViewUpdate) {
        const currentExcludeLangs = this.settings.ExcludeLangs;
        const currentTextColor = this.settings.gutterTextColor;
        const currentBackgroundColor = this.settings.gutterBackgroundColor;
        const currentHighlightGutter = this.settings.bGutterHighlight;
        // update.focusChanged is just a workaround for the bug. Bug in Obsidian or in CodeMirror?
        if (update.docChanged || update.viewportChanged || update.focusChanged || currentExcludeLangs !== prevExcludeLangs || currentTextColor !== prevTextColor || currentBackgroundColor !== prevBackgroundColor || currentHighlightGutter !== prevHighlightGutter ) {
          prevExcludeLangs = this.settings.ExcludeLangs;
          prevTextColor = this.settings.gutterTextColor;
          prevBackgroundColor = this.settings.gutterBackgroundColor;
          prevHighlightGutter = this.settings.bGutterHighlight;
          this.decorations = this.buildDecorations(update.view);
        }
      }
      
      destroy() {}

      buildDecorations(view: EditorView): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>();
        let lineNumber = 1;
        let HL = [];
        let altHL = [];
        const HLColor = this.settings.highlightColor;
        const Exclude = this.settings.ExcludeLangs;
        const GutterBackgroundColor = this.settings.gutterBackgroundColor;
        const GutterHighlight = this.settings.bGutterHighlight;
        const ExcludeLangs = splitAndTrimString(Exclude);
        const GutterTextColor = settings.gutterTextColor;
        const bDisplayCodeBlockLanguage = this.settings.bDisplayCodeBlockLanguage;
        const bDisplayCodeBlockIcon = this.settings.bDisplayCodeBlockIcon;
        const bAlwaysDisplayCodeblockLang = this.settings.header.bAlwaysDisplayCodeblockLang;
        const bAlwaysDisplayCodeblockIcon = this.settings.header.bAlwaysDisplayCodeblockIcon;
        let bExclude = false;
        const alternateColors = this.settings.alternateColors || [];
        syntaxTree(view.state).iterate({
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
              const FileName = searchString(lineText, "file:");
              const Fold = searchString(lineText, "fold");
              const codeBlockLang = searchString(lineText, "```");
              const isHeaderEnabled = ((FileName !== "" && FileName !== null) || Fold || ((bDisplayCodeBlockLanguage && bAlwaysDisplayCodeblockLang) || ( bDisplayCodeBlockIcon && bAlwaysDisplayCodeblockIcon && getLanguageIcon(getLanguageName(codeBlockLang))) && codeBlockLang)) ? true : false;
              builder.add( node.from, node.from, Decoration.line({
                attributes : {class: `codeblock-customizer-gutter-line`}}));
              builder.add( node.from, node.from, Decoration.widget({
                widget: new LineNumberWidget(" ", GutterBackgroundColor, GutterTextColor, true, false, isHeaderEnabled),}));//builder
            }
            if (node.type.name ===("HyperMD-codeblock_HyperMD-codeblock-bg") ) {
              if (bExclude)
                return;

                let GutterHLColor = GutterBackgroundColor;
                const altHLMatch = altHL.filter((hl) => hl.lineNumber === lineNumber);
                if (GutterHighlight && HL.includes(lineNumber)) {
                  GutterHLColor = HLColor;
                } else if (GutterHighlight && altHLMatch.length > 0) {
                  GutterHLColor = altHLMatch[0].currentColor;
                }
                builder.add( node.from, node.from, Decoration.line({
                  attributes : {class: `codeblock-customizer-gutter-line`}}));
                builder.add( node.from, node.from, Decoration.widget({
                  widget: new LineNumberWidget(lineNumber, GutterHLColor, GutterTextColor, false, false, false),}));//builder
              lineNumber++;
            }
            if (node.type.name.includes("HyperMD-codeblock-end") ) {
              if (bExclude){
                bExclude = false;
                return;
              }
              
              builder.add( node.from, node.from, Decoration.line({
                attributes : {class: `codeblock-customizer-gutter-line`}}));
              builder.add( node.from, node.from, Decoration.widget({
                widget: new LineNumberWidget(" ", GutterBackgroundColor, GutterTextColor, false, true, false),}));//builder
              
              lineNumber = 1;
            }
          },
        });
        return builder.finish();
      }
    },// LineNumberPlugin
    {
      decorations: (value: codeblockGutter) => value.decorations,
    }
  );// viewPlugin
  
  viewPlugin.name = 'codeblockGutter';
  return viewPlugin;
}// codeblockGutter

class LineNumberWidget extends WidgetType {
  constructor(private lineNumber: number, private backgroundColor: string, private GutterTextColor: string, private bFirstLine: boolean, private bLastLine: boolean, private isHeaderEnabled: boolean) {
    super();
  }

  eq(other: LineNumberWidget) {
    return this.lineNumber === other.lineNumber && this.textColor === other.textColor && this.backgroundColor === other.backgroundColor && other.GutterTextColor === this.GutterTextColor;
  }

  toDOM(view: EditorView): HTMLElement {
    const container = document.createElement("span");
    container.classList.add("codeblock-customizer-gutter-container");
    container.style.setProperty("--codeblock-customizer-gutter-color", this.backgroundColor);

    const span = document.createElement("span");
    span.classList.add("codeblock-customizer-gutter");
    if (this.bFirstLine && !this.isHeaderEnabled)
      span.classList.add("codeblock-customizer-gutterElements-first-radius");
    if (this.bLastLine)
      span.classList.add("codeblock-customizer-gutterElements-last-radius");
    span.style.setProperty("--codeblock-customizer-gutter-textColor", this.GutterTextColor);
    
    span.innerText = `${this.lineNumber}`;

    container.appendChild(span);

    return container;
  }
}// LineNumberWidget