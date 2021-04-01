import { VNode, h } from "preact";
import { render } from "preact-render-to-string";
import { JSONSchemaType } from "ajv";
import { Article } from "../renderer/Article";

export interface RenderOptions {
  component: (props: { article: Article }) => VNode;
  schema: JSONSchemaType<Article>;
  stream?: boolean;
}

export function renderArticle(options: RenderOptions, article: Article): NodeJS.ReadableStream | string | null {
  const el = h(options.component, { article });
  if (el === null || el === undefined) {
    return null;
  }
  return render(el);
}
