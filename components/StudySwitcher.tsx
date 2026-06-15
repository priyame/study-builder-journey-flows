"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, FileText, AlertTriangle } from "lucide-react";
import { STUDIES, DEFAULT_STUDY_ID } from "@/lib/studies";

// Topbar dropdown that switches the active study. Updates `?study=<id>` on the
// current path so deep links stay deep — every page reads the same param.

const ARCHETYPE_CHIP_CLASS: Record<string, string> = {
  rct:               "blue",
  site_crossover:    "blue",
  patient_crossover: "blue",
  single_arm:        "slate",
  registry:          "amber",
  survey:            "slate",
  adaptive:          "blue",
};

export function StudySwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const activeId = params.get("study") ?? DEFAULT_STUDY_ID;
  const active = STUDIES.find((s) => s.identity.id === activeId) ?? STUDIES[0];

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click — kept lightweight; no popover lib.
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
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 12px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-strong)",
          borderRadius: "var(--r-md)",
          cursor: "pointer",
          fontSize: 12.5,
        }}
      >
        <FileText size={13} strokeWidth={1.8} />
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: "var(--accent)" }}>{active.identity.code}</span>
        <span className="muted" style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{active.identity.indication}</span>
        <ChevronDown size={12} />
      </button>

      {open ? (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 6,
            minWidth: 480,
            background: "var(--bg-surface)",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--r-md)",
            boxShadow: "var(--shadow-pop)",
            zIndex: 50,
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-muted)" }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-muted)", fontWeight: 600 }}>
              Switch study
            </div>
            <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>
              {STUDIES.length} sample studies built from real protocols in the source pack. Every page below scopes to your selection.
            </div>
          </div>

          <div style={{ maxHeight: 480, overflowY: "auto" }}>
            {STUDIES.map((s) => {
              const isActive = s.identity.id === activeId;
              const chipClass = ARCHETYPE_CHIP_CLASS[s.identity.archetype] ?? "slate";
              const isInferred = s.identity.dataSource !== "real";
              return (
                <button
                  key={s.identity.id}
                  onClick={() => pick(s.identity.id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "12px 14px",
                    border: "none",
                    borderBottom: "1px solid var(--border-subtle)",
                    background: isActive ? "var(--accent-soft)" : "var(--bg-surface)",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: "var(--accent)", fontSize: 12 }}>
                      {s.identity.code}
                    </span>
                    <span className={`chip ${chipClass}`} style={{ fontSize: 10 }}>{s.identity.archetype.replace("_", " ")}</span>
                    {s.identity.phase ? <span className="chip slate" style={{ fontSize: 10 }}>{s.identity.phase}</span> : null}
                    {isInferred ? (
                      <span className="chip amber" style={{ fontSize: 10, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <AlertTriangle size={10} /> {s.identity.dataSource === "icf_only" ? "ICF-only" : "Inferred"}
                      </span>
                    ) : null}
                    {isActive ? <Check size={13} color="var(--accent)" style={{ marginLeft: "auto" }} /> : null}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 12.5, color: "var(--fg-primary)" }}>
                    {s.identity.name}
                  </div>
                  <div className="muted" style={{ fontSize: 11, lineHeight: 1.4 }}>
                    {s.identity.tagline}
                  </div>
                  <div className="row wrap" style={{ gap: 4, marginTop: 4 }}>
                    {s.identity.chips.map((c) => (
                      <span key={c} className="chip" style={{ fontSize: 9.5 }}>{c}</span>
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
