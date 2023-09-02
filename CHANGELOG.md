# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

See this project's [releases](/../../../releases).
<!-- Create a new release using `npm version x.y.z`` (or increment `z` with `patch`, `y` with `minor` and `x` with `major`) -->
<!-- Rerelease a broken release with `npm run rerelease`-->
<!-- Revert a broken commit using `gitrev commitSHA` (`git reset --hard commitSHA && git push --force origin commitSHA:master`) -->

<!-- Types of Changes -->
<!-- ### Added -->
<!-- ### Changed -->
<!-- ### Deprecated -->
<!-- ### Removed -->
<!-- ### Fixed -->
<!-- ### Security -->
<!-- ### Notes -->

## [Unreleased]

### Added

- Setting to disable inline code styling
- Added security file
- Added unit testing framework

### Changed

- Modified settings to be more modular
- Changed how headers are built

### Fixed

- Codeblocks in html comments are no longer styled

## [1.0.10] - 2023-08-30

### Added

- Added ability to parse codeblock rendered in settings
- Added ability to rerelease versions if build fails

### Changed

- Changed how line numbers are hidden/shown
- Changed how inline code syntax highlighting setting is implemented

### Fixed

- Fixed `wrap` parameter bug (on click would unwrap)

## [1.0.9] - 2023-08-25

### Added

- Added ability to parse execute code codeblock parameters
- Added automated settings updates between versions

### Changed

- Changed `ViewPlugins` to `StateFields`

### Fixed

- Dealt with removing decorations in source mode properly (headers, fold regions)
- Fixed limiting behaviour in source mode apart from codeblock line styling
- Cursor unfold/refold is now based on full range
- Fixed small CSS bugs

## [1.0.8] - 2023-08-23

### Added

- Added fold commands
- `run-*` implemented by the execute code plugin are treated as their original language with an update script to pull current values

### Changed

- Refactored editing view codeblock parsing to use callbacks in a loop function
- Can now update default themes
- Changed how header and sub-elements are hidden
- Changed how edit mode folds codeblocks
- Changed variable names from collapse to fold

### Fixed

- Compatibility with the [blur plugin](https://github.com/gapmiss/blur)
- Removing codeblock languages now doesn't make folded codeblocks disappear

## [1.0.7] - 2023-08-16

### Added

- Added framework for reuse of loop in editing view and for commands

### Changed

- Only style scrollbar if theme already styles it
- Automatic update doesn't change changelog heading levels

### Fixed

- Added full message to automatic release
- Fixed Blue Topaz line wrapping priority bug
- Fixed dataviewjs glitching bug

## [1.0.6] - 2023-08-15

### Added

- CSS linting added
- Automated packaging and releasing

### Changed

- Replaced deprecated `MarkdownRenderer.renderMarkdown` to `MarkdownRenderer.render`
- Changed parsing of HTML tags

### Fixed

- Parsing error for codeblock delimiters
- Readded scrollbar after css bug caused it to disappear
- Fixed `wrap` parameter actually applying class `.unwrapped`

## [1.0.5] - 2023-08-11

### Added

- Linting

### Changed

- Some refactoring of code

### Fixed

- Re-add wrap implementations

## [1.0.4] - 2023-08-09

### Added

- Add `wrap` as alias to `unwrap:false` and `unwrap` as alias to `unwrap:true`

### Changed

- Round up heights to prevent rounding error scrollbars from appearing
- Convert transitions so `max-height` is only applied temporarily for animations
- Codeblock processor languages do not get styled by default and must be whitelisted for styling

### Fixed

- Escape HTML strings properly
- Prevent jumping when typing and seamless editing side-by-side

## [1.0.3] - 2023-08-08

### Added

- Re-renders on changes to relevant settings

### Fixed

- Multiline tokens are retained
- Scroll issues are fixed (apart from small near-empty codeblocks)

## [1.0.2] - 2023-08-04

### Changed

- Added some language name aliases

### Fixed

- Fixed `arduino` language colour
- Fixed minimal theme readable line length issue

## [1.0.1] - 2023-07-11

### Added

- Added inline code syntax highlighting
- Added inline code titles and icons

### Changed

- Replaced `color` with `colour`
- Cursoring horizontally into codeblocks temporarily uncollapses them until the cursor is outside the codeblock

### Fixed

- Bug where cursoring into codeblocks and typing to make them disappear is fixed

## [1.0.0] - 2023-07-08

### Notes

- Initial release.
- Built upon a fork from the [Codeblock Customizer Plugin](https://github.com/mugiwara85/CodeblockCustomizer).

### Added

- Added smooth folding transition in reading mode.
- Added button animations.
- Added ignore parameter and YAML setting.
- Added line wrapping settings and parameters.
- Added line numbering parameters.
- Added dynamic line number margin sizing in reading mode and editing mode.
- Added regex line highlighting.
- Added optional fold placeholder parameter and settings.
- Added default theme which uses existing css variables.
- Added current line indicator via line number colour.
- Added colour styling for buttons.
- Added gradient highlighting with colour stop settings.
- Added header font size and family customization.
- Added icon customizability.
- Added codeblock curvature setting.
- Added optional language border setting.
- Added optional redirecting of language colours and icons.
- Added compatibility with many popular themes and ability for theme specific corrections.
- Added compatibility with the [execute code plugin](https://github.com/twibiral/obsidian-execute-code), [code preview plugin](https://github.com/zjhcn/obsidian-code-preview), [file include plugin](https://github.com/tillahoffmann/obsidian-file-include) and [admonitions plugin](https://github.com/javalent/admonitions).
- Added automatic release on tag addition using github workflows.
- Added issue and pull request templates.
- Added other supporting documents such as [CONTRIBUTING](.github/CONTRIBUTING.md).
- Added plugin automatically applies to open pages when loaded now.
- Added compatibility within callouts
- Added compatibility within lists

### Changed

- Refactored large portions of code.
  - Changed settings structure.
    - Combined light and dark themes to single theme.
  - Restructured codemirror extensions.
  - Restructured markdown post-processor.
  - Refactored how runtime styles are applied.
- Disabled markup in source mode.
- Separated ignored languages from ignored codeblocks to allow for better parsing.
- Changed how line numbers are spaced in reading mode.
- Updated [README](README.md).
- Removed `none` language from supported languages since it is used by obsidian for codeblocks without a language

[Unreleased]: /../../compare/1.0.10...HEAD
[1.0.10]: /../../compare/1.0.9...1.0.10
[1.0.9]: /../../compare/1.0.8...1.0.9
[1.0.8]: /../../compare/1.0.7...1.0.8
[1.0.7]: /../../compare/1.0.6...1.0.7
[1.0.6]: /../../compare/1.0.5...1.0.6
[1.0.5]: /../../compare/1.0.4...1.0.5
[1.0.4]: /../../compare/1.0.3...1.0.4
[1.0.3]: /../../compare/1.0.2...1.0.3
[1.0.2]: /../../compare/1.0.1...1.0.2
[1.0.1]: /../../compare/1.0.0...1.0.1
[1.0.0]: /../../releases/tag/1.0.0
