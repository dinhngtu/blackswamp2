import { useState } from "preact/hooks";
import { Article } from "./Article";
import ArticleComponent, { ArticleProps } from "./ArticleComponent";
import ToolbarComponent, { ToolbarOptions } from "./ToolbarComponent";

export type PageBodyProps = ArticleProps & ToolbarOptions;

export default function PageBodyComponent(props: PageBodyProps) {
  const [article, setArticle] = useState<Article>();

  return <>
    <main role="main">
      <ArticleComponent
        article={article || props.article}
        priv={article ? true : props.priv} />
    </main>
    <footer id="toolbar" aria-label="toolbar">
      <ToolbarComponent showUnlock={props.showUnlock} onUnlock={setArticle} />
    </footer>
  </>;
}
