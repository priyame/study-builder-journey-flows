// GENESYS — Genesys Spine post-market feasibility study of the Siros SI joint
// fusion device. Single-arm (FDA-cleared device, no placebo/control). 35+
// patients across 5+ sites. Outcome focus: pain (NRS), disability (ODI), QoL
// (PROMIS-10), safety. Extracted from genesys.pdf (light extract).

import type { StudyFixture } from "./types";

export const GENESYS: StudyFixture = {
  identity: {
    id: "genesys",
    code: "GENESYS",
    name: "GENESYS · Siros SI joint fusion post-market feasibility",
    tagline:
      "Single-arm post-market study of FDA-cleared SI joint fusion device.",
    sponsor: "Genesys Spine",
    indication: "Sacroiliac joint dysfunction / chronic low back pain",
    archetype: "single_arm",
    phase: "Post-market feasibility",
    enrollmentTarget: 35,
    duration: "24 months minimum per patient",
    chips: ["Single-arm", "Post-market", "5+ sites", "24-mo FU"],
    sourceCitation: "GENESYS Siros Feasibility Protocol",
    dataSource: "real",
  },

  vernacular: {
    journey_element_label: "Visit",
    participant_label: "Patient",
    enrollment_trigger_label: "Procedure performed",
  },

  tagCategories: [
    {
      id: "tc-all", category_type: "all_participants", name: "All Patients",
      allowed_values: [{ label: "All", export_code: "ALL" }],
      assignment_mode: "rule", usages: ["schedule_applicability"], active: true,
    },
    {
      id: "tc-side", category_type: "segment", name: "Joint Side",
      allowed_values: [
        { label: "Left",      export_code: "L" },
        { label: "Right",     export_code: "R" },
        { label: "Bilateral", export_code: "BI" },
      ],
      assignment_mode: "rule", usages: ["analysis_reporting", "form_applicability"], active: true,
    },
    {
      id: "tc-baseline", category_type: "segment", name: "Baseline ODI Severity",
      allowed_values: [
        { label: "Moderate (30–40%)", export_code: "MOD" },
        { label: "Severe (41–60%)",   export_code: "SEV" },
        { label: "Crippled (>60%)",   export_code: "CRIP" },
      ],
      assignment_mode: "rule", usages: ["analysis_reporting"], active: true,
    },
  ],

  tagRules: [
    {
      id: "r-side", tag_category_id: "tc-side", trigger_type: "form_answer",
      condition_preview: "Screening.Side ∈ {L, R, BI}", target_value: "L",
      validation_status: "ok", owner_role: "PI",
    },
    {
      id: "r-baseline", tag_category_id: "tc-baseline", trigger_type: "form_answer",
      condition_preview: "Baseline.ODI score buckets", target_value: "SEV",
      validation_status: "ok", owner_role: "PI",
    },
  ],

  paths: [
    { id: "p-main", name: "Main protocol path", applies_to_expr: "ALL=ALL" },
    { id: "p-bilat", name: "Bilateral overlay", applies_to_expr: "SIDE=BI", description: "Two procedures, separate post-op tracking." },
  ],

  elements: [
    { id: "el-screen",    builder_label: "Screening / Baseline", element_type: "scheduled", day_offset: -14, anchor: "study_start", applies_to_expr: "ALL=ALL", activities: ["ICF", "I/E", "Demographics", "Baseline ODI ≥30%", "NRS pain", "PROMIS-10"] },
    { id: "el-ms-enroll", builder_label: "Enrolled", element_type: "milestone", applies_to_expr: "ALL=ALL", activities: [] },
    { id: "el-procedure", builder_label: "Siros SI fusion procedure", element_type: "scheduled", day_offset: 0, anchor: "ms_enroll", applies_to_expr: "ALL=ALL", activities: ["Procedure documentation", "Device parameters", "Operative AE", "Discharge readiness"] },
    { id: "el-ms-procedure", builder_label: "Procedure complete", element_type: "milestone", applies_to_expr: "ALL=ALL", activities: [] },
    { id: "el-fu-6w",     builder_label: "6-week follow-up",  element_type: "scheduled", day_offset: 42,  anchor: "ms_procedure", window_minus: 7,  window_plus: 7,  applies_to_expr: "ALL=ALL", activities: ["NRS", "ODI", "AE review", "Wound check"] },
    { id: "el-fu-3m",     builder_label: "3-month follow-up", element_type: "scheduled", day_offset: 90,  anchor: "ms_procedure", window_minus: 14, window_plus: 14, applies_to_expr: "ALL=ALL", activities: ["NRS", "ODI", "PROMIS-10", "AE review"] },
    { id: "el-fu-6m",     builder_label: "6-month follow-up", element_type: "scheduled", day_offset: 180, anchor: "ms_procedure", window_minus: 21, window_plus: 21, applies_to_expr: "ALL=ALL", activities: ["NRS", "ODI", "PROMIS-10", "AE review", "Imaging if indicated"] },
    { id: "el-fu-12m",    builder_label: "12-month follow-up", element_type: "scheduled", day_offset: 365, anchor: "ms_procedure", window_minus: 30, window_plus: 30, applies_to_expr: "ALL=ALL", activities: ["NRS", "ODI", "PROMIS-10", "AE review"] },
    { id: "el-fu-24m",    builder_label: "24-month follow-up", element_type: "scheduled", day_offset: 730, anchor: "ms_procedure", window_minus: 60, window_plus: 60, applies_to_expr: "ALL=ALL", activities: ["NRS", "ODI", "PROMIS-10", "Long-term safety", "Final assessment"] },
    { id: "el-end-complete",  builder_label: "Study Complete",  element_type: "end_state", applies_to_expr: "ALL=ALL", activities: [] },
    { id: "el-end-withdrawn", builder_label: "Withdrew Consent", element_type: "end_state", applies_to_expr: "ALL=ALL", activities: [] },
  ],

  edges: [
    { from: "el-screen",       to: "el-ms-enroll",  trigger_family: "conditional", trigger_label: "I/E met (ODI ≥30%)" },
    { from: "el-ms-enroll",    to: "el-procedure",  trigger_family: "auto",        trigger_label: "Procedure scheduled" },
    { from: "el-procedure",    to: "el-ms-procedure", trigger_family: "auto",      trigger_label: "Discharge ready" },
    { from: "el-ms-procedure", to: "el-fu-6w",      trigger_family: "day_offset",  trigger_label: "+42 days" },
    { from: "el-fu-6w",        to: "el-fu-3m",      trigger_family: "day_offset",  trigger_label: "+48 days" },
    { from: "el-fu-3m",        to: "el-fu-6m",      trigger_family: "day_offset",  trigger_label: "+90 days" },
    { from: "el-fu-6m",        to: "el-fu-12m",     trigger_family: "day_offset",  trigger_label: "+180 days" },
    { from: "el-fu-12m",       to: "el-fu-24m",     trigger_family: "day_offset",  trigger_label: "+365 days" },
    { from: "el-fu-24m",       to: "el-end-complete", trigger_family: "auto",      trigger_label: "Final assessment complete" },
    { from: "el-ms-enroll",    to: "el-end-withdrawn", trigger_family: "manual",   trigger_label: "Withdraw consent" },
  ],

  visitColumns: [
    { id: "d-screen", label: "Screen", day: -14 },
    { id: "d-proc",   label: "Procedure", day: 0 },
    { id: "d-6w",     label: "6 wk",   day: 42 },
    { id: "d-3m",     label: "3 mo",   day: 90 },
    { id: "d-6m",     label: "6 mo",   day: 180 },
    { id: "d-12m",    label: "12 mo",  day: 365 },
    { id: "d-24m",    label: "24 mo",  day: 730 },
  ],

  versions: [
    {
      id: "v-1-0", version_label: "v1.0", status: "Published", env: "live",
      protocol_version_label: "Feasibility Protocol v1.0",
      published_at: "2025-11-01 09:00", published_by: "Sponsor · clin-ops@genesys-spine",
      changes: [
        { area: "Form", summary: "Initial Published version", versioning_class: "versioning" },
      ],
    },
  ],

  subjectId: {
    pattern: "GEN-{site:2}-{seq:3}",
    example: "GEN-04-027",
    sequence_scope: "site",
    zero_pad_to: 3,
  },
  enrollmentDefinition: { trigger: "screened_and_eligible", count_unit: "participant" },
  dispositions: [
    { id: "d-complete",  label: "Completed 24 months", is_terminal: true, source: "system" },
    { id: "d-withdrew",  label: "Withdrew consent",    is_terminal: true, source: "system" },
    { id: "d-lost",      label: "Lost to follow-up",   is_terminal: true, source: "system" },
    { id: "d-other",     label: "Other (specify)",     is_terminal: true, is_catch_all: true, source: "custom" },
  ],
  exportPreview: [
    { subject_id: "GEN-01-001", SIDE: "L",  BASELINE_ODI: "SEV",  DISPOSITION: "Completed 24 months" },
    { subject_id: "GEN-02-003", SIDE: "BI", BASELINE_ODI: "CRIP", DISPOSITION: "Completed 24 months" },
    { subject_id: "GEN-04-008", SIDE: "R",  BASELINE_ODI: "MOD",  DISPOSITION: "Lost to follow-up" },
  ],

  sources: [
    { filename: "genesys.pdf", kind: "protocol", status: "extracted",
      contributes_to: ["identity", "tagCategories", "elements"],
      note: "Genesys Spine feasibility protocol — single-arm, post-market." },
  ],

  provenance: {
    "identity.sponsor": {
      source: "genesys.pdf",
      page: 1,
      quote: "Genesys Spine — sponsor of the Siros SI joint fusion feasibility study.",
    },
    "identity.indication": {
      source: "genesys.pdf",
      quote: "Sacroiliac joint dysfunction / degenerative sacroiliitis with chronic low back pain.",
    },
    "identity.archetype": {
      source: "genesys.pdf",
      quote: "Prospective, single-arm, post-market feasibility — no placebo/control. FDA-cleared device (K191748) used in approved indication.",
    },
    "identity.enrollmentTarget": {
      source: "genesys.pdf",
      quote: "N=35 minimum across 5+ sites; consecutive enrollment to minimize selection bias.",
    },
  },
};
