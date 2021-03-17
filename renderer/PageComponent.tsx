import React from "react";
import { Article } from "./Article";
import ArticleComponent from "./ArticleComponent";

export default function PageComponent(art: Article) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {art.Description && <meta name="description" content={art.Description} />}
        <title>{art.Title && `${art.Title} - `}tudinh.xyz</title>
        <link rel="icon" href="data:," />
        <link rel="stylesheet" href="/css/site.css" />
        <link rel="stylesheet" href="/css/article.css" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link rel="stylesheet" href={"https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Playfair+Display&display=swap"} />
      </head>
      <body>
        <main role="main">
          <ArticleComponent {...art} />
        </main>
      </body>
    </html>
  );
}
