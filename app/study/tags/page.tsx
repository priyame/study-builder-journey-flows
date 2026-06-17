"use client";

import { EnvBanner } from "@/components/EnvBanner";
import { VersionBadge } from "@/components/VersionBadge";
import {
  TRIGGER_LABELS,
  CATEGORY_TYPE_LABELS,
  ASSIGNMENT_MODE_LABELS,
} from "@/components/tags/seed";
import { useActiveStudy } from "@/lib/active-study";
import { Card, PageGuide, PageHeader, Pill } from "@/components/ui";

export default function TagsPage() {
  const study = useActiveStudy();
  const { tagCategories, tagRules, identity } = study;

  return (
    <>
      <PageHeader
        phase="design"
        title="Tags & Rules"
        subtitle={
          <>
            Participants accumulate tags throughout their journey — they are not pre-grouped at
            design time. <strong className="font-semibold text-navy">Groups don&apos;t exist as a
            stored entity</strong>; they are queries over tags at runtime (PRD #12 v0.8 §4, Doctrine
            D1).
          </>
        }
        action={<Pill tone="navy" mono>{identity.code}</Pill>}
      />

      <PageGuide eyebrow="Why this matters">
        Kelly Ritch (2026-06-04): &ldquo;A human is going to go on a journey and throughout the way,
        we&apos;re going to hang a bunch of tags on them that later help us group them. But we
        aren&apos;t pre-grouping them.&rdquo;
      </PageGuide>

      <EnvBanner />

      <Card className="p-0">
        <div className="flex flex-wrap items-baseline gap-2 border-b border-slate-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-navy">Tag Categories</h2>
          <span className="text-xs text-slate-400">
            The taxonomy this study uses to characterize participants
          </span>
          <button
            type="button"
            className="ml-auto rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-white outline-none hover:bg-bright focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            + New Category
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-canvas">
              <tr className="border-b border-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-400">
                <th className="px-3 py-2.5 font-medium">Builder name (§3.5)</th>
                <th className="px-3 py-2.5 font-medium">category_type</th>
                <th className="px-3 py-2.5 font-medium">Allowed values</th>
                <th className="px-3 py-2.5 font-medium">assignment_mode</th>
                <th className="px-3 py-2.5 font-medium">Usages</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {tagCategories.map((tc) => (
                <tr key={tc.id} className="border-t border-slate-50 align-top">
                  <td className="px-3 py-2.5">
                    <div className="font-semibold text-navy">{tc.name}</div>
                    {tc.description ? (
                      <div className="mt-0.5 text-[11px] text-slate-400">{tc.description}</div>
                    ) : null}
                  </td>
                  <td className="px-3 py-2.5">
                    <Pill tone="neutral" mono>{CATEGORY_TYPE_LABELS[tc.category_type]}</Pill>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-col gap-1">
                      {tc.allowed_values.map((v) => (
                        <div key={v.export_code} className="text-xs">
                          {v.label}{" "}
                          <span className="rounded bg-slate-100 px-1 font-mono text-[10px] text-slate-600">
                            {v.export_code}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <Pill tone={tc.assignment_mode === "manual" ? "warning" : "primary"} mono>
                      {ASSIGNMENT_MODE_LABELS[tc.assignment_mode]}
                    </Pill>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {tc.usages.map((u) => (
                        <Pill key={u} tone="neutral" mono>{u}</Pill>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    {tc.category_type === "all_participants" ? (
                      <Pill tone="neutral">Locked</Pill>
                    ) : tc.active ? (
                      <Pill tone="success">Active</Pill>
                    ) : (
                      <Pill tone="neutral">Deprecated</Pill>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-6">
        <Card className="p-0">
          <div className="flex flex-wrap items-baseline gap-2 border-b border-slate-100 px-5 py-3">
            <h2 className="text-sm font-semibold text-navy">Tag Assignment Rules</h2>
            <span className="text-xs text-slate-400">
              How a participant accumulates tags — auto and manual are both first-class
            </span>
            <button
              type="button"
              className="ml-auto rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-white outline-none hover:bg-bright focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              + New Rule
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-canvas">
                <tr className="border-b border-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-2.5 font-medium">Category</th>
                  <th className="px-3 py-2.5 font-medium">trigger_type</th>
                  <th className="px-3 py-2.5 font-medium">Condition (preview)</th>
                  <th className="px-3 py-2.5 font-medium">target_value</th>
                  <th className="px-3 py-2.5 font-medium">Owner</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {tagRules.map((r) => {
                  const cat = tagCategories.find((c) => c.id === r.tag_category_id);
                  return (
                    <tr key={r.id} className="border-t border-slate-50 align-top">
                      <td className="px-3 py-2.5">{cat?.name ?? r.tag_category_id}</td>
                      <td className="px-3 py-2.5">
                        <Pill tone={r.trigger_type === "manual" ? "warning" : "primary"} mono>
                          {TRIGGER_LABELS[r.trigger_type]}
                        </Pill>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[11.5px]">
                        {r.condition_preview}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
                          {r.target_value}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        {r.owner_role ?? <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-3 py-2.5">
                        <Pill tone={r.validation_status === "ok" ? "success" : "warning"}>
                          {r.validation_status}
                        </Pill>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-baseline gap-2">
            <h2 className="text-sm font-semibold text-navy">Vernacular for {identity.code}</h2>
            <span className="text-xs text-slate-400">§3.5 — builder-named labels per study</span>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-t border-slate-50 first:border-t-0">
                  <td className="w-[200px] px-3 py-2 text-slate-500">Participant label</td>
                  <td className="px-3 py-2 font-semibold text-navy">{study.vernacular.participant_label}</td>
                </tr>
                <tr className="border-t border-slate-50">
                  <td className="px-3 py-2 text-slate-500">Journey element label</td>
                  <td className="px-3 py-2 font-semibold text-navy">{study.vernacular.journey_element_label}</td>
                </tr>
                <tr className="border-t border-slate-50">
                  <td className="px-3 py-2 text-slate-500">Enrollment trigger label</td>
                  <td className="px-3 py-2 font-semibold text-navy">{study.vernacular.enrollment_trigger_label}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Renaming is non-versioning per §23.4.</p>
        </Card>

        <Card>
          <div className="mb-3 flex items-baseline gap-2">
            <h2 className="text-sm font-semibold text-navy">Example: tag accumulation</h2>
            <span className="text-xs text-slate-400">Append-only event log</span>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-canvas">
                <tr className="border-b border-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-2 font-medium">Timestamp</th>
                  <th className="px-3 py-2 font-medium">Category</th>
                  <th className="px-3 py-2 font-medium">Value</th>
                  <th className="px-3 py-2 font-medium">Assigned by</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-50">
                  <td className="px-3 py-2 font-mono text-[11px]">2026-04-12 09:14</td>
                  <td className="px-3 py-2">All Participants</td>
                  <td className="px-3 py-2">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">ALL</span>
                  </td>
                  <td className="px-3 py-2 text-slate-500">system</td>
                </tr>
                {tagCategories
                  .filter((c) => c.category_type !== "all_participants")
                  .slice(0, 3)
                  .map((c, i) => (
                    <tr key={c.id} className="border-t border-slate-50">
                      <td className="px-3 py-2 font-mono text-[11px]">2026-04-1{8 + i} 14:0{i}</td>
                      <td className="px-3 py-2">{c.name}</td>
                      <td className="px-3 py-2">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                          {c.allowed_values[0]?.export_code}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-500">
                        {c.assignment_mode === "manual" ? "user · jrose@…" : "rule"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">Current tag set:</span>
            {tagCategories.slice(0, 5).map((c) => (
              <Pill key={c.id} tone="neutral" mono>
                {c.name}: {c.allowed_values[0]?.export_code}
              </Pill>
            ))}
            <VersionBadge status="Published" label="Bound to current Live" />
          </div>
        </Card>
      </div>
    </>
  );
}
