// PULSE-RX — Nathan's second demo study (physician survey, no visits).
// Stretches the StudyFixture model in the opposite direction from CARDIO-1:
// no randomization, no SDTM, no visit schedule — campaigns + quarterly waves
// over a panel of physicians. Data lifted from PULSE_PROFILE + pulseConfig()
// in TalOSSurvey/apps/web/lib/demo-studies.ts (lines 65–148).

import type { StudyFixture } from "./types";

export const PULSERX: StudyFixture = {
  identity: {
    id: "pulse-rx",
    code: "PULSE-RX",
    name: "PULSE-RX · Prescriber insights survey",
    tagline: "Quarterly physician panel on hypertension prescribing — campaign-distributed, no visit schedule.",
    sponsor: "Talosix Insights",
    indication: "Hypertension prescribing behavior (HCP survey)",
    archetype: "survey",
    enrollmentTarget: 500,
    duration: "12 months · 4 quarterly waves",
    chips: ["Survey", "500 physicians", "Campaigns", "Quarterly waves"],
    sourceCitation: "PULSE_PROFILE + pulseConfig() · TalOSSurvey demo-studies.ts",
    dataSource: "real",
  },

  vernacular: {
    journey_element_label: "Wave",
    participant_label: "Physician",
    enrollment_trigger_label: "Consented",
  },

  tagCategories: [
    {
      id: "tc-all",
      category_type: "all_participants",
      name: "All Physicians",
      allowed_values: [{ label: "All", export_code: "ALL" }],
      assignment_mode: "rule", usages: ["schedule_applicability"], active: true,
    },
    {
      id: "tc-panel",
      category_type: "subgroup",
      name: "Panel",
      allowed_values: [
        { label: "Cardiology",        export_code: "CARD" },
        { label: "Primary care",      export_code: "PCP" },
        { label: "Endocrinology",     export_code: "ENDO" },
        { label: "Internal medicine", export_code: "IM" },
        { label: "Family medicine",   export_code: "FM" },
      ],
      assignment_mode: "manual",
      usages: ["analysis_reporting", "operational_routing"], active: true,
      description: "Panel membership — captured at recruitment; drives campaign segmentation.",
    },
    {
      id: "tc-tenure",
      category_type: "segment",
      name: "Practice Tenure",
      allowed_values: [
        { label: "0–5 years",  export_code: "EARLY" },
        { label: "6–15 years", export_code: "MID" },
        { label: "16+ years",  export_code: "SENIOR" },
      ],
      assignment_mode: "rule",
      usages: ["analysis_reporting"], active: true,
    },
    {
      id: "tc-volume",
      category_type: "segment",
      name: "HTN patient volume",
      allowed_values: [
        { label: "Low (<50/mo)",   export_code: "LOW" },
        { label: "Medium (50–150/mo)", export_code: "MED" },
        { label: "High (>150/mo)", export_code: "HIGH" },
      ],
      assignment_mode: "rule",
      usages: ["analysis_reporting"], active: true,
    },
  ],

  tagRules: [
    { id: "r-panel", tag_category_id: "tc-panel", trigger_type: "manual",
      condition_preview: "Recruiter sets panel at sign-up",
      target_value: "CARD", validation_status: "ok", owner_role: "Recruiter" },
    { id: "r-tenure", tag_category_id: "tc-tenure", trigger_type: "form_answer",
      condition_preview: "Wave 1 form: YEARS_PRACTICE buckets to EARLY / MID / SENIOR",
      target_value: "MID", validation_status: "ok", owner_role: "system" },
    { id: "r-volume", tag_category_id: "tc-volume", trigger_type: "form_answer",
      condition_preview: "Wave 1 form: HTN_PER_MONTH buckets",
      target_value: "MED", validation_status: "ok", owner_role: "system" },
  ],

  paths: [
    { id: "p-main", name: "Main panel path", applies_to_expr: "ALL=ALL", description: "Every consented physician — 4 quarterly waves." },
    { id: "p-card", name: "Cardiology panel", applies_to_expr: "PANEL=CARD", description: "Cardiology-specific deep-dive items added in Wave 3." },
  ],

  elements: [
    { id: "el-consent",  builder_label: "Consent + enrollment",  element_type: "scheduled", day_offset: 0,   anchor: "study_start", applies_to_expr: "ALL=ALL", activities: ["E-acknowledgement", "Specialty + tenure capture", "Panel assignment"] },
    { id: "el-ms-enroll", builder_label: "Panel enrolled",       element_type: "milestone", applies_to_expr: "ALL=ALL", activities: [] },
    { id: "el-w1",       builder_label: "Q2 2026 wave (W1)",     element_type: "scheduled", day_offset: 0,   anchor: "ms_enroll", window_minus: 0, window_plus: 14, applies_to_expr: "ALL=ALL", activities: ["First-line preference", "Barriers checkbox", "Confidence rating", "Unmet need (free text)"] },
    { id: "el-w2",       builder_label: "Q3 2026 wave (W2)",     element_type: "scheduled", day_offset: 90,  anchor: "ms_enroll", window_minus: 0, window_plus: 14, applies_to_expr: "ALL=ALL", activities: ["Treatment shifts", "New guidelines awareness", "Therapeutic inertia items"] },
    { id: "el-w3",       builder_label: "Q4 2026 wave (W3)",     element_type: "scheduled", day_offset: 180, anchor: "ms_enroll", window_minus: 0, window_plus: 14, applies_to_expr: "ALL=ALL", activities: ["First-line preference", "Resistant HTN management", "Specialty-specific items"] },
    { id: "el-w4",       builder_label: "Q1 2027 wave (W4)",     element_type: "scheduled", day_offset: 270, anchor: "ms_enroll", window_minus: 0, window_plus: 14, applies_to_expr: "ALL=ALL", activities: ["First-line preference (closing wave)", "Year-over-year delta items", "Panel exit interview"] },
    { id: "el-reminder", builder_label: "Reminder cadence",      element_type: "cadence_followup", applies_to_expr: "ALL=ALL", activities: ["Email reminder", "Optional SMS"], cadence: { interval_days: 3, stop_condition: "Wave response received OR wave window closes" } },
    { id: "el-end-complete",  builder_label: "Panel exit",            element_type: "end_state", applies_to_expr: "ALL=ALL", activities: [] },
    { id: "el-end-optout",    builder_label: "Opted out",             element_type: "end_state", applies_to_expr: "ALL=ALL", activities: [] },
  ],

  edges: [
    { from: "el-consent",   to: "el-ms-enroll", trigger_family: "auto", trigger_label: "E-acknowledgement received" },
    { from: "el-ms-enroll", to: "el-w1",        trigger_family: "auto", trigger_label: "Wave 1 invitation sent" },
    { from: "el-w1", to: "el-reminder", trigger_family: "auto",         trigger_label: "No response after 3 days" },
    { from: "el-w1", to: "el-w2", trigger_family: "day_offset",         trigger_label: "+90 days" },
    { from: "el-w2", to: "el-w3", trigger_family: "day_offset",         trigger_label: "+90 days" },
    { from: "el-w3", to: "el-w4", trigger_family: "day_offset",         trigger_label: "+90 days" },
    { from: "el-w4", to: "el-end-complete", trigger_family: "auto",     trigger_label: "Final wave submitted" },
    { from: "el-w1", to: "el-end-optout",   trigger_family: "manual",   trigger_label: "Physician opts out" },
  ],

  visitColumns: [
    { id: "d-enroll", label: "Enroll", day: 0 },
    { id: "d-w1",     label: "W1 Q2",  day: 0 },
    { id: "d-w2",     label: "W2 Q3",  day: 90 },
    { id: "d-w3",     label: "W3 Q4",  day: 180 },
    { id: "d-w4",     label: "W4 Q1",  day: 270 },
  ],

  versions: [
    {
      id: "v-1-0", version_label: "v1.0", status: "Published", env: "live",
      protocol_version_label: "Panel charter v1.0",
      published_at: "2026-05-20 15:00", published_by: "Account Manager · a.admin@…",
      changes: [
        { area: "Form", summary: "Initial wave 1 instrument · panel structure", versioning_class: "versioning" },
      ],
    },
  ],

  subjectId: { pattern: "PR-{seq:4}", example: "PR-0042", sequence_scope: "study", zero_pad_to: 4 },
  enrollmentDefinition: { trigger: "consented", count_unit: "participant" },
  dispositions: [
    { id: "d-active",    label: "Active in panel",  is_terminal: false, source: "system" },
    { id: "d-complete",  label: "Completed all 4 waves", is_terminal: true, source: "system" },
    { id: "d-partial",   label: "Partial completion",    is_terminal: true, source: "system" },
    { id: "d-optout",    label: "Opted out",        is_terminal: true, source: "system" },
    { id: "d-other",     label: "Other (specify)",  is_terminal: true, is_catch_all: true, source: "custom" },
  ],
  exportPreview: [
    { subject_id: "PR-0001", PANEL: "CARD", TENURE: "MID",    VOLUME: "HIGH", DISPOSITION: "Active in panel" },
    { subject_id: "PR-0014", PANEL: "PCP",  TENURE: "EARLY",  VOLUME: "MED",  DISPOSITION: "Active in panel" },
    { subject_id: "PR-0042", PANEL: "ENDO", TENURE: "SENIOR", VOLUME: "LOW",  DISPOSITION: "Partial completion" },
  ],

  sources: [
    { filename: "Panel charter v1.0 · PULSE-RX (internal demo)", kind: "protocol", status: "extracted",
      contributes_to: ["identity", "tagCategories", "elements", "paths"],
      note: "Nathan's survey-archetype demo study; demonstrates the no-visit-schedule shape." },
  ],

  provenance: {
    "identity.sponsor": { source: "Panel charter v1.0 · PULSE-RX (internal demo)", quote: "Talosix Insights — internal demo sponsor." },
    "identity.indication": { source: "Panel charter v1.0 · PULSE-RX (internal demo)", quote: "Quarterly survey of practicing cardiologists, internists, and primary-care physicians on hypertension prescribing behavior, barriers, and unmet needs." },
    "identity.archetype": { source: "Panel charter v1.0 · PULSE-RX (internal demo)", quote: "Survey · HCP panel · campaign-distributed, no visit schedule — quarterly waves over 12 months." },
    "identity.enrollmentTarget": { source: "Panel charter v1.0 · PULSE-RX (internal demo)", quote: "Target panel size: 500 physicians (cardiology, internal medicine, PCP, endocrinology)." },
  },
};
