'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var node_stream = require('node:stream');

function createTemplateFunction(source) {
    const params = new Set();
    const ranges = new Map();
    const interpolated = [];
    for (const match of source.matchAll(/<!--\s*([a-zA-Z_$][a-zA-Z0-9_$]*(\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)\s*-->/g)) {
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
    return (0, eval)(`(asReadable) => (function ({ ${[...params].join(", ")} }) {` +
        `return asReadable\`${interpolated.map((s) => serialize(s)).join("")}\`` +
        "})")(asReadable);
}
function asReadable(fragments, ...values) {
    return node_stream.Readable.from((async function* () {
        for (const fragment of fragments) {
            yield fragment;
            if (values.length) {
                const value = values.shift();
                if (value instanceof node_stream.Readable) {
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

exports.default = createTemplateFunction;
