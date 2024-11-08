import { resolve as resolve$1 } from 'node:path';

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

export { generateStream, resolve };
