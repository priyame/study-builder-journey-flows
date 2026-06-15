"use client";

import { TRIGGER_FAMILY_LABEL, ELEMENT_TYPE_LABEL } from "@/lib/journey-model";
import type { JourneyElement, JourneyEdge, TriggerFamily } from "@/lib/journey-model";

// §4.5 Flow view — visual graph projection over Journey Elements + Edges.
// Adaptive layout: groups elements by applies_to_expr so branched arms become
// parallel lanes, ALL=ALL paths render linearly, cadence/event overlays sit
// in a cross-cutting strip at the bottom. Works for every study fixture.

const FAMILY_STYLE: Record<TriggerFamily, { bg: string; border: string; fg: string; dashed?: boolean }> = {
  auto:        { bg: "var(--accent-soft)", border: "var(--accent)",  fg: "var(--accent)" },
  manual:      { bg: "var(--amber-soft)",  border: "var(--amber)",   fg: "var(--amber)",  dashed: true },
  day_offset:  { bg: "var(--bg-muted)",    border: "var(--slate)",   fg: "var(--slate)" },
  conditional: { bg: "#FCE7F3",            border: "#BE185D",        fg: "#BE185D" },
};

function NodeCard({ el }: { el: JourneyElement }) {
  const isMilestone = el.element_type === "milestone";
  const isEndState  = el.element_type === "end_state";
  return (
    <div
      style={{
        border: `${isMilestone ? 2 : 1}px solid ${isMilestone ? "var(--accent)" : "var(--border-strong)"}`,
        borderRadius: isMilestone ? "999px" : "var(--r-md)",
        background: isMilestone ? "var(--accent-soft)" : isEndState ? "var(--bg-muted)" : "var(--bg-surface)",
        padding: isMilestone ? "10px 16px" : "10px 12px",
        minWidth: 170,
        boxShadow: isMilestone ? "var(--shadow-pop)" : "var(--shadow-card)",
        position: "relative",
      }}
    >
      <div style={{
        fontSize: 9,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: isMilestone ? "var(--accent)" : "var(--fg-muted)",
        fontWeight: 600,
        marginBottom: 4,
      }}>
        {ELEMENT_TYPE_LABEL[el.element_type]}
      </div>
      <div style={{
        fontWeight: isMilestone ? 700 : 600,
        fontSize: isMilestone ? 12.5 : 12,
        color: isMilestone ? "var(--accent)" : "var(--fg-primary)",
        lineHeight: 1.3,
      }}>
        {el.builder_label}
      </div>
      {el.day_offset !== undefined ? (
        <div style={{ fontSize: 10.5, color: "var(--fg-muted)", marginTop: 4, fontFamily: "JetBrains Mono, monospace" }}>
          D{el.day_offset >= 0 ? `+${el.day_offset}` : el.day_offset}
          {el.window_minus || el.window_plus ? ` (-${el.window_minus ?? 0}/+${el.window_plus ?? 0})` : ""}
        </div>
      ) : null}
      {el.cadence ? (
        <div style={{ fontSize: 10.5, color: "var(--fg-muted)", marginTop: 4 }}>every {el.cadence.interval_days}d</div>
      ) : null}
      {el.applies_to_expr && el.applies_to_expr !== "ALL=ALL" ? (
        <div style={{ marginTop: 4 }}>
          <span className="code" style={{ fontSize: 9.5 }}>{el.applies_to_expr}</span>
        </div>
      ) : null}
      {el.activities.length > 0 ? (
        <div style={{ fontSize: 10, color: "var(--fg-muted)", marginTop: 6 }}>
          {el.activities.length} {el.activities.length === 1 ? "activity" : "activities"}
        </div>
      ) : null}
    </div>
  );
}

function EdgeChip({ edge }: { edge: JourneyEdge }) {
  const style = FAMILY_STYLE[edge.trigger_family];
  return (
    <div
      style={{
        fontSize: 10,
        padding: "3px 8px",
        borderRadius: 999,
        background: style.bg,
        color: style.fg,
        border: `1px ${style.dashed ? "dashed" : "solid"} ${style.border}`,
        maxWidth: 220,
        textAlign: "center",
        lineHeight: 1.3,
        whiteSpace: "normal",
      }}
    >
      <span style={{ fontWeight: 600, marginRight: 4 }}>{TRIGGER_FAMILY_LABEL[edge.trigger_family]}:</span>
      {edge.trigger_label}
      {edge.is_branch ? <span style={{ marginLeft: 4, opacity: 0.7 }}>· branch</span> : null}
    </div>
  );
}

// Group elements by their applies_to_expr. ALL=ALL goes into "main"; everything
// else gets its own lane keyed by the expression. End states + cross-cutting
// (cadence_followup, event_triggered, safety_followup) get separate buckets.
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
      main.push(expr === "ALL=ALL" ? el : el);
    } else {
      const list = lanes.get(expr) ?? [];
      list.push(el);
      lanes.set(expr, list);
    }
  }

  // Stable order within each bucket: by day_offset then by element id
  const byOffset = (a: JourneyElement, b: JourneyElement) =>
    (a.day_offset ?? -Infinity) - (b.day_offset ?? -Infinity);
  main.sort(byOffset);
  for (const list of lanes.values()) list.sort(byOffset);

  return { main, lanes: Array.from(lanes.entries()), overlay, ends };
}

export function FlowView({ elements, edges }: { elements: JourneyElement[]; edges: JourneyEdge[] }) {
  const byId = Object.fromEntries(elements.map((e) => [e.id, e]));
  const outgoing = (id: string) => edges.filter((e) => e.from === id);
  const { main, lanes, overlay, ends } = bucketize(elements);

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="card">
        <div className="card-header">
          <h2>Workflow graph</h2>
          <span className="sub">
            Milestones as enlarged nodes · ARM-conditioned paths render as parallel lanes · cross-cutting elements ride along the bottom
          </span>
        </div>
        <div className="card-body" style={{ overflowX: "auto" }}>
          {/* Main (ALL=ALL) flow — linear, left-to-right by day_offset */}
          <div style={{ minWidth: 1100 }}>
            <div className="muted" style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Main flow — all participants
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
              {main.map((el, i) => {
                const outs = outgoing(el.id).filter((e) => byId[e.to] && !ends.find((x) => x.id === e.to));
                return (
                  <div key={el.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <NodeCard el={el} />
                    {i < main.length - 1 && outs.length > 0 ? (
                      <div className="stack" style={{ gap: 4, minWidth: 120, alignItems: "center" }}>
                        {outs.slice(0, 2).map((e, j) => <EdgeChip key={j} edge={e} />)}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Branched lanes — one per applies_to_expr */}
          {lanes.length > 0 ? (
            <>
              <div className="muted" style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Conditional lanes ({lanes.length})
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: lanes.length === 1 ? "1fr" : lanes.length === 2 ? "1fr 1fr" : "repeat(auto-fit, minmax(380px, 1fr))",
                gap: 16,
                marginBottom: 24,
              }}>
                {lanes.map(([expr, list], idx) => (
                  <div key={expr} style={{
                    padding: 12,
                    borderLeft: `3px solid ${idx % 2 === 0 ? "var(--accent)" : "var(--slate)"}`,
                    background: idx % 2 === 0
                      ? "linear-gradient(90deg, var(--accent-soft) 0%, transparent 100%)"
                      : "linear-gradient(90deg, var(--bg-muted) 0%, transparent 100%)",
                    borderRadius: "var(--r-md)",
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: idx % 2 === 0 ? "var(--accent)" : "var(--slate)", marginBottom: 8 }}>
                      <span className="code">{expr}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                      {list.map((el, i) => (
                        <div key={el.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <NodeCard el={el} />
                          {i < list.length - 1 ? (
                            <div className="stack" style={{ gap: 4, minWidth: 90, alignItems: "center" }}>
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

          {/* Cross-cutting overlay */}
          {overlay.length > 0 ? (
            <>
              <div style={{ paddingTop: 16, borderTop: "1px dashed var(--border-strong)" }}>
                <div className="muted" style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Cross-cutting overlays — apply across the journey based on tag expression
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {overlay.map((el) => (
                    <NodeCard key={el.id} el={el} />
                  ))}
                </div>
              </div>
            </>
          ) : null}

          {/* End states */}
          {ends.length > 0 ? (
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px dashed var(--border-strong)" }}>
              <div className="muted" style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Terminal end states
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {ends.map((el) => (
                  <NodeCard key={el.id} el={el} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Trigger family legend */}
      <div className="card">
        <div className="card-header">
          <h2>Trigger family legend</h2>
          <span className="sub">§4.5.2 — 4 UI families map to the 7 canonical `trigger_type` values</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 140 }}>Family</th>
                <th>Visual</th>
                <th>Canonical trigger_types</th>
                <th>Authoring affordance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="chip blue">Auto</span></td>
                <td><span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 999, background: "var(--accent-soft)", color: "var(--accent)", border: "1px solid var(--accent)" }}>Eligibility met</span></td>
                <td><span className="code">form_answer · state_transition · event_trigger · irt_message</span></td>
                <td>&quot;When X happens, apply tag Y&quot; composer</td>
              </tr>
              <tr>
                <td><span className="chip amber">Manual</span></td>
                <td><span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 999, background: "var(--amber-soft)", color: "var(--amber)", border: "1px dashed var(--amber)" }}>Withdraw consent</span></td>
                <td><span className="code">manual</span></td>
                <td>User-action composer with audit reason</td>
              </tr>
              <tr>
                <td><span className="chip slate">Day offset</span></td>
                <td><span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 999, background: "var(--bg-muted)", color: "var(--slate)", border: "1px solid var(--slate)" }}>+28 days from enrollment</span></td>
                <td><span className="code">time_offset</span></td>
                <td>Anchor picker + offset days; optional window</td>
              </tr>
              <tr>
                <td><span className="chip" style={{ background: "#FCE7F3", color: "#BE185D" }}>Conditional</span></td>
                <td><span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 999, background: "#FCE7F3", color: "#BE185D", border: "1px solid #BE185D" }}>ARM = TRTA</span></td>
                <td><span className="code">conditional</span></td>
                <td>Predicate composer over tag set + data state · branches allowed</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
