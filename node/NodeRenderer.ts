import YAML from "yaml";
import { Transform } from "stream";
import { VNode, h } from "preact";
import { render } from "preact-render-to-string";
import Vinyl from "vinyl";
import Ajv, { JSONSchemaType } from "ajv";
import { Article } from "../renderer/Article";

export interface RenderOptions {
  component: (props: { article: Article }) => VNode;
  schema: JSONSchemaType<Article>;
  stream?: boolean;
}

function renderArticle(options: RenderOptions, article: Article): NodeJS.ReadableStream | string | null {
  const el = h(options.component, { article });
  if (el === null || el === undefined) {
    return null;
  }
  return render(el);
}

export function yamlToJSON() {
  return new Transform({
    objectMode: true,
    transform(file, enc, cb) {
      if (!Vinyl.isVinyl(file)) {
        throw TypeError("not a Vinyl object");
      }
      console.log("processing", file.path);
      if (file.contents == null) {
        throw Error("no file contents");
      }

      let obj;
      if (Buffer.isBuffer(file.contents)) {
        obj = YAML.parse(file.contents.toString(enc));
      } else {
        obj = YAML.parse(file.contents.read().toString(enc));
      }

      cb(null, new Vinyl({
        contents: Buffer.from(JSON.stringify(obj)),
        path: `${file.stem}.json`
      }));
    }
  });
}

export function renderYAML(options: RenderOptions) {
  const ajv = new Ajv();
  const validator = ajv.compile(options.schema);
  return new Transform({
    objectMode: true,
    transform(file, enc, cb) {
      if (!Vinyl.isVinyl(file)) {
        throw TypeError("not a Vinyl object");
      }
      console.log("processing", file.path);
      if (file.contents == null) {
        throw Error("no file contents");
      }

      let obj;
      if (Buffer.isBuffer(file.contents)) {
        obj = YAML.parse(file.contents.toString(enc));
      } else {
        obj = YAML.parse(file.contents.read().toString(enc));
      }

      if (!validator(obj)) {
        console.log("failed validation", obj);
        console.log(validator?.errors);
        cb(Error("invalid object"));
        return;
      }

      let dom = renderArticle(options, obj);
      if (typeof dom !== "string") {
        cb(Error("cannot render"));
        return;
      }

      let contents = Buffer.concat([Buffer.from("<!doctype html>"), Buffer.from(dom)]);
      cb(null, new Vinyl({
        contents,
        path: `${file.stem}.html`
      }));
    }
  });
}
