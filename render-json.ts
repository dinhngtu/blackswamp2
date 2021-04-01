import * as fs from "fs";
import YAML from "yaml";
import path from "path";

if (process.argv.length !== 4) {
  throw Error(`usage: ${process.argv[1]} infile outfile`);
}
const [_0, _1, infile, outfile] = process.argv;

const o = YAML.parse(fs.readFileSync(infile, { encoding: "utf8" }));
fs.mkdirSync(path.dirname(outfile), { recursive: true })
fs.writeFileSync(outfile, JSON.stringify(o));
