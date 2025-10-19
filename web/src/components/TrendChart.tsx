import { useEffect, useMemo, useState } from "react";
import { BELIEF_GROUPS, beliefColor } from "../data/beliefColors";

type TimelineSeries = {
  belief_group: string;
  values: number[];
};

type TimelineDataset = {
  years: number[];
  series: TimelineSeries[];
  metric: string;
  source: string;
  documentation_url?: string;
  notes?: string;
};

const DATA_URL = "/data/pre1776_foundings_timeline.json";
const MAX_SERIES = 8;

function TrendChart() {
  const [data, setData] = useState<TimelineDataset | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(DATA_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load timeline (${response.status})`);
        }
        return response.json();
      })
      .then((json: TimelineDataset) => {
        if (!cancelled) {
          setData(json);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const prepared = useMemo(() => {
    if (!data) {
      return null;
    }
    const years = data.years;
    if (!years.length) {
      return null;
    }

    const sortedSeries = [...data.series].sort((a, b) => {
      const aLast = a.values[a.values.length - 1] ?? 0;
      const bLast = b.values[b.values.length - 1] ?? 0;
      return bLast - aLast;
    });

    const selectedSeries = sortedSeries.slice(0, MAX_SERIES).map((entry) => ({
      belief_group: entry.belief_group,
      values: entry.values.map((value) => Number.isFinite(value) ? value : 0),
    }));

    const maxValue = selectedSeries.reduce((acc, series) => {
      const seriesMax = series.values.length ? Math.max(...series.values) : 0;
      return Math.max(acc, seriesMax);
    }, 0);

    return {
      years,
      series: selectedSeries,
      maxValue,
    };
  }, [data]);

  if (error) {
    return (
      <div className="trend-chart trend-chart--error">
        <p>Could not load founding timeline data: {error}</p>
      </div>
    );
  }

  if (!prepared || !data) {
    return (
      <div className="trend-chart trend-chart--loading">
        <p>Loading founding trends…</p>
      </div>
    );
  }

  const { years, series, maxValue } = prepared;
  const chartWidth = 420;
  const chartHeight = 240;
  const margin = { top: 20, right: 140, bottom: 30, left: 60 };
  const innerWidth = chartWidth - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;

  const xPositions = years.map((_, index) => {
    if (years.length === 1) {
      return margin.left + innerWidth / 2;
    }
    const ratio = index / (years.length - 1);
    return margin.left + ratio * innerWidth;
  });

  const yScale = (value: number) => {
    if (maxValue === 0) {
      return margin.top + innerHeight;
    }
    const normalized = value / maxValue;
    return margin.top + innerHeight - normalized * innerHeight;
  };

  const tickIndices = new Set<number>();
  if (years.length <= 6) {
    years.forEach((_, index) => tickIndices.add(index));
  } else {
    const lastIndex = years.length - 1;
    const anchors = [0, Math.floor(lastIndex / 2), lastIndex];
    if (lastIndex >= 3) {
      anchors.push(Math.floor(lastIndex / 3), Math.floor((2 * lastIndex) / 3));
    }
    anchors.forEach((value) => tickIndices.add(Math.min(lastIndex, Math.max(0, value))));
  }

  return (
    <div className="trend-chart">
      <div className="trend-chart__header">
        <h3>Founding Growth</h3>
        <p>Cumulative congregational foundings by belief group (1607 → 1776)</p>
      </div>
      <svg
        className="trend-chart__svg"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        role="img"
        aria-label="Congregation totals by denomination"
      >
        <g>
          {years.map((year, index) =>
            tickIndices.has(index) ? (
              <g key={year}>
                <line
                  x1={xPositions[index]}
                  x2={xPositions[index]}
                  y1={margin.top}
                  y2={margin.top + innerHeight}
                  stroke="rgba(15, 23, 42, 0.18)"
                  strokeDasharray="4 4"
                />
                <text
                  x={xPositions[index]}
                  y={chartHeight - 5}
                  textAnchor="middle"
                  className="trend-chart__axis-label"
                >
                  {year}
                </text>
              </g>
            ) : null
          )}

          {series.map((entry) => {
            const color = beliefColor(entry.belief_group as keyof typeof BELIEF_GROUPS);
            const pathD = entry.values
              .map((value, index) => {
                const x = xPositions[index];
                const y = yScale(value || 0);
                return `${index === 0 ? "M" : "L"}${x},${y}`;
              })
              .join(" ");

            const lastIndex = entry.values.length - 1;
            const lastX = xPositions[lastIndex];
            const lastY = yScale(entry.values[lastIndex] || 0);

            return (
              <g key={entry.belief_group}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={color}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
                {entry.values.map((value, index) => (
                  <circle
                    key={`${entry.belief_group}-${index}`}
                    cx={xPositions[index]}
                    cy={yScale(value || 0)}
                    r={4}
                    fill={color}
                    stroke="white"
                    strokeWidth={1.5}
                  />
                ))}
                <text
                  x={lastX + 8}
                  y={lastY + 4}
                  className="trend-chart__series-label"
                >
                  {entry.belief_group} ({Math.round(entry.values[lastIndex] || 0)})
                </text>
              </g>
            );
          })}

          <g>
            <text
              x={margin.left - 48}
              y={margin.top + innerHeight / 2}
              transform={`rotate(-90 ${margin.left - 48} ${margin.top + innerHeight / 2})`}
              className="trend-chart__axis-title"
            >
              Congregations
            </text>
            <text
              x={margin.left - 12}
              y={margin.top + 4}
              className="trend-chart__axis-annotation"
            >
              {Math.round(maxValue).toLocaleString()}
            </text>
            <text
              x={margin.left - 12}
              y={margin.top + innerHeight}
              className="trend-chart__axis-annotation"
            >
              0
            </text>
          </g>
        </g>
      </svg>
      <footer className="trend-chart__footer">
        {data.documentation_url ? (
          <a href={data.documentation_url} target="_blank" rel="noreferrer">
            Source: {data.source}
          </a>
        ) : (
          <span>Source: {data.source}</span>
        )}
        {data.notes ? <span className="trend-chart__notes">{data.notes}</span> : null}
      </footer>
    </div>
  );
}

export default TrendChart;
