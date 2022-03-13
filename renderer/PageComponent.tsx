import { Article } from "./Article";
import ArticleComponent from "./ArticleComponent";

function renderModule(mod: string) {
  const css = /^CSS\.([a-zA-Z0-9]+)$/.exec(mod);
  if (css?.length === 2) {
    return <link rel="stylesheet" href={`/css/${css[1]}.css`} />;
  }

  const js = /^JS\.([a-zA-Z0-9]+)$/.exec(mod);
  if (js?.length === 2) {
    return <script src={`/js/${js[1]}.js`} defer />;
  }
}

export default function PageComponent(props: { article: Article }) {
  const pageTitle = (props.article.Title ? `${props.article.Title} \u2013 ` : "") + "tudinh.xyz";
  return (
    <html lang={props.article.Language || "en"}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {props.article.Description && <meta name="description" content={props.article.Description} />}
        <title>{pageTitle}</title>
        <link rel="icon" href="data:," />
        <link rel="stylesheet" href="/css/site.css" />
        <link rel="stylesheet" href="/css/article.css" />
        {props.article.Modules?.map(mod => renderModule(mod))}
      </head>
      <body>
        <main role="main" id="root">
          <ArticleComponent article={props.article} />
        </main>
        <footer>
          <a href="/articles/privacy.html">Privacy</a>
        </footer>
      </body>
    </html>
  );
}
