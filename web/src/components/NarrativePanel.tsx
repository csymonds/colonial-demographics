import { useMemo } from "react";
import { BELIEF_GROUPS, beliefColor } from "../data/beliefColors";

type Selection = {
  colony: string;
  belief: string;
  share: number;
  percentages: Record<string, number>;
};

type YearSummary = {
  title: string;
  description: string;
  bullets: string[];
  citation?: { label: string; url: string };
};

type NarrativePanelProps = {
  year: number;
  selection: Selection | null;
};

const YEAR_SUMMARIES: Record<number, YearSummary> = {
  1607: {
    title: "1607: Jamestown Parish Roots",
    description:
      "England’s first permanent North American colony planted Anglican worship at Jamestown, shaping Chesapeake religious life.",
    bullets: [
      "Chaplain Robert Hunt organized Anglican services within days of landing.",
      "James City Parish became the first enduring Church of England congregation in Virginia.",
    ],
    citation: {
      label: "Jamestown Rediscovery",
      url: "https://historicjamestowne.org/history/church",
    },
  },
  1620: {
    title: "1620: Pilgrim Arrival",
    description:
      "The Mayflower expedition established Plymouth Colony with separatist Congregationalists seeking religious autonomy from the Church of England.",
    bullets: [
      "Plymouth’s church covenant became a template for later Puritan congregations.",
      "Neighboring Wampanoag communities shaped settlement survival and governance.",
    ],
    citation: {
      label: "Pilgrim Hall Museum",
      url: "https://pilgrimhall.org/learn/mayflower-passengers",
    },
  },
  1700: {
    title: "1700: A Mosaic of Congregations",
    description:
      "New England’s Puritan core faced growing Anglican, Baptist, and Quaker communities across the colonies.",
    bullets: [
      "Quaker toleration in Pennsylvania drew dissenters from Europe and other colonies.",
      "Anglican clergy expanded under the Society for the Propagation of the Gospel (SPG).",
    ],
    citation: {
      label: "National Humanities Center",
      url: "https://nationalhumanitiescenter.org/tserve/eighteen/ekeyinfo/relinfo.htm",
    },
  },
  1776: {
    title: "1776: Diverse Worship Landscape",
    description:
      "Finke & Stark’s tallies show no single denomination dominating the colonies—Congregationalists lead only in New England while Baptists, Presbyterians, Anglicans, Quakers, and others define regional life.",
    bullets: [
      "Baptists counted 497 congregations nationally, nearly matching the Anglican total of 495.",
      "Methodists were small (65 congregations) but poised for explosive growth after independence.",
    ],
    citation: {
      label: "Finke & Stark (1989)",
      url: "https://www.jstor.org/stable/3710731",
    },
  },
  1850: {
    title: "1850: Second Great Awakening Legacy",
    description:
      "Methodists and Baptists surge past older traditions, reflecting evangelical revivals and westward expansion.",
    bullets: [
      "Methodist congregations jump from 65 in 1776 to more than 13,000 by 1850.",
      "Roman Catholic parishes expand dramatically with immigration, especially in urban centers.",
    ],
    citation: {
      label: "Finke & Stark (Table 5)",
      url: "https://www.jstor.org/stable/3710731",
    },
  },
};

function formatPercent(value: number | string) {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    return "0%";
  }
  return `${numeric.toFixed(1)}%`;
}

function NarrativePanel({ year, selection }: NarrativePanelProps) {
  const summary = useMemo(() => {
    const availableYears = Object.keys(YEAR_SUMMARIES)
      .map((value) => Number(value))
      .sort((a, b) => a - b);
    const match = availableYears.reduce((acc, value) => (value <= year ? value : acc), availableYears[0]);
    return YEAR_SUMMARIES[match];
  }, [year]);

  const topEntries = useMemo(() => {
    if (!selection?.percentages) {
      return [];
    }
    return Object.entries(selection.percentages)
      .map(([belief, value]) => [belief, Number(value) || 0] as const)
      .filter(([, value]) => value > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [selection]);

  return (
    <aside className="narrative-panel">
      <header>
        <h2>Timeline Narrative</h2>
        <p className="narrative-year">Focus year: {year}</p>
      </header>

      {summary ? (
        <section className="narrative-summary">
          <h3>{summary.title}</h3>
          <p>{summary.description}</p>
          <ul>
            {summary.bullets.map((bullet, index) => (
              <li key={index}>{bullet}</li>
            ))}
          </ul>
          {summary.citation ? (
            <a
              className="narrative-citation"
              href={summary.citation.url}
              target="_blank"
              rel="noreferrer"
            >
              Source: {summary.citation.label}
            </a>
          ) : null}
        </section>
      ) : (
        <p className="narrative-placeholder">
          Choose a year on the slider to load its historical context and primary sources.
        </p>
      )}

      <section className="narrative-selection">
        <h3>Colony Spotlight</h3>
        {selection ? (
          <div className="selection-details">
            <h4>{selection.colony}</h4>
            <p>
              Dominant tradition: <strong>{selection.belief}</strong> ({" "}
              {formatPercent(selection.share)})
            </p>
            {topEntries.length > 0 ? (
              <ul className="selection-list">
                {topEntries.map(([belief, value]) => (
                  <li key={belief}>
                    <span
                      className="swatch"
                      style={{ backgroundColor: beliefColor(belief as keyof typeof BELIEF_GROUPS) }}
                    />
                    <span className="selection-belief">{belief}</span>
                    <span className="selection-value">{formatPercent(value)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Hover or click on a colony in the map to see denominational breakdowns.</p>
            )}
          </div>
        ) : (
          <p>Select a colony point on the map to inspect its denominational profile.</p>
        )}
      </section>
    </aside>
  );
}

export default NarrativePanel;
