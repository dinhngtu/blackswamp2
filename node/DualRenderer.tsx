import { Marked } from "marked";
import xss from "xss";
import { AllSections } from "../renderer/Article";
import { isHtmlSection, isMarkdownSection } from "../renderer/Sections";

const marked = new Marked();

export function renderMarkdown(md: string) {
  return xss(marked.parse(md) as string);
};

export function filterSection(s: AllSections): AllSections {
  if (isHtmlSection(s)) {
    return {};
  } else if (isMarkdownSection(s)) {
    return {
      Name: s.Name,
      Privacy: s.Privacy,
      Html: renderMarkdown(s.Markdown),
    };
  } else {
    return s;
  }
}
