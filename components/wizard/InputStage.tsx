"use client";

import { FileText, FileSpreadsheet, AlertTriangle, CheckCircle2, RefreshCw, ArrowRight } from "lucide-react";
import type { StudyFixture, SourceDoc } from "@/lib/studies/types";
import { Card, Pill } from "@/components/ui";

const KIND_LABEL: Record<SourceDoc["kind"], string> = {
  protocol:       "Protocol",
  amendment:      "Amendment",
  icf:            "ICF",
  safety_plan:    "Safety plan",
  crossover_plan: "Crossover plan",
  tracker:        "Tracker",
  other:          "Other",
};

type Tone = "neutral" | "success" | "warning";
const STATUS_BADGE: Record<SourceDoc["status"], { label: string; tone: Tone; icon: typeof CheckCircle2 }> = {
  extracted:   { label: "Extracted",      tone: "success", icon: CheckCircle2 },
  amendment:   { label: "Amendment ref",  tone: "neutral", icon: FileText },
  image_only:  { label: "Image-only PDF", tone: "warning", icon: AlertTriangle },
  icf_only:    { label: "ICF only",       tone: "warning", icon: AlertTriangle },
  operational: { label: "Operational",    tone: "neutral", icon: FileSpreadsheet },
};

function iconForFile(filename: string) {
  if (/\.xlsx?$/i.test(filename)) return FileSpreadsheet;
  return FileText;
}

export function InputStage({ study, onAdvance }: { study: StudyFixture; onAdvance: () => void }) {
  const ok = study.sources.filter((s) => s.status === "extracted").length;
  const total = study.sources.length;

  return (
    <div className="space-y-5">
      <Card className="p-0">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-navy">Source pack</h2>
          <span className="text-xs text-slate-400">
            {ok} of {total} docs extracted · contributes to identity, tags, journey, dispositions
          </span>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 opacity-60"
            >
              <RefreshCw size={13} /> Re-extract (placeholder)
            </button>
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-white opacity-60"
            >
              + Add document
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-canvas">
              <tr className="border-b border-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-400">
                <th className="px-3 py-2.5 font-medium">Document</th>
                <th className="px-3 py-2.5 font-medium">Kind</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 font-medium">Contributes to</th>
              </tr>
            </thead>
            <tbody>
              {study.sources.map((s) => {
                const FileIcon = iconForFile(s.filename);
                const badge = STATUS_BADGE[s.status];
                const StatusIcon = badge.icon;
                return (
                  <tr key={s.filename} className="border-t border-slate-50 align-top">
                    <td className="px-3 py-2.5">
                      <div className="flex gap-2.5">
                        <FileIcon size={16} className="mt-0.5 shrink-0 text-slate-400" />
                        <div>
                          <div className="break-all font-mono text-[11.5px] font-semibold text-navy">
                            {s.filename}
                          </div>
                          {s.note ? <div className="mt-1 text-[11px] leading-relaxed text-slate-400">{s.note}</div> : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <Pill tone="neutral" mono>{KIND_LABEL[s.kind]}</Pill>
                    </td>
                    <td className="px-3 py-2.5">
                      <Pill tone={badge.tone}>
                        <StatusIcon size={11} /> {badge.label}
                      </Pill>
                    </td>
                    <td className="px-3 py-2.5">
                      {s.contributes_to.length === 0 ? (
                        <span className="text-[11px] italic text-slate-300">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {s.contributes_to.map((c) => (
                            <Pill key={c} tone="neutral" mono>{c}</Pill>
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
      </Card>

      <Card>
        <div className="mb-3 flex items-baseline gap-2">
          <h2 className="text-sm font-semibold text-navy">What the AI did with the source pack</h2>
          <span className="text-xs text-slate-400">
            Story 1 · feeds Tag Categories, Journey Elements, and the Review profile
          </span>
        </div>
        <ul className="space-y-1.5 pl-5 text-[13px] leading-loose text-slate-600" style={{ listStyleType: "disc" }}>
          <li>
            <strong className="text-navy">Identity extraction</strong> — sponsor, indication, phase,
            archetype, enrollment target, duration.
          </li>
          <li>
            <strong className="text-navy">Journey assembly</strong> — milestones, scheduled visits
            with day offsets + windows, branches keyed off tag expressions, cross-cutting overlays.
          </li>
          <li>
            <strong className="text-navy">Tag taxonomy</strong> — Categories per §4 (cohort,
            treatment, exposure, segment, subgroup, analysis_set, operational), Assignment Rules
            with trigger families.
          </li>
          <li>
            <strong className="text-navy">Disposition catalog</strong> — terminal states + a permanent catch-all per Pooja+Ana&apos;s ask.
          </li>
          <li>
            <strong className="text-navy">Provenance</strong> — every extracted field links back to
            a source document, page, and excerpt. Visible in <em>Review profile</em>.
          </li>
        </ul>
      </Card>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onAdvance}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white outline-none hover:bg-bright focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          Review extracted profile <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
