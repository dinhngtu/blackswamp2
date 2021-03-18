import React from "react";
import ReactDOM from "react-dom";
import ArticleComponent from "./ArticleComponent";

(async () => {
  const path = window.location.pathname.replace(/\/+$/, '');
  const slash = path.lastIndexOf("/");
  const id = slash >= 0 ? path.substr(slash + 1) : null;
  if (!id) {
    return;
  }
  const article = await (await fetch(`/json/${id.replace(".html", ".json")}`)).json();
  ReactDOM.hydrate(<ArticleComponent article={article} priv />, document.getElementById("root"));
})();
