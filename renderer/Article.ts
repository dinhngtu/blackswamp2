export type Module = "Dynamic" | string;
export type ArticlePrivacy = "Public" | "Mixed" | "Private" | "Hidden";
export type SectionPrivacy = "Public" | "Private";
export type MarkdownSection = Section & {
  Markdown: string;
};
export type HtmlSection = Section & {
  Html: string;
};
export type YoutubeSection = Section & {
  YoutubeId: string;
  Title?: string;
};
export type HALPublicationsSection = Section & {
  IdHAL: string;
};
export type PrivacySetting = {
  Name: string;
  DisplayName: string;
};
export type PrivacySettingsSection = Section & {
  PrivacySettings: PrivacySetting[];
};
export type AllSections = MarkdownSection | HtmlSection | YoutubeSection | HALPublicationsSection | PrivacySettingsSection;

export interface Article {
  id: string;
  Language?: string;
  Title?: string;
  Author?: string;
  Description?: string;
  Modules?: Module[];
  Privacy?: ArticlePrivacy;
  Sections?: AllSections[];
  _ts?: number;
}
export interface Section {
  Name?: string;
  Privacy?: SectionPrivacy;
}
