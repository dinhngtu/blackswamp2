import { Section, MarkdownSection, HtmlSection, YoutubeSection, HALPublicationsSection, PrivacySettingsSection } from "./Article";

export function isMarkdownSection(s: Section): s is MarkdownSection {
  return (s as MarkdownSection).Markdown !== undefined;
}

export function isHtmlSection(s: Section): s is HtmlSection {
  return (s as HtmlSection).Html !== undefined;
}

export function isYoutubeSection(s: Section): s is YoutubeSection {
  return typeof (s as YoutubeSection).YoutubeId === "string";
}

export function isHALSection(s: Section): s is HALPublicationsSection {
  return typeof (s as HALPublicationsSection).IdHAL === "string";
}

export function isPrivacySettingsSection(s: Section): s is PrivacySettingsSection {
  return (s as PrivacySettingsSection).PrivacySettings !== undefined;
}
