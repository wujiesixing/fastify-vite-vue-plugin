import { resolve as $resolve } from "node:path";

import type { Readable } from "node:stream";

export function resolve(...args: string[]) {
  return $resolve(process.cwd(), ...args);
}

export function deepFreeze<T>(object: T) {
  try {
    const propertyNames = Object.getOwnPropertyNames(object);

    for (const name of propertyNames) {
      const value = (object as any)[name];

      if (value && typeof value === "object" && !Object.isFrozen(value)) {
        deepFreeze(value);
      }
    }
  } catch (error) {}

  return Object.freeze(object);
}

export async function* generateStream(...chunks: Array<string | Readable>) {
  for (const chunk of chunks) {
    if (typeof chunk === "string") {
      yield chunk;
    } else {
      for await (const element of chunk) {
        yield element;
      }
    }
  }
}
