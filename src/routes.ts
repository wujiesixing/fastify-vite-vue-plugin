import { defaultsDeep, isNil, omit } from "lodash-es";

import { deepFreeze } from "./utils-browser";

import type { Head } from "@unhead/schema";
import type {
  RouteComponent,
  RouteRecordRaw,
  RouteRecordRedirect,
  RouteRecordSingleView,
  RouteRecordSingleViewWithChildren,
} from "vue-router";

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

export interface RouteMetaBase {
  head?: Head | (() => Promise<Head>);
  render?: RenderOptions;
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

export interface RouteNode
  extends Omit<RouteBase, "component" | "meta" | "children">,
    Omit<RouteMetaBase, "provide"> {}

function formatPath(path: string) {
  return path.replace(/\/+/g, "/").replace(/(?!^)\/$/, "");
}

function getFullPath(path: string, base = "") {
  if (path.startsWith("/")) {
    return formatPath(path);
  }

  return formatPath("/" + base + "/" + path);
}

export function getRoutes(
  array: readonly RouteBase[],
  base?: {
    path: string;
    meta?: Omit<RouteMetaBase, "provide">;
  }
) {
  const names: string[] = [];

  function _getRoutes(
    _array: readonly RouteBase[],
    _base?: {
      path: string;
      meta?: Omit<RouteMetaBase, "provide">;
    }
  ) {
    return _array.map((route): RouteRecordRaw => {
      let { path, meta, name } = route;
      const { component, redirect, children } = route;

      name = name || getFullPath(path, _base?.path);

      if (names.includes(name)) {
        throw new Error(
          `自动生成 name （${name}）失败，请检查路由配置是否正确：${JSON.stringify(
            route
          )}`
        );
      }

      names.push(name);

      path = formatPath(path);

      const provide = defaultsDeep({}, meta?.provide, _base?.meta);

      meta = defaultsDeep({}, omit(meta, ["provide"]), provide);

      if (component && isNil(redirect) && isNil(children)) {
        return {
          ...route,
          meta,
          name,
          path,
        } as RouteRecordSingleView;
      }

      if (children) {
        return {
          ...route,
          children: _getRoutes(children, {
            path: name,
            meta: provide,
          }),
          meta,
          name,
          path,
        } as RouteRecordSingleViewWithChildren;
      }

      if (redirect && isNil(component)) {
        return {
          ...route,
          meta,
          name,
          path,
        } as RouteRecordRedirect;
      }

      throw new Error(`类型检测不通过：${JSON.stringify(route)}`);
    });
  }

  return _getRoutes(array, base);
}

export function flatRoutes(
  array: readonly RouteBase[],
  base?: {
    path: string;
    meta?: Omit<RouteMetaBase, "provide">;
  }
) {
  const paths: string[] = [];

  function _flatRoutes(
    _array: readonly RouteBase[],
    _base?: {
      path: string;
      meta?: Omit<RouteMetaBase, "provide">;
    }
  ) {
    return _array.flatMap((route): RouteNode[] => {
      let { meta } = route;
      const { path, component, redirect, children } = route;

      const fullPath = getFullPath(path, _base?.path);

      const provide = defaultsDeep({}, meta?.provide, _base?.meta);

      meta = defaultsDeep({}, omit(meta, ["provide"]), provide);

      let currentRoute: RouteNode | null = null;

      if (component || redirect) {
        if (paths.includes(fullPath)) {
          throw new Error(`路由检测重复：${JSON.stringify(route)}`);
        }

        paths.push(fullPath);

        currentRoute = { ...meta, path: fullPath, redirect };
      }

      if (children) {
        return [
          ...(currentRoute ? [currentRoute] : []),
          ..._flatRoutes(children, {
            path: fullPath,
            meta: provide,
          }),
        ];
      } else {
        return currentRoute ? [currentRoute] : [];
      }
    });
  }

  return deepFreeze(_flatRoutes(array, base));
}
