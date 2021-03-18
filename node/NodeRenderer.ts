import YAML from "yaml";
import { Transform, Readable } from "stream";
import React from "react";
import ReactDOMServer from "react-dom/server";
import Vinyl from "vinyl";
import Ajv, { JSONSchemaType } from "ajv";
import { Article } from "../renderer/Article";

export interface RenderOptions {
  component: React.FC<{ article: Article }>;
  schema: JSONSchemaType<Article>;
  stream?: boolean;
}

function isReadable(chunk: any): chunk is Readable {
  return typeof chunk._read === "function";
}

function render(options: RenderOptions, article: Article): NodeJS.ReadableStream | string | null {
  const el = options.component({ article });
  if (el === null || el === undefined) {
    return null;
  }
  if (options.stream) {
    return article.Modules?.includes("Dynamic") ?
      ReactDOMServer.renderToNodeStream(el) :
      ReactDOMServer.renderToStaticNodeStream(el);
  } else {
    return article.Modules?.includes("Dynamic") ?
      ReactDOMServer.renderToString(el) :
      ReactDOMServer.renderToStaticMarkup(el);
  }
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

      let dom = render(options, obj);
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
