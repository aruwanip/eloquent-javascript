function Promise_all(promises) {
    return new Promise((resolve, reject) => {
        let results = [];
        let unresolved = promises.length;
        promises.forEach((promise, index) => {
            promise.then(res => {
                results[index] = res;
                unresolved--;
                if (unresolved === 0) resolve(results); // Resolve function only if this is the last promise resolved
            }).catch(reject); // Immediately reject function if any promise rejects
        });
        if (promises.length === 0) resolve(results); // For empty arrays
    });
}

// Test code
Promise_all([]).then(array => {
    console.log('This should be []:', array);
});

function soon(val) {
    return new Promise(resolve => {
        setTimeout(() => resolve(val), Math.random() * 500);
    });
}

Promise_all([soon(1), soon(2), soon(3)]).then(array => {
    console.log('This should be [1, 2, 3]:', array);
});

Promise_all([soon(1), Promise.reject('X'), soon(3)])
    .then(_ => {
        console.log('We should not get here');
    })
    .catch(error => {
        if (error !== 'X') {
            console.log('Unexpected failure:', error);
        }
    });
