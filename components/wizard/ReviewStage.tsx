"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import type { StudyFixture } from "@/lib/studies/types";
import { Card, Pill } from "@/components/ui";
import { WhyPopover } from "./WhyPopover";

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
  const cohortCategory = tagCategories.find(
    (t) => t.category_type === "cohort" && t.name !== "All Patients" && t.name !== "All Participants",
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Identity */}
        <Card>
          <div className="mb-3 flex items-baseline gap-2">
            <h2 className="text-sm font-semibold text-navy">Study identity</h2>
            <span className="text-xs text-slate-400">Top-level facts extracted from the protocol</span>
          </div>
          <dl className="grid gap-y-1.5 text-sm" style={{ gridTemplateColumns: "180px 1fr" }}>
            <dt className="text-slate-400">Sponsor</dt>
            <dd className="m-0">
              {identity.sponsor}
              <WhyPopover entry={provenance["identity.sponsor"]} label="sponsor" />
            </dd>

            <dt className="text-slate-400">Indication</dt>
            <dd className="m-0">
              {identity.indication}
              <WhyPopover entry={provenance["identity.indication"]} label="indication" />
            </dd>

            <dt className="text-slate-400">Archetype</dt>
            <dd className="m-0 flex flex-wrap items-center gap-1.5">
              <Pill tone="primary" mono>{identity.archetype.replace("_", " ")}</Pill>
              {identity.phase ? <Pill tone="neutral" mono>{identity.phase}</Pill> : null}
              <WhyPopover entry={provenance["identity.archetype"]} label="archetype" />
            </dd>

            {identity.enrollmentTarget !== undefined ? (
              <>
                <dt className="text-slate-400">Target enrollment</dt>
                <dd className="m-0">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
                    {identity.enrollmentTarget.toLocaleString()}
                  </span>
                  <WhyPopover entry={provenance["identity.enrollmentTarget"]} label="enrollment target" />
                </dd>
              </>
            ) : null}

            <dt className="text-slate-400">Duration</dt>
            <dd className="m-0">
              {identity.duration ?? <span className="text-slate-300">—</span>}
              <WhyPopover entry={provenance["identity.duration"]} label="duration" />
            </dd>

            <dt className="text-slate-400">Source citation</dt>
            <dd className="m-0 text-[11.5px] text-slate-400">{identity.sourceCitation}</dd>
          </dl>
        </Card>

        {/* Vernacular */}
        <Card>
          <div className="mb-3 flex items-baseline gap-2">
            <h2 className="text-sm font-semibold text-navy">Builder vernacular</h2>
            <span className="text-xs text-slate-400">§3.5 — display-only labels per study</span>
          </div>
          <dl className="grid gap-y-1.5 text-sm" style={{ gridTemplateColumns: "180px 1fr" }}>
            <dt className="text-slate-400">Participant noun</dt>
            <dd className="m-0">{study.vernacular.participant_label}</dd>
            <dt className="text-slate-400">Journey element</dt>
            <dd className="m-0">{study.vernacular.journey_element_label}</dd>
            <dt className="text-slate-400">Enrollment trigger</dt>
            <dd className="m-0">{study.vernacular.enrollment_trigger_label}</dd>
          </dl>
          <div className="my-4 h-px bg-slate-100" />
          <p className="text-[11.5px] leading-relaxed text-slate-400">
            Adapted from the protocol. Registry studies typically use &ldquo;Encounter&rdquo; +
            &ldquo;Patient&rdquo;; RCTs use &ldquo;Visit&rdquo; + &ldquo;Participant&rdquo;; survey studies use
            &ldquo;Wave&rdquo; + &ldquo;Respondent&rdquo;.
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Treatment / cohort */}
        <Card>
          <div className="mb-3 flex items-baseline gap-2">
            <h2 className="text-sm font-semibold text-navy">
              {isRegistry ? "Cohort taxonomy" : "Randomization arms"}
            </h2>
            <span className="text-xs text-slate-400">
              {isRegistry
                ? "Cohorts emerge from tag queries at runtime — Doctrine D1"
                : `Treatment category · ${armCategory?.allowed_values.length ?? 0} arms`}
            </span>
          </div>
          {isRegistry ? (
            cohortCategory ? (
              <>
                <div className="mb-2 text-sm font-semibold text-navy">{cohortCategory.name}</div>
                <div className="flex flex-wrap gap-1.5">
                  {cohortCategory.allowed_values.map((v) => (
                    <span
                      key={v.export_code}
                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] text-slate-500"
                    >
                      {v.label}
                      <span className="rounded bg-white px-1 font-mono text-[10px] text-slate-600">
                        {v.export_code}
                      </span>
                    </span>
                  ))}
                </div>
                <WhyPopover
                  entry={provenance["tags.diseaseCategory"] ?? provenance["tags.armCategory"]}
                  label="cohort taxonomy"
                />
              </>
            ) : (
              <p className="text-xs text-slate-400">No cohorts defined yet.</p>
            )
          ) : armCategory ? (
            <>
              <div className="mb-2 text-sm font-semibold text-navy">{armCategory.name}</div>
              <div className="space-y-1.5">
                {armCategory.allowed_values.map((v) => (
                  <div
                    key={v.export_code}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                  >
                    <div className="font-semibold">{v.label}</div>
                    <span className="ml-auto rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
                      {v.export_code}
                    </span>
                  </div>
                ))}
              </div>
              <WhyPopover entry={provenance["tags.armCategory"]} label="arms" />
            </>
          ) : (
            <p className="text-xs text-slate-400">No randomization category set.</p>
          )}
        </Card>

        {/* Journey shape */}
        <Card>
          <div className="mb-3 flex items-baseline gap-2">
            <h2 className="text-sm font-semibold text-navy">Journey shape</h2>
            <span className="text-xs text-slate-400">Counts derived from the extracted Journey Elements + Paths</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Pill tone="primary">{paths.length} paths</Pill>
            <Pill tone="primary">{elements.filter((e) => e.element_type === "milestone").length} milestones</Pill>
            <Pill tone="neutral">{elements.filter((e) => e.element_type === "scheduled").length} scheduled</Pill>
            <Pill tone="neutral">{elements.filter((e) => e.element_type === "cadence_followup").length} cadence</Pill>
            <Pill tone="neutral">{elements.filter((e) => e.element_type === "event_triggered").length} event-triggered</Pill>
            <Pill tone="danger">{elements.filter((e) => e.element_type === "end_state").length} end states</Pill>
          </div>
          <div className="my-4 h-px bg-slate-100" />
          <div className="flex flex-wrap items-center gap-1.5 text-xs leading-relaxed">
            <strong className="text-navy">Paths:</strong>
            {paths.map((p) => <Pill key={p.id} tone="neutral">{p.name}</Pill>)}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-baseline gap-2">
            <h2 className="text-sm font-semibold text-navy">Enrollment definition</h2>
            <span className="text-xs text-slate-400">
              NFR-016 · the trigger that fills the dashboard count
            </span>
          </div>
          <div className="text-xl font-bold capitalize tracking-tight text-navy">
            {enrollmentDefinition.trigger.replace(/_/g, " ")}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            count_unit:{" "}
            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
              {enrollmentDefinition.count_unit}
            </span>
          </div>
        </Card>

        <Card>
          <div className="mb-3 flex items-baseline gap-2">
            <h2 className="text-sm font-semibold text-navy">Disposition catalog</h2>
            <span className="text-xs text-slate-400">Terminal states + permanent catch-all</span>
          </div>
          <div className="space-y-1.5">
            {dispositions.map((d) => (
              <div
                key={d.id}
                className={
                  "flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-[12.5px] " +
                  (d.is_catch_all ? "bg-warning/10" : "")
                }
              >
                <span className="font-medium">{d.label}</span>
                {d.is_terminal ? <Pill tone="danger" mono>terminal</Pill> : null}
                {d.is_catch_all ? <Pill tone="warning" mono>catch-all</Pill> : null}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy outline-none hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <ArrowLeft size={14} /> Back to source pack
        </button>
        <button
          type="button"
          onClick={onAdvance}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white outline-none hover:bg-bright focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          Open study hub <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
