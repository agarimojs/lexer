const Lexer = require('./lexer');

function lexerize(str, settings) {
  const lexer = new Lexer(settings);
  return lexer.tokenize(str);
}

module.exports = {
  Lexer,
  lexerize,
};
