// §4.5 Workflow Authoring Surface — types layered over §4 canonical model.
// No new entities; these are projections of Journey Element + Journey Path + Tag Assignment Rule.

import type { TriggerType } from "./kelly-model";

export type ElementType =
  | "scheduled"
  | "cadence_followup"
  | "event_triggered"
  | "milestone"
  | "cycle_based"
  | "unscheduled"
  | "safety_followup"
  | "end_state";

// §4.5.2 — UI grouping over the 7 canonical trigger_types
export type TriggerFamily = "auto" | "manual" | "day_offset" | "conditional";

export const TRIGGER_FAMILY_MAP: Record<TriggerType, TriggerFamily> = {
  form_answer:      "auto",
  state_transition: "auto",
  event_trigger:    "auto",
  irt_message:      "auto",
  conditional:      "conditional",
  manual:           "manual",
  time_offset:      "day_offset",
};

export interface JourneyElement {
  id: string;
  builder_label: string;          // §3.5 builder-named
  element_type: ElementType;
  day_offset?: number;            // for scheduled elements — days from anchor
  anchor?: string;                // milestone id (or "study_start")
  window_minus?: number;          // window in days
  window_plus?: number;
  applies_to_expr?: string;       // tag expression (e.g., "ARM=TRTA")
  activities: string[];           // builder-named activity labels
  cadence?: { interval_days: number; stop_condition: string };  // for cadence_followup
  notes?: string;
}

export interface JourneyPath {
  id: string;
  name: string;
  applies_to_expr: string;         // root tag expression — "ALL" for the canonical path
  description?: string;
}

export interface JourneyEdge {
  from: string;
  to: string;
  trigger_family: TriggerFamily;
  trigger_label: string;           // human-readable, e.g., "Eligibility met", "+28 days from enrollment"
  is_branch?: boolean;             // true when the edge is one path of a branch decision
}

export const ELEMENT_TYPE_LABEL: Record<ElementType, string> = {
  scheduled:        "Scheduled",
  cadence_followup: "Cadence follow-up",
  event_triggered:  "Event-triggered",
  milestone:        "Milestone",
  cycle_based:      "Cycle-based",
  unscheduled:      "Unscheduled",
  safety_followup:  "Safety follow-up",
  end_state:        "End state",
};

export const TRIGGER_FAMILY_LABEL: Record<TriggerFamily, string> = {
  auto:        "Auto",
  manual:      "Manual",
  day_offset:  "Day offset",
  conditional: "Conditional",
};
