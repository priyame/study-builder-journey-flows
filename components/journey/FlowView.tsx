"use client";

import { ELEMENTS, EDGES } from "./seed";
import { TRIGGER_FAMILY_LABEL, ELEMENT_TYPE_LABEL } from "@/lib/journey-model";
import type { JourneyElement, TriggerFamily } from "@/lib/journey-model";

// §4.5 Flow view — visual graph projection over Journey Elements + Edges.
// Milestones are enlarged nodes; scheduled elements are standard nodes;
// branches render as a fork with two parallel lanes (TRTA / SoC) that converge at EoT.

// Layout buckets — rendered as columns from left to right.
const LANES: { id: string; label: string; elementIds: string[] }[] = [
  { id: "pre",   label: "Pre-randomization",    elementIds: ["el-consent", "el-screen", "el-ms-screen-complete", "el-enroll", "el-ms-rand"] },
  { id: "trta",  label: "Treatment A branch",   elementIds: ["el-trta-d1", "el-trta-d8", "el-trta-d29"] },
  { id: "soc",   label: "Standard of Care branch", elementIds: ["el-soc-d1", "el-soc-d29"] },
  { id: "post",  label: "Convergent + follow-up", elementIds: ["el-ms-eot", "el-followup"] },
  { id: "side",  label: "Cross-cutting",         elementIds: ["el-ae", "el-hr-extra"] },
  { id: "end",   label: "End states",            elementIds: ["el-end-complete", "el-end-withdrawn"] },
];

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
        minWidth: 160,
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
        fontSize: isMilestone ? 13 : 12.5,
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

function EdgeChips({ fromId }: { fromId: string }) {
  const edges = EDGES.filter((e) => e.from === fromId);
  if (edges.length === 0) return null;
  return (
    <div className="stack" style={{ gap: 4, alignItems: "center", padding: "4px 0" }}>
      {edges.map((e, i) => {
        const style = FAMILY_STYLE[e.trigger_family];
        return (
          <div
            key={i}
            style={{
              fontSize: 10,
              padding: "3px 8px",
              borderRadius: 999,
              background: style.bg,
              color: style.fg,
              border: `1px ${style.dashed ? "dashed" : "solid"} ${style.border}`,
              maxWidth: 200,
              textAlign: "center",
              lineHeight: 1.3,
            }}
          >
            <span style={{ fontWeight: 600, marginRight: 4 }}>{TRIGGER_FAMILY_LABEL[e.trigger_family]}:</span>
            {e.trigger_label}
            {e.is_branch ? <span style={{ marginLeft: 4, opacity: 0.7 }}>· branch</span> : null}
          </div>
        );
      })}
    </div>
  );
}

export function FlowView() {
  const byId = Object.fromEntries(ELEMENTS.map((e) => [e.id, e]));

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="card">
        <div className="card-header">
          <h2>Workflow graph</h2>
          <span className="sub">Milestones as enlarged nodes · edge chips show trigger family · branch on ARM tag</span>
        </div>
        <div className="card-body" style={{ overflowX: "auto" }}>
          {/* Pre-randomization: linear left-to-right */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, minWidth: 1100 }}>
            {LANES[0].elementIds.map((id, i) => (
              <div key={id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <NodeCard el={byId[id]} />
                {i < LANES[0].elementIds.length - 1 ? (
                  <div style={{ minWidth: 130 }}>
                    <EdgeChips fromId={id} />
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {/* Branch decision label */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 0, height: 0,
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderTop: "16px solid var(--accent)",
              marginLeft: 360,
            }} />
            <div className="muted" style={{ fontSize: 12, fontStyle: "italic" }}>
              Decision: route by Randomization Arm tag (set by IRT message at the Randomization milestone)
            </div>
          </div>

          {/* Branch: two lanes side-by-side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24, minWidth: 1100 }}>
            {/* TRTA lane */}
            <div style={{
              padding: 14,
              borderLeft: "3px solid var(--accent)",
              background: "linear-gradient(90deg, var(--accent-soft) 0%, transparent 100%)",
              borderRadius: "var(--r-md)",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", marginBottom: 8 }}>
                {LANES[1].label} · <span className="code">ARM=TRTA</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "nowrap" }}>
                {LANES[1].elementIds.map((id, i) => (
                  <div key={id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <NodeCard el={byId[id]} />
                    {i < LANES[1].elementIds.length - 1 ? <div style={{ minWidth: 90 }}><EdgeChips fromId={id} /></div> : null}
                  </div>
                ))}
              </div>
            </div>

            {/* SoC lane */}
            <div style={{
              padding: 14,
              borderLeft: "3px solid var(--slate)",
              background: "linear-gradient(90deg, var(--bg-muted) 0%, transparent 100%)",
              borderRadius: "var(--r-md)",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", marginBottom: 8 }}>
                {LANES[2].label} · <span className="code">ARM=SOC</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "nowrap" }}>
                {LANES[2].elementIds.map((id, i) => (
                  <div key={id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <NodeCard el={byId[id]} />
                    {i < LANES[2].elementIds.length - 1 ? <div style={{ minWidth: 90 }}><EdgeChips fromId={id} /></div> : null}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Convergent: EoT milestone + follow-up cadence */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, minWidth: 800 }}>
            <div className="muted" style={{ fontSize: 11, fontStyle: "italic", maxWidth: 120 }}>Branches converge →</div>
            {LANES[3].elementIds.map((id, i) => (
              <div key={id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <NodeCard el={byId[id]} />
                {i < LANES[3].elementIds.length - 1 ? <div style={{ minWidth: 130 }}><EdgeChips fromId={id} /></div> : null}
              </div>
            ))}
            <div style={{ minWidth: 130 }}><EdgeChips fromId="el-followup" /></div>
            <NodeCard el={byId["el-end-complete"]} />
          </div>

          {/* Cross-cutting overlay */}
          <div style={{ display: "flex", gap: 16, paddingTop: 16, borderTop: "1px dashed var(--border-strong)" }}>
            <div className="muted" style={{ fontSize: 11, fontStyle: "italic", maxWidth: 140, alignSelf: "center" }}>
              Cross-cutting overlays (apply across the journey based on tag expression):
            </div>
            {LANES[4].elementIds.map((id) => (
              <NodeCard key={id} el={byId[id]} />
            ))}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              <span className="muted" style={{ fontSize: 11 }}>Manual exit:</span>
              <EdgeChips fromId="el-enroll" />
              <NodeCard el={byId["el-end-withdrawn"]} />
            </div>
          </div>
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
                <td><span className="code">form_answer · state_transition · event_trigger · irt_message · conditional</span></td>
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
