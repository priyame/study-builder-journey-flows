import type { StudyVersion } from "@/lib/kelly-model";

// Three-environment lattice — Live holds Published + Retired, UAT holds Signed Off, Draft holds Draft.
// Per Priya's standing rule: test versions can be ahead of live versions.

export const SEED_VERSIONS: StudyVersion[] = [
  {
    id: "v-1-3",
    version_label: "v1.3",
    status: "Draft",
    env: "draft",
    protocol_version_label: "P-2.1",
    changes: [
      { area: "Tag Category",  summary: "Add 'Hospitalized in prior 30d' segment", versioning_class: "versioning" },
      { area: "Tag Rule",      summary: "Risk Profile rule — add CRP > 10 threshold", versioning_class: "versioning" },
      { area: "Vernacular",    summary: "Rename Visit → Encounter for registry sites", versioning_class: "non_versioning" },
    ],
  },
  {
    id: "v-1-2",
    version_label: "v1.2",
    status: "Signed Off",
    env: "uat",
    protocol_version_label: "P-2.1",
    signed_off_at: "2026-06-08 14:22",
    signed_off_by: "Account Manager · jrose@…",
    changes: [
      { area: "Form",          summary: "AE log — add 'serious' Y/N field", versioning_class: "versioning" },
      { area: "Tag Category",  summary: "ITT Population — `assignment_mode` change to rule (was manual)", versioning_class: "versioning" },
      { area: "Edit Check",    summary: "Lab.GFR — relax lower bound from 30 to 20", versioning_class: "non_versioning" },
    ],
  },
  {
    id: "v-1-1",
    version_label: "v1.1",
    status: "Published",
    env: "live",
    protocol_version_label: "P-2.0",
    published_at: "2026-05-15 09:00",
    published_by: "CRO Admin · m.li@…",
    changes: [
      { area: "Tag Category",  summary: "Cohort — added late-enroller value C2 with export_code", versioning_class: "versioning" },
      { area: "Setting",       summary: "Reminder cadence on follow-up — 7d → 14d", versioning_class: "non_versioning" },
    ],
  },
  {
    id: "v-1-0",
    version_label: "v1.0",
    status: "Retired",
    env: "live",
    protocol_version_label: "P-2.0",
    published_at: "2026-02-01 08:00",
    published_by: "CRO Admin · m.li@…",
    changes: [
      { area: "Form",  summary: "Initial Published version — first Live activation", versioning_class: "versioning" },
    ],
  },
];

// Kelly's rule table — §23.4. Used by the change-classifier preview.
export const RULE_TABLE = [
  { change: "Field label (variable label in export)", versions: true,  note: "Dataset content" },
  { change: "On-screen instruction only",             versions: false, note: "Cosmetic" },
  { change: "Add a new field",                        versions: true,  note: "Adds column to dataset" },
  { change: "Add or change an edit check",            versions: false, note: "Default — sponsor SOP may opt-in to bump" },
  { change: "Change a visit window",                  versions: false, note: "Same as edit check" },
  { change: "Reorder fields",                         versions: false, note: "Display only" },
  { change: "Translation of a field label",           versions: true,  note: "Affects export rendering" },
  { change: "Translation of on-screen instruction",   versions: false, note: "Never reaches dataset" },
  { change: "Builder-named labels (vernacular)",      versions: false, note: "§3.5 — display only" },
  { change: "Tag value export_code rename",           versions: true,  note: "Dataset shape changes" },
  { change: "Tag value label rename (code unchanged)", versions: false, note: "Display only" },
  { change: "Tag Category category_type change",      versions: true,  note: "Semantic reinterpretation" },
  { change: "Tag Category assignment_mode change",    versions: true,  note: "Audit derivation changes" },
];
