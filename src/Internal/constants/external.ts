const EXECUTE_CODE_LANGUAGE_ALIASES: Array<string> = ["javascript","typescript","bash","csharp","wolfram","nb","wl","hs","py"];
const EXECUTE_CODE_CANONICAL_LANGUAGES: Array<string> = ["js","ts","cs","lean","lua","python","cpp","prolog","shell","groovy","r","go","rust","java","powershell","kotlin","mathematica","haskell","scala","swift","racket","fsharp","c","dart","ruby","batch","sql","octave","maxima","applescript","zig","ocaml","php"];

export const EXECUTE_CODE_SUPPORTED_LANGUAGES = [...EXECUTE_CODE_LANGUAGE_ALIASES,...EXECUTE_CODE_CANONICAL_LANGUAGES];
