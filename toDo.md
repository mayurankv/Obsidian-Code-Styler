# ToDo

1. Sort css issue too large line numbers with dynamic padding
2. Clean css file
3. Clean up settings interfaces
   1. Can remove current color from alternate highlights
4. Refactor to make cleaner
   1. Sort settings structure and change corresponding code
5. Turn ==icons and headers== on/off via css display none and a global css class
   1. icon-specific and header-specific and language-tag-specific
6. Prevent delay to render in reading mode:
   1. Caused by changes to HTML such as:
      1. Changing highlighted lines
      2. Changing file name
      3. Changing line offset
      4. Currently:
         1. Displaying codeblock language (and always)
         2. Displaying codeblock icon (and always)
7. Check startup times
