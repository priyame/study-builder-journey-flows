"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Tag, GitBranch, Users, FileDown, GitFork, Settings, Shield,
  CheckCircle2, Circle, AlertCircle, ArrowLeft,
} from "lucide-react";
import type { StudyFixture } from "@/lib/studies/types";
import { Card, StatCard, cx } from "@/components/ui";

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
      detail: live
        ? `Live: ${live.version_label} · ${draft ? `${draft.version_label} in Draft` : "no Draft yet"}`
        : draft
          ? `${draft.version_label} in Draft — not yet Published`
          : "no versions yet",
      status: live ? "done" : draft ? "partial" : "todo",
      href: "/study/versions",
      icon: GitBranch,
    },
  ];
}

const STATUS_VIS = {
  done:    { Icon: CheckCircle2, text: "Done",        cls: "bg-success/10 text-success" },
  partial: { Icon: AlertCircle,  text: "Partial",     cls: "bg-warning/10 text-warning" },
  todo:    { Icon: Circle,       text: "Not started", cls: "bg-slate-100 text-slate-500" },
} as const;

export function HubStage({ study, onBack }: { study: StudyFixture; onBack: () => void }) {
  const params = useSearchParams();
  const studyParam = params.get("study");
  const qs = studyParam ? `?study=${studyParam}` : "";

  const checklist = buildChecklist(study);
  const completion = Math.round((checklist.filter((c) => c.status === "done").length / checklist.length) * 100);

  return (
    <div className="space-y-5">
      {/* Top stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
            Setup completion
          </div>
          <div className="mt-1.5 text-3xl font-bold tracking-tight text-navy">{completion}%</div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-primary" style={{ width: `${completion}%` }} />
          </div>
        </Card>
        <StatCard
          label="Active version"
          value={study.versions.find((v) => v.status === "Published")?.version_label ?? "—"}
          sub={`${study.versions.length} total versions · Draft/UAT/Live`}
          tone="navy"
        />
        <StatCard
          label="Journey complexity"
          value={`${study.elements.length} elements`}
          sub={`${study.paths.length} paths · ${study.edges.filter((e) => e.is_branch).length} branch edges`}
          tone="primary"
        />
      </div>

      {/* Checklist */}
      <Card className="p-0">
        <div className="flex items-baseline gap-2 border-b border-slate-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-navy">Setup readiness</h2>
          <span className="text-xs text-slate-400">
            Status derives from this study&apos;s actual fixture content
          </span>
        </div>
        <div>
          {checklist.map((item, i) => {
            const vis = STATUS_VIS[item.status];
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={`${item.href}${qs}`}
                className={cx(
                  "flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-canvas",
                  i > 0 && "border-t border-slate-100",
                )}
              >
                <div
                  className={cx(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    vis.cls,
                  )}
                >
                  <vis.Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Icon size={13} className="text-slate-400" />
                    <span className="text-sm font-semibold text-navy">{item.label}</span>
                    <span
                      className={cx(
                        "ml-auto rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide",
                        vis.cls,
                      )}
                    >
                      {vis.text}
                    </span>
                  </div>
                  <div className="mt-1 text-[11.5px] text-slate-400">{item.detail}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </Card>

      {/* Direct links */}
      <Card className="p-0">
        <div className="flex items-baseline gap-2 border-b border-slate-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-navy">Open a configuration surface</h2>
          <span className="text-xs text-slate-400">Each slice scopes to {study.identity.code}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {[
            { href: "/study/tags",     label: "Tags & Rules",          icon: Tag,       hint: "§4 · Kelly's tag model" },
            { href: "/study/journey",  label: "Journey",               icon: GitFork,   hint: "§4.5 · 3 view modes" },
            { href: "/study/versions", label: "Versions",              icon: GitBranch, hint: "NFR-107 · Draft / UAT / Live" },
            { href: "/study/subjects", label: "Subjects & Enrollment", icon: Users,     hint: "NFR-016 · Pooja + Ana" },
            { href: "/study/export",   label: "Export Shape",          icon: FileDown,  hint: "NFR-095 · combined dataset" },
            { href: "/study/settings", label: "Study Settings",        icon: Settings,  hint: "PRD #25 §3 · Hub" },
            { href: "/study/users",    label: "Users & Roles",         icon: Shield,    hint: "PRD #25 §2 · taxonomy" },
          ].map(({ href, label, icon: Icon, hint }, i, arr) => (
            <Link
              key={href}
              href={`${href}${qs}`}
              className={cx(
                "flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-canvas",
                i < arr.length - 1 && "border-b border-slate-100",
                i % 2 === 0 && i < arr.length - 1 && "md:border-r md:border-r-slate-100",
              )}
            >
              <Icon size={18} className="text-primary" />
              <div>
                <div className="text-sm font-semibold text-navy">{label}</div>
                <div className="text-[11px] text-slate-400">{hint}</div>
              </div>
            </Link>
          ))}
        </div>
      </Card>

      <div className="flex">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy outline-none hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <ArrowLeft size={14} /> Back to review
        </button>
      </div>
    </div>
  );
}
