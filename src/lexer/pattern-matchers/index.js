import chevrotain from 'chevrotain';
import _ from 'lodash';

const getStartOffset = chevrotain.getStartOffset;

const whiteSpaceRegExp = /^ +/;

/**
 * This custom Token matcher uses Lexer context ("matchedTokens" and "groups" arguments)
 * combined with state via closure ("indentStack" and "lastTextMatched") to match indentation.
 *
 * @param {string} text - remaining text to lex, sent by the Chevrotain lexer.
 * @param {ISimpleTokenOrIToken[]} matchedTokens -
 *                            Tokens lexed so far, sent by the Chevrotain Lexer.
 * @param {object} groups - Token groups already lexed, sent by the Chevrotain Lexer.
 * @param {string} type - determines if this function matches Indent or Outdent tokens.
 * @returns {*}
 */
function matchIndenBase(text, matchedTokens, groups, type) {
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

  // indentation can only be matched at the start of a line.
  if (isFirstLine || isStartOfLine) {
    let match;
    let currIndentLevel;
    const isZeroIndent = text.length > 0 && text[0] !== ' ';
    if (isZeroIndent) {
      // Matching zero spaces Outdent would not consume any chars, thus it
      // would cause an infinite loop.
      // This check prevents matching a sequence of zero spaces outdents.
      if (this.lastTextMatched !== text) {
        currIndentLevel = 0;
        match = [''];
        this.lastTextMatched = text;
      }
    } else { // possible non-empty indentation
      match = whiteSpaceRegExp.exec(text);
      if (match !== null) {
        currIndentLevel = match[0].length;
      }
    }

    if (currIndentLevel !== undefined) {
      const lastIndentLEvel = _.last(this.identStack);
      if (currIndentLevel > lastIndentLEvel && type === 'indent') {
        this.identStack.push(currIndentLevel);
        return match;
      } else if (currIndentLevel < lastIndentLEvel && type === 'outdent') {
        this.identStack.pop();
        return match;
      }

      // same indent, this should be lexed as simple whitespace and ignored
      return null;
    }

    // indentation cannot be matched without at least one space character.
    return null;
  }

  // indentation cannot be matched under other circumstances
  return null;
}

// customize matchIndenBase to create separate functions of Indent and Outdent.
const matchIndent = _.partialRight(matchIndenBase, 'indent');
const matchOutdent = _.partialRight(matchIndenBase, 'outdent');

export default { matchIndent, matchOutdent };
