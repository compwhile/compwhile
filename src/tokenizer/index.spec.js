import chai from 'chai';

import tokenizer from './index';

chai.should();

describe('Tokenizer', () => {
  it('should echo', () => {
    const msg = 'hello compwhile';
    const result = tokenizer(msg);

    result.should.equal(msg);
  });
});
