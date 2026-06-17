// Study Settings Hub model — the 8 sections from PRD #25 §3. Read-only browse;
// each section lists what it owns + which permission gates it + section status
// (wired in R1.0 / planned for R1.1 / Phase 2 reserved).

import { type Permission, PERMISSION_GROUPS } from "./users-model";

export type SectionStatus = "wired" | "planned-r1.1" | "phase-2-reserved";

export interface HubSection {
  id: string;
  label: string;
  description: string;
  /** Required permission to edit this section. Read access is broader. */
  editPerm: string;
  /** What this section owns — short bullets shown under the description. */
  owns: string[];
  /** Where the data lives today; helps engineering audit the seams. */
  storedIn?: string;
  status: SectionStatus;
}

export const HUB_SECTIONS: HubSection[] = [
  {
    id: "general",
    label: "General",
    description:
      "Study identity, sponsor, indication, phase, primary endpoint, target enrollment, dates. The same fields the wizard captures at Stage 2.",
    editPerm: "settings:general",
    owns: ["Study code & title", "Sponsor + CRO", "Phase / archetype", "Population & endpoint", "Target enrollment & duration"],
    storedIn: "StudyFixture.identity + .vernacular",
    status: "wired",
  },
  {
    id: "screening",
    label: "Screening & Eligibility",
    description:
      "Screening events along the SoA, eligibility-form reference, determination method, default eligibility 5-state model (unknown / eligible / ineligible / undetermined / screen-failed). Criteria live in the eCRF, not here.",
    editPerm: "settings:screening",
    owns: ["Screening event(s) along the SoA", "Eligibility form reference", "Determination method", "5-state eligibility default"],
    storedIn: "StudyFixture.tagCategories[type=screening] + JourneyElement[type=Scheduled, epoch=SCREENING]",
    status: "wired",
  },
  {
    id: "enrollment",
    label: "Enrollment & Milestones",
    description:
      "Configurable enrollment definition (consented / screened+eligible / randomized / first-dose / baseline-data) + multi-level targets (study-total · per-arm · per-cohort · per-site).",
    editPerm: "settings:enrollment",
    owns: [
      "Enrollment definition trigger (Tag Assignment Rule)",
      "Per-study enrollment target",
      "Per-arm + per-cohort + per-site targets",
      "Milestone calendar",
    ],
    storedIn: "StudyConfig.enrollmentDefinition + study-level targets",
    status: "wired",
  },
  {
    id: "flags",
    label: "Feature Flags",
    description:
      "Per-study toggles that turn capability profiles on or off without forking the data model (per NFR-013 — one product, feature-flagged tiers).",
    editPerm: "settings:flags",
    owns: [
      "AI Scribe enabled",
      "AI Query auto-suggest",
      "eConsent surface",
      "Tiered capability profile (Registry / Studies / Trials)",
    ],
    storedIn: "Org.featureFlags + per-study overrides",
    status: "wired",
  },
  {
    id: "data-storage",
    label: "Data & Storage",
    description:
      "Data residency region (AWS region pin), retention horizon, export shape (one-combined-dataset-per-domain per NFR-095).",
    editPerm: "settings:data-storage",
    owns: [
      "Data residency region",
      "Retention horizon (NFR-038)",
      "Export shape — one combined dataset per domain (NFR-095)",
      "Encryption at rest + in flight (managed)",
    ],
    storedIn: "Org.dataResidency + StudyConfig.retentionPolicy",
    status: "planned-r1.1",
  },
  {
    id: "notifications",
    label: "Notifications & Alerts",
    description:
      "Email-on-X notification rules + escalation tiers. Subject-level reminders live in the Journey; these are the org-level operational alerts (lock readiness, overdue queries, safety triggers).",
    editPerm: "settings:notifications",
    owns: [
      "Lock-readiness notifications",
      "Overdue-query escalation tiers",
      "Safety-event notification rules",
      "Quiet hours & locale",
    ],
    storedIn: "Org.notificationRules",
    status: "planned-r1.1",
  },
  {
    id: "regulatory",
    label: "Regulatory & Compliance",
    description:
      "IRB info, regulatory framework (FDA / EMA / PMDA / NMPA), GxP scope, validation packet generation defaults.",
    editPerm: "settings:regulatory",
    owns: [
      "Primary regulatory framework",
      "IRB / EC reference + approval letter",
      "GxP scope (GCP / GLP / GMP)",
      "Validation packet auto-generation (NFR-031)",
    ],
    storedIn: "StudyConfig.regulatory",
    status: "wired",
  },
  {
    id: "blinding",
    label: "Blinding (Phase 2 reserved)",
    description:
      "Per-role unblinding access, emergency unblinding workflow, BlindingRoleConfig + UnblindingRequest schemas. Reserved in R1.0; activates in Phase 2.",
    editPerm: "settings:blinding",
    owns: [
      "BlindingRoleConfig (Phase 2)",
      "UnblindingRequest workflow (Phase 2)",
      "Per-role unblinding access rules (Phase 2)",
      "Emergency unblinding audit (Phase 2)",
    ],
    storedIn: "Schemas reserved; UI ships in Phase 2",
    status: "phase-2-reserved",
  },
];

// ─── Cross-helpers (used by the page to find role access per section) ────────

import { SYSTEM_ROLES, type SystemRole } from "./users-model";

/** Which roles can edit a given section (have the editPerm grant). */
export function rolesWithEditAccess(editPerm: string): SystemRole[] {
  return SYSTEM_ROLES.filter((r) => r.grants.includes(editPerm));
}

/** The permission definition the section's editPerm points at. */
export function findPerm(permId: string): Permission | null {
  for (const gp of PERMISSION_GROUPS) {
    const p = gp.permissions.find((x) => x.id === permId);
    if (p) return p;
  }
  return null;
}
