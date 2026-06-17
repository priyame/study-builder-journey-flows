"use client";

import { useEffect, useState } from "react";
import { useActiveStudy } from "@/lib/active-study";
import { Card, cx } from "@/components/ui";

// NFR-016 — configurable Subject ID structure.

const PRESETS = [
  { pattern: "{site}-{seq:4}",           label: "Site-scoped, 4-digit",      example: "001-0042" },
  { pattern: "{country}-{site}-{seq:4}", label: "Country-scoped, then site", example: "US-001-0042" },
  { pattern: "{study}-{site}-{seq:3}",   label: "Study-prefixed",            example: "ARGO-001-042" },
];

const TOKEN_DOCS = [
  { token: "{site}",    desc: "Site code assigned at site setup" },
  { token: "{country}", desc: "ISO-2 country code" },
  { token: "{seq}",     desc: "Monotonic integer per scope" },
  { token: "{seq:N}",   desc: "Zero-padded to N digits" },
  { token: "{study}",   desc: "Study short code" },
];

function renderExample(pattern: string, studyCode: string): string {
  return pattern
    .replace(/{study}/g, studyCode)
    .replace(/{country}/g, "US")
    .replace(/{site:(\d+)}/g, (_, n) => String(14).padStart(Number(n), "0"))
    .replace(/{site}/g, "001")
    .replace(/{seq:(\d+)}/g, (_, n) => String(42).padStart(Number(n), "0"))
    .replace(/{seq}/g, "42");
}

export function SubjectIdConfig() {
  const study = useActiveStudy();
  const [pattern, setPattern] = useState(study.subjectId.pattern);
  const [scope, setScope] = useState<"study" | "site" | "country">(study.subjectId.sequence_scope);

  useEffect(() => {
    setPattern(study.subjectId.pattern);
    setScope(study.subjectId.sequence_scope);
  }, [study.identity.id, study.subjectId.pattern, study.subjectId.sequence_scope]);

  return (
    <Card>
      <div className="mb-4 flex items-baseline gap-2">
        <h2 className="text-sm font-semibold text-navy">Subject ID structure</h2>
        <span className="text-xs text-slate-400">
          NFR-016 · per-study configurable, locked once first subject is enrolled
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-500">Pattern</span>
            <input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              spellCheck={false}
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-[13px] text-navy outline-none focus:ring-2 focus:ring-primary/30"
            />
            <span className="mt-1 block text-[11px] text-slate-400">
              Use tokens — they resolve at enrollment. Preview updates live.
            </span>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-500">Sequence scope</span>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as typeof scope)}
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-navy outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="site">Site — counter restarts per site</option>
              <option value="country">Country — counter restarts per country</option>
              <option value="study">Study — single counter across the study</option>
            </select>
          </label>
        </div>

        <div className="space-y-2">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Live preview
          </div>
          <div className="rounded-lg border border-slate-200 bg-canvas px-4 py-3 font-mono text-2xl font-semibold text-navy">
            {renderExample(pattern, study.identity.code)}
          </div>
          <div className="text-[11px] text-slate-400">
            Next subject for site 001 will receive this ID. Sequence scope: <strong>{scope}</strong>.
          </div>
        </div>
      </div>

      <div className="my-4 h-px bg-slate-100" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-2 text-xs font-semibold text-navy">Quick presets</div>
          <div className="flex flex-col gap-1.5">
            {PRESETS.map((p) => {
              const active = pattern === p.pattern;
              return (
                <button
                  key={p.pattern}
                  type="button"
                  onClick={() => setPattern(p.pattern)}
                  className={cx(
                    "flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/40",
                    active ? "border-primary bg-primary/[0.06]" : "border-slate-200 bg-white hover:bg-canvas",
                  )}
                >
                  <span className="font-mono text-[12px]">{p.pattern}</span>
                  <span className="text-slate-400">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <div className="mb-2 text-xs font-semibold text-navy">Tokens</div>
          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="w-full text-sm">
              <tbody>
                {TOKEN_DOCS.map((t) => (
                  <tr key={t.token} className="border-t border-slate-50 first:border-t-0">
                    <td className="w-[110px] px-3 py-2">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">{t.token}</span>
                    </td>
                    <td className="px-3 py-2 text-slate-500">{t.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Card>
  );
}
