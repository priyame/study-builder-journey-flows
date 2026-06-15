"use client";

import { useState, useMemo } from "react";
import { useActiveStudy } from "@/lib/active-study";

// NFR-095 — combined-dataset export shape. Each fixture supplies its own
// exportPreview rows; this component derives columns from the rows themselves
// plus the study's tag categories. One row per subject; tag-category values
// use stable export_codes.

const IDENTITY_COLS = ["subject_id"];
const STATUS_COLS = ["DISPOSITION"];

export function ExportShapePreview() {
  const study = useActiveStudy();
  const [shape, setShape] = useState<"wide" | "long">("wide");

  const rows = study.exportPreview;

  // Derive column groups from the actual fixture rows.
  const { allCols, tagCols, COLUMN_GROUPS } = useMemo(() => {
    const colSet = new Set<string>();
    for (const r of rows) for (const k of Object.keys(r)) colSet.add(k);
    const all = Array.from(colSet);
    const tags = all.filter((c) => !IDENTITY_COLS.includes(c) && !STATUS_COLS.includes(c));
    const groups: { label: string; cols: string[] }[] = [
      { label: "Identity",       cols: IDENTITY_COLS.filter((c) => colSet.has(c)) },
      { label: "Tag categories", cols: tags },
      { label: "Status",         cols: STATUS_COLS.filter((c) => colSet.has(c)) },
    ];
    return { allCols: all, tagCols: tags, COLUMN_GROUPS: groups.filter((g) => g.cols.length > 0) };
  }, [rows]);

  return (
    <div className="card">
      <div className="card-header">
        <h2>Combined dataset — preview for {study.identity.code}</h2>
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
      <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
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
                {COLUMN_GROUPS.flatMap((g) => g.cols).map((c) => (
                  <th key={c} style={{ fontSize: 10 }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  {COLUMN_GROUPS.flatMap((g) => g.cols).map((c) => {
                    const v = (r as Record<string, string>)[c] ?? "";
                    if (!v) return <td key={c} className="muted" style={{ fontFamily: "JetBrains Mono, monospace" }}>—</td>;
                    const isCode = tagCols.includes(c) || c === "subject_id";
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
              {rows.flatMap((r) =>
                tagCols
                  .filter((c) => ((r as Record<string, string>)[c] ?? "") !== "")
                  .map((c) => (
                    <tr key={`${r.subject_id}-${c}`}>
                      <td style={{ fontFamily: "JetBrains Mono, monospace" }}>{r.subject_id}</td>
                      <td>{c}</td>
                      <td><span className="code">{(r as Record<string, string>)[c]}</span></td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        )}
      </div>
      <div className="card-body" style={{ paddingTop: 0 }}>
        <div className="muted" style={{ fontSize: 11.5, marginTop: 8 }}>
          Columns derived from <strong>{study.identity.code}</strong>'s Tag Categories and disposition catalog.
          Different studies produce different shapes — Tag Category names are the column headers, stable <span className="code">export_code</span>s are the cell values.
        </div>
      </div>
    </div>
  );
}
