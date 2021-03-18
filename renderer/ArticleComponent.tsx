import { Fragment } from "preact";
import { Article, Section } from "./Article";
import SectionComponent from "./SectionComponent";

export function articleEffectivePrivacy(art: Article) {
  return art.Privacy ?? "Mixed"
}

export function isArticlePrivate(art: Article) {
  const ap = articleEffectivePrivacy(art);
  return ap === "Private" || ap === "Hidden";
}

export function sectionEffectivePrivacy(s: Section) {
  return s.Privacy ?? "Public";
}

export function isSectionPrivate(s: Section) {
  const sp = sectionEffectivePrivacy(s);
  return sp === "Private";
}

export function isSectionViewable(art: Article, s: Section, priv: boolean) {
  const ap = articleEffectivePrivacy(art);
  const sp = sectionEffectivePrivacy(s);
  return priv || ap === "Public" || (ap === "Mixed" && sp === "Public");
}

export default function ArticleComponent(props: { article?: Article, priv?: boolean }) {
  if (props.article === undefined) {
    return <Fragment />;
  }
  return (
    <article className={isArticlePrivate(props.article) ? "private" : undefined} >
      <header>
        {props.article.Title && <h1>{props.article.Title}</h1>}
        <address>
          {props.article.Author && <span>by {props.article.Author}</span>}
        </address>
      </header>

      {props.article.Sections.map((s, i) => {
        if (isSectionViewable(props.article!, s, props.priv ?? false)) {
          const secIsPrivate = !isArticlePrivate(props.article!) && isSectionPrivate(s);
          return (
            <section key={i} id={s.Name} className={secIsPrivate ? "private" : undefined}>
              <SectionComponent {...s} />
            </section>
          );
        } else {
          return <Fragment />;
        }
      })}
    </article >
  );
}
