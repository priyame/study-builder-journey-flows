"use client";

import { useMemo, useState } from "react";
import { EnvBanner } from "@/components/EnvBanner";
import { Card, PageGuide, PageHeader, Pill, cx } from "@/components/ui";
import { useActiveStudy } from "@/lib/active-study";
import {
  ALL_PERMISSION_IDS,
  membersOnStudy,
  PERMISSION_GROUPS,
  studiesForUser,
  SYSTEM_ROLES,
  type PermissionRisk,
  type SystemRole,
} from "@/lib/users-model";
import { STUDIES } from "@/lib/studies";

const RISK_CHIP: Record<PermissionRisk, { label: string; cls: string }> = {
  phi: { label: "PHI", cls: "bg-danger/10 text-danger" },
  blinding: { label: "blinding", cls: "bg-warning/10 text-warning" },
  signature: { label: "e-sign", cls: "bg-navy/10 text-navy" },
  destructive: { label: "high risk", cls: "bg-danger/10 text-danger" },
};

const TIER_PILL: Record<SystemRole["tier"], { label: string; tone: "success" | "navy" | "neutral" }> = {
  org: { label: "Org tier", tone: "success" },
  study: { label: "Study team", tone: "navy" },
  specialty: { label: "Specialty", tone: "neutral" },
};

export default function UsersAndRolesPage() {
  const study = useActiveStudy();
  const { identity } = study;
  const [selectedRoleId, setSelectedRoleId] = useState<string>("SM");
  const [compare, setCompare] = useState(false);

  const selectedRole = SYSTEM_ROLES.find((r) => r.id === selectedRoleId) ?? SYSTEM_ROLES[0];
  const members = useMemo(() => membersOnStudy(identity.id), [identity.id]);
  const orgRoles = SYSTEM_ROLES.filter((r) => r.tier === "org");
  const studyRoles = SYSTEM_ROLES.filter((r) => r.tier === "study");
  const specialtyRoles = SYSTEM_ROLES.filter((r) => r.tier === "specialty");

  return (
    <>
      <PageHeader
        phase="govern"
        title="Users & Roles"
        subtitle={
          <>
            PRD #25 §2 canonical role taxonomy:{" "}
            <strong className="font-semibold text-navy">3 org-tier</strong> +{" "}
            <strong className="font-semibold text-navy">6 study-team canonical</strong> +{" "}
            <strong className="font-semibold text-navy">3 specialty</strong> roles, built on a 10-group
            permission catalog. Memberships are per-study — one user can hold different roles on
            different studies (NFR-091).
          </>
        }
        action={<Pill tone="navy" mono>{identity.code}</Pill>}
      />

      <PageGuide eyebrow="How to use this">
        Members shown are seated on the active study. Click a role in the rail to inspect its
        grants; the <strong className="font-semibold text-navy">Compare</strong> toggle gives the
        roles-× -domains rollup.
      </PageGuide>

      <EnvBanner />

      {/* Members on this study */}
      <Card className="mb-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-navy">Members · {members.length}</h2>
          <p className="text-xs text-slate-400">
            Per-study membership rows. Switching studies in the topbar re-scopes this list.
          </p>
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-canvas">
              <tr className="border-b border-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-400">
                <th className="px-3 py-2.5 font-medium">Member</th>
                <th className="px-3 py-2.5 font-medium">Role on this study</th>
                <th className="px-3 py-2.5 font-medium">Tier</th>
                <th className="px-3 py-2.5 font-medium">Acts as</th>
                <th className="px-3 py-2.5 font-medium">Also seated on</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const others = studiesForUser(m.id).filter((s) => s.studyId !== identity.id);
                return (
                  <tr key={m.id} className="border-t border-slate-50">
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-navy">{m.name}</div>
                      <div className="font-mono text-[10px] text-slate-400">{m.email}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => { setSelectedRoleId(m.roleId); setCompare(false); }}
                        className="rounded bg-canvas px-1.5 py-0.5 font-mono text-[11px] font-semibold text-primary outline-none hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary/40"
                        title={`${m.role.name} — open detail`}
                      >
                        {m.role.code} · {m.role.name}
                      </button>
                    </td>
                    <td className="px-3 py-2.5">
                      <Pill tone={TIER_PILL[m.role.tier].tone} mono>
                        {TIER_PILL[m.role.tier].label}
                      </Pill>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                        {m.role.actsAs}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      {others.length === 0 ? (
                        <span className="text-[11px] text-slate-300">—</span>
                      ) : (
                        <span className="flex flex-wrap gap-1">
                          {others.map((o) => {
                            const s = STUDIES.find((x) => x.identity.id === o.studyId);
                            return (
                              <span
                                key={o.studyId}
                                className="rounded bg-canvas px-1.5 py-0.5 font-mono text-[10px] text-slate-500"
                                title={`${o.roleId} on ${s?.identity.name ?? o.studyId}`}
                              >
                                {s?.identity.code ?? o.studyId} · {o.roleId}
                              </span>
                            );
                          })}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Roles & permissions */}
      <Card>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-navy">
            Roles &amp; permissions · {SYSTEM_ROLES.length} system roles
          </h2>
          <button
            type="button"
            onClick={() => setCompare((v) => !v)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-navy outline-none hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-pressed={compare}
          >
            {compare ? "◫ Per-role detail" : "▦ Compare all roles"}
          </button>
        </div>

        {compare ? (
          <CompareMatrix onPick={(id) => { setSelectedRoleId(id); setCompare(false); }} />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="space-y-3">
              <TierGroup label="Org administration" hint="Above any single study" roles={orgRoles} selectedId={selectedRoleId} onPick={setSelectedRoleId} />
              <TierGroup label="Study team — canonical" hint="PRD #25 §2 roles 4–9" roles={studyRoles} selectedId={selectedRoleId} onPick={setSelectedRoleId} />
              <TierGroup label="Specialty extensions" hint="Prototype additions" roles={specialtyRoles} selectedId={selectedRoleId} onPick={setSelectedRoleId} />
              <p className="px-1 text-[11px] leading-relaxed text-slate-400">
                Three tiers per PRD #25 §2. Each row acts as one of the five platform authorities
                (Admin · Author · Reviewer · DataEntry · Viewer) — the kernel enforces the authority,
                the role profile is the day-to-day detail.
              </p>
            </div>
            <RoleDetail role={selectedRole} />
          </div>
        )}
      </Card>
    </>
  );
}

function TierGroup({
  label,
  hint,
  roles,
  selectedId,
  onPick,
}: {
  label: string;
  hint: string;
  roles: SystemRole[];
  selectedId: string;
  onPick: (id: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-baseline justify-between gap-2 border-b border-slate-100 bg-canvas px-3 py-2">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </span>
        <span className="text-[9px] uppercase tracking-wider text-slate-300">{hint}</span>
      </div>
      <ul>
        {roles.map((r) => {
          const active = r.id === selectedId;
          return (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => onPick(r.id)}
                aria-current={active}
                className={cx(
                  "flex w-full items-center gap-2.5 border-b border-slate-50 px-3 py-2 text-left outline-none transition-colors last:border-0 focus-visible:ring-2 focus-visible:ring-primary/40",
                  active ? "bg-primary/[0.06]" : "hover:bg-canvas",
                )}
              >
                <span className="flex h-7 w-10 shrink-0 items-center justify-center rounded bg-navy/5 font-mono text-[10px] font-bold text-navy">
                  {r.code}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cx("block truncate text-sm font-semibold", active ? "text-primary" : "text-navy")}>
                    {r.name}
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    {r.grants.length} / {ALL_PERMISSION_IDS.size} permissions · acts as {r.actsAs}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RoleDetail({ role }: { role: SystemRole }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <header className="border-b border-slate-100 bg-canvas/60 px-5 py-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <h3 className="text-lg font-bold tracking-tight text-navy">{role.name}</h3>
          <Pill tone="navy" mono>{role.code} · system</Pill>
          <Pill tone={TIER_PILL[role.tier].tone} mono>{TIER_PILL[role.tier].label}</Pill>
          <Pill tone="neutral" mono>acts as {role.actsAs}</Pill>
          <span className="ml-auto text-xs text-slate-400">
            {role.grants.length} of {ALL_PERMISSION_IDS.size} permissions
          </span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{role.description}</p>
      </header>

      <div className="grid grid-cols-1 gap-px bg-slate-100 sm:grid-cols-2">
        {PERMISSION_GROUPS.map((gp) => {
          const granted = gp.permissions.filter((p) => role.grants.includes(p.id)).length;
          return (
            <section key={gp.id} className="bg-white p-4">
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <h4 className="text-xs font-bold text-navy">{gp.label}</h4>
                <span className={cx("font-mono text-[10px]", granted === 0 ? "text-slate-300" : "text-slate-400")}>
                  {granted}/{gp.permissions.length}
                </span>
              </div>
              <ul className="space-y-1">
                {gp.permissions.map((p) => {
                  const on = role.grants.includes(p.id);
                  return (
                    <li key={p.id} className="flex items-center gap-2 px-1 py-0.5 text-xs">
                      <span className={cx("w-3.5 text-center font-bold", on ? "text-success" : "text-slate-200")} aria-hidden>
                        {on ? "✓" : "–"}
                      </span>
                      <span className={on ? "text-slate-600" : "text-slate-300"}>{p.label}</span>
                      {p.risk && on ? (
                        <span className={cx("rounded px-1 py-px font-mono text-[9px] font-semibold", RISK_CHIP[p.risk].cls)}>
                          {RISK_CHIP[p.risk].label}
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function CompareMatrix({ onPick }: { onPick: (id: string) => void }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-200 bg-canvas">
            <th className="px-4 py-3 text-xs font-semibold text-navy">Permission domain</th>
            {SYSTEM_ROLES.map((r) => (
              <th key={r.id} className="border-l border-slate-100 px-2 py-3 text-center">
                <button
                  type="button"
                  onClick={() => onPick(r.id)}
                  className="font-mono text-[10px] font-bold text-navy outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/40"
                  title={`${r.name} — open detail`}
                >
                  {r.code}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERMISSION_GROUPS.map((gp) => (
            <tr key={gp.id} className="border-b border-slate-100 last:border-0">
              <td className="px-4 py-2 text-xs font-medium text-navy">
                {gp.label} <span className="font-mono text-[10px] text-slate-300">/{gp.permissions.length}</span>
              </td>
              {SYSTEM_ROLES.map((r) => {
                const set = new Set(r.grants);
                const n = gp.permissions.filter((p) => set.has(p.id)).length;
                const full = n === gp.permissions.length;
                return (
                  <td
                    key={r.id}
                    className={cx(
                      "border-l border-slate-50 px-2 py-2 text-center font-mono text-[11px] tabular-nums",
                      n === 0 ? "text-slate-200" : full ? "font-bold text-success" : "text-slate-500",
                    )}
                  >
                    {n === 0 ? "–" : n}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr className="bg-canvas/60">
            <td className="px-4 py-2 text-xs font-semibold text-navy">Total</td>
            {SYSTEM_ROLES.map((r) => (
              <td key={r.id} className="border-l border-slate-50 px-2 py-2 text-center font-mono text-[11px] font-bold tabular-nums text-navy">
                {r.grants.length}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <p className="border-t border-slate-100 px-4 py-2 text-[11px] text-slate-400">
        Each cell counts the permissions granted in that domain — click a role code to open its full detail.
      </p>
    </div>
  );
}
