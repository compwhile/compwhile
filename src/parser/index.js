/* eslint-disable no-unused-expressions, no-console */
import chevrotain from 'chevrotain';
import lexer from './../lexer';

const tokens = lexer.tokens;
const Parser = chevrotain.Parser;

function WhileParser(input) {
  // By default if {recoveryEnabled: true} is not passed in the config object
  // error recovery / fault tolerance capabilities will be disabled
  Parser.call(this, input, lexer.tokensArray);
  const $ = this;

  this.program = $.RULE('program', () => {
    $.SUBRULE($.readStatement);
    console.log('Read Statement was consumed');
    $.CONSUME(tokens.Indent);
    $.SUBRULE($.commandStatement);
    console.log('Command Statement was consumed');
    $.CONSUME(tokens.Outdent);
    $.SUBRULE($.writeStatement);
    console.log('Write Statement was consumed');
  });

  this.readStatement = $.RULE('readStatement', () => {
    $.CONSUME(tokens.Read);
    console.log('Read was consumed');
    $.CONSUME(tokens.Identifier).image;
  });

  this.writeStatement = $.RULE('writeStatement', () => {
    $.CONSUME(tokens.Write);
    console.log('Write was consumed');
    $.CONSUME(tokens.Identifier).image;
  });

  this.optional = $.RULE('optional', () => {
    $.CONSUME(tokens.Semicolon);
    $.SUBRULE($.commandStatement);
  });

  this.indentOptional = $.RULE('indentOptional', () => {
    $.CONSUME(tokens.Semicolon);
    $.CONSUME(tokens.Outdent);
    $.SUBRULE($.commandStatement);
  });

  this.commandStatement = $.RULE('commandStatement', () => {
    $.OR([
      {
        ALT: () => {
          $.SUBRULE1($.assignCommand);
          $.OPTION1(() => {
            $.SUBRULE2($.optional);
          });
        },
      },
      {
        ALT: () => {
          $.SUBRULE3($.whileCommand);
          $.OPTION2(() => {
            $.SUBRULE4($.indentOptional);
          });
        },
      },
      {
        ALT: () => {
          $.SUBRULE($.ifElseCommand);
          $.OPTION3(() => {
            $.SUBRULE5($.indentOptional);
          });
        },
      },
    ]);
  });

  /*
  this.commandStatement = $.RULE('commandStatement', () => {
    $.OR([
      { ALT() { $.SUBRULE($.assignCommand); } },
      { ALT() { $.SUBRULE($.whileCommand); } },
      { ALT() { $.SUBRULE($.ifElseCommand); } },
      { ALT() { $.SUBRULE($.sequentialCommand); } },
    ]);
  });
  */

  this.assignCommand = $.RULE('assignCommand', () => {
    $.CONSUME(tokens.Identifier);
    $.CONSUME(tokens.Assign);
    $.CONSUME2(tokens.Identifier);
  });

  this.condition = $.RULE('condition', () => {
    $.CONSUME(tokens.LParen);
    $.SUBRULE($.expression);
    $.CONSUME(tokens.RParen);
  });

  this.expression = $.RULE('expression', () => {
    $.CONSUME(tokens.Identifier);
  });

  this.ifElseCommand = $.RULE('ifElseCommand', () => {
    $.CONSUME(tokens.If);
    $.SUBRULE($.condition);
    $.CONSUME(tokens.Indent);
    $.SUBRULE($.commandStatement);
    $.CONSUME(tokens.Outdent);
    $.CONSUME(tokens.Else);
    $.CONSUME2(tokens.Indent);
    $.SUBRULE2($.commandStatement);
  });

  this.whileCommand = $.RULE('whileCommand', () => {
    $.CONSUME(tokens.While);
    $.SUBRULE($.condition);
    $.CONSUME(tokens.Do);
    $.CONSUME(tokens.Indent);
    $.SUBRULE($.commandStatement);
  });

  this.sequentialCommand = $.RULE('sequentialCommand', () => {
    $.SUBRULE($.commandStatement);
    $.CONSUME(tokens.Semicolon);
    $.SUBRULE2($.commandStatement);
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
