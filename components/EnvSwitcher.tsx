"use client";

import { useEnv } from "@/lib/env-state";
import type { Env } from "@/lib/kelly-model";

const ENVS: { id: Env; label: string }[] = [
  { id: "draft", label: "Draft" },
  { id: "uat",   label: "UAT" },
  { id: "live",  label: "Live" },
];

export function EnvSwitcher() {
  const [env, setEnv] = useEnv();

  return (
    <div className="env-switcher" role="tablist" aria-label="Environment">
      {ENVS.map(({ id, label }) => (
        <button
          key={id}
          data-env={id}
          data-active={env === id}
          aria-selected={env === id}
          role="tab"
          onClick={() => setEnv(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
