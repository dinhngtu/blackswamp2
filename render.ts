import * as fs from "fs";
import Ajv, { JSONSchemaType } from "ajv";
import YAML from "yaml";
import path from "path";
import { renderArticle } from "./node/NodeRenderer";
import { Article } from "./renderer/Article";
import { isArticlePrivate } from "./renderer/ArticleComponent";
import PageComponent from "./renderer/PageComponent";

if (process.argv.length !== 4) {
  throw Error(`usage: ${process.argv[1]} infile outfile`);
}
const [_0, _1, infile, outfile] = process.argv;

const schema: JSONSchemaType<Article> = JSON.parse(fs.readFileSync("schema.json").toString());
const ajv = new Ajv();
const validator = ajv.compile(schema);

const obj = YAML.parse(fs.readFileSync(infile, { encoding: "utf8" }));

if (!validator(obj)) {
  throw Error("failed validation " + validator.errors);
}

if (isArticlePrivate(obj)) {
  process.exit(0);
}

const dom = renderArticle({
  component: PageComponent,
  schema: schema,
}, obj);
if (typeof dom !== "string") {
  throw Error("cannot render");
}

fs.mkdirSync(path.dirname(outfile), { recursive: true })
const outfd = fs.openSync(outfile, "w")
fs.writeSync(outfd, "<!doctype html>");
fs.writeSync(outfd, dom)
fs.writeSync(outfd, "<!--blackswamp2-->")
