import { Article } from "./Article";
import { articleOriginWhitelist } from "./Config";
import { getPageBaseName } from "./Util";

export interface ToolbarProps {
  showToolbar?: boolean,
  onUnlock?: (article: Article) => void,
};

export default function ToolbarComponent(props: ToolbarProps) {
  const unlock = async () => {
    if (!props.onUnlock) {
      return;
    }
    const id = getPageBaseName();
    if (!id) {
      return;
    }
    const password = window.prompt("Enter secret:");
    if (!password) {
      return;
    }
    const secretpath = new URL(password);
    if (!articleOriginWhitelist.includes(secretpath.origin)) {
      return;
    }
    if (!secretpath.pathname.endsWith("/")) {
      secretpath.pathname += "/";
    }
    const secret = new URL(id + ".json", secretpath);
    secret.search = secretpath.search;
    const secretArticle = await (await fetch(secret.toString())).json();
    props.onUnlock(secretArticle);
  };

  return <>
    {props.showToolbar && props.onUnlock && <a href="javascript:void(0)" onClick={unlock}>Unlock</a>}
    <a href="/articles/privacy.html">Privacy</a>
  </>
}
