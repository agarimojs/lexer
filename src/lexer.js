class Lexer {
  constructor(settings = {}) {
    this.lastToken = {
      position: -1,
      value: '',
      type: 0,
    };
    this.operators = settings.operators || [
      '+',
      '-',
      '*',
      '/',
      '.',
      '>',
      '<',
      '<=',
      '>=',
      '!=',
      '<>',
      '**',
      '==',
      '%',
      '|',
      '&',
      '||',
      '&&',
    ];
    this.assignments = settings.assignments || ['=', '+=', '-=', '*=', '/='];
    this.separators = settings.separators || [
      '(',
      ')',
      '[',
      ']',
      '{',
      '}',
      ',',
      ':',
      ';',
    ];
    if (settings.extraOperators) {
      this.operators.push(...settings.extraOperators);
    }
    if (settings.extraAssignments) {
      this.assignments.push(...settings.extraAssignments);
    }
    if (settings.extraSeparators) {
      this.separators.push(...settings.extraSeparators);
    }
    this.buildDicts();
  }

  static buildDict(item) {
    let result = item;
    if (typeof result === 'string') {
      result = result.split('');
    }
    if (Array.isArray(result)) {
      const obj = {};
      for (let i = 0; i < result.length; i += 1) {
        obj[result[i]] = true;
      }
      result = obj;
    }
    return result;
  }

  buildDicts() {
    this.operators = Lexer.buildDict(this.operators);
    this.separators = Lexer.buildDict(this.separators);
    this.assignments = Lexer.buildDict(this.assignments);
  }

  init(text = '') {
    this.text = Lexer.clearText(text);
    this.length = this.text.length;
    this.position = 0;
    this.next = [];
  }

  static clearText(text) {
    let result = text.replace(/\r/g, '');
    result = result.replace(/\t/g, '  ').trim();
    const lines = result.split('\n');
    const deflines = [];
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (line.trim()) {
        deflines.push(line);
      }
    }
    return `${deflines.join('\n')}`;
  }

  static isEndOfLine(ch) {
    return ch === '\n';
  }

  isSeparator(ch) {
    return this.separators[ch];
  }

  static isSpace(ch) {
    return ch <= ' ' && ch !== '\n';
  }

  isAssignment(ch) {
    return this.assignments[ch];
  }

  static isAlpha(ch) {
    return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z');
  }

  static isNumeric(ch) {
    return ch >= '0' && ch <= '9';
  }

  static isNameCharacter(ch, first = false) {
    return Lexer.isAlpha(ch) || (!first && Lexer.isNumeric(ch)) || ch === '_';
  }

  isOperator(ch) {
    return this.operators[ch];
  }

  nextByCondition(initial, condition) {
    let result = initial;
    let ch = this.nextChar();
    while (condition(ch)) {
      result += ch;
      ch = this.nextChar();
    }
    return result;
  }

  nextName(letter) {
    if (Lexer.isNameCharacter(letter, true)) {
      const name = this.nextByCondition(
        letter,
        (ch) => ch && Lexer.isNameCharacter(ch)
      );
      this.goBack();
      return { value: name, type: Lexer.TokenType.Identifier };
    }
    return undefined;
  }

  nextString(quote) {
    if (quote === '"' || quote === "'") {
      const value = this.nextByCondition('', (ch) => ch && ch !== quote);
      return { value, type: Lexer.TokenType.String };
    }
    return undefined;
  }

  nextNumber(digit) {
    if (Lexer.isNumeric(digit)) {
      let number = digit;
      let ch = this.nextChar();
      while (Lexer.isNumeric(ch)) {
        number += ch;
        ch = this.nextChar();
      }
      if (ch === '.') {
        number += ch;
        ch = this.nextChar();
        while (Lexer.isNumeric(ch)) {
          number += ch;
          ch = this.nextChar();
        }
      }
      this.goBack();
      return { value: number, type: Lexer.TokenType.Number };
    }
    return undefined;
  }

  nextSeparator(ch) {
    if (this.isSeparator(ch)) {
      return { value: ch, type: Lexer.TokenType.Separator };
    }
    return undefined;
  }

  nextOperatorOrAssignment(ch, firstCall = true) {
    if (this.isOperator(ch) || this.isAssignment(ch)) {
      let nextCh = this.nextChar();
      if (nextCh && !Lexer.isSpace(nextCh)) {
        nextCh = ch + nextCh;
        if (this.isOperator(nextCh)) {
          return { value: nextCh, type: Lexer.TokenType.Operator };
        }
        if (this.isAssignment(nextCh)) {
          return { value: nextCh, type: Lexer.TokenType.Assignment };
        }
      }
      this.goBack();
      return {
        value: ch,
        type: this.isOperator(ch)
          ? Lexer.TokenType.Operator
          : Lexer.TokenType.Assignment,
      };
    }
    if (firstCall) {
      const ch2 = this.nextChar();
      const result = this.nextOperatorOrAssignment(ch + ch2, false);
      if (!result) {
        this.goBack();
      }
      return result;
    }
    return undefined;
  }

  goBack() {
    if (this.position >= this.length - 1 && this.text[this.position] === '\n') {
      return;
    }
    this.position -= 1;
  }

  nextChar() {
    if (this.position > this.length) {
      return undefined;
    }
    let ch = this.text[this.position];
    this.position += 1;
    if (ch === '#') {
      ch = this.nextChar();
      while (ch && !Lexer.isEndOfLine(ch)) {
        ch = this.nextChar();
      }
    }
    return ch;
  }

  skipSpaces() {
    let ch = this.nextChar();
    while (ch && Lexer.isSpace(ch)) {
      ch = this.nextChar();
    }
    this.goBack();
  }

  nextFirstChar() {
    this.skipSpaces();
    return this.nextChar();
  }

  nextToken() {
    if (this.next.length) {
      return this.next.pop();
    }
    const ch = this.nextFirstChar();
    const token =
      this.nextName(ch) ||
      this.nextNumber(ch) ||
      this.nextOperatorOrAssignment(ch) ||
      this.nextSeparator(ch) ||
      this.nextString(ch);
    if (token) {
      if (
        this.lastToken.position === this.position &&
        this.lastToken.value === token.value &&
        this.lastToken.type === token.type
      ) {
        return { value: '', type: Lexer.TokenType.EndOfFile };
      }
      this.lastToken = {
        position: this.position,
        value: token.value,
        type: token.type,
      };
      return token;
    }
    if (this.position >= this.length) {
      return { value: '', type: Lexer.TokenType.EndOfFile };
    }
    if (Lexer.isEndOfLine(ch)) {
      if (this.position === this.length - 1) {
        this.position = this.length;
      }
      return { value: ch, type: Lexer.TokenType.EndOfLine };
    }
    throw new Error(`Unexpected "${ch}"`);
  }

  pushToken(token) {
    if (token) {
      this.next.push(token);
    }
  }

  getIndent() {
    let indent = 0;
    let ch;
    let pos = this.position;
    while (pos < this.length) {
      ch = this.text[pos];
      if (Lexer.isEndOfLine(ch)) {
        indent = 0;
        pos += 1;
      } else {
        if (!Lexer.isSpace(this.text[pos])) {
          break;
        }
        indent += 1;
        pos += 1;
      }
    }
    if (pos >= this.length) {
      return 0;
    }
    return indent;
  }

  tokenize(str) {
    this.init(str);
    const result = [];
    let token = this.nextToken();
    result.push(token);
    while (token.type !== Lexer.TokenType.EndOfFile) {
      token = this.nextToken();
      result.push(token);
    }
    return result;
  }
}

Lexer.TokenType = {
  Identifier: 1,
  Number: 2,
  String: 3,
  Operator: 4,
  Separator: 5,
  EndOfLine: 6,
  Assignment: 7,
  EndOfFile: 8,
};

module.exports = Lexer;
