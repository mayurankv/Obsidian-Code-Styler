# Codeblock Customizer Plugin

[![Release](https://img.shields.io/github/v/release/mugiwara85/CodeblockCustomizer?style=for-the-badge)](https://github.com/mugiwara85/CodeblockCustomizer/releases/latest)
[![Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&style=for-the-badge&query=%24%5B%22codeblock-customizer%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)](https://obsidian.md/plugins?id=codeblock-customizer)

This is a plugin for [Obsidian.md](https://obsidian.md).

I couldn't find any plugin, where I could customize codeblocks which works reliably and in both editing and reading mode so I created my own.

This plugin lets you customize the codeblocks in the following way in both editing mode and reading mode:

TODO Section

- Default dark and light theme. You can create your own themes as well.
- Enable editor active line highlight. The active line in Obsidian (including codeblocks) will be highlighted (you can customize the color).
- Enable codeblock active line highlight. The active line inside a codeblock will be highlighted (you can customize the color).
- Exclude languages. You can define languages separated by a comma, to which the plugin will not apply.
- Set background color for codeblocks.
- Lets you highlight specific lines.
  - Customize highlight color
- Lets you define multiple highlight colors to highlight lines.
- Display filename
  - If a filename is defined a header will be inserted, where it is possible to customize the text (color, bold, italic), and the header (color, header line) itself as well
- Fold code
  - If the header is displayed (either by defining filename or other way explained below), you can click on the header to fold the codeblock below it
- Display codeblock language. This displays the language (if specified) of the codeblock in the header.
  - Customize text color, background color, bold text, italic text for the language tag inside the header.
  - By default the language tag is only displayed, if the header is displayed, and a if a language is defined for a codeblock. You can however force, to always display the codeblock language, even if the header would not be displayed.
- Display codeblock language icon (if available for the specified language) in the header.
- Add line numbers to codeblocks
  - Customize if the linenumber should also be highlighted, if a line is highlighted
  - Customize background color, and color of the line numbers

## Settings

### Excluded Languages

The plugin can be set to ignore certain languages (for example if another plugin uses this codeblock language). These are set in settings as a comma separated list. The wildcard \* operator can also be used to match languages such as 'ad-*' to match admonitions.

### Themes

The plugin comes with a 'Default' theme and a few themes based on popular color schemes. The default theme uses colors as defined by the existing Obsidian theme to minimise changes in appearance on install (it uses the CSS variables defined by the current theme).

All themes have customizable colors for both light and dark mode (to make changes to a specific mode, change to that mode first and then change the colors in settings). Each theme also includes other appearance settings such as displaying line numbers, allowing highlights to cover the line numbers and more.

When a setting or color is changed within a theme, that change is not saved to the theme; you must then click the update button next to the theme name to update that theme to the current settings. Note that changes to the built-in themes cannot be saved.

The different component colors that can be set within a theme are:

- Codeblock background color
- Codeblock text color
- Line number gutter background color
- Line number text color
- Codeblock line number current line indicator
- Codeblock header background color
- Codeblock header title text color
- Codeblock header separator color
- Codeblock header language tag background color
- Codeblock header language tag text color
- Editor active line highlight color
- Codeblock active line highlight color
- Default highlight color
- Alternative highlight colors
- Button color
- Button active color

'Default' theme in dark mode with Default Obsidian theme:

![Pasted_image_20230125231644.png](attachments/Pasted_image_20230125231644.png) TODO Update image

'Default' theme in light mode with Default Obsidian theme:

![Pasted_image_20230125231735.png](attachments/Pasted_image_20230125231735.png) TODO Update image

'Default' theme in dark mode with TODO theme:

TODO Add image

I am not a designer, so if you have created a cool theme, send me the color codes, and I might include it as a default theme in the next release :-\)

## Parameters

Codeblock parameters are added to the first line of the codeblock following the language. They can be added in any order. If no language is set, a space should be left after the codeblock delimiter ` ``` ` to indicate that the first parameter is NOT the language of the codeblock.

Example:

- ` ```cpp fold title:example_title`
- ` ```cpp title:example_title fold` (same effect as above line)
- ` ``` fold title:example_title` (if no language set)

### Line Numbers

TODO Section

Line numbers can be enabled/disabled within a specific theme in the settings of that theme. In addition to this, whether line numbering is applied can be additionally specified in a codeblock itself using the `ln` parameter.

### Title

To display a title for a codeblock specify `title:` followed by a title in the first line of the codeblock. If the title contains spaces, specify it between `""` or `''` e.g.: `title:"long filename.cpp"`.

Example:

` ```cpp title:test.cpp`

![Pasted_image_20230125230351.png](attachments/Pasted_image_20230125230351.png) TODO Update image

` ```cpp title:"long filename.cpp"`

TODO Add image

### Folding

To specify an initial fold state when the document is opened, use the `fold` parameter. If `fold` is set in a codeblock, then when you open the document, the codeblock will be automatically collapsed, and only the header will be displayed. You can unfold the codeblock by clicking on the header.

When no `title` parameter is set, the folded codeblock will have a default fold placeholder title. This can be changed in settings, or it can be changed for a specific parameter by setting a string after the fold parameter as in `fold:Folded` or `fold:"Collapsed Codeblock"`.

Example:

` ```cpp fold`

![Pasted_image_20230125230928.png](attachments/Pasted_image_20230125230928.png) TODO Update image

` ```cpp fold:"This is collapsed"`

![Pasted_image_20230125230928.png](attachments/Pasted_image_20230125230928.png) TODO Update image

Clicking on header
TODO Add folding gif

### Highlighting

To highlight lines, specify `hl:` followed by line numbers in the first line of the codeblock.

- You can specify either single line numbers separated with a comma e.g.: `hl:1,3,5,7`.
- You can specify ranges e.g.: `hl:2-5` This would highlight lines from 2 to 5.
- You can also combine the methods e.g.: `hl:1,3,4-6` This would highlight lines 1, 3 and lines from 4 to 6.

Example:
` ```cpp hl:1,3,4-6`

![Pasted_image_20230125230046.png](attachments/Pasted_image_20230125230046.png) TODO Update image

Highlights can be set to also highlight line numbers as well as the code in settings.

Example:
TODO Add image

Highlights created by the default highlight parameter or alternative highlight parameters can be set to appear as gradient highlights which fade out to the right in the settings. A color stop percentage for this gradient can also be set.

Example:
TODO Add image

#### Alternative Highlights

You can also define multiple highlight colors by defining an alternative highlight color with a name. This name will be used as a parameter, and you can use it just like with the `hl` parameter.

Example:

You could add three further types of highlight colors (`info`, `warn`, `error`). After adding these in settings and setting colors as desired, you can use it in the first line of codeblocks:

` ```cpp info:2 warn:4-6 error:8`

![[Pasted_image_20230314211417.png]](attachments/Pasted_image_20230314211417.png) TODO Update image

Corresponding settings:

![[Pasted_image_20230314211256.png]](attachments/Pasted_image_20230314211256.png) TODO Update image

### Ignore

In addition to excluding the language, the plugin can be told to not apply to a specific codeblock by including the `ignore` parameter.

The plugin can further be told to not apply to a specific file by adding `codeblock-customizer-ignore: true` to the frontmatter of the note.

Example:

` ```cpp ignore`
TODO Add image

`codeblock-customizer-ignore: true`
TODO Add image

## Appearance

### Codeblock

Codeblocks can have their curvature changed in settings to make them appear more or less rounded.

They can also have colored left borders based on the language (colors match the language icon) if enabled in settings. The width of this border can also be changed.

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
TODO Add image

- Header with fold only
![Pasted_image_20230125233958.png](attachments/Pasted_image_20230125233958.png) TODO Update image

- Header with codeblock language only
![Pasted_image_20230125231233.png](attachments/Pasted_image_20230125231233.png) TODO Update image

- Header with codeblock language and title as well
![Pasted_image_20230125231356.png](attachments/Pasted_image_20230125231356.png) TODO Update image

- Header with codeblock language, title and icon as well
![[Pasted_image_20230314212111.png]](attachments/Pasted_image_20230314212111.png) TODO Update image

### Active Line Indicators

The active line inside codeblocks can be highlighted with a custom color if enabled in settings. It can also be indicated by a different color line number if this setting is also enabled in settings.

The active line outside codeblocks can also be highlighted with a custom color if enabled in settings.

Example:
TODO Add image codeblock highlight

TODO Add image codeblock line number indicator

TODO Add image editor highlight

## Plugin Compatibility

This plugin is also compatible with the following obsidian plugins out of the box:

[![Execute Code Plugin](https://github-readme-stats.vercel.app/api/pin/?username=twibiral&repo=obsidian-execute-code&show_owner=true&bg_color=00000000&border_color=e3e7ef)](https://github.com/twibiral/obsidian-execute-code)
[![Code Preview Plugin](https://github-readme-stats.vercel.app/api/pin/?username=zjhcn&repo=obsidian-code-preview&show_owner=true&bg_color=00000000&border_color=e3e7ef)](https://github.com/zjhcn/obsidian-code-preview)

## Roadmap

### Future Work

- Implementation
  - Prevent codemirror extensions applying in source view in editing mode
  - Make plugin destroy itself properly in reading mode
  - Sort colors by language based on icon in `setting.ts`
  - Get Obsidian to parse postMarkdown changes following the codeblock language (see this [issue](https://forum.obsidian.md/t/postprocessor-does-not-process-changes-after-codeblock-language/61010) and this [issue](https://forum.obsidian.md/t/pass-parameters-to-codeblock/37990))
- Features
  - Implement code wrapping options
    - In reading mode, if wrapped, keep line numbers to the left when scrolling
  - Add commands to fold all, unfold all and reset default fold for codeblocks
  - Context Menu on right click
    - Copy codeblock
    - Copy line
    - Collapse
    - Implement execute code buttons
  - Aesthetic animation when folding codeblocks (see how callouts fold)
  - Let users redirect certain languages to alternative icons and colors
- Appearance
  - Fix large line numbers margin padding in editing mode
- Plugin Compatibility
  - Support [File Include Plugin](https://github.com/tillahoffmann/obsidian-file-include)
    - Waiting on response to [issue](https://github.com/tillahoffmann/obsidian-file-include/issues/3)

### Existing Issues

- First pickr change does not change color correctly
- Editing Mode
  - Weird scroll in live preview when click (due to `codeblockHeader` codemirror extension) when first line is a codeblock.
  - If a language is excluded, it currently needs to be unfolded before it can be removed or it disappears
  - Moving the cursor next to a collapsed codeblock and typing can cause it to disappear
- Reading Mode
  - Codeblocks flash when changed if editing side by side in editing mode
  - [Docstring syntax highlighting issue](https://github.com/mugiwara85/CodeblockCustomizer/issues/17)
- PDF Exporting
  - Highlights appear slightly different
  - Language border colors are not correctly set

## Note

If you used version 1.0.0, then you must delete the `data.json` file from `VaultFolder/.obsidian/plugins/codeblock-customizer/` Only one time. This is necessary as the file does not contain a few entries which are required by version 1.0.1 or above. After that, everything should work fine.

## How to install the plugin

- Simply install directly from Obsidian
- Alternatively you can just copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/codeblock-customizer/` or use the [Obsidian Beta Reviewers Plugin](https://github.com/TfTHacker/obsidian42-brat).

## Contributions

All contributions are welcome, just create a merge request.

Please try to create bug reports/issues that are:

- **Reproducible**: Include steps to recreate the issue
- **Specific**: Include relevant details such as possible plugin conflicts, theme conflicts etc.
- **Unique**: Please do not duplicate existing open issues, add to the existing issue
- **Scoped**: Please create a separate issue for each bug you've identified

The bullet points in [roadmap](#roadmap) are a good place to start!

### Maintainers

[@mugiwara85](https://github.com/mugiwara85)

### Contributors

[![List of contributors](https://contrib.rocks/image?repo=mugiwara85/CodeblockCustomizer)](https://github.com/mugiwara85/CodeblockCustomizer/graphs/contributors)

*Made with [contrib.rocks](https://contrib.rocks).*

## Support

If you like this plugin, and would like to help support continued development, use the button below!

[![Buy me a coffee](https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee%20&emoji=&slug=ThePirateKing&button_colour=e3e7ef&font_colour=262626&font_family=Inter&outline_colour=262626&coffee_colour=ff0000)](https://www.buymeacoffee.com/ThePirateKing)

## License

TODO Section
