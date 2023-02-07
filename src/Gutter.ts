import { gutter, GutterMarker } from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import { RangeSetBuilder } from "@codemirror/state";

import { splitAndTrimString, searchString, getHighlightedLines } from "./Utils";

class LineNumberMarker extends GutterMarker {
  observer: MutationObserver;
  
  constructor(public metaInfo: CodeBlockMeta /*, public bDestroy: boolean*/) {
    super();
    this.observer = new MutationObserver(this.handleMutation);
  }
  
  handleMutation = (mutations, view) => {    
    mutations.forEach(mutation => {
      if (mutation.target.hasAttribute("color-changed")){
        this.updateParentElementStyles(mutation.target);
      }
    });
  }
  
  updateParentElementStyles(target: Element) {
    const parent = target.closest('.codeblock-customizer-gutterElements');
    if (parent) {
      parent.style.backgroundColor = this.metaInfo.gutterBackgroundColor;
      if (this.metaInfo.bFirstLine) {        
        parent.classList.add("codeblock-customizer-gutterElements-first-radius");
      } else {
        parent.classList.add("codeblock-customizer-gutterElements-first-no-radius");
      }
      if (this.metaInfo.bLastLine) {
        parent.classList.add("codeblock-customizer-gutterElements-last-radius");
      } else {
        parent.classList.add("codeblock-customizer-gutterElements-last-no-radius");
      }
    }
  }// updateParentElementStyles
  
  eq(other: LineNumberMarker) {
    return (other.metaInfo.lineNumber == this.metaInfo.lineNumber && other.metaInfo.gutterTextColor == this.metaInfo.gutterTextColor &&
            other.metaInfo.gutterBackgroundColor == this.metaInfo.gutterBackgroundColor/* && other.bDestroy == this.bDestroy*/
            && other.metaInfo.bFirstLine == this.metaInfo.bFirstLine && other.metaInfo.bLastLine == this.metaInfo.bLastLine);
  }
  
  toDOM(view: EditorView) {
    const element = document.createElement("div");
    element.textContent = (this.metaInfo.lineNumber == -1) ? "" : this.metaInfo.lineNumber;
    element.style.color = this.metaInfo.gutterTextColor;   
    
    this.observer.observe(element, { attributes: true, childList: true });
    element.setAttribute("color-changed", "true");

    return element;
  }
  
  destroy(dom: Node){
    dom.removeAttribute("color-changed");
    dom.removeEventListener("DOMNodeInserted", this.handleMutation);
    this.observer.disconnect();
  }
  elementClass = "codeblock-customizer-gutterElements";
}// LineNumberMarker

const emptyMarker = new class extends GutterMarker {
  toDOM(view: EditorView) { 
    return document.createTextNode("")
  }
  
  elementClass = "codeblock-customizer-gutterElements_empty";
}

export function codeblockGutter(settings: CodeblockCustomizerSettings) {
  const Exclude = settings.ExcludeLangs;  
  const ExcludeLangs = splitAndTrimString(Exclude);
  const ret = gutter({
    class : "codeblock-customizer-gutter",
    markers(view) {
      let lineNumber = 1;
      let bExclude = false;
      const GutterTextColor = settings.gutterTextColor;
      const GutterBackgroundColor = settings.gutterBackgroundColor;
      const GutterHighlightColor = settings.highlightColor;
      const GutterHighlight = settings.bGutterHighlight;
      let lang = "";
      let metaInfo;
      let HL = [];
      const builder = new RangeSetBuilder<Decoration>();
        syntaxTree(view.state).iterate({ //from, to,
          enter(node) {
            const line = view.state.doc.lineAt(node.from);
            const lineText = view.state.sliceDoc(line.from, line.to);            
            lang = searchString(lineText, "```");
            if (lang && (ExcludeLangs.includes(lang.toLowerCase()))) {
              bExclude = true;              
            }
            if (node.type.name.includes("HyperMD-codeblock-begin") ) {
              if (!bExclude) {
                const params = searchString(lineText, "HL:");
                HL = getHighlightedLines(params);
                metaInfo = {lineNumber: -1, gutterTextColor: GutterTextColor, gutterBackgroundColor: GutterBackgroundColor, bFirstLine: true, bLastLine: false};
                builder.add(node.from, node.to, new LineNumberMarker(metaInfo));
              }
            }
            else if (node.type.name === "HyperMD-codeblock_HyperMD-codeblock-bg" ) {
              if (!bExclude) {
                if (GutterHighlight && HL != null && HL.includes(lineNumber)){
                  metaInfo = {lineNumber, gutterTextColor: GutterTextColor, gutterBackgroundColor: GutterHighlightColor, bFirstLine: false, bLastLine: false};
                }
                else {
                  metaInfo = {lineNumber, gutterTextColor: GutterTextColor, gutterBackgroundColor: GutterBackgroundColor, bFirstLine: false, bLastLine: false};
                }
                builder.add(node.from, node.to, new LineNumberMarker(metaInfo));
                lineNumber++;
              }
            }
            else if (node.type.name.includes("HyperMD-codeblock-end") ) {
              if (!bExclude) {
                metaInfo = {lineNumber: -1, gutterTextColor: GutterTextColor, gutterBackgroundColor: GutterBackgroundColor, bFirstLine: false, bLastLine: true};
                builder.add(node.from, node.to, new LineNumberMarker(metaInfo));
                lineNumber = 1;
              }
              bExclude = false;
            }
          },
        });
      return builder.finish();
    },
    initialSpacer: () => emptyMarker,
  })
  
  ret.name = 'codeblockGutter';
  return ret;
}