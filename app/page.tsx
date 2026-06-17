"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Tag, GitBranch, Users, FileDown, GitFork, AlertTriangle, FileText, Settings, Shield } from "lucide-react";
import { useActiveStudy } from "@/lib/active-study";
import { PageHeader, PageGuide, Pill, Card, cx } from "@/components/ui";

const SLICES = [
  {
    href: "/study/tags",
    title: "Tags & Rules",
    source: "Kelly Ritch · 2026-06-04 · PRD #12 v0.8 §4 + §4.1",
    quote:
      "A human is going to go on a journey and throughout the way, we're going to hang a bunch of tags on them that later help us group them. But we aren't pre-grouping them.",
    body: "Tag Categories + Tag Assignment Rules replace the legacy Participant Group entity. 8 category types, 7 trigger types, both auto and manual assignment are first-class.",
    icon: Tag,
  },
  {
    href: "/study/journey",
    title: "Journey · Workflow Authoring",
    source: "PRD #12 v0.8 §4.5 · visual borrow from Cohort-Workflow-Optimization",
    quote: "Builders need to anchor work to named transitions in the participant's journey, not just to study start.",
    body: "Three view modes (Visits · Flow · Sequence) over the same canonical workflow. Milestones as first-class nodes. Trigger families surface 7 canonical trigger_types as 4 UI groupings.",
    icon: GitFork,
  },
  {
    href: "/study/versions",
    title: "Draft / UAT / Live versioning",
    source: "Kelly Ritch · NFR-107 · PRD #12 v0.8 §§21–28",
    quote:
      "Production can stay running and you can spin up a new version of dev based on the current version in production... ultimately you go from there to production as a release.",
    body: "Three environments map to four Study Version statuses (Draft → Signed Off → Published → Retired). Warn-and-allow on Live for non-versioning edits.",
    icon: GitBranch,
  },
  {
    href: "/study/subjects",
    title: "Subjects & Enrollment",
    source: "Pooja + Ana · 2026-06-10 · NFR-016",
    quote: "Auto and manual state transitions; open/custom disposition catch-all; configurable enrollment definition; subject ID structure.",
    body: "Configurable Subject ID pattern, enrollment trigger picker, dispositions with a catch-all bucket so end-state doesn't get stuck.",
    icon: Users,
  },
  {
    href: "/study/export",
    title: "Combined-dataset export shape",
    source: "Pooja + Ana · 2026-06-10 · NFR-095",
    quote: "One combined dataset for review, not N narrow exports stitched together downstream.",
    body: "Preview the export shape with Tag Categories + Subject ID + Dispositions joined into one row-per-subject view.",
    icon: FileDown,
  },
  {
    href: "/study/settings",
    title: "Study Settings · 8-section Hub",
    source: "PRD #25 §3 · per-study Configuration Hub",
    quote: "Each section is role-gated; the Hub is where day-to-day governance happens once the study is built.",
    body: "General · Screening & Eligibility · Enrollment & Milestones · Feature Flags · Data & Storage · Notifications & Alerts · Regulatory & Compliance · Blinding (Phase 2 reserved).",
    icon: Settings,
  },
  {
    href: "/study/users",
    title: "Users & Roles · PRD #25 §2",
    source: "PRD #25 §2 · 12-role canonical taxonomy + permission catalog",
    quote: "Three tiers — Org (TA · AM · CRO) above any single study; the 6 canonical study-team roles; 3 specialty extensions.",
    body: "Per-study memberships (NFR-091): one user can hold different roles on different studies. Permission catalog with PHI / blinding / e-sign / destructive risk chips.",
    icon: Shield,
  },
];

export default function HomePage() {
  const study = useActiveStudy();
  const params = useSearchParams();
  const studyParam = params.get("study");
  const qs = studyParam ? `?study=${studyParam}` : "";

  const inferred = study.identity.dataSource !== "real";

  return (
    <>
      <PageHeader
        phase="overview"
        title="Study Builder · Journey Flows"
        subtitle={
          <>
            A focused sketch of the new study-build model. Seven slices spanning Design / Capture /
            Analyze / Govern — chrome and primitives now mirror the production TalOS Forms app
            exactly, so this repo can iterate on new features without visual drift.
          </>
        }
        action={<Pill tone="primary" mono>PRD #12 v0.8 + PRD #25 §2 / §3</Pill>}
      />

      <PageGuide eyebrow="How to use this">
        <strong className="font-semibold text-navy">Pick a study</strong> from the topbar switcher —
        every page below scopes to your selection. The <strong className="font-semibold text-navy">env switcher</strong>{" "}
        next to it toggles between Draft / UAT / Live (NFR-107).
      </PageGuide>

      {/* Active study summary card — scoped to the switcher's selection. */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-start gap-4">
          <FileText size={20} className="mt-0.5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-bold text-primary">{study.identity.code}</span>
              <Pill tone="neutral" mono>{study.identity.archetype.replace("_", " ")}</Pill>
              {study.identity.phase ? <Pill tone="neutral" mono>{study.identity.phase}</Pill> : null}
              {inferred ? (
                <Pill tone="warning" mono>
                  <AlertTriangle size={10} />{" "}
                  {study.identity.dataSource === "icf_only" ? "ICF-only" : "Inferred"}
                </Pill>
              ) : (
                <Pill tone="success" mono>Real protocol</Pill>
              )}
            </div>
            <div className="mt-2 text-sm font-semibold text-navy">{study.identity.name}</div>
            <div className="mt-1 text-xs text-slate-500">{study.identity.tagline}</div>
            <div className="mt-2 text-[11px] italic text-slate-400">
              Source: {study.identity.sourceCitation}
            </div>
            {inferred && study.identity.dataNote ? (
              <div className="mt-2 rounded-lg bg-warning/10 px-3 py-2 text-[11px] text-warning">
                {study.identity.dataNote}
              </div>
            ) : null}
          </div>
          <div className="flex min-w-[220px] flex-col gap-1 text-xs">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              This study has
            </div>
            <div>
              <strong>{study.tagCategories.length}</strong> tag categories ·{" "}
              <strong>{study.tagRules.length}</strong> rules
            </div>
            <div>
              <strong>{study.elements.length}</strong> journey elements ·{" "}
              <strong>{study.edges.length}</strong> edges
            </div>
            <div>
              <strong>{study.paths.length}</strong> paths · <strong>{study.versions.length}</strong> versions
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {SLICES.map(({ href, title, source, quote, body, icon: Icon }) => (
          <Link
            key={href}
            href={`${href}${qs}`}
            className={cx(
              "group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm outline-none transition-colors",
              "hover:border-primary/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/40",
            )}
          >
            <div className="mb-2 flex items-center gap-2">
              <Icon size={16} strokeWidth={1.8} className="text-primary" />
              <h2 className="text-sm font-semibold text-navy group-hover:text-primary">{title}</h2>
            </div>
            <div className="mb-2 font-mono text-[10px] text-slate-400">{source}</div>
            <blockquote className="mb-3 border-l-2 border-accent bg-canvas px-3 py-2 text-xs italic text-slate-600">
              {quote}
            </blockquote>
            <p className="text-xs text-slate-600">{body}</p>
          </Link>
        ))}
      </div>

      <section className="mt-10">
        <h3 className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Out of scope for this sketch
        </h3>
        <ul className="space-y-1.5 pl-5 text-sm leading-relaxed text-slate-600" style={{ listStyleType: "disc" }}>
          <li>AI Import Wizard (Story 1) and Template flow (Story 2) — separate review.</li>
          <li>eCRF Builder, Edit Checks library — these consume Tags / Versions / Journey, they don&apos;t author them.</li>
          <li>Full drag-and-drop authoring in Sequence view — lands in R1.1 per §4.5.</li>
        </ul>
      </section>
    </>
  );
}
