import dayjs from "dayjs";
import type { Head } from "@unhead/schema";
import type { RouteComponent, RouteRecordRaw } from "vue-router";
type Lazy<T> = () => Promise<T>;
export interface RenderOptions {
    /**
     * - 渲染使用 csr 还是 ssr
     * - 默认 false，即使用 ssr
     */
    csr?: boolean;
    /**
     * 保留字段，下期在做！！！cacheControl 仅在 ssr 模式有效
     */
    cacheControl?: {
        /**
         * 缓存的秒数，直到下次 build
         * - 0 表示不缓存
         * - undefined 表示使用默认配置
         * - setup 期间有 ajax 请求的页面，默认不缓存（0）
         * - setup 期间无 ajax 请求的页面，默认永久缓存（Infinity），直到下次 build
         */
        maxAge?: number;
        /**
         * 缓存使用 disk 还是 memory
         * - 默认 false，即默认使用 disk
         */
        memory?: boolean;
    };
    /**
     * 保留字段，下期在做！！！渲染使用 stream 还是 string，仅在 ssr 模式有效
     * - 需要缓存的页面，默认 fasle，即使用 string
     * - 不需要缓存的页面，默认 true，即使用 stream
     */
    stream?: boolean;
}
interface RouteMetaBase {
    head?: Head;
    render?: RenderOptions;
    startTime?: dayjs.ConfigType;
    endTime?: dayjs.ConfigType;
    provide?: Omit<RouteMetaBase, "provide">;
}
/**
 * - 由于该类型需要同时适用于 node 和浏览器，所以不能完全等于 vue-router 中的 route 类型
 * - 因此请慎重修改
 */
export interface RouteBase {
    path: string;
    name?: string;
    component?: RouteComponent | Lazy<RouteComponent>;
    meta?: RouteMetaBase;
    redirect?: string;
    children?: RouteBase[];
}
export interface RouteServer extends Omit<RouteBase, "component" | "meta" | "children">, Omit<RouteMetaBase, "provide"> {
}
export declare function getRoutes(array: readonly RouteBase[], base?: {
    path: string;
    meta?: Omit<RouteMetaBase, "provide">;
}): RouteRecordRaw[];
export declare function flatRoutes(array: readonly RouteBase[], base?: {
    path: string;
    meta?: Omit<RouteMetaBase, "provide">;
}): readonly RouteServer[];
export {};
