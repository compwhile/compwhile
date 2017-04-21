import chevrotain from 'chevrotain';
import patterns from './pattern-matchers';

debugger;
const createToken = chevrotain.createToken;
const context = { indentStack: [0] };

// newlines are not skipped, by setting their group to "nl" they are saved in the lexer result
// and thus we can check before creating an indentation token that the last token
// matched was a newline.
const Newline = createToken({ name: 'Newline', pattern: /\n\r|\n|\r/, group: 'nl' });
const Spaces = createToken({ name: 'Spaces', pattern: / +/, group: chevrotain.Lexer.SKIPPED });

const matchIndent = (...args) => (patterns.matchIndent.call(context, ...args));
const matchOutdent = (...args) => (patterns.matchOutdent.call(context, ...args));

// define the indentation tokens using custom token patterns
const Indent = createToken({ name: 'Indent', pattern: matchIndent });
const Outdent = createToken({ name: 'Outdent', pattern: matchOutdent });

// const Whitespace = createToken({
  // name: 'Whitespace',
  // pattern: /\s+/,
  // // pattern: /[\r\n\t\f\v]*/,
  // group: chevrotain.Lexer.SKIPPED,
// });
//
const Identifier = createToken({ name: 'Identifier', pattern: /\w+/ });
const Integer = createToken({ name: 'Integer', pattern: /\d+/ });
const Assign = createToken({ name: 'Assign', pattern: /:=/ });
const Semicolon = createToken({ name: 'Semicolon', pattern: /;/ });
const LParen = createToken({ name: 'LParen', pattern: /\(/ });
const RParen = createToken({ name: 'RParen', pattern: /\)/ });
const Comment = createToken({
  name: 'Comment',
  pattern: /#.+/,
  // a Token's group may be a 'free' String, in that case the lexer's result will contain
  // an additional array of all the tokens matched for each group under the 'group' object
  // for example in this case: lexResult.groups['singleLineComments']
  group: 'singleLineComments',
});
const Literal = createToken({ name: 'Literal', pattern: /"["nil".()]+"/ });

/*
 * KEYWORDS
 */
const Keyword = createToken({
  name: 'Keyword',
  pattern: chevrotain.Lexer.NA,
  // LONGER_ALT will make the Lexer prefer a longer identifier over a Keyword.
  longer_alt: Identifier,
});
const Read = createToken({ name: 'Read', pattern: /read/, parent: Keyword });
const Write = createToken({ name: 'Write', pattern: /write/, parent: Keyword });
const Hd = createToken({ name: 'Hd', pattern: /hd/, parent: Keyword });
const Tl = createToken({ name: 'Tl', pattern: /tl/, parent: Keyword });
const Cons = createToken({ name: 'Cons', pattern: /cons/, parent: Keyword });
const While = createToken({ name: 'While', pattern: /while/, parent: Keyword });
const Do = createToken({ name: 'Do', pattern: /do/, parent: Keyword });
const If = createToken({ name: 'If', pattern: /if/, parent: Keyword });
const Then = createToken({ name: 'Then', pattern: /then/, parent: Keyword });
const Else = createToken({ name: 'Else', pattern: /else/, parent: Keyword });

const tokensArray = [
  Newline,

  // indentation tokens must appear before Spaces, otherwise all
  // indentation will always be consumed as spaces.
  // Outdent must appear before Indent for handling zero spaces outdents.
  Outdent,
  Indent,
  Spaces,
  Integer,
  Literal,
  Semicolon,
  LParen, RParen,
  Assign,
  Keyword, Read, Write, Hd, Tl, Cons, // keywords
  While, Do, If, Then, Else, Comment,
  Identifier, // identifier must appear after ALL keyword tokens
];
const whileLexer = new chevrotain.Lexer(tokensArray);


function tokenize(text) {
  context.identStack = [0];
  context.lastTextMatched = undefined;

  const lexResult = whileLexer.tokenize(text);

  return lexResult;
}

const tokenTypesArray = tokensArray.map(token =>
  ({ key: token.tokenName, value: token.tokenType }));
const tokenTypes = tokenTypesArray.reduce((acc, token) => {
  acc[token.key] = token.value;

  return acc;
}, {});
const tokensKeyValueArray = tokensArray.map(token =>
  ({ key: token.tokenName, value: token }));
const tokens = tokensKeyValueArray.reduce((acc, token) => {
  acc[token.key] = token.value;

  return acc;
}, {});

export default { tokenize, tokenTypes, tokens, tokensArray };
