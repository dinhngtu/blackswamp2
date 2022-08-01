import { marked } from "marked";
import xss from "xss";
import { AllSections } from "../renderer/Article";
import { isHtmlSection, isMarkdownSection } from "../renderer/Sections";

marked.setOptions({
  headerIds: false,
});

export function renderMarkdown(md: string) {
  return xss(marked(md));
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
