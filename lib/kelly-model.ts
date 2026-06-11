// Kelly Ritch's v2 model — PRD #12 v0.8 (2026-06-09 → 2026-06-10).
// Doctrine D1 (v0.8): Participants are not pre-grouped. A Participant is a single entity
// who collects Tags throughout the journey. "Groups" are runtime queries over tags, never stored.

// ---------------------------------------------------------------------------
// §4. Canonical Object Model
// ---------------------------------------------------------------------------

export type CategoryType =
  | "cohort"
  | "exposure"
  | "treatment"
  | "segment"
  | "subgroup"
  | "analysis_set"
  | "operational"
  | "all_participants"; // sentinel — always present, always true, cannot be deleted

export type AssignmentMode =
  | "manual"
  | "rule"
  | "randomization_schema"
  | "irt_push"
  | "external_mapping";

export type Usage =
  | "schedule_applicability"
  | "form_applicability"
  | "randomization"
  | "treatment_assignment"
  | "safety_monitoring"
  | "analysis_reporting"
  | "operational_routing"
  | "enrollment_tracking";

export type TriggerType =
  | "form_answer"
  | "state_transition"
  | "event_trigger"
  | "irt_message"
  | "time_offset"
  | "manual"
  | "conditional";

export interface AllowedValue {
  label: string;       // builder-facing — renaming does NOT bump Study Version
  export_code: string; // CDISC-stable — renaming DOES bump Study Version (NFR-001)
}

export interface TagCategory {
  id: string;
  category_type: CategoryType;
  name: string;                       // builder-configurable display label (§3.5)
  allowed_values: AllowedValue[];
  assignment_mode: AssignmentMode;
  usages: Usage[];                    // ≥1 required
  parent_category_id?: string;        // v2.1: one-level nesting
  active: boolean;                    // soft-delete via deprecate
  description?: string;
}

export interface TagAssignmentRule {
  id: string;
  tag_category_id: string;
  trigger_type: TriggerType;
  // condition is a JSON expression in production; here we keep a human-readable preview.
  condition_preview: string;
  target_value: string;               // an export_code from the Category's allowed_values
  validation_status: "ok" | "warning" | "error";
  owner_role?: string;
}

// ---------------------------------------------------------------------------
// §§21–28. Study Versioning
// ---------------------------------------------------------------------------

export type Env = "draft" | "uat" | "live";

export type VersionStatus = "Draft" | "Signed Off" | "Published" | "Retired";

export interface StudyVersion {
  id: string;
  version_label: string;              // e.g., "v1.2"
  status: VersionStatus;
  env: Env;
  protocol_version_label: string;     // links to ProtocolVersion
  signed_off_at?: string;
  signed_off_by?: string;
  published_at?: string;
  published_by?: string;
  reason?: string;
  changes: VersionChange[];
}

export interface VersionChange {
  area: "Tag Category" | "Tag Rule" | "Journey" | "Form" | "Edit Check" | "Setting" | "Vernacular";
  summary: string;
  versioning_class: "versioning" | "non_versioning" | "site_scoped"; // §23.4 + §23.6
}

// ---------------------------------------------------------------------------
// §3.5 Vernacular Configuration
// ---------------------------------------------------------------------------

export interface Vernacular {
  journey_element_label: string;     // e.g., "Visit", "Touchpoint", "Encounter"
  participant_label: string;          // e.g., "Participant", "Subject", "Patient"
  enrollment_trigger_label: string;   // e.g., "Consented", "Randomized"
}

// ---------------------------------------------------------------------------
// Pooja/Ana operational asks (2026-06-10) + NFR-016
// ---------------------------------------------------------------------------

export interface SubjectIdConfig {
  pattern: string;                    // template, e.g., "{site}-{seq:4}" or "{country}-{site}-{seq}"
  example: string;                    // rendered example
  sequence_scope: "study" | "site" | "country";
  zero_pad_to?: number;
}

export interface EnrollmentDefinition {
  trigger: "consented" | "screened_and_eligible" | "randomized" | "first_dose" | "custom";
  custom_label?: string;
  count_unit: "participant" | "encounter";
}

export interface Disposition {
  id: string;
  label: string;
  is_catch_all?: boolean;
  is_terminal?: boolean;
  source: "system" | "custom";
}
