import { useEffect, useState } from "preact/hooks";
import xss from "xss";
import { HALPublicationsSection, OtherPublication } from "./Article";
import { usePrivacyPrompt } from "./PrivacySettingsComponent";

export type HALPublicationsFilteredSection = HALPublicationsSection & {
  PrerenderData?: XMLDocument;
};

interface BibGroup {
  name: string;
  bibs: Element[];
};

const docTypes: { [K: string]: number } = {
  COMM: 1,
  ART: 2,
  OUV: 3,
  COUV: 4,
  DOUV: 5,
  REPORT: 6,
  THESE: 7,
  HDR: 8,
  LECTURE: 9,
  IMG: 10,
  VIDEO: 11,
  SON: 12,
  MAP: 13,
  SOFTWARE: 14,
  PATENT: 15,
  POSTER: 16,
  OTHER: 17,
  UNDEFINED: 18,
};

function getGroupOrder(type: string) {
  return docTypes[type] || 1000;
}

export async function fetchHaldoc(s: HALPublicationsSection, parser: any) {
  let url: string;
  if (s.TEIXml) {
    url = s.TEIXml;
  } else if (/^[a-zA-Z0-9\-]+$/.test(s.IdHAL)) {
    url = `https://api.archives-ouvertes.fr/search/?wt=xml-tei&rows=100&sort=producedDate_tdate+desc&q=authIdHal_s:${s.IdHAL}`;
  } else {
    throw new Error("invalid HAL section specification");
  }
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(resp.status.toString());
  }
  const doc = parser.parseFromString(await resp.text(), "text/xml");
  const err = doc.querySelector("parsererror");
  if (err) {
    throw new Error(err.textContent || "");
  }
  return doc;
}

export default function HALComponent(props: HALPublicationsFilteredSection) {
  function getBibDate(bib: Element) {
    var edition = bib.querySelector('editionStmt>edition[type="current"]');
    return edition?.querySelector('date[type="whenProduced"]')?.textContent ||
      edition?.querySelector('date[type="whenReleased"]')?.textContent ||
      "";
  }

  function renderAuthors(bib: Element) {
    return Array.from(bib.querySelectorAll('titleStmt>author[role="aut"]')).map(au => {
      const auName = Array.from(au.querySelectorAll("persName>*"))
        .map(namepart => namepart.textContent)
        .join(" ");
      if (props.IdHAL && au.querySelector('idno[type="idhal"][notation="string"]')?.textContent === props.IdHAL) {
        return <strong>{auName}</strong>;
      } else {
        return auName;
      }
    }).map((auName, index) => <>
      {index > 0 && ", "}
      {auName}
    </>);
  }

  function renderBib(bib: Element, index: number) {
    const key = bib.querySelector('publicationStmt>idno[type="halId"]')?.textContent || index;
    const title = bib.querySelector("titleStmt>title")?.textContent;
    const uri = bib.querySelector('publicationStmt>idno[type="halUri"]')?.textContent;
    const refHtml = bib.querySelector('publicationStmt>idno[type="halRefHtml"]')?.textContent;
    return (
      <li class="bib" key={key}>
        {uri ? <a class="bib-title" href={uri}>{title}</a> : <p class="bibTitle">{title}</p>}
        <p class="bib-authors">{renderAuthors(bib)}</p>
        {refHtml && <p class="bib-ref" dangerouslySetInnerHTML={{ __html: xss(refHtml) }} />}
      </li>
    );
  }

  function renderBibGroup(groupType: string, bg: BibGroup) {
    return (
      <div key={groupType} id={groupType}>
        <h2>{bg.name}</h2>
        <ul class="bib-group">
          {bg.bibs
            .sort((a, b) => -(getBibDate(a).localeCompare(getBibDate(b))))
            .map((bib, index) => renderBib(bib, index))}
        </ul>
      </div>
    );
  }

  function renderOtherBib(bib: OtherPublication) {
    return (
      <li class="bib" key={bib.Title}>
        {bib.Url ? <a class="bib-title" href={bib.Url}>{bib.Title}</a> : <p class="bibTitle">{bib.Title}</p>}
        {bib.Authors && <p class="bib-authors" dangerouslySetInnerHTML={{ __html: xss(bib.Authors) }} />}
        {bib.Reference && <p class="bib-ref" dangerouslySetInnerHTML={{ __html: xss(bib.Reference) }} />}
      </li>
    );
  }

  function renderOtherBibGroup(bg: OtherPublication[]) {
    return (
      <div key="X-OTHER" id="X-OTHER">
        <h2>Other preprints and postprints</h2>
        <ul class="bib-group">
          {bg.map(bib => renderOtherBib(bib))}
        </ul>
      </div>
    );
  }

  function render(haldoc: XMLDocument) {
    const bibs = Array.from(haldoc.querySelectorAll("body>listBibl>biblFull"));
    const bibGroups = bibs.reduce<{ [K: string]: BibGroup }>((groups, bib) => {
      const groupEl = bib.querySelector('profileDesc>textClass>classCode[scheme="halTypology"]');
      const groupType = groupEl?.getAttribute("n") || "";
      const groupName = groupEl?.textContent;

      const group = (groups[groupType] || { name: groupName, bibs: [] });
      group.bibs.push(bib);
      groups[groupType] = group;
      return groups;
    }, {});
    const renderedBibGroups = Object.entries(bibGroups)
      .sort((a, b) => getGroupOrder(a[0]) - getGroupOrder(b[0]))
      .map(([g, bib]) => renderBibGroup(g, bib));
    const pubDate = haldoc.querySelector("teiHeader>fileDesc>publicationStmt>date")?.getAttribute("when");
    return <>
      {renderedBibGroups}
      {props.OtherPublications && renderOtherBibGroup(props.OtherPublications)}
      {pubDate && <address><span>Updated {new Date(pubDate).toDateString()} </span></address>}
    </>;
  }

  if (props.PrerenderData) {
    return render(props.PrerenderData);
  }

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [haldoc, setHALDocument] = useState<XMLDocument | null>(null);
  const [halPermission, _, halPrompt] = usePrivacyPrompt({
    Name: "hal",
    DisplayName: "HAL Articles API",
  });

  useEffect(() => {
    if (halPermission === "loading" || (!props.BypassPermission && halPermission !== "true")) {
      return;
    }
    (async () => {
      try {
        setHALDocument(await fetchHaldoc(props, new DOMParser()));
        setLoading(false);
      } catch {
        setError(true);
      }
    })();
  }, [halPermission]);

  if (!props.BypassPermission && (halPermission === "false" || halPermission === "unset")) {
    return <p>{halPrompt}</p>
  } else if (error) {
    return <p>Error!</p>
  } else if (loading) {
    return <p>Loading&hellip;</p>
  } else if (!haldoc) {
    return <p>Error!</p>
  }
  return render(haldoc);
}
