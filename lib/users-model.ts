// Users & Roles model — the PRD #25 §2 canonical role taxonomy plus the
// permission catalog the prototype demos against. Read-only data; no runtime
// mutation. Mirrors apps/web/lib/users-runtime.ts in TalOSSurvey but trimmed
// for browse-only use here.

export type PermissionRisk = "phi" | "blinding" | "signature" | "destructive";

export interface Permission {
  id: string;
  label: string;
  risk?: PermissionRisk;
}

export interface PermissionGroup {
  id: string;
  label: string;
  permissions: Permission[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: "org",
    label: "Org administration",
    permissions: [
      { id: "org:manage", label: "Manage organization settings" },
      { id: "org:branding", label: "Customize branding" },
      { id: "org:idp", label: "Configure SSO / IdP", risk: "signature" },
      { id: "study:create", label: "Create a new study" },
      { id: "study:archive", label: "Archive a study", risk: "destructive" },
      { id: "member:invite", label: "Invite members" },
      { id: "member:remove", label: "Remove members" },
      { id: "roles:create-custom", label: "Create & edit custom roles" },
      { id: "billing:view", label: "View billing" },
      { id: "billing:manage", label: "Manage billing" },
      { id: "audit:export-org", label: "Export org-wide audit logs" },
    ],
  },
  {
    id: "study",
    label: "Study & sites",
    permissions: [
      { id: "study:view", label: "View study" },
      { id: "study:manage", label: "Manage study design" },
      { id: "survey:publish", label: "Publish design version (e-signed)", risk: "signature" },
      { id: "ecrf:view", label: "View eCRFs" },
      { id: "ecrf:manage", label: "Manage eCRFs" },
      { id: "site:manage", label: "Manage sites" },
      { id: "user:manage", label: "Manage users & roles" },
      { id: "study:signoff", label: "Sign off study", risk: "signature" },
      { id: "study:pi-signoff", label: "PI sign-off", risk: "signature" },
      { id: "study:db-signoff", label: "Sign off database version", risk: "signature" },
    ],
  },
  {
    id: "settings",
    label: "Study settings hub (PRD #25 §3)",
    permissions: [
      { id: "settings:general", label: "General settings" },
      { id: "settings:screening", label: "Screening & eligibility" },
      { id: "settings:enrollment", label: "Enrollment definition & milestones" },
      { id: "settings:flags", label: "Feature flags" },
      { id: "settings:data-storage", label: "Data & storage" },
      { id: "settings:notifications", label: "Notifications & alerts" },
      { id: "settings:regulatory", label: "Regulatory & compliance" },
      { id: "settings:blinding", label: "Blinding (Phase 2 reserved)", risk: "blinding" },
    ],
  },
  {
    id: "patients",
    label: "Patients & data",
    permissions: [
      { id: "patient:view", label: "View patients & forms" },
      { id: "patient:manage", label: "Enter & correct patient data" },
      { id: "patient:monitor", label: "Monitor / SDV" },
      { id: "patient:disposition", label: "Manage disposition" },
      { id: "patient:summary", label: "View monitoring summary" },
    ],
  },
  {
    id: "queries",
    label: "Queries",
    permissions: [
      { id: "query:raise", label: "Raise queries" },
      { id: "query:answer", label: "Answer queries" },
      { id: "query:view-all", label: "View all queries" },
      { id: "query:close", label: "Approve & close queries" },
    ],
  },
  {
    id: "consent",
    label: "Informed consent",
    permissions: [
      { id: "consent:settings", label: "Consent settings" },
      { id: "consent:download", label: "Download consent records", risk: "phi" },
    ],
  },
  {
    id: "randomization",
    label: "Randomization & blinding",
    permissions: [
      { id: "rand:settings", label: "Randomization settings" },
      { id: "rand:randomize", label: "Randomize treatment" },
      { id: "rand:unblind-included", label: "Included in unblinding", risk: "blinding" },
      { id: "rand:unblind-approve", label: "Approve unblinding", risk: "blinding" },
    ],
  },
  {
    id: "export",
    label: "Export & import",
    permissions: [
      { id: "export:phi", label: "Export PHI", risk: "phi" },
      { id: "export:deid", label: "Export de-identified data" },
      { id: "export:site", label: "Export site data" },
      { id: "import:data", label: "Import data" },
      { id: "export:phi-approve", label: "Approve PHI downloads", risk: "phi" },
    ],
  },
  {
    id: "locks",
    label: "Locks & freezes",
    permissions: [
      { id: "lock:freeze", label: "Freeze database" },
      { id: "lock:unfreeze", label: "Unfreeze database" },
      { id: "lock:hard", label: "Hard-lock database", risk: "destructive" },
    ],
  },
  {
    id: "oversight",
    label: "Oversight & logs",
    permissions: [
      { id: "log:audit", label: "View audit logs" },
      { id: "doa:view", label: "View delegation log" },
      { id: "doa:sign", label: "Sign assigned delegation", risk: "signature" },
    ],
  },
];

export const ALL_PERMISSION_IDS = new Set(
  PERMISSION_GROUPS.flatMap((gp) => gp.permissions.map((p) => p.id)),
);

// ─── System roles (PRD #25 §2 canonical taxonomy) ────────────────────────────

export type PlatformAuthority = "Admin" | "Author" | "Reviewer" | "DataEntry" | "Viewer";
export type RoleTier = "org" | "study" | "specialty";

export interface SystemRole {
  id: string;
  code: string;
  name: string;
  description: string;
  /** What the kernel enforces (5 platform authorities). */
  actsAs: PlatformAuthority;
  /** PRD #25 §2 tier. Org tier operates above any single study. */
  tier: RoleTier;
  grants: string[];
}

export const SYSTEM_ROLES: SystemRole[] = [
  // ── Org tier (PRD #25 §2 canonical 1–3) ─────────────────────────────────
  {
    id: "TA",
    code: "TA",
    name: "Talosix Admin",
    actsAs: "Admin",
    tier: "org",
    description:
      "Talosix platform operator. Sole holder of `survey:publish` in R1.0 (non-delegable). Operates across customer orgs for platform-level configuration; never sees PHI by default.",
    grants: [
      "org:manage", "org:branding", "org:idp",
      "study:create", "study:archive",
      "member:invite", "member:remove", "roles:create-custom",
      "billing:view", "billing:manage", "audit:export-org",
      "study:view", "study:manage", "survey:publish",
      "study:signoff", "study:db-signoff",
      "settings:general", "settings:screening", "settings:enrollment",
      "settings:flags", "settings:data-storage", "settings:notifications", "settings:regulatory",
      "log:audit",
    ],
  },
  {
    id: "AM",
    code: "AM",
    name: "Account Manager",
    actsAs: "Admin",
    tier: "org",
    description:
      "Customer-side multi-study Admin (sponsor org). Creates and configures studies across the org's portfolio; invites members; sees billing for the owning org. Cannot publish design versions in R1.0.",
    grants: [
      "org:manage", "org:branding",
      "study:create", "study:archive",
      "member:invite", "member:remove", "roles:create-custom",
      "billing:view", "billing:manage", "audit:export-org",
      "study:view", "study:manage",
      "ecrf:view", "ecrf:manage", "site:manage", "user:manage",
      "study:signoff",
      "settings:general", "settings:screening", "settings:enrollment",
      "settings:flags", "settings:data-storage", "settings:notifications", "settings:regulatory",
      "patient:view", "patient:summary",
      "query:raise", "query:answer", "query:view-all", "query:close",
      "consent:settings", "consent:download",
      "rand:settings", "rand:randomize",
      "export:phi", "export:deid", "export:site",
    ],
  },
  {
    id: "CRO",
    code: "CRO",
    name: "CRO Admin",
    actsAs: "Admin",
    tier: "org",
    description:
      "CRO-side multi-study Admin (operating org). Creates and configures studies on behalf of sponsor customers; cannot transfer or claim ownership. Cannot publish design versions in R1.0.",
    grants: [
      "org:branding",
      "study:create",
      "member:invite", "member:remove", "roles:create-custom",
      "billing:view",
      "study:view", "study:manage",
      "ecrf:view", "ecrf:manage", "site:manage", "user:manage",
      "study:signoff",
      "settings:general", "settings:screening", "settings:enrollment",
      "settings:flags", "settings:data-storage", "settings:notifications", "settings:regulatory",
      "patient:view", "patient:manage", "patient:monitor", "patient:summary",
      "query:raise", "query:answer", "query:view-all", "query:close",
      "consent:settings",
      "rand:settings", "rand:randomize", "rand:unblind-approve",
      "export:deid", "export:site",
    ],
  },
  // ── Study-team canonical roles (PRD #25 §2 canonical 4–9) ───────────────
  {
    id: "SM",
    code: "SM",
    name: "Study Manager",
    actsAs: "Admin",
    tier: "study",
    description:
      "Runs the study day-to-day: design, sites, users, consent, exports, oversight. Holds the day-to-day Settings Hub editing authority for non-org sections.",
    grants: [
      "member:invite", "roles:create-custom",
      "study:view", "study:manage", "ecrf:view", "ecrf:manage",
      "site:manage", "user:manage", "study:signoff",
      "settings:general", "settings:screening", "settings:enrollment",
      "settings:flags", "settings:data-storage", "settings:notifications", "settings:regulatory",
      "patient:view", "patient:manage", "patient:monitor", "patient:disposition", "patient:summary",
      "query:raise", "query:answer", "query:view-all", "query:close",
      "consent:settings", "consent:download",
      "rand:settings", "rand:randomize", "rand:unblind-approve",
      "export:phi", "export:deid", "export:site", "import:data", "export:phi-approve",
      "lock:freeze", "lock:unfreeze",
      "log:audit", "doa:view",
    ],
  },
  {
    id: "DM",
    code: "DM",
    name: "Data Manager",
    actsAs: "Author",
    tier: "study",
    description:
      "Owns data quality: eCRF design, the query lifecycle, medical coding, imports, locks, and the database-version sign-off. Reads the Settings Hub; edits the data-management section.",
    grants: [
      "study:view", "ecrf:view", "ecrf:manage", "study:db-signoff",
      "settings:data-storage",
      "patient:view", "patient:summary",
      "query:raise", "query:answer", "query:view-all", "query:close",
      "export:deid", "export:site", "import:data",
      "lock:freeze", "lock:unfreeze", "lock:hard",
      "log:audit",
    ],
  },
  {
    id: "IC",
    code: "IC",
    name: "Sponsor",
    actsAs: "Viewer",
    tier: "study",
    description:
      "Sponsor oversight: dashboards, de-identified exports, the query stream — never PHI. Aligned to PRD #25 §2 canonical role 6 (Programmer / Auditor / Business).",
    grants: ["study:view", "ecrf:view", "patient:summary", "query:view-all", "export:deid"],
  },
  {
    id: "SDE",
    code: "SDE",
    name: "Site Data Entry Staff",
    actsAs: "DataEntry",
    tier: "study",
    description:
      "Site staff who capture data (CRC / Data Entry): enter and correct patient forms; answer queries raised on them. No signature authority — that lives with the PI. Aligned to PRD #25 §2 canonical role 7.",
    grants: [
      "study:view", "ecrf:view",
      "patient:view", "patient:manage", "patient:disposition",
      "query:answer",
    ],
  },
  {
    id: "PI",
    code: "PI",
    name: "Principal Investigator",
    actsAs: "Reviewer",
    tier: "study",
    description:
      "The site's responsible physician: enters and corrects their patients' data, answers queries, and carries the PI signatures (forms, DoA, protocol review).",
    grants: [
      "study:view", "ecrf:view", "study:pi-signoff",
      "patient:view", "patient:manage", "patient:disposition",
      "query:raise", "query:answer",
      "consent:download",
      "rand:randomize", "rand:unblind-included",
      "doa:sign",
    ],
  },
  {
    id: "CRA",
    code: "CRA",
    name: "Clinical Research Associate",
    actsAs: "Reviewer",
    tier: "study",
    description:
      "The monitor: source-verifies patient data, raises queries, reviews site documentation. No data entry.",
    grants: [
      "study:view", "ecrf:view",
      "patient:view", "patient:monitor", "patient:summary",
      "query:raise", "query:view-all",
      "export:site",
      "doa:view",
    ],
  },
  // ── Specialty extensions (prototype additions beyond PRD #25 §2 canonical) ─
  {
    id: "SAM",
    code: "SAM",
    name: "Safety Manager",
    actsAs: "Reviewer",
    tier: "specialty",
    description:
      "Pharmacovigilance: works SAE workflows, can approve an unblinding when safety requires it. Specialty extension — not in PRD #25 §2 canonical list.",
    grants: [
      "study:view", "ecrf:view",
      "patient:view", "patient:summary",
      "query:raise", "query:answer", "query:view-all",
      "rand:unblind-included", "rand:unblind-approve",
    ],
  },
  {
    id: "ADJ",
    code: "ADJ",
    name: "Adjudicator",
    actsAs: "Reviewer",
    tier: "specialty",
    description:
      "Endpoint adjudication committee member: reviews assigned cases and signs adjudication assessments. Sees only what's assigned.",
    grants: ["study:view", "patient:view"],
  },
  {
    id: "PN",
    code: "PN",
    name: "Partner",
    actsAs: "Viewer",
    tier: "specialty",
    description:
      "External collaborator with a narrow window: study overview and shared documents only.",
    grants: ["study:view"],
  },
];

// ─── Members + per-study memberships ────────────────────────────────────────

export interface Member {
  id: string;
  name: string;
  email: string;
}

export interface Membership {
  userId: string;
  studyId: string;
  roleId: string;
  addedAt: string;
}

export const MEMBERS: Member[] = [
  // Org-tier members
  { id: "u-ta", name: "Tasha Operator", email: "t.operator@talosix.com" },
  { id: "u-am", name: "Morgan Anderson", email: "m.anderson@acme-tx.example" },
  { id: "u-cro", name: "Jordan Calderón", email: "j.calderon@cro-ops.example" },
  // Study-team members
  { id: "u-sm", name: "Dr. A. Admin", email: "a.admin@acme-tx.example" },
  { id: "u-dm", name: "Avery Author", email: "a.author@acme-tx.example" },
  { id: "u-pi", name: "Riley Reviewer", email: "r.reviewer@cardio-site-01.example" },
  { id: "u-cra", name: "Casey Rivera", email: "c.rivera@cro-ops.example" },
  { id: "u-sde", name: "Dana Coordinator", email: "d.coord@cardio-site-01.example" },
  { id: "u-ic", name: "Val Viewer", email: "v.viewer@acme-tx.example" },
  // Specialty
  { id: "u-sam", name: "Priya Shah", email: "p.shah@acme-tx.example" },
];

// One membership per (user, study). Demonstrates the NFR-091 multi-study case:
// some users hold different roles on different studies (e.g. AM on CARDIO-1
// but Sponsor-equivalent on PULSE-RX).
export const MEMBERSHIPS: Membership[] = (() => {
  const at = "2026-06-01T09:00:00.000Z";
  const allStudies = ["cardio-1", "pulse-rx", "lantern", "leukreg", "pevd", "booster", "genesys", "vcf"];
  const rows: Membership[] = [];

  // Talosix Admin is on every study (platform tier).
  for (const studyId of allStudies) rows.push({ userId: "u-ta", studyId, roleId: "TA", addedAt: at });
  // Account Manager covers the sponsor's portfolio (CARDIO-1, PULSE-RX, LANTERN, LEUKREG).
  for (const studyId of ["cardio-1", "pulse-rx", "lantern", "leukreg"]) rows.push({ userId: "u-am", studyId, roleId: "AM", addedAt: at });
  // CRO Admin operates PEVD, BOOSTER, GENESYS, VCF.
  for (const studyId of ["pevd", "booster", "genesys", "vcf"]) rows.push({ userId: "u-cro", studyId, roleId: "CRO", addedAt: at });

  // Study Manager on CARDIO-1; same person Data Manager on PULSE-RX (cross-study NFR-091 case).
  rows.push({ userId: "u-sm", studyId: "cardio-1", roleId: "SM", addedAt: at });
  rows.push({ userId: "u-sm", studyId: "pulse-rx", roleId: "DM", addedAt: at });
  // Data Manager seated on three studies in their primary role.
  for (const studyId of ["cardio-1", "lantern", "leukreg"]) rows.push({ userId: "u-dm", studyId, roleId: "DM", addedAt: at });
  // PI / CRA / SDE on CARDIO-1.
  rows.push({ userId: "u-pi", studyId: "cardio-1", roleId: "PI", addedAt: at });
  rows.push({ userId: "u-cra", studyId: "cardio-1", roleId: "CRA", addedAt: at });
  rows.push({ userId: "u-cra", studyId: "lantern", roleId: "CRA", addedAt: at });
  rows.push({ userId: "u-sde", studyId: "cardio-1", roleId: "SDE", addedAt: at });
  rows.push({ userId: "u-sde", studyId: "pulse-rx", roleId: "SDE", addedAt: at });
  // Sponsor watches the trial studies.
  for (const studyId of ["cardio-1", "lantern"]) rows.push({ userId: "u-ic", studyId, roleId: "IC", addedAt: at });
  // Safety Manager covers the safety-sensitive trial.
  rows.push({ userId: "u-sam", studyId: "cardio-1", roleId: "SAM", addedAt: at });

  return rows;
})();

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getRole(roleId: string): SystemRole | null {
  return SYSTEM_ROLES.find((r) => r.id === roleId) ?? null;
}

export interface MemberOnStudy extends Member {
  roleId: string;
  role: SystemRole;
}

export function membersOnStudy(studyId: string): MemberOnStudy[] {
  return MEMBERSHIPS
    .filter((m) => m.studyId === studyId)
    .flatMap((m) => {
      const member = MEMBERS.find((x) => x.id === m.userId);
      const role = getRole(m.roleId);
      return member && role ? [{ ...member, roleId: m.roleId, role }] : [];
    });
}

/** All studies a single user has a membership on (NFR-091). */
export function studiesForUser(userId: string): Array<{ studyId: string; roleId: string }> {
  return MEMBERSHIPS.filter((m) => m.userId === userId).map((m) => ({ studyId: m.studyId, roleId: m.roleId }));
}
