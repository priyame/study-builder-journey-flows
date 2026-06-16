"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import type { StudyFixture } from "@/lib/studies/types";
import { WhyPopover } from "./WhyPopover";

// Stage 2 — the extracted study profile with per-field provenance. Each row
// shows what the AI pulled from the source pack; the small "why" button
// opens the verbatim excerpt + page citation. Schema adapts loosely to the
// archetype (registry vs. RCT show different fields).

export function ReviewStage({
  study,
  onAdvance,
  onBack,
}: {
  study: StudyFixture;
  onAdvance: () => void;
  onBack: () => void;
}) {
  const { identity, provenance, tagCategories, paths, elements, dispositions, enrollmentDefinition } = study;
  const isRegistry = identity.archetype === "registry";

  const armCategory = tagCategories.find(
    (t) => t.category_type === "treatment" || (t.name.toLowerCase().includes("arm") && t.assignment_mode === "irt_push"),
  );
  const cohortCategory = tagCategories.find((t) => t.category_type === "cohort" && t.name !== "All Patients" && t.name !== "All Participants");

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="grid-2">
        {/* Identity block */}
        <div className="card">
          <div className="card-header">
            <h2>Study identity</h2>
            <span className="sub">Top-level facts extracted from the protocol</span>
          </div>
          <div className="card-body">
            <dl className="kv">
              <dt>Sponsor</dt>
              <dd>
                {identity.sponsor}
                <WhyPopover entry={provenance["identity.sponsor"]} label="sponsor" />
              </dd>

              <dt>Indication</dt>
              <dd>
                {identity.indication}
                <WhyPopover entry={provenance["identity.indication"]} label="indication" />
              </dd>

              <dt>Archetype</dt>
              <dd>
                <span className="chip blue" style={{ marginRight: 4 }}>{identity.archetype.replace("_", " ")}</span>
                {identity.phase ? <span className="chip slate">{identity.phase}</span> : null}
                <WhyPopover entry={provenance["identity.archetype"]} label="archetype" />
              </dd>

              {identity.enrollmentTarget !== undefined ? (
                <>
                  <dt>Target enrollment</dt>
                  <dd>
                    <span className="code">{identity.enrollmentTarget.toLocaleString()}</span>
                    <WhyPopover entry={provenance["identity.enrollmentTarget"]} label="enrollment target" />
                  </dd>
                </>
              ) : null}

              <dt>Duration</dt>
              <dd>
                {identity.duration ?? <span className="muted">—</span>}
                <WhyPopover entry={provenance["identity.duration"]} label="duration" />
              </dd>

              <dt>Source citation</dt>
              <dd className="muted" style={{ fontSize: 11.5 }}>{identity.sourceCitation}</dd>
            </dl>
          </div>
        </div>

        {/* Vernacular */}
        <div className="card">
          <div className="card-header">
            <h2>Builder vernacular</h2>
            <span className="sub">§3.5 — display-only labels per study; renaming is non-versioning</span>
          </div>
          <div className="card-body">
            <dl className="kv">
              <dt>Participant noun</dt>
              <dd>{study.vernacular.participant_label}</dd>
              <dt>Journey element</dt>
              <dd>{study.vernacular.journey_element_label}</dd>
              <dt>Enrollment trigger</dt>
              <dd>{study.vernacular.enrollment_trigger_label}</dd>
            </dl>
            <div className="divider" />
            <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
              Adapted from the protocol. Registry studies typically use "Encounter" + "Patient";
              RCTs use "Visit" + "Participant"; survey studies use "Wave" + "Respondent".
            </div>
          </div>
        </div>
      </div>

      {/* Treatment / cohort block — collapses if registry has no arms */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h2>{isRegistry ? "Cohort taxonomy" : "Randomization arms"}</h2>
            <span className="sub">
              {isRegistry
                ? "Cohorts emerge from tag queries at runtime — Doctrine D1"
                : `Treatment category · ${armCategory?.allowed_values.length ?? 0} arms`}
            </span>
          </div>
          <div className="card-body">
            {isRegistry ? (
              <div>
                {cohortCategory ? (
                  <>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>{cohortCategory.name}</div>
                    <div className="row wrap" style={{ gap: 6 }}>
                      {cohortCategory.allowed_values.map((v) => (
                        <span key={v.export_code} className="chip slate" style={{ fontSize: 11 }}>
                          {v.label} <span className="code" style={{ marginLeft: 4 }}>{v.export_code}</span>
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="muted" style={{ fontSize: 12 }}>No cohorts defined yet.</div>
                )}
                <WhyPopover entry={provenance["tags.diseaseCategory"] ?? provenance["tags.armCategory"]} label="cohort taxonomy" />
              </div>
            ) : armCategory ? (
              <>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{armCategory.name}</div>
                <div className="stack" style={{ gap: 6 }}>
                  {armCategory.allowed_values.map((v) => (
                    <div key={v.export_code} className="row" style={{ gap: 8, padding: "6px 10px", border: "1px solid var(--border-subtle)", borderRadius: "var(--r-md)" }}>
                      <div style={{ fontWeight: 600 }}>{v.label}</div>
                      <span className="code" style={{ marginLeft: "auto" }}>{v.export_code}</span>
                    </div>
                  ))}
                </div>
                <WhyPopover entry={provenance["tags.armCategory"]} label="arms" />
              </>
            ) : (
              <div className="muted" style={{ fontSize: 12 }}>No randomization category set.</div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Journey shape</h2>
            <span className="sub">Counts derived from the extracted Journey Elements + Paths</span>
          </div>
          <div className="card-body">
            <div className="row wrap" style={{ gap: 8 }}>
              <span className="chip blue">{paths.length} paths</span>
              <span className="chip blue">{elements.filter((e) => e.element_type === "milestone").length} milestones</span>
              <span className="chip slate">{elements.filter((e) => e.element_type === "scheduled").length} scheduled</span>
              <span className="chip slate">{elements.filter((e) => e.element_type === "cadence_followup").length} cadence</span>
              <span className="chip slate">{elements.filter((e) => e.element_type === "event_triggered").length} event-triggered</span>
              <span className="chip rose">{elements.filter((e) => e.element_type === "end_state").length} end states</span>
            </div>
            <div className="divider" />
            <div className="row wrap" style={{ gap: 6, fontSize: 12, lineHeight: 1.6 }}>
              <strong>Paths:</strong>
              {paths.map((p) => (
                <span key={p.id} className="chip" style={{ fontSize: 11 }}>{p.name}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment + dispositions */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h2>Enrollment definition</h2>
            <span className="sub">NFR-016 · Pooja + Ana — the trigger that fills the dashboard count</span>
          </div>
          <div className="card-body">
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, textTransform: "capitalize" }}>
              {enrollmentDefinition.trigger.replace(/_/g, " ")}
            </div>
            <div className="muted" style={{ fontSize: 12 }}>
              count_unit: <span className="code">{enrollmentDefinition.count_unit}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Disposition catalog</h2>
            <span className="sub">Terminal states + permanent catch-all (Pooja + Ana)</span>
          </div>
          <div className="card-body">
            <div className="stack" style={{ gap: 6 }}>
              {dispositions.map((d) => (
                <div key={d.id} className="row" style={{
                  padding: "6px 10px",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--r-md)",
                  background: d.is_catch_all ? "var(--amber-soft)" : undefined,
                  fontSize: 12.5,
                }}>
                  <span style={{ fontWeight: 500 }}>{d.label}</span>
                  {d.is_terminal ? <span className="chip rose" style={{ marginLeft: 6, fontSize: 9.5 }}>terminal</span> : null}
                  {d.is_catch_all ? <span className="chip amber" style={{ marginLeft: 6, fontSize: 9.5 }}>catch-all</span> : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="row" style={{ justifyContent: "space-between", gap: 8 }}>
        <button className="btn" onClick={onBack}>
          <ArrowLeft size={14} /> Back to source pack
        </button>
        <button className="btn btn-primary" onClick={onAdvance}>
          Open study hub <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
