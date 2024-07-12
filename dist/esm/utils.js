import { resolve as resolve$1 } from 'node:path';

function resolve(...args) {
    return resolve$1(process.cwd(), ...args);
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

export { deepFreeze, generateStream, resolve };
