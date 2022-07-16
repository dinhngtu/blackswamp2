import { render } from "preact";
import ArticleComponent from "./ArticleComponent";

(async () => {
  const path = window.location.pathname.replace(/\/+$/, '');
  const slash = path.lastIndexOf("/");
  const id = slash >= 0 ? path.substring(slash + 1) : null;
  if (!id) {
    return;
  }
  const article = await (await fetch(`/json/${id.replace(".html", ".json")}`)).json();
  render(
    <ArticleComponent article={article} priv />,
    document.getElementById("root") as Element);
})();
