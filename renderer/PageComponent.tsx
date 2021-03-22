import { Article } from "./Article";
import ArticleComponent from "./ArticleComponent";

export default function PageComponent(props: { article: Article }) {
  const pageTitle = (props.article.Title ? `${props.article.Title} - ` : "") + "tudinh.xyz";
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {props.article.Description && <meta name="description" content={props.article.Description} />}
        <title>{pageTitle}</title>
        <link rel="icon" href="data:," />
        <link rel="stylesheet" href="/css/site.css" />
        <link rel="stylesheet" href="/css/article.css" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link rel="stylesheet" href={"https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Playfair+Display&display=swap"} />
        {props.article.Modules?.includes("Dynamic") && (
          <script src="/js/dynamic.js" async defer />
        )}
      </head>
      <body>
        <main role="main" id="root">
          <ArticleComponent article={props.article} />
        </main>
        <footer>
        </footer>
      </body>
    </html>
  );
}
