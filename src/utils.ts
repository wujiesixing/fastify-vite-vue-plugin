import { resolve as $resolve } from "node:path";

import { get, set } from "lodash-es";

import type { Readable } from "node:stream";

export function resolve(...args: string[]) {
  return $resolve(process.cwd(), ...args);
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

export function filterDeep<T extends object>(
  items: T[],
  predicate: (value: T, index: number, array: T[]) => unknown,
  deepPath: string
) {
  return items.reduce((filteredItems, item, index) => {
    if (predicate(item, index, items)) {
      filteredItems.push(item);

      try {
        const nestedItems = get(item, deepPath);
        if (Array.isArray(nestedItems) && nestedItems.length) {
          set(item, deepPath, filterDeep(nestedItems, predicate, deepPath));
        }
      } catch (error) {}
    }
    return filteredItems;
  }, [] as T[]);
}
