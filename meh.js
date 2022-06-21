const { lexerize } = require('./src');

const input =
  'I am logged as admin with password "123"\n  and then I click the big button';
const tokens = lexerize(input);
console.log(tokens);
