/**
 * Scientific Calculator Expression Parser
 * 
 * Supports: +, -, *, /, ^, parentheses, sqrt, sin, cos, tan
 * Uses recursive descent parsing with proper operator precedence.
 */

// ---- Tokenizer ----

function tokenize(expression) {
  const tokens = [];
  let i = 0;
  const str = expression.trim();

  while (i < str.length) {
    // Skip whitespace
    if (/\s/.test(str[i])) {
      i++;
      continue;
    }

    // Numbers (including decimals)
    if (/[\d.]/.test(str[i])) {
      let num = '';
      while (i < str.length && /[\d.]/.test(str[i])) {
        num += str[i];
        i++;
      }
      const parsed = parseFloat(num);
      if (isNaN(parsed)) {
        throw new Error(`Invalid number: "${num}"`);
      }
      tokens.push({ type: 'NUMBER', value: parsed });
      continue;
    }

    // Multi-letter functions: sqrt, sin, cos, tan
    if (/[a-zA-Z]/.test(str[i])) {
      let name = '';
      while (i < str.length && /[a-zA-Z]/.test(str[i])) {
        name += str[i];
        i++;
      }
      const lower = name.toLowerCase();
      if (lower === 'sqrt' || lower === 'sin' || lower === 'cos' || lower === 'tan') {
        tokens.push({ type: 'FUNCTION', value: lower });
      } else {
        throw new Error(`Unknown function: "${name}"`);
      }
      continue;
    }

    // Single-character operators and parentheses
    const ch = str[i];
    if ('+-*/^()'.includes(ch)) {
      let type;
      switch (ch) {
        case '+': type = 'PLUS'; break;
        case '-': type = 'MINUS'; break;
        case '*': type = 'MULTIPLY'; break;
        case '/': type = 'DIVIDE'; break;
        case '^': type = 'POWER'; break;
        case '(': type = 'LPAREN'; break;
        case ')': type = 'RPAREN'; break;
      }
      tokens.push({ type, value: ch });
      i++;
      continue;
    }
//
    throw new Error(`Unexpected character: "${ch}"`);
  }

  return tokens;
}

// ---- Recursive Descent Parser ----

let pos;
let tokens;

function peek() {
  return pos < tokens.length ? tokens[pos] : null;
}

function consume(expectedType) {
  const token = peek();
  if (!token) {
    throw new Error(`Unexpected end of expression. Expected ${expectedType}.`);
  }
  if (expectedType && token.type !== expectedType) {
    throw new Error(`Expected ${expectedType} but got ${token.type} ("${token.value}").`);
  }
  pos++;
  return token;
}

// parseExpression: handles +, - (lowest precedence)
function parseExpression() {
  let left = parseTerm();

  while (peek() && (peek().type === 'PLUS' || peek().type === 'MINUS')) {
    const op = consume().value;
    const right = parseTerm();
    if (op === '+') {
      left = left + right;
    } else {
      left = left - right;
    }
  }

  return left;
}

// parseTerm: handles *, /
function parseTerm() {
  let left = parsePower();

  while (peek() && (peek().type === 'MULTIPLY' || peek().type === 'DIVIDE')) {
    const op = consume().value;
    const right = parsePower();
    if (op === '*') {
      left = left * right;
    } else {
      if (right === 0) {
        throw new Error('Division by zero');
      }
      left = left / right;
    }
  }

  return left;
}

// parsePower: handles ^ (right associative)
function parsePower() {
  let left = parseUnary();

  if (peek() && peek().type === 'POWER') {
    consume();
    // Right-associative: parse the right side recursively
    const right = parsePower();
    left = Math.pow(left, right);
  }

  return left;
}

// parseUnary: handles functions (sqrt, sin, cos, tan), unary +/-,
//             and parenthesized expressions
function parseUnary() {
  const token = peek();

  if (!token) {
    throw new Error('Unexpected end of expression.');
  }

  // Functions: sqrt, sin, cos, tan
  if (token.type === 'FUNCTION') {
    const func = consume().value;
    if (peek() && peek().type === 'LPAREN') {
      consume('LPAREN');
      const arg = parseExpression();
      consume('RPAREN');
      return applyFunction(func, arg);
    } else {
      // Without parentheses: treat the next atom as argument
      const arg = parseUnary();
      return applyFunction(func, arg);
    }
  }

  // Unary minus
  if (token.type === 'MINUS') {
    consume();
    const arg = parseUnary();
    return -arg;
  }

  // Unary plus (no-op)
  if (token.type === 'PLUS') {
    consume();
    return parseUnary();
  }

  // Parenthesized expression
  if (token.type === 'LPAREN') {
    consume();
    const expr = parseExpression();
    consume('RPAREN');
    return expr;
  }

  // Number
  if (token.type === 'NUMBER') {
    return consume().value;
  }

  throw new Error(`Unexpected token: ${token.type} ("${token.value}")`);
}

function applyFunction(name, arg) {
  switch (name) {
    case 'sqrt':
      if (arg < 0) {
        throw new Error('Square root of negative number');
      }
      return Math.sqrt(arg);
    case 'sin':
      return Math.sin(arg);
    case 'cos':
      return Math.cos(arg);
    case 'tan':
      return Math.tan(arg);
    default:
      throw new Error(`Unknown function: ${name}`);
  }
}

// ---- Public API ----

function evaluate(expression) {
  if (!expression || typeof expression !== 'string') {
    throw new Error('No expression provided.');
  }

  const trimmed = expression.trim();
  if (trimmed.length === 0) {
    throw new Error('Empty expression.');
  }

  // Check for balanced parentheses
  let depth = 0;
  for (const ch of trimmed) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (depth < 0) {
      throw new Error('Mismatched parentheses: too many closing parentheses.');
    }
  }
  if (depth !== 0) {
    throw new Error('Mismatched parentheses: unclosed opening parenthesis.');
  }

  tokens = tokenize(trimmed);
  pos = 0;

  if (tokens.length === 0) {
    throw new Error('Empty expression.');
  }

  const result = parseExpression();

  // Ensure all tokens were consumed
  if (peek() !== null) {
    throw new Error(`Unexpected token after expression: "${peek().value}"`);
  }

  return result;
}

// Export for use in browser or Node
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { evaluate, tokenize };
}
