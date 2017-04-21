/* eslint-disable no-unused-expressions */
import chai from 'chai';

import lexer from './index';

chai.should();

const tokenTypes = lexer.tokenTypes;

describe('Lexer', () => {
  let tokens;

  const validateToken = (idx, image, tokenType) => {
    tokens[idx].image.should.equal(image);
    tokens[idx].tokenType.should.equal(tokenType);
  };

  beforeEach(() => {
    tokens = [];
  });

  describe('Lexer - simple echo', () => {
    const msg = 'read X\nY := X\nwrite Y';

    beforeEach(() => {
      const result = lexer.tokenize(msg);
      tokens = result.tokens;

      result.tokens.length.should.equal(7);
      result.errors.length.should.equal(0);
    });

    it('should return valid tokens for token 0: read', () =>
      validateToken(0, 'read', tokenTypes.Read));

    it('should return valid tokens for token 1: X', () =>
      validateToken(1, 'X', tokenTypes.Identifier));

    it('should return valid tokens for token 2: Y', () =>
      validateToken(2, 'Y', tokenTypes.Identifier));

    it('should return valid tokens for token 3: :=', () =>
      validateToken(3, ':=', tokenTypes.Assign));

    it('should return valid tokens for token 4: X', () =>
      validateToken(4, 'X', tokenTypes.Identifier));

    it('should return valid tokens for token 5: write', () =>
      validateToken(5, 'write', tokenTypes.Write));

    it('should return valid tokens for token 6: Y', () =>
      validateToken(6, 'Y', tokenTypes.Identifier));
  });

  describe('Lexer - two variables', () => {
    const msg = `read INPUT
  X := hd INPUT;
  Y := tl INPUT;
  Z := cons Y X
write Z`;

    beforeEach(() => {
      const result = lexer.tokenize(msg);
      tokens = result.tokens;

      result.tokens.length.should.equal(20);
      result.errors.length.should.equal(0);
    });

    it('should return valid tokens for token 0: read', () =>
      validateToken(0, 'read', tokenTypes.Read));

    it('should return valid tokens for token 1: INPUT', () =>
      validateToken(1, 'INPUT', tokenTypes.Identifier));

    it('should return valid tokens for token 2: Indent', () =>
      validateToken(2, '  ', tokenTypes.Indent));

    it('should return valid tokens for token 3: X', () =>
      validateToken(3, 'X', tokenTypes.Identifier));

    it('should return valid tokens for token 4: :=', () =>
      validateToken(4, ':=', tokenTypes.Assign));

    it('should return valid tokens for token 5: hd', () =>
      validateToken(5, 'hd', tokenTypes.Hd));

    it('should return valid tokens for token 6: INPUT', () =>
      validateToken(6, 'INPUT', tokenTypes.Identifier));

    it('should return valid tokens for token 7: ;', () =>
      validateToken(7, ';', tokenTypes.Semicolon));

    it('should return valid tokens for token 8: Outdent', () =>
      validateToken(8, '', tokenTypes.Outdent));

    it('should return valid tokens for token 8: Y', () =>
      validateToken(8, 'Y', tokenTypes.Identifier));

    it('should return valid tokens for token 9: :=', () =>
      validateToken(9, ':=', tokenTypes.Assign));

    it('should return valid tokens for token 10: tl', () =>
      validateToken(10, 'tl', tokenTypes.Tl));

    it('should return valid tokens for token 11: INPUT', () =>
      validateToken(11, 'INPUT', tokenTypes.Identifier));

    it('should return valid tokens for token 12: ;', () =>
      validateToken(12, ';', tokenTypes.Semicolon));

    it('should return valid tokens for token 13: Z', () =>
      validateToken(13, 'Z', tokenTypes.Identifier));

    it('should return valid tokens for token 14: :=', () =>
      validateToken(14, ':=', tokenTypes.Assign));

    it('should return valid tokens for token 15: cons', () =>
      validateToken(15, 'cons', tokenTypes.Cons));

    it('should return valid tokens for token 16: Y', () =>
      validateToken(16, 'Y', tokenTypes.Identifier));

    it('should return valid tokens for token 17: X', () =>
      validateToken(17, 'X', tokenTypes.Identifier));

    it('should return valid tokens for token 18: outdent', () =>
      validateToken(18, '', tokenTypes.Outdent));

    it('should return valid tokens for token 19: write', () =>
      validateToken(19, 'write', tokenTypes.Write));

    it('should return valid tokens for token 20: Z', () =>
      validateToken(20, 'Z', tokenTypes.Identifier));
  });

  describe('Lexer - comments', () => {
    const msg = `read X
  Y := X  # This is an assignment
write Y`;

    it('should return valid groups for comments', () => {
      const result = lexer.tokenize(msg);
      tokens = result.tokens;

      result.errors.length.should.equal(0);

      result.groups.singleLineComments.should.exist;
      result.groups.singleLineComments.length.should.equal(1);

      const comment = result.groups.singleLineComments[0];

      comment.image.should.equal('# This is an assignment');
      comment.startLine.should.equal(2);
    });
  });

  describe('Lexer - literals', () => {
    const validate = (msg) => {
      const result = lexer.tokenize(msg);
      tokens = result.tokens;

      result.errors.length.should.equal(0);
      validateToken(0, msg, tokenTypes.Literal);
    };

    it('should return valid token for nil', () => validate('"nil"'));
    it('should return valid token for nil.nil', () => validate('"nil.nil"'));
    it('should return valid token for (nil.nil)', () => validate('"(nil.nil)"'));
  });
});
/* eslint-enable no-unused-expressions */
