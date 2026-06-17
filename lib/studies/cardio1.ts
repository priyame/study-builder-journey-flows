// CARDIO-1 — Nathan's existing demo study, ported into the same StudyFixture
// shape used by the 6 protocol-pack samples so all 8 studies share one
// component path. Data extracted from DEMO_PROFILE in
// TalOSSurvey/apps/web/lib/study-runtime.ts (lines 220–248).

import type { StudyFixture } from "./types";

export const CARDIO1: StudyFixture = {
  identity: {
    id: "cardio-1",
    code: "CARDIO-1",
    name: "CARDIO-1 · Phase 2 cardiology study",
    tagline: "Multi-center Phase 2 interventional study with weekly PRO diary and 3-month follow-up.",
    sponsor: "Talosix Therapeutics",
    indication: "Chronic heart failure (adults 18–75)",
    archetype: "rct",
    phase: "Phase 2",
    enrollmentTarget: 240,
    duration: "~90 days per patient (Screening → Month 3)",
    chips: ["Phase 2", "2 arms", "2 sites", "Weekly PRO"],
    sourceCitation: "DEMO_PROFILE · TalOSSurvey (Nathan's primary demo study)",
    dataSource: "real",
  },

  vernacular: {
    journey_element_label: "Visit",
    participant_label: "Participant",
    enrollment_trigger_label: "Randomized",
  },

  tagCategories: [
    {
      id: "tc-all",
      category_type: "all_participants",
      name: "All Participants",
      allowed_values: [{ label: "All", export_code: "ALL" }],
      assignment_mode: "rule", usages: ["schedule_applicability"], active: true,
    },
    {
      id: "tc-arm",
      category_type: "treatment",
      name: "Treatment Arm",
      allowed_values: [
        { label: "Active treatment", export_code: "TRTA" },
        { label: "Placebo",           export_code: "PLACEBO" },
      ],
      assignment_mode: "irt_push",
      usages: ["randomization", "treatment_assignment", "analysis_reporting"],
      active: true,
    },
    {
      id: "tc-site",
      category_type: "operational",
      name: "Enrollment Site",
      allowed_values: [
        { label: "Boston",  export_code: "BOS" },
        { label: "Atlanta", export_code: "ATL" },
      ],
      assignment_mode: "rule", usages: ["operational_routing", "analysis_reporting"], active: true,
    },
    {
      id: "tc-itt",
      category_type: "analysis_set",
      name: "ITT Population",
      allowed_values: [{ label: "ITT", export_code: "ITT" }],
      assignment_mode: "rule", usages: ["analysis_reporting"], active: true,
    },
  ],

  tagRules: [
    { id: "r-arm", tag_category_id: "tc-arm", trigger_type: "irt_message",
      condition_preview: "IRT randomization at Baseline (Day 1)",
      target_value: "TRTA", validation_status: "ok", owner_role: "Coordinator" },
    { id: "r-site", tag_category_id: "tc-site", trigger_type: "form_answer",
      condition_preview: "Demographics.site",
      target_value: "BOS", validation_status: "ok", owner_role: "Coordinator" },
    { id: "r-itt", tag_category_id: "tc-itt", trigger_type: "conditional",
      condition_preview: "randomized = true AND received_dose = true",
      target_value: "ITT", validation_status: "ok", owner_role: "Biostatistician" },
  ],

  paths: [
    { id: "p-main",    name: "Main protocol path", applies_to_expr: "ALL=ALL" },
    { id: "p-trta",    name: "Active treatment arm", applies_to_expr: "ARM=TRTA" },
    { id: "p-placebo", name: "Placebo arm",          applies_to_expr: "ARM=PLACEBO" },
  ],

  elements: [
    { id: "el-screen",   builder_label: "Screening (V1)",     element_type: "scheduled", day_offset: -7,  anchor: "study_start", window_minus: 2, window_plus: 2, applies_to_expr: "ALL=ALL", activities: ["ICF", "I/E", "Demographics", "Vital signs", "Baseline labs"] },
    { id: "el-ms-enroll", builder_label: "Enrolled",          element_type: "milestone", applies_to_expr: "ALL=ALL", activities: [], notes: "I/E met + ICF signed." },
    { id: "el-baseline", builder_label: "Baseline (V2)",      element_type: "scheduled", day_offset: 1,   anchor: "ms_enroll", applies_to_expr: "ALL=ALL", activities: ["Baseline vitals", "6MWD baseline", "AE collection start", "First dose"] },
    { id: "el-ms-rand",  builder_label: "Randomized",         element_type: "milestone", applies_to_expr: "ALL=ALL", activities: [], notes: "IRT randomization at Baseline; ARM tag assigned." },
    { id: "el-pro-diary", builder_label: "Weekly PRO diary",  element_type: "cadence_followup", applies_to_expr: "ALL=ALL", activities: ["Treatment satisfaction PRO", "Symptom diary"], cadence: { interval_days: 7, stop_condition: "Month 3 visit complete OR withdrawal" } },
    { id: "el-month1",   builder_label: "Month 1 (V3)",       element_type: "scheduled", day_offset: 28,  anchor: "ms_rand", window_minus: 3, window_plus: 3, applies_to_expr: "ALL=ALL", activities: ["Vital signs", "AE review", "Concomitant meds", "Treatment satisfaction PRO"] },
    { id: "el-month3",   builder_label: "Month 3 · primary endpoint (V4)", element_type: "scheduled", day_offset: 84, anchor: "ms_rand", window_minus: 7, window_plus: 7, applies_to_expr: "ALL=ALL", activities: ["6MWD (primary)", "Vital signs", "AE review", "Concomitant meds", "Treatment satisfaction PRO"] },
    { id: "el-ae",       builder_label: "Adverse Event log",  element_type: "event_triggered", applies_to_expr: "ALL=ALL", activities: ["AE form", "Severity grading", "Causality"], notes: "Repeatable; SAEs route to 24h pathway." },
    { id: "el-ms-complete", builder_label: "Study complete",  element_type: "milestone", applies_to_expr: "ALL=ALL", activities: [] },
    { id: "el-end-complete",  builder_label: "Completed",        element_type: "end_state", applies_to_expr: "ALL=ALL", activities: [] },
    { id: "el-end-withdrawn", builder_label: "Withdrew consent", element_type: "end_state", applies_to_expr: "ALL=ALL", activities: [] },
    { id: "el-end-lost",      builder_label: "Lost to follow-up", element_type: "end_state", applies_to_expr: "ALL=ALL", activities: [] },
  ],

  edges: [
    { from: "el-screen",       to: "el-ms-enroll",  trigger_family: "conditional", trigger_label: "I/E met + ICF signed" },
    { from: "el-ms-enroll",    to: "el-baseline",   trigger_family: "day_offset",  trigger_label: "+8 days" },
    { from: "el-baseline",     to: "el-ms-rand",    trigger_family: "auto",        trigger_label: "First dose recorded" },
    { from: "el-ms-rand",      to: "el-pro-diary",  trigger_family: "auto",        trigger_label: "Begin weekly PRO cadence" },
    { from: "el-ms-rand",      to: "el-month1",     trigger_family: "day_offset",  trigger_label: "+27 days from Randomization" },
    { from: "el-month1",       to: "el-month3",     trigger_family: "day_offset",  trigger_label: "+56 days" },
    { from: "el-month3",       to: "el-ms-complete", trigger_family: "auto",       trigger_label: "Primary endpoint captured" },
    { from: "el-ms-complete",  to: "el-end-complete", trigger_family: "auto",      trigger_label: "All FU complete" },
    { from: "el-baseline",     to: "el-ae",         trigger_family: "auto",        trigger_label: "AE reported during treatment" },
    { from: "el-ms-enroll",    to: "el-end-withdrawn", trigger_family: "manual",   trigger_label: "Withdraw consent" },
    { from: "el-pro-diary",    to: "el-end-lost",   trigger_family: "manual",      trigger_label: "Lost to follow-up" },
  ],

  visitColumns: [
    { id: "d-screen", label: "Screen",   day: -7 },
    { id: "d-base",   label: "Baseline", day: 1 },
    { id: "d-w1",     label: "Week 1",   day: 7 },
    { id: "d-w2",     label: "Week 2",   day: 14 },
    { id: "d-w3",     label: "Week 3",   day: 21 },
    { id: "d-m1",     label: "Month 1",  day: 28 },
    { id: "d-w8",     label: "Week 8",   day: 56 },
    { id: "d-m3",     label: "Month 3 (1°)", day: 84 },
  ],

  versions: [
    {
      id: "v-1-0", version_label: "v1.0", status: "Published", env: "live",
      protocol_version_label: "Protocol v1.0",
      published_at: "2026-03-15 09:00", published_by: "CRO Admin · m.li@…",
      changes: [
        { area: "Form",  summary: "Initial Published version", versioning_class: "versioning" },
      ],
    },
    {
      id: "v-1-1", version_label: "v1.1", status: "Draft", env: "draft",
      protocol_version_label: "Protocol v1.0",
      changes: [
        { area: "Setting", summary: "Weekly PRO reminder cadence — 7d → 5d", versioning_class: "non_versioning" },
      ],
    },
  ],

  subjectId: { pattern: "C1-{site:3}-{seq:4}", example: "C1-001-0042", sequence_scope: "site", zero_pad_to: 4 },
  enrollmentDefinition: { trigger: "randomized", count_unit: "participant" },
  dispositions: [
    { id: "d-complete",  label: "Completed",         is_terminal: true, source: "system" },
    { id: "d-withdrew",  label: "Withdrew consent",  is_terminal: true, source: "system" },
    { id: "d-lost",      label: "Lost to follow-up", is_terminal: true, source: "system" },
    { id: "d-ae",        label: "Adverse event",     is_terminal: true, source: "system" },
    { id: "d-other",     label: "Other (specify)",   is_terminal: true, is_catch_all: true, source: "custom" },
  ],
  exportPreview: [
    { subject_id: "C1-001-0001", ARM: "TRTA",    SITE: "BOS", ITT: "ITT", DISPOSITION: "Completed" },
    { subject_id: "C1-001-0007", ARM: "PLACEBO", SITE: "BOS", ITT: "ITT", DISPOSITION: "Completed" },
    { subject_id: "C1-002-0014", ARM: "TRTA",    SITE: "ATL", ITT: "",    DISPOSITION: "Withdrew consent" },
  ],

  sources: [
    { filename: "Protocol v1.0 · CARDIO-1 (internal demo)", kind: "protocol", status: "extracted",
      contributes_to: ["identity", "tagCategories", "elements", "paths"],
      note: "Nathan's primary demo study — the default fixture used to drive the StudyOnboarding flow." },
  ],

  provenance: {
    "identity.sponsor": { source: "Protocol v1.0 · CARDIO-1 (internal demo)", quote: "Talosix Therapeutics — internal demo sponsor." },
    "identity.indication": { source: "Protocol v1.0 · CARDIO-1 (internal demo)", quote: "Adults (18–75) with chronic heart failure." },
    "identity.archetype": { source: "Protocol v1.0 · CARDIO-1 (internal demo)", quote: "Phase 2, multi-center, randomized interventional with 2 arms (active vs placebo)." },
    "identity.enrollmentTarget": { source: "Protocol v1.0 · CARDIO-1 (internal demo)", quote: "Enrollment target: 240 participants across 2 sites (Boston, Atlanta)." },
  },
};
