"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tag, GitBranch, Users, FileDown, Home, GitFork, type LucideIcon } from "lucide-react";

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
    title: "Study Build",
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

  return (
    <nav className="sidebar">
      {NAV.map((group) => (
        <div key={group.title}>
          <div className="section-title">{group.title}</div>
          {group.items.map(({ href, label, icon: Icon, badge }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
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
