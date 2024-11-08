'use strict';

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
