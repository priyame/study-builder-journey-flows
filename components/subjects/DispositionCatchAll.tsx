"use client";

import { useEffect, useState } from "react";
import { useActiveStudy } from "@/lib/active-study";
import { Card, Pill } from "@/components/ui";

// Pooja+Ana 2026-06-10 — disposition catalog is configurable; the catch-all
// bucket ensures every subject can land somewhere.

interface Disposition {
  id: string;
  label: string;
  is_terminal?: boolean;
  is_catch_all?: boolean;
}

export function DispositionCatchAll() {
  const study = useActiveStudy();
  const [dispositions, setDispositions] = useState<Disposition[]>(study.dispositions);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setDispositions(study.dispositions);
  }, [study.identity.id, study.dispositions]);

  const add = () => {
    if (!draft.trim()) return;
    setDispositions([
      ...dispositions.slice(0, -1),
      { id: draft.trim().toLowerCase().replace(/\s+/g, "_"), label: draft.trim(), is_terminal: true },
      dispositions[dispositions.length - 1],
    ]);
    setDraft("");
  };

  return (
    <Card>
      <div className="mb-3 flex items-baseline gap-2">
        <h2 className="text-sm font-semibold text-navy">Dispositions</h2>
        <span className="text-xs text-slate-400">
          Pooja + Ana · open catalog with a permanent catch-all bucket
        </span>
      </div>

      <div className="space-y-1.5">
        {dispositions.map((d, idx) => (
          <div
            key={d.id}
            className={
              "flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm " +
              (d.is_catch_all ? "bg-warning/10" : "bg-white")
            }
          >
            <span className="w-6 text-[11px] text-slate-400">{idx + 1}.</span>
            <span className="font-medium text-navy">{d.label}</span>
            {d.is_terminal ? <Pill tone="danger" mono>terminal</Pill> : null}
            {d.is_catch_all ? <Pill tone="warning" mono>catch-all · cannot delete</Pill> : null}
            <span className="ml-auto rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
              {d.id}
            </span>
          </div>
        ))}
      </div>

      <div className="my-4 h-px bg-slate-100" />

      <div className="flex gap-2">
        <input
          placeholder="Add a custom disposition (e.g., Protocol deviation)"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-navy outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="button"
          onClick={add}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white outline-none hover:bg-bright focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          + Add
        </button>
      </div>

      <div className="my-4 h-px bg-slate-100" />
      <p className="text-xs leading-relaxed text-slate-500">
        The catch-all (<span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">other</span>)
        is permanent and cannot be deleted — it guarantees every subject has somewhere to land.
        Coordinators record the free-text reason on the disposition form when they pick &quot;Other&quot;.
      </p>
    </Card>
  );
}
