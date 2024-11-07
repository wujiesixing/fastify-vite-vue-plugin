import { resolve as resolve$1 } from 'node:path';
import 'lodash-es';

function resolve(...args) {
    return resolve$1(process.cwd(), ...args);
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

export { deepFreeze, generateStream, resolve };
