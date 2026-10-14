import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from '../lib/paths.mjs';
const words = '(?:objects|legend|sounds|collisionlayers|rules|winconditions|levels)';
const header = `^[ \\t]*(?i:${words})(?=[ \\t(]|$)`;
const name = {name:'variable.other.object.puzzlescript', match:'[\\p{L}\\p{N}_]+'};
const ref = include => ({include:'#'+include});
const token = (scope, match) => ({name:scope+'.puzzlescript',match});
const context = (section, patterns) => ({
  name: `meta.section.${section}.puzzlescript`,
  begin: `^[ \\t]*((?i:${section}))(?=[ \\t(]|$)`,
  beginCaptures: {'1': {name:'keyword.control.section.puzzlescript'}},
  end: `(?=${header})`,
  patterns:[ref('comments'),ref('separator'),...patterns]
});
const directions = token('keyword.other.direction', '(?i)\\b(?:up|down|left|right|horizontal|vertical|orthogonal|moving|stationary|parallel|perpendicular|randomdir|random|action|late|rigid|no)\\b|(?<![\\p{L}\\p{N}_])v(?![\\p{L}\\p{N}_])|[\\^<>]');
const message = {
  begin:'(?i)\\b(message)\\b', beginCaptures:{'1':{name:'keyword.other.command.puzzlescript'}},
  end:'$', contentName:'string.unquoted.message.puzzlescript', patterns:[]
};
const grammar = {
  name:'PuzzleScript',scopeName:'source.puzzlescript',
  // No fileTypes: a generic editor must not claim every .txt file. Linguist
  // selects this grammar only after its independent content detector matches.
  patterns:[ref('comments'),ref('separator'),
    ...['objects','legend','sounds','collisionlayers','rules','winconditions','levels'].map(ref),ref('metadata')],
  repository:{
    comments:{name:'comment.block.puzzlescript',begin:'\\(',end:'\\)',patterns:[ref('comments')]},
    separator:token('punctuation.separator.section','^[ \\t]*=+[ \\t]*$'),
    metadata:{patterns:[{
      begin:'^[ \\t]*((?i:title|author|homepage|background_color|text_color|key_repeat_interval|realtime_interval|again_interval|flickscreen|zoomscreen|color_palette|youtube))\\b',
      beginCaptures:{'1':{name:'support.type.property-name.metadata.puzzlescript'}},
      end:'$',contentName:'string.unquoted.metadata.puzzlescript',patterns:[ref('comments')]
    },token('support.type.property-name.metadata','(?i)^[ \\t]*(?:run_rules_on_level_start|norepeat_action|require_player_movement|debug|verbose_logging|throttle_movement|noundo|noaction|norestart|scanline)\\b')]},
    objects:context('objects',[
      token('constant.other.color','(?i)#(?:[0-9a-f]{6}|[0-9a-f]{3})\\b|\\b(?:black|white|gr[ae]y|darkgr[ae]y|lightgr[ae]y|red|darkred|lightred|brown|darkbrown|lightbrown|orange|yellow|green|darkgreen|lightgreen|blue|lightblue|darkblue|purple|pink|transparent)\\b'),
      token('constant.numeric.sprite','^[ \\t]*[.0-9]+[ \\t]*$'),name]),
    legend:context('legend',[token('keyword.operator.assignment','='),token('keyword.operator.logical','(?i)\\b(?:and|or)\\b'),name]),
    sounds:context('sounds',[
      token('support.function.sound-event','(?i)\\b(?:undo|restart|titlescreen|startgame|cancel|endgame|startlevel|endlevel|showmessage|closemessage|sfx(?:10|[0-9]))\\b'),
      token('support.function.sound-verb','(?i)\\b(?:move|action|create|destroy|cantmove)\\b'),directions,
      token('constant.numeric.sound-seed','\\b[0-9]+\\b'),name]),
    collisionlayers:context('collisionlayers',[token('punctuation.separator.comma',','),name]),
    rules:context('rules',[
      // Commands belong after the RHS; a legal object named checkpoint inside
      // brackets must remain an object. Message text consumes the rest of line.
      token('keyword.control.loop','(?i)^[ \\t]*(?:startloop|endloop)\\b'),
      {name:'meta.rule.cell.puzzlescript',begin:'\\[',end:'\\]',beginCaptures:{'0':{name:'punctuation.section.brackets.puzzlescript'}},endCaptures:{'0':{name:'punctuation.section.brackets.puzzlescript'}},patterns:[ref('comments'),directions,token('keyword.operator.ellipsis','\\.\\.\\.'),token('punctuation.separator.cell','\\|'),name]},
      message,token('keyword.other.command','(?i)\\b(?:cancel|checkpoint|restart|win|again|sfx(?:10|[0-9]))\\b'),
      token('keyword.operator.arrow','->'),directions,token('keyword.operator.group','\\+'),name]),
    winconditions:context('winconditions',[token('keyword.operator.logical','(?i)\\b(?:all|any|no|some|on)\\b'),name]),
    levels:context('levels',[{...message,begin:'^[ \\t]*((?i:message))\\b'},token('string.unquoted.level','[^ \\t(]+')])
  }
};
const destination=path.join(ROOT,'syntaxes');fs.mkdirSync(destination,{recursive:true});
fs.writeFileSync(path.join(destination,'puzzlescript.tmLanguage.json'),JSON.stringify(grammar,null,2)+'\n');
console.log('Built section-aware TextMate grammar.');
