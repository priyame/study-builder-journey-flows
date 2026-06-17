"use client";

import { useState } from "react";
import { FileUp, ClipboardCheck, LayoutGrid, AlertTriangle } from "lucide-react";
import { useActiveStudy } from "@/lib/active-study";
import { EnvBanner } from "@/components/EnvBanner";
import { Card, PageGuide, PageHeader, Pill, cx } from "@/components/ui";
import { InputStage } from "./InputStage";
import { ReviewStage } from "./ReviewStage";
import { HubStage } from "./HubStage";

type Stage = "input" | "review" | "hub";

const STAGES: { id: Stage; label: string; icon: typeof FileUp; hint: string }[] = [
  { id: "input",  label: "Source pack",    icon: FileUp,         hint: "Protocol + supporting docs you've supplied for this study" },
  { id: "review", label: "Review profile", icon: ClipboardCheck, hint: "Extracted study identity + every field's source provenance" },
  { id: "hub",    label: "Study hub",      icon: LayoutGrid,     hint: "Setup checklist · jump into Tags / Journey / Versions / Subjects / Export" },
];

export function StudyWizard() {
  const study = useActiveStudy();
  const [stage, setStage] = useState<Stage>("hub");
  const inferred = study.identity.dataSource !== "real";

  return (
    <>
      <PageHeader
        phase="design"
        title={`Study setup · ${study.identity.code}`}
        subtitle={
          <>
            Three stages: review the source pack you&apos;ve supplied, confirm the AI-extracted
            profile with per-field provenance, then jump into the configuration surfaces — Tags,
            Journey, Versions, Subjects, Export.
          </>
        }
        action={<Pill tone="primary" mono>PRD #12 v0.8 · Story 1</Pill>}
      />

      <PageGuide eyebrow="How to use this">
        Each AI-extracted field has a small <strong className="font-semibold text-navy">&ldquo;why&rdquo;</strong>{" "}
        affordance on the Review stage — open it to see the verbatim source excerpt + page citation.
      </PageGuide>

      <EnvBanner />

      {inferred ? (
        <Card className="mb-4 border-l-[3px] border-l-warning">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warning" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-warning">
                {study.identity.dataSource === "icf_only" ? "ICF-only fixture" : "Inferred fixture"}
              </div>
              <div className="mt-1 text-xs text-slate-500">{study.identity.dataNote}</div>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Stage tabs */}
      <Card className="mb-6 p-0">
        <div className="flex border-b border-slate-100">
          {STAGES.map(({ id, label, icon: Icon, hint }, i) => {
            const active = stage === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setStage(id)}
                className={cx(
                  "flex flex-1 flex-col items-start gap-1 border-b-[3px] px-5 py-3.5 text-left outline-none transition-colors focus-visible:bg-canvas",
                  i < STAGES.length - 1 && "border-r border-r-slate-100",
                  active ? "border-b-primary bg-primary/[0.06]" : "border-b-transparent bg-white hover:bg-canvas",
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cx(
                      "font-mono text-[10px] font-bold uppercase tracking-[0.08em]",
                      active ? "text-primary" : "text-slate-400",
                    )}
                  >
                    Stage {i + 1}
                  </span>
                  <Icon size={14} strokeWidth={2} className={active ? "text-primary" : "text-slate-500"} />
                  <span className={cx("text-sm font-bold", active ? "text-primary" : "text-navy")}>
                    {label}
                  </span>
                </div>
                <span className="text-[11px] leading-snug text-slate-400">{hint}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {stage === "input"  ? <InputStage  study={study} onAdvance={() => setStage("review")} /> : null}
      {stage === "review" ? <ReviewStage study={study} onAdvance={() => setStage("hub")} onBack={() => setStage("input")} /> : null}
      {stage === "hub"    ? <HubStage    study={study} onBack={() => setStage("review")} /> : null}
    </>
  );
}
