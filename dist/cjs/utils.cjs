'use strict';

var node_path = require('node:path');
require('lodash-es');

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
function deepFreeze(object) {
    try {
        const propertyNames = Object.getOwnPropertyNames(object);
        for (const name of propertyNames) {
            const value = object[name];
            if (value && typeof value === "object" && !Object.isFrozen(value)) {
                deepFreeze(value);
            }
        }
    }
    catch (error) { }
    return Object.freeze(object);
}

exports.deepFreeze = deepFreeze;
exports.generateStream = generateStream;
exports.resolve = resolve;
