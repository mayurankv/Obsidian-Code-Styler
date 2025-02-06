import { PREFIX } from "./general";

export const SETTINGS_TAB_SOURCEPATH_PREFIX = `@${PREFIX}-settings:`;

export const LOCAL_PREFIX = "@/";

export const EXAMPLE_CODEBLOCK_PARAMETERS = "python title:foo";
export const EXAMPLE_CODEBLOCK_CONTENT = "print(\"This line is very long and should be used as an example for how the plugin deals with wrapping and unwrapping very long lines given the choice of codeblock parameters and settings.\")\nprint(\"This line is highlighted.\")";
export const EXAMPLE_INLINE_CODE_CONTENT = "print(\"This is true\" if x > 1 else false)";
export const EXAMPLE_INLINE_CODE_PARAMETERS = "python icon title:foo";

export const BUTTON_TIMEOUT = 1000
export const BUTTON_TRANSITION = 200
export const FOLD_TRANSITION = 240

export const WORKSPACE_CHANGE_TIMEOUT = 1000
export const SCROLL_TIMEOUT = 25
