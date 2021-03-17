import YAML from "yaml";
import { Transform, Readable } from "stream";
import React from "react";
import ReactDOMServer from "react-dom/server";
import Vinyl from "vinyl";
import { Article } from "./Article";

export interface RenderOptions {
  component: React.FC<Article>;
  stream?: boolean;
}

function isReadable(chunk: any): chunk is Readable {
  return typeof chunk._read === "function";
}

function render(options: RenderOptions, obj: Article): NodeJS.ReadableStream | string | null {
  const el = options.component(obj);
  if (el === null || el === undefined) {
    return null;
  }
  if (options.stream) {
    return obj.Modules?.includes("Hydratable") ?
      ReactDOMServer.renderToNodeStream(el) :
      ReactDOMServer.renderToStaticNodeStream(el);
  } else {
    return obj.Modules?.includes("Hydratable") ?
      ReactDOMServer.renderToString(el) :
      ReactDOMServer.renderToStaticMarkup(el);
  }
}

export function renderYAML(options: RenderOptions) {
  return new Transform({
    objectMode: true,
    transform(file, enc, cb) {
      if (!Vinyl.isVinyl(file)) {
        throw TypeError("not a Vinyl object");
      }
      if (file.contents == null) {
        throw Error("no file contents");
      }
      let obj;
      if (Buffer.isBuffer(file.contents)) {
        obj = YAML.parse(file.contents.toString(enc));
      } else {
        obj = YAML.parse(file.contents.read().toString(enc));
      }
      let dom = render(options, obj);
      if (typeof dom !== "string") {
        throw Error("cannot render");
      }
      let contents = Buffer.concat([Buffer.from("<!doctype html>"), Buffer.from(dom)]);
      cb(null, new Vinyl({
        contents,
        path: `${file.base}/${file.stem}.html`
      }));
    }
  });
}
