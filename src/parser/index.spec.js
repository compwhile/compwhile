import chai from 'chai';
import parser from './index';

const should = chai.should();

describe.only('Parser', () => {
  it('should parse while', () => {
    const parsingResult = parser(`read X
  while (X) do
    Y := X
write Y`);

    console.log(JSON.stringify(parsingResult, null, 4)); // eslint-disable-line

    should.not.exist(parsingResult.errors);
    parsingResult.result.should.equal('SUCCESS');
  });

  it('should parse if-else', () => {
    // TODO: why after else the whole block is considered as one seq.command
    // "X := Y;   while (X)"
    const parsingResult = parser(`read X
  if (X)
    Y := X
  else
    X := Y;
  while (X)
    X := Y
write Y`);

    console.log(JSON.stringify(parsingResult, null, 4)); // eslint-disable-line

    should.not.exist(parsingResult.errors);
    parsingResult.result.should.equal('SUCCESS');
  });

  it('should parse 3 assignments', () => {
    const parsingResult = parser(`read X
  Y := X;
  X := Y;
  Y := Z
write Y`);

    console.log(JSON.stringify(parsingResult, null, 4)); // eslint-disable-line

    should.not.exist(parsingResult.errors);
    parsingResult.result.should.equal('SUCCESS');
  });
});
