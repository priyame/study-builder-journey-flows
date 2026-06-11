"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ELEMENTS, EDGES } from "./seed";
import { ELEMENT_TYPE_LABEL, TRIGGER_FAMILY_LABEL } from "@/lib/journey-model";

// §4.5 Sequence view — one Journey Element in focus at a time, prev/next nav.
// Best-fit role: detail authoring + accessibility-first review.
// R1.1 will add full drag-and-drop reordering — R1.0 ships read-equivalent.

const VISIBLE = ELEMENTS.filter((e) => e.element_type !== "end_state");

export function SequenceView() {
  const [idx, setIdx] = useState(0);
  const el = VISIBLE[idx];
  const prev = idx > 0 ? VISIBLE[idx - 1] : null;
  const next = idx < VISIBLE.length - 1 ? VISIBLE[idx + 1] : null;
  const isMilestone = el.element_type === "milestone";

  const incoming = EDGES.filter((e) => e.to === el.id);
  const outgoing = EDGES.filter((e) => e.from === el.id);

  return (
    <div className="stack" style={{ gap: 18 }}>
      {/* Stepper rail */}
      <div className="card">
        <div className="card-body" style={{ padding: "14px 18px", overflowX: "auto" }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", minWidth: 1000 }}>
            {VISIBLE.map((e, i) => {
              const active = i === idx;
              const passed = i < idx;
              const mile = e.element_type === "milestone";
              return (
                <button
                  key={e.id}
                  onClick={() => setIdx(i)}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <div style={{
                    width: mile ? 22 : 18,
                    height: mile ? 22 : 18,
                    borderRadius: mile ? "50%" : 4,
                    background: active
                      ? (mile ? "var(--accent)" : "var(--accent)")
                      : passed
                        ? "var(--accent-soft)"
                        : "var(--bg-muted)",
                    border: active || mile ? "2px solid var(--accent)" : "1px solid var(--border-strong)",
                    flexShrink: 0,
                  }} />
                  <span style={{
                    fontSize: 10.5,
                    fontWeight: active ? 700 : 500,
                    color: active ? "var(--fg-primary)" : "var(--fg-muted)",
                    whiteSpace: "nowrap",
                    paddingRight: 4,
                  }}>
                    {e.builder_label}
                  </span>
                  {i < VISIBLE.length - 1 ? (
                    <div style={{ width: 18, height: 1, background: passed ? "var(--accent)" : "var(--border-strong)" }} />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Focused element card */}
      <div className="card" style={{ borderTop: isMilestone ? "3px solid var(--accent)" : undefined }}>
        <div className="card-header">
          <div>
            <div style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--fg-muted)",
              fontWeight: 600,
              marginBottom: 4,
            }}>
              Step {idx + 1} of {VISIBLE.length} · {ELEMENT_TYPE_LABEL[el.element_type]}
              {isMilestone ? <span style={{ marginLeft: 8, color: "var(--accent)" }}>· Milestone</span> : null}
            </div>
            <h2 style={{ color: isMilestone ? "var(--accent)" : undefined }}>{el.builder_label}</h2>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            <button
              className="btn btn-sm"
              disabled={!prev}
              onClick={() => prev && setIdx(idx - 1)}
              style={{ opacity: prev ? 1 : 0.4 }}
            >
              <ChevronLeft size={14} /> {prev?.builder_label ?? "—"}
            </button>
            <button
              className="btn btn-sm btn-primary"
              disabled={!next}
              onClick={() => next && setIdx(idx + 1)}
              style={{ opacity: next ? 1 : 0.4 }}
            >
              {next?.builder_label ?? "End"} <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="card-body">
          <dl className="kv">
            <dt>element_type</dt>
            <dd><span className={`chip ${isMilestone ? "blue" : "slate"}`}>{ELEMENT_TYPE_LABEL[el.element_type]}</span></dd>

            <dt>Applies to (tag expression)</dt>
            <dd><span className="code">{el.applies_to_expr ?? "ALL=ALL"}</span></dd>

            {el.day_offset !== undefined ? (
              <>
                <dt>Day offset</dt>
                <dd>
                  <span className="code">D{el.day_offset >= 0 ? `+${el.day_offset}` : el.day_offset}</span>
                  {el.window_minus || el.window_plus ? (
                    <span className="muted" style={{ marginLeft: 8 }}>
                      window -{el.window_minus ?? 0} / +{el.window_plus ?? 0} days
                    </span>
                  ) : null}
                </dd>
                <dt>Anchor</dt>
                <dd><span className="code">{el.anchor ?? "study_start"}</span></dd>
              </>
            ) : null}

            {el.cadence ? (
              <>
                <dt>Cadence</dt>
                <dd>
                  every <span className="code">{el.cadence.interval_days}</span> days
                  <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>Stop when: {el.cadence.stop_condition}</div>
                </dd>
              </>
            ) : null}

            {el.notes ? (
              <>
                <dt>Notes</dt>
                <dd className="muted">{el.notes}</dd>
              </>
            ) : null}
          </dl>

          <div className="divider" />

          {/* Block steps — visual decomposition only in R1.0 (§4.5.4) */}
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
            Block steps {el.activities.length === 0 ? <span className="muted" style={{ fontWeight: 400, marginLeft: 6 }}>(none — milestone has no activities)</span> : null}
          </div>
          {el.activities.length > 0 ? (
            <ol style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, lineHeight: 1.8 }}>
              {el.activities.map((a, i) => (
                <li key={i}>
                  {a}
                  <span className="muted" style={{ marginLeft: 8, fontSize: 10.5 }}>step {i + 1}</span>
                </li>
              ))}
            </ol>
          ) : null}

          <div className="divider" />

          {/* Adjacent edges — transitions in & out */}
          <div className="grid-2">
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>← Incoming transitions</div>
              {incoming.length === 0 ? (
                <div className="muted" style={{ fontSize: 12 }}>This is an entry point.</div>
              ) : (
                <div className="stack" style={{ gap: 6 }}>
                  {incoming.map((e, i) => (
                    <div key={i} className="row" style={{ fontSize: 12 }}>
                      <span className={`chip ${e.trigger_family === "auto" ? "blue" : e.trigger_family === "manual" ? "amber" : "slate"}`}>
                        {TRIGGER_FAMILY_LABEL[e.trigger_family]}
                      </span>
                      <span>{e.trigger_label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Outgoing transitions →</div>
              {outgoing.length === 0 ? (
                <div className="muted" style={{ fontSize: 12 }}>Terminal — no outgoing.</div>
              ) : (
                <div className="stack" style={{ gap: 6 }}>
                  {outgoing.map((e, i) => (
                    <div key={i} className="row" style={{ fontSize: 12 }}>
                      <span className={`chip ${e.trigger_family === "auto" ? "blue" : e.trigger_family === "manual" ? "amber" : "slate"}`}>
                        {TRIGGER_FAMILY_LABEL[e.trigger_family]}
                      </span>
                      <span>{e.trigger_label}</span>
                      {e.is_branch ? <span className="chip" style={{ fontSize: 10, marginLeft: 6 }}>branch</span> : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="muted" style={{ fontSize: 11.5, textAlign: "center" }}>
        Sequence view ships R1.0 as read-equivalent · full drag-and-drop reordering lands in R1.1
      </div>
    </div>
  );
}
