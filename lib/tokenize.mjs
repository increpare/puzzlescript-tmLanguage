import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import textmate from 'vscode-textmate';
import oniguruma from 'vscode-oniguruma';
import { ROOT } from './paths.mjs';
const require = createRequire(import.meta.url);
const wasm = fs.readFileSync(require.resolve('vscode-oniguruma/release/onig.wasm'));
await oniguruma.loadWASM(wasm.buffer.slice(wasm.byteOffset, wasm.byteOffset + wasm.byteLength));
const registry = new textmate.Registry({
  onigLib: Promise.resolve({
    createOnigScanner: patterns => new oniguruma.OnigScanner(patterns),
    createOnigString: value => new oniguruma.OnigString(value)
  }),
  loadGrammar: async scope => scope === 'source.puzzlescript'
    ? JSON.parse(fs.readFileSync(path.join(ROOT, 'syntaxes/puzzlescript.tmLanguage.json'), 'utf8')) : null
});
export const grammar = await registry.loadGrammar('source.puzzlescript');
export function tokenize(source, limit = 200) {
  let state = textmate.INITIAL;
  return source.split(/\r?\n/).map((line, index) => {
    const result = grammar.tokenizeLine(line, state, limit);
    if (result.stoppedEarly) throw new Error(`Tokenization budget exceeded on line ${index + 1}`);
    state = result.ruleStack;
    return { line, tokens: result.tokens.map(t => ({ ...t, text: line.slice(t.startIndex, t.endIndex) })) };
  });
}
