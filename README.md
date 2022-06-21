# @agarimo/lexer

## Introduction

This package provides the class _Lexer_ that is the basic class to build parsers.

## Installation

You can install it using NPM

```shell
  npm i @agarimo/lexer
```

## Token Types
- Identifier: 1
- Number: 2
- String: 3
- Operator: 4
- Separator: 5
- EndOfLine: 6
- Assignment: 7
- EndOfFile: 8

## Example of use

```javascript
const { Lexer } = require('@agarimo/lexer');

const script = `
n = 0
while n < 10:
  n += 1
print("hola")
`

const lexer = new Lexer();
lexer.init(script);
let token;
while (!token || token.type !== Lexer.TokenType.EndOfFile) {
  token = lexer.nextToken();
  console.log(token);
}
```

This will show in console:

```shell
Token { value: 'n', type: 1 }
Token { value: '=', type: 7 }
Token { value: '0', type: 2 }
Token { value: '\n', type: 6 }
Token { value: 'while', type: 1 }
Token { value: 'n', type: 1 }
Token { value: '<', type: 4 }
Token { value: '10', type: 2 }
Token { value: ':', type: 5 }
Token { value: '\n', type: 6 }
Token { value: 'n', type: 1 }
Token { value: '+=', type: 7 }
Token { value: '1', type: 2 }
Token { value: '\n', type: 6 }
Token { value: 'print', type: 1 }
Token { value: '(', type: 5 }
Token { value: 'hola', type: 3 }
Token { value: ')', type: 5 }
Token { value: '', type: 8 }
```

