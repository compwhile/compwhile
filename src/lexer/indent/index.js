/* eslint-disable no-console, no-use-before-define */
import chevrotain from 'chevrotain';
import _ from 'lodash';

const createToken = chevrotain.createToken;
const createTokenInstance = chevrotain.createTokenInstance;

let indentStack = [0];
let lastOffsetChecked;

function init() {
  indentStack = [0];
  lastOffsetChecked = undefined;
}

function logCreator(printedOffsets) {
  return function log(offset, msg) {
    if (printedOffsets.indexOf(offset) > -1) {
      // console.log(msg);
    }
  };
}

function matchWhiteSpace(text, startOffset) {
  let result = '';
  let offset = startOffset;

  // ignoring tabs in this example
  while (text[offset] === ' ') {
    offset += 1;
    result += ' ';
  }

  if (result === '') {
    return null;
  }

  return [result];
}

const logger = logCreator([46]);
/**
 * This custom Token matcher uses Lexer context ("matchedTokens" and "groups" arguments)
 * combined with state via closure ("indentStack" and "lastTextMatched") to match indentation.
 *
 * @param {string} text - remaining text to lex, sent by the Chevrotain lexer.
 * @param {ISimpleTokenOrIToken[]} matchedTokens - Tokens lexed so far,
 * sent by the Chevrotain Lexer.
 * @param {object} groups - Token groups already lexed, sent by the Chevrotain Lexer.
 * @param {string} type - determines if this function matches Indent or Outdent tokens.
 * @returns {*}
 */
function matchIndentBase(text, offset, matchedTokens, groups, type) {
  const log = (msg) => {
    logger(offset, msg);
  };

  log(`\n----------------------------- ${type} ${text[offset]}`);
  const noTokensMatchedYet = _.isEmpty(matchedTokens);
  const newLines = groups.nl;
  const noNewLinesMatchedYet = _.isEmpty(newLines);
  const isFirstLine = noTokensMatchedYet && noNewLinesMatchedYet;
  const isStartOfLine =
    // only newlines matched so far
    (noTokensMatchedYet && !noNewLinesMatchedYet) ||
    // Both newlines and other Tokens have been matched AND the last matched Token is a newline
    (!noTokensMatchedYet &&
    !noNewLinesMatchedYet &&
    (!_.isEmpty(newLines) && !_.isEmpty(matchedTokens) &&
      _.last(newLines).startOffset) > _.last(matchedTokens).startOffset);

  const logObj = {
    offset,
    lastOffsetChecked,
    noTokensMatchedYet,
    noNewLinesMatchedYet,
    '!_.isEmpty(newLines)': !_.isEmpty(newLines),
    '_.last(newLines).startOffset)': _.last(newLines) ?
      _.last(newLines).startOffset : 'undefined',
    '_.last(matchedTokens).startOffset': _.last(matchedTokens) ? _.last(matchedTokens).startOffset : 'undefined',
  };

  if (!noTokensMatchedYet) {
    logObj.matchedTokens = matchedTokens;
  }

  log(JSON.stringify(logObj, null, 4));


  log(`new execution of matchIndenBast with type ${type}`);
  // log(`text: ${text}`);
  log(`text.length: ${text.length}`);
  log(`offset: ${offset}`);
  log(`isFirstLine: ${isFirstLine}`);
  log(`isStartOfLine: ${isStartOfLine}`);

    // indentation can only be matched at the start of a line.
  if (isFirstLine || isStartOfLine) {
    let match;
    let currIndentLevel;
    const isZeroIndent = text.length > offset && text[offset] !== ' ' &&
      _.last(matchedTokens) && _.last(matchedTokens).image !== ';';
    if (isZeroIndent) {
      log('zeroIndent!');
      // Matching zero spaces Outdent would not consume any chars,
      // thus it would cause an infinite loop.
      // This check prevents matching a sequence of zero spaces outdents.
      if (lastOffsetChecked !== offset) {
        currIndentLevel = 0;
        log(`setting currIndentLevel to ${currIndentLevel}`);
        match = [''];
        log('settings match to [\'\']');
        lastOffsetChecked = offset;
        log(`lastOffsetChecked to ${lastOffsetChecked}`);
      }
    } else { // possible non-empty indentation
      match = matchWhiteSpace(text, offset);
      log(`settings match to ${match}`);
      if (match !== null) {
        currIndentLevel = match[0].length;
        log(`match is not null, so setting currIndentLevel to ${currIndentLevel}`);
      }
    }

    if (currIndentLevel !== undefined) {
      const lastIndentLevel = _.last(indentStack);
      if (currIndentLevel > lastIndentLevel && type === 'indent') {
        log(`pushing ${currIndentLevel} to ${indentStack}`);
        indentStack.push(currIndentLevel);
        log('indent - return match');
        return match;
      } else if (currIndentLevel < lastIndentLevel && type === 'outdent') {
        // if we need more than one outdent token, add all but the last one
        if (indentStack.length > 2) {
          // const image = '';
          // const offset = _.last(matchedTokens).endOffset + 1;
          // const line = _.last(matchedTokens).endLine;
          // const column = _.last(matchedTokens).endColumn + 1;
          while (indentStack.length > 2 &&
            // stop before the last Outdent
            indentStack[indentStack.length - 2] > currIndentLevel) {
            indentStack.pop();
            log('pushing new (in sequence) outdent token');
            matchedTokens.push(createTokenInstance(Outdent, '', NaN, NaN, NaN, NaN, NaN, NaN));
          }
        }
        indentStack.pop();
        log(`wl;k3jalskdfjas;lkj;xclzxcvlll outdent - returning match ${match}`);
        return match;
      }

      // same indent, this should be lexed as simple whitespace and ignored
      log('same indent, this should be lexed as simple whitespace and ignored');
      return null;
    }

    // indentation cannot be matched without at least one space character.
    log('indentation cannot be matched without at least one space character');
    return null;
  }

  // indentation cannot be matched under other circumstances
  log('indentation cannot be matched under other circumstances');
  return null;
}

/*
function matchIndenBaseOld(text, matchedTokens, groups, type) {
  const noTokensMatchedYet = _.isEmpty(matchedTokens);
  const newLines = groups.nl;
  const noNewLinesMatchedYet = _.isEmpty(newLines);
  const isFirstLine = noTokensMatchedYet && noNewLinesMatchedYet;
  const isStartOfLine =
    // only newlines matched so far
    (noTokensMatchedYet && !noNewLinesMatchedYet) ||
    // Both newlines and other Tokens have been matched AND the last matched Token is a newline
    (!noTokensMatchedYet &&
     !noNewLinesMatchedYet &&
     getStartOffset(_.last(newLines)) > getStartOffset(_.last(matchedTokens)));

  console.log('\n-----------------------------');
  console.log('new execution of matchIndenBast');
  console.log(`text: ${text}`);

  // indentation can only be matched at the start of a line.
  if (isFirstLine || isStartOfLine) {
    let match;
    let currIndentLevel;
    const isZeroIndent = text.length > 0 && text[0] !== ' ';
    if (isZeroIndent) {
      console.log('zeroIndent!');
      // Matching zero spaces Outdent would not consume any chars, thus it
      // would cause an infinite loop.
      // This check prevents matching a sequence of zero spaces outdents.
      if (this.lastTextMatched !== text) {
        currIndentLevel = 0;
        console.log(`setting currIndentLevel to ${currIndentLevel}`);
        match = [''];
        console.log('setting match to [\'\']');
        this.lastTextMatched = text;
        console.log(`setting lastTextMatched to ${this.lastTextMatched}`);
      }
    } else { // possible non-empty indentation
      // match = whiteSpaceRegExp.exec(text);
      match = matchWhiteSpace(text, offset);
      console.log(`setting match to ${match}`);
      if (match !== null) {
        currIndentLevel = match[0].length;
        console.log(`match is null, so setting currIndentLevel to ${currIndentLevel}`);
      }
    }

    if (currIndentLevel !== undefined) {
      const lastIndentLEvel = _.last(this.identStack);
      if (currIndentLevel > lastIndentLEvel && type === 'indent') {
        console.log(`pushing ${currIndentLevel} to endd of ${this.identStack}`);
        this.identStack.push(currIndentLevel);
        console.log(`returning match ${match}`);
        return match;
      } else if (currIndentLevel < lastIndentLEvel && type === 'outdent') {
        console.log(`poping last value from ${this.identStack}`);
        this.identStack.pop();
        console.log(`returning match ${match}`);
        return match;
      }

      // same indent, this should be lexed as simple whitespace and ignored
      console.log('same indent, ignored');
      return null;
    }

    // indentation cannot be matched without at least one space character.
    console.log('indentation cannot be matched');
    return null;
  }

  // indentation cannot be matched under other circumstances
  console.log('indentation cannot be matched');
  return null;
}
*/

/*
 * newlines are not skipped, by setting their group to "nl" they are saved in the lexer result
 * and thus we can check before creating an indentation token that the last token
 * matched was a newline.
*/
const Newline = createToken({ name: 'Newline', pattern: /\n\r|\n|\r/, group: 'nl' });
const Spaces = createToken({ name: 'Spaces', pattern: / +/, group: chevrotain.Lexer.SKIPPED });

// customize matchIndenBase to create separate functions of Indent and Outdent.
const matchIndent = _.partialRight(matchIndentBase, 'indent');
const matchOutdent = _.partialRight(matchIndentBase, 'outdent');

// define the indentation tokens using custom token patterns
const Outdent = createToken({ name: 'Outdent', pattern: matchOutdent });
const Indent = createToken({ name: 'Indent', pattern: matchIndent });

const tokens = [
  Newline,

  // indentation tokens must appear before Spaces, otherwise all
  // indentation will always be consumed as spaces.
  // Outdent must appear before Indent for handling zero spaces outdents.
  Outdent,
  Indent,
  Spaces,
];

export default { tokens, init };
/* eslint-enable no-console, no-use-before-define */
