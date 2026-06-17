"use client";

import { useState } from "react";
import { RotateCcw, X } from "lucide-react";
import { EnvBanner } from "@/components/EnvBanner";
import { Card, PageGuide, PageHeader, Pill, cx } from "@/components/ui";
import { useActiveStudy } from "@/lib/active-study";
import { HUB_SECTIONS, type HubSection } from "@/lib/settings-model";
import { useAllRoles, useLocalStore, useSectionAccess } from "@/lib/local-store";

const STATUS_TONE = {
  wired: { label: "Wired in R1.0", tone: "success" as const },
  "planned-r1.1": { label: "Planned R1.1", tone: "warning" as const },
  "phase-2-reserved": { label: "Phase 2 reserved", tone: "neutral" as const },
};

export default function SettingsHubPage() {
  const study = useActiveStudy();
  const { identity } = study;
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <>
      <PageHeader
        phase="govern"
        title="Study Settings"
        subtitle={
          <>
            The eight-section per-study Configuration Hub from PRD #25 §3. Each section is{" "}
            <strong className="font-semibold text-navy">role-gated</strong> by the permission shown
            in its header — the catalog lives at{" "}
            <a href={"/study/users?study=" + identity.id} className="font-semibold text-primary underline">
              Users &amp; Roles
            </a>
            .
          </>
        }
        action={<Pill tone="navy" mono>{identity.code}</Pill>}
      />

      <PageGuide eyebrow="How to edit">
        <strong className="font-semibold text-navy">Click &ldquo;Configure access&rdquo;</strong> on any
        section to change its status (wired / planned / phase-2 reserved) and grant or revoke{" "}
        <strong className="font-semibold text-navy">edit access for individual roles</strong> beyond
        what their base grants provide. Overrides persist to localStorage and surface in the
        &ldquo;Editable by&rdquo; row.
      </PageGuide>

      <EnvBanner />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {HUB_SECTIONS.map((s) => (
          <SectionCard
            key={s.id}
            section={s}
            isEditing={editing === s.id}
            onToggleEdit={() => setEditing(editing === s.id ? null : s.id)}
          />
        ))}
      </div>
    </>
  );
}

function SectionCard({
  section,
  isEditing,
  onToggleEdit,
}: {
  section: HubSection;
  isEditing: boolean;
  onToggleEdit: () => void;
}) {
  const store = useLocalStore();
  const allRoles = useAllRoles();
  const { status, editors } = useSectionAccess(section);
  const editorIds = new Set(editors.map((r) => r.id));

  const override = store.state.sectionOverrides[section.id];
  const hasOverride = override && Object.keys(override).length > 0;

  const meta = STATUS_TONE[status];

  return (
    <Card>
      <header className="mb-3">
        <div className="flex items-baseline gap-2">
          <h3 className="text-sm font-semibold text-navy">{section.label}</h3>
          <Pill tone={meta.tone} mono>{meta.label}</Pill>
          {hasOverride ? <Pill tone="accent" mono>edited</Pill> : null}
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{section.description}</p>
      </header>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">{section.editPerm}</span>
        <span className="text-[11px] text-slate-400">
          Editable by:{" "}
          {editors.length === 0 ? (
            <span className="italic text-slate-300">(none yet)</span>
          ) : (
            editors.map((r) => (
              <span key={r.id} className="ml-1 inline-flex">
                <Pill tone={r.tier === "org" ? "success" : r.tier === "custom" ? "accent" : "navy"} mono>
                  {r.tier === "custom" ? r.name.slice(0, 8) : (r as { code: string }).code ?? r.id}
                </Pill>
              </span>
            ))
          )}
        </span>
        <button
          type="button"
          onClick={onToggleEdit}
          className={cx(
            "ml-auto rounded-lg border px-2.5 py-1 text-[11px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/40",
            isEditing
              ? "border-primary bg-primary/[0.06] text-primary"
              : "border-slate-200 bg-white text-navy hover:border-primary/40 hover:text-primary",
          )}
        >
          {isEditing ? "Done" : "Configure access"}
        </button>
      </div>

      <div className="text-xs font-semibold text-navy">Owns</div>
      <ul className="mt-1.5 list-disc space-y-1 pl-5 text-xs leading-relaxed text-slate-600">
        {section.owns.map((o) => <li key={o}>{o}</li>)}
      </ul>

      {section.storedIn ? (
        <div className="mt-3 border-t border-dashed border-slate-200 pt-2.5 text-[11px] text-slate-400">
          Stored in <span className="font-mono text-slate-500">{section.storedIn}</span>
        </div>
      ) : null}

      {isEditing ? (
        <div className="mt-4 rounded-lg border border-primary/30 bg-primary/[0.04] p-3">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h4 className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
              Configure section access
            </h4>
            {hasOverride ? (
              <button
                type="button"
                onClick={() => store.resetSectionOverrides(section.id)}
                className="inline-flex items-center gap-1 rounded-md border border-warning/40 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-warning outline-none hover:bg-warning/10 focus-visible:ring-2 focus-visible:ring-warning/40"
              >
                <RotateCcw size={10} /> Reset
              </button>
            ) : null}
          </div>

          <div className="mb-3">
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Status</div>
            <div className="inline-flex overflow-hidden rounded-lg border border-slate-200 bg-white">
              {(["wired", "planned-r1.1", "phase-2-reserved"] as const).map((s) => {
                const active = status === s;
                const tone = STATUS_TONE[s].tone;
                const activeCls = tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : "bg-slate-500";
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => store.setSectionStatus(section.id, s)}
                    className={cx(
                      "border-r border-slate-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide outline-none transition-colors last:border-r-0",
                      active ? `${activeCls} text-white` : "text-slate-500 hover:bg-slate-50",
                    )}
                  >
                    {STATUS_TONE[s].label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Roles allowed to edit this section
            </div>
            <p className="mb-2 text-[10.5px] text-slate-400">
              Base grants come from each role&apos;s permission catalog (the{" "}
              <span className="rounded bg-slate-100 px-1 font-mono text-[10px]">{section.editPerm}</span>{" "}
              permission). Toggle below to add or revoke for this section only.
            </p>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {allRoles.map((r) => {
                const baseHas = r.grants.includes(section.editPerm);
                const isRevoked = (override?.revokedEditors ?? []).includes(r.id);
                const isExtra = (override?.extraEditors ?? []).includes(r.id);
                const on = editorIds.has(r.id);
                const overrideTag =
                  baseHas && isRevoked
                    ? "revoked"
                    : !baseHas && isExtra
                      ? "added"
                      : null;
                return (
                  <label
                    key={r.id}
                    className={cx(
                      "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs outline-none transition-colors",
                      on ? "bg-white" : "bg-canvas",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => {
                        if (baseHas) store.toggleSectionRevokedEditor(section.id, r.id);
                        else store.toggleSectionExtraEditor(section.id, r.id);
                      }}
                      className="h-3.5 w-3.5 rounded border-slate-300 accent-primary"
                    />
                    <span className="font-mono text-[10px] font-bold text-slate-500">
                      {r.tier === "custom" ? "✎" : (r as { code: string }).code ?? r.id}
                    </span>
                    <span className={cx("flex-1 truncate", on ? "text-slate-600" : "text-slate-400")}>
                      {r.name}
                    </span>
                    {overrideTag ? (
                      <span
                        className={cx(
                          "rounded px-1 py-px font-mono text-[9px] font-semibold",
                          overrideTag === "added" ? "bg-success/15 text-success" : "bg-danger/15 text-danger",
                        )}
                      >
                        {overrideTag}
                      </span>
                    ) : null}
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
