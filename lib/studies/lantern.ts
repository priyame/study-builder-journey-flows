// LANTERN — Ondine Biomedical SSI prevention Phase 3 group-randomized crossover.
// Extracted from Protocol V3.0 (16 Apr 2025) + Crossover Plan V3 (27 Feb 2026)
// + Clinical Safety Plan v4.0 (27 May 2026). Site-level randomization with
// period 1 → crossover → period 2 is the distinctive shape.

import type { StudyFixture } from "./types";

export const LANTERN: StudyFixture = {
  identity: {
    id: "lantern",
    code: "LANTERN",
    name: "LANTERN · Photodisinfection vs. SOC for SSI prevention",
    tagline:
      "Nasal aPDT (methylene blue + chlorhexidine + 664nm laser) vs. SOC — site-randomized crossover.",
    sponsor: "Ondine Biomedical Inc.",
    indication: "Surgical Site Infection prevention",
    archetype: "site_crossover",
    phase: "Phase 3",
    enrollmentTarget: 4740,
    duration: "~60 days per patient (Day -30 screening → Day 30 follow-up)",
    chips: ["Phase 3", "30 hospitals", "Site crossover", "30-day FU"],
    sourceCitation:
      "Protocol V3.0 (OBI-NPDT-SSI-004) · Crossover Plan V3 · Safety Plan v4.0",
    dataSource: "real",
  },

  vernacular: {
    journey_element_label: "Visit",
    participant_label: "Patient",
    enrollment_trigger_label: "Consented + Eligible",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Tags & Rules
  // ─────────────────────────────────────────────────────────────────────────
  tagCategories: [
    {
      id: "tc-all",
      category_type: "all_participants",
      name: "All Patients",
      allowed_values: [{ label: "All", export_code: "ALL" }],
      assignment_mode: "rule",
      usages: ["schedule_applicability", "form_applicability"],
      active: true,
      description: "Sentinel category — cannot be deleted.",
    },
    {
      id: "tc-arm",
      category_type: "treatment",
      name: "Period Arm",
      allowed_values: [
        { label: "aPDT (NF-031 + 664nm light)", export_code: "APDT" },
        { label: "Standard of Care",            export_code: "SOC" },
      ],
      // Site-level randomization — when a site is in its aPDT period, every
      // newly enrolled patient gets APDT. The IRT pushes the tag at enrollment.
      assignment_mode: "irt_push",
      usages: ["treatment_assignment", "analysis_reporting", "form_applicability"],
      active: true,
      description:
        "Determined by the SITE's current period, not by patient-level randomization (group-randomized design).",
    },
    {
      id: "tc-period",
      category_type: "operational",
      name: "Site Period",
      allowed_values: [
        { label: "Period 1",  export_code: "P1" },
        { label: "Crossover", export_code: "XO" }, // 2-6 week inactive interval
        { label: "Period 2",  export_code: "P2" },
      ],
      assignment_mode: "external_mapping",
      usages: ["analysis_reporting", "operational_routing"],
      active: true,
      description: "Site moves through P1 → XO (2-6 week inactive) → P2.",
    },
    {
      id: "tc-surgery-type",
      category_type: "segment",
      name: "Surgery Type",
      allowed_values: [
        { label: "Cardiac",      export_code: "CARDIAC" },
        { label: "Vascular",     export_code: "VASCULAR" },
        { label: "Orthopedic",   export_code: "ORTHO" },
        { label: "Neurosurgery", export_code: "NEURO" },
        { label: "Breast",       export_code: "BREAST" },
      ],
      assignment_mode: "rule",
      usages: ["analysis_reporting", "schedule_applicability"],
      active: true,
      description: "Major elective/urgent/emergency surgery categories.",
    },
    {
      id: "tc-substudy",
      category_type: "subgroup",
      name: "Nasal Microbiota Substudy",
      allowed_values: [
        { label: "Enrolled",    export_code: "MICRO_IN" },
        { label: "Not in substudy", export_code: "NONE" },
      ],
      assignment_mode: "manual",
      usages: ["schedule_applicability", "operational_routing"],
      active: true,
      description:
        "Separate ICF; ~500 patients across 4-8 sites get pre/post nasal swabs.",
    },
    {
      id: "tc-ssi",
      category_type: "exposure",
      name: "SSI Outcome",
      allowed_values: [
        { label: "No SSI detected",      export_code: "NO_SSI" },
        { label: "Suspected SSI",        export_code: "SUSPECT" },
        { label: "Confirmed SSI (EAC)",  export_code: "CONFIRMED" },
      ],
      assignment_mode: "rule",
      usages: ["safety_monitoring", "analysis_reporting"],
      active: true,
      description:
        "Adjudicated blind by the Endpoint Adjudication Committee per CDC NHSN.",
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
      id: "r-arm-site",
      tag_category_id: "tc-arm",
      trigger_type: "irt_message",
      condition_preview:
        "On enrollment: read site.current_period_arm from IRT and stamp at patient level",
      target_value: "APDT",
      validation_status: "ok",
      owner_role: "Account Manager",
    },
    {
      id: "r-period-site",
      tag_category_id: "tc-period",
      trigger_type: "state_transition",
      condition_preview:
        "Site activates P1 → tag P1. Site enters crossover → tag XO. Site re-activates → tag P2.",
      target_value: "P1",
      validation_status: "ok",
      owner_role: "CRO Admin",
    },
    {
      id: "r-surgery",
      tag_category_id: "tc-surgery-type",
      trigger_type: "form_answer",
      condition_preview:
        "Screening.SurgeryType ∈ {Cardiac, Vascular, Orthopedic, Neurosurgery, Breast}",
      target_value: "CARDIAC",
      validation_status: "ok",
      owner_role: "PI",
    },
    {
      id: "r-substudy-manual",
      tag_category_id: "tc-substudy",
      trigger_type: "manual",
      condition_preview:
        "Substudy ICF signed at Screening (site eligibility ≤ 8 sites; cap ≤ 500 patients across study)",
      target_value: "MICRO_IN",
      validation_status: "warning",
      owner_role: "Coordinator",
    },
    {
      id: "r-ssi-suspect",
      tag_category_id: "tc-ssi",
      trigger_type: "event_trigger",
      condition_preview:
        "Unscheduled visit raised with SSI checklist positive OR Day-30 call surfaces SSI signs",
      target_value: "SUSPECT",
      validation_status: "ok",
      owner_role: "PI",
    },
    {
      id: "r-ssi-confirm",
      tag_category_id: "tc-ssi",
      trigger_type: "conditional",
      condition_preview:
        "EAC adjudication = positive per CDC NHSN criteria (blinded review)",
      target_value: "CONFIRMED",
      validation_status: "ok",
      owner_role: "EAC Chair",
    },
    {
      id: "r-itt",
      tag_category_id: "tc-itt",
      trigger_type: "conditional",
      condition_preview:
        "patient.enrolled = true AND patient.received_treatment_or_soc = true",
      target_value: "ITT",
      validation_status: "ok",
      owner_role: "Biostatistician",
    },
  ],

  // ─────────────────────────────────────────────────────────────────────────
  // Journey — paths, milestones, scheduled visits, branches
  // ─────────────────────────────────────────────────────────────────────────
  paths: [
    {
      id: "p-main",
      name: "Main protocol path",
      applies_to_expr: "ALL=ALL",
      description: "Every patient — screen, surgery day, 30-day follow-up.",
    },
    {
      id: "p-apdt",
      name: "aPDT period path",
      applies_to_expr: "ARM=APDT",
      description: "Patients enrolled while their site is in the aPDT period.",
    },
    {
      id: "p-soc",
      name: "SOC period path",
      applies_to_expr: "ARM=SOC",
      description: "Patients enrolled while their site is in the SOC period.",
    },
    {
      id: "p-micro",
      name: "Nasal microbiota substudy",
      applies_to_expr: "MICRO=MICRO_IN",
      description: "Adds pre/post nasal swab collection at screening and Day 0.",
    },
  ],

  elements: [
    // Pre-surgery
    {
      id: "el-screen",
      builder_label: "Screening Visit (V1)",
      element_type: "scheduled",
      day_offset: -14,
      anchor: "study_start",
      window_minus: 16, // can be as early as Day -30
      window_plus: 13,  // up to Day -1
      applies_to_expr: "ALL=ALL",
      activities: ["ICF signed", "Demographics", "Medical history", "I/E check", "Pregnancy test", "Concomitant meds (14d)"],
    },
    {
      id: "el-screen-micro",
      builder_label: "Nasal swab — baseline (substudy)",
      element_type: "scheduled",
      day_offset: -1,
      anchor: "study_start",
      applies_to_expr: "MICRO=MICRO_IN",
      activities: ["Nasal swab — S. aureus quantification", "Substudy ICF check"],
      notes: "Only collected for the ~500 substudy patients.",
    },
    {
      id: "el-ms-enrolled",
      builder_label: "Enrolled",
      element_type: "milestone",
      applies_to_expr: "ALL=ALL",
      activities: [],
      notes: "I/E met + ICF signed. IRT stamps ARM and PERIOD tags at this point.",
    },

    // Surgery day
    {
      id: "el-preop",
      builder_label: "Pre-op preparation",
      element_type: "scheduled",
      day_offset: 0,
      anchor: "ms_enrolled",
      applies_to_expr: "ALL=ALL",
      activities: ["Final I/E confirmation", "Vitals", "Physical exam", "ASA score", "Pregnancy retest"],
    },
    {
      id: "el-apdt-treat",
      builder_label: "aPDT administration",
      element_type: "scheduled",
      day_offset: 0,
      anchor: "ms_enrolled",
      applies_to_expr: "ARM=APDT",
      activities: ["NF-031 instillation", "664nm illumination ×2 (2 min each)", "Tolerability assessment", "Post-aPDT nasal swab (substudy)"],
      notes: "Must be administered within 300 minutes prior to surgical start.",
    },
    {
      id: "el-ms-surgery",
      builder_label: "Surgery",
      element_type: "milestone",
      applies_to_expr: "ALL=ALL",
      activities: [],
      notes: "Study Day 0 anchor. Surgical parameters captured intra-op.",
    },
    {
      id: "el-postop",
      builder_label: "Post-op observation (V2)",
      element_type: "scheduled",
      day_offset: 0,
      anchor: "ms_surgery",
      applies_to_expr: "ALL=ALL",
      activities: ["Vitals recovery", "AE collection start", "Wound check baseline"],
    },

    // 30-day monitoring
    {
      id: "el-monitor",
      builder_label: "Post-op SSI monitoring",
      element_type: "cadence_followup",
      applies_to_expr: "ALL=ALL",
      activities: ["EMR review", "Patient self-report check", "Automated symptom reminders"],
      cadence: { interval_days: 7, stop_condition: "Day 30 follow-up complete OR withdrawal" },
      notes: "Passive — no per-day visit; triggers unscheduled SSI Assessment when symptoms surface.",
    },
    {
      id: "el-ssi-eval",
      builder_label: "Unscheduled SSI Assessment",
      element_type: "event_triggered",
      applies_to_expr: "ALL=ALL",
      activities: ["Targeted PE", "Wound culture", "SSI checklist (NHSN)", "EAC packet prepared"],
      notes: "Repeatable. Triggers EAC adjudication path.",
    },
    {
      id: "el-fu30",
      builder_label: "Day-30 follow-up (V3)",
      element_type: "scheduled",
      day_offset: 30,
      anchor: "ms_surgery",
      window_minus: 4,
      window_plus: 4,
      applies_to_expr: "ALL=ALL",
      activities: ["Phone call", "AE review", "Readmission status", "Late-onset SSI checklist", "Concomitant meds"],
    },
    {
      id: "el-ms-complete",
      builder_label: "30-day follow-up complete",
      element_type: "milestone",
      applies_to_expr: "ALL=ALL",
      activities: [],
    },

    // End states
    { id: "el-end-complete",   builder_label: "Study Complete",  element_type: "end_state", applies_to_expr: "ALL=ALL", activities: [] },
    { id: "el-end-withdrawn",  builder_label: "Withdrew Consent", element_type: "end_state", applies_to_expr: "ALL=ALL", activities: [] },
    { id: "el-end-lost",       builder_label: "Lost to Follow-up", element_type: "end_state", applies_to_expr: "ALL=ALL", activities: [] },
  ],

  edges: [
    // Screening → enrolled
    { from: "el-screen", to: "el-screen-micro", trigger_family: "conditional", trigger_label: "Substudy ICF signed" },
    { from: "el-screen", to: "el-ms-enrolled", trigger_family: "conditional", trigger_label: "I/E met + ICF signed" },

    // Branch: aPDT vs SOC (driven by site period — modeled as conditional on ARM tag)
    { from: "el-ms-enrolled", to: "el-preop", trigger_family: "auto", trigger_label: "Surgery date scheduled" },
    { from: "el-preop", to: "el-apdt-treat", trigger_family: "conditional", trigger_label: "ARM = APDT", is_branch: true },
    { from: "el-preop", to: "el-ms-surgery", trigger_family: "conditional", trigger_label: "ARM = SOC (direct to surgery)", is_branch: true },
    { from: "el-apdt-treat", to: "el-ms-surgery", trigger_family: "day_offset", trigger_label: "≤ 300 min after aPDT" },

    // Surgery → 30-day flow
    { from: "el-ms-surgery", to: "el-postop", trigger_family: "auto", trigger_label: "OR exit" },
    { from: "el-postop", to: "el-monitor", trigger_family: "auto", trigger_label: "Discharge or step-down" },
    { from: "el-monitor", to: "el-ssi-eval", trigger_family: "auto", trigger_label: "SSI symptom flagged (event_trigger)" },
    { from: "el-ssi-eval", to: "el-monitor", trigger_family: "auto", trigger_label: "Adjudication complete · continue monitoring" },
    { from: "el-monitor", to: "el-fu30", trigger_family: "day_offset", trigger_label: "Day 30 (-4/+4) from surgery" },
    { from: "el-fu30", to: "el-ms-complete", trigger_family: "auto", trigger_label: "Day-30 call complete" },
    { from: "el-ms-complete", to: "el-end-complete", trigger_family: "auto", trigger_label: "All FU complete" },

    // Manual exits
    { from: "el-ms-enrolled", to: "el-end-withdrawn", trigger_family: "manual", trigger_label: "Withdraw consent" },
    { from: "el-monitor", to: "el-end-lost", trigger_family: "manual", trigger_label: "Lost to follow-up (documented attempts)" },
  ],

  visitColumns: [
    { id: "d-screen", label: "Screen", day: -14 },
    { id: "d-pre",    label: "Pre-op", day: 0 },
    { id: "d-apdt",   label: "aPDT",   day: 0 },
    { id: "d-surg",   label: "Surgery", day: 0 },
    { id: "d-post",   label: "Post-op", day: 0 },
    { id: "d-d7",     label: "Wk 1",    day: 7 },
    { id: "d-d14",    label: "Wk 2",    day: 14 },
    { id: "d-d21",    label: "Wk 3",    day: 21 },
    { id: "d-fu30",   label: "Day 30",  day: 30 },
  ],

  // ─────────────────────────────────────────────────────────────────────────
  // Versions
  // ─────────────────────────────────────────────────────────────────────────
  versions: [
    {
      id: "v-3-0", version_label: "v3.0", status: "Published", env: "live",
      protocol_version_label: "Protocol V3.0",
      published_at: "2026-05-01 09:00", published_by: "CRO Admin · m.li@…",
      changes: [
        { area: "Form",         summary: "SSI checklist aligned to CDC NHSN 2024 update", versioning_class: "versioning" },
        { area: "Tag Category", summary: "Surgery Type — added Breast", versioning_class: "versioning" },
      ],
    },
    {
      id: "v-2-1", version_label: "v2.1", status: "Retired", env: "live",
      protocol_version_label: "Protocol V2.1",
      published_at: "2025-08-12 11:00", published_by: "CRO Admin · m.li@…",
      changes: [
        { area: "Setting", summary: "Day-30 window relaxed from ±2 to ±4 days", versioning_class: "non_versioning" },
      ],
    },
    {
      id: "v-3-1", version_label: "v3.1", status: "Signed Off", env: "uat",
      protocol_version_label: "Protocol V3.0",
      signed_off_at: "2026-06-12 14:22",
      signed_off_by: "Account Manager · jrose@…",
      changes: [
        { area: "Edit Check", summary: "Pregnancy test required for all WOCBP regardless of surgery type", versioning_class: "non_versioning" },
      ],
    },
    {
      id: "v-3-2", version_label: "v3.2", status: "Draft", env: "draft",
      protocol_version_label: "Protocol V3.0",
      changes: [
        { area: "Journey", summary: "Add nasal microbiota substudy path with separate ICF gate", versioning_class: "versioning" },
      ],
    },
  ],

  // ─────────────────────────────────────────────────────────────────────────
  // Subjects, enrollment, dispositions
  // ─────────────────────────────────────────────────────────────────────────
  subjectId: {
    pattern: "{country}-{site:3}-{seq:4}",
    example: "US-001-0042",
    sequence_scope: "site",
    zero_pad_to: 4,
  },
  enrollmentDefinition: {
    trigger: "screened_and_eligible",
    count_unit: "participant",
  },
  dispositions: [
    { id: "d-complete",  label: "Completed",              is_terminal: true, source: "system" },
    { id: "d-withdrew",  label: "Withdrew consent",       is_terminal: true, source: "system" },
    { id: "d-lost",      label: "Lost to follow-up",      is_terminal: true, source: "system" },
    { id: "d-discont",   label: "Discontinued treatment", is_terminal: false, source: "system" },
    { id: "d-other",     label: "Other (specify)",        is_terminal: true, is_catch_all: true, source: "custom" },
  ],

  // ─────────────────────────────────────────────────────────────────────────
  // Export-shape preview
  // ─────────────────────────────────────────────────────────────────────────
  exportPreview: [
    { subject_id: "US-001-0001", ARM: "APDT", PERIOD: "P1", SURGERY: "CARDIAC", MICRO: "MICRO_IN",  SSI: "NO_SSI",     ITT: "ITT", DISPOSITION: "Completed" },
    { subject_id: "US-001-0014", ARM: "APDT", PERIOD: "P1", SURGERY: "ORTHO",   MICRO: "NONE",       SSI: "CONFIRMED",  ITT: "ITT", DISPOSITION: "Completed" },
    { subject_id: "US-014-0007", ARM: "SOC",  PERIOD: "P1", SURGERY: "VASCULAR", MICRO: "NONE",      SSI: "NO_SSI",     ITT: "ITT", DISPOSITION: "Withdrew consent" },
  ],
};
