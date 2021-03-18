import * as gulp from "gulp";
 import * as json2ts from "json-schema-to-typescript";
import * as fs from "fs";
import del from "del";
import cleanCSS from "gulp-clean-css";
import { renderYAML, yamlToJSON } from "./node/NodeRenderer";
import PageComponent from "./renderer/PageComponent";

gulp.task("schema", () =>
  json2ts
    .compileFromFile("renderer/schema.json")
    .then(x => fs.promises.writeFile("renderer/Article.ts", x)));

gulp.task("articles", () =>
  gulp.src("articles/*.yaml")
    .pipe(renderYAML({
      component: PageComponent,
      schema: JSON.parse(fs.readFileSync("renderer/schema.json").toString()),
    }))
    .pipe(gulp.dest("public/articles/")));

gulp.task("articles-json", () =>
  gulp.src("articles/*.yaml")
    .pipe(yamlToJSON())
    .pipe(gulp.dest("public/json/")));

gulp.task("css", () =>
  gulp.src("css/**/*.css")
    .pipe(cleanCSS())
    .pipe(gulp.dest("public/css/")));

gulp.task("site", gulp.parallel(["articles", "css", "articles-json"]));

gulp.task("default", gulp.series(["site"]));

gulp.task("clean", () => del(["public/**/*"]));
