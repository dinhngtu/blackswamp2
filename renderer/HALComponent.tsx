import { useEffect, useState } from "preact/hooks";
import { Fragment } from "preact/jsx-runtime";
import purifier from "purifier";

interface BibGroup {
  name: string;
  bibs: Element[];
};

export interface HALComponentProps {
  IdHAL: string;
}

const docTypes: { [K: string]: number } = {
  ART: 1,
  COMM: 2,
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

export default function HALComponent(props: HALComponentProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [haldoc, setHALDocument] = useState<XMLDocument | null>(null);
  useEffect(() => {
    (async () => {
      try {
        if (!/^[a-zA-Z0-9\-]+$/.test(props.IdHAL)) {
          setError(true);
          return;
        }
        const resp = await fetch(`https://api.archives-ouvertes.fr/search/?wt=xml-tei&rows=100&sort=producedDate_tdate+desc&q=authIdHal_s:${props.IdHAL}`);
        if (!resp.ok) {
          setError(true);
          return;
        }
        const parser = new DOMParser();
        setHALDocument(parser.parseFromString(await resp.text(), "text/xml"));
        setLoading(false);
      } catch {
        setError(true);
      }
    })();
  }, []);

  if (error) {
    return <p>Error!</p>
  } else if (loading) {
    return <p>Loading&hellip;</p>
  } else if (!haldoc) {
    return <p>Error!</p>
  }

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
      if (au.querySelector('idno[type="idhal"][notation="string"]')?.textContent === props.IdHAL) {
        return <strong>{auName}</strong>;
      } else {
        return auName;
      }
    }).map((auName, index) => (
      <Fragment>
        {index > 0 && ", "}
        {auName}
      </Fragment>
    ));
  }

  function renderBib(bib: Element, index: number) {
    const key = bib.querySelector('publicationStmt>idno[type="halId"]')?.textContent || index;
    const title = bib.querySelector("titleStmt>title")?.textContent;
    const uri = bib.querySelector('publicationStmt>idno[type="halUri"]')?.textContent;
    const refHtml = bib.querySelector('publicationStmt>idno[type="halRefHtml"]')?.textContent;
    return (
      <li class="bib" key={key}>
        { uri ? <a class="bibTitle" href={uri}>{title}</a> : <p class="bibTitle">{title}</p>}
        <p class="bibAuthors">{renderAuthors(bib)}</p>
        {refHtml && <p class="bibRef" dangerouslySetInnerHTML={{ __html: purifier.sanitize(refHtml) }} />}
      </li>
    );
  }

  function renderBibGroup(groupType: string, bg: BibGroup) {
    return (
      <Fragment key={groupType}>
        <h2>{bg.name}</h2>
        <ul class="bibGroup">{bg.bibs
          .sort((a, b) => -(getBibDate(a).localeCompare(getBibDate(b))))
          .map((bib, index) => renderBib(bib, index))}</ul>
      </Fragment>
    );
  }

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
  return <Fragment>{renderedBibGroups}</Fragment>;
}
