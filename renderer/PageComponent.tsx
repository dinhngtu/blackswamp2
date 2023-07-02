import { Article } from "./Article";
import { titleSuffix } from "./Config";
import PageBodyComponent from "./PageBodyComponent";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

let cacheBusterCache: { [key: string]: string } = {};
function cacheBuster(rel: string) {
  if (rel in cacheBusterCache) {
    return cacheBusterCache[rel];
  }
  const realPath = path.join("./public", rel);
  const fileContents = fs.readFileSync(realPath);
  const h = crypto.createHash("sha256");
  h.update(fileContents);
  const digest = h.digest("base64url");
  const ret = `${rel}?v=${digest.substring(0, 8)}`;
  cacheBusterCache[rel] = ret;
  return ret;
}

function renderModule(mod: string) {
  const css = /^CSS\.([a-zA-Z0-9]+)$/.exec(mod);
  if (css?.length === 2) {
    return <link rel="stylesheet" href={cacheBuster(`/css/${css[1]}.css`)} />;
  }

  const js = /^JS\.([a-zA-Z0-9]+)$/.exec(mod);
  if (js?.length === 2) {
    return <script src={cacheBuster(`/js/${js[1]}.js`)} defer />;
  }
}

export default function PageComponent(props: { article: Article }) {
  const pageTitle = (props.article.Title ? `${props.article.Title} \u2013 ` : "") + titleSuffix;
  return (
    <html lang={props.article.Language || "en"}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {props.article.Description && <meta name="description" content={props.article.Description} />}
        <title>{pageTitle}</title>
        <link rel="icon" href="data:," />
        <link rel="stylesheet" href={cacheBuster("/css/site.css")} />
        <link rel="stylesheet" href={cacheBuster("/css/article.css")} />
        {props.article.Modules?.map(mod => renderModule(mod))}
      </head>
      <body id="root">
        <PageBodyComponent
          article={props.article}
          showUnlock={props.article.Modules?.includes("Secret")} />
      </body>
    </html>
  );
}
