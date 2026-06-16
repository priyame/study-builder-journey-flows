"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Tag, GitBranch, Users, FileDown, GitFork,
  CheckCircle2, Circle, AlertCircle, ArrowLeft,
} from "lucide-react";
import type { StudyFixture } from "@/lib/studies/types";

// Stage 3 — the study hub. Setup-readiness checklist + jump-off links into
// the 5 slice pages. Each checklist item derives its status from the
// fixture's actual content (tags exist → done; no tags → not started).

interface ChecklistItem {
  id: string;
  label: string;
  detail: string;
  status: "done" | "partial" | "todo";
  href: string;
  icon: typeof Tag;
}

function buildChecklist(study: StudyFixture): ChecklistItem[] {
  const t = study.tagCategories.filter((c) => c.category_type !== "all_participants");
  const milestones = study.elements.filter((e) => e.element_type === "milestone");
  const live = study.versions.find((v) => v.status === "Published");
  const draft = study.versions.find((v) => v.status === "Draft");

  return [
    {
      id: "extract",
      label: "Extract from source pack",
      detail: `${study.sources.filter((s) => s.status === "extracted").length} of ${study.sources.length} docs extracted${study.identity.dataSource !== "real" ? " · CAVEAT" : ""}`,
      status: study.identity.dataSource === "real" ? "done" : "partial",
      href: "/study",
      icon: CheckCircle2,
    },
    {
      id: "tags",
      label: "Configure tags & rules",
      detail: `${t.length} categories · ${study.tagRules.length} rules`,
      status: t.length === 0 ? "todo" : t.length < 3 ? "partial" : "done",
      href: "/study/tags",
      icon: Tag,
    },
    {
      id: "journey",
      label: "Design the journey",
      detail: `${milestones.length} milestones · ${study.elements.length} elements · ${study.paths.length} paths`,
      status: milestones.length === 0 ? "todo" : "done",
      href: "/study/journey",
      icon: GitFork,
    },
    {
      id: "enrollment",
      label: "Define enrollment + subject ID",
      detail: `Trigger: ${study.enrollmentDefinition.trigger.replace(/_/g, " ")} · Pattern: ${study.subjectId.pattern}`,
      status: "done",
      href: "/study/subjects",
      icon: Users,
    },
    {
      id: "export",
      label: "Confirm export shape",
      detail: `${study.exportPreview.length} sample rows · combined dataset NFR-095`,
      status: study.exportPreview.length === 0 ? "todo" : "done",
      href: "/study/export",
      icon: FileDown,
    },
    {
      id: "publish",
      label: "Publish a version",
      detail: live ? `Live: ${live.version_label} · ${draft ? `${draft.version_label} in Draft` : "no Draft yet"}` : draft ? `${draft.version_label} in Draft — not yet Published` : "no versions yet",
      status: live ? "done" : draft ? "partial" : "todo",
      href: "/study/versions",
      icon: GitBranch,
    },
  ];
}

const STATUS_VIS = {
  done:    { icon: CheckCircle2, color: "var(--green)",  bg: "var(--green-soft)",  label: "Done" },
  partial: { icon: AlertCircle,  color: "var(--amber)",  bg: "var(--amber-soft)",  label: "Partial" },
  todo:    { icon: Circle,       color: "var(--slate)",  bg: "var(--bg-muted)",    label: "Not started" },
} as const;

export function HubStage({ study, onBack }: { study: StudyFixture; onBack: () => void }) {
  const params = useSearchParams();
  const studyParam = params.get("study");
  const qs = studyParam ? `?study=${studyParam}` : "";

  const checklist = buildChecklist(study);
  const completion = Math.round((checklist.filter((c) => c.status === "done").length / checklist.length) * 100);

  return (
    <div className="stack" style={{ gap: 18 }}>
      {/* Top stats */}
      <div className="grid-3">
        <div className="card">
          <div className="card-body">
            <div className="muted" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
              Setup completion
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{completion}%</div>
            <div style={{ marginTop: 8, height: 6, background: "var(--bg-muted)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${completion}%`, background: "var(--accent)" }} />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="muted" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
              Active version
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>
              {study.versions.find((v) => v.status === "Published")?.version_label ?? <span className="muted">—</span>}
            </div>
            <div className="muted" style={{ fontSize: 11.5, marginTop: 4 }}>
              {study.versions.length} total versions · Draft/UAT/Live
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="muted" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
              Journey complexity
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>
              {study.elements.length} elements
            </div>
            <div className="muted" style={{ fontSize: 11.5, marginTop: 4 }}>
              {study.paths.length} paths · {study.edges.filter((e) => e.is_branch).length} branch edges
            </div>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="card">
        <div className="card-header">
          <h2>Setup readiness</h2>
          <span className="sub">Status derives from this study's actual fixture content — no static todo lists</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {checklist.map((item, i) => {
            const vis = STATUS_VIS[item.status];
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={`${item.href}${qs}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 18px",
                  borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: vis.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <vis.icon size={16} color={vis.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Icon size={13} color="var(--fg-muted)" />
                    <span style={{ fontWeight: 600, fontSize: 13.5 }}>{item.label}</span>
                    <span style={{ fontSize: 10, color: vis.color, fontWeight: 700, marginLeft: "auto", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {vis.label}
                    </span>
                  </div>
                  <div className="muted" style={{ fontSize: 11.5, marginTop: 4 }}>{item.detail}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Direct links to slice pages */}
      <div className="card">
        <div className="card-header">
          <h2>Open a configuration surface</h2>
          <span className="sub">Each slice scopes to {study.identity.code}</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="grid-2" style={{ gap: 0 }}>
            {[
              { href: "/study/tags",     label: "Tags & Rules",       icon: Tag,       hint: "§4 · Kelly's tag model" },
              { href: "/study/journey",  label: "Journey",            icon: GitFork,   hint: "§4.5 · 3 view modes" },
              { href: "/study/versions", label: "Versions",           icon: GitBranch, hint: "NFR-107 · Draft / UAT / Live" },
              { href: "/study/subjects", label: "Subjects & Enrollment", icon: Users,  hint: "NFR-016 · Pooja + Ana" },
              { href: "/study/export",   label: "Export Shape",       icon: FileDown,  hint: "NFR-095 · combined dataset" },
            ].map(({ href, label, icon: Icon, hint }) => (
              <Link
                key={href}
                href={`${href}${qs}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 18px",
                  borderBottom: "1px solid var(--border-subtle)",
                  borderRight: "1px solid var(--border-subtle)",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <Icon size={18} color="var(--accent)" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{label}</div>
                  <div className="muted" style={{ fontSize: 11 }}>{hint}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="row" style={{ justifyContent: "flex-start" }}>
        <button className="btn" onClick={onBack}>
          <ArrowLeft size={14} /> Back to review
        </button>
      </div>
    </div>
  );
}
