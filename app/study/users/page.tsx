"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { EnvBanner } from "@/components/EnvBanner";
import { Card, PageGuide, PageHeader, Pill, cx } from "@/components/ui";
import { useActiveStudy } from "@/lib/active-study";
import {
  ALL_PERMISSION_IDS,
  PERMISSION_GROUPS,
  SYSTEM_ROLES,
  type PermissionRisk,
  type SystemRole,
} from "@/lib/users-model";
import {
  useAllRoles,
  useLocalStore,
  useMembersOnStudy,
  useStudiesForUser,
  type CustomRole,
} from "@/lib/local-store";
import { STUDIES } from "@/lib/studies";

type AnyRole = SystemRole | CustomRole;

const RISK_CHIP: Record<PermissionRisk, { label: string; cls: string }> = {
  phi: { label: "PHI", cls: "bg-danger/10 text-danger" },
  blinding: { label: "blinding", cls: "bg-warning/10 text-warning" },
  signature: { label: "e-sign", cls: "bg-navy/10 text-navy" },
  destructive: { label: "high risk", cls: "bg-danger/10 text-danger" },
};

const TIER_PILL: Record<AnyRole["tier"], { label: string; tone: "success" | "navy" | "neutral" | "accent" }> = {
  org: { label: "Org tier", tone: "success" },
  study: { label: "Study team", tone: "navy" },
  specialty: { label: "Specialty", tone: "neutral" },
  custom: { label: "Custom", tone: "accent" },
};

export default function UsersAndRolesPage() {
  const study = useActiveStudy();
  const { identity } = study;
  const store = useLocalStore();
  const allRoles = useAllRoles();
  const members = useMembersOnStudy(identity.id);

  const [selectedRoleId, setSelectedRoleId] = useState<string>("SM");
  const [compare, setCompare] = useState(false);
  const [creatingRole, setCreatingRole] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [membershipsFor, setMembershipsFor] = useState<string | null>(null);
  const [editingGrants, setEditingGrants] = useState(false);
  const [grantDraft, setGrantDraft] = useState<Set<string>>(new Set());

  const selectedRole = allRoles.find((r) => r.id === selectedRoleId) ?? allRoles[0];

  const orgRoles = SYSTEM_ROLES.filter((r) => r.tier === "org");
  const studyRoles = SYSTEM_ROLES.filter((r) => r.tier === "study");
  const specialtyRoles = SYSTEM_ROLES.filter((r) => r.tier === "specialty");
  const customRoles = store.state.customRoles;

  const roleOptions = useMemo(
    () =>
      allRoles.map((r) => ({
        value: r.id,
        label: r.tier === "custom" ? `${r.name} (custom)` : `${r.name} (${(r as SystemRole).code})`,
      })),
    [allRoles],
  );

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
            <strong className="font-semibold text-navy">3 specialty</strong> + your custom roles.
            Memberships are per-study (NFR-091).
          </>
        }
        action={<Pill tone="navy" mono>{identity.code}</Pill>}
      />

      <PageGuide eyebrow="How to edit">
        <strong className="font-semibold text-navy">Add a member</strong> with the button on the
        members table. <strong className="font-semibold text-navy">Click &ldquo;manage&rdquo;</strong> on a
        member to grant / change / revoke their role on each study. To make a custom role:{" "}
        <strong className="font-semibold text-navy">duplicate a system role</strong> from the rail
        below, then toggle its grants. All edits persist to localStorage.
      </PageGuide>

      <EnvBanner />

      {/* Members on this study */}
      <Card className="mb-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <h2 className="text-sm font-semibold text-navy">Members · {members.length}</h2>
            <p className="text-xs text-slate-400">Per-study membership rows on {identity.code}.</p>
          </div>
          <button
            type="button"
            onClick={() => setAddingMember(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-white outline-none hover:bg-bright focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Plus size={13} /> Add member
          </button>
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-canvas">
              <tr className="border-b border-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-400">
                <th className="px-3 py-2.5 font-medium">Member</th>
                <th className="px-3 py-2.5 font-medium">Role on this study</th>
                <th className="px-3 py-2.5 font-medium">Tier</th>
                <th className="px-3 py-2.5 font-medium">Acts as</th>
                <th className="px-3 py-2.5 font-medium">Memberships</th>
                <th className="px-3 py-2.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <MemberRow
                  key={m.id}
                  member={m}
                  roleOptions={roleOptions}
                  onChangeRole={(roleId) => store.updateMembershipRole(m.id, identity.id, roleId)}
                  onRemove={() => store.removeMember(m.id)}
                  onManage={() => setMembershipsFor(m.id)}
                  onPickRole={(roleId) => { setSelectedRoleId(roleId); setCompare(false); }}
                />
              ))}
              {members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-sm text-slate-400">
                    No members on this study yet — add one above.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Roles & permissions */}
      <Card>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-navy">
            Roles &amp; permissions · {SYSTEM_ROLES.length} system + {customRoles.length} custom
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
          <CompareMatrix
            roles={allRoles}
            onPick={(id) => { setSelectedRoleId(id); setCompare(false); }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="space-y-3">
              <TierGroup label="Org administration" hint="Above any single study" roles={orgRoles} selectedId={selectedRoleId} onPick={setSelectedRoleId} />
              <TierGroup label="Study team — canonical" hint="PRD #25 §2 roles 4–9" roles={studyRoles} selectedId={selectedRoleId} onPick={setSelectedRoleId} />
              <TierGroup label="Specialty extensions" hint="Prototype additions" roles={specialtyRoles} selectedId={selectedRoleId} onPick={setSelectedRoleId} />
              <CustomRoleRail
                roles={customRoles}
                selectedId={selectedRoleId}
                onPick={setSelectedRoleId}
                onCreate={() => setCreatingRole(true)}
              />
            </div>
            <RoleDetailPanel
              role={selectedRole}
              editingGrants={editingGrants}
              grantDraft={grantDraft}
              onStartEdit={() => {
                setGrantDraft(new Set(selectedRole?.grants ?? []));
                setEditingGrants(true);
              }}
              onCancelEdit={() => setEditingGrants(false)}
              onSaveEdit={() => {
                if (!selectedRole || selectedRole.tier !== "custom") return;
                store.updateCustomRole(selectedRole.id, { grants: [...grantDraft] });
                setEditingGrants(false);
              }}
              onToggleGrant={(permId) => {
                setGrantDraft((prev) => {
                  const next = new Set(prev);
                  if (next.has(permId)) next.delete(permId);
                  else next.add(permId);
                  return next;
                });
              }}
              onDuplicate={() => {
                if (!selectedRole) return;
                const id = store.createCustomRole({
                  name: `${selectedRole.name} (copy)`,
                  description: selectedRole.description,
                  basedOn: selectedRole.id,
                });
                if (id) setSelectedRoleId(id);
              }}
              onDeleteCustom={() => {
                if (selectedRole?.tier !== "custom") return;
                store.deleteCustomRole(selectedRole.id);
                setSelectedRoleId(SYSTEM_ROLES[0].id);
              }}
              onUpdateMeta={(input) => {
                if (selectedRole?.tier !== "custom") return;
                store.updateCustomRole(selectedRole.id, input);
              }}
            />
          </div>
        )}
      </Card>

      {addingMember ? (
        <AddMemberModal
          studyId={identity.id}
          roleOptions={roleOptions}
          onCancel={() => setAddingMember(false)}
          onSubmit={(input) => {
            store.addMember({ ...input, studyId: identity.id });
            setAddingMember(false);
          }}
        />
      ) : null}

      {creatingRole ? (
        <CreateRoleModal
          systemRoles={SYSTEM_ROLES}
          onCancel={() => setCreatingRole(false)}
          onSubmit={(input) => {
            const id = store.createCustomRole(input);
            setCreatingRole(false);
            if (id) setSelectedRoleId(id);
          }}
        />
      ) : null}

      {membershipsFor ? (
        <MembershipsDrawer
          userId={membershipsFor}
          roleOptions={roleOptions}
          onClose={() => setMembershipsFor(null)}
        />
      ) : null}
    </>
  );
}

// ─── Member row ─────────────────────────────────────────────────────────────

function MemberRow({
  member,
  roleOptions,
  onChangeRole,
  onRemove,
  onManage,
  onPickRole,
}: {
  member: ReturnType<typeof useMembersOnStudy>[number];
  roleOptions: Array<{ value: string; label: string }>;
  onChangeRole: (roleId: string) => void;
  onRemove: () => void;
  onManage: () => void;
  onPickRole: (roleId: string) => void;
}) {
  const others = useStudiesForUser(member.id);
  const otherCount = others.length;
  const [confirming, setConfirming] = useState(false);

  return (
    <tr className="border-t border-slate-50">
      <td className="px-3 py-2.5">
        <div className="font-medium text-navy">{member.name}</div>
        <div className="font-mono text-[10px] text-slate-400">{member.email}</div>
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <select
            value={member.roleId}
            onChange={(e) => onChangeRole(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-navy outline-none focus:ring-2 focus:ring-primary/30"
          >
            {roleOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onPickRole(member.roleId)}
            className="text-[11px] font-medium text-slate-400 hover:text-primary"
            title="Open role detail"
          >
            view →
          </button>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <Pill tone={TIER_PILL[member.role.tier].tone} mono>{TIER_PILL[member.role.tier].label}</Pill>
      </td>
      <td className="px-3 py-2.5">
        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
          {member.role.actsAs}
        </span>
      </td>
      <td className="px-3 py-2.5">
        <button
          type="button"
          onClick={onManage}
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] font-semibold text-primary outline-none hover:border-primary/40 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary/40"
          title={`${otherCount} membership${otherCount === 1 ? "" : "s"} total`}
        >
          {otherCount} stud{otherCount === 1 ? "y" : "ies"} · manage
        </button>
      </td>
      <td className="px-3 py-2.5 text-right">
        {confirming ? (
          <span className="inline-flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Remove?</span>
            <button
              type="button"
              onClick={() => { onRemove(); setConfirming(false); }}
              className="rounded-md bg-danger px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-danger/90"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="text-[11px] font-medium text-slate-500 hover:text-navy"
            >
              Cancel
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            aria-label={`Remove ${member.name}`}
            className="rounded-md px-2 py-1 text-xs text-slate-400 outline-none hover:bg-danger/10 hover:text-danger focus-visible:ring-2 focus-visible:ring-danger/30"
          >
            <Trash2 size={13} />
          </button>
        )}
      </td>
    </tr>
  );
}

// ─── Role tier group ───────────────────────────────────────────────────────

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
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</span>
        <span className="text-[9px] uppercase tracking-wider text-slate-300">{hint}</span>
      </div>
      <ul>
        {roles.map((r) => <RoleRailRow key={r.id} role={r} active={r.id === selectedId} onPick={() => onPick(r.id)} />)}
      </ul>
    </div>
  );
}

function CustomRoleRail({
  roles,
  selectedId,
  onPick,
  onCreate,
}: {
  roles: CustomRole[];
  selectedId: string;
  onPick: (id: string) => void;
  onCreate: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-baseline justify-between gap-2 border-b border-slate-100 bg-canvas px-3 py-2">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Custom roles</span>
        <span className="text-[9px] uppercase tracking-wider text-slate-300">Local · localStorage</span>
      </div>
      {roles.length === 0 ? (
        <p className="px-3 py-3 text-xs text-slate-400">None yet — duplicate a system role to make one.</p>
      ) : (
        <ul>
          {roles.map((r) => <RoleRailRow key={r.id} role={r} active={r.id === selectedId} onPick={() => onPick(r.id)} />)}
        </ul>
      )}
      <div className="border-t border-slate-100 p-2">
        <button
          type="button"
          onClick={onCreate}
          className="w-full rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-semibold text-primary outline-none hover:border-primary/50 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          + New custom role
        </button>
      </div>
    </div>
  );
}

function RoleRailRow({ role, active, onPick }: { role: AnyRole; active: boolean; onPick: () => void }) {
  const code = role.tier === "custom" ? "✎" : (role as SystemRole).code;
  return (
    <li>
      <button
        type="button"
        onClick={onPick}
        aria-current={active}
        className={cx(
          "flex w-full items-center gap-2.5 border-b border-slate-50 px-3 py-2 text-left outline-none transition-colors last:border-0 focus-visible:ring-2 focus-visible:ring-primary/40",
          active ? "bg-primary/[0.06]" : "hover:bg-canvas",
        )}
      >
        <span
          className={cx(
            "flex h-7 w-10 shrink-0 items-center justify-center rounded font-mono text-[10px] font-bold",
            role.tier === "custom" ? "bg-accent/15 text-bright" : "bg-navy/5 text-navy",
          )}
        >
          {code}
        </span>
        <span className="min-w-0 flex-1">
          <span className={cx("block truncate text-sm font-semibold", active ? "text-primary" : "text-navy")}>
            {role.name}
          </span>
          <span className="block text-[10px] text-slate-400">
            {role.grants.length} / {ALL_PERMISSION_IDS.size} permissions · acts as {role.actsAs}
          </span>
        </span>
      </button>
    </li>
  );
}

// ─── Role detail (system: read-only · custom: editable) ────────────────────

function RoleDetailPanel({
  role,
  editingGrants,
  grantDraft,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onToggleGrant,
  onDuplicate,
  onDeleteCustom,
  onUpdateMeta,
}: {
  role: AnyRole | undefined;
  editingGrants: boolean;
  grantDraft: Set<string>;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onToggleGrant: (permId: string) => void;
  onDuplicate: () => void;
  onDeleteCustom: () => void;
  onUpdateMeta: (input: { name?: string; description?: string }) => void;
}) {
  const [editingMeta, setEditingMeta] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!role) return null;
  const isCustom = role.tier === "custom";
  const visibleGrants = editingGrants ? grantDraft : new Set(role.grants);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <header className="border-b border-slate-100 bg-canvas/60 px-5 py-4">
        <div className="flex flex-wrap items-center gap-2.5">
          {editingMeta && isCustom ? (
            <input
              defaultValue={role.name}
              onBlur={(e) => { onUpdateMeta({ name: e.target.value }); setEditingMeta(false); }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onUpdateMeta({ name: (e.target as HTMLInputElement).value });
                  setEditingMeta(false);
                }
                if (e.key === "Escape") setEditingMeta(false);
              }}
              autoFocus
              className="flex-1 rounded-lg border border-primary/40 bg-white px-2.5 py-1 text-lg font-bold text-navy outline-none focus:ring-2 focus:ring-primary/30"
            />
          ) : (
            <button
              type="button"
              onClick={() => isCustom && setEditingMeta(true)}
              className={cx("text-left text-lg font-bold tracking-tight text-navy", isCustom && "cursor-text hover:text-primary")}
              disabled={!isCustom}
              title={isCustom ? "Click to rename" : undefined}
            >
              {role.name}
            </button>
          )}
          {role.tier !== "custom" ? (
            <Pill tone="navy" mono>{(role as SystemRole).code} · system</Pill>
          ) : (
            <Pill tone="accent" mono>custom{role.basedOn ? ` · from ${role.basedOn}` : ""}</Pill>
          )}
          <Pill tone={TIER_PILL[role.tier].tone} mono>{TIER_PILL[role.tier].label}</Pill>
          <Pill tone="neutral" mono>acts as {role.actsAs}</Pill>
          <span className="ml-auto text-xs text-slate-400">
            {visibleGrants.size} of {ALL_PERMISSION_IDS.size} permissions
          </span>
        </div>
        {editingMeta && isCustom ? (
          <input
            defaultValue={role.description}
            onBlur={(e) => onUpdateMeta({ description: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") onUpdateMeta({ description: (e.target as HTMLInputElement).value });
            }}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 outline-none focus:ring-2 focus:ring-primary/30"
            aria-label="Role description"
          />
        ) : (
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{role.description}</p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {!isCustom ? (
            <button
              type="button"
              onClick={onDuplicate}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-primary outline-none hover:border-primary/40 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary/40"
              title="System roles are fixed — duplicating creates an editable custom role with the same permissions"
            >
              ⧉ Duplicate to customize
            </button>
          ) : editingGrants ? (
            <>
              <button
                type="button"
                onClick={onSaveEdit}
                className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-white outline-none hover:bg-bright focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Save changes
              </button>
              <button
                type="button"
                onClick={onCancelEdit}
                className="rounded-lg px-3 py-1 text-xs font-medium text-slate-500 hover:text-navy"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onStartEdit}
                className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-white outline-none hover:bg-bright focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Edit permissions
              </button>
              {confirmDelete ? (
                <span className="inline-flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500">Delete &ldquo;{role.name}&rdquo;?</span>
                  <button
                    type="button"
                    onClick={() => { onDeleteCustom(); setConfirmDelete(false); }}
                    className="rounded-lg bg-danger px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-danger/90"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="text-[11px] font-medium text-slate-500 hover:text-navy"
                  >
                    Cancel
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="rounded-lg px-3 py-1 text-xs font-medium text-slate-400 hover:text-danger"
                >
                  Delete role
                </button>
              )}
            </>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-px bg-slate-100 sm:grid-cols-2">
        {PERMISSION_GROUPS.map((gp) => {
          const granted = gp.permissions.filter((p) => visibleGrants.has(p.id)).length;
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
                  const on = visibleGrants.has(p.id);
                  if (editingGrants) {
                    return (
                      <li key={p.id}>
                        <label className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 text-xs hover:bg-canvas">
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() => onToggleGrant(p.id)}
                            className="h-3.5 w-3.5 rounded border-slate-300 accent-primary"
                          />
                          <span className="text-slate-600">{p.label}</span>
                          {p.risk ? (
                            <span className={cx("rounded px-1 py-px font-mono text-[9px] font-semibold", RISK_CHIP[p.risk].cls)}>
                              {RISK_CHIP[p.risk].label}
                            </span>
                          ) : null}
                        </label>
                      </li>
                    );
                  }
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

// ─── Compare matrix ────────────────────────────────────────────────────────

function CompareMatrix({ roles, onPick }: { roles: AnyRole[]; onPick: (id: string) => void }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-200 bg-canvas">
            <th className="px-4 py-3 text-xs font-semibold text-navy">Permission domain</th>
            {roles.map((r) => (
              <th key={r.id} className="border-l border-slate-100 px-2 py-3 text-center">
                <button
                  type="button"
                  onClick={() => onPick(r.id)}
                  className="font-mono text-[10px] font-bold text-navy outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/40"
                  title={`${r.name} — open detail`}
                >
                  {r.tier === "custom" ? r.name.slice(0, 6) : (r as SystemRole).code}
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
              {roles.map((r) => {
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
            {roles.map((r) => (
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

// ─── Add member modal ──────────────────────────────────────────────────────

function AddMemberModal({
  studyId,
  roleOptions,
  onCancel,
  onSubmit,
}: {
  studyId: string;
  roleOptions: Array<{ value: string; label: string }>;
  onCancel: () => void;
  onSubmit: (input: { name: string; email: string; role: string }) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(roleOptions[0]?.value ?? "SM");
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Add member"
      onClick={onCancel}
      onKeyDown={(e) => { if (e.key === "Escape") onCancel(); }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-base font-bold text-navy">Add member</h3>
          <button type="button" onClick={onCancel} className="text-slate-400 hover:text-navy" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <p className="mb-4 text-xs text-slate-500">Adds this person to the current study with the chosen role.</p>
        <label className="mb-3 block text-xs font-semibold text-slate-500">
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-navy outline-none focus:ring-2 focus:ring-primary/30"
            autoFocus
          />
        </label>
        <label className="mb-3 block text-xs font-semibold text-slate-500">
          Email *
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@org.example"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-navy outline-none focus:ring-2 focus:ring-primary/30"
          />
        </label>
        <label className="mb-4 block text-xs font-semibold text-slate-500">
          Role on this study
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-navy outline-none focus:ring-2 focus:ring-primary/30"
          >
            {roleOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-navy"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!valid}
            onClick={() => onSubmit({ name, email, role })}
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white outline-none hover:bg-bright disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Add to {studyId}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Create custom role modal ──────────────────────────────────────────────

function CreateRoleModal({
  systemRoles,
  onCancel,
  onSubmit,
}: {
  systemRoles: SystemRole[];
  onCancel: () => void;
  onSubmit: (input: { name: string; description: string; basedOn: string }) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basedOn, setBasedOn] = useState(systemRoles[0]?.id ?? "SM");
  const base = systemRoles.find((r) => r.id === basedOn);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="New custom role"
      onClick={onCancel}
      onKeyDown={(e) => { if (e.key === "Escape") onCancel(); }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-base font-bold text-navy">New custom role</h3>
          <button type="button" onClick={onCancel} className="text-slate-400 hover:text-navy" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <p className="mb-4 text-xs text-slate-500">Start from a system role — you&apos;ll get its permissions as a baseline, then tune them.</p>
        <label className="mb-3 block text-xs font-semibold text-slate-500">
          Role name *
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            placeholder="e.g. Unblinded Pharmacist"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-navy outline-none focus:ring-2 focus:ring-primary/30"
          />
        </label>
        <label className="mb-3 block text-xs font-semibold text-slate-500">
          Description
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What this role is for"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-navy outline-none focus:ring-2 focus:ring-primary/30"
          />
        </label>
        <label className="mb-4 block text-xs font-semibold text-slate-500">
          Start from
          <select
            value={basedOn}
            onChange={(e) => setBasedOn(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-navy outline-none focus:ring-2 focus:ring-primary/30"
          >
            {systemRoles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.code}) — {r.grants.length} permissions
              </option>
            ))}
          </select>
          {base ? (
            <p className="mt-1.5 text-[11px] text-slate-400">
              Acts as <span className="font-semibold text-slate-500">{base.actsAs}</span> (inherited from {base.name}).
            </p>
          ) : null}
        </label>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-navy"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!name.trim()}
            onClick={() => onSubmit({ name, description, basedOn })}
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white outline-none hover:bg-bright disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Create role
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Memberships drawer (per-user × per-study) ─────────────────────────────

function MembershipsDrawer({
  userId,
  roleOptions,
  onClose,
}: {
  userId: string;
  roleOptions: Array<{ value: string; label: string }>;
  onClose: () => void;
}) {
  const store = useLocalStore();
  const member = store.state.members.find((m) => m.id === userId);
  const memberships = store.state.memberships.filter((m) => m.userId === userId);
  const ownedStudyIds = new Set(memberships.map((m) => m.studyId));
  const availableStudies = STUDIES.filter((s) => !ownedStudyIds.has(s.identity.id));
  const [newStudyId, setNewStudyId] = useState(availableStudies[0]?.identity.id ?? "");
  const [newRoleId, setNewRoleId] = useState(roleOptions[0]?.value ?? "SM");

  if (!member) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-navy/40"
      role="dialog"
      aria-modal="true"
      aria-label={`Memberships for ${member.name}`}
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
    >
      <aside className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <header className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-base font-bold text-navy">{member.name}</h3>
            <button type="button" onClick={onClose} className="rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-canvas hover:text-navy" aria-label="Close">
              <X size={14} />
            </button>
          </div>
          <p className="font-mono text-[11px] text-slate-400">{member.email}</p>
          <p className="mt-2 text-[11px] text-slate-500">
            Per-study memberships (NFR-091). The user&apos;s role on each study is authoritative for
            permissions when they work on that study.
          </p>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          <h4 className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Active memberships · {memberships.length}
          </h4>
          {memberships.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-xs text-slate-400">
              No memberships yet — grant access to a study below.
            </p>
          ) : (
            <ul className="space-y-2">
              {memberships.map((m) => {
                const study = STUDIES.find((s) => s.identity.id === m.studyId);
                return (
                  <li key={m.studyId} className="rounded-xl border border-slate-200 bg-canvas/40 p-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-navy">{study?.identity.name ?? m.studyId}</div>
                        <div className="font-mono text-[10px] text-slate-400">{m.studyId}</div>
                      </div>
                      <Pill tone="navy" mono>{m.roleId}</Pill>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <select
                        value={m.roleId}
                        onChange={(e) => store.updateMembershipRole(m.userId, m.studyId, e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-navy outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        {roleOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <button
                        type="button"
                        onClick={() => store.revokeMembership(m.userId, m.studyId)}
                        className="ml-auto rounded-md px-2 py-1 text-[11px] font-medium text-slate-400 hover:text-danger"
                      >
                        Revoke
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {availableStudies.length > 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-canvas/40 p-3">
              <h4 className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Grant new membership
              </h4>
              <div className="mt-2 grid grid-cols-1 gap-2">
                <label className="block text-[11px] font-semibold text-slate-500">
                  Study
                  <select
                    value={newStudyId}
                    onChange={(e) => setNewStudyId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-navy outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {availableStudies.map((s) => (
                      <option key={s.identity.id} value={s.identity.id}>{s.identity.name}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-[11px] font-semibold text-slate-500">
                  Role
                  <select
                    value={newRoleId}
                    onChange={(e) => setNewRoleId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-navy outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {roleOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => store.grantMembership({ userId: member.id, studyId: newStudyId, roleId: newRoleId })}
                  disabled={!newStudyId}
                  className="h-8 rounded-lg bg-primary px-3 text-xs font-semibold text-white outline-none hover:bg-bright disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  Grant membership
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400">
              {member.name} already has a membership on every known study.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
