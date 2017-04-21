import lexer from './lexer';
import parser from './parser';

function hi() {
  debugger;
  const parsingResult = parser(`read X
  X := Y
write Y`);

  console.log(JSON.stringify(parsingResult, null, 4)); // eslint-disable-line
}

setTimeout(hi, 10000);

export default { lexer, parser };
