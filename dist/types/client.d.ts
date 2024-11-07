import type { App } from "vue";
import type { RouteRecordRaw } from "vue-router";
import type { SSRContext } from "./route";
import type { RouteServer } from "./routes";
export type CreateFunc = (ctx: SSRContext) => {
    app: App<Element>;
    ctx: SSRContext;
};
export interface Client {
    routes: {
        client: () => RouteRecordRaw[];
        server: RouteServer[];
    };
    create: CreateFunc;
}
export default function prepareClient({ routes, create, ...others }: Client): Client;
