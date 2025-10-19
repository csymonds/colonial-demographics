import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { BELIEF_GROUPS, beliefColor } from "../data/beliefColors";

type BeliefFilter = "all" | keyof typeof BELIEF_GROUPS;

type MapMode = "dominant" | "percentage";

type ColonyFeature = {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    year: number;
    colony: string;
    dominant_belief: string;
    dominant_share: number;
    percentages: Record<string, number>;
    breakdown?: Array<{ belief: string; share: number }>;
    source: string;
    source_urls?: string[];
    documentation_url?: string;
  };
};

type DecoratedFeature = ColonyFeature & {
  properties: ColonyFeature["properties"] & {
    color: string;
    filtered_share: number;
    documentation_url: string;
  };
};

type GeoJSONFeatureCollection = {
  type: "FeatureCollection";
  features: ColonyFeature[];
};

type DecoratedCollection = {
  type: "FeatureCollection";
  features: DecoratedFeature[];
};

type SelectionPayload = {
  colony: string;
  belief: string;
  share: number;
  percentages: Record<string, number>;
};

type Props = {
  year: number;
  beliefFilter: BeliefFilter;
  mapMode: MapMode;
  onSelection: (selection: SelectionPayload | null) => void;
};

const DATA_URL = "/data/pre1776_colony_profiles.geojson";
const SOURCE_ID = "colony-points";
const LAYER_ID = "colony-points-layer";
const EMPTY_COLLECTION: DecoratedCollection = { type: "FeatureCollection", features: [] };

function ColonyMap({ year, beliefFilter, mapMode, onSelection }: Props) {
  const mapCanvasRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const mapModeRef = useRef<MapMode>(mapMode);
  const beliefFilterRef = useRef<BeliefFilter>(beliefFilter);
  const [data, setData] = useState<GeoJSONFeatureCollection | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [activeInfo, setActiveInfo] = useState<null | {
    colony: string;
    year: number;
    focusBelief: string;
    focusDisplayName: string;
    focusShare: number;
    focusCount: number;
    colorHighlight: string;
    topEntries: Array<{
      belief: string;
      displayName: string;
      share: number;
      count: number;
      colorKey?: keyof typeof BELIEF_GROUPS;
    }>;
    documentation_url?: string;
  }>(null);

  useEffect(() => {
    mapModeRef.current = mapMode;
  }, [mapMode]);

  useEffect(() => {
    beliefFilterRef.current = beliefFilter;
  }, [beliefFilter]);

  useEffect(() => {
    const cacheBuster = import.meta.env.DEV ? `?t=${Date.now()}` : "";

    fetch(`${DATA_URL}${cacheBuster}`)
      .then((response) => response.json())
      .then((json: GeoJSONFeatureCollection) => setData(json))
      .catch((error) => {
        console.error("Failed to fetch colony profile data", error);
      });
  }, []);

  useEffect(() => {
    if (!mapCanvasRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: mapCanvasRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [-77.0, 38.5],
      zoom: 4.2,
      attributionControl: true,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }));
    map.on("load", () => setMapReady(true));

    mapRef.current = map;

    return () => {
      setMapReady(false);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const { collection, hasYearData } = useMemo(() => {
    if (!data) {
      return { collection: EMPTY_COLLECTION, hasYearData: false };
    }

    const featuresForYear = data.features.filter(
      (feature) => feature.properties.year === year
    );

    if (!featuresForYear.length) {
      return { collection: EMPTY_COLLECTION, hasYearData: false };
    }

    const isPercentageMode = mapMode === "percentage";

    const decorated: DecoratedFeature[] = featuresForYear.map((feature) => {
      const { dominant_belief, percentages } = feature.properties;
      const key = dominant_belief as keyof typeof BELIEF_GROUPS;

      const color = beliefColor(
        isPercentageMode && beliefFilter !== "all"
          ? (beliefFilter as keyof typeof BELIEF_GROUPS)
          : key
      );

      const percentage =
        beliefFilter === "all"
          ? feature.properties.dominant_share
          : percentages[beliefFilter] ?? 0;

      const docUrl =
        feature.properties.documentation_url || feature.properties.source_urls?.[0] || "";

      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [
            feature.geometry.coordinates[0],
            feature.geometry.coordinates[1],
          ],
        },
        properties: {
          ...feature.properties,
          color,
          filtered_share: percentage,
          documentation_url: docUrl,
        },
      };
    });

    return {
      collection: { type: "FeatureCollection", features: decorated },
      hasYearData: true,
    };
  }, [beliefFilter, data, mapMode, year]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) {
      return;
    }

    if (!map.getSource(SOURCE_ID)) {
      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: collection,
      });
      map.addLayer({
        id: LAYER_ID,
        type: "circle",
        source: SOURCE_ID,
        paint: {
          "circle-radius": 10,
          "circle-stroke-width": 1.2,
          "circle-stroke-color": "rgba(15, 23, 42, 0.55)",
          "circle-color": ["get", "color"],
          "circle-opacity": 0.92,
        },
      });

      map.on("mouseenter", LAYER_ID, () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", LAYER_ID, () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("click", LAYER_ID, (event) => {
        const feature = event.features?.[0] as DecoratedFeature | undefined;
        if (!feature) {
          return;
        }
        const { colony, dominant_belief, dominant_share, documentation_url } =
          feature.properties;

        // Read canonical data from the raw GeoJSON in state (avoids any mutation done by map layers).
        const yearVal = (feature.properties as any).year as number;
        const rawFeature = data?.features.find(
          (f) => f.properties.colony === colony && f.properties.year === yearVal
        );
        const percentages = (rawFeature?.properties as any)?.percentages ||
          (feature.properties as any).percentages || {};
        const countsByBelief = (rawFeature?.properties as any)?.counts ||
          (feature.properties as any).counts || {};

        // Build rows from the percentages map + counts to guarantee labels exist.
        const normalizedEntries = Object.entries(percentages || {})
          .filter(([k, v]) => typeof k === "string" && Number(v) > 0)
          .map(([beliefKey, shareValue]) => {
            const share = Number(shareValue) || 0;
            const canonical = beliefKey as keyof typeof BELIEF_GROUPS;
            const hasCanonical = Object.prototype.hasOwnProperty.call(
              BELIEF_GROUPS,
              canonical
            );
            const displayName = hasCanonical
              ? BELIEF_GROUPS[canonical]
              : (beliefKey as string);
            const rawCount = countsByBelief[beliefKey as string];
            const count = rawCount ? Math.max(0, Math.round(Number(rawCount))) : 0;
            return {
              belief: beliefKey as string,
              displayName,
              share,
              count,
              colorKey: hasCanonical ? canonical : undefined,
            };
          })
          .sort((a, b) => b.share - a.share);

        let focusBelief = dominant_belief;
        let focusValue = dominant_share;

        if (mapModeRef.current === "percentage" && beliefFilterRef.current !== "all") {
          focusBelief = beliefFilterRef.current;
          focusValue = percentages[beliefFilterRef.current] ?? 0;
        }

        const topEntries = normalizedEntries.slice(0, 6);
        const focusEntry =
          normalizedEntries.find((entry) => entry.belief === focusBelief) ||
          topEntries[0] ||
          normalizedEntries[0];

        const focusShareNumeric = focusEntry ? focusEntry.share : Number(focusValue) || 0;
        const focusDisplayName = focusEntry
          ? focusEntry.displayName
          : BELIEF_GROUPS[focusBelief as keyof typeof BELIEF_GROUPS] ?? focusBelief;
        const focusCount = focusEntry ? focusEntry.count : 0;
        const fallbackKey =
          focusEntry?.colorKey ??
          (Object.prototype.hasOwnProperty.call(BELIEF_GROUPS, focusBelief)
            ? (focusBelief as keyof typeof BELIEF_GROUPS)
            : undefined);
        const colorHighlight = fallbackKey ? beliefColor(fallbackKey) : beliefColor("");

        setActiveInfo({
          colony,
          year: feature.properties.year,
          focusBelief,
          focusDisplayName,
          focusShare: focusShareNumeric,
          focusCount,
          colorHighlight,
          topEntries,
          documentation_url,
        });

        onSelection({
          colony,
          belief: dominant_belief,
          share: focusShareNumeric,
          percentages,
        });
      });

      // Do not clear the info panel on background clicks; leave it open until a new colony is clicked.
    } else {
      const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource;
      source.setData(collection as unknown as any);
    }
  }, [collection, mapReady, onSelection]);

  useEffect(() => {
    setActiveInfo(null);
  }, [year, beliefFilter, mapMode, hasYearData]);

  useEffect(() => {
    if (!mapRef.current || !mapReady) {
      return;
    }

    const map = mapRef.current;
    const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
    if (source) {
      source.setData(collection as unknown as any);
    }

    const circleColorExpression = [
      "case",
      ["has", "color"],
      ["get", "color"],
      "#94a3b8",
    ];

    const circleRadiusExpression = [
      "interpolate",
      ["linear"],
      ["coalesce", ["get", "filtered_share"], 0],
      0,
      6,
      25,
      20,
    ];

    if (map.getLayer(LAYER_ID)) {
      map.setPaintProperty(LAYER_ID, "circle-color", circleColorExpression as any);
      map.setPaintProperty(LAYER_ID, "circle-radius", circleRadiusExpression as any);
    }
  }, [collection, mapReady]);

  // Keep panel open and refresh when year/filters/data change
  useEffect(() => {
    if (!activeInfo || !data) return;
    const colony = activeInfo.colony;
    const rawFeature = data.features.find(
      (f) => f.properties.colony === colony && f.properties.year === year
    );
    if (!rawFeature) return;
    const p: Record<string, number> = (rawFeature.properties as any).percentages || {};
    const counts: Record<string, number> = (rawFeature.properties as any).counts || {};
    const entries = Object.entries(p)
      .filter(([k, v]) => typeof k === "string" && Number(v) > 0)
      .map(([beliefKey, shareValue]) => {
        const share = Number(shareValue) || 0;
        const canonical = beliefKey as keyof typeof BELIEF_GROUPS;
        const hasCanonical = Object.prototype.hasOwnProperty.call(BELIEF_GROUPS, canonical);
        const displayName = hasCanonical ? BELIEF_GROUPS[canonical] : (beliefKey as string);
        const count = counts[beliefKey as string]
          ? Math.max(0, Math.round(Number(counts[beliefKey as string])))
          : 0;
        return { belief: beliefKey as string, displayName, share, count, colorKey: hasCanonical ? canonical : undefined };
      })
      .sort((a, b) => b.share - a.share)
      .slice(0, 6);

    let focusBelief = (rawFeature.properties as any).dominant_belief as string;
    if (mapModeRef.current === "percentage" && beliefFilterRef.current !== "all") {
      focusBelief = beliefFilterRef.current as string;
    }
    const focusEntry = entries.find((e) => e.belief === focusBelief) || entries[0];
    if (!focusEntry) return;
    const colorKey = focusEntry.colorKey ??
      ((Object.prototype.hasOwnProperty.call(BELIEF_GROUPS, focusBelief)
        ? (focusBelief as keyof typeof BELIEF_GROUPS)
        : undefined));
    setActiveInfo({
      colony,
      year,
      focusBelief,
      focusDisplayName: focusEntry.displayName,
      focusShare: focusEntry.share,
      focusCount: focusEntry.count,
      colorHighlight: colorKey ? beliefColor(colorKey) : beliefColor(""),
      topEntries: entries,
      documentation_url: (rawFeature.properties as any).source_urls?.[0] || "",
    });
  }, [year, beliefFilter, mapMode, hasYearData, data]);



  return (
    <div className="map-container">
      <div ref={mapCanvasRef} className="map-canvas" />
      <div className="year-badge">Year: {year}</div>
      {!hasYearData ? (
        <div className="map-overlay">
          <strong>No colony dataset for {year} yet</strong>
          <p>
            We’re gathering sources for this year. Try another stop on the timeline to
            explore available colony breakdowns.
          </p>
        </div>
      ) : null}
      {activeInfo ? (
        <div className="map-info-panel">
          <header>
            <h4>{activeInfo.colony}</h4>
            <span>{activeInfo.year}</span>
          </header>
          <p>
            <strong style={{ color: activeInfo.colorHighlight }}>{activeInfo.focusDisplayName}</strong> · {activeInfo.focusShare.toFixed(1)}%
            {activeInfo.focusCount ? ` (${activeInfo.focusCount.toLocaleString()} congregations)` : ""}
          </p>
          <ul className="map-info-panel__list">
            {activeInfo.topEntries.map(({ belief, share, displayName, count, colorKey }) => {
              const colorValue =
                colorKey && colorKey in BELIEF_GROUPS
                  ? beliefColor(colorKey)
                  : "#475569";
              return (
                <li key={belief}>
                  <span className="swatch" style={{ background: colorValue }} />
                  <div className="belief-line">
                    <span className="belief-name" style={{ color: colorValue }}>
                      {displayName}
                    </span>
                    <span className="belief-meta">
                      {count ? `${count.toLocaleString()} congregations · ` : ""}
                      {share.toFixed(1)}%
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
          {activeInfo.documentation_url ? (
            <a href={activeInfo.documentation_url} target="_blank" rel="noreferrer">
              Source
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default ColonyMap;
