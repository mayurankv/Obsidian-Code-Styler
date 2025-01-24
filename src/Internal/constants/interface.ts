import { PREFIX } from "./general";

export const SETTINGS_TAB_SOURCEPATH_PREFIX = `@${PREFIX}-settings:`;

export const EXAMPLE_CODEBLOCK_PARAMETERS = "python title:foo";
export const EXAMPLE_CODEBLOCK_CONTENT = "print(\"This line is very long and should be used as an example for how the plugin deals with wrapping and unwrapping very long lines given the choice of codeblock parameters and settings.\")\nprint(\"This line is highlighted.\")";
export const EXAMPLE_INLINE_CODE = "{python icon title:foo} print(\"This is true\" if x > 1 else false)";
