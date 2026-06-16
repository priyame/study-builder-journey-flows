"use client";

import { FileText, FileSpreadsheet, AlertTriangle, CheckCircle2, RefreshCw, ArrowRight } from "lucide-react";
import type { StudyFixture, SourceDoc } from "@/lib/studies/types";

// Stage 1 — the source pack. Mirrors Nathan's "Source pack" tab: list the
// files this study was built from, with extraction status next to each. The
// 'refresh blueprint' action is a placeholder hook for the real AI-import
// wizard (Story 1 in PRD #12 v0.8).

const KIND_LABEL: Record<SourceDoc["kind"], string> = {
  protocol:       "Protocol",
  amendment:      "Amendment",
  icf:            "ICF",
  safety_plan:    "Safety plan",
  crossover_plan: "Crossover plan",
  tracker:        "Tracker",
  other:          "Other",
};

const STATUS_BADGE: Record<SourceDoc["status"], { label: string; cls: string; icon: typeof CheckCircle2 }> = {
  extracted:    { label: "Extracted",        cls: "chip green", icon: CheckCircle2 },
  amendment:    { label: "Amendment ref",    cls: "chip slate", icon: FileText },
  image_only:   { label: "Image-only PDF",   cls: "chip amber", icon: AlertTriangle },
  icf_only:     { label: "ICF only",         cls: "chip amber", icon: AlertTriangle },
  operational:  { label: "Operational",      cls: "chip slate", icon: FileSpreadsheet },
};

function iconForFile(filename: string) {
  if (/\.xlsx?$/i.test(filename)) return FileSpreadsheet;
  return FileText;
}

export function InputStage({ study, onAdvance }: { study: StudyFixture; onAdvance: () => void }) {
  const ok = study.sources.filter((s) => s.status === "extracted").length;
  const total = study.sources.length;

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="card">
        <div className="card-header">
          <h2>Source pack</h2>
          <span className="sub">
            {ok} of {total} docs extracted · contributes to identity, tags, journey, dispositions
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button className="btn btn-sm" disabled style={{ opacity: 0.6 }}>
              <RefreshCw size={13} /> Re-extract (placeholder)
            </button>
            <button className="btn btn-sm btn-primary" disabled style={{ opacity: 0.6 }}>
              + Add document
            </button>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Document</th>
                <th style={{ width: 140 }}>Kind</th>
                <th style={{ width: 160 }}>Status</th>
                <th>Contributes to</th>
              </tr>
            </thead>
            <tbody>
              {study.sources.map((s) => {
                const FileIcon = iconForFile(s.filename);
                const badge = STATUS_BADGE[s.status];
                return (
                  <tr key={s.filename}>
                    <td>
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <FileIcon size={16} color="var(--fg-muted)" style={{ marginTop: 2, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11.5, fontWeight: 600, wordBreak: "break-all" }}>
                            {s.filename}
                          </div>
                          {s.note ? (
                            <div className="muted" style={{ fontSize: 11, marginTop: 4, lineHeight: 1.5 }}>{s.note}</div>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td><span className="chip slate" style={{ fontSize: 11 }}>{KIND_LABEL[s.kind]}</span></td>
                    <td>
                      <span className={badge.cls} style={{ fontSize: 11, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <badge.icon size={11} /> {badge.label}
                      </span>
                    </td>
                    <td>
                      {s.contributes_to.length === 0 ? (
                        <span className="muted" style={{ fontSize: 11, fontStyle: "italic" }}>—</span>
                      ) : (
                        <div className="row wrap" style={{ gap: 4 }}>
                          {s.contributes_to.map((c) => (
                            <span key={c} className="chip" style={{ fontSize: 10 }}>{c}</span>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>What the AI did with the source pack</h2>
          <span className="sub">Story 1 · PRD #12 v0.8 — feeds Tag Categories, Journey Elements, and the Review stage's profile</span>
        </div>
        <div className="card-body">
          <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, lineHeight: 1.8 }}>
            <li>
              <strong>Identity extraction</strong> — sponsor, indication, phase, archetype, enrollment target, duration.
            </li>
            <li>
              <strong>Journey assembly</strong> — milestones, scheduled visits with day offsets + windows, branches keyed off tag expressions, cross-cutting overlays.
            </li>
            <li>
              <strong>Tag taxonomy</strong> — Categories per §4 (cohort, treatment, exposure, segment, subgroup, analysis_set, operational), Assignment Rules with trigger families.
            </li>
            <li>
              <strong>Disposition catalog</strong> — terminal states + a permanent catch-all per Pooja+Ana's ask.
            </li>
            <li>
              <strong>Provenance</strong> — every extracted field links back to a source document, page, and excerpt. Visible in <em>Review profile</em>.
            </li>
          </ul>
        </div>
      </div>

      <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
        <button className="btn btn-primary" onClick={onAdvance}>
          Review extracted profile <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
