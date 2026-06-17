"use client";

import { EnvBanner } from "@/components/EnvBanner";
import { useActiveStudy } from "@/lib/active-study";
import { HUB_SECTIONS, rolesWithEditAccess, type HubSection } from "@/lib/settings-model";
import { Card, PageGuide, PageHeader, Pill, cx } from "@/components/ui";

export default function SettingsHubPage() {
  const study = useActiveStudy();
  const { identity } = study;

  return (
    <>
      <PageHeader
        phase="govern"
        title="Study Settings"
        subtitle={
          <>
            The eight-section per-study Configuration Hub from PRD #25 §3. Each section is{" "}
            <strong className="font-semibold text-navy">role-gated</strong> by the permission shown in
            its header — the catalog lives at{" "}
            <a href={"/study/users?study=" + identity.id} className="font-semibold text-primary underline">
              Users &amp; Roles
            </a>
            .
          </>
        }
        action={<Pill tone="navy" mono>{identity.code}</Pill>}
      />

      <PageGuide eyebrow="What this is">
        Eight sections per PRD #25 §3, scoped to the active study (switch from the topbar). The status
        pill tells you what's <strong className="font-semibold text-navy">wired in R1.0</strong>,{" "}
        <strong className="font-semibold text-navy">planned for R1.1</strong>, or{" "}
        <strong className="font-semibold text-navy">Phase 2 reserved</strong>.
      </PageGuide>

      <EnvBanner />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {HUB_SECTIONS.map((s) => <SectionCard key={s.id} section={s} />)}
      </div>
    </>
  );
}

function SectionCard({ section }: { section: HubSection }) {
  const editors = rolesWithEditAccess(section.editPerm);
  const tone =
    section.status === "wired"
      ? "success"
      : section.status === "planned-r1.1"
        ? "warning"
        : "neutral";
  const statusLabel =
    section.status === "wired" ? "Wired in R1.0" : section.status === "planned-r1.1" ? "Planned R1.1" : "Phase 2 reserved";

  return (
    <Card>
      <header className="mb-3">
        <div className="flex items-baseline gap-2">
          <h3 className="text-sm font-semibold text-navy">{section.label}</h3>
          <Pill tone={tone} mono>{statusLabel}</Pill>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{section.description}</p>
      </header>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
          {section.editPerm}
        </span>
        <span className="text-[11px] text-slate-400">
          Editable by:{" "}
          {editors.length === 0 ? (
            <span className="italic text-slate-300">(none yet)</span>
          ) : (
            editors.map((r) => (
              <Pill key={r.id} tone={r.tier === "org" ? "success" : "navy"} mono>
                {r.code}
              </Pill>
            ))
          )}
        </span>
      </div>

      <div className="text-xs font-semibold text-navy">Owns</div>
      <ul className="mt-1.5 list-disc space-y-1 pl-5 text-xs leading-relaxed text-slate-600">
        {section.owns.map((o) => <li key={o}>{o}</li>)}
      </ul>

      {section.storedIn ? (
        <div className={cx("mt-3 border-t border-dashed border-slate-200 pt-2.5 text-[11px] text-slate-400")}>
          Stored in <span className="font-mono text-slate-500">{section.storedIn}</span>
        </div>
      ) : null}
    </Card>
  );
}
