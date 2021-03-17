import * as gulp from "gulp";
import * as ts from "gulp-typescript";
import * as json2ts from "json-schema-to-typescript";
import * as fs from "fs";
import del from "del";
import cleanCSS from "gulp-clean-css";
import { renderYAML } from "./renderer";
import PageComponent from "./renderer/PageComponent";

const tsProject = ts.createProject("tsconfig.static.json");

gulp.task("schema", () =>
  json2ts
    .compileFromFile("renderer/schema.json")
    .then(x => fs.promises.writeFile("renderer/Article.ts", x)));

gulp.task("static", () =>
  tsProject
    .src()
    .pipe(tsProject())
    .js
    .pipe(gulp.dest("dist")));

gulp.task("articles", () =>
  gulp.src("articles/**/*.yaml")
    .pipe(renderYAML({
      component: PageComponent,
    }))
    .pipe(gulp.dest("public")));

gulp.task("css", () =>
  gulp.src("css/**/*.css")
    .pipe(cleanCSS())
    .pipe(gulp.dest("public/css")));

gulp.task("site", gulp.parallel(["articles", "css"]));

gulp.task("default", gulp.series(["static"]));

gulp.task("clean", () => del(["public/**/*"]));
