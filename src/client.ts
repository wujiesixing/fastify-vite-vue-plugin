import type { App } from "vue";
import type { SSRContext } from "./route";
import type { RouteNode } from "./routes";

export type Manifest = Record<string, string[]>;

export type CreateFunc = (
  ctx: SSRContext,
  url: string,
  manifest?: Manifest
) => {
  app: App<Element>;
  ctx: SSRContext;
  preloadLinks?: string;
};

export interface Client {
  routes: RouteNode[];
  create: CreateFunc;
}

export default function prepareClient({
  routes,
  create,
  ...others
}: Client): Client {
  return { routes, create, ...others };
}
