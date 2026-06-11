import { EnvBanner } from "@/components/EnvBanner";
import { SubjectIdConfig } from "@/components/subjects/SubjectIdConfig";
import { EnrollmentDefBuilder } from "@/components/subjects/EnrollmentDefBuilder";
import { DispositionCatchAll } from "@/components/subjects/DispositionCatchAll";

export default function SubjectsPage() {
  return (
    <>
      <div className="page-header">
        <h1>Subjects & Enrollment</h1>
        <p className="lede">
          Three operational asks from Pooja and Ana (2026-06-10): a configurable subject ID
          structure, a configurable enrollment trigger, and a disposition catalog with a permanent
          catch-all so no participant ever ends up in limbo.
        </p>
        <span className="source-tag">PRD #12 v0.8 · NFR-016 · Pooja + Ana 2026-06-10</span>
      </div>

      <EnvBanner />

      <SubjectIdConfig />
      <div style={{ height: 24 }} />

      <div className="grid-2">
        <EnrollmentDefBuilder />
        <DispositionCatchAll />
      </div>

      <div style={{ height: 24 }} />

      {/* -------------------------------------------------------------------
          Auto + manual state transitions example
          ------------------------------------------------------------------- */}
      <div className="card">
        <div className="card-header">
          <h2>State transitions — auto + manual are both first-class</h2>
          <span className="sub">Pooja + Ana — the rule fires automatically when its condition is met; a coordinator can also advance manually with audit</span>
        </div>
        <div className="card-body">
          <div className="grid-2">
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Auto-advance rules</div>
              <table className="table">
                <thead>
                  <tr><th>From → To</th><th>Trigger</th></tr>
                </thead>
                <tbody>
                  <tr><td>Screening → Eligible</td><td>Eligibility form complete AND all criteria met</td></tr>
                  <tr><td>Eligible → Randomized</td><td>IRT message received</td></tr>
                  <tr><td>Randomized → On Treatment</td><td>First dose recorded</td></tr>
                  <tr><td>On Treatment → Completed</td><td>Final visit + treatment complete</td></tr>
                </tbody>
              </table>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Manual-advance permissions</div>
              <table className="table">
                <thead>
                  <tr><th>Action</th><th>Required permission</th></tr>
                </thead>
                <tbody>
                  <tr><td>Force-advance state</td><td><span className="code">subject.state.advance</span></td></tr>
                  <tr><td>Withdraw subject</td><td><span className="code">subject.disposition.set</span></td></tr>
                  <tr><td>Override tag value</td><td><span className="code">subject.tag.override</span></td></tr>
                  <tr><td>Set catch-all disposition</td><td><span className="code">subject.disposition.set</span> + free-text reason</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="divider" />
          <div className="muted" style={{ fontSize: 12 }}>
            Manual transitions write the same audit shape as auto-fires, with <span className="code">assigned_by=user_id</span>
            and a required reason. Same row, different actor.
          </div>
        </div>
      </div>
    </>
  );
}
