import { render } from "preact";
import ArticleComponent from "./ArticleComponent";

(async () => {
  const path = window.location.pathname.replace(/\/+$/, '');
  const slash = path.lastIndexOf("/");
  const id = slash >= 0 ? path.substr(slash + 1) : null;
  if (!id) {
    return;
  }
  const article = await (await fetch(`/json/${id.replace(".html", ".json")}`)).json();
  render(
    <main role="main" id="root">
      <ArticleComponent article={article} priv />
    </main>,
    document.querySelector("html") as Element,
    document.getElementById("root") as Element);
})();
