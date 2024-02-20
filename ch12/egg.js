function parseExpression(program) {
  program = skipSpace(program); // Remove leading whitespaces
  let match, expr;
  if (match = /^"([^"]*)"/.exec(program)) { // Checks for string values
    expr = {type: "value", value: match[1]};
  } else if (match = /^\d+\b/.exec(program)) { // Checks for number values
    expr = {type: "value", value: Number(match[0])};
  } else if (match = /^[^\s(),#"]+/.exec(program)) { // Checks for word identifiers
    expr = {type: "word", name: match[0]};
  } else {
    throw new SyntaxError("Unexpected syntax: " + program);
  }

  return parseApply(expr, program.slice(match[0].length));
}

// Removes leading spaces from an input string
function skipSpace(string) {
  let first = string.search(/\S/); // Find index of first non-whitespace character
  if (first === -1) return ""; // Returns empty string if input string only contains whitespace characters
  return string.slice(first); // Returns string starting from first non-whitespace character
}

// Parses an application: expressions between parentheses
function parseApply(expr, program) {
  program = skipSpace(program); // Remove leading whitespaces
  if (program[0] !== "(") { // Check if program starts with open parentheses which indicates start of application
    return {expr: expr, rest: program};
  }

  program = skipSpace(program.slice(1)); // Remove starting parentheses
  expr = {type: "apply", operator: expr, args: []};
  while (program[0] !== ")") { // Parse through arguments of this application
    let arg = parseExpression(program); // Parse out arguments for the application
    expr.args.push(arg.expr);
    program = skipSpace(arg.rest);
    if (program[0] === ",") { // Comma indicates another argument, move to next index
      program = skipSpace(program.slice(1));
    } else if (program[0] !== ")") { // If not another argument, must be closing parentheses or error
      throw new SyntaxError("Expected ',' or ')'");
    }
  }
  return parseApply(expr, program.slice(1)); // Once completed parsing through this application, continue parsing after closing parentheses
}

function parse(program) {
  let {expr, rest} = parseExpression(program); // Start by identifying first expression (value or word)
  if (skipSpace(rest).length > 0) {
    throw new SyntaxError("Unexpected text after program");
  }
  return expr;
}

// console.log(parse("+(a, 10)"));
// → {type: "apply",
//    operator: {type: "word", name: "+"},
//    args: [{type: "word", name: "a"},
//           {type: "value", value: 10}]}

const specialForms = Object.create(null);

function evaluate(expr, scope) {
  if (expr.type === "value") {
    return expr.value;
  } else if (expr.type === "word") {
    if (expr.name in scope) {
      return scope[expr.name];
    } else {
      throw new ReferenceError(
          `Undefined binding: ${expr.name}`);
    }
  } else if (expr.type === "apply") {
    let {operator, args} = expr;
    if (operator.type === "word" &&
        operator.name in specialForms) {
      return specialForms[operator.name](expr.args, scope);
    } else {
      let op = evaluate(operator, scope);
      if (typeof op == "function") {
        return op(...args.map(arg => evaluate(arg, scope)));
      } else {
        throw new TypeError("Applying a non-function.");
      }
    }
  }
}

specialForms.if = (args, scope) => {
  if (args.length !== 3) {
    throw new SyntaxError("Wrong number of args to if");
  } else if (evaluate(args[0], scope) !== false) { // Truthy is fine but falsey is not (only strict false)
    return evaluate(args[1], scope);
  } else {
    return evaluate(args[2], scope);
  }
};

specialForms.while = (args, scope) => {
  if (args.length !== 2) {
    throw new SyntaxError("Wrong number of args to while");
  }
  while (evaluate(args[0], scope) !== false) {
    evaluate(args[1], scope);
  }

  // Since undefined does not exist in Egg, we return false,
  // for lack of a meaningful result.
  return false;
};

specialForms.do = (args, scope) => {
  let value = false;
  for (let arg of args) {
    value = evaluate(arg, scope);
  }
  return value;
};

specialForms.define = (args, scope) => {
  if (args.length !== 2 || args[0].type !== "word") {
    throw new SyntaxError("Incorrect use of define");
  }
  let value = evaluate(args[1], scope);
  scope[args[0].name] = value;
  return value;
};

const topScope = Object.create(null);

topScope.true = true;
topScope.false = false;

let prog = parse(`if(true, false, true)`);
// console.log(evaluate(prog, topScope));
// → false

for (let op of ["+", "-", "*", "/", "==", "<", ">"]) {
  topScope[op] = Function("a, b", `return a ${op} b;`);
}

topScope.print = value => {
  console.log(value);
  return value;
};

function run(program) {
  return evaluate(parse(program), Object.create(topScope));
}

// run(`
// do(define(total, 0),
//    define(count, 1),
//    while(<(count, 11),
//          do(define(total, +(total, count)),
//             define(count, +(count, 1)))),
//    print(total))
// `);
// → 55

specialForms.fun = (args, scope) => {
  if (!args.length) {
    throw new SyntaxError("Functions need a body");
  }
  let body = args[args.length - 1];
  let params = args.slice(0, args.length - 1).map(expr => {
    if (expr.type !== "word") {
      throw new SyntaxError("Parameter names must be words");
    }
    return expr.name;
  });

  return function() {
    if (arguments.length !== params.length) {
      throw new TypeError("Wrong number of arguments");
    }
    let localScope = Object.create(scope);
    for (let i = 0; i < arguments.length; i++) {
      localScope[params[i]] = arguments[i];
    }
    return evaluate(body, localScope);
  };
};

// run(`
// do(define(plusOne, fun(a, +(a, 1))),
//    print(plusOne(10)))
// `);
// → 11

// run(`
// do(define(pow, fun(base, exp,
//      if(==(exp, 0),
//         1,
//         *(base, pow(base, -(exp, 1)))))),
//    print(pow(2, 10)))
// `);
// → 1024

module.exports = { evaluate, run, specialForms, topScope };
