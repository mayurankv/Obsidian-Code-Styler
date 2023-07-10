// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

function leftFillNum(num, targetLength) {
	return num.toString().padStart(targetLength, 0);
  }
  
  CodeMirror.runMode = function (string, modespec, callback, options) {
	var modeRef = CodeMirror.findModeByName(modespec);
	var mode = CodeMirror.getMode(CodeMirror.defaults, modeRef?.mime);
	var lineNumber = 1;
	if (callback.nodeType == 1) {
	  var tabSize = (options && options.tabSize) || CodeMirror.defaults.tabSize;
	  var lineNums = (options && options.lineNums) || false;
	  var node = callback,
		col = 0;
	  node.innerHTML = "";
	  callback = function (text, style) {
		if (text == "\n") {
		  if (lineNums) {
			lineNumber++; //increment line number
			var lineNum = document.createElement("span");
			lineNum.addClass("cm-linenumber");
			var content = document.createTextNode(leftFillNum(lineNumber, 2) + " ");
			lineNum.appendChild(content);
			node.appendChild(document.createTextNode(text));
			node.appendChild(lineNum);
		  } else {
			node.appendChild(document.createTextNode(text));
		  }
		  col = 0;
		  return;
		}
		var content = "";
		// replace tabs
		for (var pos = 0; ; ) {
		  var idx = text.indexOf("\t", pos);
		  if (idx == -1) {
			content += text.slice(pos);
			col += text.length - pos;
			break;
		  } else {
			col += idx - pos;
			content += text.slice(pos, idx);
			var size = tabSize - (col % tabSize);
			col += size;
			for (var i = 0; i < size; ++i) content += " ";
			pos = idx + 1;
		  }
		}
  
		if (style) {
		  var sp = node.appendChild(document.createElement("span"));
		  sp.className = "cm-" + style.replace(/ +/g, " cm-");
		  sp.appendChild(document.createTextNode(content));
		} else {
		  node.appendChild(document.createTextNode(content));
		}
	  };
	}
  
	var lines = CodeMirror.splitLines(string),
	  state = (options && options.state) || CodeMirror.startState(mode);
	var lineLength = lineNums && mode.name !== "yaml" ? lines.length - 1 : lines.length;
	for (var i = 0, e = lineLength; i < e; ++i) {
	  if (i) callback("\n");
	  var stream = new CodeMirror.StringStream(lines[i]);
	  while (!stream.eol()) {
		var style = mode.token(stream, state);
		callback(stream.current(), style, i, stream.start);
		stream.start = stream.pos;
	  }
	}
	if (lineNums) {
	  var outputDiv = node;
	  var firstLine = document.createElement("span");
	  firstLine.addClass("cm-linenumber");
	  var content = document.createTextNode(leftFillNum(1, 2) + " ");
	  firstLine.appendChild(content);
	  outputDiv?.insertBefore(firstLine, outputDiv.firstChild);
	}
  };
