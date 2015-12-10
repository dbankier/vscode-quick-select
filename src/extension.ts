// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  var _ = undefined;
  context.subscriptions.push(vscode.commands.registerCommand('extension.selectDoubleQuote', singleSelect.bind(_, { char: '"' })));
  context.subscriptions.push(vscode.commands.registerCommand('extension.selectSingleQuote', singleSelect.bind(_, { char: "'" })));
  context.subscriptions.push(vscode.commands.registerCommand('extension.selectBackTick', singleSelect.bind(_, { char: "`", multiline: true })));
  context.subscriptions.push(vscode.commands.registerCommand('extension.selectParenthesis', matchingSelect.bind(_, { start_char: "(", end_char: ")" })));
  context.subscriptions.push(vscode.commands.registerCommand('extension.selectSquareBrackets', matchingSelect.bind(_, { start_char: "[", end_char: "]" })));
  context.subscriptions.push(vscode.commands.registerCommand('extension.selectCurlyBrackets', matchingSelect.bind(_, { start_char: "{", end_char: "}" })));
  context.subscriptions.push(vscode.commands.registerCommand('extension.selectParenthesisOuter', matchingSelect.bind(_, { start_char: "(", end_char: ")", outer: true })));
  context.subscriptions.push(vscode.commands.registerCommand('extension.selectSquareBracketsOuter', matchingSelect.bind(_, { start_char: "[", end_char: "]", outer: true })));
  context.subscriptions.push(vscode.commands.registerCommand('extension.selectCurlyBracketsOuter', matchingSelect.bind(_, { start_char: "{", end_char: "}", outer: true })));
  context.subscriptions.push(vscode.commands.registerCommand('extension.selectAngleBrackets', matchingSelect.bind(_, { start_char: "<", end_char: ">" })));
  context.subscriptions.push(vscode.commands.registerCommand('extension.selectInTag', matchingSelect.bind(_, { start_char: ">", end_char: "<" })));
}

function findOccurances(doc: vscode.TextDocument, line: number, char: string): Array<number> {
  var content = doc.lineAt(line);
  var matches = (content.text + "hack").split(char).reduce((acc, p) => {
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

function findNext(doc: vscode.TextDocument, line: number, char: string, start_index: number = 0, nest_char: string = undefined, nested: number = 0): vscode.Position {
  if (line === doc.lineCount) { return undefined };
  var occurances = findOccurances(doc, line, char).filter(n => n >= start_index);
  var nests = nest_char ? findOccurances(doc, line, nest_char).filter(n => n >= start_index) : [];
  var occurance_index = 0;
  var nests_index = 0;
  while ((occurance_index < occurances.length || nests_index < nests.length) && nested >= 0) {
    if (occurances[occurance_index] < nests[nests_index] || !nests[nests_index]) {
      if (nested === 0) {
        return new vscode.Position(line, occurances[occurance_index]);
      }
      nested--
      occurance_index++;
    } else if (nests[nests_index] < occurances[occurance_index] || !occurances[occurance_index]) {
      nested++;
      nests_index++;
    }
  }
  return findNext(doc, ++line, char, 0, nest_char, nested);
}
function findPrevious(doc: vscode.TextDocument, line: number, char: string, start_index?: number, nest_char: string = undefined, nested: number = 0): vscode.Position {
  if (line === -1) { return undefined };
  if (start_index === undefined) { start_index = doc.lineAt(line).text.length; }
  var occurances = findOccurances(doc, line, char).filter(n => n <= start_index);
  var nests = nest_char ? findOccurances(doc, line, nest_char).filter(n => n <= start_index) : [];
  var occurance_index = occurances.length - 1;
  var nests_index = nests.length - 1;
  while ((occurance_index > -1 || nests_index > -1) && nested >= 0) {
    if (occurances[occurance_index] > nests[nests_index] || !nests[nests_index]) {
      if (nested === 0) {
        return new vscode.Position(line, occurances[occurance_index]);
      }
      nested--
      occurance_index--;
    } else if (nests[nests_index] > occurances[occurance_index] || !occurances[occurance_index]) {
      nested++;
      nests_index--;
    }
  }
  return findPrevious(doc, --line, char, undefined, nest_char, nested);
}

interface SingleSelectOptions { char: string; outer?: boolean, multiline?: boolean }
function singleSelect({char, outer = false, multiline = false}: SingleSelectOptions) {
  let editor = vscode.window.activeTextEditor;
  if (!editor) { return; };
  let doc = editor.document
  let sel = editor.selections
  let offset = outer ? char.length : 0;
  editor.selections = sel.map(s => {
    let {line, character} = s.active;
    let matches = findOccurances(doc, line, char);
    let next = matches.find(a => a > character);
    let next_index = matches.indexOf(next);
    if (matches.length > 1 && matches.length % 2 === 0) {
      if (next === -1) { return s }
      if (next_index % 2 !== 0) {
        next_index--;
      }
      return new vscode.Selection(
        new vscode.Position(line, matches[next_index] - offset),
        new vscode.Position(line, matches[next_index + 1] - 1 + offset)
      );
    } else if (multiline) {
      let start_pos = findPrevious(doc, line, char, character) || new vscode.Position(line, matches[next_index])
      if (!start_pos) { return s };
      let end_pos: vscode.Position = findNext(doc, start_pos.line, char, start_pos.character + 1);
      if (start_pos && end_pos) {
        start_pos = new vscode.Position(start_pos.line, start_pos.character - offset);
        end_pos = new vscode.Position(end_pos.line, end_pos.character - 1 + offset);
        return new vscode.Selection(start_pos, end_pos)
      }
    }
    return s;
  })
}
interface MatchingSelectOptions { start_char: string, end_char: string, outer?: boolean }
function matchingSelect({start_char, end_char, outer = false}: MatchingSelectOptions) {
  let editor = vscode.window.activeTextEditor;
  if (!editor) { return; };
  let doc = editor.document
  let sel = editor.selections
  let success = false;
  let start_offset = outer ? start_char.length : 0;
  let end_offset = outer ? end_char.length : 0;
  editor.selections = sel.map(s => {
    let {line, character} = s.active;
    let starts = findOccurances(doc, line, start_char);
    let ends = findOccurances(doc, line, end_char);
    let start = starts.find(a => a > character);
    let end = ends.find(a=> a > character);
    let start_index = starts.indexOf(start);
    let end_index = ends.indexOf(end);
    let start_pos: vscode.Position = findPrevious(doc, line, start_char, character, end_char) || new vscode.Position(line, starts[start_index]);
    if (!start_pos) { return s };
    let end_pos: vscode.Position = findNext(doc, start_pos.line, end_char, start_pos.character + 1, start_char);
    if (start_pos && end_pos) {
      success = true;
      start_pos = new vscode.Position(start_pos.line, start_pos.character - start_offset);
      end_pos = new vscode.Position(end_pos.line, end_pos.character - 1 + end_offset);
      return new vscode.Selection(start_pos, end_pos)
    }
    return s;
  })
  if (success && start_char === "<") {
    vscode.commands.executeCommand("editor.action.addSelectionToNextFindMatch")
  }
}