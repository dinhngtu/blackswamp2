import { HtmlSection, MarkdownSection } from "./Article";

export function MarkdownSectionComponent(s: MarkdownSection) {
  return <></>;
}

export function HtmlSectionComponent(s: HtmlSection) {
  return <div dangerouslySetInnerHTML={{ __html: s.Html }} />;
}
