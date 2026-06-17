"use client";

import { cx } from "./ui";
import { useEnv, ENV_META } from "@/lib/env-state";

const ENV_CLS: Record<"draft" | "uat" | "live", string> = {
  draft: "border-primary/30 bg-primary/5 text-primary",
  uat: "border-warning/40 bg-warning/10 text-warning",
  live: "border-success/40 bg-success/10 text-success",
};

export function EnvBanner() {
  const [env] = useEnv();
  const meta = ENV_META[env];
  return (
    <div
      className={cx(
        "mb-5 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs",
        ENV_CLS[env],
      )}
      role="status"
    >
      <span className="font-semibold">{meta.label}</span>
      <span className="text-slate-400">·</span>
      <span>{meta.status}</span>
      {env === "live" ? (
        <span className="ml-auto text-[11px] opacity-80">
          §23.6 — non-versioning edits land here with a captured reason; versioning edits go Draft → UAT.
        </span>
      ) : null}
    </div>
  );
}
