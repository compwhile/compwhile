/* eslint-disable no-unused-expressions, no-console */
import chevrotain from 'chevrotain';
import lexer from './../lexer';

const tokens = lexer.tokens;
const Parser = chevrotain.Parser;

function WhileParser(input) {
  // By default if {recoveryEnabled: true} is not passed in the config object
  // error recovery / fault tolerance capabilities will be disabled
  Parser.call(this, input, lexer.tokensArray, {
    /*
    maxLookahead: 15,
    ignoredIssues: {
      simpleCommand: { OR1: true },
      commandTag: { OR1: true },
      optionalWhilePost: { OR1: true },
      simpleWhile: { OR1: true },
      compoundCommand: { OR1: true },
    },
    */
  });
  const $ = this;

  this.program = $.RULE('program', () => {
    $.SUBRULE($.readStatement);
    $.CONSUME(tokens.Indent);
    $.SUBRULE($.compoundCommand);
    $.CONSUME(tokens.Outdent);
    $.SUBRULE($.writeStatement);
  });

  this.compoundCommand = $.RULE('compoundCommand', () => {
    $.OPTION(() => {
      $.OR1([
        { ALT() { $.SUBRULE($.simpleCommand); } },
      ]);
      $.SUBRULE($.commandTag);
    });
  });

  this.simpleCommand = $.RULE('simpleCommand', () => {
    $.OR1([
      { ALT() { $.SUBRULE($.whileCommand); } },
      { ALT() { $.SUBRULE($.assignCommand); } },
    ]);
  });

  this.assignCommand = $.RULE('assignCommand', () => {
    $.CONSUME(tokens.Identifier);
    $.CONSUME(tokens.Assign);
    $.CONSUME2(tokens.Identifier);
  });

  this.whileCommand = $.RULE('whileCommand', () => {
    $.CONSUME(tokens.While);
    $.SUBRULE($.condition);
    $.CONSUME(tokens.Do);
    $.CONSUME(tokens.Indent);
    $.SUBRULE($.compoundCommand);
    $.OPTION(() => {
      $.CONSUME(tokens.Outdent);
      $.SUBRULE.commandTag;
    });
  });

  this.commandTag = $.RULE('commandTag', () => {
    $.OPTION2(() => {
      $.CONSUME(tokens.Semicolon);
      $.SUBRULE($.simpleCommand);
      $.SUBRULE($.commandTag);
    });
  });

  this.condition = $.RULE('condition', () => {
    $.CONSUME(tokens.LParen);
    $.SUBRULE($.expression);
    $.CONSUME(tokens.RParen);
  });

  this.expression = $.RULE('expression', () => {
    $.CONSUME(tokens.Identifier);
  });

  this.readStatement = $.RULE('readStatement', () => {
    $.CONSUME(tokens.Read);
    $.CONSUME(tokens.Identifier).image;
  });

  this.writeStatement = $.RULE('writeStatement', () => {
    $.CONSUME(tokens.Write);
    $.CONSUME(tokens.Identifier).image;
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
