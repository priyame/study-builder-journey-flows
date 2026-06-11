import type { TagCategory, TagAssignmentRule } from "@/lib/kelly-model";

// Seed reflects a realistic Phase 2 RCT with registry-style follow-up — the kind
// of "choose-your-own-adventure" protocol Kelly described on 2026-06-04.

export const SEED_CATEGORIES: TagCategory[] = [
  {
    id: "tc-all",
    category_type: "all_participants",
    name: "All Participants",
    allowed_values: [{ label: "All", export_code: "ALL" }],
    assignment_mode: "rule",
    usages: ["schedule_applicability", "form_applicability"],
    active: true,
    description: "Sentinel category — every participant always carries this. Cannot be deleted.",
  },
  {
    id: "tc-arm",
    category_type: "treatment",
    name: "Randomization Arm",
    allowed_values: [
      { label: "Treatment A 200mg QD", export_code: "TRTA" },
      { label: "Standard of Care",     export_code: "SOC" },
    ],
    assignment_mode: "irt_push",
    usages: ["randomization", "treatment_assignment", "analysis_reporting"],
    active: true,
    description: "Assigned at randomization by IRT message. Treatment category, not cohort — D1 doctrine.",
  },
  {
    id: "tc-cohort",
    category_type: "cohort",
    name: "Enrollment Cohort",
    allowed_values: [
      { label: "Cohort 1 — early enrollers", export_code: "C1" },
      { label: "Cohort 2 — late enrollers",  export_code: "C2" },
    ],
    assignment_mode: "rule",
    usages: ["analysis_reporting"],
    active: true,
  },
  {
    id: "tc-risk",
    category_type: "segment",
    name: "Risk Profile",
    allowed_values: [
      { label: "High Risk", export_code: "HR" },
      { label: "Low Risk",  export_code: "LR" },
    ],
    assignment_mode: "rule",
    usages: ["safety_monitoring", "schedule_applicability"],
    active: true,
    description: "Derived from baseline labs. Drives extra safety follow-up cadence.",
  },
  {
    id: "tc-itt",
    category_type: "analysis_set",
    name: "ITT Population",
    allowed_values: [{ label: "ITT", export_code: "ITT" }],
    assignment_mode: "rule", // analysis_set MUST be rule per §4 constraint
    usages: ["analysis_reporting"],
    active: true,
    description: "Analysis sets are rule-derived for CDISC ADaM reproducibility — manual assignment blocked.",
  },
];

export const SEED_RULES: TagAssignmentRule[] = [
  {
    id: "r-arm-irt",
    tag_category_id: "tc-arm",
    trigger_type: "irt_message",
    condition_preview: "On inbound IRT randomization message with envelope=opened",
    target_value: "TRTA", // example — actual value comes from the IRT payload
    validation_status: "ok",
    owner_role: "Account Manager",
  },
  {
    id: "r-cohort-time",
    tag_category_id: "tc-cohort",
    trigger_type: "time_offset",
    condition_preview: "First N=50 enrolled → C1; participants enrolled after 2026-09-01 → C2",
    target_value: "C1",
    validation_status: "ok",
    owner_role: "Account Manager",
  },
  {
    id: "r-risk-form",
    tag_category_id: "tc-risk",
    trigger_type: "form_answer",
    condition_preview: "Baseline.GFR < 60 OR Baseline.HxCVD = true",
    target_value: "HR",
    validation_status: "ok",
    owner_role: "Medical Monitor",
  },
  {
    id: "r-itt-rule",
    tag_category_id: "tc-itt",
    trigger_type: "conditional",
    condition_preview: "subject.randomized = true AND subject.protocol_violation = false",
    target_value: "ITT",
    validation_status: "ok",
    owner_role: "Biostatistician",
  },
  {
    id: "r-arm-manual",
    tag_category_id: "tc-arm",
    trigger_type: "manual",
    condition_preview: "Manual override (subject.tag.override permission required, reason captured)",
    target_value: "SOC",
    validation_status: "warning",
    owner_role: "Account Manager",
  },
];

export const TRIGGER_LABELS: Record<string, string> = {
  form_answer:      "Form answer",
  state_transition: "State transition",
  event_trigger:    "Event trigger",
  irt_message:      "IRT message",
  time_offset:      "Time offset",
  manual:           "Manual",
  conditional:      "Conditional",
};

export const CATEGORY_TYPE_LABELS: Record<string, string> = {
  cohort:           "Cohort",
  exposure:         "Exposure",
  treatment:        "Treatment",
  segment:          "Segment",
  subgroup:         "Subgroup",
  analysis_set:     "Analysis Set",
  operational:      "Operational",
  all_participants: "All Participants (sentinel)",
};

export const ASSIGNMENT_MODE_LABELS: Record<string, string> = {
  manual:               "Manual",
  rule:                 "Rule",
  randomization_schema: "Randomization schema",
  irt_push:             "IRT push",
  external_mapping:     "External mapping",
};
