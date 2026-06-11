"use client";

import { useState } from "react";

// NFR-016 — configurable Subject ID structure. The pattern uses tokens that the engine resolves:
//   {site} — assigned site code (e.g., 001)
//   {country} — ISO-2 country code (e.g., US)
//   {seq} — monotonically increasing integer, scope per `sequence_scope`
//   {seq:N} — sequence with N-digit zero-pad (e.g., {seq:4} → 0001, 0002, ...)
//   {study} — study short code

const PRESETS = [
  { pattern: "{site}-{seq:4}",            label: "Site-scoped, 4-digit",           example: "001-0042" },
  { pattern: "{country}-{site}-{seq:4}",  label: "Country-scoped, then site",      example: "US-001-0042" },
  { pattern: "{study}-{site}-{seq:3}",    label: "Study-prefixed",                 example: "ARGO-001-042" },
];

const TOKEN_DOCS = [
  { token: "{site}",     desc: "Site code assigned at site setup" },
  { token: "{country}",  desc: "ISO-2 country code" },
  { token: "{seq}",      desc: "Monotonic integer per scope" },
  { token: "{seq:N}",    desc: "Zero-padded to N digits" },
  { token: "{study}",    desc: "Study short code" },
];

function renderExample(pattern: string): string {
  return pattern
    .replace(/{study}/g, "ARGO")
    .replace(/{country}/g, "US")
    .replace(/{site}/g, "001")
    .replace(/{seq:(\d+)}/g, (_, n) => String(42).padStart(Number(n), "0"))
    .replace(/{seq}/g, "42");
}

export function SubjectIdConfig() {
  const [pattern, setPattern] = useState("{site}-{seq:4}");
  const [scope, setScope] = useState<"study" | "site" | "country">("site");

  return (
    <div className="card">
      <div className="card-header">
        <h2>Subject ID structure</h2>
        <span className="sub">NFR-016 · per-study configurable, locked once first subject is enrolled</span>
      </div>
      <div className="card-body">
        <div className="grid-2">
          <div className="stack">
            <div className="field">
              <label>Pattern</label>
              <input
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                spellCheck={false}
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              />
              <span className="hint">Use tokens — they resolve at enrollment. Preview updates live.</span>
            </div>
            <div className="field">
              <label>Sequence scope</label>
              <select value={scope} onChange={(e) => setScope(e.target.value as typeof scope)}>
                <option value="site">Site — counter restarts per site</option>
                <option value="country">Country — counter restarts per country</option>
                <option value="study">Study — single counter across the study</option>
              </select>
            </div>
          </div>

          <div className="stack">
            <div style={{ fontSize: 11, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Live preview
            </div>
            <div style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 22,
              fontWeight: 600,
              background: "var(--bg-muted)",
              padding: "16px 18px",
              borderRadius: "var(--r-md)",
              border: "1px solid var(--border-subtle)",
            }}>
              {renderExample(pattern)}
            </div>
            <div className="muted" style={{ fontSize: 11 }}>
              Next subject for site 001 will receive this ID. Sequence scope: <strong>{scope}</strong>.
            </div>
          </div>
        </div>

        <div className="divider" />

        <div className="grid-2">
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Quick presets</div>
            <div className="stack" style={{ gap: 6 }}>
              {PRESETS.map((p) => (
                <button
                  key={p.pattern}
                  onClick={() => setPattern(p.pattern)}
                  className="btn"
                  style={{
                    justifyContent: "space-between",
                    width: "100%",
                    background: pattern === p.pattern ? "var(--accent-soft)" : undefined,
                    borderColor: pattern === p.pattern ? "var(--accent)" : undefined,
                  }}
                >
                  <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>{p.pattern}</span>
                  <span className="muted" style={{ fontSize: 11 }}>{p.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Tokens</div>
            <table className="table">
              <tbody>
                {TOKEN_DOCS.map((t) => (
                  <tr key={t.token}>
                    <td style={{ width: 100 }}><span className="code">{t.token}</span></td>
                    <td className="muted">{t.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
