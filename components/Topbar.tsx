"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { EnvSwitcher } from "./EnvSwitcher";
import { StudySwitcher } from "./StudySwitcher";

const CRUMB_FOR: Record<string, string> = {
  "/study/tags": "Tags & Rules",
  "/study/journey": "Journey · Workflow Authoring",
  "/study/versions": "Versions",
  "/study/subjects": "Subjects & Enrollment",
  "/study/export": "Export Shape",
};

export function Topbar() {
  const pathname = usePathname() ?? "";
  const crumb = CRUMB_FOR[pathname];
  const params = useSearchParams();
  const studyParam = params.get("study");
  const qs = studyParam ? `?study=${studyParam}` : "";

  return (
    <header className="topbar">
      <Link href={`/${qs}`} className="brand">
        Study Builder<span className="v2">· journey flows</span>
      </Link>
      {crumb ? (
        <div className="crumbs">
          <span className="sep">/</span>
          <span>{crumb}</span>
        </div>
      ) : null}
      <div className="spacer" />
      <StudySwitcher />
      <EnvSwitcher />
    </header>
  );
}
