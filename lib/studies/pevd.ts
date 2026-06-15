// PeVD / Embolize — Phase 2 placebo-controlled study of bilateral ovarian vein
// embolization for chronic pelvic pain from pelvic venous disorders. Distinctive:
// 4-week weekly pre-treatment ePRO run-in, novel PROM validation, and a wait-list
// crossover option (control receives embolization after 6 months).
// Extracted from BRANY-approved Protocol v.12, 12 Dec 2022.

import type { StudyFixture } from "./types";

export const PEVD: StudyFixture = {
  identity: {
    id: "pevd",
    code: "EMBOLIZE",
    name: "EMBOLIZE (PeVD) · Bilateral ovarian vein embolization for pelvic venous disorder",
    tagline:
      "Phase 2 RCT vs. sham/wait-list — embolization for chronic pelvic pain.",
    sponsor: "Foundation for Venous and Lymphatic Medicine",
    indication: "Chronic pelvic pain · Pelvic venous disorder",
    archetype: "rct",
    phase: "Phase 2",
    enrollmentTarget: 40,
    duration: "12 months per participant (4-week run-in + 6-month FU + crossover option)",
    chips: ["Phase 2", "2 arms", "Weekly ePRO run-in", "6-mo primary"],
    sourceCitation: "BRANY-approved Protocol v.12 · 12 Dec 2022",
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
      assignment_mode: "rule",
      usages: ["schedule_applicability"],
      active: true,
    },
    {
      id: "tc-arm",
      category_type: "treatment",
      name: "Randomization Arm",
      allowed_values: [
        { label: "Bilateral OV embolization", export_code: "EMBO" },
        { label: "Conservative care (wait-list control)", export_code: "WAIT" },
      ],
      assignment_mode: "irt_push",
      usages: ["randomization", "treatment_assignment", "analysis_reporting"],
      active: true,
      description: "1:1 randomization at Day 1 procedure visit.",
    },
    {
      id: "tc-cycle-phase",
      category_type: "segment",
      name: "Menstrual Cycle Phase (at PROM)",
      allowed_values: [
        { label: "During menses",  export_code: "MENSES" },
        { label: "Outside menses", export_code: "OUT_MENSES" },
        { label: "Post-menopausal", export_code: "POST_MENO" },
      ],
      assignment_mode: "rule",
      usages: ["analysis_reporting", "form_applicability"],
      active: true,
      description: "Captured at each weekly PROM to support cyclical-variation analysis.",
    },
    {
      id: "tc-crossover",
      category_type: "treatment",
      name: "Crossover Status",
      allowed_values: [
        { label: "Not crossed over", export_code: "NO_XO" },
        { label: "Crossed to embolization (post-6mo)", export_code: "XO_EMBO" },
      ],
      assignment_mode: "manual",
      usages: ["treatment_assignment", "analysis_reporting"],
      active: true,
      description: "Wait-list participants may elect embolization after their 6-month primary endpoint visit.",
    },
    {
      id: "tc-itt",
      category_type: "analysis_set",
      name: "ITT Population",
      allowed_values: [{ label: "ITT", export_code: "ITT" }],
      assignment_mode: "rule",
      usages: ["analysis_reporting"],
      active: true,
    },
  ],

  tagRules: [
    {
      id: "r-arm-irt", tag_category_id: "tc-arm", trigger_type: "irt_message",
      condition_preview: "IRT randomization message at Day 1 procedure",
      target_value: "EMBO", validation_status: "ok", owner_role: "Coordinator",
    },
    {
      id: "r-cycle-form", tag_category_id: "tc-cycle-phase", trigger_type: "form_answer",
      condition_preview: "Weekly PROM form: menstrual_status field",
      target_value: "MENSES", validation_status: "ok", owner_role: "Participant (self-report)",
    },
    {
      id: "r-xo-manual", tag_category_id: "tc-crossover", trigger_type: "manual",
      condition_preview: "Participant elects crossover at Month-6 primary endpoint visit",
      target_value: "XO_EMBO", validation_status: "warning", owner_role: "PI",
    },
    {
      id: "r-itt", tag_category_id: "tc-itt", trigger_type: "conditional",
      condition_preview: "randomized = true",
      target_value: "ITT", validation_status: "ok", owner_role: "Biostatistician",
    },
  ],

  paths: [
    { id: "p-main",  name: "Main protocol path",   applies_to_expr: "ALL=ALL" },
    { id: "p-embo",  name: "Embolization arm",     applies_to_expr: "ARM=EMBO" },
    { id: "p-wait",  name: "Wait-list arm",        applies_to_expr: "ARM=WAIT" },
    { id: "p-xo",    name: "Crossover (post-6mo)", applies_to_expr: "CROSSOVER=XO_EMBO" },
  ],

  elements: [
    // 4-week run-in
    {
      id: "el-screen",
      builder_label: "Screening / Baseline",
      element_type: "scheduled",
      day_offset: -28,
      anchor: "study_start",
      applies_to_expr: "ALL=ALL",
      activities: ["ICF signed", "I/E check", "Pelvic ultrasound", "Baseline labs", "VAS pain", "PROMIS 3A/10"],
    },
    {
      id: "el-runin",
      builder_label: "Weekly run-in PROM",
      element_type: "cadence_followup",
      applies_to_expr: "ALL=ALL",
      activities: ["VAS daily-pain average", "PROMIS 3A short form", "QoL items", "Menstrual phase capture"],
      cadence: { interval_days: 7, stop_condition: "4 weekly captures complete (4 weeks)" },
      notes: "Pre-treatment run-in establishes baseline severity + cyclical variation.",
    },
    {
      id: "el-ms-randomized",
      builder_label: "Randomized",
      element_type: "milestone",
      applies_to_expr: "ALL=ALL",
      activities: [],
      notes: "IRT assigns ARM tag.",
    },

    // Day 1 procedure
    {
      id: "el-venography",
      builder_label: "Diagnostic venography",
      element_type: "scheduled",
      day_offset: 1,
      anchor: "ms_randomized",
      applies_to_expr: "ALL=ALL",
      activities: ["Diagnostic venography", "Confirmation of pelvic venous reflux"],
    },
    {
      id: "el-embolize",
      builder_label: "Bilateral OV embolization",
      element_type: "scheduled",
      day_offset: 1,
      anchor: "ms_randomized",
      applies_to_expr: "ARM=EMBO",
      activities: ["Bilateral ovarian vein embolization", "Coil/sclerosant deployment", "Post-procedure observation"],
    },
    {
      id: "el-sham",
      builder_label: "Sham procedure (control)",
      element_type: "scheduled",
      day_offset: 1,
      anchor: "ms_randomized",
      applies_to_expr: "ARM=WAIT",
      activities: ["Venography only — no embolization", "Conservative care plan reviewed"],
    },

    // Follow-up cadence
    {
      id: "el-fu-m1",
      builder_label: "Month 1 follow-up",
      element_type: "scheduled",
      day_offset: 30, anchor: "ms_randomized", window_minus: 14, window_plus: 14,
      applies_to_expr: "ALL=ALL",
      activities: ["VAS", "PROMIS 3A/10", "AE review", "Procedure-site assessment"],
    },
    {
      id: "el-fu-m3",
      builder_label: "Month 3 follow-up",
      element_type: "scheduled",
      day_offset: 90, anchor: "ms_randomized", window_minus: 14, window_plus: 14,
      applies_to_expr: "ALL=ALL",
      activities: ["VAS", "PROMIS 3A/10", "AE review"],
    },
    {
      id: "el-fu-m6",
      builder_label: "Month 6 follow-up · primary endpoint",
      element_type: "scheduled",
      day_offset: 180, anchor: "ms_randomized", window_minus: 28, window_plus: 28,
      applies_to_expr: "ALL=ALL",
      activities: ["VAS primary endpoint", "PROMIS 3A/10", "Patient global impression", "Crossover decision (wait-list arm only)"],
    },
    {
      id: "el-ms-primary",
      builder_label: "Primary endpoint reached",
      element_type: "milestone",
      applies_to_expr: "ALL=ALL",
      activities: [],
    },

    // Optional crossover
    {
      id: "el-xo-embolize",
      builder_label: "Crossover embolization (elective)",
      element_type: "scheduled",
      day_offset: 185, anchor: "ms_primary",
      applies_to_expr: "CROSSOVER=XO_EMBO",
      activities: ["Repeat venography", "Bilateral OV embolization", "Post-procedure observation"],
    },

    // End-of-study cadence
    {
      id: "el-fu-m12",
      builder_label: "Month 12 follow-up",
      element_type: "scheduled",
      day_offset: 365, anchor: "ms_randomized", window_minus: 30, window_plus: 30,
      applies_to_expr: "ALL=ALL",
      activities: ["VAS", "PROMIS 3A/10", "Long-term safety review"],
    },

    { id: "el-end-complete",  builder_label: "Study Complete",  element_type: "end_state", applies_to_expr: "ALL=ALL", activities: [] },
    { id: "el-end-withdrawn", builder_label: "Withdrew Consent", element_type: "end_state", applies_to_expr: "ALL=ALL", activities: [] },
  ],

  edges: [
    { from: "el-screen", to: "el-runin", trigger_family: "auto", trigger_label: "ICF signed + eligibility met" },
    { from: "el-runin",  to: "el-ms-randomized", trigger_family: "day_offset", trigger_label: "After 4 weekly captures" },
    { from: "el-ms-randomized", to: "el-venography", trigger_family: "auto", trigger_label: "Procedure scheduled" },
    { from: "el-venography", to: "el-embolize", trigger_family: "conditional", trigger_label: "ARM = EMBO", is_branch: true },
    { from: "el-venography", to: "el-sham",     trigger_family: "conditional", trigger_label: "ARM = WAIT", is_branch: true },
    { from: "el-embolize", to: "el-fu-m1", trigger_family: "day_offset", trigger_label: "+30 days" },
    { from: "el-sham",     to: "el-fu-m1", trigger_family: "day_offset", trigger_label: "+30 days" },
    { from: "el-fu-m1", to: "el-fu-m3", trigger_family: "day_offset", trigger_label: "+60 days" },
    { from: "el-fu-m3", to: "el-fu-m6", trigger_family: "day_offset", trigger_label: "+90 days" },
    { from: "el-fu-m6", to: "el-ms-primary", trigger_family: "auto", trigger_label: "Primary endpoint captured" },
    { from: "el-ms-primary", to: "el-xo-embolize", trigger_family: "manual", trigger_label: "Wait-list participant elects crossover" },
    { from: "el-xo-embolize", to: "el-fu-m12", trigger_family: "day_offset", trigger_label: "Continue follow-up" },
    { from: "el-ms-primary", to: "el-fu-m12", trigger_family: "day_offset", trigger_label: "+180 days" },
    { from: "el-fu-m12", to: "el-end-complete", trigger_family: "auto", trigger_label: "Final visit complete" },

    { from: "el-runin",        to: "el-end-withdrawn", trigger_family: "manual", trigger_label: "Withdraw before randomization" },
    { from: "el-ms-randomized", to: "el-end-withdrawn", trigger_family: "manual", trigger_label: "Withdraw consent" },
  ],

  visitColumns: [
    { id: "d-screen", label: "Screen",   day: -28 },
    { id: "d-w1",     label: "Wk 1",     day: -21 },
    { id: "d-w2",     label: "Wk 2",     day: -14 },
    { id: "d-w3",     label: "Wk 3",     day: -7 },
    { id: "d-rand",   label: "Random",   day: 0 },
    { id: "d-d1",     label: "Day 1",    day: 1 },
    { id: "d-m1",     label: "Month 1",  day: 30 },
    { id: "d-m3",     label: "Month 3",  day: 90 },
    { id: "d-m6",     label: "Month 6 (1°)", day: 180 },
    { id: "d-m12",    label: "Month 12", day: 365 },
  ],

  versions: [
    {
      id: "v-1-0", version_label: "v1.0", status: "Published", env: "live",
      protocol_version_label: "Protocol v.12",
      published_at: "2025-01-10 12:00", published_by: "PI · b.miller@…",
      changes: [
        { area: "Form", summary: "Initial Published version (BRANY-approved)", versioning_class: "versioning" },
      ],
    },
    {
      id: "v-1-1", version_label: "v1.1", status: "Signed Off", env: "uat",
      protocol_version_label: "Protocol v.12",
      signed_off_at: "2026-06-09 16:30", signed_off_by: "PI · b.miller@…",
      changes: [
        { area: "Setting", summary: "Month-6 window widened from ±14 to ±28 days", versioning_class: "non_versioning" },
      ],
    },
    {
      id: "v-1-2", version_label: "v1.2", status: "Draft", env: "draft",
      protocol_version_label: "Protocol v.12",
      changes: [
        { area: "Tag Category", summary: "Add Crossover Status category", versioning_class: "versioning" },
      ],
    },
  ],

  subjectId: {
    pattern: "PEVD-{site:2}-{seq:3}",
    example: "PEVD-01-014",
    sequence_scope: "site",
    zero_pad_to: 3,
  },
  enrollmentDefinition: {
    trigger: "randomized",
    count_unit: "participant",
  },
  dispositions: [
    { id: "d-complete",  label: "Completed 12 months", is_terminal: true, source: "system" },
    { id: "d-xo",        label: "Crossed over",         is_terminal: false, source: "system" },
    { id: "d-withdrew",  label: "Withdrew consent",     is_terminal: true, source: "system" },
    { id: "d-ineligible", label: "Failed run-in",       is_terminal: true, source: "system" },
    { id: "d-other",     label: "Other (specify)",      is_terminal: true, is_catch_all: true, source: "custom" },
  ],

  exportPreview: [
    { subject_id: "PEVD-01-001", ARM: "EMBO", CYCLE_PHASE: "OUT_MENSES", CROSSOVER: "NO_XO",   ITT: "ITT", DISPOSITION: "Completed 12 months" },
    { subject_id: "PEVD-01-004", ARM: "WAIT", CYCLE_PHASE: "MENSES",     CROSSOVER: "XO_EMBO", ITT: "ITT", DISPOSITION: "Crossed over" },
    { subject_id: "PEVD-02-009", ARM: "WAIT", CYCLE_PHASE: "POST_MENO",  CROSSOVER: "NO_XO",   ITT: "ITT", DISPOSITION: "Completed 12 months" },
  ],
};
