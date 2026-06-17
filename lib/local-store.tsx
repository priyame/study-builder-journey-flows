"use client";

// Client-side editable state for the sketch app. localStorage-backed so edits
// survive refreshes without a backend. Seeds from `users-model.ts` and
// `settings-model.ts` on first load.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ALL_PERMISSION_IDS,
  MEMBERS as SEED_MEMBERS,
  MEMBERSHIPS as SEED_MEMBERSHIPS,
  SYSTEM_ROLES,
  type Member,
  type Membership,
  type PlatformAuthority,
  type SystemRole,
} from "./users-model";
import { HUB_SECTIONS, type HubSection, type SectionStatus } from "./settings-model";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface CustomRole {
  id: string;
  name: string;
  description: string;
  basedOn: string;
  actsAs: PlatformAuthority;
  tier: "custom";
  grants: string[];
}

/** Per-section overrides on top of the HUB_SECTIONS seed. */
export interface SectionOverride {
  status?: SectionStatus;
  /** Extra role ids that get the editPerm beyond what their SYSTEM_ROLE grants. */
  extraEditors?: string[];
  /** Role ids whose normal editPerm is revoked for this section. */
  revokedEditors?: string[];
}

interface LocalState {
  members: Member[];
  memberships: Membership[];
  customRoles: CustomRole[];
  sectionOverrides: Record<string, SectionOverride>;
  /** Bumps whenever the store is touched — useful for keys / cache busting. */
  version: number;
}

const SEED_STATE: LocalState = {
  members: SEED_MEMBERS.map((m) => ({ ...m })),
  memberships: SEED_MEMBERSHIPS.map((m) => ({ ...m })),
  customRoles: [],
  sectionOverrides: {},
  version: 1,
};

const STORAGE_KEY = "sbjf-local-store/v1";

function loadFromStorage(): LocalState {
  if (typeof window === "undefined") return SEED_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_STATE;
    const parsed = JSON.parse(raw) as Partial<LocalState>;
    return {
      members: parsed.members ?? SEED_STATE.members,
      memberships: parsed.memberships ?? SEED_STATE.memberships,
      customRoles: parsed.customRoles ?? SEED_STATE.customRoles,
      sectionOverrides: parsed.sectionOverrides ?? SEED_STATE.sectionOverrides,
      version: parsed.version ?? SEED_STATE.version,
    };
  } catch {
    return SEED_STATE;
  }
}

function persist(state: LocalState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota errors */
  }
}

// ─── Store interface ───────────────────────────────────────────────────────

export interface LocalStore {
  state: LocalState;
  /** Whether the user has any local edits (state diverges from seed). */
  isDirty: boolean;
  reset: () => void;

  // Members
  addMember: (input: { name: string; email: string; role: string; studyId: string }) => string;
  removeMember: (id: string) => void;
  setMemberPrimaryRole: (id: string, role: string) => void;

  // Memberships (user × study)
  grantMembership: (input: { userId: string; studyId: string; roleId: string }) => void;
  updateMembershipRole: (userId: string, studyId: string, roleId: string) => void;
  revokeMembership: (userId: string, studyId: string) => void;

  // Custom roles
  createCustomRole: (input: { name: string; description: string; basedOn: string }) => string;
  updateCustomRole: (id: string, input: { description?: string; grants?: string[]; name?: string }) => void;
  deleteCustomRole: (id: string) => void;

  // Settings section overrides
  setSectionStatus: (sectionId: string, status: SectionStatus) => void;
  toggleSectionExtraEditor: (sectionId: string, roleId: string) => void;
  toggleSectionRevokedEditor: (sectionId: string, roleId: string) => void;
  resetSectionOverrides: (sectionId: string) => void;
}

const LocalStoreContext = createContext<LocalStore | null>(null);

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function LocalStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LocalState>(SEED_STATE);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage after mount (SSR safety).
  useEffect(() => {
    setState(loadFromStorage());
    setHydrated(true);
  }, []);

  // Persist on every change after hydration.
  useEffect(() => {
    if (!hydrated) return;
    persist(state);
  }, [state, hydrated]);

  const bumpVersion = (s: LocalState): LocalState => ({ ...s, version: s.version + 1 });

  const reset = useCallback(() => {
    const seed: LocalState = {
      members: SEED_MEMBERS.map((m) => ({ ...m })),
      memberships: SEED_MEMBERSHIPS.map((m) => ({ ...m })),
      customRoles: [],
      sectionOverrides: {},
      version: state.version + 1,
    };
    setState(seed);
  }, [state.version]);

  const addMember: LocalStore["addMember"] = useCallback((input) => {
    const id = nextId("u");
    const member: Member = { id, name: input.name.trim() || input.email, email: input.email.trim() };
    const membership: Membership = {
      userId: id,
      studyId: input.studyId,
      roleId: input.role,
      addedAt: new Date().toISOString(),
    };
    setState((s) => bumpVersion({
      ...s,
      members: [...s.members, member],
      memberships: [...s.memberships, membership],
    }));
    return id;
  }, []);

  const removeMember: LocalStore["removeMember"] = useCallback((id) => {
    setState((s) => bumpVersion({
      ...s,
      members: s.members.filter((m) => m.id !== id),
      memberships: s.memberships.filter((m) => m.userId !== id),
    }));
  }, []);

  const setMemberPrimaryRole: LocalStore["setMemberPrimaryRole"] = useCallback((id, role) => {
    // Primary role lives in users-model.ts but here we mirror via the first
    // membership the user has — there's no separate "primary" field on Member.
    // The display in our UI uses the first membership; updating any membership
    // changes the visible "Role on this study" for that study.
    // (No-op in this minimal store; left for parity with future schemas.)
    void id;
    void role;
  }, []);

  const grantMembership: LocalStore["grantMembership"] = useCallback(({ userId, studyId, roleId }) => {
    setState((s) => {
      if (s.memberships.some((m) => m.userId === userId && m.studyId === studyId)) return s;
      return bumpVersion({
        ...s,
        memberships: [
          ...s.memberships,
          { userId, studyId, roleId, addedAt: new Date().toISOString() },
        ],
      });
    });
  }, []);

  const updateMembershipRole: LocalStore["updateMembershipRole"] = useCallback(
    (userId, studyId, roleId) => {
      setState((s) => bumpVersion({
        ...s,
        memberships: s.memberships.map((m) =>
          m.userId === userId && m.studyId === studyId ? { ...m, roleId } : m,
        ),
      }));
    },
    [],
  );

  const revokeMembership: LocalStore["revokeMembership"] = useCallback((userId, studyId) => {
    setState((s) => bumpVersion({
      ...s,
      memberships: s.memberships.filter((m) => !(m.userId === userId && m.studyId === studyId)),
    }));
  }, []);

  const createCustomRole: LocalStore["createCustomRole"] = useCallback((input) => {
    const base = SYSTEM_ROLES.find((r) => r.id === input.basedOn);
    if (!base) return "";
    const id = nextId("role");
    const role: CustomRole = {
      id,
      name: input.name.trim(),
      description: input.description.trim() || `Custom role based on ${base.name}.`,
      basedOn: base.id,
      actsAs: base.actsAs,
      tier: "custom",
      grants: [...base.grants],
    };
    setState((s) => bumpVersion({ ...s, customRoles: [...s.customRoles, role] }));
    return id;
  }, []);

  const updateCustomRole: LocalStore["updateCustomRole"] = useCallback((id, input) => {
    setState((s) => bumpVersion({
      ...s,
      customRoles: s.customRoles.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          ...(input.name !== undefined ? { name: input.name.trim() } : {}),
          ...(input.description !== undefined ? { description: input.description.trim() } : {}),
          ...(input.grants !== undefined
            ? { grants: input.grants.filter((g) => ALL_PERMISSION_IDS.has(g)) }
            : {}),
        };
      }),
    }));
  }, []);

  const deleteCustomRole: LocalStore["deleteCustomRole"] = useCallback((id) => {
    setState((s) => bumpVersion({
      ...s,
      customRoles: s.customRoles.filter((r) => r.id !== id),
      memberships: s.memberships.filter((m) => m.roleId !== id),
    }));
  }, []);

  const setSectionStatus: LocalStore["setSectionStatus"] = useCallback((sectionId, status) => {
    setState((s) => bumpVersion({
      ...s,
      sectionOverrides: {
        ...s.sectionOverrides,
        [sectionId]: { ...(s.sectionOverrides[sectionId] ?? {}), status },
      },
    }));
  }, []);

  const toggleSectionExtraEditor: LocalStore["toggleSectionExtraEditor"] = useCallback(
    (sectionId, roleId) => {
      setState((s) => {
        const ov = s.sectionOverrides[sectionId] ?? {};
        const extra = new Set(ov.extraEditors ?? []);
        if (extra.has(roleId)) extra.delete(roleId);
        else extra.add(roleId);
        return bumpVersion({
          ...s,
          sectionOverrides: {
            ...s.sectionOverrides,
            [sectionId]: { ...ov, extraEditors: [...extra] },
          },
        });
      });
    },
    [],
  );

  const toggleSectionRevokedEditor: LocalStore["toggleSectionRevokedEditor"] = useCallback(
    (sectionId, roleId) => {
      setState((s) => {
        const ov = s.sectionOverrides[sectionId] ?? {};
        const revoked = new Set(ov.revokedEditors ?? []);
        if (revoked.has(roleId)) revoked.delete(roleId);
        else revoked.add(roleId);
        return bumpVersion({
          ...s,
          sectionOverrides: {
            ...s.sectionOverrides,
            [sectionId]: { ...ov, revokedEditors: [...revoked] },
          },
        });
      });
    },
    [],
  );

  const resetSectionOverrides: LocalStore["resetSectionOverrides"] = useCallback((sectionId) => {
    setState((s) => {
      const next = { ...s.sectionOverrides };
      delete next[sectionId];
      return bumpVersion({ ...s, sectionOverrides: next });
    });
  }, []);

  // ── Dirty detection ─────────────────────────────────────────────────────
  const isDirty = useMemo(() => {
    if (!hydrated) return false;
    if (state.customRoles.length > 0) return true;
    if (Object.keys(state.sectionOverrides).length > 0) return true;
    if (state.members.length !== SEED_MEMBERS.length) return true;
    if (state.memberships.length !== SEED_MEMBERSHIPS.length) return true;
    // Cheap deep compare via JSON — small datasets.
    if (JSON.stringify(state.members) !== JSON.stringify(SEED_MEMBERS)) return true;
    if (JSON.stringify(state.memberships) !== JSON.stringify(SEED_MEMBERSHIPS)) return true;
    return false;
  }, [hydrated, state]);

  const store: LocalStore = {
    state,
    isDirty,
    reset,
    addMember,
    removeMember,
    setMemberPrimaryRole,
    grantMembership,
    updateMembershipRole,
    revokeMembership,
    createCustomRole,
    updateCustomRole,
    deleteCustomRole,
    setSectionStatus,
    toggleSectionExtraEditor,
    toggleSectionRevokedEditor,
    resetSectionOverrides,
  };

  return <LocalStoreContext.Provider value={store}>{children}</LocalStoreContext.Provider>;
}

export function useLocalStore(): LocalStore {
  const ctx = useContext(LocalStoreContext);
  if (!ctx) throw new Error("useLocalStore must be used within <LocalStoreProvider>");
  return ctx;
}

// ─── Derived selectors (read helpers) ──────────────────────────────────────

/** Combined system + custom roles (custom roles always live in store; system
 *  roles are static seed). */
export function useAllRoles(): Array<SystemRole | CustomRole> {
  const { state } = useLocalStore();
  return useMemo(() => [...SYSTEM_ROLES, ...state.customRoles], [state.customRoles]);
}

export function useRole(roleId: string): SystemRole | CustomRole | null {
  const all = useAllRoles();
  return useMemo(() => all.find((r) => r.id === roleId) ?? null, [all, roleId]);
}

export interface MemberOnStudy extends Member {
  roleId: string;
  role: SystemRole | CustomRole;
}

export function useMembersOnStudy(studyId: string): MemberOnStudy[] {
  const { state } = useLocalStore();
  const allRoles = useAllRoles();
  return useMemo(() => {
    return state.memberships
      .filter((m) => m.studyId === studyId)
      .flatMap((m) => {
        const member = state.members.find((x) => x.id === m.userId);
        const role = allRoles.find((r) => r.id === m.roleId);
        return member && role ? [{ ...member, roleId: m.roleId, role }] : [];
      });
  }, [state.memberships, state.members, allRoles, studyId]);
}

export function useStudiesForUser(userId: string): Array<{ studyId: string; roleId: string }> {
  const { state } = useLocalStore();
  return useMemo(
    () => state.memberships.filter((m) => m.userId === userId).map((m) => ({ studyId: m.studyId, roleId: m.roleId })),
    [state.memberships, userId],
  );
}

/** Section access for a Settings Hub section, taking overrides into account. */
export function useSectionAccess(section: HubSection): {
  status: SectionStatus;
  editors: Array<SystemRole | CustomRole>;
} {
  const { state } = useLocalStore();
  const allRoles = useAllRoles();
  const override = state.sectionOverrides[section.id] ?? {};
  const baseEditors = allRoles.filter((r) => r.grants.includes(section.editPerm));
  const extraIds = new Set(override.extraEditors ?? []);
  const revokedIds = new Set(override.revokedEditors ?? []);

  const editors = [
    ...baseEditors.filter((r) => !revokedIds.has(r.id)),
    ...allRoles.filter((r) => extraIds.has(r.id) && !baseEditors.some((b) => b.id === r.id)),
  ];

  return {
    status: override.status ?? section.status,
    editors,
  };
}

export { HUB_SECTIONS };
