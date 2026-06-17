"use client";

import { TRIGGER_FAMILY_LABEL, ELEMENT_TYPE_LABEL } from "@/lib/journey-model";
import type { JourneyElement, JourneyEdge, TriggerFamily } from "@/lib/journey-model";
import { Card, Pill, cx } from "@/components/ui";

// §4.5 Flow view — visual graph projection over Journey Elements + Edges.

const FAMILY_CHIP: Record<TriggerFamily, string> = {
  auto:        "border border-primary/40 bg-primary/10 text-primary",
  manual:      "border border-dashed border-warning/40 bg-warning/10 text-warning",
  day_offset:  "border border-slate-200 bg-slate-100 text-slate-600",
  conditional: "border border-pink-700/40 bg-pink-700/10 text-pink-700",
};

function NodeCard({ el }: { el: JourneyElement }) {
  const isMilestone = el.element_type === "milestone";
  const isEndState = el.element_type === "end_state";
  return (
    <div
      className={cx(
        "relative min-w-[170px] shadow-sm",
        isMilestone
          ? "rounded-full border-2 border-primary bg-primary/[0.06] px-4 py-2.5 shadow-lg"
          : "rounded-lg border border-slate-200 px-3 py-2.5",
        !isMilestone && (isEndState ? "bg-canvas" : "bg-white"),
      )}
    >
      <div
        className={cx(
          "mb-1 font-mono text-[9px] font-semibold uppercase tracking-[0.08em]",
          isMilestone ? "text-primary" : "text-slate-400",
        )}
      >
        {ELEMENT_TYPE_LABEL[el.element_type]}
      </div>
      <div
        className={cx(
          "leading-tight",
          isMilestone ? "text-[12.5px] font-bold text-primary" : "text-xs font-semibold text-navy",
        )}
      >
        {el.builder_label}
      </div>
      {el.day_offset !== undefined ? (
        <div className="mt-1 font-mono text-[10.5px] text-slate-500">
          D{el.day_offset >= 0 ? `+${el.day_offset}` : el.day_offset}
          {el.window_minus || el.window_plus ? ` (-${el.window_minus ?? 0}/+${el.window_plus ?? 0})` : ""}
        </div>
      ) : null}
      {el.cadence ? <div className="mt-1 text-[10.5px] text-slate-500">every {el.cadence.interval_days}d</div> : null}
      {el.applies_to_expr && el.applies_to_expr !== "ALL=ALL" ? (
        <div className="mt-1">
          <span className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[9.5px] text-slate-600">
            {el.applies_to_expr}
          </span>
        </div>
      ) : null}
      {el.activities.length > 0 ? (
        <div className="mt-1.5 text-[10px] text-slate-500">
          {el.activities.length} {el.activities.length === 1 ? "activity" : "activities"}
        </div>
      ) : null}
    </div>
  );
}

function EdgeChip({ edge }: { edge: JourneyEdge }) {
  return (
    <div className={cx("max-w-[220px] rounded-full px-2.5 py-1 text-center text-[10px] leading-tight", FAMILY_CHIP[edge.trigger_family])}>
      <span className="mr-1 font-semibold">{TRIGGER_FAMILY_LABEL[edge.trigger_family]}:</span>
      {edge.trigger_label}
      {edge.is_branch ? <span className="ml-1 opacity-70">· branch</span> : null}
    </div>
  );
}

function bucketize(elements: JourneyElement[]) {
  const main: JourneyElement[] = [];
  const lanes = new Map<string, JourneyElement[]>();
  const overlay: JourneyElement[] = [];
  const ends: JourneyElement[] = [];

  for (const el of elements) {
    if (el.element_type === "end_state") {
      ends.push(el);
      continue;
    }
    if (
      el.element_type === "cadence_followup" ||
      el.element_type === "event_triggered" ||
      el.element_type === "safety_followup"
    ) {
      overlay.push(el);
      continue;
    }
    const expr = el.applies_to_expr ?? "ALL=ALL";
    if (expr === "ALL=ALL") {
      main.push(el);
    } else {
      const list = lanes.get(expr) ?? [];
      list.push(el);
      lanes.set(expr, list);
    }
  }

  const byOffset = (a: JourneyElement, b: JourneyElement) =>
    (a.day_offset ?? -Infinity) - (b.day_offset ?? -Infinity);
  main.sort(byOffset);
  for (const list of lanes.values()) list.sort(byOffset);

  return { main, lanes: Array.from(lanes.entries()), overlay, ends };
}

const SectionEyebrow = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
    {children}
  </div>
);

export function FlowView({ elements, edges }: { elements: JourneyElement[]; edges: JourneyEdge[] }) {
  const byId = Object.fromEntries(elements.map((e) => [e.id, e]));
  const outgoing = (id: string) => edges.filter((e) => e.from === id);
  const { main, lanes, overlay, ends } = bucketize(elements);

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-3 flex items-baseline gap-2">
          <h2 className="text-sm font-semibold text-navy">Workflow graph</h2>
          <span className="text-xs text-slate-400">
            Milestones as enlarged nodes · ARM-conditioned paths render as parallel lanes
          </span>
        </div>
        <div className="overflow-x-auto">
          <div style={{ minWidth: 1100 }}>
            <SectionEyebrow>Main flow — all participants</SectionEyebrow>
            <div className="mb-6 flex flex-wrap items-center gap-1.5">
              {main.map((el, i) => {
                const outs = outgoing(el.id).filter((e) => byId[e.to] && !ends.find((x) => x.id === e.to));
                return (
                  <div key={el.id} className="flex items-center gap-1">
                    <NodeCard el={el} />
                    {i < main.length - 1 && outs.length > 0 ? (
                      <div className="flex min-w-[120px] flex-col items-center gap-1">
                        {outs.slice(0, 2).map((e, j) => <EdgeChip key={j} edge={e} />)}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {lanes.length > 0 ? (
              <>
                <SectionEyebrow>Conditional lanes ({lanes.length})</SectionEyebrow>
                <div
                  className="mb-6 grid gap-4"
                  style={{
                    gridTemplateColumns:
                      lanes.length === 1 ? "1fr" : lanes.length === 2 ? "1fr 1fr" : "repeat(auto-fit, minmax(380px, 1fr))",
                  }}
                >
                  {lanes.map(([expr, list], idx) => (
                    <div
                      key={expr}
                      className={cx(
                        "rounded-lg border-l-[3px] p-3",
                        idx % 2 === 0
                          ? "border-l-primary bg-gradient-to-r from-primary/[0.06] to-transparent"
                          : "border-l-slate-400 bg-gradient-to-r from-slate-100 to-transparent",
                      )}
                    >
                      <div
                        className={cx(
                          "mb-2 text-[11px] font-bold",
                          idx % 2 === 0 ? "text-primary" : "text-slate-600",
                        )}
                      >
                        <span className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] text-slate-600">{expr}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1">
                        {list.map((el, i) => (
                          <div key={el.id} className="flex items-center gap-1">
                            <NodeCard el={el} />
                            {i < list.length - 1 ? (
                              <div className="flex min-w-[90px] flex-col items-center gap-1">
                                {outgoing(el.id).slice(0, 1).map((e, j) => <EdgeChip key={j} edge={e} />)}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            {overlay.length > 0 ? (
              <div className="border-t border-dashed border-slate-300 pt-4">
                <SectionEyebrow>Cross-cutting overlays — apply across the journey based on tag expression</SectionEyebrow>
                <div className="flex flex-wrap gap-2.5">
                  {overlay.map((el) => <NodeCard key={el.id} el={el} />)}
                </div>
              </div>
            ) : null}

            {ends.length > 0 ? (
              <div className="mt-5 border-t border-dashed border-slate-300 pt-4">
                <SectionEyebrow>Terminal end states</SectionEyebrow>
                <div className="flex flex-wrap gap-2.5">
                  {ends.map((el) => <NodeCard key={el.id} el={el} />)}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Card>

      <Card className="p-0">
        <div className="flex items-baseline gap-2 border-b border-slate-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-navy">Trigger family legend</h2>
          <span className="text-xs text-slate-400">
            §4.5.2 — 4 UI families map to the 7 canonical trigger_type values
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-canvas">
              <tr className="border-b border-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-400">
                <th className="px-3 py-2.5 font-medium">Family</th>
                <th className="px-3 py-2.5 font-medium">Visual</th>
                <th className="px-3 py-2.5 font-medium">Canonical trigger_types</th>
                <th className="px-3 py-2.5 font-medium">Authoring affordance</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-50">
                <td className="px-3 py-2.5"><Pill tone="primary">Auto</Pill></td>
                <td className="px-3 py-2.5">
                  <div className={cx("inline-block rounded-full px-2.5 py-0.5 text-[10px]", FAMILY_CHIP.auto)}>Eligibility met</div>
                </td>
                <td className="px-3 py-2.5">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
                    form_answer · state_transition · event_trigger · irt_message
                  </span>
                </td>
                <td className="px-3 py-2.5 text-slate-600">&ldquo;When X happens, apply tag Y&rdquo; composer</td>
              </tr>
              <tr className="border-t border-slate-50">
                <td className="px-3 py-2.5"><Pill tone="warning">Manual</Pill></td>
                <td className="px-3 py-2.5">
                  <div className={cx("inline-block rounded-full px-2.5 py-0.5 text-[10px]", FAMILY_CHIP.manual)}>Withdraw consent</div>
                </td>
                <td className="px-3 py-2.5">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">manual</span>
                </td>
                <td className="px-3 py-2.5 text-slate-600">User-action composer with audit reason</td>
              </tr>
              <tr className="border-t border-slate-50">
                <td className="px-3 py-2.5"><Pill tone="neutral">Day offset</Pill></td>
                <td className="px-3 py-2.5">
                  <div className={cx("inline-block rounded-full px-2.5 py-0.5 text-[10px]", FAMILY_CHIP.day_offset)}>+28 days from enrollment</div>
                </td>
                <td className="px-3 py-2.5">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">time_offset</span>
                </td>
                <td className="px-3 py-2.5 text-slate-600">Anchor picker + offset days; optional window</td>
              </tr>
              <tr className="border-t border-slate-50">
                <td className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-700/10 px-2.5 py-0.5 text-xs font-medium text-pink-700">
                    Conditional
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <div className={cx("inline-block rounded-full px-2.5 py-0.5 text-[10px]", FAMILY_CHIP.conditional)}>ARM = TRTA</div>
                </td>
                <td className="px-3 py-2.5">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">conditional</span>
                </td>
                <td className="px-3 py-2.5 text-slate-600">Predicate composer over tag set + data state · branches allowed</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
