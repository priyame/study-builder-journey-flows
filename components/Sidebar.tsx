"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cx } from "./ui";
import { BrandMark } from "./BrandMark";

/**
 * Phase-grouped, collapsible sidebar — mirrors TalOSSurvey's apps/web/components/Nav.tsx
 * styling exactly (navy gradient background, white text, cyan-marked active item,
 * mono-font phase headers with ▶ disclosure). Items here are scoped to this
 * prototype's surfaces; the visual chrome matches the production app.
 */

interface NavItem {
  label: string;
  href: string;
  hint: string;
  badge?: string;
  activeOn?: string[];
}

interface NavGroup {
  phase: string | null;
  items: NavItem[];
  footer?: boolean;
}

const GROUPS: NavGroup[] = [
  {
    phase: null,
    items: [{ label: "Overview", href: "/", hint: "The connected study lifecycle at a glance" }],
  },
  {
    phase: "Design",
    items: [
      { label: "Study setup", href: "/study", hint: "Three-stage wizard (Input → Review → Hub)", badge: "Story 1" },
      { label: "Tags & Rules", href: "/study/tags", hint: "Kelly's tag model", badge: "Kelly" },
      { label: "Journey", href: "/study/journey", hint: "Workflow Authoring Surface", badge: "§4.5" },
    ],
  },
  {
    phase: "Capture",
    items: [
      { label: "Subjects & Enrollment", href: "/study/subjects", hint: "Pooja + Ana operational asks", badge: "Pooja/Ana" },
    ],
  },
  {
    phase: "Analyze",
    items: [
      { label: "Export Shape", href: "/study/export", hint: "One combined dataset per domain", badge: "NFR-095" },
    ],
  },
  {
    phase: "Govern",
    items: [
      { label: "Versions", href: "/study/versions", hint: "Draft → UAT → Live three-environment model", badge: "NFR-107" },
      { label: "Study Settings", href: "/study/settings", hint: "The 8-section Configuration Hub", badge: "PRD #25 §3" },
      { label: "Users & Roles", href: "/study/users", hint: "PRD #25 §2 canonical role taxonomy", badge: "PRD #25 §2" },
    ],
  },
];

function isActive(pathname: string, item: NavItem): boolean {
  if (item.href === "/") return pathname === "/";
  if (item.href === "/study") return pathname === "/study";
  if (pathname === item.href) return true;
  if (pathname.startsWith(item.href + "/")) return true;
  return (item.activeOn ?? []).some((p) => pathname.startsWith(p));
}

const STORE_KEY = "sbjf-nav-open";

export function Sidebar() {
  const pathname = usePathname() ?? "";
  const params = useSearchParams();
  const studyParam = params.get("study");
  const qs = studyParam ? `?study=${studyParam}` : "";

  const [open, setOpen] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(STORE_KEY) ?? "{}");
      if (s && typeof s === "object") setOpen(s);
    } catch {
      /* ignore */
    }
  }, []);

  function toggle(phase: string) {
    setOpen((prev) => {
      const next = { ...prev, [phase]: !(prev[phase] ?? false) };
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const top = GROUPS.find((g) => g.phase === null);
  const phases = GROUPS.filter((g) => g.phase !== null && !g.footer);

  const renderItem = (item: NavItem) => {
    const active = isActive(pathname, item);
    return (
      <Link
        key={item.href}
        href={`${item.href}${qs}`}
        aria-current={active ? "page" : undefined}
        title={item.hint}
        className={cx(
          "group relative rounded-lg py-2 pl-3.5 pr-3 text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan/50",
          active ? "bg-white/15 text-white shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white",
        )}
      >
        {active ? (
          <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-cyan" aria-hidden />
        ) : null}
        <span className="flex items-center gap-2">
          <span className="flex-1">{item.label}</span>
          {item.badge ? (
            <span className="rounded-full bg-white/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-white/55">
              {item.badge}
            </span>
          ) : null}
        </span>
      </Link>
    );
  };

  return (
    <aside className="hidden w-72 shrink-0 flex-col bg-gradient-to-b from-navy via-navy to-[#10207A] px-5 py-6 text-white md:flex md:sticky md:top-0 md:h-screen md:overflow-y-auto">
      <Link href={`/${qs}`} className="mb-8 flex items-center gap-3 px-1 outline-none">
        <BrandMark className="h-11 w-11" />
        <div className="leading-tight">
          <div className="text-lg font-bold tracking-tight text-white">Study Builder</div>
          <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
            TalOS v2 · sketch
          </div>
        </div>
      </Link>

      <nav className="flex flex-col gap-2" aria-label="Primary">
        {top ? <div className="flex flex-col gap-1">{top.items.map(renderItem)}</div> : null}

        {phases.map((group) => {
          const items = group.items;
          if (!items.length) return null;
          const phase = group.phase as string;
          const activeHere = items.some((i) => isActive(pathname, i));
          const isOpen = activeHere || (open[phase] ?? false);
          return (
            <div key={phase} className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => toggle(phase)}
                aria-expanded={isOpen}
                className="group mb-0.5 mt-1 flex w-full items-center gap-2 rounded px-2.5 py-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-cyan/40"
              >
                <span aria-hidden className={cx("font-mono text-[9px] text-white/40 transition-transform", isOpen && "rotate-90")}>
                  ▶
                </span>
                <span
                  className={cx(
                    "font-mono text-[10px] font-semibold uppercase tracking-[0.18em]",
                    activeHere ? "text-cyan" : "text-white/40 group-hover:text-white/60",
                  )}
                >
                  {phase}
                </span>
                <span className="h-px flex-1 bg-white/10" aria-hidden />
                {!isOpen ? <span className="font-mono text-[10px] text-white/30">{items.length}</span> : null}
              </button>
              {isOpen ? <div className="flex flex-col gap-1">{items.map(renderItem)}</div> : null}
            </div>
          );
        })}

        <div className="mt-3 border-t border-white/10 pt-3">
          <div className="mb-1 px-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
            Reference
          </div>
          <a
            href="https://github.com/priyame/study-builder-journey-flows"
            target="_blank"
            rel="noreferrer"
            className="block rounded-lg px-3.5 py-2 text-[13px] font-medium text-white/70 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan/50"
          >
            GitHub repo
          </a>
        </div>
      </nav>
    </aside>
  );
}
