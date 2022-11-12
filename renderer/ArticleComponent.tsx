import { Article, Section } from "./Article";
import SectionComponent from "./SectionComponent";

export function articleEffectivePrivacy(art: Article) {
  return art.Privacy ?? "Mixed"
}

export function isArticlePrivate(art: Article) {
  const ap = articleEffectivePrivacy(art);
  return ap === "Private";
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
  return priv || (ap === "Mixed" && sp === "Public");
}

export interface ArticleProps {
  article?: Article,
  priv?: boolean,
};

export default function ArticleComponent(props: ArticleProps) {
  if (props.article === undefined) {
    return <></>;
  }
  return (
    <article className={isArticlePrivate(props.article) ? "private" : undefined}>
      <header>
        {props.article.Title && <h1>{props.article.Title}</h1>}
        <address>
          {props.article._ts && <span>Updated {new Date(props.article._ts * 1000).toDateString()} </span>}
          {props.article.Author && <span>by {props.article.Author}</span>}
        </address>
      </header>

      {props.article.Sections?.map((s, i) => {
        if (isSectionViewable(props.article!, s, props.priv ?? false)) {
          const secIsPrivate = !isArticlePrivate(props.article!) && isSectionPrivate(s);
          return (
            <section key={i} id={s.Name} className={secIsPrivate ? "private" : undefined}>
              {s.Name && <span class="permalink"><a href={`#${s.Name}`}>&#128279;</a></span>}
              <SectionComponent {...s} />
            </section>
          );
        } else {
          return <></>;
        }
      })}
    </article >
  );
}
