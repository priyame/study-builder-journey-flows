"use client";

import { useEnv, ENV_META } from "@/lib/env-state";

export function EnvBanner() {
  const [env] = useEnv();
  const meta = ENV_META[env];

  return (
    <div className="env-banner" data-env={env}>
      <strong>{meta.label}</strong>
      <span>·</span>
      <span>{meta.status}</span>
      {env === "live" ? (
        <span style={{ marginLeft: "auto", fontSize: 11, opacity: 0.85 }}>
          Per §23.6: non-versioning edits land here with a captured reason. Versioning edits go through Draft → UAT.
        </span>
      ) : null}
    </div>
  );
}
