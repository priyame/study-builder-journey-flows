"use client";

import { useMemo, useState } from "react";
import { useActiveStudy } from "@/lib/active-study";
import { Card, cx } from "@/components/ui";

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

  const { tagCols, COLUMN_GROUPS } = useMemo(() => {
    const colSet = new Set<string>();
    for (const r of rows) for (const k of Object.keys(r)) colSet.add(k);
    const all = Array.from(colSet);
    const tags = all.filter((c) => !IDENTITY_COLS.includes(c) && !STATUS_COLS.includes(c));
    const groups: { label: string; cols: string[] }[] = [
      { label: "Identity",       cols: IDENTITY_COLS.filter((c) => colSet.has(c)) },
      { label: "Tag categories", cols: tags },
      { label: "Status",         cols: STATUS_COLS.filter((c) => colSet.has(c)) },
    ];
    return { tagCols: tags, COLUMN_GROUPS: groups.filter((g) => g.cols.length > 0) };
  }, [rows]);

  const SHAPES: Array<{ id: "wide" | "long"; label: string }> = [
    { id: "wide", label: "Wide" },
    { id: "long", label: "Long" },
  ];

  return (
    <Card className="p-0">
      <div className="flex flex-wrap items-baseline gap-2 border-b border-slate-100 px-5 py-3">
        <h2 className="text-sm font-semibold text-navy">
          Combined dataset — preview for {study.identity.code}
        </h2>
        <span className="text-xs text-slate-400">
          NFR-095 · one row per subject · tag categories as columns (wide) or rows (long)
        </span>
        <div className="ml-auto inline-flex overflow-hidden rounded-lg border border-slate-200 bg-white">
          {SHAPES.map(({ id, label }) => {
            const active = shape === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setShape(id)}
                aria-pressed={active}
                className={cx(
                  "border-r border-slate-200 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide outline-none transition-colors last:border-r-0 focus-visible:ring-2 focus-visible:ring-primary/40",
                  active ? "bg-primary text-white" : "text-slate-500 hover:bg-slate-50",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto">
        {shape === "wide" ? (
          <table className="w-full text-[11.5px]">
            <thead className="bg-canvas">
              <tr className="border-b border-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-400">
                {COLUMN_GROUPS.map((g, i) => (
                  <th
                    key={g.label}
                    colSpan={g.cols.length}
                    className={cx(
                      "px-3 py-2 text-center font-medium",
                      i < COLUMN_GROUPS.length - 1 && "border-r-2 border-slate-100",
                    )}
                  >
                    {g.label}
                  </th>
                ))}
              </tr>
              <tr className="border-b border-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-400">
                {COLUMN_GROUPS.flatMap((g) => g.cols).map((c) => (
                  <th key={c} className="px-3 py-2 font-medium">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-slate-50">
                  {COLUMN_GROUPS.flatMap((g) => g.cols).map((c) => {
                    const v = (r as Record<string, string>)[c] ?? "";
                    if (!v) {
                      return (
                        <td key={c} className="px-3 py-2 font-mono text-slate-300">—</td>
                      );
                    }
                    const isCode = tagCols.includes(c) || c === "subject_id";
                    return (
                      <td key={c} className={cx("px-3 py-2", isCode && "font-mono")}>
                        {v}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-[11.5px]">
            <thead className="bg-canvas">
              <tr className="border-b border-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-400">
                <th className="px-3 py-2 font-medium">subject_id</th>
                <th className="px-3 py-2 font-medium">tag_category</th>
                <th className="px-3 py-2 font-medium">value (export_code)</th>
              </tr>
            </thead>
            <tbody>
              {rows.flatMap((r) =>
                tagCols
                  .filter((c) => ((r as Record<string, string>)[c] ?? "") !== "")
                  .map((c) => (
                    <tr key={`${r.subject_id}-${c}`} className="border-t border-slate-50">
                      <td className="px-3 py-2 font-mono">{r.subject_id}</td>
                      <td className="px-3 py-2">{c}</td>
                      <td className="px-3 py-2">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
                          {(r as Record<string, string>)[c]}
                        </span>
                      </td>
                    </tr>
                  )),
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="border-t border-slate-100 px-5 py-3 text-[11.5px] text-slate-400">
        Columns derived from <strong className="text-slate-500">{study.identity.code}</strong>&apos;s
        Tag Categories and disposition catalog. Different studies produce different shapes — Tag
        Category names are the column headers, stable{" "}
        <span className="rounded bg-slate-100 px-1 font-mono text-[10px] text-slate-600">export_code</span>s
        are the cell values.
      </div>
    </Card>
  );
}
