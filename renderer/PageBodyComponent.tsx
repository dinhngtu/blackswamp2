import ArticleComponent, { ArticleProps } from "./ArticleComponent";
import ToolbarComponent, { ToolbarOptions } from "./ToolbarComponent";

export type PageBodyProps = ArticleProps & ToolbarOptions;

export default function PageBodyComponent(props: PageBodyProps) {
  return <>
    <main role="main">
      <ArticleComponent
        article={props.article}
        priv={props.priv} />
    </main>
    <footer id="toolbar" aria-label="toolbar">
      <ToolbarComponent showUnlock={props.showUnlock} permalink={props.permalink} />
    </footer>
  </>;
}
