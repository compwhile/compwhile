/* eslint-disable no-unused-expressions */
import chevrotain from 'chevrotain';
import lexer from './../lexer';

debugger;
const tokens = lexer.tokens;

const Parser = chevrotain.Parser;

function WhileParser(input) {
  // By default if {recoveryEnabled: true} is not passed in the config object
  // error recovery / fault tolerance capabilities will be disabled
  Parser.call(this, input, lexer.tokensArray);
  const $ = this;

  this.program = $.RULE('program', () => {
    $.SUBRULE($.readStatement);
    $.SUBRULE($.commandStatement);
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

  this.commandStatement = $.RULE('commandStatement', () => {
    // $.CONSUME(tokens.Indent).image;

    $.OR([
      { ALT() { $.SUBRULE($.assignCommand); } },
    ]);
  });

  this.assignCommand = $.RULE('assignCommand', () => {
    $.CONSUME(tokens.Identifier);
    $.CONSUME(tokens.Assign);
    $.CONSUME2(tokens.Identifier);
  });

  // very important to call this after all the rules have been defined.
  // otherwise the parser may not work correctly as it will lack information
  // derived during the self analysis phase.
  Parser.performSelfAnalysis(this);
}

WhileParser.prototype = Object.create(Parser.prototype);
WhileParser.prototype.constructor = WhileParser;

const parser = new WhileParser();

function parse(text) {
  const lexingResult = lexer.tokenize(text);

  if (lexingResult.errors.length > 0) {
    return { lexErrors: lexingResult.errors };
  }

  parser.input = lexingResult.tokens;
  parser.program();

  if (parser.errors.length > 0) {
    return { errors: parser.errors };
  }

  return { result: 'SUCCESS' };
}

export default parse;
/* eslint-enable no-unused-expressions */
