import { render } from "preact";
import { Article } from "./Article";
import PageBodyComponent from "./PageBodyComponent";
import ToolbarComponent from "./ToolbarComponent";
import { getPageBaseName } from "./Util";

function rerender(article: Article) {
  render(
    <PageBodyComponent article={article} priv />,
    document.getElementById("root") as Element);
}

(async () => {
  const id = getPageBaseName();
  if (!id) {
    return;
  }
  try {
    const article = await (await fetch(`/json/${id}.json`)).json();
    rerender(article);
  } catch {
    render(
      <ToolbarComponent showToolbar onUnlock={rerender} />,
      document.getElementById("toolbar") as Element);
  }
})();
