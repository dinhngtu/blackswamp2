import ArticleComponent, { ArticleProps } from "./ArticleComponent";
import ToolbarComponent, { ToolbarProps } from "./ToolbarComponent";

export type PageBodyProps = ArticleProps & ToolbarProps;

export default function PageBodyComponent(props: PageBodyProps) {
  return <>
    <main role="main">
      <ArticleComponent
        article={props.article}
        priv={props.priv} />
    </main>
    <footer id="toolbar" aria-label="toolbar">
      <ToolbarComponent
        showUnlock={props.showUnlock}
        onUnlock={props.onUnlock}
        permalink={props.permalink} />
    </footer>
  </>;
}
