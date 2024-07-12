import type { App } from "vue";
import type { SSRContext } from "./route";
import type { RouteNode } from "./routes";
export type CreateFunc = (ctx: SSRContext, url: string) => {
    app: App<Element>;
    ctx: SSRContext;
};
export interface Client {
    routes: RouteNode[];
    create: CreateFunc;
}
export default function prepareClient({ routes, create, ...others }: Client): Client;
