"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { StudySwitcher } from "./StudySwitcher";
import { EnvSwitcher } from "./EnvSwitcher";
import { useActiveStudy } from "@/lib/active-study";
import { Pill } from "./ui";

const CRUMB_FOR: Record<string, string> = {
  "/study": "Study setup",
  "/study/tags": "Tags & Rules",
  "/study/journey": "Journey · Workflow Authoring",
  "/study/versions": "Versions",
  "/study/subjects": "Subjects & Enrollment",
  "/study/export": "Export Shape",
  "/study/settings": "Study Settings",
  "/study/users": "Users & Roles",
};

const KIND_LABEL: Record<string, string> = {
  rct: "Interventional",
  site_crossover: "Interventional · crossover",
  patient_crossover: "Interventional · crossover",
  single_arm: "Single-arm",
  registry: "Registry",
  survey: "Survey",
  adaptive: "Adaptive",
};

/**
 * Sticky context bar — mirrors TalOSSurvey's StudyHeader visually: active study
 * + chips (phase, archetype, target) + study switcher + env switcher. The
 * underlying StudySwitcher is the only place the study list lives.
 */
export function Topbar() {
  const pathname = usePathname() ?? "";
  const crumb = CRUMB_FOR[pathname];
  const params = useSearchParams();
  const studyParam = params.get("study");
  const qs = studyParam ? `?study=${studyParam}` : "";
  const study = useActiveStudy();

  return (
    <header className="z-30 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-slate-200 bg-white/85 px-4 py-2.5 backdrop-blur md:sticky md:top-0 sm:px-6">
      <Link href={`/study${qs}`} className="group flex min-w-0 items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
        <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Active study</span>
        <span className="truncate text-sm font-bold text-navy transition-colors group-hover:text-primary">
          {study.identity.code} <span className="font-normal text-slate-400">·</span> {study.identity.name}
        </span>
        <span className="text-xs text-slate-300 transition-colors group-hover:text-primary" aria-hidden>▾</span>
      </Link>

      <span className="hidden items-center gap-1.5 md:flex">
        {study.identity.phase ? (
          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 font-mono text-[10px] text-slate-500">
            Phase {study.identity.phase.replace(/^phase\s*/i, "")}
          </span>
        ) : null}
        <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 font-mono text-[10px] text-slate-500">
          {KIND_LABEL[study.identity.archetype] ?? "Study"}
        </span>
      </span>

      {crumb ? (
        <span className="hidden items-center gap-1.5 text-xs text-slate-500 lg:inline-flex">
          <span className="text-slate-300">/</span>
          <span>{crumb}</span>
        </span>
      ) : null}

      <span className="ml-auto flex items-center gap-2.5">
        <Pill tone="navy" mono>Sketch · personal repo</Pill>
        <StudySwitcher />
        <EnvSwitcher />
      </span>
    </header>
  );
}
