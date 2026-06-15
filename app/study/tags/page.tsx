"use client";

import { EnvBanner } from "@/components/EnvBanner";
import { VersionBadge } from "@/components/VersionBadge";
import {
  TRIGGER_LABELS,
  CATEGORY_TYPE_LABELS,
  ASSIGNMENT_MODE_LABELS,
} from "@/components/tags/seed";
import { useActiveStudy } from "@/lib/active-study";

export default function TagsPage() {
  const study = useActiveStudy();
  const { tagCategories, tagRules, identity } = study;

  return (
    <>
      <div className="page-header">
        <h1>Tags & Rules</h1>
        <p className="lede">
          Participants accumulate tags throughout their journey — they are not pre-grouped at
          design time. <strong>Groups don&apos;t exist as a stored entity</strong>; they are queries over
          tags at runtime. (PRD #12 v0.8 §4, Doctrine D1.) — viewing{" "}
          <strong style={{ color: "var(--accent)" }}>{identity.code}</strong>.
        </p>
        <span className="source-tag">Kelly Ritch · 2026-06-04 · v0.8 inversion of the Participant Group entity</span>
      </div>

      <EnvBanner />

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
                <th style={{ width: 200 }}>Allowed values</th>
                <th style={{ width: 130 }}>assignment_mode</th>
                <th>Usages</th>
                <th style={{ width: 80 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {tagCategories.map((tc) => (
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

      <div className="card">
        <div className="card-header">
          <h2>Tag Assignment Rules</h2>
          <span className="sub">How a participant accumulates tags — auto and manual are both first-class</span>
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
                <th style={{ width: 100 }}>target_value</th>
                <th style={{ width: 150 }}>Owner</th>
                <th style={{ width: 90 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {tagRules.map((r) => {
                const cat = tagCategories.find((c) => c.id === r.tag_category_id);
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

      <div className="card">
        <div className="card-header">
          <h2>Vernacular for {identity.code}</h2>
          <span className="sub">§3.5 — builder-named labels per study; renaming is non-versioning</span>
        </div>
        <div className="card-body">
          <table className="table">
            <tbody>
              <tr><td style={{ width: 220 }} className="muted">Participant label</td><td style={{ fontWeight: 600 }}>{study.vernacular.participant_label}</td></tr>
              <tr><td className="muted">Journey element label</td><td style={{ fontWeight: 600 }}>{study.vernacular.journey_element_label}</td></tr>
              <tr><td className="muted">Enrollment trigger label</td><td style={{ fontWeight: 600 }}>{study.vernacular.enrollment_trigger_label}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="card">
        <div className="card-header">
          <h2>Example: tag accumulation for one participant</h2>
          <span className="sub">Append-only event log; current tag = latest non-superseded row</span>
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
              {tagCategories.filter((c) => c.category_type !== "all_participants").slice(0, 3).map((c, i) => (
                <tr key={c.id}>
                  <td>2026-04-1{8 + i} 14:0{i}</td>
                  <td>{c.name}</td>
                  <td><span className="code">{c.allowed_values[0]?.export_code}</span></td>
                  <td>{c.assignment_mode === "manual" ? "user · jrose@…" : `rule`}</td>
                  <td>{c.description ?? c.assignment_mode}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="divider" />
          <div className="row" style={{ gap: 12, flexWrap: "wrap" }}>
            <span className="muted" style={{ fontSize: 12 }}>Current tag set:</span>
            {tagCategories.slice(0, 5).map((c) => (
              <span key={c.id} className="chip slate">
                {c.name}: {c.allowed_values[0]?.export_code}
              </span>
            ))}
            <VersionBadge status="Published" label="Bound to current Live" />
          </div>
        </div>
      </div>
    </>
  );
}
