import type { JourneyElement, JourneyEdge, JourneyPath } from "@/lib/journey-model";

// Same Phase 2 RCT skeleton used in /study/tags so the team can trace tags ↔ journey.
// Milestones bookend the journey; scheduled elements anchor off them.
// One branch on the Randomization Arm tag (Path-A TRTA vs Path-B SOC).

export const PATHS: JourneyPath[] = [
  { id: "p-main", name: "Main protocol path",     applies_to_expr: "ALL=ALL",     description: "Universal path — all participants follow until randomization" },
  { id: "p-trta", name: "Treatment A path",        applies_to_expr: "ARM=TRTA",    description: "Routed by Randomization Arm tag = TRTA" },
  { id: "p-soc",  name: "Standard of Care path",   applies_to_expr: "ARM=SOC",     description: "Routed by Randomization Arm tag = SOC" },
  { id: "p-hr",   name: "High-risk safety overlay", applies_to_expr: "RISK=HR",    description: "Extra safety follow-up cadence for high-risk participants" },
];

export const ELEMENTS: JourneyElement[] = [
  // ── Pre-randomization (main path) ────────────────────────────────────
  { id: "el-consent",  builder_label: "Informed Consent",   element_type: "scheduled",  day_offset: -14, anchor: "study_start", applies_to_expr: "ALL=ALL", activities: ["ICF signed", "Demographics", "Medical History"] },
  { id: "el-screen",   builder_label: "Screening Visit",    element_type: "scheduled",  day_offset: -10, anchor: "study_start", window_minus: 3, window_plus: 3, applies_to_expr: "ALL=ALL", activities: ["Vitals", "Labs panel", "ECG", "Eligibility form"] },
  { id: "el-ms-screen-complete", builder_label: "Screening Complete", element_type: "milestone", applies_to_expr: "ALL=ALL", activities: [], notes: "Anchor for Enrollment timing; gate to randomization" },
  { id: "el-enroll",   builder_label: "Enrollment Visit",   element_type: "scheduled",  day_offset: 0,   anchor: "ms_screen_complete", applies_to_expr: "ALL=ALL", activities: ["Re-consent (if amendment)", "Baseline labs", "Baseline ePRO"] },
  { id: "el-ms-rand",  builder_label: "Randomization",       element_type: "milestone", applies_to_expr: "ALL=ALL", activities: [], notes: "IRT randomization fires here; ARM tag assigned" },

  // ── Branch: Treatment A path ─────────────────────────────────────────
  { id: "el-trta-d1",  builder_label: "Treatment A · Day 1",  element_type: "scheduled", day_offset: 1,  anchor: "ms_rand", applies_to_expr: "ARM=TRTA", activities: ["Dose A administration", "Safety check", "Lab draw"] },
  { id: "el-trta-d8",  builder_label: "Treatment A · Day 8",  element_type: "scheduled", day_offset: 8,  anchor: "ms_rand", window_minus: 1, window_plus: 2, applies_to_expr: "ARM=TRTA", activities: ["Dose A administration", "AE assessment"] },
  { id: "el-trta-d29", builder_label: "Treatment A · Day 29", element_type: "scheduled", day_offset: 29, anchor: "ms_rand", window_minus: 2, window_plus: 3, applies_to_expr: "ARM=TRTA", activities: ["Dose A administration", "Labs panel", "PK draw"] },

  // ── Branch: Standard of Care path ────────────────────────────────────
  { id: "el-soc-d1",   builder_label: "SoC · Day 1",          element_type: "scheduled", day_offset: 1,  anchor: "ms_rand", applies_to_expr: "ARM=SOC",  activities: ["Standard care visit", "Safety check"] },
  { id: "el-soc-d29",  builder_label: "SoC · Day 29",         element_type: "scheduled", day_offset: 29, anchor: "ms_rand", window_minus: 2, window_plus: 3, applies_to_expr: "ARM=SOC", activities: ["Standard care visit", "Labs panel"] },

  // ── Convergent: end-of-treatment milestone (both arms) ───────────────
  { id: "el-ms-eot",   builder_label: "End of Treatment",     element_type: "milestone", applies_to_expr: "ALL=ALL", activities: [], notes: "Last on-treatment timepoint for both arms" },

  // ── Long-term follow-up cadence ──────────────────────────────────────
  { id: "el-followup", builder_label: "Long-term follow-up",  element_type: "cadence_followup", applies_to_expr: "ALL=ALL", activities: ["Survival check", "ePRO", "Concomitant meds"], cadence: { interval_days: 90, stop_condition: "Death OR Study Closure OR Withdrawal" } },

  // ── Event-triggered ──────────────────────────────────────────────────
  { id: "el-ae",       builder_label: "Adverse Event log",    element_type: "event_triggered", applies_to_expr: "ALL=ALL", activities: ["AE form", "Severity grading", "Causality assessment"], notes: "Repeatable; safety-significant events have 24h SAE due rule" },

  // ── Safety overlay (HR only) ─────────────────────────────────────────
  { id: "el-hr-extra", builder_label: "Extra safety check (HR)", element_type: "safety_followup", applies_to_expr: "RISK=HR", activities: ["Cardio assessment", "Renal panel"], cadence: { interval_days: 30, stop_condition: "RISK tag changes OR End of Treatment" } },

  // ── Terminal end states ──────────────────────────────────────────────
  { id: "el-end-complete",   builder_label: "Study Complete", element_type: "end_state", applies_to_expr: "ALL=ALL", activities: [] },
  { id: "el-end-withdrawn",  builder_label: "Withdrawn",      element_type: "end_state", applies_to_expr: "ALL=ALL", activities: [] },
];

export const EDGES: JourneyEdge[] = [
  { from: "el-consent",          to: "el-screen",              trigger_family: "auto",       trigger_label: "ICF signed" },
  { from: "el-screen",           to: "el-ms-screen-complete",  trigger_family: "conditional", trigger_label: "Eligibility met" },
  { from: "el-ms-screen-complete", to: "el-enroll",            trigger_family: "day_offset", trigger_label: "+0 days from Screening Complete" },
  { from: "el-enroll",           to: "el-ms-rand",             trigger_family: "auto",       trigger_label: "IRT randomization message" },

  // Branch on Randomization Arm
  { from: "el-ms-rand",          to: "el-trta-d1",             trigger_family: "conditional", trigger_label: "ARM = TRTA", is_branch: true },
  { from: "el-ms-rand",          to: "el-soc-d1",              trigger_family: "conditional", trigger_label: "ARM = SOC",  is_branch: true },

  // TRTA progression
  { from: "el-trta-d1",          to: "el-trta-d8",             trigger_family: "day_offset", trigger_label: "+7 days" },
  { from: "el-trta-d8",          to: "el-trta-d29",            trigger_family: "day_offset", trigger_label: "+21 days" },
  { from: "el-trta-d29",         to: "el-ms-eot",              trigger_family: "auto",       trigger_label: "Treatment cycle complete" },

  // SoC progression
  { from: "el-soc-d1",           to: "el-soc-d29",             trigger_family: "day_offset", trigger_label: "+28 days" },
  { from: "el-soc-d29",          to: "el-ms-eot",              trigger_family: "auto",       trigger_label: "Treatment cycle complete" },

  // Post-treatment
  { from: "el-ms-eot",           to: "el-followup",            trigger_family: "day_offset", trigger_label: "+30 days from EoT" },
  { from: "el-followup",         to: "el-end-complete",        trigger_family: "conditional", trigger_label: "Survival threshold met" },

  // Manual withdrawal — possible from anywhere; we model it from a key checkpoint
  { from: "el-enroll",           to: "el-end-withdrawn",       trigger_family: "manual",     trigger_label: "Withdraw consent" },
];

// Day-offset table for the Visits matrix view.
// Each scheduled element gets a column at its day_offset relative to a master anchor (study start).
// Milestones don't get columns of their own but render as marker columns inline.
export const VISIT_COLUMNS: { id: string; label: string; day: number }[] = [
  { id: "d-consent", label: "Consent",      day: -14 },
  { id: "d-screen",  label: "Screen",       day: -10 },
  { id: "d-ms1",     label: "Scr Complete", day: -3 },
  { id: "d-enroll",  label: "Enroll",       day: 0 },
  { id: "d-ms-rand", label: "Randomize",    day: 0 },
  { id: "d-day1",    label: "Day 1",        day: 1 },
  { id: "d-day8",    label: "Day 8",        day: 8 },
  { id: "d-day29",   label: "Day 29",       day: 29 },
  { id: "d-eot",     label: "EoT",          day: 35 },
  { id: "d-fu",      label: "Follow-up",    day: 65 },
  { id: "d-fu90",    label: "FU +90",       day: 155 },
];
