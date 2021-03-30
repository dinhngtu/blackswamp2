import { useEffect, useState } from "preact/hooks";
import { Fragment } from "preact/jsx-runtime";
import purifier from "purifier";

export interface HALComponentProps {
  IdHAL: string;
}

export default function HALComponent(props: HALComponentProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [haldoc, setHALDocument] = useState<XMLDocument | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(`https://api.archives-ouvertes.fr/search/?wt=xml-tei&q=authIdHal_s:${props.IdHAL}`);
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
  if (loading) {
    return <p>Loading&hellip;</p>
  } else if (error || !haldoc) {
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

  function renderBibGroup(groupName: string, bibs: Element[]) {
    return (
      <Fragment key={groupName}>
        <h2>{groupName}</h2>
        <ul class="bibGroup">{bibs
          .sort((a, b) => -(getBibDate(a).localeCompare(getBibDate(b))))
          .map((bib, index) => renderBib(bib, index))}</ul>
      </Fragment>
    );
  }

  const bibs = Array.from(haldoc.querySelectorAll("body>listBibl>biblFull"));
  const bibGroups = bibs.reduce<{ [K: string]: Element[] }>((groups, bib) => {
    const groupName = bib.querySelector('profileDesc>textClass>classCode[scheme="halTypology"]')?.textContent;
    if (!groupName) {
      return groups;
    }
    const group = (groups[groupName] || []);
    group.push(bib);
    groups[groupName] = group;
    return groups;
  }, {})
  return <Fragment>{Object.entries(bibGroups).map(([g, bib]) => renderBibGroup(g, bib))}</Fragment>;
}
