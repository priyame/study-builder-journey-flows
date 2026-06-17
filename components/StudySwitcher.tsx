"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Check, ChevronDown, FileText, AlertTriangle } from "lucide-react";
import { STUDIES, DEFAULT_STUDY_ID } from "@/lib/studies";
import { cx } from "./ui";

/**
 * Topbar dropdown that switches the active study. Updates `?study=<id>` on the
 * current path so deep links stay deep — every page reads the same param.
 *
 * Studies appear ONLY in this switcher; no other surface in the app inlines a
 * study list (per the prototype-UI-discipline rule).
 */
export function StudySwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const activeId = params.get("study") ?? DEFAULT_STUDY_ID;
  const active = STUDIES.find((s) => s.identity.id === activeId) ?? STUDIES[0];

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function pick(id: string) {
    const next = new URLSearchParams(params.toString());
    if (id === DEFAULT_STUDY_ID) next.delete("study");
    else next.set("study", id);
    const q = next.toString();
    router.push(`${pathname}${q ? `?${q}` : ""}`);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 outline-none transition-colors hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/40"
        title="Choose a different study — everything scopes to the one you pick"
      >
        <FileText size={13} strokeWidth={1.8} className="text-slate-400" />
        <span className="font-mono text-[11px] font-bold text-primary">{active.identity.code}</span>
        <span className="hidden max-w-[180px] truncate text-slate-500 lg:inline">{active.identity.indication}</span>
        <ChevronDown size={12} className="text-slate-400" />
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-[28rem] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 bg-canvas px-4 py-3">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Switch study
            </div>
            <div className="mt-0.5 text-[11px] text-slate-500">
              {STUDIES.length} sample studies. Every page below scopes to your selection.
            </div>
          </div>

          <div className="max-h-[28rem] overflow-y-auto">
            {STUDIES.map((s) => {
              const isActive = s.identity.id === activeId;
              const isInferred = s.identity.dataSource !== "real";
              return (
                <button
                  key={s.identity.id}
                  onClick={() => pick(s.identity.id)}
                  className={cx(
                    "flex w-full flex-col gap-1 border-b border-slate-50 px-4 py-3 text-left outline-none transition-colors last:border-0",
                    isActive ? "bg-primary/[0.06]" : "hover:bg-canvas",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">{s.identity.code}</span>
                    <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[9px] uppercase text-slate-500">
                      {s.identity.archetype.replace("_", " ")}
                    </span>
                    {s.identity.phase ? (
                      <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[9px] text-slate-500">
                        {s.identity.phase}
                      </span>
                    ) : null}
                    {isInferred ? (
                      <span className="inline-flex items-center gap-1 rounded border border-warning/40 bg-warning/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-warning">
                        <AlertTriangle size={10} />
                        {s.identity.dataSource === "icf_only" ? "ICF-only" : "Inferred"}
                      </span>
                    ) : null}
                    {isActive ? <Check size={13} className="ml-auto text-primary" /> : null}
                  </div>
                  <div className="text-[13px] font-semibold text-navy">{s.identity.name}</div>
                  <div className="text-[11px] leading-snug text-slate-500">{s.identity.tagline}</div>
                  <div className="flex flex-wrap items-center gap-1">
                    {s.identity.chips.map((c) => (
                      <span
                        key={c}
                        className="rounded-full bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] text-slate-500"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
