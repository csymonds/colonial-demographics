export const BELIEF_GROUPS = {
  Congregationalist: "Congregationalist",
  "Episcopalian/Anglican": "Episcopalian / Anglican",
  Baptist: "Baptist",
  Presbyterian: "Presbyterian",
  Quaker: "Quaker",
  "Reformed (Dutch)": "Reformed (Dutch)",
  "Reformed (German)": "Reformed (German)",
  Lutheran: "Lutheran",
  "Roman Catholic": "Roman Catholic",
  Moravian: "Moravian",
  Jewish: "Jewish",
  Methodist: "Methodist",
  Huguenot: "Huguenot",
  Other: "Other / Unspecified",
} as const;

type GroupKey = keyof typeof BELIEF_GROUPS;

const COLOR_SCALE: Record<GroupKey, string> = {
  Congregationalist: "#2563eb",
  "Episcopalian/Anglican": "#6366f1",
  Baptist: "#16a34a",
  Presbyterian: "#0ea5e9",
  Quaker: "#f97316",
  "Reformed (Dutch)": "#f59e0b",
  "Reformed (German)": "#facc15",
  Lutheran: "#ef4444",
  "Roman Catholic": "#a855f7",
  Moravian: "#ec4899",
  Jewish: "#14b8a6",
  Methodist: "#7c3aed",
  Huguenot: "#f472b6",
  Other: "#94a3b8",
};

type ExtendedGroupKey = GroupKey | "";

export function beliefColor(group: ExtendedGroupKey): string {
  if (group in COLOR_SCALE) {
    return COLOR_SCALE[group as GroupKey];
  }
  return COLOR_SCALE.Other;
}
