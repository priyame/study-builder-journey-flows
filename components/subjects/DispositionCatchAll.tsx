"use client";

import { useState, useEffect } from "react";
import { useActiveStudy } from "@/lib/active-study";

// Pooja+Ana 2026-06-10 — disposition catalog is configurable; the catch-all bucket
// ensures every subject can land somewhere even when none of the explicit reasons fit.

interface Disposition {
  id: string;
  label: string;
  is_terminal?: boolean;
  is_catch_all?: boolean;
}

export function DispositionCatchAll() {
  const study = useActiveStudy();
  const [dispositions, setDispositions] = useState<Disposition[]>(study.dispositions);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setDispositions(study.dispositions);
  }, [study.identity.id, study.dispositions]);

  const add = () => {
    if (!draft.trim()) return;
    setDispositions([
      ...dispositions.slice(0, -1), // keep "Other" last
      { id: draft.trim().toLowerCase().replace(/\s+/g, "_"), label: draft.trim(), is_terminal: true },
      dispositions[dispositions.length - 1], // catch-all stays at the end
    ]);
    setDraft("");
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>Dispositions</h2>
        <span className="sub">Pooja + Ana · open catalog with a permanent catch-all bucket</span>
      </div>
      <div className="card-body">
        <div className="stack" style={{ gap: 6 }}>
          {dispositions.map((d, idx) => (
            <div
              key={d.id}
              className="row"
              style={{
                padding: "8px 12px",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--r-md)",
                background: d.is_catch_all ? "var(--amber-soft)" : "var(--bg-surface)",
              }}
            >
              <span className="muted" style={{ width: 24, fontSize: 11 }}>{idx + 1}.</span>
              <span style={{ fontWeight: 500 }}>{d.label}</span>
              {d.is_terminal ? <span className="chip rose" style={{ marginLeft: 6, fontSize: 10 }}>terminal</span> : null}
              {d.is_catch_all ? <span className="chip amber" style={{ marginLeft: 6, fontSize: 10 }}>catch-all · cannot delete</span> : null}
              <span className="muted" style={{ marginLeft: "auto", fontSize: 11 }}><span className="code">{d.id}</span></span>
            </div>
          ))}
        </div>

        <div className="divider" />

        <div className="row">
          <input
            placeholder="Add a custom disposition (e.g., Protocol deviation)"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--r-md)",
            }}
          />
          <button className="btn btn-primary" onClick={add}>+ Add</button>
        </div>

        <div className="divider" />
        <div className="muted" style={{ fontSize: 12, lineHeight: 1.6 }}>
          The catch-all (<span className="code">other</span>) is permanent and cannot be deleted —
          it guarantees every subject has somewhere to land. Coordinators record the free-text reason
          on the disposition form when they pick &quot;Other&quot;.
        </div>
      </div>
    </div>
  );
}
