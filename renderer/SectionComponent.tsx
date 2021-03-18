import { Fragment } from "preact";
import marked from "marked";
import purifier from "purifier";
import { MarkdownSection, Section, YoutubeSection } from "./Article";

function isMarkdownSection(s: Section): s is MarkdownSection {
  return (s as MarkdownSection).Markdown !== undefined;
}

function isYoutubeSection(s: Section): s is YoutubeSection {
  return (s as YoutubeSection).YoutubeId !== undefined;
}

function MarkdownSectionComponent(s: MarkdownSection) {
  return <div dangerouslySetInnerHTML={{ __html: purifier.sanitize(marked(s.Markdown)) }} />;
}

function YoutubeSectionComponent(s: YoutubeSection) {
  let safeYtid;
  if (/^[a-zA-Z0-9-_]{11}/.test(s.YoutubeId)) {
    safeYtid = s.YoutubeId;
  }
  return (
    <>
      {s.Title && <h2>{s.Title}</h2>}
      {safeYtid && (
        <div className="embed-youtube-wrapper">
          <iframe
            className="embed-youtube"
            src={`https://www.youtube.com/embed/${safeYtid}`}
            frameBorder="0"
            allowFullScreen>
          </iframe>
        </div>
      )}
    </>
  );
}

export default function SectionComponent(s: Section) {
  if (isMarkdownSection(s)) {
    return MarkdownSectionComponent(s);
  } else if (isYoutubeSection(s)) {
    return YoutubeSectionComponent(s);
  } else {
    return <Fragment />;
  }
}
