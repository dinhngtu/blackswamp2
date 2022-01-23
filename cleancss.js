'use strict';

const fs = require("fs");
const path = require("path");
const minimist = require("minimist");
const cleancss = require("clean-css");
const { exit } = require("process");

const c = new cleancss();

const argopts = {
  boolean: ["help"],
  string: ["output"],
  alias: {
    output: "o"
  }
};
const args = minimist(process.argv.slice(2), argopts);
const outfile = args.output;

fs.mkdirSync(path.dirname(outfile), { recursive: true });
const minified = c.minify(args._);
if (minified.warnings && minified.warnings.length) {
  console.warn(minified.warnings);
}
if (minified.errors && minified.errors.length) {
  console.error(minified.errors);
  exit(1);
}
fs.writeFileSync(outfile, minified.styles);
