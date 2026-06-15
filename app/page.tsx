"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Tag, GitBranch, Users, FileDown, GitFork, AlertTriangle, FileText } from "lucide-react";
import { useActiveStudy } from "@/lib/active-study";
import { STUDIES } from "@/lib/studies";

const SLICES = [
  {
    href: "/study/tags",
    title: "Tags & Rules",
    source: "Kelly Ritch · 2026-06-04 · PRD #12 v0.8 §4 + §4.1",
    quote: "A human is going to go on a journey and throughout the way, we're going to hang a bunch of tags on them that later help us group them. But we aren't pre-grouping them.",
    body: "Tag Categories + Tag Assignment Rules replace the legacy Participant Group entity. 8 category types, 7 trigger types, both auto and manual assignment are first-class.",
    icon: Tag,
  },
  {
    href: "/study/journey",
    title: "Journey · Workflow Authoring",
    source: "PRD #12 v0.8 §4.5 · visual borrow from Cohort-Workflow-Optimization",
    quote: "Builders need to anchor work to named transitions in the participant's journey, not just to study start.",
    body: "Three view modes (Visits · Flow · Sequence) over the same canonical workflow. Milestones as first-class nodes. Trigger families surface 7 canonical trigger_types as 4 UI groupings. Branch on the ARM tag, converge at End of Treatment.",
    icon: GitFork,
  },
  {
    href: "/study/versions",
    title: "Draft / UAT / Live versioning",
    source: "Kelly Ritch · NFR-107 · PRD #12 v0.8 §§21–28",
    quote: "Production can stay running and you can spin up a new version of dev based on the current version in production... ultimately you go from there to production as a release.",
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
];

export default function HomePage() {
  const study = useActiveStudy();
  const params = useSearchParams();
  const studyParam = params.get("study");
  const qs = studyParam ? `?study=${studyParam}` : "";

  const inferred = study.identity.dataSource !== "real";

  return (
    <>
      <div className="page-header">
        <h1>Study Builder · Journey Flows</h1>
        <p className="lede">
          A focused sketch of the new study-build model. Five slices: how participants are
          characterized (Tags), how the journey is authored (§4.5), how the configuration is
          versioned (Draft/UAT/Live), and how subjects + exports work in practice.
        </p>
        <span className="source-tag">PRD #12 v0.8 · 6 sample studies built from real protocol pack</span>
      </div>

      {/* Active study summary */}
      <div className="card" style={{ marginBottom: 22 }}>
        <div className="card-body">
          <div className="row" style={{ gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
            <FileText size={20} color="var(--accent)" style={{ marginTop: 2, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 300 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: "var(--accent)", fontSize: 14 }}>
                  {study.identity.code}
                </span>
                <span className="chip slate" style={{ fontSize: 10 }}>{study.identity.archetype.replace("_", " ")}</span>
                {study.identity.phase ? <span className="chip slate" style={{ fontSize: 10 }}>{study.identity.phase}</span> : null}
                {inferred ? (
                  <span className="chip amber" style={{ fontSize: 10, display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <AlertTriangle size={10} /> {study.identity.dataSource === "icf_only" ? "ICF-only" : "Inferred"}
                  </span>
                ) : (
                  <span className="chip green" style={{ fontSize: 10 }}>Real protocol</span>
                )}
              </div>
              <div style={{ fontWeight: 600, fontSize: 14, marginTop: 6 }}>{study.identity.name}</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{study.identity.tagline}</div>
              <div className="muted" style={{ fontSize: 11, marginTop: 6, fontStyle: "italic" }}>
                Source: {study.identity.sourceCitation}
              </div>
              {inferred && study.identity.dataNote ? (
                <div className="muted" style={{ fontSize: 11.5, marginTop: 8, padding: "8px 10px", background: "var(--amber-soft)", borderRadius: "var(--r-md)", color: "var(--amber)" }}>
                  {study.identity.dataNote}
                </div>
              ) : null}
            </div>
            <div className="stack" style={{ gap: 4, minWidth: 200 }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-muted)", fontWeight: 600 }}>This study has</div>
              <div style={{ fontSize: 12 }}><strong>{study.tagCategories.length}</strong> tag categories · <strong>{study.tagRules.length}</strong> rules</div>
              <div style={{ fontSize: 12 }}><strong>{study.elements.length}</strong> journey elements · <strong>{study.edges.length}</strong> edges</div>
              <div style={{ fontSize: 12 }}><strong>{study.paths.length}</strong> paths · <strong>{study.versions.length}</strong> versions</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {SLICES.map(({ href, title, source, quote, body, icon: Icon }) => (
          <Link key={href} href={`${href}${qs}`} className="card" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="card-header">
              <Icon size={18} strokeWidth={1.8} />
              <h2>{title}</h2>
            </div>
            <div className="card-body">
              <div className="muted" style={{ fontSize: 11, marginBottom: 10 }}>{source}</div>
              <blockquote style={{
                margin: "0 0 12px",
                padding: "8px 12px",
                borderLeft: "3px solid var(--accent)",
                background: "var(--bg-muted)",
                fontStyle: "italic",
                color: "var(--fg-secondary)",
                fontSize: 13,
              }}>
                {quote}
              </blockquote>
              <p style={{ margin: 0, color: "var(--fg-primary)" }}>{body}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Study selection summary */}
      <div style={{ marginTop: 36 }}>
        <h3 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-muted)", marginBottom: 12 }}>
          All {STUDIES.length} sample studies (switch from the topbar)
        </h3>
        <div className="grid-2">
          {STUDIES.map((s) => {
            const isActive = s.identity.id === study.identity.id;
            const isInferred = s.identity.dataSource !== "real";
            return (
              <Link
                key={s.identity.id}
                href={s.identity.id === "lantern" ? "/" : `/?study=${s.identity.id}`}
                style={{
                  display: "block",
                  padding: 12,
                  border: `1px solid ${isActive ? "var(--accent)" : "var(--border-subtle)"}`,
                  borderRadius: "var(--r-md)",
                  background: isActive ? "var(--accent-soft)" : "var(--bg-surface)",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: "var(--accent)", fontSize: 12 }}>
                    {s.identity.code}
                  </span>
                  <span className="chip slate" style={{ fontSize: 10 }}>{s.identity.archetype.replace("_", " ")}</span>
                  {isInferred ? <span className="chip amber" style={{ fontSize: 10 }}>{s.identity.dataSource === "icf_only" ? "ICF-only" : "Inferred"}</span> : null}
                  {isActive ? <span className="chip green" style={{ fontSize: 10, marginLeft: "auto" }}>current</span> : null}
                </div>
                <div style={{ fontWeight: 600, fontSize: 12.5, marginTop: 6 }}>{s.identity.name}</div>
                <div className="muted" style={{ fontSize: 11, marginTop: 4, lineHeight: 1.4 }}>{s.identity.tagline}</div>
              </Link>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 36 }}>
        <h3 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-muted)", marginBottom: 12 }}>
          Out of scope for this sketch
        </h3>
        <ul style={{ color: "var(--fg-secondary)", fontSize: 13, lineHeight: 1.7, paddingLeft: 20 }}>
          <li>AI Import Wizard (Story 1) and Template flow (Story 2) — separate review.</li>
          <li>eCRF Builder, Edit Checks library — these consume Tags / Versions / Journey, they don&apos;t author them.</li>
          <li>Full drag-and-drop authoring in Sequence view — lands in R1.1 per §4.5.</li>
        </ul>
      </div>
    </>
  );
}
