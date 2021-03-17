import React from "react";
import { Article, Section } from "./Article";
import SectionComponent from "./SectionComponent";

function isArticlePrivate(art: Article) {
  const effectivePrivacy = art.Privacy ?? "Mixed";
  return effectivePrivacy === "Private" || effectivePrivacy === "Hidden";
}

function isSectionPrivate(s: Section) {
  const effectivePrivacy = s.Privacy ?? "Public";
  return effectivePrivacy === "Private";
}

export default function ArticleComponent(art: Article) {
  return (
    <article className={isArticlePrivate(art) ? "private" : undefined} >
      <header>
        {art.Title && <h1>{art.Title}</h1>}
        <address>
          {art.Author && <span>by {art.Author}</span>}
        </address>
      </header>

      {art.Sections.map(s => {
        return (
          <section id={s.Name} className={(!isArticlePrivate(art) && isSectionPrivate(s)) ? "private" : undefined}>
            <SectionComponent {...s} />
          </section>
        );
      })}
    </article >
  );
}
