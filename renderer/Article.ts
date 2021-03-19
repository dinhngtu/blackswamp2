export type Module = "Dynamic" | string;
export type ArticlePrivacy = "Public" | "Mixed" | "Private" | "Hidden";
export type MarkdownSection = Section & {
  Markdown: string;
};
export type SectionPrivacy = "Public" | "Private";
export type YoutubeSection = Section & {
  YoutubeId: string;
  Title?: string;
};

/**
 * tudinh.xyz article
 */
export interface Article {
  id: string;
  Title?: string;
  Author?: string;
  Description?: string;
  Modules?: Module[];
  Privacy?: ArticlePrivacy;
  Sections?: (MarkdownSection | YoutubeSection)[];
}
export interface Section {
  Name?: string;
  Privacy?: SectionPrivacy;
}
