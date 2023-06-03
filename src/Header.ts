import { StateField, StateEffect, RangeSetBuilder } from "@codemirror/state";
import { EditorView, Decoration, WidgetType } from "@codemirror/view";

import { searchString, getLanguageName, getLanguageIcon, isExcluded, createContainer, createWrapper, createCodeblockLang, createCodeblockIcon, createFileName } from "./Utils";

function defaultFold(state: EditorState, settings: CodeblockCustomizerSettings) {
  let CollapseStart = null;
  let CollapseEnd = null;
  let Fold = false;
  let blockFound = false;
  let bExclude = false;
  const builder = new RangeSetBuilder<Decoration>();
  for (let i = 1; i < state.doc.lines; i++) {
    const lineText = state.doc.line(i).text.toString();
    const line = state.doc.line(i);
    bExclude = isExcluded(lineText, settings.ExcludeLangs);
    if (lineText.startsWith('```') && lineText.indexOf('```', 3) === -1) {
      if (bExclude)
        continue;
      if (CollapseStart === null) {
        Fold = searchString(lineText, "fold");
        if (Fold)
          CollapseStart = line.from;
      } else {
        blockFound = true;
        CollapseEnd = line.to;
      }
    }

    if (blockFound) {
        if (CollapseStart != null && CollapseEnd != null ){            
          const decoration = Decoration.replace({ effect: Collapse.of([doFold.range(CollapseStart, CollapseEnd)]), block:true, side:-1 });
          builder.add(CollapseStart, CollapseEnd, decoration );
          CollapseStart = null;
          CollapseEnd = null;
        }
      blockFound = false;
    }
  }// for
  
  return builder.finish();
}// defaultFold

let settings: CodeblockCustomizerSettings;
export const codeblockHeader = StateField.define<DecorationSet>({
  create(state): DecorationSet {
    return Decoration.none;    
  },
  update(oldState: DecorationSet, transaction: Transaction): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();
    let WidgetStart = null;
    let Fold = false;
    let fileName = null;
    let bExclude = false;
    for (let i = 1; i < transaction.state.doc.lines; i++) {
      bExclude = false;
      const lineText = transaction.state.doc.line(i).text.toString();
      const line = transaction.state.doc.line(i);
      const lang = searchString(lineText, "```");      
      bExclude = isExcluded(lineText, this.settings.ExcludeLangs);
      if (lineText.startsWith('```') && lineText.indexOf('```', 3) === -1) {
        if (WidgetStart === null) {
          WidgetStart = line;
          fileName = searchString(lineText, "file:");
          Fold = searchString(lineText, "fold");
          const metaInfo = {color: this.settings.header.color, textColor: this.settings.header.textColor, lineColor: this.settings.header.lineColor, 
            codeBlockLangColor: this.settings.header.codeBlockLangColor, codeBlockLangBackgroundColor: this.settings.header.codeBlockLangBackgroundColor,
            bCodeblockLangBold: this.settings.header.bCodeblockLangBold, bCodeblockLangItalic: this.settings.header.bCodeblockLangItalic, bHeaderBold: this.settings.header.bHeaderBold,
            bHeaderItalic: this.settings.header.bHeaderItalic};            
          const [retVal, Text] = shouldAddWidget(bExclude, fileName, lang, Fold, this.settings);
          if (retVal) {
            builder.add(WidgetStart.from, WidgetStart.from, createDecorationWidget(Text, getLanguageName(lang), metaInfo, this.settings.bDisplayCodeBlockLanguage, this.settings.bDisplayCodeBlockIcon));
            //EditorView.requestMeasure;
          }
        } else {
          WidgetStart = null;
          Fold = false;
          fileName = null;
        }
      }
    }
  
    return builder.finish();
  },
  provide(field: StateField<DecorationSet>): Extension {
    return EditorView.decorations.from(field);
  },
});// codeblockHeader

function shouldAddWidget(bExclude: boolean, fileName: string | null, codeblockLanguage: string | null, fold: boolean, settings: any): [boolean, string] {
  if (!bExclude && fileName !== null && fileName !== "") {
    // filename is defined
    return [true, fileName];
  } else if (!bExclude && fold) {
    // filename is not defined, but fold is!
    return [true, 'Collapsed code'];
  } else if (!bExclude && settings.bDisplayCodeBlockLanguage && settings.header.bAlwaysDisplayCodeblockLang && codeblockLanguage ) {
    // always display codeblock language is enabled
    return [true, ''];
  } else if (!bExclude && settings.bDisplayCodeBlockIcon && settings.header.bAlwaysDisplayCodeblockIcon && getLanguageIcon(getLanguageName(codeblockLanguage)) && codeblockLanguage ) {
    // always display codeblock language icon is enabled
    return [true, ''];
  }
  return [false, ''];
}// shouldAddWidget

function createDecorationWidget(textToDisplay: string, languageName: string, metaInfo: any, bDisplayCodeBlockLanguage: boolean, bDisplayCodeBlockIcon: boolean) {
  return Decoration.widget({ 
    widget: new TextAboveCodeblockWidget(textToDisplay, languageName, metaInfo, bDisplayCodeBlockLanguage, bDisplayCodeBlockIcon), block: true});
}// createDecorationWidget

const Collapse = StateEffect.define(), UnCollapse = StateEffect.define()

let pluginSettings: CodeblockCustomizerSettings;
export const collapseField = StateField.define({  
  create(state) {
    return defaultFold(state, collapseField.pluginSettings);
    //return Decoration.none   
  },
  update(value, tr) {
    value = value.map(tr.changes)
    for (const effect of tr.effects) {
      if (effect.is(Collapse))
        value = value.update({add: effect.value, sort: true});
      else if (effect.is(UnCollapse)) 
        value = value.update({filter: effect.value});
    }
    return value;
  },
  provide: f => EditorView.decorations.from(f)
})

const doFold = Decoration.replace({block: true});

class TextAboveCodeblockWidget extends WidgetType {
  text: string;
  observer: MutationObserver;
  view: EditorView;

  constructor(text: string, Lang: string, Header: CodeBlockMeta, bDisplayCodeBlockLanguage: boolean, bDisplayCodeBlockIcon: boolean) {
    super();
    this.text = text;    
    this.Lang = Lang;
    this.Header = Header;
    this.bDisplayCodeBlockLanguage = bDisplayCodeBlockLanguage;
    this.bDisplayCodeBlockIcon = bDisplayCodeBlockIcon;
    this.observer = new MutationObserver(this.handleMutation);    
  }
  
  handleMutation = (mutations, view) => {
    mutations.forEach(mutation => {
      if (mutation.target.hasAttribute("data-clicked")){
        handleClick(this.view, mutation.target);        
        //this.view.update([]);
        //this.view.state.update();
        //EditorView.requestMeasure;
      }
    });
    //this.view.update([]);
    //this.view.state.update();
    //this.view.requestMeasure();
  }
    
  eq(other: TextAboveCodeblockWidget) {
  return other.text == this.text && other.Lang == this.Lang &&
  other.Header.color == this.Header.color && other.Header.lineColor == this.Header.lineColor && 
  other.Header.textColor == this.Header.textColor && other.Header.codeBlockLangBackgroundColor == this.Header.codeBlockLangBackgroundColor && 
  other.Header.codeBlockLangColor == this.Header.codeBlockLangColor && other.bDisplayCodeBlockLanguage == this.bDisplayCodeBlockLanguage &&
  other.Header.bCodeblockLangBold == this.Header.bCodeblockLangBold && other.Header.bCodeblockLangItalic == this.Header.bCodeblockLangItalic &&
  other.Header.bHeaderBold == this.Header.bHeaderBold && other.Header.bHeaderItalic == this.Header.bHeaderItalic && 
  other.bDisplayCodeBlockIcon == this.bDisplayCodeBlockIcon}
    
  toDOM(view: EditorView): HTMLElement {
    this.view = view;
    const container = createContainer(false);
    const wrapper = createWrapper();
    if (this.Lang && this.bDisplayCodeBlockIcon){
      const Icon = getLanguageIcon(this.Lang)
      if (Icon) {
        wrapper.appendChild(createCodeblockIcon(this.Lang, this.bDisplayCodeBlockLanguage));
      }
    }
    if (this.Lang && this.bDisplayCodeBlockLanguage){
      wrapper.appendChild(createCodeblockLang(this.Lang));
    }

    wrapper.appendChild(createFileName(this.text));   
    container.appendChild(wrapper);
    
    this.observer.view = view;
    this.observer.observe(container, { attributes: true });   
    
    container.addEventListener("mousedown", event => {
      container.setAttribute("data-clicked", "true");
    });
    //EditorView.requestMeasure;

    return container;
  }
      
  destroy(dom: HTMLElement) {
    dom.removeAttribute("data-clicked");
    dom.removeEventListener("mousedown", handleClick);
    this.observer.disconnect();
  }

  ignoreEvent() { return false; }
  
}// TextAboveCodeblockWidget
  
export function handleClick(view: EditorView, target: HTMLElement){
  //view.state.update();
  //view.update([]);
  //view.requestMeasure({});  
  const Pos = view.posAtDOM(target);

  const effect = view.state.field(collapseField, false);
  let isFolded = false;
  effect.between(Pos, Pos, () => { isFolded = true});
  
  let CollapseStart: number | null = null;
  let CollapseEnd: number | null = null;
  let WidgetStart: number | null = null;
  // NOTE: Can't use for loop over view.visibleRanges, because that way the closing backticks wouldn't be found and collapse would not be possible
  let blockFound = false;
  for (let i = 1; i < view.state.doc.lines; i++) {
    const lineText = view.state.doc.line(i).text.toString();
    const line = view.state.doc.line(i);
    if (lineText.startsWith('```') && lineText.indexOf('```', 3) === -1) {
      if (WidgetStart === null) {
        WidgetStart = line.from;
        if (Pos === line.from){
            CollapseStart = line.from;
        }
      } else {
        blockFound = true;
        CollapseEnd = line.to;
      }
    }
    
    if (blockFound) {
      if (CollapseStart != null && CollapseEnd != null ){
        if (isFolded){
          view.dispatch({ effects: UnCollapse.of((from, to) => to <= CollapseStart || from >= CollapseEnd) });
        }
        else {
          view.dispatch({ effects: Collapse.of([doFold.range(CollapseStart, CollapseEnd)]) });
        }
        view.requestMeasure();
        CollapseStart = null;
        CollapseEnd = null;
      }//if (CollapseStart
      WidgetStart = null;
      blockFound = false;
    }
  }// for
}// handleClick