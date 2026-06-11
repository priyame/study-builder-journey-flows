"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EnvSwitcher } from "./EnvSwitcher";

const CRUMB_FOR: Record<string, string> = {
  "/study/tags": "Tags & Rules",
  "/study/versions": "Versions",
  "/study/subjects": "Subjects & Enrollment",
  "/study/export": "Export Shape",
};

export function Topbar() {
  const pathname = usePathname() ?? "";
  const crumb = CRUMB_FOR[pathname];

  return (
    <header className="topbar">
      <Link href="/" className="brand">
        Study Builder<span className="v2">· journey flows</span>
      </Link>
      {crumb ? (
        <div className="crumbs">
          <span className="sep">/</span>
          <span>{crumb}</span>
        </div>
      ) : null}
      <div className="spacer" />
      <EnvSwitcher />
    </header>
  );
}
