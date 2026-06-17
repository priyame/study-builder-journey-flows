"use client";

import { ELEMENT_TYPE_LABEL } from "@/lib/journey-model";
import type { JourneyElement } from "@/lib/journey-model";
import { Card, Pill, cx } from "@/components/ui";

// §4.5 Visits view — SoA-style matrix.

const ACTIVITY_ROWS = [
  { label: "Consent / Eligibility",  matches: (act: string) => /icf|consent|elig|i\/e/i.test(act) },
  { label: "Vitals",                 matches: (act: string) => /vital|bp|hr|temp/i.test(act) },
  { label: "Labs / blood draw",      matches: (act: string) => /lab|panel|pk|cbc|cmp|chem|blood|serolog|biomarker/i.test(act) },
  { label: "Imaging",                matches: (act: string) => /imaging|ct|pet|mri|ultrasound|x-ray|ecg/i.test(act) },
  { label: "Procedure / Treatment",  matches: (act: string) => /apdt|embol|sham|procedure|dose|adminis|fusion|implant|biopsy|conditioning|infus|transpla/i.test(act) },
  { label: "ePRO / Symptom diary",   matches: (act: string) => /epro|survey|prom|vas|nrs|odi|qol|patient global|fact|diary|symptom/i.test(act) },
  { label: "Safety / AE assessment", matches: (act: string) => /ae|safety|adverse|tolera|reactogen|toxic|complic/i.test(act) },
  { label: "Disease assessment",     matches: (act: string) => /response|restag|pathology|cytogen|molecul|disease|status/i.test(act) },
  { label: "Conmed / History",       matches: (act: string) => /conmed|concomit|history|comorbid|medication/i.test(act) },
];

function elementForColumn(elements: JourneyElement[], colDay: number, tolerance = 1) {
  return elements.filter(
    (el) => el.day_offset !== undefined && Math.abs((el.day_offset ?? 9999) - colDay) <= tolerance,
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
      <div className="space-y-5">
        <Card>
          <div className="mb-3 flex items-baseline gap-2">
            <h2 className="text-sm font-semibold text-navy">Schedule of Activities</h2>
            <span className="text-xs text-slate-400">No fixed schedule — registry / event-driven study</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-500">
            This study runs on a cadence and event-driven model — there&apos;s no fixed grid of
            named visits to project. Use the <strong className="font-semibold text-navy">Flow</strong>{" "}
            view to see the journey graph, or <strong className="font-semibold text-navy">Sequence</strong>{" "}
            for record-by-record detail.
          </p>
        </Card>
        <ElementListTable elements={elements} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="p-0">
        <div className="flex items-baseline gap-2 border-b border-slate-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-navy">Schedule of Activities</h2>
          <span className="text-xs text-slate-400">
            Time-grid projection · rows = activity rollups, columns = day offsets · milestones marked inline
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11.5px]" style={{ minWidth: 960 }}>
            <thead className="bg-canvas">
              <tr className="border-b border-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-400">
                <th
                  className="sticky left-0 z-[1] bg-canvas px-3 py-2.5 font-medium"
                  style={{ width: 200 }}
                >
                  Activity
                </th>
                {visitColumns!.map((c) => {
                  const els = elementForColumn(elements, c.day);
                  const isMilestone = els.some((e) => e.element_type === "milestone");
                  return (
                    <th
                      key={c.id}
                      className={cx(
                        "min-w-[70px] px-2 py-2.5 text-center font-medium",
                        isMilestone && "border-t-2 border-primary bg-primary/[0.06] text-primary",
                      )}
                    >
                      <div>{c.label}</div>
                      <div className="text-[9px] font-normal opacity-70">
                        D{c.day >= 0 ? `+${c.day}` : c.day}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {ACTIVITY_ROWS.map((row) => (
                <tr key={row.label} className="border-t border-slate-50">
                  <td className="sticky left-0 z-[1] bg-white px-3 py-2 font-medium text-navy">
                    {row.label}
                  </td>
                  {visitColumns!.map((c) => {
                    const els = elementForColumn(elements, c.day);
                    const match = els.some((el) => el.activities.some(row.matches));
                    return (
                      <td key={c.id} className="px-2 py-2 text-center">
                        {match ? (
                          <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" />
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ElementListTable elements={elements} />
    </div>
  );
}

function ElementListTable({ elements }: { elements: JourneyElement[] }) {
  return (
    <Card className="p-0">
      <div className="flex items-baseline gap-2 border-b border-slate-100 px-5 py-3">
        <h2 className="text-sm font-semibold text-navy">Journey Elements behind the grid</h2>
        <span className="text-xs text-slate-400">Same data — surfaced as records instead of as a matrix</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-canvas">
            <tr className="border-b border-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-400">
              <th className="px-3 py-2.5 font-medium">Builder label (§3.5)</th>
              <th className="px-3 py-2.5 font-medium">element_type</th>
              <th className="px-3 py-2.5 font-medium">Day offset</th>
              <th className="px-3 py-2.5 font-medium">Applies to</th>
              <th className="px-3 py-2.5 font-medium">Activities</th>
            </tr>
          </thead>
          <tbody>
            {elements
              .filter((e) => e.element_type !== "end_state")
              .map((el) => (
                <tr key={el.id} className="border-t border-slate-50 align-top">
                  <td className="px-3 py-2.5">
                    <span
                      className={cx(
                        "font-medium",
                        el.element_type === "milestone" ? "font-bold text-primary" : "text-navy",
                      )}
                    >
                      {el.builder_label}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <Pill tone={el.element_type === "milestone" ? "primary" : "neutral"} mono>
                      {ELEMENT_TYPE_LABEL[el.element_type]}
                    </Pill>
                  </td>
                  <td className="px-3 py-2.5">
                    {el.day_offset !== undefined ? (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
                        D{el.day_offset >= 0 ? `+${el.day_offset}` : el.day_offset}
                        {el.window_minus || el.window_plus
                          ? ` (-${el.window_minus ?? 0}/+${el.window_plus ?? 0})`
                          : ""}
                      </span>
                    ) : el.cadence ? (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
                        every {el.cadence.interval_days}d
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
                      {el.applies_to_expr}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[11.5px]">
                    {el.activities.length === 0 ? (
                      <span className="text-slate-300">—</span>
                    ) : (
                      el.activities.join(" · ")
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
