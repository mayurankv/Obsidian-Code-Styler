export interface CodeblockCustomizerSettings {
  bEnableLineNumbers: boolean;
  bActiveCodeblockLineHighlight: boolean;
  bActiveLineHighlight: boolean;
  bGutterHighlight: boolean;
  ExcludeLangs: string;
  activeCodeBlockLineColor: string;
  activeLineColor: string;
  backgroundColor: string;
  highlightColor: string;
  gutterTextColor: string;
  gutterBackgroundColor: string;
  ThemeName: string;
  SelectedTheme: string;
  colorThemes: Array<{name: string, colors: CodeblockCustomizerColors}>;
  alternateColors: Array<{name: string, currentColor: string, darkColor: string, lightColor: string}>;
  bDisplayCodeBlockLanguage: boolean;
  bDisplayCodeBlockIcon: boolean;
  headerSettings: {
    bHeaderBold: boolean;
    bHeaderItalic: boolean;
    bCodeblockLangBold: boolean;
    bCodeblockLangItalic: boolean;
    bAlwaysDisplayCodeblockLang: boolean;
    bAlwaysDisplayCodeblockIcon: boolean;
    bDefaultDarkTheme: boolean;
    bDefaultLightTheme: boolean;
    headerColor: string;
    headerTextColor: string;
    headerLineColor: string;    
    codeBlockLangColor: string;
    codeBlockLangBackgroundColor: string;
  }
}

interface CodeblockCustomizerColors {
  activeCodeBlockLineColor: string;
  activeLineColor: string;
  backgroundColor: string;
  highlightColor: string;
  headerColor: string;
  headerTextColor: string;
  headerLineColor: string;
  gutterTextColor: string;
  gutterBackgroundColor: string;
  codeBlockLangColor: string;
  codeBlockLangBackgroundColor: string;
}

// dark
export const D_ACTIVE_CODEBLOCK_LINE_COLOR = '#073642';
export const D_ACTIVE_LINE_COLOR = '#468eeb33';
export const D_BACKGROUND_COLOR = '#002B36';
export const D_HIGHLIGHT_COLOR = '#054b5c';
export const D_HEADER_COLOR = '#0a4554';
export const D_HEADER_TEXT_COLOR = '#DADADA';
export const D_HEADER_LINE_COLOR = '#46cced';
export const D_GUTTER_TEXT_COLOR = '#6c6c6c';
export const D_GUTTER_BACKGROUND_COLOR = '#073642';
export const D_LANG_COLOR = '#000000';
export const D_LANG_BACKGROUND_COLOR = '#008080';

// light
export const L_ACTIVE_CODEBLOCK_LINE_COLOR = '#EDE8D6';
export const L_ACTIVE_LINE_COLOR = '#60460633';
export const L_BACKGROUND_COLOR = '#FCF6E4';
export const L_HIGHLIGHT_COLOR = '#E9DFBA';
export const L_HEADER_COLOR = '#D5CCB4';
export const L_HEADER_TEXT_COLOR = '#866704';
export const L_HEADER_LINE_COLOR = '#EDD489';
export const L_GUTTER_TEXT_COLOR = '#6c6c6c';
export const L_GUTTER_BACKGROUND_COLOR = '#EDE8D6';
export const L_LANG_COLOR = '#C25F30';
export const L_LANG_BACKGROUND_COLOR = '#B8B5AA';

export const DEFAULT_SETTINGS: CodeblockCustomizerSettings = {
  bEnableLineNumbers: true,
  bActiveCodeblockLineHighlight: true,
  bActiveLineHighlight: true,
  bGutterHighlight: false,
  ExcludeLangs: "dataview",
  activeCodeBlockLineColor: D_ACTIVE_CODEBLOCK_LINE_COLOR,
  activeLineColor: D_ACTIVE_LINE_COLOR,
  backgroundColor: D_BACKGROUND_COLOR,
  highlightColor: D_HIGHLIGHT_COLOR,
  bDisplayCodeBlockLanguage: true,
  bDisplayCodeBlockIcon: false,
  gutterTextColor: D_GUTTER_TEXT_COLOR,
  gutterBackgroundColor: D_GUTTER_BACKGROUND_COLOR,
  SelectedTheme: "",
  header: {
    bHeaderBold: false,
    bHeaderItalic: false,
    bCodeblockLangBold: true,
    bCodeblockLangItalic: true,
    bAlwaysDisplayCodeblockLang: false,
    bAlwaysDisplayCodeblockIcon: false,
    bDefaultDarkTheme: false,
    bDefaultLightTheme: false,
    color: D_HEADER_COLOR,
    textColor: D_HEADER_TEXT_COLOR,
    lineColor: D_HEADER_LINE_COLOR,
    codeBlockLangColor: D_LANG_COLOR,
    codeBlockLangBackgroundColor: D_LANG_BACKGROUND_COLOR
  },
  colorThemes: 
  [
    {
      name: "Dark Theme",
      colors: {
        activeCodeBlockLineColor: D_ACTIVE_CODEBLOCK_LINE_COLOR,
        activeLineColor: D_ACTIVE_LINE_COLOR,
        backgroundColor: D_BACKGROUND_COLOR,
        highlightColor: D_HIGHLIGHT_COLOR,
        gutterTextColor: D_GUTTER_TEXT_COLOR,
        gutterBackgroundColor: D_GUTTER_BACKGROUND_COLOR,
        header: {
          bHeaderBold: false,
          bHeaderItalic: false,
          bCodeblockLangBold: true,
          bCodeblockLangItalic: true,
          bAlwaysDisplayCodeblockLang: false,
          bAlwaysDisplayCodeblockIcon: false,
          bDefaultDarkTheme: true,
          bDefaultLightTheme: false,
          color: D_HEADER_COLOR,
          textColor: D_HEADER_TEXT_COLOR,
          lineColor: D_HEADER_LINE_COLOR,
          codeBlockLangColor: D_LANG_COLOR,
          codeBlockLangBackgroundColor: D_LANG_BACKGROUND_COLOR
        },
      }
    },
    {
      name: "Light Theme",
      colors: {
        activeCodeBlockLineColor: L_ACTIVE_CODEBLOCK_LINE_COLOR,
        activeLineColor: L_ACTIVE_LINE_COLOR,
        backgroundColor: L_BACKGROUND_COLOR,
        highlightColor: L_HIGHLIGHT_COLOR,
        gutterTextColor: L_GUTTER_TEXT_COLOR,
        gutterBackgroundColor: L_GUTTER_BACKGROUND_COLOR,
        header: {
          bHeaderBold: false,
          bHeaderItalic: false,
          bCodeblockLangBold: true,
          bCodeblockLangItalic: true,
          bAlwaysDisplayCodeblockLang: false,
          bAlwaysDisplayCodeblockIcon: false,
          bDefaultDarkTheme: false,
          bDefaultLightTheme: true,
          color: L_HEADER_COLOR,
          textColor: L_HEADER_TEXT_COLOR,
          lineColor: L_HEADER_LINE_COLOR,
          codeBlockLangColor: L_LANG_COLOR,
          codeBlockLangBackgroundColor: L_LANG_BACKGROUND_COLOR
        },        
      }
    }
  ],
  alternateColors:
  [
  ]
}
