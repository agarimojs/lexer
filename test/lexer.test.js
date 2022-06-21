const { Lexer, lexerize } = require('../src');

describe('Lexer', () => {
  describe('Constructor', () => {
    test('Constructor', () => {
      const lexer = new Lexer();
      expect(lexer).toBeDefined();
    });
  });

  describe('Init', () => {
    test('Should init text', () => {
      const lexer = new Lexer();
      lexer.init('This is a text');
      expect(lexer.text).toEqual('This is a text');
    });
  });

  describe('Next Token', () => {
    test('Next Token', () => {
      const script = `
      n = 0
      while n < 10:
        n += 1.2
      print("hola")
      `;
      const lexer = new Lexer();
      lexer.init(script);
      const tokens = [];
      for (let i = 0; i < 20; i += 1) {
        tokens.push(lexer.nextToken());
      }
      expect(tokens[0].value).toEqual('n');
      expect(tokens[0].type).toEqual(Lexer.TokenType.Identifier);
      expect(tokens[1].value).toEqual('=');
      expect(tokens[1].type).toEqual(Lexer.TokenType.Assignment);
      expect(tokens[2].value).toEqual('0');
      expect(tokens[2].type).toEqual(Lexer.TokenType.Number);
      expect(tokens[3].value).toEqual('\n');
      expect(tokens[3].type).toEqual(Lexer.TokenType.EndOfLine);
      expect(tokens[4].value).toEqual('while');
      expect(tokens[4].type).toEqual(Lexer.TokenType.Identifier);
      expect(tokens[5].value).toEqual('n');
      expect(tokens[5].type).toEqual(Lexer.TokenType.Identifier);
      expect(tokens[6].value).toEqual('<');
      expect(tokens[6].type).toEqual(Lexer.TokenType.Operator);
      expect(tokens[7].value).toEqual('10');
      expect(tokens[7].type).toEqual(Lexer.TokenType.Number);
      expect(tokens[8].value).toEqual(':');
      expect(tokens[8].type).toEqual(Lexer.TokenType.Separator);
      expect(tokens[9].value).toEqual('\n');
      expect(tokens[9].type).toEqual(Lexer.TokenType.EndOfLine);
      expect(tokens[10].value).toEqual('n');
      expect(tokens[10].type).toEqual(Lexer.TokenType.Identifier);
      expect(tokens[11].value).toEqual('+=');
      expect(tokens[11].type).toEqual(Lexer.TokenType.Assignment);
      expect(tokens[12].value).toEqual('1.2');
      expect(tokens[12].type).toEqual(Lexer.TokenType.Number);
      expect(tokens[13].value).toEqual('\n');
      expect(tokens[13].type).toEqual(Lexer.TokenType.EndOfLine);
      expect(tokens[14].value).toEqual('print');
      expect(tokens[14].type).toEqual(Lexer.TokenType.Identifier);
      expect(tokens[15].value).toEqual('(');
      expect(tokens[15].type).toEqual(Lexer.TokenType.Separator);
      expect(tokens[16].value).toEqual('hola');
      expect(tokens[16].type).toEqual(Lexer.TokenType.String);
      expect(tokens[17].value).toEqual(')');
      expect(tokens[17].type).toEqual(Lexer.TokenType.Separator);
      expect(tokens[18].value).toEqual('');
      expect(tokens[18].type).toEqual(Lexer.TokenType.EndOfFile);
      expect(tokens[19].value).toEqual('');
      expect(tokens[19].type).toEqual(Lexer.TokenType.EndOfFile);
    });
  });
});

describe('lexerize', () => {
  test('It should lexerize an script', () => {
    const input =
      'I am logged as admin with password "123"\n  and then I click the big button';
    const expected = [
      { value: 'I', type: 1 },
      { value: 'am', type: 1 },
      { value: 'logged', type: 1 },
      { value: 'as', type: 1 },
      { value: 'admin', type: 1 },
      { value: 'with', type: 1 },
      { value: 'password', type: 1 },
      { value: '123', type: 3 },
      { value: '\n', type: 6 },
      { value: 'and', type: 1 },
      { value: 'then', type: 1 },
      { value: 'I', type: 1 },
      { value: 'click', type: 1 },
      { value: 'the', type: 1 },
      { value: 'big', type: 1 },
      { value: 'button', type: 1 },
      { value: '', type: 8 },
    ];
    const actual = lexerize(input);
    expect(actual).toEqual(expected);
  });
});
