"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ELEMENT_TYPE_LABEL, TRIGGER_FAMILY_LABEL } from "@/lib/journey-model";
import type { JourneyElement, JourneyEdge, TriggerFamily } from "@/lib/journey-model";
import { Card, Pill, cx } from "@/components/ui";

const FAMILY_TONE: Record<TriggerFamily, "primary" | "warning" | "neutral" | "danger"> = {
  auto: "primary",
  manual: "warning",
  day_offset: "neutral",
  conditional: "danger",
};

export function SequenceView({
  elements,
  edges,
}: {
  elements: JourneyElement[];
  edges: JourneyEdge[];
}) {
  const visible = elements.filter((e) => e.element_type !== "end_state");
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
  }, [visible.length, visible[0]?.id]);

  if (visible.length === 0) {
    return (
      <Card>
        <p className="py-6 text-center text-sm text-slate-400">No journey elements to display.</p>
      </Card>
    );
  }

  const el = visible[idx];
  const prev = idx > 0 ? visible[idx - 1] : null;
  const next = idx < visible.length - 1 ? visible[idx + 1] : null;
  const isMilestone = el.element_type === "milestone";

  const incoming = edges.filter((e) => e.to === el.id);
  const outgoing = edges.filter((e) => e.from === el.id);

  return (
    <div className="space-y-5">
      <Card className="border-l-[3px] border-l-warning bg-warning/5">
        <div className="text-[11px] font-bold uppercase tracking-wide text-warning">Placeholder · R1.1</div>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          Sequence view ships in R1.1 with full drag-and-drop reordering, inline AI-assisted edits,
          and accessibility-first navigation. The read-only stepper below is a visual stand-in over
          the same Journey Elements data.
        </p>
      </Card>

      <Card className="p-0">
        <div className="overflow-x-auto px-5 py-3">
          <div className="flex items-center gap-1.5" style={{ minWidth: 1000 }}>
            {visible.map((e, i) => {
              const active = i === idx;
              const passed = i < idx;
              const mile = e.element_type === "milestone";
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setIdx(i)}
                  className="flex items-center gap-1.5 border-0 bg-transparent p-0 outline-none"
                >
                  <div
                    className={cx(
                      "shrink-0 transition-all",
                      mile ? "h-5 w-5 rounded-full" : "h-4 w-4 rounded",
                      active
                        ? "bg-primary"
                        : passed
                          ? "bg-primary/[0.10]"
                          : "bg-canvas",
                      (active || mile) ? "ring-2 ring-primary" : "ring-1 ring-slate-200",
                    )}
                  />
                  <span
                    className={cx(
                      "whitespace-nowrap pr-1 text-[10.5px]",
                      active ? "font-bold text-navy" : "font-medium text-slate-400",
                    )}
                  >
                    {e.builder_label}
                  </span>
                  {i < visible.length - 1 ? (
                    <div className={cx("h-px w-4", passed ? "bg-primary" : "bg-slate-200")} />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      <Card className={cx("p-0", isMilestone && "border-t-[3px] border-t-primary")}>
        <div className="flex flex-wrap items-start gap-2 border-b border-slate-100 px-5 py-3">
          <div>
            <div className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Step {idx + 1} of {visible.length} · {ELEMENT_TYPE_LABEL[el.element_type]}
              {isMilestone ? <span className="ml-2 text-primary">· Milestone</span> : null}
            </div>
            <h2 className={cx("text-sm font-semibold", isMilestone ? "text-primary" : "text-navy")}>
              {el.builder_label}
            </h2>
          </div>
          <div className="ml-auto flex gap-1.5">
            <button
              type="button"
              disabled={!prev}
              onClick={() => prev && setIdx(idx - 1)}
              className={cx(
                "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-navy outline-none transition-colors hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/40",
                !prev && "opacity-40",
              )}
            >
              <ChevronLeft size={14} /> {prev?.builder_label ?? "—"}
            </button>
            <button
              type="button"
              disabled={!next}
              onClick={() => next && setIdx(idx + 1)}
              className={cx(
                "inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-white outline-none transition-colors hover:bg-bright focus-visible:ring-2 focus-visible:ring-primary/40",
                !next && "opacity-40",
              )}
            >
              {next?.builder_label ?? "End"} <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="p-5">
          <dl className="grid gap-y-1.5 text-sm" style={{ gridTemplateColumns: "200px 1fr" }}>
            <dt className="text-slate-400">element_type</dt>
            <dd className="m-0"><Pill tone={isMilestone ? "primary" : "neutral"} mono>{ELEMENT_TYPE_LABEL[el.element_type]}</Pill></dd>

            <dt className="text-slate-400">Applies to (tag expression)</dt>
            <dd className="m-0">
              <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
                {el.applies_to_expr ?? "ALL=ALL"}
              </span>
            </dd>

            {el.day_offset !== undefined ? (
              <>
                <dt className="text-slate-400">Day offset</dt>
                <dd className="m-0">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
                    D{el.day_offset >= 0 ? `+${el.day_offset}` : el.day_offset}
                  </span>
                  {el.window_minus || el.window_plus ? (
                    <span className="ml-2 text-xs text-slate-400">
                      window -{el.window_minus ?? 0} / +{el.window_plus ?? 0} days
                    </span>
                  ) : null}
                </dd>
                <dt className="text-slate-400">Anchor</dt>
                <dd className="m-0">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
                    {el.anchor ?? "study_start"}
                  </span>
                </dd>
              </>
            ) : null}

            {el.cadence ? (
              <>
                <dt className="text-slate-400">Cadence</dt>
                <dd className="m-0">
                  every{" "}
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
                    {el.cadence.interval_days}
                  </span>{" "}
                  days
                  <div className="mt-1 text-[11px] text-slate-400">Stop when: {el.cadence.stop_condition}</div>
                </dd>
              </>
            ) : null}

            {el.notes ? (
              <>
                <dt className="text-slate-400">Notes</dt>
                <dd className="m-0 text-slate-400">{el.notes}</dd>
              </>
            ) : null}
          </dl>

          <div className="my-4 h-px bg-slate-100" />

          <div className="mb-2 text-xs font-semibold text-navy">
            Block steps
            {el.activities.length === 0 ? (
              <span className="ml-2 font-normal text-slate-400">(none — milestone has no activities)</span>
            ) : null}
          </div>
          {el.activities.length > 0 ? (
            <ol className="space-y-1 pl-5 text-[12.5px] leading-loose" style={{ listStyleType: "decimal" }}>
              {el.activities.map((a, i) => (
                <li key={i}>
                  {a}
                  <span className="ml-2 text-[10.5px] text-slate-400">step {i + 1}</span>
                </li>
              ))}
            </ol>
          ) : null}

          <div className="my-4 h-px bg-slate-100" />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <div className="mb-2 text-xs font-semibold text-navy">← Incoming transitions</div>
              {incoming.length === 0 ? (
                <p className="text-xs text-slate-400">This is an entry point.</p>
              ) : (
                <div className="space-y-1.5">
                  {incoming.map((e, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <Pill tone={FAMILY_TONE[e.trigger_family]}>{TRIGGER_FAMILY_LABEL[e.trigger_family]}</Pill>
                      <span>{e.trigger_label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div className="mb-2 text-xs font-semibold text-navy">Outgoing transitions →</div>
              {outgoing.length === 0 ? (
                <p className="text-xs text-slate-400">Terminal — no outgoing.</p>
              ) : (
                <div className="space-y-1.5">
                  {outgoing.map((e, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <Pill tone={FAMILY_TONE[e.trigger_family]}>{TRIGGER_FAMILY_LABEL[e.trigger_family]}</Pill>
                      <span>{e.trigger_label}</span>
                      {e.is_branch ? <Pill tone="neutral" mono>branch</Pill> : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <p className="text-center text-[11.5px] text-slate-400">
        Sequence view ships R1.0 as read-equivalent · full drag-and-drop reordering lands in R1.1
      </p>
    </div>
  );
}
