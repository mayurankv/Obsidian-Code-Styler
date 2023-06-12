// Color Typing
type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;
type CSS = `var(--${string})`;
type Color = HEX | RGB | RGBA | CSS;
type Display = "none" | "title_only" | "always";

// Interface Creation
export interface CodeblockCustomizerThemeModeColors {
  codeblock: {
    backgroundColor?: Color;
    textColor?: Color;
  },
  gutter: {
    backgroundColor?: Color;
    textColor?: Color;
  },
  header: {
    backgroundColor?: Color;
    file: {
      textColor?: Color;
    },
    languageTag: {
      backgroundColor?: Color;
      textColor?: Color;
    },
    lineColor?: Color;
  },
  highlights: {
    activeCodeblockLineColor?: Color;
    activeEditorLineColor?: Color;
    defaultColor?: Color;
    alternativeHighlights: Record<string,Color>;
  },
}
export interface CodeblockCustomizerThemeSettings {
  codeblock: {
    lineNumbers: boolean;
  },
  gutter: {
    highlight: boolean;
  },
  header: {
    title: {
      textFont?: string;
      textBold: boolean;
      textItalic: boolean;
    },
    languageTag: {
      display: Display;
      textFont?: string;
      textBold: boolean;
      textItalic: boolean;
    },
    languageIcon: {
      display: Display;
      displayColor: boolean;
    },
  },
  highlights: {
    activeCodeblockLine: boolean;
    activeEditorLine: boolean;
  },
  advanced: {
    gradientHighlights: boolean;
    languageBorderColor: boolean;
    iconSize: number;
  };
}
export interface CodeblockCustomizerThemeColors {
  light: CodeblockCustomizerThemeModeColors;
  dark: CodeblockCustomizerThemeModeColors;
}
export interface CodeblockCustomizerTheme {
  settings: CodeblockCustomizerThemeSettings;
  colors: CodeblockCustomizerThemeColors;
}
export interface CodeblockCustomizerSettings {
  selectedTheme: string;
  defaultTheme: string;
  currentTheme: CodeblockCustomizerTheme;
  newTheme: {
    name: string;
    default: boolean;
  },
  themes: Record<string,CodeblockCustomizerTheme>;
  excludedLangs: string;
}

// Theme Defaults
const THEME_DEFAULT_SETTINGS: CodeblockCustomizerThemeSettings = {
  codeblock: {
    lineNumbers: true,
  },
  gutter: {
    highlight: true,
  },
  header: {
    title: {
      textBold: false,
      textItalic: false,
    },
    languageTag: {
      display: "always",
      textBold: true,
      textItalic: true,
    },
    languageIcon: {
      display: "always",
      displayColor: true,
    },
  },
  highlights: {
    activeCodeblockLine: true,
    activeEditorLine: false,
  },
  advanced: {
    gradientHighlights: false,
    languageBorderColor: false,
    iconSize: 28,
  },
}
export const NEW_THEME_DEFAULT: {name: string, default: boolean} = {
  name: '',
  default: false,
}
export const THEME_FALLBACK_COLORS: CodeblockCustomizerThemeModeColors = {
  codeblock: {
    backgroundColor: 'var(--code-background)',
    textColor: 'var(--code-normal)',
  },
  gutter: {
    backgroundColor: 'var(--code-background)',
    textColor: 'var(--code-comment)',
  },
  header: {
    backgroundColor: 'var(--code-background)',
    file: {
      textColor: 'var(--code-comment)',
    },
    languageTag: {
      backgroundColor: 'var(--code-background)',
      textColor: 'var(--code-comment)',
    },
    lineColor: 'var(--code-background)',
  },
  highlights: {
    activeCodeblockLineColor: 'var(--color-base-30)',
    activeEditorLineColor: 'var(--color-base-20)',
    defaultColor: 'var(--text-highlight-bg)',
    alternativeHighlights: {},
  },
}

// Theme Creation
const DEFAULT_THEME = {
  settings: THEME_DEFAULT_SETTINGS,
  colors: {
    light: {
      codeblock: {},
      gutter: {},
      header: {
        file: {},
        languageTag: {},
      },
      highlights: {
        alternativeHighlights: {},
      },
    },
    dark: {
      codeblock: {},
      gutter: {},
      header: {
        file: {},
        languageTag: {},
      },
      highlights: {
        alternativeHighlights: {},
      },
    },
  },
}
const SOLARIZED_THEME: CodeblockCustomizerTheme = {
  settings: THEME_DEFAULT_SETTINGS,
  colors: {
    light: {
      codeblock: {
        backgroundColor: '#FCF6E4',
        textColor: '#bababa',
      },
      gutter: {
        backgroundColor: '#EDE8D6',
        textColor: '#6c6c6c',
      },
      header: {
        backgroundColor: '#D5CCB4',
        file: {
          textColor: '#866704',
        },
        languageTag: {
          backgroundColor: '#B8B5AA',
          textColor: '#C25F30',
        },
        lineColor: '#EDD489',
      },
      highlights: {
        activeCodeblockLineColor: '#EDE8D6',
        activeEditorLineColor: '#60460633',
        defaultColor: '#E9DFBA',
        alternativeHighlights: {},
      },
    },
    dark: {
      codeblock: {
        backgroundColor: '#002b36',
        textColor: '#bababa',
      },
      gutter: {
        backgroundColor: '#073642',
        textColor: '#6c6c6c',
      },
      header: {
        backgroundColor: '#0a4554',
        file: {
          textColor: '#dadada',
        },
        languageTag: {
          backgroundColor: '#008080',
          textColor: '#000000',
        },
        lineColor: '#46cced',
      },
      highlights: {
        activeCodeblockLineColor: '#073642',
        activeEditorLineColor: '#468eeb33',
        defaultColor: '#054b5c',
        alternativeHighlights: {},
      },
    },
  },
}

// Plugin default settings
export const DEFAULT_SETTINGS: CodeblockCustomizerSettings = {
  selectedTheme: '',
  defaultTheme: 'Default',
  currentTheme: DEFAULT_THEME,
  newTheme: NEW_THEME_DEFAULT,
  themes: {
    'Default': DEFAULT_THEME,
    'Solarized': SOLARIZED_THEME,
  },
  excludedLangs: "dataview, dataviewjs, ad-*",
}
