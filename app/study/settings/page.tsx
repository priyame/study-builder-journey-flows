"use client";

import { EnvBanner } from "@/components/EnvBanner";
import { useActiveStudy } from "@/lib/active-study";
import { HUB_SECTIONS, rolesWithEditAccess, type HubSection } from "@/lib/settings-model";

export default function SettingsHubPage() {
  const study = useActiveStudy();
  const { identity } = study;

  return (
    <>
      <div className="page-header">
        <h1>Study Settings</h1>
        <p className="lede">
          The eight-section per-study Configuration Hub from PRD #25 §3. Each section is{" "}
          <strong>role-gated</strong> by the permission shown in its header — the catalog lives at{" "}
          <a href={"/study/users?study=" + identity.id} style={{ color: "var(--accent)" }}>Users &amp; Roles</a>.{" "}
          Viewing <strong style={{ color: "var(--accent)" }}>{identity.code}</strong>.
        </p>
        <span className="source-tag">PRD #25 §3 · 8 sections · scoped to the active study</span>
      </div>

      <EnvBanner />

      <div className="grid-2" style={{ gap: 16 }}>
        {HUB_SECTIONS.map((s) => <SectionCard key={s.id} section={s} />)}
      </div>
    </>
  );
}

function SectionCard({ section }: { section: HubSection }) {
  const editors = rolesWithEditAccess(section.editPerm);
  const statusPill =
    section.status === "wired"
      ? { label: "Wired in R1.0", bg: "rgba(13,148,136,0.12)", color: "var(--success, #0d9488)" }
      : section.status === "planned-r1.1"
        ? { label: "Planned R1.1", bg: "rgba(234,179,8,0.14)", color: "var(--warn, #b45309)" }
        : { label: "Phase 2 reserved", bg: "rgba(100,116,139,0.12)", color: "var(--muted, #475569)" };

  return (
    <div className="card">
      <div className="card-header">
        <h2>{section.label}</h2>
        <span className="sub">{section.description}</span>
      </div>
      <div className="card-body">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 12 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              padding: "3px 8px",
              borderRadius: 6,
              background: statusPill.bg,
              color: statusPill.color,
            }}
          >
            {statusPill.label}
          </span>
          <span className="code" style={{ fontSize: 11 }}>{section.editPerm}</span>
          <span className="muted" style={{ fontSize: 11 }}>
            Editable by: {editors.length === 0 ? "(none)" : editors.map((r) => r.code).join(" · ")}
          </span>
        </div>

        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Owns</div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.55 }}>
          {section.owns.map((o) => <li key={o}>{o}</li>)}
        </ul>

        {section.storedIn ? (
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px dashed var(--border, #e2e8f0)" }}>
            <span className="muted" style={{ fontSize: 11 }}>Stored in </span>
            <span className="code" style={{ fontSize: 11 }}>{section.storedIn}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
