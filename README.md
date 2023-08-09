# Code Styler Plugin

[![Release](https://img.shields.io/github/v/release/mayurankv/Obsidian-Code-Styler?style=for-the-badge)](https://github.com/mayurankv/Obsidian-Code-Styler/releases/latest)
[![Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&style=for-the-badge&query=%24%5B%22code-styler%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)](https://obsidian.md/plugins?id=code-styler)

This is a plugin for [Obsidian.md](https://obsidian.md) which lets you style codeblocks and inline code in both editing mode and reading mode.

<!--
> **Warning**  
> If you used version 1.1.9 or below, then you must delete the `data.json` file from `VaultFolder/.obsidian/plugins/code-styler/`. This only needs to happen once but is necessary as the file does not contain a few entries which are required by version 2.0.0 or above. After that, everything should work fine.
-->

## Settings

### Excluded Codeblocks

The plugin can be set to ignore certain codeblocks completely (for example if another plugin uses them like the `dataview` codeblocks). These are set in settings as a comma separated list. The wildcard \* operator can also be used to match languages such as 'ad-*' to match admonitions.

This setting is used to tell the plugin which codeblocks it can ignore completely as opposed to just not decorating the codeblock. To not decorate a codeblock, use the [excluded languages setting](#excluded-languages).

> **Note**  
> Setting excluded codeblocks for codeblocks used by other plugins you use is important as otherwise, the plugin does not know which codeblocks to ignore in certain cases.

### Excluded Languages

The plugin can be set to ignore certain languages (for example if you want `python` codeblocks to not be decorated). These are set in settings as a comma separated list. The wildcard \* operator can also be used to match languages such as 'ad-*' to match admonitions.

This setting is used to tell the plugin to not decorate certain languages. To completely ignore a codeblock (i.e. a codeblock which doesn't generate a rendered codeblock in reading mode as a result of a plugin), use the [excluded codeblocks setting](#excluded-codeblocks).

### Themes

The plugin comes with a 'Default' theme and a few themes based on popular colour schemes. The default theme uses colours as defined by the existing Obsidian theme to minimise changes in appearance on install (it uses the CSS variables defined by the current theme).

All themes have customisable colours for both light and dark mode (to make changes to a specific mode, change to that mode first and then change the colours in settings). Each theme also includes other appearance settings such as displaying line numbers, allowing highlights to cover the line numbers and more.

When a setting or colour is changed within a theme, that change is not saved to the theme; you must then click the update button next to the theme name to update that theme to the current settings. Note that changes to the built-in themes cannot be saved.

The different component colours that can be set within a theme are:

- Codeblock background colour
- Codeblock text colour
- Line number gutter background colour
- Line number text colour
- Codeblock line number current line indicator
- Codeblock header background colour
- Codeblock header title text colour
- Codeblock header separator colour
- Codeblock header language tag background colour
- Codeblock header language tag text colour
- Editor active line highlight colour
- Codeblock active line highlight colour
- Default highlight colour
- Alternative highlight colours
- Button colour
- Button active colour

'Default' theme colours in dark mode with Default Obsidian theme:

![Default Default Dark Colours](images/DefaultDefaultDarkColours.png)

'Default' theme colours in light mode with Default Obsidian theme:

![Default Default Light Colours](images/DefaultDefaultLightColours.png)

'Default' theme colours in dark mode with [Obsidianite](https://github.com/bennyxguo/Obsidian-Obsidianite) theme:

![Default Obsidianite Dark Colours](images/DefaultObsidianiteDarkColours.png)

'Solarized' theme colours in dark mode with Default Obsidian theme:

![Solarized Default Dark Colours](images/SolarizedDefaultDarkColours.png)

I am not a designer, so if you have created a cool theme, send me the colour codes, and I might include it as a default theme in the next release :-\)

## Codeblock Parameters

Codeblock parameters are added to the first line of the codeblock following the language. They can be added in any order. If no language is set, a space should be left after the codeblock delimiter ` ``` ` to indicate that the first parameter is NOT the language of the codeblock.

Example:

- ` ```cpp fold title:example_title`
- ` ```cpp title:example_title fold` (same effect as above line)
- ` ``` fold title:example_title` (if no language set)

### Line Numbers

Line numbers can be enabled/disabled within a specific theme in the settings of that theme. In addition to this, whether line numbering is applied can be additionally specified in a codeblock itself using the `ln` parameter.

Setting `ln:true` will always show line numbering, `ln:false` will never show line numbering, and `ln:NUMBER` (e.g.`ln:27`) will always show line numbering starting at the specified number (so an offset of this number minus one).

### Title

To display a title for a codeblock specify `title:` followed by a title in the first line of the codeblock. If the title contains spaces, specify it between `""` or `''` e.g.: `title:"long filename.cpp"`.

Example:

` ```cpp title:test.cpp`

![Title Short](images/TitleShort.png)

` ```cpp title:"long filename.cpp"`

![Title Long](images/TitleLong.png)

### Folding

To specify an initial fold state when the document is opened, use the `fold` parameter. If `fold` is set in a codeblock, then when you open the document, the codeblock will be automatically collapsed, and only the header will be displayed. You can unfold the codeblock by clicking on the header.

Clicking on any header will toggle the fold for that codeblock.

When no `title` parameter is set, the folded codeblock will have a default fold placeholder title. This can be changed in settings, or it can be changed for a specific parameter by setting a string after the fold parameter as in `fold:Folded` or `fold:"Collapsed Codeblock"`.

Example:

` ```cpp fold`

![Fold](images/Fold.png)

` ```cpp fold:"This is collapsed"`

![Fold Placeholder](images/FoldPlaceholder.png)

Clicking on header
![Collapse](images/Collapse.gif)

### Highlighting

To highlight lines, specify `hl:` followed by line numbers, plain text or regular expressions in the first line of the codeblock.

You can specify any of the following highlight types separated with commas (**without spaces**) e.g.: `hl:1,3-4,foo,'bar baz',"bar and baz",/#\w{6}/`.

- Single numbers: `hl:1` would highlight the first line
- Number ranges: `hl:1-3` would highlight lines 1 through to 3
- Plain text: `hl:foo` would highlight lines with the word `foo` inside them
- Plain text in speech marks or quotation marks: `hl:'bar baz'` or `hl:"bar baz"` would highlight lines with the word `bar baz` inside them
- Regular Expressions: `hl:/#\w{6}/` would highlight lines which match this regular expression (tested by `regex.test(line)`) - for this example any lines with hexadecimal colours are highlighted

Combinations of these will highlight all relevant lines.

Example:
` ```cpp hl:1,3-4,foo,'bar baz',"bar and baz",/#\w{6}/`

![Default Highlight](images/DefaultHighlight.png)

Highlights can be set to also highlight line numbers as well as the code in settings.

Example:
![Default Highlight Gutter](images/DefaultHighlightGutter.png)

Highlights created by the default highlight parameter or alternative highlight parameters can be set to appear as gradient highlights which fade out to the right in the settings. A colour stop percentage for this gradient can also be set.

Example:
![Default Highlight Gradient](images/DefaultHighlightGradient.png)

#### Alternative Highlights

You can also define multiple highlight colours by defining an alternative highlight colour with a name. This name will be used as a parameter, and you can use it just like with the `hl` parameter.

Example:

You could add three further types of highlight colours (`info`, `warn`, `error`). After adding these in settings and setting colours as desired, you can use it in the first line of codeblocks:

` ```cpp info:2 warn:4-6 error:8`

![Alternative Highlights](images/AlternativeHighlights.png)

Corresponding settings:

![Alternative Highlights](images/AlternativeHighlightsSettings.png)

### Unwrap

Whether lines wrap or note can be set in the settings. There is an advanced option called "Wrap Lines on Click" where holding the mouse down on a codeblock's content will cause the content to be wrapped (if line unwrapping is already set in the settings).

These settings can also be set on a per codeblock basis using the `unwrap` parameter which overrides the settings. Setting `unwrap:true` will unwrap lines in the codeblock, setting `unwrap:false` will wrap lines in the codeblock, and setting `unwrap:inactive` will unwrap lines in the codeblock but will wrap them when the mouse is held down on the codeblock. The parameter `wrap` is just an alias for `unwrap:false` and `unwrap` is just an alias for `unwrap:true`.

Example:

` ```python unwrap:true` or ` ```python unwrap`
![Unwrap True](images/UnwrapTrue.gif)

` ```python unwrap:false` or ` ```python wrap`
![Unwrap False](images/UnwrapFalse.png)

` ```python unwrap:inactive`
![Unwrap Inactive](images/UnwrapInactive.gif)

### Ignore

In addition to excluding the language, the plugin can be told to not apply to a specific codeblock by including the `ignore` parameter.

The plugin can further be told to not apply to a specific file by adding `code-styler-ignore: true` to the frontmatter of the note.

Example:

` ```cpp ignore`
![Ignore](images/Ignore.png)

`code-styler-ignore: true`
![Ignore Metadata](images/IgnoreMetadata.png)

## Appearance

### Codeblock

Codeblocks can have their curvature changed in settings to make them appear more or less rounded.

They can also have coloured left borders based on the language (colours match the language icon) if enabled in settings. The width of this border can also be changed.

Example:

![Language Border](images/LanguageBorder.png)

### Header

The header is displayed in the following cases:

- You specified a `title:`
- You specified `fold` If you specified `fold` but did not specify `title:` or `fold:` a default text from settings will be displayed on the header (the default is 'Collapsed Code')
- You defined a codeblock language via ` ```language` and set the `Display Header Language Tags` setting to `Always` or the `Display Header Language Icons` setting to `Always` in the theme settings

If the header is displayed, folding works as well. If the `Display Header Language Tags` setting is set to `Always`, then the header will display the codeblock language always and if it is set to `If Header Shown`, it will only display when the header is displayed (i.e. the `title` parameter is set).

You can enable the option in the settings page to display icons in the header. When this option is set to `If Header Shown`, if the language specified in the codeblock has an icon and the codeblock header is displayed (i.e. the `title` parameter is set), then the icon will be displayed. When this option is set to `Always`, the header with icon will always be shown if the language specified in the codeblock has an icon. Icons can also be set to grayscale or resized in settings. There are currently around 170 icons available for different languages.

The language tag text and title text can also be styled to be bold and/or italic as well as a specific font. Furthermore, the font-size of the header text can be changed.

Example:

- No header
![Header None](images/HeaderNone.png)

- Header with fold only
![Header Fold](images/HeaderFold.png)

- Header with codeblock language only
![Header Language](images/HeaderLanguage.png)

- Header with codeblock language and title as well
![Header Language Title](images/HeaderLanguageTitle.png)

- Header with codeblock language, title and icon as well
![Header Language Title Icon](images/HeaderLanguageTitleIcon.png)

### Active Line Indicators

The active line inside codeblocks can be highlighted with a custom colour if enabled in settings. It can also be indicated by a different colour line number if this setting is also enabled in settings.

The active line outside codeblocks can also be highlighted with a custom colour if enabled in settings.

Example:
![Active Codeblock Highlight](images/ActiveCodeblockHighlight.png)

![Active Line Number Indicator](images/ActiveLineNumberIndicator.png)

![Active Editor Highlight](images/ActiveEditorHighlight.png)

## Inline Code

Inline code can be customised as well with background color, text color, text color whilst being edited, font weight, spacing around the inline code and curvature of the inline code all being customisable from the settings.

Inline code can also have syntax highlighting in both editing mode and reading mode with the same highlighting style as in codeblocks. This is set by using the syntax `{language} code here` (note the space between `{language}` and `code here` is not necessary).

You can type the text `{text here not styled}` as inline code as well by prefacing it by an empty `{}` when the plugin is active: `{}{text here not styled}` will produce `{text here not styled}` when the cursor is outside the inline code.

Example:

`{python} 'result if true'.method() if 1 else result_if_false.property`
![Inline Code Highlighted](images/InlineCodeHighlighted.png)

You can also set a title and/or display an icon before the inline code using the parameters `title:` and `icon` following the language. `title` can take multiple words in quotation marks or speech marks.

Example:

`{python icon} 'result if true'.method() if 1 else result_if_false.property`
![Inline Code Highlighted Icon](images/InlineCodeHighlightedIcon.png)

`{python title:'Inline If'} 'result if true'.method() if 1 else result_if_false.property`
![Inline Code Highlighted Title](images/InlineCodeHighlightedTitle.png)

`{python title:'Inline If' icon} 'result if true'.method() if 1 else result_if_false.property`
![Inline Code Highlighted Title Icon](images/InlineCodeHighlightedTitleIcon.png)

## Plugin Compatibility

This plugin is also compatible with the following obsidian plugins out of the box:

[![Execute Code Plugin](https://github-readme-stats.vercel.app/api/pin/?username=twibiral&repo=obsidian-execute-code&show_owner=true&bg_color=00000010&border_color=e3e7ef)](https://github.com/twibiral/obsidian-execute-code)
[![Code Preview Plugin](https://github-readme-stats.vercel.app/api/pin/?username=zjhcn&repo=obsidian-code-preview&show_owner=true&bg_color=00000010&border_color=e3e7ef)](https://github.com/zjhcn/obsidian-code-preview)
[![Code Preview Plugin](https://github-readme-stats.vercel.app/api/pin/?username=tillahoffmann&repo=obsidian-file-include&show_owner=true&bg_color=00000010&border_color=e3e7ef)](https://github.com/tillahoffmann/obsidian-file-include)
[![Admonitions Plugin](https://github-readme-stats.vercel.app/api/pin/?username=javalent&repo=admonitions&show_owner=true&bg_color=00000010&border_color=e3e7ef)](https://github.com/javalent/admonitions)

## Roadmap

See the roadmap at [Roadmap Discussion](../../discussions/8).

## How to install the plugin

- Simply install directly from Obsidian
- Alternatively you can just copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/code-styler/` or use the [Obsidian Beta Reviewers Plugin](https://github.com/TfTHacker/obsidian42-brat).

## Contributions

All contributions are welcome, just create a merge request. The bullet points in the [roadmap](../../discussions/8) are a good place to start!

Please try to create bug reports/issues that are:

- **Reproducible**: Include steps to recreate the issue
- **Specific**: Include relevant details such as possible plugin conflicts, theme conflicts etc.
- **Unique**: Please do not duplicate existing open issues, add to the existing issue
- **Scoped**: Please create a separate issue for each bug you've identified

### Maintainers

- [@mayurankv](https://github.com/mayurankv)

### Contributors

[![List of contributors](https://contrib.rocks/image?repo=mayurankv/Obsidian-Code-Styler)](https://github.com/mayurankv/Obsidian-Code-Styler/graphs/contributors)

*Made with [contrib.rocks](https://contrib.rocks).*

This plugin is based on the [Codeblock Customizer Plugin](https://github.com/mugiwara85/CodeblockCustomizer) by [@mugiwara85](https://github.com/mugiwara85).

## Support

If you like this plugin, and would like to help support continued development, use the button below!

[![Buy me a coffee](https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee%20&emoji=&slug=mayurankv2&button_colour=e3e7ef&font_colour=262626&font_family=Inter&outline_colour=262626&coffee_colour=a0522d)](https://www.buymeacoffee.com/mayurankv2)

## License

Distributed under the MIT License. See `LICENSE` for more information.
