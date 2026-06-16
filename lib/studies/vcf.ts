// VCF Registry — Vena Cava Filter outcomes registry. ICF-only (no readable
// protocol PDF in the source folder); journey shape is inferred from the ICF
// summary text and standard VCF registry practice. Mostly cadence-based
// follow-up around the filter placement / retrieval event.

import type { StudyFixture } from "./types";

export const VCF: StudyFixture = {
  identity: {
    id: "vcf",
    code: "VCF",
    name: "VCF Registry · Vena Cava Filter outcomes registry",
    tagline:
      "Multi-site registry tracking VCF placement, complications, and retrieval outcomes.",
    sponsor: "Sponsor TBD — protocol not in source pack",
    indication: "Venous thromboembolism · Vena cava filter management",
    archetype: "registry",
    enrollmentTarget: undefined,
    duration: "5-year follow-up per patient (annual cadence)",
    chips: ["Registry", "Observational", "Annual FU", "ICF-only source"],
    sourceCitation: "ICF CLEAN - VCF Registry (V1.3, 7.31.2023) — full protocol pending",
    dataSource: "icf_only",
    dataNote:
      "Only the participant ICF was in the source pack — the journey, tags, and visit cadence below are inferred from the ICF summary and standard VCF registry practice. Replace with real protocol facts before sharing.",
  },

  vernacular: {
    journey_element_label: "Visit",
    participant_label: "Patient",
    enrollment_trigger_label: "Consented",
  },

  tagCategories: [
    {
      id: "tc-all", category_type: "all_participants", name: "All Patients",
      allowed_values: [{ label: "All", export_code: "ALL" }],
      assignment_mode: "rule", usages: ["analysis_reporting"], active: true,
    },
    {
      id: "tc-indication", category_type: "cohort", name: "Indication for Filter",
      allowed_values: [
        { label: "Pulmonary embolism prevention",  export_code: "PE_PREV" },
        { label: "DVT with contraindication to anticoagulation", export_code: "DVT_NOAC" },
        { label: "Trauma prophylaxis",             export_code: "TRAUMA" },
        { label: "Other",                          export_code: "OTHER" },
      ],
      assignment_mode: "rule", usages: ["analysis_reporting"], active: true,
    },
    {
      id: "tc-filter-type", category_type: "exposure", name: "Filter Type",
      allowed_values: [
        { label: "Permanent",            export_code: "PERMANENT" },
        { label: "Retrievable",          export_code: "RETRIEVABLE" },
        { label: "Convertible",          export_code: "CONVERT" },
      ],
      assignment_mode: "rule", usages: ["analysis_reporting"], active: true,
    },
    {
      id: "tc-retrieval", category_type: "treatment", name: "Retrieval Status",
      allowed_values: [
        { label: "Filter in place",          export_code: "IN_PLACE" },
        { label: "Retrieved successfully",   export_code: "RETRIEVED" },
        { label: "Retrieval attempted — failed", export_code: "FAILED_RETR" },
        { label: "Permanent — not eligible", export_code: "PERM" },
      ],
      assignment_mode: "rule", usages: ["analysis_reporting", "schedule_applicability"], active: true,
    },
    {
      id: "tc-complication", category_type: "exposure", name: "Complication Event",
      allowed_values: [
        { label: "None",                  export_code: "NONE" },
        { label: "Filter migration",      export_code: "MIGRATION" },
        { label: "Perforation",           export_code: "PERFORATION" },
        { label: "Recurrent DVT/PE",      export_code: "RECURRENT_VTE" },
        { label: "Fracture",              export_code: "FRACTURE" },
        { label: "Other complication",    export_code: "OTHER_COMPL" },
      ],
      assignment_mode: "manual", usages: ["safety_monitoring", "analysis_reporting"], active: true,
    },
  ],

  tagRules: [
    { id: "r-indication", tag_category_id: "tc-indication", trigger_type: "form_answer",
      condition_preview: "Baseline.indication answer", target_value: "PE_PREV",
      validation_status: "ok", owner_role: "Coordinator" },
    { id: "r-type", tag_category_id: "tc-filter-type", trigger_type: "form_answer",
      condition_preview: "Procedure.filter_model lookup", target_value: "RETRIEVABLE",
      validation_status: "ok", owner_role: "Coordinator" },
    { id: "r-retrieval", tag_category_id: "tc-retrieval", trigger_type: "event_trigger",
      condition_preview: "On retrieval procedure event: status = RETRIEVED or FAILED_RETR",
      target_value: "IN_PLACE", validation_status: "ok", owner_role: "Treating IR" },
    { id: "r-complication-manual", tag_category_id: "tc-complication", trigger_type: "manual",
      condition_preview: "Manual logging at each annual visit",
      target_value: "MIGRATION", validation_status: "ok", owner_role: "Treating IR" },
  ],

  paths: [
    { id: "p-main",      name: "Registry main path",     applies_to_expr: "ALL=ALL" },
    { id: "p-retrieved", name: "Retrieved filters",      applies_to_expr: "RETRIEVAL=RETRIEVED", description: "Lighter post-retrieval cadence." },
    { id: "p-perm",      name: "Permanent filters",      applies_to_expr: "RETRIEVAL=PERM",      description: "Lifetime annual surveillance." },
  ],

  elements: [
    { id: "el-consent",    builder_label: "Consent + Enrollment", element_type: "scheduled", day_offset: 0, anchor: "study_start", applies_to_expr: "ALL=ALL", activities: ["ICF signed", "Demographics", "Indication for filter", "Comorbidities"] },
    { id: "el-ms-enroll",  builder_label: "Enrolled in registry", element_type: "milestone", applies_to_expr: "ALL=ALL", activities: [] },
    { id: "el-placement",  builder_label: "Filter placement procedure", element_type: "scheduled", day_offset: 0, anchor: "ms_enroll", applies_to_expr: "ALL=ALL", activities: ["Procedure documentation", "Filter model + lot", "Imaging confirmation", "Indication captured"] },
    { id: "el-ms-placed",  builder_label: "Filter in place", element_type: "milestone", applies_to_expr: "ALL=ALL", activities: [] },
    { id: "el-fu-6m",      builder_label: "6-month follow-up", element_type: "scheduled", day_offset: 180, anchor: "ms_placed", window_minus: 30, window_plus: 30, applies_to_expr: "ALL=ALL", activities: ["Imaging", "Complication screen", "Retrieval candidacy review"] },
    { id: "el-retrieve",   builder_label: "Retrieval procedure (if eligible)", element_type: "event_triggered", applies_to_expr: "FILTER_TYPE=RETRIEVABLE OR FILTER_TYPE=CONVERT", activities: ["Retrieval attempt", "Retrieval outcome documented", "Post-procedure imaging"], notes: "Triggers RETRIEVAL tag update." },
    { id: "el-annual",     builder_label: "Annual surveillance", element_type: "cadence_followup", applies_to_expr: "ALL=ALL", activities: ["Imaging if indicated", "Complication screen", "VTE recurrence assessment", "QoL"], cadence: { interval_days: 365, stop_condition: "5 years complete OR death OR LTFU" } },
    { id: "el-complication", builder_label: "Complication event", element_type: "event_triggered", applies_to_expr: "ALL=ALL", activities: ["Event characterization", "Imaging if indicated", "Treatment plan"], notes: "Repeatable; sets COMPLICATION tag." },
    { id: "el-end-complete",  builder_label: "5-year registry exit", element_type: "end_state", applies_to_expr: "ALL=ALL", activities: [] },
    { id: "el-end-death",     builder_label: "Death",               element_type: "end_state", applies_to_expr: "ALL=ALL", activities: [] },
    { id: "el-end-lost",      builder_label: "Lost to follow-up",   element_type: "end_state", applies_to_expr: "ALL=ALL", activities: [] },
    { id: "el-end-withdrawn", builder_label: "Consent withdrawn",   element_type: "end_state", applies_to_expr: "ALL=ALL", activities: [] },
  ],

  edges: [
    { from: "el-consent",   to: "el-ms-enroll",   trigger_family: "auto", trigger_label: "ICF signed" },
    { from: "el-ms-enroll", to: "el-placement",   trigger_family: "auto", trigger_label: "Procedure scheduled" },
    { from: "el-placement", to: "el-ms-placed",   trigger_family: "auto", trigger_label: "Imaging confirms placement" },
    { from: "el-ms-placed", to: "el-fu-6m",       trigger_family: "day_offset", trigger_label: "+180 days" },
    { from: "el-fu-6m",     to: "el-retrieve",    trigger_family: "conditional", trigger_label: "Retrieval candidate" },
    { from: "el-fu-6m",     to: "el-annual",      trigger_family: "auto", trigger_label: "Continue annual surveillance" },
    { from: "el-retrieve",  to: "el-annual",      trigger_family: "auto", trigger_label: "Post-retrieval continues at annual cadence" },
    { from: "el-annual",    to: "el-complication", trigger_family: "auto", trigger_label: "Complication flagged" },
    { from: "el-complication", to: "el-annual",   trigger_family: "auto", trigger_label: "Continue surveillance" },
    { from: "el-annual",    to: "el-end-complete", trigger_family: "day_offset", trigger_label: "5 years complete" },
    { from: "el-annual",    to: "el-end-death",    trigger_family: "manual", trigger_label: "Death documented" },
    { from: "el-annual",    to: "el-end-lost",     trigger_family: "manual", trigger_label: "Lost to follow-up" },
    { from: "el-ms-enroll", to: "el-end-withdrawn", trigger_family: "manual", trigger_label: "Withdraw consent" },
  ],

  visitColumns: [
    { id: "d-enroll", label: "Enroll",   day: 0 },
    { id: "d-place",  label: "Placement", day: 0 },
    { id: "d-6m",     label: "6 mo",     day: 180 },
    { id: "d-y1",     label: "Year 1",   day: 365 },
    { id: "d-y2",     label: "Year 2",   day: 730 },
    { id: "d-y3",     label: "Year 3",   day: 1095 },
    { id: "d-y4",     label: "Year 4",   day: 1460 },
    { id: "d-y5",     label: "Year 5",   day: 1825 },
  ],

  versions: [
    {
      id: "v-1-3", version_label: "v1.3", status: "Published", env: "live",
      protocol_version_label: "Registry Protocol v1.3",
      published_at: "2024-08-01 11:00", published_by: "Registry Admin",
      changes: [
        { area: "Form", summary: "ICF v1.3 (current)", versioning_class: "versioning" },
      ],
    },
  ],

  subjectId: {
    pattern: "VCF-{site:3}-{seq:5}",
    example: "VCF-012-00134",
    sequence_scope: "site",
    zero_pad_to: 5,
  },
  enrollmentDefinition: { trigger: "consented", count_unit: "participant" },
  dispositions: [
    { id: "d-active",   label: "Active in registry",  is_terminal: false, source: "system" },
    { id: "d-complete", label: "5-year exit",         is_terminal: true,  source: "system" },
    { id: "d-death",    label: "Deceased",            is_terminal: true,  source: "system" },
    { id: "d-lost",     label: "Lost to follow-up",   is_terminal: true,  source: "system" },
    { id: "d-withdrew", label: "Consent withdrawn",   is_terminal: true,  source: "system" },
    { id: "d-other",    label: "Other (specify)",     is_terminal: true,  is_catch_all: true, source: "custom" },
  ],
  exportPreview: [
    { subject_id: "VCF-001-00001", INDICATION: "PE_PREV",    FILTER_TYPE: "RETRIEVABLE", RETRIEVAL: "RETRIEVED",     COMPLICATION: "NONE",       DISPOSITION: "5-year exit" },
    { subject_id: "VCF-001-00004", INDICATION: "DVT_NOAC",   FILTER_TYPE: "PERMANENT",   RETRIEVAL: "PERM",          COMPLICATION: "MIGRATION",  DISPOSITION: "Active in registry" },
    { subject_id: "VCF-012-00018", INDICATION: "TRAUMA",     FILTER_TYPE: "RETRIEVABLE", RETRIEVAL: "FAILED_RETR",   COMPLICATION: "FRACTURE",   DISPOSITION: "Active in registry" },
  ],

  sources: [
    { filename: "ICF CLEAN - VCF Registry (V1.3, 7.31.2023).pdf", kind: "icf", status: "icf_only",
      contributes_to: [],
      note: "Only the participant ICF is in the source pack — no protocol. Identity / journey / tags below are inferred from the ICF summary and standard VCF registry practice." },
  ],

  provenance: {
    "identity.indication": {
      source: "ICF CLEAN - VCF Registry (V1.3, 7.31.2023).pdf",
      quote: "Vena Cava Filter management — patients with PE prophylaxis, DVT with anticoagulation contraindication, or trauma prophylaxis. (Inferred from ICF text.)",
    },
    "identity.archetype": {
      source: "ICF CLEAN - VCF Registry (V1.3, 7.31.2023).pdf",
      quote: "Observational registry; standard VCF registries enroll at placement and follow longitudinally for 5+ years with periodic retrieval candidacy review.",
    },
    "tags.filterType": {
      source: "ICF CLEAN - VCF Registry (V1.3, 7.31.2023).pdf",
      quote: "Inferred — filter model (permanent, retrievable, convertible) is the central exposure of any VCF registry.",
    },
  },
};
