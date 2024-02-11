const box = {
    locked: true,
    unlock() { this.locked = false; },
    lock() { this.locked = true;  },
    _content: [],
    get content() {
        if (this.locked) throw new Error("Locked!");
        return this._content;
    }
};

function withBoxUnlocked(body) {
    const locked = box.locked;
    if (!locked) {
        return body();
    }
    try {
        box.unlock();
        return body();
    } finally {
        box.lock();
    }
}

box.unlock();
withBoxUnlocked(function() {
    box.content.push("gold piece");
});
console.log(box.locked);
// → false

box.lock();
try {
    withBoxUnlocked(function() {
        throw new Error("Pirates on the horizon! Abort!");
    });
} catch (e) {
    console.log("Error raised: " + e);
}
console.log(box.locked);
// → true
