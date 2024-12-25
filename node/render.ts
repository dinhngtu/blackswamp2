import * as fs from "fs/promises";
import Ajv, { JSONSchemaType } from "ajv";
import YAML from "yaml";
import path from "path";
import minimist from "minimist";
import { h } from "preact";
import { render } from "preact-render-to-string";
import { filterSection } from "./Prerender";
import { Article } from "../renderer/Article";
import { isArticlePrivate } from "../renderer/ArticleComponent";
import PageComponent from "../renderer/PageComponent";

const argopts = {
  boolean: ["no-validate", "private", "touch", "help"],
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

const article: Article = YAML.parse(await fs.readFile(infile, { encoding: "utf8" }));

if (!args["no-validate"]) {
  const schema: JSONSchemaType<Article> = JSON.parse((await fs.readFile(args.schema)).toString());
  const ajv = new Ajv();
  const validator = ajv.compile(schema);

  if (!validator(article)) {
    throw Error("failed validation " + validator.errors);
  }
}

if (!args.private && isArticlePrivate(article)) {
  process.exit(0);
}

if (args.touch) {
  const time = new Date();
  try {
    await fs.utimes(outfile, time, time);
  } catch {
  }
  process.exit(0);
}

await fs.mkdir(path.dirname(outfile), { recursive: true })
article.Sections = await Promise.all((article.Sections || []).map(async s => await filterSection(s, args.format)));

if (args.format === "html") {
  const el = h(PageComponent, { article });
  const dom = render(el);

  const outfd = await fs.open(outfile, "w")
  await outfd.write("<!doctype html>");
  await outfd.write(dom);
  await outfd.write("<!--blackswamp2-->");
  await outfd.close();

} else if (args.format === "json") {
  await fs.writeFile(outfile, JSON.stringify(article));

} else {
  throw Error("unknown format " + args.format);
}
