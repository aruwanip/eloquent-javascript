class PGroup {
    constructor(array = []) {
        this.items = array;
    }

    add(item) {
        if (!this.has(item)) {
            return new PGroup([...this.items, item]);
        }
        return this;
    }

    delete(item) {
        if (this.has(item)) {
            return new PGroup(this.items.filter(elem => elem !== item));
        }
        return this;
    }

    has(item) {
        return this.items.includes(item);
    }

    static empty = new PGroup();
}

let a = PGroup.empty.add("a");
let ab = a.add("b");
let b = ab.delete("a");

console.log(b.has("b"));
// → true
console.log(a.has("b"));
// → false
console.log(b.has("a"));
// → false
