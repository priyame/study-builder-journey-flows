"use client";

import { cx } from "./ui";
import { useEnv } from "@/lib/env-state";
import type { Env } from "@/lib/kelly-model";

const ENVS: { id: Env; label: string; activeCls: string }[] = [
  { id: "draft", label: "Draft", activeCls: "bg-primary text-white" },
  { id: "uat",   label: "UAT",   activeCls: "bg-warning text-white" },
  { id: "live",  label: "Live",  activeCls: "bg-success text-white" },
];

export function EnvSwitcher() {
  const [env, setEnv] = useEnv();
  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm" role="tablist" aria-label="Environment">
      {ENVS.map(({ id, label, activeCls }) => {
        const active = env === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setEnv(id)}
            className={cx(
              "border-r border-slate-200 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide outline-none transition-colors last:border-r-0 focus-visible:ring-2 focus-visible:ring-primary/40",
              active ? activeCls : "text-slate-500 hover:bg-slate-50",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
