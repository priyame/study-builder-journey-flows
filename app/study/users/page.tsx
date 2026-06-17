"use client";

import { useMemo, useState } from "react";
import { EnvBanner } from "@/components/EnvBanner";
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

const RISK_LABEL: Record<PermissionRisk, { label: string; color: string; bg: string }> = {
  phi: { label: "PHI", color: "#b91c1c", bg: "rgba(220,38,38,0.10)" },
  blinding: { label: "blinding", color: "#b45309", bg: "rgba(234,179,8,0.14)" },
  signature: { label: "e-sign", color: "#1e40af", bg: "rgba(37,99,235,0.10)" },
  destructive: { label: "high risk", color: "#b91c1c", bg: "rgba(220,38,38,0.10)" },
};

const TIER_PILL: Record<SystemRole["tier"], { label: string; bg: string; color: string }> = {
  org: { label: "Org tier", bg: "rgba(13,148,136,0.12)", color: "#0d9488" },
  study: { label: "Study team", bg: "rgba(37,99,235,0.10)", color: "#1e40af" },
  specialty: { label: "Specialty", bg: "rgba(100,116,139,0.12)", color: "#475569" },
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
      <div className="page-header">
        <h1>Users &amp; Roles</h1>
        <p className="lede">
          PRD #25 §2 canonical role taxonomy: <strong>3 org-tier</strong> + <strong>6 study-team</strong> + <strong>3 specialty</strong> roles
          built from a 10-group permission catalog. Memberships are <strong>per-study</strong> — one user can hold different roles on
          different studies (NFR-091). Members shown are seated on{" "}
          <strong style={{ color: "var(--accent)" }}>{identity.code}</strong>.
        </p>
        <span className="source-tag">PRD #25 §2 + §14 · scoped to the active study</span>
      </div>

      <EnvBanner />

      {/* ── Members on this study ───────────────────────────────────────── */}
      <div className="card">
        <div className="card-header">
          <h2>Members · {members.length}</h2>
          <span className="sub">Per-study membership rows (NFR-091). Selecting another study via the switcher re-scopes this list.</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 220 }}>Member</th>
                <th style={{ width: 160 }}>Role on this study</th>
                <th style={{ width: 90 }}>Tier</th>
                <th style={{ width: 100 }}>Acts as</th>
                <th>Also seated on</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const others = studiesForUser(m.id).filter((s) => s.studyId !== identity.id);
                return (
                  <tr key={m.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{m.name}</div>
                      <div className="muted" style={{ fontSize: 11, fontFamily: "var(--mono, ui-monospace)" }}>{m.email}</div>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => { setSelectedRoleId(m.roleId); setCompare(false); }}
                        className="code"
                        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "var(--accent)" }}
                      >
                        {m.role.code} · {m.role.name}
                      </button>
                    </td>
                    <td>
                      <TierPill tier={m.role.tier} />
                    </td>
                    <td><span className="code" style={{ fontSize: 11 }}>{m.role.actsAs}</span></td>
                    <td>
                      {others.length === 0 ? (
                        <span className="muted" style={{ fontSize: 12 }}>—</span>
                      ) : (
                        <span style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {others.map((o) => {
                            const study = STUDIES.find((s) => s.identity.id === o.studyId);
                            return (
                              <span key={o.studyId} className="code" style={{ fontSize: 10, padding: "1px 6px", background: "var(--surface, #f1f5f9)", borderRadius: 4 }}>
                                {study?.identity.code ?? o.studyId} · {o.roleId}
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
      </div>

      <div style={{ height: 24 }} />

      {/* ── Roles & permissions ─────────────────────────────────────────── */}
      <div className="card">
        <div className="card-header">
          <h2>Roles &amp; permissions · {SYSTEM_ROLES.length} system roles</h2>
          <span className="sub">3 tiers per PRD #25 §2. Each row clickable to inspect grants.</span>
          <div style={{ marginLeft: "auto" }}>
            <button className="btn btn-sm" onClick={() => setCompare((v) => !v)}>
              {compare ? "◫ Per-role detail" : "▦ Compare all roles"}
            </button>
          </div>
        </div>
        <div className="card-body">
          {compare ? (
            <CompareMatrix onPick={(id) => { setSelectedRoleId(id); setCompare(false); }} />
          ) : (
            <div className="grid-2" style={{ gap: 16, alignItems: "flex-start" }}>
              <div>
                <TierGroup label="Org administration" hint="Above any single study" roles={orgRoles} selectedId={selectedRoleId} onPick={setSelectedRoleId} />
                <TierGroup label="Study team — canonical" hint="PRD #25 §2 roles 4–9" roles={studyRoles} selectedId={selectedRoleId} onPick={setSelectedRoleId} />
                <TierGroup label="Specialty extensions" hint="Prototype additions" roles={specialtyRoles} selectedId={selectedRoleId} onPick={setSelectedRoleId} />
              </div>
              <RoleDetail role={selectedRole} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function TierPill({ tier }: { tier: SystemRole["tier"] }) {
  const p = TIER_PILL[tier];
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 10,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 4,
        background: p.bg,
        color: p.color,
      }}
    >
      {p.label}
    </span>
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
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted, #64748b)" }}>{label}</span>
        <span className="muted" style={{ fontSize: 10 }}>{hint}</span>
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, border: "1px solid var(--border, #e2e8f0)", borderRadius: 8, overflow: "hidden" }}>
        {roles.map((r) => {
          const active = r.id === selectedId;
          return (
            <li key={r.id} style={{ borderBottom: "1px solid var(--border, #e2e8f0)" }}>
              <button
                type="button"
                onClick={() => onPick(r.id)}
                aria-current={active}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 12px",
                  background: active ? "rgba(37,99,235,0.06)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <span className="code" style={{ fontSize: 10, fontWeight: 700, width: 40, textAlign: "center" }}>{r.code}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: active ? "var(--accent)" : "inherit" }}>{r.name}</span>
                  <span className="muted" style={{ fontSize: 10 }}>{r.grants.length} / {ALL_PERMISSION_IDS.size} permissions · acts as {r.actsAs}</span>
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
    <div style={{ border: "1px solid var(--border, #e2e8f0)", borderRadius: 12, overflow: "hidden" }}>
      <header style={{ padding: 16, borderBottom: "1px solid var(--border, #e2e8f0)", background: "var(--surface, #f8fafc)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>{role.name}</h3>
          <span className="code" style={{ fontSize: 11 }}>{role.code} · system</span>
          <TierPill tier={role.tier} />
          <span className="code" style={{ fontSize: 11 }}>acts as {role.actsAs}</span>
          <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--muted, #64748b)" }}>
            {role.grants.length} / {ALL_PERMISSION_IDS.size} permissions
          </span>
        </div>
        <p style={{ margin: "6px 0 0", fontSize: 12, lineHeight: 1.55, color: "var(--muted, #64748b)" }}>{role.description}</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--border, #e2e8f0)" }}>
        {PERMISSION_GROUPS.map((gp) => {
          const granted = gp.permissions.filter((p) => role.grants.includes(p.id));
          return (
            <section key={gp.id} style={{ background: "white", padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <h4 style={{ margin: 0, fontSize: 11, fontWeight: 700 }}>{gp.label}</h4>
                <span className="code" style={{ fontSize: 10, color: granted.length === 0 ? "#cbd5e1" : "var(--muted, #64748b)" }}>
                  {granted.length}/{gp.permissions.length}
                </span>
              </div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, fontSize: 11, lineHeight: 1.5 }}>
                {gp.permissions.map((p) => {
                  const on = role.grants.includes(p.id);
                  return (
                    <li key={p.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 12, color: on ? "#0d9488" : "#cbd5e1", textAlign: "center", fontWeight: 700 }}>
                        {on ? "✓" : "–"}
                      </span>
                      <span style={{ color: on ? "inherit" : "#cbd5e1" }}>{p.label}</span>
                      {p.risk && on ? (
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            padding: "1px 5px",
                            borderRadius: 3,
                            background: RISK_LABEL[p.risk].bg,
                            color: RISK_LABEL[p.risk].color,
                          }}
                        >
                          {RISK_LABEL[p.risk].label}
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
    <div style={{ overflowX: "auto" }}>
      <table className="table">
        <thead>
          <tr>
            <th style={{ minWidth: 200 }}>Permission domain</th>
            {SYSTEM_ROLES.map((r) => (
              <th key={r.id} style={{ textAlign: "center", minWidth: 56 }}>
                <button
                  type="button"
                  onClick={() => onPick(r.id)}
                  className="code"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontWeight: 700 }}
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
            <tr key={gp.id}>
              <td style={{ fontSize: 12, fontWeight: 600 }}>
                {gp.label} <span className="muted" style={{ fontSize: 11 }}>/ {gp.permissions.length}</span>
              </td>
              {SYSTEM_ROLES.map((r) => {
                const grantSet = new Set(r.grants);
                const n = gp.permissions.filter((p) => grantSet.has(p.id)).length;
                const full = n === gp.permissions.length;
                return (
                  <td key={r.id} style={{ textAlign: "center", fontSize: 11, color: n === 0 ? "#cbd5e1" : full ? "#0d9488" : "var(--muted, #64748b)", fontWeight: full ? 700 : 400 }}>
                    {n === 0 ? "–" : n}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr style={{ borderTop: "2px solid var(--border, #e2e8f0)" }}>
            <td style={{ fontSize: 12, fontWeight: 700 }}>Total</td>
            {SYSTEM_ROLES.map((r) => (
              <td key={r.id} style={{ textAlign: "center", fontSize: 11, fontWeight: 700 }}>{r.grants.length}</td>
            ))}
          </tr>
        </tbody>
      </table>
      <p className="muted" style={{ fontSize: 11, marginTop: 8 }}>Each cell counts the permissions granted in that domain — click a role code to open its full detail.</p>
    </div>
  );
}
