import { marked } from "marked";
import purifier from "purifier";
import { HtmlSection, MarkdownSection } from "../renderer/Article";

marked.setOptions({
  headerIds: false,
});

export function renderMarkdown(md: string) {
  return purifier.sanitize(marked(md));
};

export function MarkdownSectionComponent(s: MarkdownSection) {
  return <div dangerouslySetInnerHTML={{ __html: renderMarkdown(s.Markdown) }} />;
}

export function HtmlSectionComponent(s: HtmlSection) {
  return <></>;
}
