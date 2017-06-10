/* eslint-disable no-unused-expressions, no-console */
import chevrotain from 'chevrotain';
import lexer from './../lexer';

const tokens = lexer.tokens;
const Parser = chevrotain.Parser;

function WhileParser(input) {
  // By default if {recoveryEnabled: true} is not passed in the config object
  // error recovery / fault tolerance capabilities will be disabled
  Parser.call(this, input, lexer.tokensArray, {
    // maxLookahead: 5,
    // ignoredIssues: { commandStatement: { OR2: true } },
  });
  const $ = this;

  this.program = $.RULE('program', () => {
    $.SUBRULE($.readStatement);
    $.CONSUME(tokens.Indent);
    $.SUBRULE($.compoundCommand);
    $.CONSUME(tokens.Outdent);
    $.SUBRULE($.writeStatement);
  });

  this.readStatement = $.RULE('readStatement', () => {
    $.CONSUME(tokens.Read);
    $.CONSUME(tokens.Identifier).image;
  });

  this.writeStatement = $.RULE('writeStatement', () => {
    $.CONSUME(tokens.Write);
    $.CONSUME(tokens.Identifier).image;
  });

  this.condition = $.RULE('condition', () => {
    $.CONSUME(tokens.LParen);
    $.SUBRULE($.expression);
    $.CONSUME(tokens.RParen);
  });

  this.expression = $.RULE('expression', () => {
    $.CONSUME(tokens.Identifier);
  });

  this.compoundCommand = $.RULE('compoundCommand', () => {
    $.OR([
      {
        ALT() {
          $.SUBRULE($.compoundCommand);
          $.CONSUME(tokens.Semicolon);
          $.SUBRULE($.command);
        },
      },
      {
        ALT() {
          $.CONSUME(tokens.While);
          $.SUBRULE($.condition);
          $.CONSUME(tokens.Do);
          $.CONSUME(tokens.Indent);
          $.SUBRULE($.compoundCommand);
          $.OR([
            {
              ALT() {
                $.CONSUME(tokens.Outdent);
              },
            },
            {
              ALT() {
                $.CONSUME(tokens.Semicolon);
                $.CONSUME2(tokens.Outdent);
                $.SUBRULE($.compoundCommand);
              },
            },
          ]);
        },
      },
      {
        ALT() {
          $.SUBRULE($.command);
        },
      },
    ]);
  });

  this.command = $.RULE('command', () => {
    $.CONSUME(tokens.Identifier);
    $.CONSUME(tokens.Assign);
    $.CONSUME2(tokens.Identifier);
  });

  Parser.performSelfAnalysis(this);
}

WhileParser.prototype = Object.create(Parser.prototype);
WhileParser.prototype.constructor = WhileParser;

const parser = new WhileParser();

function parse(text) {
  const lexResult = lexer.tokenize(text);

  if (lexResult.errors.length > 0) {
    return { lexErrors: lexResult.errors };
  }

  parser.input = lexResult.tokens;
  parser.program();

  if (parser.errors.length > 0) {
    return { errors: parser.errors };
  }

  return { result: 'SUCCESS', lexResult };
}

export default parse;
/* eslint-enable no-unused-expressions, no-console */
