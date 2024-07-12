import { RenderResponse } from "./render";
export type HtmlFunc = (renderResponse: RenderResponse) => Promise<void>;
export default function createHtmlFunction(source: string): HtmlFunc;
