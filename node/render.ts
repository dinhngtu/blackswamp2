import * as fs from "fs";
import Ajv, { JSONSchemaType } from "ajv";
import YAML from "yaml";
import path from "path";
import minimist from "minimist";
import { Article } from "../renderer/Article";
import { isArticlePrivate } from "../renderer/ArticleComponent";
import PageComponent from "../renderer/PageComponent";
import { renderArticle } from "./NodeRenderer";

const argopts = {
  boolean: ["no-validate", "private", "help"],
  default: {
    "schema": "./schema.json",
    "format": "html",
  }
};
const args = minimist(process.argv.slice(2), argopts);

if (args.help || args._.length !== 2) {
  console.log(`Usage: ${process.argv[1]} [--no-validate] [--private] [--schema ${argopts.default.schema}] [--format html|json] infile outfile`);
  process.exit(1);
}

const [infile, outfile] = args._;

const schema: JSONSchemaType<Article> = JSON.parse(fs.readFileSync(args.schema).toString());
const ajv = new Ajv();
const validator = ajv.compile(schema);

const obj = YAML.parse(fs.readFileSync(infile, { encoding: "utf8" }));

if (!args["no-validate"] && !validator(obj)) {
  throw Error("failed validation " + validator.errors);
}

if (!args.private && isArticlePrivate(obj)) {
  process.exit(0);
}

fs.mkdirSync(path.dirname(outfile), { recursive: true })
if (args.format === "html") {
  const dom = renderArticle({
    component: PageComponent,
    schema: schema,
  }, obj);
  if (typeof dom !== "string") {
    throw Error("cannot render");
  }

  const outfd = fs.openSync(outfile, "w")
  fs.writeSync(outfd, "<!doctype html>");
  fs.writeSync(outfd, dom);
  fs.writeSync(outfd, "<!--blackswamp2-->");
  fs.close(outfd);

} else if (args.format === "json") {
  fs.writeFileSync(outfile, JSON.stringify(obj));

} else {
  throw Error("unknown format " + args.format);
}
