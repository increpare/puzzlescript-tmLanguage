# PuzzleScript TextMate grammar

Syntax highlighting for [PuzzleScript](https://www.puzzlescript.net/), with scope
`source.puzzlescript`. MIT licensed; see [LICENSE](LICENSE).

PuzzleScript source traditionally uses `.txt`. This grammar does not register
every `.txt` file in an editor. GitHub Linguist can select the scope after its
separate content heuristic identifies PuzzleScript.

The grammar covers sections, nested comments, metadata, colours and sprites,
legend declarations, sounds, rule directions and commands, win conditions, and
level maps. Message bodies remain literal text. It is a highlighter, not a
compiler or semantic validator.

## Development

Use Node.js 20 or newer:

```sh
npm ci --ignore-scripts
npm run build
npm test
git diff --exit-code -- syntaxes/puzzlescript.tmLanguage.json
```

Edit `scripts/build-grammar.mjs`, regenerate the JSON, and commit both files.
Tests use the real TextMate tokenizer and Oniguruma engine to check section
contexts, nested comments, metadata, directions, commands, and message bodies.

The grammar was derived from the MIT-licensed candidate in
[PuzzleScript-labs](https://github.com/increpare/PuzzleScript-labs/blob/master/tools/vscode-puzzlescript/syntaxes/puzzlescript.tmLanguage.json),
then reworked into section contexts. Language behaviour is based on
[PuzzleScript](https://github.com/increpare/PuzzleScript).

For Linguist integration, use `script/add-grammar` with this repository's URL.
