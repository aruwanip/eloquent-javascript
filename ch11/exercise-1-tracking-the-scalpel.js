const { anyStorage } = require('./async');
let bigOak = require('./crow-tech').bigOak;

async function locateScalpel(nest) {
    let current = nest.name;
    for (;;) {
        let next = await anyStorage(nest, current, 'scalpel');
        if (current === next) return current;
        current = next;
    }
}

function locateScalpel2(nest) {
    function findScalpel(source) {
        return anyStorage(nest, source, 'scalpel').then(
            res => {
                if (res === source) return res;
                return findScalpel(res);
            }
        );
    }
    return findScalpel(nest.name);
}

locateScalpel(bigOak).then(console.log);
// → Butcher Shop
locateScalpel2(bigOak).then(console.log);
// → Butcher Shop
