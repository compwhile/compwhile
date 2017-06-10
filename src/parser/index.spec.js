import chai from 'chai';
import parser from './index.comp.rec';

const should = chai.should();

describe.only('Parser', () => {
  const verifySuccess = (parsingResult) => {
    console.log(JSON.stringify(parsingResult, null, 4)); // eslint-disable-line

    should.not.exist(parsingResult.errors);
    parsingResult.result.should.equal('SUCCESS');
  };

  /*
  it.only('should parse the no commands program (P00)', () => {
    const parsingResult = parser(`read X
write X`);

    verifySuccess(parsingResult);
  });
  */

  it.only('should parse simple assignment (P01)', () => {
    const parsingResult = parser(`read X
    Y := X
write Y`);

    verifySuccess(parsingResult);
  });

  it.only('should parse sequential assignment (P02)', () => {
    const parsingResult = parser(`read X
    Y := X;
    Y := X
write Y`);

    verifySuccess(parsingResult);
  });

  it.only('should parse complex sequential assignment (P03)', () => {
    const parsingResult = parser(`read X
    Y := X;
    Y := X;
    Y := X
write Y`);

    verifySuccess(parsingResult);
  });

  it.only('should parse complex sequential assignment (P04)', () => {
    const parsingResult = parser(`read X
    Y := X;
    Y := X;
    Y := X;
    Y := X
write Y`);

    verifySuccess(parsingResult);
  });

  it.only('should parse simple while (P05)', () => {
    const parsingResult = parser(`read X
  while (X) do
    Y := X
write Y`);

    verifySuccess(parsingResult);
  });

  it.only('should parse while with sequential assignment (P06)', () => {
    const parsingResult = parser(`read X
  while (X) do
    Y := X;
    X := Y
write Y`);

    verifySuccess(parsingResult);
  });

  it.only('should parse while with complex sequential assignment (P07)', () => {
    const parsingResult = parser(`read X
  while (X) do
    Y := X;
    Y := X;
    X := Y
write Y`);

    verifySuccess(parsingResult);
  });

  it.only('should parse assignment followed by while (P08)', () => {
    const parsingResult = parser(`read X
  Y := X;
  while (X) do
    X := Y
write Y`);

    verifySuccess(parsingResult);
  });

  it.only('should parse two assignments followed by while (P09)', () => {
    const parsingResult = parser(`read X
  Y := X;
  X := Y;
  while (X) do
    X := Y
write Y`);

    verifySuccess(parsingResult);
  });

  it.only('should parse while followed by assignment (P10)', () => {
    const parsingResult = parser(`read X
  while (X) do
    X := Y;
  Y := X
write Y`);

    verifySuccess(parsingResult);
  });

  it.only('should parse while followed by assignment (P11)', () => {
    const parsingResult = parser(`read X
  while (X) do
    X := Y;
    Y := X;
  X := Y
write Y`);

    verifySuccess(parsingResult);
  });
});
