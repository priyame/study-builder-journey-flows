"use client";

import { useState } from "react";
import { Grid3X3, GitFork, ListOrdered, AlertTriangle } from "lucide-react";
import { EnvBanner } from "@/components/EnvBanner";
import { Card, PageGuide, PageHeader, Pill, cx } from "@/components/ui";
import { VisitsView } from "./VisitsView";
import { FlowView } from "./FlowView";
import { SequenceView } from "./SequenceView";
import { ELEMENT_TYPE_LABEL } from "@/lib/journey-model";
import { useActiveStudy } from "@/lib/active-study";

type Mode = "visits" | "flow" | "sequence";

const TABS: { id: Mode; label: string; icon: typeof Grid3X3; bestFor: string }[] = [
  { id: "visits",   label: "Visits",   icon: Grid3X3,     bestFor: "Clinical ops · data managers comparing across timepoints" },
  { id: "flow",     label: "Flow",     icon: GitFork,     bestFor: "Workflow design · branch logic review · non-technical reviewers" },
  { id: "sequence", label: "Sequence", icon: ListOrdered, bestFor: "Detail authoring · AI-assisted edits · accessibility-first" },
];

export function JourneyPageClient() {
  const [mode, setMode] = useState<Mode>("flow");
  const study = useActiveStudy();
  const { identity, paths, elements, edges, visitColumns } = study;

  const milestones = elements.filter((e) => e.element_type === "milestone");
  const elementCounts = elements.reduce<Record<string, number>>((acc, el) => {
    acc[el.element_type] = (acc[el.element_type] ?? 0) + 1;
    return acc;
  }, {});

  const inferred = identity.dataSource !== "real";

  return (
    <>
      <PageHeader
        phase="design"
        title="Journey · Workflow Authoring"
        subtitle={
          <>
            Three projections of the <strong className="font-semibold text-navy">same canonical
            workflow</strong>. Switching views does not migrate or transform data — the saved Study
            Version is identical regardless of which view authored it.
          </>
        }
        action={<Pill tone="navy" mono>{identity.code}</Pill>}
      />

      <PageGuide eyebrow="What this is">
        §4.5 Workflow Authoring Surface. Milestones as first-class nodes (rendered as enlarged
        rounded nodes); ARM-conditioned paths render as parallel lanes; cross-cutting elements ride
        in their own strip.
      </PageGuide>

      {inferred ? (
        <Card className="mb-4 border-l-[3px] border-l-warning">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warning" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-warning">
                {identity.dataSource === "icf_only" ? "ICF-only fixture" : "Inferred fixture"}
              </div>
              <div className="mt-1 text-xs text-slate-500">{identity.dataNote}</div>
            </div>
          </div>
        </Card>
      ) : null}

      <EnvBanner />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-0">
          <div className="flex items-baseline gap-2 border-b border-slate-100 px-5 py-3">
            <h2 className="text-sm font-semibold text-navy">Journey Paths</h2>
            <span className="text-xs text-slate-400">Tag-expression routing — never stored as groups</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-canvas">
                <tr className="border-b border-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-2.5 font-medium">Path</th>
                  <th className="px-3 py-2.5 font-medium">Applies to</th>
                </tr>
              </thead>
              <tbody>
                {paths.map((p) => (
                  <tr key={p.id} className="border-t border-slate-50 align-top">
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-navy">{p.name}</div>
                      {p.description ? <div className="mt-0.5 text-[11px] text-slate-400">{p.description}</div> : null}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
                        {p.applies_to_expr}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="mb-3 flex items-baseline gap-2">
            <h2 className="text-sm font-semibold text-navy">Milestones</h2>
            <span className="text-xs text-slate-400">
              §4.5.3 — first-class visual primitives; builder-named per §3.5
            </span>
          </div>
          {milestones.length === 0 ? (
            <p className="text-xs italic text-slate-400">
              This study has no milestones — pure cadence-driven follow-up.
            </p>
          ) : (
            <div className="space-y-2">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-2.5 rounded-full border border-primary bg-primary/[0.06] px-3 py-2"
                >
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm font-semibold text-primary">{m.builder_label}</span>
                  {m.notes ? <span className="ml-auto text-[11px] text-slate-400">{m.notes}</span> : null}
                </div>
              ))}
            </div>
          )}
          <div className="my-4 h-px bg-slate-100" />
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(elementCounts).map(([type, n]) => (
              <Pill key={type} tone="neutral" mono>
                {ELEMENT_TYPE_LABEL[type as keyof typeof ELEMENT_TYPE_LABEL]}: {n}
              </Pill>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card className="p-0">
          <div className="flex border-b border-slate-100">
            {TABS.map(({ id, label, icon: Icon, bestFor }) => {
              const active = mode === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  className={cx(
                    "flex flex-1 flex-col items-start gap-1 border-b-[3px] px-5 py-3.5 text-left outline-none transition-colors focus-visible:bg-canvas",
                    active ? "border-primary bg-primary/[0.06]" : "border-transparent bg-white hover:bg-canvas",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      size={16}
                      strokeWidth={2}
                      className={active ? "text-primary" : "text-slate-500"}
                    />
                    <span className={cx("text-sm font-semibold", active ? "text-primary" : "text-navy")}>
                      {label}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">{bestFor}</span>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="mt-6">
        {mode === "visits"   ? <VisitsView   elements={elements} visitColumns={visitColumns} /> : null}
        {mode === "flow"     ? <FlowView     elements={elements} edges={edges} /> : null}
        {mode === "sequence" ? <SequenceView elements={elements} edges={edges} /> : null}
      </div>

      <div className="mt-7 rounded-lg bg-canvas px-4 py-3 text-[11px] leading-relaxed text-slate-500">
        <strong className="text-slate-600">What this surface does NOT change (§4.5.5):</strong> no
        new entities · no parallel schema · no new{" "}
        <span className="rounded bg-white px-1 font-mono text-[10px]">trigger_type</span> values
        (the 4 families are a UI grouping over the 7 canonical values) · no{" "}
        <span className="rounded bg-white px-1 font-mono text-[10px]">Arm</span>/
        <span className="rounded bg-white px-1 font-mono text-[10px]">Visit</span> typed entities in
        the data layer (those are builder-named labels per §3.5 over Tag Categories + Journey
        Elements) · no new versioning semantics.
      </div>
    </>
  );
}
