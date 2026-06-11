import { EnvBanner } from "@/components/EnvBanner";
import { VersionBadge } from "@/components/VersionBadge";
import {
  SEED_CATEGORIES,
  SEED_RULES,
  TRIGGER_LABELS,
  CATEGORY_TYPE_LABELS,
  ASSIGNMENT_MODE_LABELS,
} from "@/components/tags/seed";

export default function TagsPage() {
  return (
    <>
      <div className="page-header">
        <h1>Tags & Rules</h1>
        <p className="lede">
          Participants accumulate tags throughout their journey — they are not pre-grouped at
          design time. <strong>Groups don&apos;t exist as a stored entity</strong>; they are queries over
          tags at runtime. (PRD #12 v0.8 §4, Doctrine D1.)
        </p>
        <span className="source-tag">Kelly Ritch · 2026-06-04 · v0.8 inversion of the Participant Group entity</span>
      </div>

      <EnvBanner />

      {/* -------------------------------------------------------------------
          Tag Categories
          ------------------------------------------------------------------- */}
      <div className="card">
        <div className="card-header">
          <h2>Tag Categories</h2>
          <span className="sub">The taxonomy this study uses to characterize participants</span>
          <div style={{ marginLeft: "auto" }}>
            <button className="btn btn-primary btn-sm">+ New Category</button>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 180 }}>Builder name (§3.5)</th>
                <th style={{ width: 130 }}>category_type</th>
                <th style={{ width: 150 }}>Allowed values</th>
                <th style={{ width: 130 }}>assignment_mode</th>
                <th>Usages</th>
                <th style={{ width: 70 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {SEED_CATEGORIES.map((tc) => (
                <tr key={tc.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{tc.name}</div>
                    {tc.description ? (
                      <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{tc.description}</div>
                    ) : null}
                  </td>
                  <td><span className="chip slate">{CATEGORY_TYPE_LABELS[tc.category_type]}</span></td>
                  <td>
                    <div className="stack" style={{ gap: 4 }}>
                      {tc.allowed_values.map((v) => (
                        <div key={v.export_code} style={{ fontSize: 12 }}>
                          {v.label} <span className="code">{v.export_code}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`chip ${tc.assignment_mode === "manual" ? "amber" : "blue"}`}>
                      {ASSIGNMENT_MODE_LABELS[tc.assignment_mode]}
                    </span>
                  </td>
                  <td>
                    <div className="row wrap" style={{ gap: 4 }}>
                      {tc.usages.map((u) => (
                        <span key={u} className="chip" style={{ fontSize: 10 }}>{u}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    {tc.category_type === "all_participants" ? (
                      <span className="chip slate">Locked</span>
                    ) : tc.active ? (
                      <span className="chip green">Active</span>
                    ) : (
                      <span className="chip">Deprecated</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ height: 24 }} />

      {/* -------------------------------------------------------------------
          Tag Assignment Rules
          ------------------------------------------------------------------- */}
      <div className="card">
        <div className="card-header">
          <h2>Tag Assignment Rules</h2>
          <span className="sub">How a participant accumulates tags — auto and manual are both first-class (Pooja/Ana 2026-06-10)</span>
          <div style={{ marginLeft: "auto" }}>
            <button className="btn btn-primary btn-sm">+ New Rule</button>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 180 }}>Category</th>
                <th style={{ width: 130 }}>trigger_type</th>
                <th>Condition (preview)</th>
                <th style={{ width: 90 }}>target_value</th>
                <th style={{ width: 130 }}>Owner</th>
                <th style={{ width: 90 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {SEED_RULES.map((r) => {
                const cat = SEED_CATEGORIES.find((c) => c.id === r.tag_category_id);
                return (
                  <tr key={r.id}>
                    <td>{cat?.name ?? r.tag_category_id}</td>
                    <td>
                      <span className={`chip ${r.trigger_type === "manual" ? "amber" : "blue"}`}>
                        {TRIGGER_LABELS[r.trigger_type]}
                      </span>
                    </td>
                    <td style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11.5 }}>
                      {r.condition_preview}
                    </td>
                    <td><span className="code">{r.target_value}</span></td>
                    <td>{r.owner_role ?? <span className="muted">—</span>}</td>
                    <td>
                      <span className={`chip ${r.validation_status === "ok" ? "green" : "amber"}`}>
                        {r.validation_status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ height: 24 }} />

      {/* -------------------------------------------------------------------
          Tag accumulation example — Story 4c
          ------------------------------------------------------------------- */}
      <div className="card">
        <div className="card-header">
          <h2>Example: tag accumulation for one participant</h2>
          <span className="sub">Story 4c — append-only event log; current tag = latest non-superseded row</span>
        </div>
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Category</th>
                <th>Value</th>
                <th>Assigned by</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>2026-04-12 09:14</td><td>All Participants</td><td><span className="code">ALL</span></td><td>system</td><td>auto on participant create</td></tr>
              <tr><td>2026-04-12 09:14</td><td>Risk Profile</td><td><span className="code">HR</span></td><td>rule <span className="code">r-risk-form</span></td><td>Baseline form: GFR=52</td></tr>
              <tr><td>2026-04-18 14:02</td><td>Randomization Arm</td><td><span className="code">TRTA</span></td><td>rule <span className="code">r-arm-irt</span></td><td>IRT msg #IRT-447</td></tr>
              <tr><td>2026-04-18 14:02</td><td>Enrollment Cohort</td><td><span className="code">C1</span></td><td>rule <span className="code">r-cohort-time</span></td><td>First-50-enrolled rule</td></tr>
              <tr><td>2026-05-30 11:20</td><td>Randomization Arm</td><td><span className="code">SOC</span></td><td>user <span className="code">akhan@…</span></td><td>Manual override · reason: &quot;Re-randomized per protocol amendment v1.2&quot;</td></tr>
              <tr><td>2026-06-01 08:00</td><td>ITT Population</td><td><span className="code">ITT</span></td><td>rule <span className="code">r-itt-rule</span></td><td>Conditional: randomized AND no PV</td></tr>
            </tbody>
          </table>
          <div className="divider" />
          <div className="row" style={{ gap: 12, flexWrap: "wrap" }}>
            <span className="muted" style={{ fontSize: 12 }}>Current tag set:</span>
            <span className="chip slate">All Participants: ALL</span>
            <span className="chip slate">Risk Profile: HR</span>
            <span className="chip slate">Randomization Arm: SOC <span style={{ opacity: 0.7, marginLeft: 4 }}>(was TRTA)</span></span>
            <span className="chip slate">Enrollment Cohort: C1</span>
            <span className="chip slate">ITT: ITT</span>
            <VersionBadge status="Published" label="Bound to v1.2" />
          </div>
        </div>
      </div>
    </>
  );
}
