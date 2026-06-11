"use client";

// Client-side env switcher state — Draft / UAT / Live (NFR-107).
// Persisted in localStorage so the env survives navigation between routes.

import { useEffect, useState } from "react";
import type { Env } from "@/lib/kelly-model";

const KEY = "sbjf.env";

export function useEnv(): [Env, (env: Env) => void] {
  const [env, setEnv] = useState<Env>("draft");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem(KEY)) as Env | null;
    if (stored === "draft" || stored === "uat" || stored === "live") setEnv(stored);
  }, []);

  const update = (next: Env) => {
    setEnv(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, next);
      document.documentElement.setAttribute("data-env", next);
    }
  };

  return [env, update];
}

export const ENV_META: Record<Env, { label: string; status: string; tint: string }> = {
  draft: { label: "Draft", status: "Editable",          tint: "var(--env-draft)" },
  uat:   { label: "UAT",   status: "Frozen for QA",     tint: "var(--env-uat)" },
  live:  { label: "Live",  status: "Operative — warn-and-allow", tint: "var(--env-live)" },
};
