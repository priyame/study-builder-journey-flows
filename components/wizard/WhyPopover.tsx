"use client";

import { useEffect, useRef, useState } from "react";
import { HelpCircle, FileText, X } from "lucide-react";
import type { ProvenanceEntry } from "@/lib/studies/types";
import { cx } from "@/components/ui";

export function WhyPopover({ entry, label }: { entry: ProvenanceEntry | undefined; label: string }) {
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

  if (!entry) {
    return <span className="ml-1.5 text-[10px] italic text-slate-400">no provenance</span>;
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Why this ${label}?`}
        className={cx(
          "ml-1.5 inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/40",
          open
            ? "border-primary bg-primary/[0.06] text-primary"
            : "border-slate-200 bg-transparent text-slate-500 hover:border-primary/40 hover:text-primary",
        )}
      >
        <HelpCircle size={10} /> why
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-[60] mt-1.5 min-w-[360px] max-w-[460px] rounded-lg border border-slate-200 bg-white p-3 shadow-xl">
          <div className="mb-2 flex items-center gap-1.5">
            <FileText size={13} className="text-primary" />
            <span className="text-[11px] font-bold text-primary">Source</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="ml-auto text-slate-400 hover:text-navy"
            >
              <X size={13} />
            </button>
          </div>
          <div className="mb-2 font-mono text-[11px] font-semibold text-navy break-all">
            {entry.source}
            {entry.page ? <span className="ml-2 font-normal text-slate-400">p. {entry.page}</span> : null}
          </div>
          <blockquote className="border-l-2 border-accent bg-canvas px-3 py-2 text-xs italic leading-relaxed text-slate-600">
            {entry.quote}
          </blockquote>
        </div>
      ) : null}
    </div>
  );
}
