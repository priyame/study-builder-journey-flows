import { EnvBanner } from "@/components/EnvBanner";
import { SubjectIdConfig } from "@/components/subjects/SubjectIdConfig";
import { EnrollmentDefBuilder } from "@/components/subjects/EnrollmentDefBuilder";
import { DispositionCatchAll } from "@/components/subjects/DispositionCatchAll";
import { Card, PageGuide, PageHeader, Pill } from "@/components/ui";

export default function SubjectsPage() {
  return (
    <>
      <PageHeader
        phase="capture"
        title="Subjects & Enrollment"
        subtitle={
          <>
            Three operational asks from Pooja and Ana (2026-06-10): a configurable subject ID
            structure, a configurable enrollment trigger, and a disposition catalog with a permanent
            catch-all so no participant ever ends up in limbo.
          </>
        }
        action={<Pill tone="primary" mono>NFR-016</Pill>}
      />

      <PageGuide eyebrow="Why this matters">
        Different sponsors define &ldquo;enrolled&rdquo; differently and need different subject-ID
        patterns. Hard-coding these forces engineering at study startup. Per-study config + a
        permanent catch-all keeps the live study in a valid state without engineering touching it.
      </PageGuide>

      <EnvBanner />

      <SubjectIdConfig />

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <EnrollmentDefBuilder />
        <DispositionCatchAll />
      </div>

      <div className="mt-6">
        <Card>
          <div className="mb-3 flex items-baseline gap-2">
            <h2 className="text-sm font-semibold text-navy">
              State transitions — auto + manual are both first-class
            </h2>
            <span className="text-xs text-slate-400">
              The rule fires automatically when its condition is met; a coordinator can also advance manually with audit
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <div className="mb-2 text-xs font-semibold text-navy">Auto-advance rules</div>
              <div className="overflow-x-auto rounded-lg border border-slate-100">
                <table className="w-full text-sm">
                  <thead className="bg-canvas">
                    <tr className="border-b border-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-400">
                      <th className="px-3 py-2 font-medium">From → To</th>
                      <th className="px-3 py-2 font-medium">Trigger</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-slate-50"><td className="px-3 py-2">Screening → Eligible</td><td className="px-3 py-2 text-slate-600">Eligibility form complete AND all criteria met</td></tr>
                    <tr className="border-t border-slate-50"><td className="px-3 py-2">Eligible → Randomized</td><td className="px-3 py-2 text-slate-600">IRT message received</td></tr>
                    <tr className="border-t border-slate-50"><td className="px-3 py-2">Randomized → On Treatment</td><td className="px-3 py-2 text-slate-600">First dose recorded</td></tr>
                    <tr className="border-t border-slate-50"><td className="px-3 py-2">On Treatment → Completed</td><td className="px-3 py-2 text-slate-600">Final visit + treatment complete</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs font-semibold text-navy">Manual-advance permissions</div>
              <div className="overflow-x-auto rounded-lg border border-slate-100">
                <table className="w-full text-sm">
                  <thead className="bg-canvas">
                    <tr className="border-b border-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-400">
                      <th className="px-3 py-2 font-medium">Action</th>
                      <th className="px-3 py-2 font-medium">Required permission</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-slate-50"><td className="px-3 py-2">Force-advance state</td><td className="px-3 py-2"><span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">subject.state.advance</span></td></tr>
                    <tr className="border-t border-slate-50"><td className="px-3 py-2">Withdraw subject</td><td className="px-3 py-2"><span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">subject.disposition.set</span></td></tr>
                    <tr className="border-t border-slate-50"><td className="px-3 py-2">Override tag value</td><td className="px-3 py-2"><span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">subject.tag.override</span></td></tr>
                    <tr className="border-t border-slate-50"><td className="px-3 py-2">Set catch-all disposition</td><td className="px-3 py-2"><span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">subject.disposition.set</span> + free-text reason</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="my-4 h-px bg-slate-100" />
          <p className="text-xs text-slate-500">
            Manual transitions write the same audit shape as auto-fires, with{" "}
            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">assigned_by=user_id</span>{" "}
            and a required reason. Same row, different actor.
          </p>
        </Card>
      </div>
    </>
  );
}
