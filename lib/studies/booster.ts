// BOOSTER — placeholder fixture. The Final Protocol v1.0 PDF in the source folder
// has glyph-encoded (image-based) text we couldn't extract; this fixture sketches
// a plausible Phase 3 placebo-controlled vaccine-booster RCT shape so the picker
// and journey graph render, but every value below should be reviewed against the
// real protocol before sharing externally. The dataNote surfaces this caveat in
// the UI.

import type { StudyFixture } from "./types";

export const BOOSTER: StudyFixture = {
  identity: {
    id: "booster",
    code: "BOOSTER",
    name: "BOOSTER · Phase 3 vaccine booster RCT (placeholder)",
    tagline:
      "Plausible Phase 3 booster vs. placebo shape — real protocol PDF is image-only.",
    sponsor: "Sponsor TBD — protocol PDF not machine-readable",
    indication: "Indication TBD",
    archetype: "rct",
    phase: "Phase 3",
    enrollmentTarget: 5000,
    duration: "12 months per participant",
    chips: ["Phase 3", "2 arms", "12-mo FU", "DATA INFERRED"],
    sourceCitation: "BOOSTER Final Protocol v1.0 · WCG IRB · 6 Sep 2023 (PDF unreadable)",
    dataSource: "inferred",
    dataNote:
      "The BOOSTER protocol PDF is image-only — values below are a generic Phase 3 booster RCT skeleton, not extracted facts. Replace with real data before sharing with sites.",
  },

  vernacular: {
    journey_element_label: "Visit",
    participant_label: "Participant",
    enrollment_trigger_label: "Randomized",
  },

  tagCategories: [
    {
      id: "tc-all", category_type: "all_participants", name: "All Participants",
      allowed_values: [{ label: "All", export_code: "ALL" }],
      assignment_mode: "rule", usages: ["schedule_applicability"], active: true,
    },
    {
      id: "tc-arm", category_type: "treatment", name: "Treatment Arm",
      allowed_values: [
        { label: "Booster vaccine",    export_code: "BOOSTER" },
        { label: "Placebo",            export_code: "PLACEBO" },
      ],
      assignment_mode: "irt_push", usages: ["randomization", "analysis_reporting"], active: true,
    },
    {
      id: "tc-cohort", category_type: "cohort", name: "Age Cohort",
      allowed_values: [
        { label: "18–49 years", export_code: "ADULT" },
        { label: "50–64 years", export_code: "MIDDLE" },
        { label: "65+ years",   export_code: "ELDER" },
      ],
      assignment_mode: "rule", usages: ["analysis_reporting", "schedule_applicability"], active: true,
    },
    {
      id: "tc-prior", category_type: "exposure", name: "Prior Series Status",
      allowed_values: [
        { label: "Primary series complete only", export_code: "PRIMARY" },
        { label: "Prior booster received",       export_code: "BOOSTED" },
      ],
      assignment_mode: "rule", usages: ["analysis_reporting"], active: true,
    },
    {
      id: "tc-itt", category_type: "analysis_set", name: "ITT Population",
      allowed_values: [{ label: "ITT", export_code: "ITT" }],
      assignment_mode: "rule", usages: ["analysis_reporting"], active: true,
    },
  ],

  tagRules: [
    {
      id: "r-arm", tag_category_id: "tc-arm", trigger_type: "irt_message",
      condition_preview: "IRT randomization at Day 1", target_value: "BOOSTER",
      validation_status: "ok", owner_role: "Coordinator",
    },
    {
      id: "r-cohort", tag_category_id: "tc-cohort", trigger_type: "form_answer",
      condition_preview: "Demographics.age bucket", target_value: "ADULT",
      validation_status: "ok", owner_role: "Coordinator",
    },
    {
      id: "r-itt", tag_category_id: "tc-itt", trigger_type: "conditional",
      condition_preview: "randomized = true AND received_dose = true",
      target_value: "ITT", validation_status: "ok", owner_role: "Biostatistician",
    },
  ],

  paths: [
    { id: "p-main",    name: "Main protocol path", applies_to_expr: "ALL=ALL" },
    { id: "p-booster", name: "Booster arm",        applies_to_expr: "ARM=BOOSTER" },
    { id: "p-placebo", name: "Placebo arm",        applies_to_expr: "ARM=PLACEBO" },
    { id: "p-elder",   name: "Elder cohort overlay", applies_to_expr: "COHORT=ELDER" },
  ],

  elements: [
    { id: "el-screen",       builder_label: "Screening Visit", element_type: "scheduled", day_offset: -7,  anchor: "study_start", window_minus: 7, window_plus: 0, applies_to_expr: "ALL=ALL", activities: ["ICF", "I/E check", "Demographics", "Medical history", "Baseline labs"] },
    { id: "el-ms-enrolled",  builder_label: "Enrolled + Randomized", element_type: "milestone", applies_to_expr: "ALL=ALL", activities: [], notes: "IRT randomization fires; ARM tag assigned." },
    { id: "el-d1-dose",      builder_label: "Day 1 · Dose administration", element_type: "scheduled", day_offset: 0, anchor: "ms_enrolled", applies_to_expr: "ALL=ALL", activities: ["Dose (booster or placebo)", "30-min observation", "Reactogenicity diary issued"] },
    { id: "el-d7-react",     builder_label: "Day 7 · Reactogenicity check", element_type: "scheduled", day_offset: 7, anchor: "ms_enrolled", window_minus: 2, window_plus: 2, applies_to_expr: "ALL=ALL", activities: ["Reactogenicity diary review", "Local/systemic AE collection"] },
    { id: "el-d28-immuno",   builder_label: "Day 28 · Immunogenicity sample", element_type: "scheduled", day_offset: 28, anchor: "ms_enrolled", window_minus: 4, window_plus: 4, applies_to_expr: "ALL=ALL", activities: ["Serology blood draw", "AE review", "Conmeds"] },
    { id: "el-m3-fu",        builder_label: "Month 3 follow-up", element_type: "scheduled", day_offset: 90, anchor: "ms_enrolled", window_minus: 14, window_plus: 14, applies_to_expr: "ALL=ALL", activities: ["Serology", "AE review", "Breakthrough surveillance"] },
    { id: "el-m6-fu",        builder_label: "Month 6 follow-up", element_type: "scheduled", day_offset: 180, anchor: "ms_enrolled", window_minus: 21, window_plus: 21, applies_to_expr: "ALL=ALL", activities: ["Serology", "AE review", "Breakthrough surveillance"] },
    { id: "el-m12-eot",      builder_label: "Month 12 · End of trial", element_type: "scheduled", day_offset: 365, anchor: "ms_enrolled", window_minus: 30, window_plus: 30, applies_to_expr: "ALL=ALL", activities: ["Final serology", "Final AE/breakthrough review", "Study exit"] },
    { id: "el-breakthrough", builder_label: "Suspected breakthrough infection", element_type: "event_triggered", applies_to_expr: "ALL=ALL", activities: ["Symptom-driven swab/test", "Confirmatory PCR", "Severity assessment"], notes: "Repeatable; safety-relevant events open SAE pathway." },
    { id: "el-end-complete",  builder_label: "Study Complete",  element_type: "end_state", applies_to_expr: "ALL=ALL", activities: [] },
    { id: "el-end-withdrawn", builder_label: "Withdrew Consent", element_type: "end_state", applies_to_expr: "ALL=ALL", activities: [] },
  ],

  edges: [
    { from: "el-screen",       to: "el-ms-enrolled", trigger_family: "conditional", trigger_label: "I/E met + ICF signed" },
    { from: "el-ms-enrolled",  to: "el-d1-dose",     trigger_family: "auto",       trigger_label: "Same-day dose" },
    { from: "el-d1-dose",      to: "el-d7-react",    trigger_family: "day_offset", trigger_label: "+7 days" },
    { from: "el-d7-react",     to: "el-d28-immuno",  trigger_family: "day_offset", trigger_label: "+21 days" },
    { from: "el-d28-immuno",   to: "el-m3-fu",       trigger_family: "day_offset", trigger_label: "+62 days" },
    { from: "el-m3-fu",        to: "el-m6-fu",       trigger_family: "day_offset", trigger_label: "+90 days" },
    { from: "el-m6-fu",        to: "el-m12-eot",     trigger_family: "day_offset", trigger_label: "+180 days" },
    { from: "el-m12-eot",      to: "el-end-complete", trigger_family: "auto",      trigger_label: "Final visit complete" },
    { from: "el-d1-dose",      to: "el-breakthrough", trigger_family: "auto",      trigger_label: "Breakthrough symptom reported" },
    { from: "el-breakthrough", to: "el-d28-immuno",   trigger_family: "auto",      trigger_label: "Continue scheduled follow-up" },
    { from: "el-ms-enrolled",  to: "el-end-withdrawn", trigger_family: "manual",   trigger_label: "Withdraw consent" },
  ],

  visitColumns: [
    { id: "d-scr", label: "Screen",  day: -7 },
    { id: "d-d1",  label: "Day 1",   day: 0 },
    { id: "d-d7",  label: "Day 7",   day: 7 },
    { id: "d-d28", label: "Day 28",  day: 28 },
    { id: "d-m3",  label: "Month 3", day: 90 },
    { id: "d-m6",  label: "Month 6", day: 180 },
    { id: "d-m12", label: "Month 12", day: 365 },
  ],

  versions: [
    {
      id: "v-1-0", version_label: "v1.0 (placeholder)", status: "Draft", env: "draft",
      protocol_version_label: "Protocol v1.0",
      changes: [
        { area: "Form", summary: "Initial placeholder draft — pending re-extraction from real protocol", versioning_class: "versioning" },
      ],
    },
  ],

  subjectId: {
    pattern: "BOOST-{site:3}-{seq:5}",
    example: "BOOST-014-00042",
    sequence_scope: "site",
    zero_pad_to: 5,
  },
  enrollmentDefinition: { trigger: "randomized", count_unit: "participant" },
  dispositions: [
    { id: "d-complete",  label: "Completed",      is_terminal: true, source: "system" },
    { id: "d-withdrew",  label: "Withdrew consent", is_terminal: true, source: "system" },
    { id: "d-lost",      label: "Lost to follow-up", is_terminal: true, source: "system" },
    { id: "d-other",     label: "Other (specify)",  is_terminal: true, is_catch_all: true, source: "custom" },
  ],
  exportPreview: [
    { subject_id: "BOOST-001-00001", ARM: "BOOSTER", COHORT: "ADULT",  PRIOR: "PRIMARY", ITT: "ITT", DISPOSITION: "Completed" },
    { subject_id: "BOOST-001-00002", ARM: "PLACEBO", COHORT: "ELDER",  PRIOR: "BOOSTED", ITT: "ITT", DISPOSITION: "Completed" },
    { subject_id: "BOOST-014-00018", ARM: "BOOSTER", COHORT: "MIDDLE", PRIOR: "PRIMARY", ITT: "ITT", DISPOSITION: "Withdrew consent" },
  ],
};
