"use client";

import { useState, useRef, useEffect } from "react";
import { HelpCircle, FileText, X } from "lucide-react";
import type { ProvenanceEntry } from "@/lib/studies/types";

// Lightweight "why" affordance — a small button beside an extracted field
// that opens a popover with the source document, page citation, and the
// verbatim excerpt the AI used. Modeled on Nathan's per-field provenance.

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
    return (
      <span className="muted" style={{ fontSize: 10, fontStyle: "italic", marginLeft: 6 }}>
        no provenance
      </span>
    );
  }

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Why this ${label}?`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          marginLeft: 6,
          padding: "1px 6px",
          border: "1px solid var(--border-subtle)",
          borderRadius: 999,
          background: open ? "var(--accent-soft)" : "transparent",
          color: open ? "var(--accent)" : "var(--fg-muted)",
          fontSize: 10,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        <HelpCircle size={10} /> why
      </button>

      {open ? (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 60,
            minWidth: 360,
            maxWidth: 460,
            background: "var(--bg-surface)",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--r-md)",
            boxShadow: "var(--shadow-pop)",
            padding: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <FileText size={13} color="var(--accent)" />
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)" }}>Source</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              style={{ marginLeft: "auto", border: "none", background: "transparent", cursor: "pointer", color: "var(--fg-muted)" }}
            >
              <X size={13} />
            </button>
          </div>
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, fontWeight: 600, marginBottom: 6, wordBreak: "break-all" }}>
            {entry.source}
            {entry.page ? <span className="muted" style={{ marginLeft: 8, fontWeight: 400 }}>p. {entry.page}</span> : null}
          </div>
          <blockquote
            style={{
              margin: 0,
              padding: "8px 12px",
              borderLeft: "3px solid var(--accent)",
              background: "var(--bg-muted)",
              fontStyle: "italic",
              color: "var(--fg-secondary)",
              fontSize: 12,
              lineHeight: 1.6,
            }}
          >
            {entry.quote}
          </blockquote>
        </div>
      ) : null}
    </div>
  );
}
