import { marked } from "marked";
import purifier from "purifier";
import { HALPublicationsSection, MarkdownSection, PrivacySettingsSection, Section, YoutubeSection } from "./Article";
import HALComponent from "./HALComponent";
import PrivacySettingsComponent, { usePrivacyPrompt } from "./PrivacySettingsComponent";

marked.setOptions({
  headerIds: false,
});

function isMarkdownSection(s: Section): s is MarkdownSection {
  return (s as MarkdownSection).Markdown !== undefined;
}

function isYoutubeSection(s: Section): s is YoutubeSection {
  return (s as YoutubeSection).YoutubeId !== undefined;
}

function isHALSection(s: Section): s is HALPublicationsSection {
  return (s as HALPublicationsSection).IdHAL !== undefined;
}

function isPrivacySettingsSection(s: Section): s is PrivacySettingsSection {
  return (s as PrivacySettingsSection).PrivacySettings !== undefined;
}

function MarkdownSectionComponent(s: MarkdownSection) {
  return <div dangerouslySetInnerHTML={{ __html: purifier.sanitize(marked(s.Markdown)) }} />;
}

function YoutubeSectionComponent(s: YoutubeSection) {
  let safeYtid: string | null = null;
  if (/^[a-zA-Z0-9-_]{11}/.test(s.YoutubeId)) {
    safeYtid = s.YoutubeId;
  }
  const [youtubePermission, _, youtubePrompt] = usePrivacyPrompt({
    Name: "youtube",
    DisplayName: "YouTube",
  });
  const render = () => {
    if (youtubePermission === "true") {
      return (
        <div className="embed-youtube-wrapper">
          <iframe
            className="embed-youtube"
            src={`https://www.youtube.com/embed/${safeYtid}`}
            frameBorder="0"
            allowFullScreen>
          </iframe>
        </div>
      );
    } else {
      return <p>{youtubePrompt}</p>
    }
  };
  return (
    <>
      {s.Title && <h2>{s.Title}</h2>}
      {safeYtid && render()}
    </>
  );
}

export default function SectionComponent(s: Section) {
  if (isMarkdownSection(s)) {
    return MarkdownSectionComponent(s);
  } else if (isYoutubeSection(s)) {
    return YoutubeSectionComponent(s);
  } else if (isHALSection(s)) {
    return HALComponent(s);
  } else if (isPrivacySettingsSection(s)) {
    return PrivacySettingsComponent(s);
  } else {
    return <></>;
  }
}
