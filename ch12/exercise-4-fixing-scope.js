const { evaluate, run, specialForms } = require('./egg');

// specialForms.set = (args, scope) => {
//     if (args.length !== 2 || args[0].type !== "word") {
//         throw new SyntaxError("Incorrect use of set");
//     }
//     let definingScope = scope;
//     for (;;) {
//         if (!definingScope) throw new ReferenceError(`${args[0].name} does not exist in any scope`);
//         if (Object.prototype.hasOwnProperty.call(definingScope, args[0].name)) {
//             let value = evaluate(args[1], scope)
//             definingScope[args[0].name] = value;
//             return value;
//         }
//         definingScope = Object.getPrototypeOf(definingScope);
//     }
// };

specialForms.set = (args, env) => {
    if (args.length !== 2 || args[0].type !== "word") {
        throw new SyntaxError("Bad use of set");
    }
    let varName = args[0].name;
    let value = evaluate(args[1], env);

    for (let scope = env; scope; scope = Object.getPrototypeOf(scope)) {
        if (Object.prototype.hasOwnProperty.call(scope, varName)) {
            scope[varName] = value;
            return value;
        }
    }
    throw new ReferenceError(`Setting undefined variable ${varName}`);
};

run(`
do(define(x, 4),
   define(setx, fun(val, set(x, val))),
   setx(50),
   print(x))
`);
// → 50
run(`set(quux, true)`);
// → Some kind of ReferenceError
