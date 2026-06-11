"use client";

import { useState } from "react";

// NFR-095 — combined-dataset export shape. Pooja+Ana 2026-06-10:
// "one combined dataset for review, not N narrow exports stitched together downstream."
//
// The shape: one row per subject, with Tag Category values (one column per category, using export_code)
// joined alongside subject metadata + disposition + enrollment state.

const SAMPLE_ROWS = [
  {
    subject_id: "001-0042",
    site: "001",
    country: "US",
    consented_protocol_version: "P-2.0",
    current_study_version: "v1.1",
    enrolled: true,
    disposition: "active",
    ARM: "TRTA",
    COHORT: "C1",
    RISK: "HR",
    ITT: "ITT",
  },
  {
    subject_id: "001-0043",
    site: "001",
    country: "US",
    consented_protocol_version: "P-2.0",
    current_study_version: "v1.1",
    enrolled: true,
    disposition: "completed",
    ARM: "SOC",
    COHORT: "C1",
    RISK: "LR",
    ITT: "ITT",
  },
  {
    subject_id: "002-0007",
    site: "002",
    country: "DE",
    consented_protocol_version: "P-2.0",
    current_study_version: "v1.1",
    enrolled: false, // screened but not yet randomized
    disposition: "active",
    ARM: "",
    COHORT: "",
    RISK: "HR",
    ITT: "",
  },
  {
    subject_id: "003-0019",
    site: "003",
    country: "US",
    consented_protocol_version: "P-1.9",
    current_study_version: "v1.0",
    enrolled: true,
    disposition: "withdrew_consent",
    ARM: "TRTA",
    COHORT: "C1",
    RISK: "LR",
    ITT: "",
  },
];

type ColKey =
  | "subject_id" | "site" | "country" | "consented_protocol_version"
  | "current_study_version" | "enrolled" | "disposition"
  | "ARM" | "COHORT" | "RISK" | "ITT";

const COLUMN_GROUPS: { label: string; cols: ColKey[] }[] = [
  { label: "Identity",       cols: ["subject_id", "site", "country"] },
  { label: "Version pin (§23.7)", cols: ["consented_protocol_version", "current_study_version"] },
  { label: "Status",         cols: ["enrolled", "disposition"] },
  { label: "Tag categories", cols: ["ARM", "COHORT", "RISK", "ITT"] },
];

const ALL_COLS: ColKey[] = COLUMN_GROUPS.flatMap((g) => g.cols);

export function ExportShapePreview() {
  const [shape, setShape] = useState<"wide" | "long">("wide");

  return (
    <div className="card">
      <div className="card-header">
        <h2>Combined dataset — preview</h2>
        <span className="sub">NFR-095 · one row per subject · tag categories as columns (wide) or rows (long)</span>
        <div style={{ marginLeft: "auto" }}>
          <div className="env-switcher">
            <button data-active={shape === "wide"} onClick={() => setShape("wide")}
              style={{ background: shape === "wide" ? "var(--accent)" : undefined, color: shape === "wide" ? "white" : undefined }}>
              Wide
            </button>
            <button data-active={shape === "long"} onClick={() => setShape("long")}
              style={{ background: shape === "long" ? "var(--accent)" : undefined, color: shape === "long" ? "white" : undefined }}>
              Long
            </button>
          </div>
        </div>
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        {shape === "wide" ? (
          <table className="table" style={{ fontSize: 11.5 }}>
            <thead>
              <tr>
                {COLUMN_GROUPS.map((g) => (
                  <th key={g.label} colSpan={g.cols.length} style={{ textAlign: "center", borderRight: "2px solid var(--border-subtle)" }}>
                    {g.label}
                  </th>
                ))}
              </tr>
              <tr>
                {ALL_COLS.map((c) => (
                  <th key={c} style={{ fontSize: 10 }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SAMPLE_ROWS.map((r) => (
                <tr key={r.subject_id}>
                  {ALL_COLS.map((c) => {
                    const v = (r as Record<ColKey, string | boolean>)[c];
                    if (typeof v === "boolean") {
                      return <td key={c}><span className={`chip ${v ? "green" : "slate"}`} style={{ fontSize: 10 }}>{v ? "Y" : "N"}</span></td>;
                    }
                    if (v === "") {
                      return <td key={c} className="muted" style={{ fontFamily: "JetBrains Mono, monospace" }}>—</td>;
                    }
                    const isCode = ["ARM", "COHORT", "RISK", "ITT", "current_study_version", "consented_protocol_version"].includes(c);
                    return <td key={c} style={isCode ? { fontFamily: "JetBrains Mono, monospace" } : undefined}>{v}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="table" style={{ fontSize: 11.5 }}>
            <thead>
              <tr>
                <th>subject_id</th>
                <th>tag_category</th>
                <th>value (export_code)</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_ROWS.flatMap((r) =>
                (["ARM", "COHORT", "RISK", "ITT"] as ColKey[])
                  .filter((c) => r[c] !== "")
                  .map((c) => (
                    <tr key={`${r.subject_id}-${c}`}>
                      <td style={{ fontFamily: "JetBrains Mono, monospace" }}>{r.subject_id}</td>
                      <td>{c}</td>
                      <td><span className="code">{r[c]}</span></td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
