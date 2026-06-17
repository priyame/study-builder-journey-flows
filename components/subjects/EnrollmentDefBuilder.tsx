"use client";

import { useEffect, useState } from "react";
import { useActiveStudy } from "@/lib/active-study";
import { Card, cx } from "@/components/ui";

// Pooja+Ana 2026-06-10 — enrollment trigger is configurable per study.

const PRESETS = [
  { id: "consented",             label: "Consented",             note: "Count from informed consent — simplest, most permissive" },
  { id: "screened_and_eligible", label: "Screened & Eligible",   note: "Count from completed screening with eligibility met" },
  { id: "randomized",            label: "Randomized",            note: "Count from IRT randomization — strictest" },
  { id: "first_dose",            label: "First Dose",            note: "Count from first dose administration — for IND studies" },
  { id: "custom",                label: "Custom",                note: "Define your own trigger expression" },
];

export function EnrollmentDefBuilder() {
  const study = useActiveStudy();
  const [trigger, setTrigger] = useState<string>(study.enrollmentDefinition.trigger);
  const [custom, setCustom] = useState("subject.eligibility = true AND subject.first_dose_at IS NOT NULL");

  useEffect(() => {
    setTrigger(study.enrollmentDefinition.trigger);
  }, [study.identity.id, study.enrollmentDefinition.trigger]);

  return (
    <Card>
      <div className="mb-3 flex items-baseline gap-2">
        <h2 className="text-sm font-semibold text-navy">Enrollment definition</h2>
        <span className="text-xs text-slate-400">
          Pooja + Ana · picker drives the enrollment count on every dashboard
        </span>
      </div>

      <div className="space-y-2">
        {PRESETS.map((p) => {
          const active = trigger === p.id;
          return (
            <label
              key={p.id}
              className={cx(
                "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors",
                active ? "border-primary bg-primary/[0.06]" : "border-slate-200 bg-white hover:bg-canvas",
              )}
            >
              <input
                type="radio"
                name="trigger"
                checked={active}
                onChange={() => setTrigger(p.id)}
                className="mt-0.5 accent-primary"
              />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-navy">{p.label}</span>
                <span className="block text-[11.5px] text-slate-500">{p.note}</span>
              </span>
            </label>
          );
        })}
      </div>

      {trigger === "custom" ? (
        <>
          <div className="my-4 h-px bg-slate-100" />
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-500">Custom enrollment expression</span>
            <textarea
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-[12px] text-navy outline-none focus:ring-2 focus:ring-primary/30"
            />
            <span className="mt-1 block text-[11px] text-slate-400">
              Validated against the subject schema. Use AND/OR/NOT. References to tag values resolve
              at evaluation time.
            </span>
          </label>
        </>
      ) : null}

      <div className="my-4 h-px bg-slate-100" />
      <p className="text-xs text-slate-500">
        <strong className="text-slate-600">Where this surfaces:</strong> Enrollment dashboard counts ·
        target progress · per-arm / per-cohort / per-site sub-counts · combined export (NFR-095).
      </p>
    </Card>
  );
}
