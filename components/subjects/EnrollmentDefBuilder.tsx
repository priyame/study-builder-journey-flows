"use client";

import { useState, useEffect } from "react";
import { useActiveStudy } from "@/lib/active-study";

// Pooja+Ana 2026-06-10 — enrollment trigger is configurable per study.
// Different sponsors define "enrolled" differently; the dashboard count must reflect THIS study's definition.

const PRESETS = [
  { id: "consented",            label: "Consented",            note: "Count from informed consent — simplest, most permissive" },
  { id: "screened_and_eligible", label: "Screened & Eligible", note: "Count from completed screening with eligibility met" },
  { id: "randomized",           label: "Randomized",           note: "Count from IRT randomization — strictest" },
  { id: "first_dose",           label: "First Dose",           note: "Count from first dose administration — for IND studies" },
  { id: "custom",               label: "Custom",               note: "Define your own trigger expression" },
];

export function EnrollmentDefBuilder() {
  const study = useActiveStudy();
  const [trigger, setTrigger] = useState<string>(study.enrollmentDefinition.trigger);
  const [custom, setCustom] = useState("subject.eligibility = true AND subject.first_dose_at IS NOT NULL");

  useEffect(() => {
    setTrigger(study.enrollmentDefinition.trigger);
  }, [study.identity.id, study.enrollmentDefinition.trigger]);

  return (
    <div className="card">
      <div className="card-header">
        <h2>Enrollment definition</h2>
        <span className="sub">Pooja + Ana · 2026-06-10 — picker drives the enrollment count on every dashboard</span>
      </div>
      <div className="card-body">
        <div className="stack" style={{ gap: 8 }}>
          {PRESETS.map((p) => (
            <label
              key={p.id}
              className="row"
              style={{
                padding: "10px 14px",
                border: `1px solid ${trigger === p.id ? "var(--accent)" : "var(--border-subtle)"}`,
                borderRadius: "var(--r-md)",
                background: trigger === p.id ? "var(--accent-soft)" : "var(--bg-surface)",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="trigger"
                checked={trigger === p.id}
                onChange={() => setTrigger(p.id)}
                style={{ accentColor: "var(--accent)" }}
              />
              <div style={{ marginLeft: 4 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{p.label}</div>
                <div className="muted" style={{ fontSize: 11.5 }}>{p.note}</div>
              </div>
            </label>
          ))}
        </div>

        {trigger === "custom" ? (
          <>
            <div className="divider" />
            <div className="field">
              <label>Custom enrollment expression</label>
              <textarea
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                rows={3}
                style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}
              />
              <span className="hint">
                Validated against the subject schema. Use AND/OR/NOT. References to tag values resolve at evaluation time.
              </span>
            </div>
          </>
        ) : null}

        <div className="divider" />
        <div className="muted" style={{ fontSize: 12 }}>
          <strong style={{ color: "var(--fg-secondary)" }}>Where this surfaces:</strong>{" "}
          Enrollment dashboard counts · target progress · per-arm / per-cohort / per-site sub-counts ·
          combined export (NFR-095).
        </div>
      </div>
    </div>
  );
}
