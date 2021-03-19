import * as gulp from "gulp";
import * as tjs from "typescript-json-schema";
import * as fs from "fs";
import del from "del";
import cleanCSS from "gulp-clean-css";
import { renderYAML, yamlToJSON } from "./node/NodeRenderer";
import PageComponent from "./renderer/PageComponent";

export async function schema() {
  const tsconfig = JSON.parse(await fs.promises.readFile("tsconfig.json", "utf8"));
  const program = tjs.getProgramFromFiles(["renderer/Article.ts"], tsconfig, ".");
  const schema = tjs.generateSchema(program, "Article", {
    tsNodeRegister: true
  });
  await fs.promises.writeFile("schema.json", JSON.stringify(schema))
}

export const articles = gulp.series([
  () => gulp.src("articles/*.yaml")
    .pipe(renderYAML({
      component: PageComponent,
      schema: JSON.parse(fs.readFileSync("schema.json").toString()),
    }))
    .pipe(gulp.dest("public/articles/")),
  gulp.parallel([
    () => gulp.src("public/articles/index.html")
      .pipe(gulp.dest("public/")),
    () => gulp.src("public/articles/404.html")
      .pipe(gulp.dest("public/")),
  ])
]);

export function articles_json() {
  return gulp.src("articles/*.yaml")
    .pipe(yamlToJSON())
    .pipe(gulp.dest("public/json/"));
}

export function css() {
  return gulp.src("css/**/*.css")
    .pipe(cleanCSS())
    .pipe(gulp.dest("public/css/"));
}

export const site = gulp.parallel([schema, articles, css, articles_json]);
export default site;

export function clean() {
  return del([
    "public/articles/**/*",
    "public/index.html",
    "public/404.html",
    "public/json/**/*",
    "public/css/**/*"
  ]);
}
