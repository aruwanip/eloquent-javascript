let text = "'I'm the cook,' he said, 'it's my job.'";

// console.log(text.replace(/(^| )'(.*?)'($| )/g, "$1\"$2\"$3"));
console.log(text.replace(/(^|\W)'|'(\W|$)/g, '$1"$2'));
// → "I'm the cook," he said, "it's my job."
