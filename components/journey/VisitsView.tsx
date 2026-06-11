"use client";

import { ELEMENTS, VISIT_COLUMNS } from "./seed";
import { ELEMENT_TYPE_LABEL } from "@/lib/journey-model";

// §4.5 Visits view — SoA-style matrix.
// Rows = Journey Elements (with milestones distinguishable), columns = day offsets.
// Cell content = "yes if this activity-bearing element falls on this column day".

const ACTIVITY_ROWS = [
  { label: "Vitals",                  matches: (act: string) => /vital|bp|hr/i.test(act) },
  { label: "Labs panel",              matches: (act: string) => /lab|panel|pk/i.test(act) },
  { label: "ECG",                     matches: (act: string) => /ecg/i.test(act) },
  { label: "ePRO / Survey",           matches: (act: string) => /epro|survey/i.test(act) },
  { label: "Dose administration",     matches: (act: string) => /dose/i.test(act) },
  { label: "AE / Safety assessment",  matches: (act: string) => /ae|safety|adverse/i.test(act) },
  { label: "Eligibility / Consent",   matches: (act: string) => /elig|icf|consent/i.test(act) },
];

function elementForColumn(colDay: number) {
  return ELEMENTS.filter(
    (el) => el.day_offset !== undefined && Math.abs((el.day_offset ?? 9999) - colDay) <= 1
  );
}

export function VisitsView() {
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
                {VISIT_COLUMNS.map((c) => {
                  const els = elementForColumn(c.day);
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
                  {VISIT_COLUMNS.map((c) => {
                    const els = elementForColumn(c.day);
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

      {/* Element legend — show how the rows map to underlying Journey Elements + builder-named labels */}
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
                <th style={{ width: 130 }}>Applies to</th>
                <th>Activities</th>
              </tr>
            </thead>
            <tbody>
              {ELEMENTS.filter((e) => e.element_type !== "end_state").map((el) => (
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
    </div>
  );
}
