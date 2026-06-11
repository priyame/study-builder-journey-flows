"use client";

import { useState } from "react";
import { Grid3X3, GitFork, ListOrdered } from "lucide-react";
import { EnvBanner } from "@/components/EnvBanner";
import { VisitsView } from "./VisitsView";
import { FlowView } from "./FlowView";
import { SequenceView } from "./SequenceView";
import { PATHS, ELEMENTS } from "./seed";
import { ELEMENT_TYPE_LABEL } from "@/lib/journey-model";

type Mode = "visits" | "flow" | "sequence";

const TABS: { id: Mode; label: string; icon: typeof Grid3X3; bestFor: string }[] = [
  { id: "visits",   label: "Visits",   icon: Grid3X3,     bestFor: "Clinical ops · data managers comparing across timepoints" },
  { id: "flow",     label: "Flow",     icon: GitFork,     bestFor: "Workflow design · branch logic review · non-technical reviewers" },
  { id: "sequence", label: "Sequence", icon: ListOrdered, bestFor: "Detail authoring · AI-assisted edits · accessibility-first" },
];

export function JourneyPageClient() {
  const [mode, setMode] = useState<Mode>("flow");

  const milestones = ELEMENTS.filter((e) => e.element_type === "milestone");
  const elementCounts = ELEMENTS.reduce<Record<string, number>>((acc, el) => {
    acc[el.element_type] = (acc[el.element_type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <div className="page-header">
        <h1>Journey · Workflow Authoring</h1>
        <p className="lede">
          Three projections of the <strong>same canonical workflow</strong>. Switching views does
          not migrate or transform data — the saved Study Version is identical regardless of which
          view authored it. No new entities; all primitives map to §4 Journey Elements + Tag
          Assignment Rules.
        </p>
        <span className="source-tag">PRD #12 v0.8 §4.5 · visual concepts borrowed from Cohort-Workflow-Optimization · model from Kelly Ritch 2026-06-04</span>
      </div>

      <EnvBanner />

      {/* -------------------------------------------------------------------
          Paths + element-type summary
          ------------------------------------------------------------------- */}
      <div className="grid-2" style={{ marginBottom: 22 }}>
        <div className="card">
          <div className="card-header">
            <h2>Journey Paths</h2>
            <span className="sub">Tag-expression routing — never stored as groups</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Path</th>
                  <th style={{ width: 130 }}>Applies to</th>
                </tr>
              </thead>
              <tbody>
                {PATHS.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      {p.description ? <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{p.description}</div> : null}
                    </td>
                    <td><span className="code">{p.applies_to_expr}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Milestones</h2>
            <span className="sub">§4.5.3 — first-class visual primitives; builder-named per §3.5</span>
          </div>
          <div className="card-body">
            <div className="stack" style={{ gap: 8 }}>
              {milestones.map((m) => (
                <div key={m.id} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  border: "1px solid var(--accent)",
                  borderRadius: 999,
                  background: "var(--accent-soft)",
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }} />
                  <span style={{ fontWeight: 600, color: "var(--accent)" }}>{m.builder_label}</span>
                  {m.notes ? <span className="muted" style={{ fontSize: 11, marginLeft: "auto" }}>{m.notes}</span> : null}
                </div>
              ))}
            </div>
            <div className="divider" />
            <div className="row wrap" style={{ gap: 6, fontSize: 11 }}>
              {Object.entries(elementCounts).map(([type, n]) => (
                <span key={type} className="chip slate">
                  {ELEMENT_TYPE_LABEL[type as keyof typeof ELEMENT_TYPE_LABEL]}: {n}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------
          View-mode tabs
          ------------------------------------------------------------------- */}
      <div className="card" style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)" }}>
          {TABS.map(({ id, label, icon: Icon, bestFor }) => {
            const active = mode === id;
            return (
              <button
                key={id}
                onClick={() => setMode(id)}
                style={{
                  flex: 1,
                  padding: "14px 18px",
                  border: "none",
                  borderBottom: active ? "3px solid var(--accent)" : "3px solid transparent",
                  background: active ? "var(--accent-soft)" : "var(--bg-surface)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 4,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon size={16} strokeWidth={2} color={active ? "var(--accent)" : "var(--fg-secondary)"} />
                  <span style={{ fontWeight: 600, color: active ? "var(--accent)" : "var(--fg-primary)" }}>{label}</span>
                </div>
                <div className="muted" style={{ fontSize: 11, textAlign: "left" }}>{bestFor}</div>
              </button>
            );
          })}
        </div>
      </div>

      {mode === "visits"   ? <VisitsView />   : null}
      {mode === "flow"     ? <FlowView />     : null}
      {mode === "sequence" ? <SequenceView /> : null}

      <div className="muted" style={{ fontSize: 11, marginTop: 28, padding: 16, background: "var(--bg-muted)", borderRadius: "var(--r-md)", lineHeight: 1.7 }}>
        <strong style={{ color: "var(--fg-secondary)" }}>What this surface does NOT change (§4.5.5):</strong>{" "}
        no new entities · no parallel schema · no new <span className="code">trigger_type</span> values
        (the 4 families are a UI grouping over the 7 canonical values) · no <span className="code">Arm</span>/<span className="code">Visit</span> typed entities in the data layer (those are builder-named labels per §3.5 over Tag Categories + Journey Elements) · no new versioning semantics (authoring follows §§21–28 like any other §4 edit).
      </div>
    </>
  );
}
