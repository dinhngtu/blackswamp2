import { render } from "preact";
import { articleOriginWhitelist } from "./Config";
import PageBodyComponent from "./PageBodyComponent";
import ToolbarComponent from "./ToolbarComponent";
import { getPageBaseName } from "./Util";

function getPermalink(pw?: string) {
  if (!pw) {
    return;
  }
  var url = new URL(window.location.href);
  url.searchParams.set("pw", pw);
  return url.href;
}

async function loadArticle(id: string, pw?: string) {
  if (!window.location.pathname.startsWith("/articles/")) {
    return;
  }
  var secretpath: URL;
  if (pw) {
    secretpath = new URL(pw);
    if (!articleOriginWhitelist.includes(secretpath.origin)) {
      throw Error("articleOriginWhitelist");
    }
  } else {
    secretpath = new URL("/json", window.location.href);
  }
  if (!secretpath.pathname.endsWith("/")) {
    secretpath.pathname += "/";
  }
  const secret = new URL(id + ".json", secretpath);
  secret.search = secretpath.search;
  const article = await (await fetch(secret.toString())).json();
  render(
    <PageBodyComponent
      article={article}
      priv
      showUnlock={article.Modules?.includes("Secret")}
      onUnlock={pw => loadArticle(id, pw)}
      permalink={getPermalink(pw)} />,
    document.getElementById("root") as Element);
};

(async () => {
  const id = getPageBaseName();
  if (!id) {
    return;
  }
  const url = new URL(window.location.href);
  const pwSearch = url.searchParams.get("pw");

  try {
    await loadArticle(id, pwSearch || undefined);
  } catch {
    render(
      <ToolbarComponent showUnlock onUnlock={pw => loadArticle(id, pw)} />,
      document.getElementById("toolbar") as Element);
  }
})();
