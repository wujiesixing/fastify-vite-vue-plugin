'use strict';

var node_path = require('node:path');

function resolve(...args) {
    return node_path.resolve(process.cwd(), ...args);
}
async function* generateStream(...chunks) {
    for (const chunk of chunks) {
        if (typeof chunk === "string") {
            yield chunk;
        }
        else {
            for await (const element of chunk) {
                yield element;
            }
        }
    }
}

exports.generateStream = generateStream;
exports.resolve = resolve;
