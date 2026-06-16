// A StudyFixture bundles everything one study needs across the sketch:
// identity for the picker, tags + rules for /study/tags, paths/elements/edges
// for /study/journey, versions for /study/versions, subject/enrollment/export
// shape for /study/subjects + /study/export.
//
// The journey is the heaviest piece — all six fixtures share the same
// journey-model.ts types so the FlowView / VisitsView / SequenceView render
// any study without per-study UI branching.

import type {
  TagCategory,
  TagAssignmentRule,
  StudyVersion,
  Vernacular,
  SubjectIdConfig,
  EnrollmentDefinition,
  Disposition,
} from "@/lib/kelly-model";
import type { JourneyPath, JourneyElement, JourneyEdge } from "@/lib/journey-model";

export type StudyArchetype =
  | "rct"                    // Randomized controlled trial
  | "site_crossover"         // Group-randomized crossover at site level
  | "patient_crossover"      // Individual-level crossover
  | "single_arm"             // Non-randomized interventional (feasibility, post-market)
  | "registry"               // Observational, longitudinal data collection
  | "survey"                 // Panel-based ePRO/HCP study
  | "adaptive";              // Interim-driven design changes

// Where this fixture came from. "real" = extracted from the actual protocol;
// "inferred" = the PDF couldn't be read (encrypted / image-only) so we filled in
// a plausible shape from the title and metadata. Surfaced in the UI so reviewers
// know which numbers to trust.
export type DataSource = "real" | "inferred" | "icf_only" | "partial";

export interface StudyIdentity {
  id: string;                          // url-safe slug, e.g. "lantern"
  code: string;                        // human-facing short code, e.g. "LANTERN"
  name: string;                        // long name with phase + indication
  tagline: string;                     // under ~90 chars for the picker subtitle
  sponsor: string;
  indication: string;
  archetype: StudyArchetype;
  phase?: string;                      // e.g. "Phase 3"
  enrollmentTarget?: number;
  duration?: string;                   // e.g. "30 days per patient" or "Open-ended"
  chips: string[];                     // 3-4 short labels for the picker card
  sourceCitation: string;              // "Protocol v3.0 · 16 Apr 2025" — what we read
  dataSource: DataSource;              // honesty about fixture provenance
  dataNote?: string;                   // visible caveat when dataSource ≠ "real"
}

export interface StudyExportRow {
  // Sample row for the /study/export preview. Each fixture carries 3 sample
  // participants so the export-shape page can show a realistic combined dataset.
  subject_id: string;
  [tagOrField: string]: string;
}

// A document in the study's source pack — the real file that landed in
// References/Study Setup Source Docs. Drives the Input stage of the wizard.
export interface SourceDoc {
  filename: string;                    // exact filename in the source pack
  kind: "protocol" | "amendment" | "icf" | "safety_plan" | "crossover_plan" | "tracker" | "other";
  pageCount?: number;
  status: "extracted" | "image_only" | "icf_only" | "operational" | "amendment";
  // What the AI got from this doc — feeds the Review-stage profile fields.
  contributes_to: string[];            // identity field names this doc populated
  note?: string;                       // optional caveat
}

// Per-field provenance — drives the "why" affordance on the Review stage.
export interface ProvenanceEntry {
  source: string;                      // filename in the source pack
  page?: number;
  quote: string;                       // verbatim or paraphrased excerpt
}

// Identity fields → provenance. Keys are dot paths like "identity.sponsor",
// "identity.enrollmentTarget", "identity.phase", "tags.armCategory", etc.
export type StudyProvenance = Record<string, ProvenanceEntry>;

// Setup-readiness checklist item — drives the Hub stage. Status is derived
// per-study from the fixture content (a study with no tags is "not started"
// for the tags step, etc.) but can also be overridden in the fixture.
export interface SetupStep {
  id: "extract" | "tags" | "journey" | "enrollment" | "export" | "publish";
  label: string;
  detail: string;
  href: string;                        // route, with ?study= preserved at render time
}

export interface StudyFixture {
  identity: StudyIdentity;
  vernacular: Vernacular;
  // Source pack + provenance — drives /study (the wizard)
  sources: SourceDoc[];
  provenance: StudyProvenance;
  // Tags & rules — drives /study/tags
  tagCategories: TagCategory[];
  tagRules: TagAssignmentRule[];
  // Journey — drives /study/journey (all 3 view modes)
  paths: JourneyPath[];
  elements: JourneyElement[];
  edges: JourneyEdge[];
  // SoA columns for VisitsView (matrix). Optional — registries with no fixed
  // schedule can omit and Visits view will show "cadence-only" empty state.
  visitColumns?: { id: string; label: string; day: number }[];
  // Versions — drives /study/versions
  versions: StudyVersion[];
  // Subjects & enrollment — drives /study/subjects
  subjectId: SubjectIdConfig;
  enrollmentDefinition: EnrollmentDefinition;
  dispositions: Disposition[];
  // Export shape — drives /study/export
  exportPreview: StudyExportRow[];
}
