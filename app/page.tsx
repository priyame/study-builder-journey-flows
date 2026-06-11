import Link from "next/link";
import { Tag, GitBranch, Users, FileDown } from "lucide-react";

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
  return (
    <>
      <div className="page-header">
        <h1>Study Builder · Journey Flows</h1>
        <p className="lede">
          A focused sketch of the new study-build model. Four slices: how participants are
          characterized (Tags), how the configuration is versioned (Draft/UAT/Live), and how
          subjects + exports work in practice.
        </p>
        <span className="source-tag">PRD #12 v0.8 · merged 2026-06-10 · for team review</span>
      </div>

      <div className="grid-2">
        {SLICES.map(({ href, title, source, quote, body, icon: Icon }) => (
          <Link key={href} href={href} className="card" style={{ textDecoration: "none", color: "inherit" }}>
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

      <div style={{ marginTop: 36 }}>
        <h3 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-muted)", marginBottom: 12 }}>
          Out of scope for this sketch
        </h3>
        <ul style={{ color: "var(--fg-secondary)", fontSize: 13, lineHeight: 1.7, paddingLeft: 20 }}>
          <li>Journey + Workflow Authoring Surface (§4.5) — deferred to the next iteration.</li>
          <li>AI Import Wizard (Story 1) and Template flow (Story 2) — separate review.</li>
          <li>eCRF Builder, Schedule of Activities, Edit Checks — these consume Tags/Versions, not author them.</li>
        </ul>
      </div>
    </>
  );
}
