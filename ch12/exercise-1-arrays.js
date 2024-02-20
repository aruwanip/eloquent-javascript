const { run, topScope } = require('./egg');

// topScope.array = Function('...args', 'return args;');
topScope.array = (...args) => args;

// topScope.length = Function('arr', 'return arr.length;');
topScope.length = arr => arr.length;

// topScope.element = Function('arr, i', 'return arr[i];');
topScope.element = (arr, i) => arr[i];

run(`
do(define(sum, fun(array,
     do(define(i, 0),
        define(sum, 0),
        while(<(i, length(array)),
          do(define(sum, +(sum, element(array, i))),
             define(i, +(i, 1)))),
        sum))),
   print(sum(array(1, 2, 3))))
`);
// → 6
