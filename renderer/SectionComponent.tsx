import { HtmlSection, Section, YoutubeSection } from "./Article";
import HALComponent from "./HALComponent";
import PrivacySettingsComponent, { usePrivacyPrompt } from "./PrivacySettingsComponent";
import { filterSection } from "DualRenderer";
import { isHtmlSection, isYoutubeSection, isHALSection, isPrivacySettingsSection } from "./Sections";
import purifier from "purifier";

function HtmlSectionComponent(s: HtmlSection) {
  return <div dangerouslySetInnerHTML={{ __html: purifier.sanitize(s.Html) }} />;
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

export default function SectionComponent(rawSection: Section) {
  const s = filterSection(rawSection);
  if (isHtmlSection(s)) {
    return HtmlSectionComponent(s);
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
