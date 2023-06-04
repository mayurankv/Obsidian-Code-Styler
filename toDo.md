# ToDo

1. Fix delay issue for opening 
2. Sort css issue too large line numbers with dynamic padding in source mode
3. CSS border radius collapsed code LP and Reading
4. Clean up settings interfaces
5. Refactor to make cleaner
   1. Sort settings structure and change corresponding code
6. Turn ==icons and headers== on/off via css display none and a global css class
   1. icon-specific and header-specific and language-tag-specific
7. Prevent delay to render in reading mode:
   1. Caused by changes to HTML such as:
      1. Changing highlighted lines
      2. Changing file name
      3. Changing line offset
      4. Currently:
         1. Displaying codeblock language (and always)
         2. Displaying codeblock icon (and always)
8. Check startup times
