import type { RenderResponse } from "./render";
import type { TemplateOptions } from "./template";
export type HtmlFunc = (renderResponse: RenderResponse) => Promise<void>;
export default function createHtmlFunction(source: string, options?: TemplateOptions): HtmlFunc;
