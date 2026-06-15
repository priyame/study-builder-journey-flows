"use client";

import { EnvBanner } from "@/components/EnvBanner";
import { VersionBadge } from "@/components/VersionBadge";
import { RULE_TABLE } from "@/components/versions/seed";
import { useActiveStudy } from "@/lib/active-study";

export default function VersionsPage() {
  const study = useActiveStudy();
  const versions = study.versions;
  const draft  = versions.find((v) => v.env === "draft");
  const uat    = versions.find((v) => v.env === "uat");
  const live   = versions.find((v) => v.env === "live" && v.status === "Published");
  const retired = versions.filter((v) => v.status === "Retired");

  return (
    <>
      <div className="page-header">
        <h1>Versions</h1>
        <p className="lede">
          One study, one entity, three environment scopes. A Study Version is authored in <strong>Draft</strong>,
          promoted to <strong>UAT</strong> via Sign-Off, and promoted to <strong>Live</strong> via Publish.
          Viewing <strong style={{ color: "var(--accent)" }}>{study.identity.code}</strong> version history.
        </p>
        <span className="source-tag">PRD #12 v0.8 §§21–28 · NFR-107 · supersedes Sandbox/Production from v0.4</span>
      </div>

      <EnvBanner />

      <div className="grid-3">
        <div className="card" style={{ borderTop: "3px solid var(--env-draft)" }}>
          <div className="card-header">
            <h2>Draft</h2>
            <VersionBadge status="Draft" />
          </div>
          <div className="card-body">
            {draft ? (
              <>
                <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{draft.version_label}</div>
                <div className="muted" style={{ fontSize: 12, marginBottom: 14 }}>Protocol {draft.protocol_version_label} · editable</div>
                <div className="stack" style={{ gap: 8 }}>
                  {draft.changes.map((c, i) => (
                    <div key={i} style={{ fontSize: 12, lineHeight: 1.45 }}>
                      <span className="chip slate" style={{ marginRight: 6, fontSize: 10 }}>{c.area}</span>
                      {c.summary}
                      {c.versioning_class === "non_versioning" ? (
                        <span className="chip" style={{ marginLeft: 6, fontSize: 10 }}>non-versioning</span>
                      ) : null}
                    </div>
                  ))}
                </div>
                <div className="divider" />
                <button className="btn btn-primary btn-sm" style={{ width: "100%", justifyContent: "center" }}>
                  Sign Off → promote to UAT
                </button>
              </>
            ) : <span className="muted">No Draft.</span>}
          </div>
        </div>

        <div className="card" style={{ borderTop: "3px solid var(--env-uat)" }}>
          <div className="card-header">
            <h2>UAT</h2>
            <VersionBadge status="Signed Off" />
          </div>
          <div className="card-body">
            {uat ? (
              <>
                <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{uat.version_label}</div>
                <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Protocol {uat.protocol_version_label} · frozen</div>
                <div className="muted" style={{ fontSize: 11, marginBottom: 14 }}>
                  Signed off {uat.signed_off_at} by {uat.signed_off_by}
                </div>
                <div className="stack" style={{ gap: 8 }}>
                  {uat.changes.map((c, i) => (
                    <div key={i} style={{ fontSize: 12, lineHeight: 1.45 }}>
                      <span className="chip slate" style={{ marginRight: 6, fontSize: 10 }}>{c.area}</span>
                      {c.summary}
                      {c.versioning_class === "non_versioning" ? (
                        <span className="chip" style={{ marginLeft: 6, fontSize: 10 }}>non-versioning</span>
                      ) : null}
                    </div>
                  ))}
                </div>
                <div className="divider" />
                <button className="btn btn-primary btn-sm" style={{ width: "100%", justifyContent: "center" }}>
                  Publish → promote to Live (separate e-sig)
                </button>
              </>
            ) : <span className="muted">No version in UAT.</span>}
          </div>
        </div>

        <div className="card" style={{ borderTop: "3px solid var(--env-live)" }}>
          <div className="card-header">
            <h2>Live</h2>
            <VersionBadge status="Published" />
          </div>
          <div className="card-body">
            {live ? (
              <>
                <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{live.version_label}</div>
                <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>
                  Protocol {live.protocol_version_label} · operative configuration
                </div>
                <div className="muted" style={{ fontSize: 11, marginBottom: 14 }}>
                  Published {live.published_at} by {live.published_by}
                </div>
                <div className="stack" style={{ gap: 8 }}>
                  {live.changes.map((c, i) => (
                    <div key={i} style={{ fontSize: 12, lineHeight: 1.45 }}>
                      <span className="chip slate" style={{ marginRight: 6, fontSize: 10 }}>{c.area}</span>
                      {c.summary}
                    </div>
                  ))}
                </div>
                <div className="divider" />
                <div className="muted" style={{ fontSize: 11, lineHeight: 1.5 }}>
                  <strong style={{ color: "var(--fg-secondary)" }}>Warn-and-allow zone (§23.6):</strong> non-versioning edits
                  (instructions, edit checks, visit windows, display labels) can be applied directly with a captured reason.
                </div>
              </>
            ) : <span className="muted">No Live version.</span>}
          </div>
        </div>
      </div>

      <div style={{ height: 28 }} />

      <div className="card">
        <div className="card-header">
          <h2>Retired versions</h2>
          <span className="sub">Auto-retired in the same transaction as the next Publish</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {retired.length === 0 ? (
            <div className="card-body" style={{ padding: 16 }}>
              <div className="muted" style={{ fontSize: 12 }}>No retired versions yet — this study is on its first Published version.</div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 80 }}>Version</th>
                  <th style={{ width: 110 }}>Protocol</th>
                  <th style={{ width: 140 }}>Published</th>
                  <th style={{ width: 200 }}>Published by</th>
                  <th>Notes</th>
                  <th style={{ width: 100 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {retired.map((v) => (
                  <tr key={v.id}>
                    <td><strong>{v.version_label}</strong></td>
                    <td>{v.protocol_version_label}</td>
                    <td>{v.published_at}</td>
                    <td>{v.published_by}</td>
                    <td className="muted">{v.changes[0]?.summary}</td>
                    <td><VersionBadge status="Retired" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div style={{ height: 28 }} />

      <div className="card">
        <div className="card-header">
          <h2>What counts as a versioning change?</h2>
          <span className="sub">§23.4 — Kelly Ritch + Kristen, 2026-06-09</span>
        </div>
        <div className="card-body">
          <blockquote style={{
            margin: "0 0 16px",
            padding: "10px 14px",
            borderLeft: "3px solid var(--accent)",
            background: "var(--bg-muted)",
            fontStyle: "italic",
            color: "var(--fg-secondary)",
            fontSize: 13,
          }}>
            Anything that reaches the dataset is a new version; pure on-screen or logistical text that never enters the data is not.
          </blockquote>
          <table className="table">
            <thead>
              <tr>
                <th>Change</th>
                <th style={{ width: 130 }}>New version?</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {RULE_TABLE.map((r, i) => (
                <tr key={i}>
                  <td>{r.change}</td>
                  <td>
                    {r.versions ? (
                      <span className="chip rose">Yes — versions</span>
                    ) : (
                      <span className="chip green">No</span>
                    )}
                  </td>
                  <td className="muted">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
