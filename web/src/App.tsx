import { useEffect, useMemo, useState } from "react";
import ColonyMap from "./components/ColonyMap";
import NarrativePanel from "./components/NarrativePanel";
import TimelineControls from "./components/TimelineControls";
import TrendChart from "./components/TrendChart";
import { BELIEF_GROUPS, beliefColor } from "./data/beliefColors";

type BeliefFilter = "all" | keyof typeof BELIEF_GROUPS;

type MapMode = "dominant" | "percentage";

type ColonySelection = {
  colony: string;
  belief: string;
  share: number;
  percentages: Record<string, number>;
};

const DEFAULT_YEAR = 1776;

function App() {
  const [timelineYears, setTimelineYears] = useState<number[]>([DEFAULT_YEAR]);
  const [year, setYear] = useState<number>(DEFAULT_YEAR);
  const [beliefFilter, setBeliefFilter] = useState<BeliefFilter>("all");
  const [mapMode, setMapMode] = useState<MapMode>("dominant");
  const [selection, setSelection] = useState<ColonySelection | null>(null);

  useEffect(() => {
    fetch("/data/pre1776_foundings_timeline.json")
      .then((response) => response.json())
      .then((json) => {
        const fetchedYears = Array.isArray(json?.years)
          ? json.years.map((value: number) => Number(value)).filter((value: number) => !Number.isNaN(value))
          : [];
        const merged = Array.from(new Set([...fetchedYears, DEFAULT_YEAR])).sort((a, b) => a - b);
        if (merged.length) {
          setTimelineYears(merged);
          setYear((prev) => (merged.includes(prev) ? prev : merged[merged.length - 1]));
        }
      })
      .catch((error) => {
        console.warn("Failed to fetch pre-1776 timeline years", error);
      });
  }, []);

  useEffect(() => {
    setSelection(null);
  }, [beliefFilter, mapMode, year]);

  const filterOptions = useMemo(
    () =>
      Object.entries(BELIEF_GROUPS).map(([key, label]) => ({
        key: key as keyof typeof BELIEF_GROUPS,
        label,
      })),
    []
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Colonial Belief Landscape</h1>
        <p>
          Explore the denominational makeup of the American colonies through time. Use
          the slider to jump between pivotal years, inspect migration narratives, and
          dive into colony-level profiles.
        </p>
      </header>

      <section className="timeline-section">
        <TimelineControls years={timelineYears} year={year} onYearChange={setYear} />
      </section>

      <div className="content-layout">
        <div className="map-section">
          <ColonyMap
            year={year}
            beliefFilter={mapMode === "dominant" ? "all" : beliefFilter}
            mapMode={mapMode}
            onSelection={setSelection}
          />
          <div className="legend">
            <h2>Belief Groups</h2>
            <ul>
              {filterOptions.map(({ key, label }) => (
                <li key={key}>
                  <span
                    className="swatch"
                    style={{ backgroundColor: beliefColor(key) }}
                  />
                  {label}
                </li>
              ))}
            </ul>
          </div>
          <div className="controls-bar">
            <label>
              Map Focus
              <select
                value={mapMode}
                onChange={(event) =>
                  setMapMode(event.target.value as MapMode)
                }
              >
                <option value="dominant">Dominant belief (color-coded)</option>
                <option value="percentage">Filter by belief percentage</option>
              </select>
            </label>
            <label>
              Tradition Filter
              <select
                value={beliefFilter}
                onChange={(event) =>
                  setBeliefFilter(event.target.value as BeliefFilter)
                }
                disabled={mapMode === "dominant"}
              >
                <option value="all">All traditions</option>
                {filterOptions.map(({ key, label }) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            {selection ? (
              <div>
                <strong>{selection.colony}</strong>: {selection.belief} ({" "}
                {selection.share.toFixed(1)}%)
              </div>
            ) : (
              <div>Select a colony point to inspect percentages.</div>
            )}
          </div>
        </div>

        <div className="sidebar">
          <TrendChart />
          <NarrativePanel year={year} selection={selection} />
        </div>
      </div>
    </div>
  );
}

export default App;
