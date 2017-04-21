import chai from 'chai';
import parser from './index';

const should = chai.should();

describe('Parser', () => {
  it('should parse p', () => {
    const parsingResult = parser('read X X := Y\nwrite Y');

    console.log(JSON.stringify(parsingResult, null, 4)); // eslint-disable-line

    should.not.exist(parsingResult.errors);
    parsingResult.result.should.equal('SUCCESS');
  });
});
