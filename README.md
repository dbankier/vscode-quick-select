# vscode-quick-select


Yes I know about the ⌃⇧⌘← and ⌃⇧⌘→ expand/shrink selection. Having come from VIM I think these are still missing.

It now supports multilines automatic selection, matching correctly.

**NEW:** you can also now toggle single/double quotes

See the examples below.


## Installation

Press <kbd>F1</kbd> and narrow down the list commands by typing `extension`. Pick `Extensions: Install Extension`.
Select the `Quick and Simple Text Selection` extension from the list


## Manual Install

**Mac & Linux**
```sh
cd $HOME/.vscode/extensions
```
**Windows**
```sh
cd %USERPROFILE%\.vscode\extensions
```

**All Platforms**
```
git clone https://github.com/dbankier/vscode-quick-select.git
cd vscode-quick-select
npm install
```


## Usage

Here some examples - and it supports multiple selections.

In the examples below use <kbd>CTRL</kbd> instead of <kbd>⌘</kbd> for Windows.

<kbd>⌘</kbd><kbd>k</kbd> <kbd>"</kbd>

![doublequotes](https://github.com/dbankier/vscode-quick-select/raw/master/screens/doublequotes.gif)

<kbd>⌘</kbd><kbd>k</kbd> <kbd>'</kbd>

![singlequotes](https://github.com/dbankier/vscode-quick-select/raw/master/screens/singlequotes.gif)

**NEW:** You can also use this following shortcut to select either single, double quotes or backticks

<kbd>⌘</kbd><kbd>k</kbd> <kbd>;</kbd>

**NEW:** You can also use this following shortcut to toggle quotes, e.g. `"word"` to `'word'`

<kbd>⌘</kbd><kbd>k</kbd> <kbd>:</kbd>

**NOTE:** the extensions can be configured to exclude backticks from selection or switching

<kbd>⌘</kbd><kbd>k</kbd> <kbd>`</kbd>

![singlequotes](https://github.com/dbankier/vscode-quick-select/raw/master/screens/backticks.gif)

<kbd>⌘</kbd><kbd>k</kbd> <kbd>(</kbd> and
<kbd>⌘</kbd><kbd>k</kbd> <kbd>[</kbd> and
<kbd>⌘</kbd><kbd>k</kbd> <kbd>{</kbd>

Using the following performs and outer selection:

<kbd>⌘</kbd><kbd>k</kbd> <kbd>)</kbd> and
<kbd>⌘</kbd><kbd>k</kbd> <kbd>]</kbd> and
<kbd>⌘</kbd><kbd>k</kbd> <kbd>}</kbd>

Or if you have already made in inner selection, use the same key combination again to expand to an outer selection.

![brackets](https://github.com/dbankier/vscode-quick-select/raw/master/screens/brackets.gif)


<kbd>⌘</kbd><kbd>k</kbd> <kbd><</kbd>

This also selects the matching tag.

<kbd>⌘</kbd><kbd>k</kbd> <kbd>></kbd>

This matches the tag value.

![brackets](https://github.com/dbankier/vscode-quick-select/raw/master/screens/tags.gif)

### Customisation

~~~
extension.selectSingleQuote
extension.selectDoubleQuote
extension.selectEitherQuote
extension.switchQuotes
extension.selectParenthesis
extension.selectBackTick
extension.selectSquareBrackets
extension.selectCurlyBrackets
extension.selectParenthesisOuter
extension.selectSquareBracketsOuter
extension.selectCurlyBracketsOuter
extension.selectAngleBrackets
extension.selectInTag
~~~

## License

MIT © [David Bankier @dbankier](https://github.com/dbankier)
<!-- [@davidbankier](https://twitter.com/davidbankier) -->
