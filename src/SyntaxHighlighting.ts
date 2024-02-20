const MODES = [
	"reference",
	"yaml-frontmatter",
];

export function addModes() {
	MODES.forEach(mode => addMode(mode));
}
export function removeModes() {
	MODES.forEach(mode => removeMode(mode));
}
function addMode(modeName: string) {
	//@ts-expect-error Undocumented Obsidian API
	window.CodeMirror.modeInfo.push({
		name: modeName,
		mime: "text/"+modeName,
		mode: modeName,
		ext: [modeName]
	});
}
function removeMode(modeName: string) {
	//@ts-expect-error Undocumented Obsidian API
	const modeIndex = window.CodeMirror.modeInfo.findIndex((mode) => mode.mode === modeName);
	if (modeIndex !== -1)
		//@ts-expect-error Undocumented Obsidian API
		window.CodeMirror.modeInfo.splice(modeIndex, 1);
}

export function addReferenceSyntaxHighlight() {
	window.CodeMirror.defineMode("reference", function(config, parserConfig) {
		const keyPattern = /^([a-zA-Z0-9_-]+)\s*(?=:)/;
		const valuePattern = /^(:?(\s*(?:"(?:\\.|[^"])*"|\S+))?)/;
		return {
			startState: () => { return { inBlock: false, indent: 0 }; },
			indent: (state, textAfter) => {
				const indentUnit = config.indentUnit;
				const indent = state.indent || 0;
				if (textAfter && textAfter.startsWith("-")) return indent + indentUnit;
				else return indent;
			},
			token: (stream, state) => {
				if (stream.eatSpace()) return null;
				if (stream.match(/^#.*/)) return "comment";
				if (stream.match(/^https?:\/\/.*/)) return "variable";
				if (stream.match(/\[\[.+\]\]/)) return "variable";
				if (stream.match(keyPattern)) return "string";
				if (stream.match(/:/)) return "meta";
				const valueMatch = stream.match(valuePattern);
				if (valueMatch) {
					if (/("?)\/.*\/\1/.exec(valueMatch[2])) return "operator";
					if (valueMatch[2].startsWith("\"")) {
						stream.skipToEnd(); // Consume the rest of the string
						return "property";
					} else if (/^\d+(\.\d+)?\b/.test(valueMatch[2])) return "number";
					else if (/^(true|false|null)\b/.test(valueMatch[2])) return "atom";
					else return null;
				}

				if (stream.sol()) {
					const indent = stream.indentation();
					if (indent > state.indent) {
						state.indent = indent;
						return "indent";
					} else if (indent < state.indent) {
						state.indent = indent;
						return "dedent";
					}
				}

				stream.next();
				return null;
			}
		};
	});
	window.CodeMirror.defineMIME("text/reference", "reference");
}
export function addYamlFrontmatterSyntaxHighlighting() {
	const START = 0, FRONTMATTER = 1, BODY = 2;
	window.CodeMirror.defineMode("yaml-frontmatter", function(config, parserConfig) {
		const yamlMode = window.CodeMirror.getMode(config, "yaml");
		const innerMode = window.CodeMirror.getMode(config, parserConfig?.base ?? "markdown");
		console.log(parserConfig?.base);

		function curMode(state) {
			return state.state == BODY ? innerMode : yamlMode;
		}

		return {
			startState: () => {
				return {
					state: START,
					inner: window.CodeMirror.startState(yamlMode)
				};
			},
			copyState: (state) => {
				return {
					state: state.state,
					// @ts-expect-error Hidden Method
					inner: window.CodeMirror.copyState(curMode(state), state.inner)
				};
			},
			token: (stream, state) => {
				if (state.state == START) {
					if (stream.match(/---/, false)) {
						state.state = FRONTMATTER;
						return yamlMode.token(stream, state.inner);
					} else {
						state.state = BODY;
						state.inner = window.CodeMirror.startState(innerMode);
						return innerMode.token(stream, state.inner);
					}
				} else if (state.state == FRONTMATTER) {
					const end = stream.sol() && stream.match(/(---|\.\.\.)/, false);
					const style = yamlMode.token(stream, state.inner);
					if (end) {
						state.state = BODY;
						state.inner = window.CodeMirror.startState(innerMode);
					}
					return style;
				} else {
					return innerMode.token(stream, state.inner);
				}
			},
			// innerMode: (state) => {
			// 	return {mode: curMode(state), state: state.inner};
			// },
			blankLine: (state) => {
				const mode = curMode(state);
				if (mode.blankLine) return mode.blankLine(state.inner);
			}
		};
	});
	window.CodeMirror.defineMIME("text/yaml-frontmatter", "yaml-frontmatter");
}
