"use client";

import { ELEMENT_TYPE_LABEL } from "@/lib/journey-model";
import type { JourneyElement } from "@/lib/journey-model";

// §4.5 Visits view — SoA-style matrix. Activity rollup rows × visit-day columns.
// Studies without a fixed schedule (registries) get an empty-state explainer
// instead of a synthetic grid.

const ACTIVITY_ROWS = [
  { label: "Consent / Eligibility",   matches: (act: string) => /icf|consent|elig|i\/e/i.test(act) },
  { label: "Vitals",                  matches: (act: string) => /vital|bp|hr|temp/i.test(act) },
  { label: "Labs / blood draw",       matches: (act: string) => /lab|panel|pk|cbc|cmp|chem|blood|serolog|biomarker/i.test(act) },
  { label: "Imaging",                 matches: (act: string) => /imaging|ct|pet|mri|ultrasound|x-ray|ecg/i.test(act) },
  { label: "Procedure / Treatment",   matches: (act: string) => /apdt|embol|sham|procedure|dose|adminis|fusion|implant|biopsy|conditioning|infus|transpla/i.test(act) },
  { label: "ePRO / Symptom diary",    matches: (act: string) => /epro|survey|prom|vas|nrs|odi|qol|patient global|fact|diary|symptom/i.test(act) },
  { label: "Safety / AE assessment",  matches: (act: string) => /ae|safety|adverse|tolera|reactogen|toxic|complic/i.test(act) },
  { label: "Disease assessment",      matches: (act: string) => /response|restag|pathology|cytogen|molecul|disease|status/i.test(act) },
  { label: "Conmed / History",        matches: (act: string) => /conmed|concomit|history|comorbid|medication/i.test(act) },
];

function elementForColumn(elements: JourneyElement[], colDay: number, tolerance = 1) {
  return elements.filter(
    (el) => el.day_offset !== undefined && Math.abs((el.day_offset ?? 9999) - colDay) <= tolerance
  );
}

export function VisitsView({
  elements,
  visitColumns,
}: {
  elements: JourneyElement[];
  visitColumns?: { id: string; label: string; day: number }[];
}) {
  const hasGrid = visitColumns && visitColumns.length > 0;

  if (!hasGrid) {
    return (
      <div className="stack" style={{ gap: 18 }}>
        <div className="card">
          <div className="card-header">
            <h2>Schedule of Activities</h2>
            <span className="sub">No fixed schedule — registry / event-driven study</span>
          </div>
          <div className="card-body">
            <div className="muted" style={{ fontSize: 13, lineHeight: 1.6 }}>
              This study runs on a cadence and event-driven model — there's no fixed grid of
              named visits to project. Use the <strong>Flow</strong> view to see the journey graph,
              or <strong>Sequence</strong> for record-by-record detail.
            </div>
          </div>
        </div>
        <ElementListTable elements={elements} />
      </div>
    );
  }

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="card">
        <div className="card-header">
          <h2>Schedule of Activities</h2>
          <span className="sub">Time-grid projection · rows = activity rollups, columns = day offsets · milestones marked inline</span>
        </div>
        <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
          <table className="table" style={{ fontSize: 11.5, minWidth: 960 }}>
            <thead>
              <tr>
                <th style={{ width: 200, position: "sticky", left: 0, background: "var(--bg-muted)", zIndex: 1 }}>Activity</th>
                {visitColumns!.map((c) => {
                  const els = elementForColumn(elements, c.day);
                  const isMilestone = els.some((e) => e.element_type === "milestone");
                  return (
                    <th
                      key={c.id}
                      style={{
                        textAlign: "center",
                        background: isMilestone ? "var(--accent-soft)" : undefined,
                        color: isMilestone ? "var(--accent)" : undefined,
                        borderTop: isMilestone ? "2px solid var(--accent)" : undefined,
                        minWidth: 70,
                      }}
                    >
                      <div>{c.label}</div>
                      <div style={{ fontSize: 9, opacity: 0.7, fontWeight: 400 }}>
                        D{c.day >= 0 ? `+${c.day}` : c.day}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {ACTIVITY_ROWS.map((row) => (
                <tr key={row.label}>
                  <td style={{ position: "sticky", left: 0, background: "var(--bg-surface)", fontWeight: 500 }}>
                    {row.label}
                  </td>
                  {visitColumns!.map((c) => {
                    const els = elementForColumn(elements, c.day);
                    const match = els.some((el) => el.activities.some(row.matches));
                    return (
                      <td key={c.id} style={{ textAlign: "center" }}>
                        {match ? <span className="chip blue" style={{ fontSize: 10 }}>●</span> : <span className="muted">—</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ElementListTable elements={elements} />
    </div>
  );
}

function ElementListTable({ elements }: { elements: JourneyElement[] }) {
  return (
    <div className="card">
      <div className="card-header">
        <h2>Journey Elements behind the grid</h2>
        <span className="sub">Same data — surfaced as records instead of as a matrix</span>
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Builder label (§3.5)</th>
              <th style={{ width: 130 }}>element_type</th>
              <th style={{ width: 100 }}>Day offset</th>
              <th style={{ width: 160 }}>Applies to</th>
              <th>Activities</th>
            </tr>
          </thead>
          <tbody>
            {elements.filter((e) => e.element_type !== "end_state").map((el) => (
              <tr key={el.id}>
                <td>
                  <span style={{ fontWeight: el.element_type === "milestone" ? 700 : 500, color: el.element_type === "milestone" ? "var(--accent)" : undefined }}>
                    {el.builder_label}
                  </span>
                </td>
                <td>
                  <span className={`chip ${el.element_type === "milestone" ? "blue" : "slate"}`}>
                    {ELEMENT_TYPE_LABEL[el.element_type]}
                  </span>
                </td>
                <td>
                  {el.day_offset !== undefined ? (
                    <span className="code">
                      D{el.day_offset >= 0 ? `+${el.day_offset}` : el.day_offset}
                      {el.window_minus || el.window_plus ? ` (-${el.window_minus ?? 0}/+${el.window_plus ?? 0})` : ""}
                    </span>
                  ) : el.cadence ? (
                    <span className="code">every {el.cadence.interval_days}d</span>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
                <td><span className="code">{el.applies_to_expr}</span></td>
                <td style={{ fontSize: 11.5 }}>
                  {el.activities.length === 0 ? (
                    <span className="muted">—</span>
                  ) : (
                    el.activities.join(" · ")
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
