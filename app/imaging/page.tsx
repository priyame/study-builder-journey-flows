"use client";

import Link from "next/link";
import { ExternalLink, ScanLine, ShieldCheck } from "lucide-react";
import { EnvBanner } from "@/components/EnvBanner";
import { Card, PageGuide, PageHeader, Pill } from "@/components/ui";

// Imaging surface is iterated in Nathan's TalOSSurvey repo (commits 57d99e8 +
// f461be6 — DICOM viewer with OHIF/Cornerstone + automatic de-identification).
// This personal sketch repo doesn't carry the viewer dependencies; this page
// is here so the Capture nav matches the production sidebar shape and the
// route doesn't 404.

export default function ImagingStubPage() {
  return (
    <>
      <PageHeader
        phase="capture"
        title="Imaging"
        subtitle={
          <>
            DICOM medical imaging — non-diagnostic viewing with{" "}
            <strong className="font-semibold text-navy">OHIF / Cornerstone</strong>, automatic
            de-identification at ingest, and viewer activity logged to the audit trail.
          </>
        }
        action={<Pill tone="accent" mono>TalOSSurvey · iterated there</Pill>}
      />

      <PageGuide eyebrow="Where this lives">
        The Imaging surface is built and iterated in Nathan&apos;s production app
        (TalOSSurvey, branch <code className="rounded bg-slate-100 px-1 font-mono text-[11px] text-slate-600">claude/talos-forms-r1-spec-2KkZs</code>,
        commits <code className="rounded bg-slate-100 px-1 font-mono text-[11px] text-slate-600">57d99e8</code> +{" "}
        <code className="rounded bg-slate-100 px-1 font-mono text-[11px] text-slate-600">f461be6</code>). This
        sketch repo carries the nav slot so the Capture phase reads the same shape, but the actual
        viewer / de-ID pipeline lives in the production tree.
      </PageGuide>

      <EnvBanner />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-baseline gap-2">
            <ScanLine size={16} className="text-primary" />
            <h2 className="text-sm font-semibold text-navy">What ships in TalOSSurvey</h2>
            <Pill tone="primary" mono>preview-gated</Pill>
          </div>
          <ul className="space-y-1.5 pl-5 text-sm leading-relaxed text-slate-600" style={{ listStyleType: "disc" }}>
            <li>Cornerstone-based viewer (the OHIF stack) — pan, zoom, window/level, measurement.</li>
            <li>Advanced clinical viewer features layered on top (commit <code className="rounded bg-slate-100 px-1 font-mono text-[10px]">57d99e8</code>) — radiology-grade affordances.</li>
            <li>Automatic <strong className="font-semibold text-navy">de-identification at ingest</strong> — DICOM tags scrubbed before the file becomes available to viewers.</li>
            <li>Non-diagnostic disclaimer surfaced on every view.</li>
            <li>Preview-gated behind the <code className="rounded bg-slate-100 px-1 font-mono text-[10px]">imaging</code> feature flag (Settings → Features). Off by default for new orgs.</li>
          </ul>
        </Card>

        <Card>
          <div className="mb-3 flex items-baseline gap-2">
            <ShieldCheck size={16} className="text-primary" />
            <h2 className="text-sm font-semibold text-navy">Why it sits here in the nav</h2>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            Imaging belongs in the <strong className="font-semibold text-navy">Capture</strong>{" "}
            phase next to Participants and Data Sources — these are the surfaces where clinical
            data enters the system. Keeping the slot present in this sketch repo means the sidebar
            shape matches the production sidebar even though the viewer dependencies don&apos;t live
            here. Click through the link below to view the real surface.
          </p>
        </Card>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Link
          href="https://github.com/nroze22/TalOSSurvey/tree/claude/talos-forms-r1-spec-2KkZs/apps/web/app"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white outline-none hover:bg-bright focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          View imaging route in TalOSSurvey <ExternalLink size={13} />
        </Link>
        <span className="text-[11px] text-slate-400">
          Last touched: 2026-06-17 — Nathan&apos;s commits <code className="rounded bg-slate-100 px-1 font-mono text-[10px]">57d99e8</code> + <code className="rounded bg-slate-100 px-1 font-mono text-[10px]">f461be6</code>
        </span>
      </div>
    </>
  );
}
