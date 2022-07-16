import { useState } from "preact/hooks";
import { Article } from "./Article";
import ArticleComponent, { ArticleProps } from "./ArticleComponent";
import ToolbarComponent from "./ToolbarComponent";

export type PageBodyProps = ArticleProps & {
  showToolbar?: boolean,
};

export default function PageBodyComponent(props: PageBodyProps) {
  const [article, setArticle] = useState<Article>();

  return <>
    <main role="main">
      <ArticleComponent
        article={article || props.article}
        priv={article ? true : props.priv} />
    </main>
    <footer id="toolbar">
      <ToolbarComponent showToolbar={props.showToolbar} onUnlock={setArticle} />
    </footer>
  </>;
}
