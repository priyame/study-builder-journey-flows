// LeukReg — MGH Leukemia Longitudinal Research Database. Pure registry: no arms,
// no fixed schedule, event-driven data capture, open-ended follow-up, multi-cohort
// segmentation emerges from queries (Doctrine D1) over tags, not from pre-grouped
// arms. The "no scheduled visits" registry archetype stretches the journey model.

import type { StudyFixture } from "./types";

export const LEUKREG: StudyFixture = {
  identity: {
    id: "leukreg",
    code: "LEUKREG",
    name: "LeukReg · MGH Leukemia Longitudinal Database",
    tagline:
      "Observational registry of MGH leukemia/MDS patients — passive EHR + clinical encounter capture.",
    sponsor: "Massachusetts General Hospital · Leukemia Program",
    indication: "Acute & chronic leukemia, MDS",
    archetype: "registry",
    enrollmentTarget: undefined, // no fixed cap
    duration: "Open-ended — registry continues for the duration of clinical care",
    chips: ["Registry", "Observational", "Event-driven", "EHR + chart review"],
    sourceCitation: "LeukReg study protocol (MGH IRB) · PI Dr. A. Fathi",
    dataSource: "real",
  },

  vernacular: {
    journey_element_label: "Encounter",
    participant_label: "Patient",
    enrollment_trigger_label: "Consented to care",
  },

  tagCategories: [
    {
      id: "tc-all",
      category_type: "all_participants",
      name: "All Patients",
      allowed_values: [{ label: "All", export_code: "ALL" }],
      assignment_mode: "rule",
      usages: ["analysis_reporting"],
      active: true,
      description: "Sentinel.",
    },
    {
      id: "tc-disease",
      category_type: "cohort",
      name: "Disease Type",
      allowed_values: [
        { label: "AML — Acute Myeloid Leukemia",          export_code: "AML" },
        { label: "ALL — Acute Lymphoblastic Leukemia",    export_code: "ALL_DZ" },
        { label: "CML — Chronic Myeloid Leukemia",        export_code: "CML" },
        { label: "CLL — Chronic Lymphocytic Leukemia",    export_code: "CLL" },
        { label: "MDS — Myelodysplastic Syndrome",        export_code: "MDS" },
        { label: "MPN — Myeloproliferative Neoplasm",     export_code: "MPN" },
        { label: "Other hematologic malignancy",          export_code: "OTHER_HEME" },
      ],
      assignment_mode: "rule",
      usages: ["analysis_reporting", "schedule_applicability"],
      active: true,
      description: "Set at index event from pathology report. May change on transformation.",
    },
    {
      id: "tc-line",
      category_type: "treatment",
      name: "Line of Therapy",
      allowed_values: [
        { label: "Pre-treatment / Surveillance", export_code: "L0" },
        { label: "1st-line",  export_code: "L1" },
        { label: "2nd-line",  export_code: "L2" },
        { label: "3rd-line+", export_code: "L3PLUS" },
      ],
      assignment_mode: "rule",
      usages: ["analysis_reporting", "form_applicability"],
      active: true,
      description: "Increments on each treatment regimen change (event-driven).",
    },
    {
      id: "tc-modality",
      category_type: "treatment",
      name: "Treatment Modality",
      allowed_values: [
        { label: "Chemotherapy",       export_code: "CHEMO" },
        { label: "Targeted therapy",   export_code: "TARGETED" },
        { label: "Immunotherapy",      export_code: "IMMUNO" },
        { label: "Stem cell transplant", export_code: "BMT" },
        { label: "Radiation",          export_code: "RAD" },
        { label: "Watch and wait",     export_code: "WATCH" },
        { label: "Palliative care",    export_code: "PAL" },
      ],
      assignment_mode: "manual",
      usages: ["analysis_reporting", "operational_routing"],
      active: true,
      description: "Multi-select: a patient may carry several modality tags concurrently.",
    },
    {
      id: "tc-status",
      category_type: "segment",
      name: "Disease Status",
      allowed_values: [
        { label: "Active disease",        export_code: "ACTIVE" },
        { label: "Complete remission",    export_code: "CR" },
        { label: "Partial remission",     export_code: "PR" },
        { label: "Stable disease",        export_code: "SD" },
        { label: "Relapse",               export_code: "RELAPSE" },
        { label: "Transformed",           export_code: "TRANSFORM" },
        { label: "Refractory",            export_code: "REFRAC" },
      ],
      assignment_mode: "rule",
      usages: ["safety_monitoring", "analysis_reporting", "schedule_applicability"],
      active: true,
      description: "Updated at each restaging event from pathology/imaging.",
    },
    {
      id: "tc-trial",
      category_type: "operational",
      name: "Concurrent Trial Enrollment",
      allowed_values: [
        { label: "Not on trial",  export_code: "NO_TRIAL" },
        { label: "On trial",      export_code: "ON_TRIAL" },
      ],
      assignment_mode: "external_mapping",
      usages: ["operational_routing"],
      active: true,
      description: "Linked from MGH trial enrollment system (cross-registry mapping).",
    },
  ],

  tagRules: [
    {
      id: "r-disease-path",
      tag_category_id: "tc-disease",
      trigger_type: "form_answer",
      condition_preview: "Pathology.Diagnosis ∈ {AML, ALL, CML, CLL, MDS, MPN}",
      target_value: "AML",
      validation_status: "ok",
      owner_role: "Hematopathologist",
    },
    {
      id: "r-line-event",
      tag_category_id: "tc-line",
      trigger_type: "event_trigger",
      condition_preview: "On treatment regimen change event: line = line + 1",
      target_value: "L1",
      validation_status: "ok",
      owner_role: "Treating Oncologist",
    },
    {
      id: "r-status-restage",
      tag_category_id: "tc-status",
      trigger_type: "form_answer",
      condition_preview: "Restaging.Imaging OR Restaging.Pathology updated → recompute status",
      target_value: "CR",
      validation_status: "ok",
      owner_role: "Treating Oncologist",
    },
    {
      id: "r-modality-manual",
      tag_category_id: "tc-modality",
      trigger_type: "manual",
      condition_preview: "Treating clinician selects all active modalities at each encounter",
      target_value: "CHEMO",
      validation_status: "ok",
      owner_role: "Treating Oncologist",
    },
    {
      id: "r-trial-link",
      tag_category_id: "tc-trial",
      trigger_type: "irt_message",
      condition_preview: "Inbound from MGH ClinicalTrials portal: enrolled=true|false",
      target_value: "ON_TRIAL",
      validation_status: "ok",
      owner_role: "Research Coordinator",
    },
  ],

  paths: [
    { id: "p-main",      name: "Registry main path",     applies_to_expr: "ALL=ALL", description: "Every consented patient — passive longitudinal capture." },
    { id: "p-active",    name: "Active treatment path",  applies_to_expr: "STATUS=ACTIVE OR STATUS=RELAPSE OR STATUS=REFRAC", description: "Enriched data capture during active therapy." },
    { id: "p-remission", name: "Remission surveillance", applies_to_expr: "STATUS=CR OR STATUS=PR", description: "Lighter cadence — annual surveillance." },
    { id: "p-bmt",       name: "Post-BMT path",          applies_to_expr: "MODALITY=BMT", description: "100-day, 1-year, 5-year transplant milestones overlay." },
  ],

  elements: [
    {
      id: "el-consent",
      builder_label: "General Consent to Care",
      element_type: "scheduled",
      day_offset: 0,
      anchor: "study_start",
      applies_to_expr: "ALL=ALL",
      activities: ["MGH general consent verified", "Registry inclusion confirmed"],
      notes: "Waiver of specific research consent — relies on MGH umbrella consent.",
    },
    {
      id: "el-ms-enrolled",
      builder_label: "Enrolled in registry",
      element_type: "milestone",
      applies_to_expr: "ALL=ALL",
      activities: [],
    },
    {
      id: "el-index",
      builder_label: "Index Diagnosis",
      element_type: "event_triggered",
      applies_to_expr: "ALL=ALL",
      activities: ["Pathology", "Cytogenetics", "Molecular profile", "Baseline labs", "Demographics"],
      notes: "Anchors disease-specific data capture. Sets DISEASE tag.",
    },
    {
      id: "el-ms-diagnosed",
      builder_label: "Diagnosis confirmed",
      element_type: "milestone",
      applies_to_expr: "ALL=ALL",
      activities: [],
    },
    {
      id: "el-treat-start",
      builder_label: "Treatment regimen start",
      element_type: "event_triggered",
      applies_to_expr: "ALL=ALL",
      activities: ["Regimen documented", "Pre-treatment labs", "Performance status (ECOG/KPS)", "Comorbidity update"],
      notes: "Repeatable — each new regimen increments line of therapy.",
    },
    {
      id: "el-encounter",
      builder_label: "Clinical Encounter (any)",
      element_type: "cadence_followup",
      applies_to_expr: "ALL=ALL",
      activities: ["Vitals", "Performance status", "Symptom assessment", "Active treatment toxicity", "Conmeds"],
      cadence: { interval_days: 30, stop_condition: "Death OR LTFU OR registry close" },
      notes: "Cadence is approximate — actual frequency matches clinical care.",
    },
    {
      id: "el-restage",
      builder_label: "Restaging Assessment",
      element_type: "event_triggered",
      applies_to_expr: "STATUS=ACTIVE OR STATUS=RELAPSE OR STATUS=REFRAC",
      activities: ["Imaging (CT/PET)", "Bone marrow biopsy", "Response criteria scoring (IWG/Cheson)", "Disease status update"],
      notes: "Triggers STATUS tag recomputation.",
    },
    {
      id: "el-bmt",
      builder_label: "Stem Cell Transplant",
      element_type: "event_triggered",
      applies_to_expr: "MODALITY=BMT",
      activities: ["Conditioning regimen", "Donor source", "HLA match grade", "Day 0 transplant", "GVHD prophylaxis"],
      notes: "Adds 100-day, 1y, 5y BMT milestones.",
    },
    {
      id: "el-bmt-d100",
      builder_label: "Day +100 post-BMT",
      element_type: "scheduled",
      day_offset: 100,
      anchor: "ms_bmt",
      window_minus: 14, window_plus: 14,
      applies_to_expr: "MODALITY=BMT",
      activities: ["Engraftment confirmation", "GVHD assessment", "Chimerism", "Restaging"],
    },
    {
      id: "el-bmt-1y",
      builder_label: "1-year post-BMT",
      element_type: "scheduled",
      day_offset: 365,
      anchor: "ms_bmt",
      window_minus: 30, window_plus: 30,
      applies_to_expr: "MODALITY=BMT",
      activities: ["Late effects screen", "Vaccination status", "Survivorship plan", "QoL (FACT-BMT)"],
    },
    {
      id: "el-ms-bmt",
      builder_label: "BMT Day 0",
      element_type: "milestone",
      applies_to_expr: "MODALITY=BMT",
      activities: [],
    },

    // Relapse / safety event-driven overlay
    {
      id: "el-relapse",
      builder_label: "Relapse / Transformation event",
      element_type: "event_triggered",
      applies_to_expr: "ALL=ALL",
      activities: ["Restaging trigger", "Molecular re-profile", "Treatment plan update"],
      notes: "Sets STATUS=RELAPSE or STATUS=TRANSFORM; opens new line of therapy.",
    },

    // Annual surveillance for remission patients
    {
      id: "el-annual",
      builder_label: "Annual surveillance",
      element_type: "cadence_followup",
      applies_to_expr: "STATUS=CR OR STATUS=PR",
      activities: ["Labs (CBC/CMP)", "Symptom screen", "Imaging if indicated", "Survivorship issues"],
      cadence: { interval_days: 365, stop_condition: "Relapse OR Death OR LTFU" },
    },

    // End states
    { id: "el-end-death",     builder_label: "Death",              element_type: "end_state", applies_to_expr: "ALL=ALL", activities: [] },
    { id: "el-end-lost",      builder_label: "Lost to follow-up",  element_type: "end_state", applies_to_expr: "ALL=ALL", activities: [] },
    { id: "el-end-withdrawn", builder_label: "Consent withdrawn",  element_type: "end_state", applies_to_expr: "ALL=ALL", activities: [] },
  ],

  edges: [
    { from: "el-consent",       to: "el-ms-enrolled",  trigger_family: "auto",      trigger_label: "General consent verified" },
    { from: "el-ms-enrolled",   to: "el-index",        trigger_family: "auto",      trigger_label: "Index event identified in EHR" },
    { from: "el-index",         to: "el-ms-diagnosed", trigger_family: "auto",      trigger_label: "Pathology confirmed" },
    { from: "el-ms-diagnosed",  to: "el-treat-start",  trigger_family: "manual",    trigger_label: "Treatment plan initiated" },
    { from: "el-ms-diagnosed",  to: "el-encounter",    trigger_family: "auto",      trigger_label: "Routine encounter cadence begins" },
    { from: "el-treat-start",   to: "el-restage",      trigger_family: "day_offset", trigger_label: "End of cycle / response assessment due" },
    { from: "el-restage",       to: "el-relapse",      trigger_family: "conditional", trigger_label: "Status = RELAPSE or TRANSFORM" },
    { from: "el-relapse",       to: "el-treat-start",  trigger_family: "auto",      trigger_label: "New line of therapy starts" },

    // BMT overlay
    { from: "el-treat-start", to: "el-bmt",      trigger_family: "conditional", trigger_label: "Modality = BMT", is_branch: true },
    { from: "el-bmt",         to: "el-ms-bmt",   trigger_family: "auto",        trigger_label: "Day 0 stem cell infusion" },
    { from: "el-ms-bmt",      to: "el-bmt-d100", trigger_family: "day_offset",  trigger_label: "+100 days from BMT" },
    { from: "el-bmt-d100",    to: "el-bmt-1y",   trigger_family: "day_offset",  trigger_label: "+365 days from BMT" },

    // Remission path
    { from: "el-restage",  to: "el-annual",    trigger_family: "conditional", trigger_label: "Status = CR or PR", is_branch: true },
    { from: "el-annual",   to: "el-relapse",   trigger_family: "conditional", trigger_label: "Restaging flags relapse" },

    // End states
    { from: "el-encounter", to: "el-end-death",     trigger_family: "manual", trigger_label: "Death documented" },
    { from: "el-encounter", to: "el-end-lost",      trigger_family: "manual", trigger_label: "Lost to follow-up (no contact 12mo)" },
    { from: "el-encounter", to: "el-end-withdrawn", trigger_family: "manual", trigger_label: "Patient withdraws consent" },
  ],

  // Registry has no fixed visit schedule — VisitsView will show the cadence-only message.
  visitColumns: undefined,

  versions: [
    {
      id: "v-1-2", version_label: "v1.2", status: "Published", env: "live",
      protocol_version_label: "LeukReg Protocol v1.2",
      published_at: "2026-03-15 10:00", published_by: "Registry Admin · k.gomez@mgh",
      changes: [
        { area: "Tag Category", summary: "Disease Type — added MPN value", versioning_class: "versioning" },
        { area: "Form",         summary: "Cytogenetics panel — added FLT3-ITD variants", versioning_class: "versioning" },
      ],
    },
    {
      id: "v-1-3", version_label: "v1.3", status: "Draft", env: "draft",
      protocol_version_label: "LeukReg Protocol v1.2",
      changes: [
        { area: "Journey",  summary: "Add 5-year post-BMT survivorship milestone", versioning_class: "versioning" },
        { area: "Setting",  summary: "Annual surveillance window relaxed to ±60 days", versioning_class: "non_versioning" },
      ],
    },
  ],

  subjectId: {
    pattern: "MGH-LR-{seq:6}",
    example: "MGH-LR-001237",
    sequence_scope: "study",
    zero_pad_to: 6,
  },
  enrollmentDefinition: {
    trigger: "consented",
    count_unit: "participant",
  },
  dispositions: [
    { id: "d-active",   label: "Active in registry",  is_terminal: false, source: "system" },
    { id: "d-remission", label: "Remission surveillance", is_terminal: false, source: "system" },
    { id: "d-death",    label: "Deceased",            is_terminal: true,  source: "system" },
    { id: "d-lost",     label: "Lost to follow-up",   is_terminal: true,  source: "system" },
    { id: "d-withdrew", label: "Consent withdrawn",   is_terminal: true,  source: "system" },
    { id: "d-other",    label: "Other (specify)",     is_terminal: true,  is_catch_all: true, source: "custom" },
  ],

  exportPreview: [
    { subject_id: "MGH-LR-001001", DISEASE: "AML",     LINE: "L1",    MODALITY: "CHEMO,IMMUNO", STATUS: "CR",      TRIAL: "ON_TRIAL", DISPOSITION: "Remission surveillance" },
    { subject_id: "MGH-LR-001237", DISEASE: "AML",     LINE: "L2",    MODALITY: "BMT",          STATUS: "RELAPSE", TRIAL: "NO_TRIAL", DISPOSITION: "Active in registry" },
    { subject_id: "MGH-LR-002104", DISEASE: "MDS",     LINE: "L0",    MODALITY: "WATCH",        STATUS: "SD",      TRIAL: "NO_TRIAL", DISPOSITION: "Active in registry" },
  ],

  sources: [
    { filename: "LeukReg study protocol.pdf", kind: "protocol", status: "extracted",
      contributes_to: ["identity", "tagCategories", "elements", "paths", "dispositions"],
      note: "MGH Leukemia Program protocol; PI Dr. Amir T. Fathi." },
  ],

  provenance: {
    "identity.sponsor": {
      source: "LeukReg study protocol.pdf",
      page: 1,
      quote: "Massachusetts General Hospital · Leukemia Program. PI: Dr. Amir T. Fathi.",
    },
    "identity.indication": {
      source: "LeukReg study protocol.pdf",
      page: 1,
      quote: "Acute and chronic leukemia and related hematologic malignancies (e.g., myelodysplastic syndrome).",
    },
    "identity.archetype": {
      source: "LeukReg study protocol.pdf",
      page: 2,
      quote: "Observational/retrospective registry — data collected from natural course of clinical care via chart review and EHR extraction (NOT interventional).",
    },
    "identity.duration": {
      source: "LeukReg study protocol.pdf",
      page: 1,
      quote: "Longitudinal, ongoing — no defined endpoint. Continuous monitoring as per clinical care.",
    },
    "tags.diseaseCategory": {
      source: "LeukReg study protocol.pdf",
      page: 9,
      quote: "Cohorts emerge from disease subtype (AML, ALL, CML, CLL, MDS, MPN), treatment line, modality received, and disease status (active, remission, relapse, transformed, refractory).",
    },
    "elements.eventDriven": {
      source: "LeukReg study protocol.pdf",
      page: 9,
      quote: "All clinical encounters, appointments, and services documented. Visits, labs, imaging triggered by clinical need; data collection is event-driven, not on a fixed schedule.",
    },
  },
};
