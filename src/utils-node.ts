import { resolve as $resolve } from "node:path";

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
