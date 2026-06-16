"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Tag, GitBranch, Users, FileDown, Home, GitFork, Compass, type LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

const NAV: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [{ href: "/", label: "Home", icon: Home }],
  },
  {
    title: "Study Setup",
    items: [
      { href: "/study",          label: "Setup wizard",       icon: Compass,   badge: "Story 1" },
    ],
  },
  {
    title: "Configuration",
    items: [
      { href: "/study/tags",     label: "Tags & Rules",       icon: Tag,       badge: "Kelly" },
      { href: "/study/journey",  label: "Journey",            icon: GitFork,   badge: "§4.5" },
      { href: "/study/versions", label: "Versions",           icon: GitBranch, badge: "NFR-107" },
      { href: "/study/subjects", label: "Subjects & Enrollment", icon: Users,  badge: "Pooja/Ana" },
      { href: "/study/export",   label: "Export Shape",       icon: FileDown,  badge: "NFR-095" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname() ?? "";
  const params = useSearchParams();
  const studyParam = params.get("study");
  const qs = studyParam ? `?study=${studyParam}` : "";

  return (
    <nav className="sidebar">
      {NAV.map((group) => (
        <div key={group.title}>
          <div className="section-title">{group.title}</div>
          {group.items.map(({ href, label, icon: Icon, badge }) => {
            // /study should match only the exact /study route — not /study/journey etc.,
            // which belong to the Configuration group below.
            const active =
              href === "/" ? pathname === "/" :
              href === "/study" ? pathname === "/study" :
              pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={`${href}${qs}`}
                className={`nav-link${active ? " active" : ""}`}
              >
                <Icon size={15} strokeWidth={1.8} />
                <span>{label}</span>
                {badge ? <span className="badge">{badge}</span> : null}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
