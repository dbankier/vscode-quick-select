// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('extension.selectDoubleQuote', singleSelect.bind(undefined, {char:'"'})));
	context.subscriptions.push(vscode.commands.registerCommand('extension.selectSingleQuote', singleSelect.bind(undefined, {char:"'"})));
  context.subscriptions.push(vscode.commands.registerCommand('extension.selectBackTick', singleSelect.bind(undefined, {char:"`"})));
	context.subscriptions.push(vscode.commands.registerCommand('extension.selectParenthesis', matchingSelect.bind(undefined, {start_char:"(", end_char:")"})));
  context.subscriptions.push(vscode.commands.registerCommand('extension.selectSquareBrackets', matchingSelect.bind(undefined, {start_char:"[", end_char:"]"})));
	context.subscriptions.push(vscode.commands.registerCommand('extension.selectCurlyBrackets', matchingSelect.bind(undefined, {start_char:"{", end_char:"}"})));
	context.subscriptions.push(vscode.commands.registerCommand('extension.selectParenthesisOuter', matchingSelect.bind(undefined, {start_char:"(", end_char:")",outer:true})));
	context.subscriptions.push(vscode.commands.registerCommand('extension.selectSquareBracketsOuter', matchingSelect.bind(undefined, {start_char:"[", end_char:"]",outer:true})));
	context.subscriptions.push(vscode.commands.registerCommand('extension.selectCurlyBracketsOuter', matchingSelect.bind(undefined, {start_char:"{", end_char:"}",outer:true})));
  context.subscriptions.push(vscode.commands.registerCommand('extension.selectAngleBrackets', matchingSelect.bind(undefined, {start_char:"<", end_char:">"})));
	context.subscriptions.push(vscode.commands.registerCommand('extension.selectInTag', matchingSelect.bind(undefined, {start_char:">", end_char:"<"})));
}

function findOccurances(doc, line, char): Array<number> {
	var content = doc.lineAt(line);
	var matches = content.text.split(char).reduce((acc, p) => {
		var len = p.length + 1;
		if (acc.length > 0) {
			len += acc[acc.length - 1];
		}
		acc.push(len);
		return acc;
	}, []);
	matches.pop();
	return matches;
}

interface SingleSelectOptions {char:string; outer?:boolean}
function singleSelect({char,outer=false}:SingleSelectOptions) {
	let editor = vscode.window.activeTextEditor;
	if (!editor) { return; };
	let doc = editor.document
	let sel = editor.selections
  let offset = outer ? char.length : 0;
	editor.selections = sel.map(s => {
		var {line, character} = s.active;
		var matches = findOccurances(doc, line, char);
		if (matches.length > 1 && matches.length % 2 === 0) {
			var next = matches.find(a => a > character);
			if (next === -1) { return s }
			var next_index = matches.indexOf(next);
			if (next_index % 2 !== 0) {
				next_index--;
			}
			return new vscode.Selection(
        new vscode.Position(line, matches[next_index] - offset),
        new vscode.Position(line, matches[next_index + 1] - 1 + offset)
      );
		}
		return s;
	})
}
interface MatchingSelectOptions {start_char:string, end_char:string, outer?:boolean}
function matchingSelect({start_char, end_char, outer=false}:MatchingSelectOptions) {
	let editor = vscode.window.activeTextEditor;
	if (!editor) { return; };
	let doc = editor.document
	let sel = editor.selections
	let success = false;
  let start_offset = outer ? start_char.length : 0;
  let end_offset = outer ? end_char.length : 0;
	editor.selections = sel.map(s => {
		var {line, character} = s.active;
		var starts = findOccurances(doc, line, start_char);
		var ends = findOccurances(doc, line, end_char);

		if (starts.length > 0 && ends.length > 0 && starts.length === ends.length) {
			var start = starts.find(a => a > character);
			var end = ends.find(a=> a > character);
			var start_index = starts.indexOf(start);
			var end_index = ends.indexOf(end);
			var index;
			if (start_index === -1 && end_index === -1) {
				return s;
			}
			if (start_index === -1 || end_index < start_index) {
				start_index = end_index;
			} else {
				end_index = start_index;
			}
			if (ends[end_index] < starts[start_index]) {
				end_index ++;
			}
			success = true;
			return new vscode.Selection(
        new vscode.Position(line, starts[start_index] - start_offset),
        new vscode.Position(line, ends[end_index] - 1 + end_offset)
      );
		}
		return s;
	})
	if (success && start_char === "<") {
		vscode.commands.executeCommand("editor.action.addSelectionToNextFindMatch")
	}
}