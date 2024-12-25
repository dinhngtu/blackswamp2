import { Marked } from "marked";
import xss from "xss";
import { JSDOM } from "jsdom";
import { AllSections } from "../renderer/Article";
import { isHALSection, isHtmlSection, isMarkdownSection } from "../renderer/Sections";
import { fetchHaldoc, HALPublicationsFilteredSection } from "../renderer/HALComponent";

const marked = new Marked();

function renderMarkdown(md: string) {
  return xss(marked.parse(md) as string);
};

async function filterHtml(s: AllSections) {
  if (isHALSection(s) && s.Prerender) {
    const parser = new (new JSDOM()).window.DOMParser();
    const hs = s as HALPublicationsFilteredSection;
    hs.PrerenderData = await fetchHaldoc(hs, parser);
    return hs;
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

async function filterJson(s: AllSections) {
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

const renderFormats: { [key: string]: ((s: AllSections) => Promise<AllSections>) } = {
  "html": filterHtml,
  "json": filterJson,
};

export function filterSection(s: AllSections, format: string): Promise<AllSections> {
  if (!(format in renderFormats)) {
    throw Error("unknown format " + format);
  }
  return renderFormats[format](s);
}
