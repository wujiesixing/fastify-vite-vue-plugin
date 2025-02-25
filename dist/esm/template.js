import { Readable } from 'node:stream';

function createTemplateFunction(source, options) {
    const cache = options?.cache;
    if (cache?.has(source)) {
        return cache.get(source);
    }
    const params = new Set();
    const ranges = new Map();
    const interpolated = [];
    for (const match of source.matchAll(/<!--\s*([a-zA-Z_$][\w$]*(\.[a-zA-Z_$][\w$]*)*)\s*-->/g)) {
        params.add(match[1].split(".")[0]);
        ranges.set(match.index, {
            param: match[1],
            end: match.index + match[0].length - 1,
        });
    }
    let cursor = 0;
    for (let i = 0; i < source.length; i++) {
        const range = ranges.get(i);
        if (range) {
            const { param, end } = range;
            cursor = interpolated.push({ param });
            i = end;
        }
        else {
            interpolated[cursor] = (interpolated[cursor] ?? "") + source[i];
        }
    }
    const templateFunction = (0, eval)(`(asReadable) => (function ({ ${[...params].join(", ")} }) {` +
        `return asReadable\`${interpolated.map((s) => serialize(s)).join("")}\`` +
        "})")(asReadable);
    cache?.set(source, templateFunction);
    return templateFunction;
}
function asReadable(fragments, ...values) {
    return Readable.from((async function* () {
        for (const fragment of fragments) {
            yield fragment;
            if (values.length) {
                const value = values.shift();
                if (value instanceof Readable) {
                    for await (const chunk of value) {
                        yield chunk;
                    }
                }
                else if (value && typeof value !== "string") {
                    yield value.toString();
                }
                else {
                    yield value ?? "";
                }
            }
        }
    })());
}
function serialize(frag) {
    if (typeof frag === "object") {
        return `$\{${frag.param}}`;
    }
    return frag;
}

export { createTemplateFunction as default };
