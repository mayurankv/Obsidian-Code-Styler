# ToDo

@mayurankv

1. Appearance issues:
   1. Too large line numbers with dynamic padding in source mode
   2. Folding transition animation? CSS won't work for this.
2. Prevent delay to render in reading mode:
   1. Caused by changes to HTML such as:
      - Changing highlighted lines
      - Changing file name
      - Presumably changing line offset
      - Presumably changing fold name
3. Refactor to make cleaner
   1. Sort settings structure and change corresponding code
   2. Reuse functions across live preview and reading mode
4. Extra Settings
   1. Placeholder text for collapsed code
      1. Global placeholder in settings
      2. Optional parameter after fold:
   2. Let users redirect certain languages to icon of choice? Definitely not urgent if at all
