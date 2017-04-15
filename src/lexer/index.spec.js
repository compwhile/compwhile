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
    const msg = `read X
  Y := X
write Y`;

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

      result.tokens.length.should.equal(19);
      result.errors.length.should.equal(0);
    });

    it('should return valid tokens for token 0: read', () =>
      validateToken(0, 'read', tokenTypes.Read));

    it('should return valid tokens for token 1: INPUT', () =>
      validateToken(1, 'INPUT', tokenTypes.Identifier));

    it('should return valid tokens for token 2: X', () =>
      validateToken(2, 'X', tokenTypes.Identifier));

    it('should return valid tokens for token 3: :=', () =>
      validateToken(3, ':=', tokenTypes.Assign));

    it('should return valid tokens for token 4: hd', () =>
      validateToken(4, 'hd', tokenTypes.Hd));

    it('should return valid tokens for token 5: INPUT', () =>
      validateToken(5, 'INPUT', tokenTypes.Identifier));

    it('should return valid tokens for token 6: ;', () =>
      validateToken(6, ';', tokenTypes.Semicolon));

    it('should return valid tokens for token 7: Y', () =>
      validateToken(7, 'Y', tokenTypes.Identifier));

    it('should return valid tokens for token 8: :=', () =>
      validateToken(8, ':=', tokenTypes.Assign));

    it('should return valid tokens for token 9: tl', () =>
      validateToken(9, 'tl', tokenTypes.Tl));

    it('should return valid tokens for token 10: INPUT', () =>
      validateToken(10, 'INPUT', tokenTypes.Identifier));

    it('should return valid tokens for token 11: ;', () =>
      validateToken(11, ';', tokenTypes.Semicolon));

    it('should return valid tokens for token 12: Z', () =>
      validateToken(12, 'Z', tokenTypes.Identifier));

    it('should return valid tokens for token 13: :=', () =>
      validateToken(13, ':=', tokenTypes.Assign));

    it('should return valid tokens for token 14: cons', () =>
      validateToken(14, 'cons', tokenTypes.Cons));

    it('should return valid tokens for token 15: Y', () =>
      validateToken(15, 'Y', tokenTypes.Identifier));

    it('should return valid tokens for token 16: X', () =>
      validateToken(16, 'X', tokenTypes.Identifier));

    it('should return valid tokens for token 17: write', () =>
      validateToken(17, 'write', tokenTypes.Write));

    it('should return valid tokens for token 18: Z', () =>
      validateToken(18, 'Z', tokenTypes.Identifier));
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
