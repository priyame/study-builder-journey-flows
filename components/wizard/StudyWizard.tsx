"use client";

import { useState } from "react";
import { FileUp, ClipboardCheck, LayoutGrid, AlertTriangle } from "lucide-react";
import { useActiveStudy } from "@/lib/active-study";
import { EnvBanner } from "@/components/EnvBanner";
import { InputStage } from "./InputStage";
import { ReviewStage } from "./ReviewStage";
import { HubStage } from "./HubStage";

// Three-stage study-setup wizard — mirror of Nathan's StudyOnboarding pattern
// (Input → Review → Hub), populated by the active StudyFixture instead of
// a live AI extraction. Lets us iterate on the setup UX with real-protocol
// data while the AI Import Wizard (Story 1 of PRD #12 v0.8) is built out
// separately.

type Stage = "input" | "review" | "hub";

const STAGES: { id: Stage; label: string; icon: typeof FileUp; hint: string }[] = [
  { id: "input",  label: "Source pack",     icon: FileUp,         hint: "Protocol + supporting docs you've supplied for this study" },
  { id: "review", label: "Review profile",  icon: ClipboardCheck, hint: "Extracted study identity + every field's source provenance" },
  { id: "hub",    label: "Study hub",       icon: LayoutGrid,     hint: "Setup checklist · jump into Tags / Journey / Versions / Subjects / Export" },
];

export function StudyWizard() {
  const study = useActiveStudy();
  const [stage, setStage] = useState<Stage>("hub");

  const inferred = study.identity.dataSource !== "real";

  return (
    <>
      <div className="page-header">
        <h1>Study setup · {study.identity.code}</h1>
        <p className="lede">
          Three stages: review the source pack you've supplied, confirm the AI-extracted profile with per-field provenance,
          then jump into the configuration surfaces — Tags, Journey, Versions, Subjects, Export.
        </p>
        <span className="source-tag">PRD #12 v0.8 · Story 1 (AI Import) populated from the protocol source pack</span>
      </div>

      <EnvBanner />

      {inferred ? (
        <div className="card" style={{ marginBottom: 18, borderLeft: "3px solid var(--amber)" }}>
          <div className="card-body" style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: 14 }}>
            <AlertTriangle size={16} color="var(--amber)" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: "var(--amber)", fontSize: 12.5 }}>
                {study.identity.dataSource === "icf_only" ? "ICF-only fixture" : "Inferred fixture"}
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                {study.identity.dataNote}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Stage tabs */}
      <div className="card" style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)" }}>
          {STAGES.map(({ id, label, icon: Icon, hint }, i) => {
            const active = stage === id;
            return (
              <button
                key={id}
                onClick={() => setStage(id)}
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
                  cursor: "pointer",
                  borderRight: i < STAGES.length - 1 ? "1px solid var(--border-subtle)" : undefined,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, color: active ? "var(--accent)" : "var(--fg-muted)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Stage {i + 1}
                  </span>
                  <Icon size={14} strokeWidth={2} color={active ? "var(--accent)" : "var(--fg-secondary)"} />
                  <span style={{ fontWeight: 700, color: active ? "var(--accent)" : "var(--fg-primary)", fontSize: 13 }}>{label}</span>
                </div>
                <div className="muted" style={{ fontSize: 11, textAlign: "left", lineHeight: 1.4 }}>{hint}</div>
              </button>
            );
          })}
        </div>
      </div>

      {stage === "input"  ? <InputStage  study={study} onAdvance={() => setStage("review")} /> : null}
      {stage === "review" ? <ReviewStage study={study} onAdvance={() => setStage("hub")} onBack={() => setStage("input")} /> : null}
      {stage === "hub"    ? <HubStage    study={study} onBack={() => setStage("review")} /> : null}
    </>
  );
}
