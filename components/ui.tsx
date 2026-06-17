/**
 * Shared UI kit — mirrors TalOSSurvey's apps/web/components/ui.tsx so this
 * prototype reads visually as part of the same product. Server-component safe
 * (no "use client" directive); pure presentational primitives.
 */

import type { ReactNode } from "react";

// ─── Helpers ────────────────────────────────────────────────────────────────

export function fmtDate(iso: string | Date): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function fmtDateTime(iso: string | Date): string {
  return (
    new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    }) + " UTC"
  );
}

export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

// ─── Workflow phases (page eyebrows) ────────────────────────────────────────

export const PHASES = {
  design: "Design",
  distribute: "Distribute",
  consent: "Consent",
  capture: "Capture",
  analyze: "Analyze",
  govern: "Govern",
  agent: "Agent",
  overview: "Overview",
} as const;
export type Phase = keyof typeof PHASES;

// ─── Primitives ─────────────────────────────────────────────────────────────

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
      {children}
    </span>
  );
}

export function PageHeader({
  phase,
  title,
  subtitle,
  action,
}: {
  phase?: Phase;
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {phase ? <Eyebrow>{PHASES[phase]}</Eyebrow> : null}
        <div className="mt-1 flex flex-wrap items-center gap-2.5">
          <h1 className="text-[26px] font-bold leading-tight tracking-tight text-navy sm:text-[28px]">
            {title}
          </h1>
        </div>
        {subtitle ? <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

/** A "you are here" coach beneath each PageHeader. */
export function PageGuide({ eyebrow, children }: { eyebrow?: string; children: ReactNode }) {
  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-600 shadow-sm">
      {eyebrow ? (
        <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          {eyebrow}
        </div>
      ) : null}
      <div>{children}</div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  tone = "navy",
  className,
}: {
  label: string;
  value: number | string;
  sub?: string;
  tone?: "navy" | "primary" | "accent" | "success" | "warning" | "danger" | "neutral";
  className?: string;
}) {
  const color = {
    navy: "text-navy",
    primary: "text-primary",
    accent: "text-bright",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    neutral: "text-slate-400",
  }[tone];
  const quiet = (value === 0 || value === "0") && (tone === "navy" || tone === "neutral");
  return (
    <div className={cx("rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm", className)}>
      <div className={cx("text-2xl font-bold tabular-nums leading-tight tracking-tight", quiet ? "text-slate-300" : color)}>
        {value}
      </div>
      <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-400">{label}</div>
      {sub ? <div className="text-[10px] text-slate-400">{sub}</div> : null}
    </div>
  );
}

export function Card({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx("rounded-xl border border-slate-200 bg-white p-5 shadow-sm", className)}>
      {title ? <h2 className="mb-3 text-sm font-semibold text-navy">{title}</h2> : null}
      {children}
    </section>
  );
}

export type Tone = "neutral" | "primary" | "accent" | "success" | "warning" | "danger" | "navy";

const TONE_CLASS: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-500",
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-bright",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  navy: "bg-navy/10 text-navy",
};

export function Pill({
  tone = "neutral",
  mono,
  children,
}: {
  tone?: Tone;
  mono?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        mono && "font-mono text-[10px]",
        TONE_CLASS[tone],
      )}
    >
      {children}
    </span>
  );
}

export function FutureBadge({ label = "Future · post-v1.0", className }: { label?: string; className?: string }) {
  return (
    <span
      title="Post-v1.0 / future-state — not part of the shipped v1.0 product."
      className={cx(
        "inline-flex items-center gap-1 rounded border border-warning/40 bg-warning/5 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-warning",
        className,
      )}
    >
      <span className="h-1 w-1 rounded-full bg-warning" aria-hidden />
      {label}
    </span>
  );
}

export function AuditNote({ count, className }: { count?: number; className?: string }) {
  return (
    <span
      title="Every action is written to an immutable, append-only audit trail (21 CFR 11.10(e))."
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-success" />
      {count === undefined ? "Logged to the audit trail" : `${count} event${count === 1 ? "" : "s"} · immutable audit trail`}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("skeleton", className)} aria-hidden />;
}

export function EmptyState({
  glyph = "↳",
  title,
  children,
}: {
  glyph?: ReactNode;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 font-mono text-xl font-bold text-primary">
        {glyph}
      </div>
      <h2 className="text-base font-semibold text-navy">{title}</h2>
      {children ? <div className="mt-1 max-w-sm text-sm text-slate-400">{children}</div> : null}
    </div>
  );
}
