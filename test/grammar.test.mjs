import test from 'node:test';
import assert from 'node:assert/strict';
import { tokenize } from '../lib/tokenize.mjs';
function scopes(source, text, occurrence = 0) {
  const ts = tokenize(source).flatMap(l=>l.tokens).filter(t=>t.text===text);
  assert.ok(ts[occurrence],`Missing token ${JSON.stringify(text)} in ${source}`);
  return ts[occurrence].scopes;
}
const has = (source,text,scope) => assert.ok(scopes(source,text).includes(scope),`${text} needs ${scope}`);
test('nested multiline comments stay comments until the outer close', () => {
  const lines=tokenize('(outer (inner)\nRULES\n)\nOBJECTS\nPlayer');
  assert.ok(lines[1].tokens.every(t=>t.scopes.includes('comment.block.puzzlescript')));
  assert.ok(lines[3].tokens.some(t=>t.scopes.includes('keyword.control.section.puzzlescript')));
});
test('metadata text is not interpreted as rules', () => {
  has('title Move left and win',' Move left and win','string.unquoted.metadata.puzzlescript');
});
test('section transitions select the right token vocabulary', () => {
  const source='OBJECTS\nPlayer\nred\n012..\nLEGEND\nP = Player\nSOUNDS\nsfx0 12345\nCOLLISIONLAYERS\nPlayer\nRULES\n[ > Player ] -> [ Player ] again\nWINCONDITIONS\nall Player on Target\nLEVELS\nPv<>#';
  has(source,'red','constant.other.color.puzzlescript');
  has(source,'012..','constant.numeric.sprite.puzzlescript');
  has(source,'12345','constant.numeric.sound-seed.puzzlescript');
  has(source,'->','keyword.operator.arrow.puzzlescript');
  has(source,'again','keyword.other.command.puzzlescript');
  has(source,'all','keyword.operator.logical.puzzlescript');
  has(source,'Pv<>#','string.unquoted.level.puzzlescript');
});
test('checkpoint is an object inside brackets and a command outside', () => {
  const s='RULES\n[ checkpoint ] -> [ checkpoint ] checkpoint';
  assert.ok(scopes(s,'checkpoint',0).includes('variable.other.object.puzzlescript'));
  assert.ok(scopes(s,'checkpoint',2).includes('keyword.other.command.puzzlescript'));
});
test('the letter v inside an identifier is not a direction', () => {
  has('RULES\n[ moving Conveyor ] -> [ v Conveyor ]','Conveyor','variable.other.object.puzzlescript');
  has('RULES\n[ moving Conveyor ] -> [ v Conveyor ]','v','keyword.other.direction.puzzlescript');
});
test('message body consumes keywords and parentheses', () => {
  has('RULES\n[ Player ] -> message win (again) right',' win (again) right','string.unquoted.message.puzzlescript');
  has('LEVELS\nmessage Push right (or left)',' Push right (or left)','string.unquoted.message.puzzlescript');
});
