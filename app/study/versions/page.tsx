"use client";

import { EnvBanner } from "@/components/EnvBanner";
import { VersionBadge } from "@/components/VersionBadge";
import { RULE_TABLE } from "@/components/versions/seed";
import { useActiveStudy } from "@/lib/active-study";
import { Card, PageGuide, PageHeader, Pill, cx } from "@/components/ui";

export default function VersionsPage() {
  const study = useActiveStudy();
  const versions = study.versions;
  const draft = versions.find((v) => v.env === "draft");
  const uat = versions.find((v) => v.env === "uat");
  const live = versions.find((v) => v.env === "live" && v.status === "Published");
  const retired = versions.filter((v) => v.status === "Retired");

  return (
    <>
      <PageHeader
        phase="govern"
        title="Versions"
        subtitle={
          <>
            One study, one entity, three environment scopes. A Study Version is authored in{" "}
            <strong className="font-semibold text-navy">Draft</strong>, promoted to{" "}
            <strong className="font-semibold text-navy">UAT</strong> via Sign-Off, and promoted to{" "}
            <strong className="font-semibold text-navy">Live</strong> via Publish.
          </>
        }
        action={<Pill tone="navy" mono>{study.identity.code}</Pill>}
      />

      <PageGuide eyebrow="What you're looking at">
        Three environments map to four Study Version statuses (Draft → Signed Off → Published →
        Retired). Promotions are e-signed; auto-retire happens in the same transaction as the next
        Publish. Source: PRD #12 v0.8 §§21–28 · NFR-107.
      </PageGuide>

      <EnvBanner />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <EnvCard
          title="Draft"
          status="Draft"
          borderTone="border-t-primary"
          ctaLabel="Sign Off → promote to UAT"
          emptyText="No Draft."
          version={draft}
        />
        <EnvCard
          title="UAT"
          status="Signed Off"
          borderTone="border-t-warning"
          ctaLabel="Publish → promote to Live (separate e-sig)"
          emptyText="No version in UAT."
          version={uat}
          showSignedBy
        />
        <EnvCard
          title="Live"
          status="Published"
          borderTone="border-t-success"
          emptyText="No Live version."
          version={live}
          showPublishedBy
          footnote={
            <>
              <strong className="text-slate-600">Warn-and-allow zone (§23.6):</strong>{" "}
              non-versioning edits (instructions, edit checks, visit windows, display labels) can be
              applied directly with a captured reason.
            </>
          }
        />
      </div>

      <div className="mt-7">
        <Card>
          <div className="mb-4 flex items-baseline gap-2">
            <h2 className="text-sm font-semibold text-navy">Retired versions</h2>
            <span className="text-xs text-slate-400">
              Auto-retired in the same transaction as the next Publish
            </span>
          </div>
          {retired.length === 0 ? (
            <p className="text-xs text-slate-400">
              No retired versions yet — this study is on its first Published version.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-sm">
                <thead className="bg-canvas">
                  <tr className="border-b border-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-400">
                    <th className="px-3 py-2.5 font-medium">Version</th>
                    <th className="px-3 py-2.5 font-medium">Protocol</th>
                    <th className="px-3 py-2.5 font-medium">Published</th>
                    <th className="px-3 py-2.5 font-medium">Published by</th>
                    <th className="px-3 py-2.5 font-medium">Notes</th>
                    <th className="px-3 py-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {retired.map((v) => (
                    <tr key={v.id} className="border-t border-slate-50">
                      <td className="px-3 py-2.5 font-semibold text-navy">{v.version_label}</td>
                      <td className="px-3 py-2.5">{v.protocol_version_label}</td>
                      <td className="px-3 py-2.5">{v.published_at}</td>
                      <td className="px-3 py-2.5">{v.published_by}</td>
                      <td className="px-3 py-2.5 text-slate-500">{v.changes[0]?.summary}</td>
                      <td className="px-3 py-2.5"><VersionBadge status="Retired" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <div className="mt-7">
        <Card>
          <div className="mb-3 flex items-baseline gap-2">
            <h2 className="text-sm font-semibold text-navy">What counts as a versioning change?</h2>
            <span className="text-xs text-slate-400">§23.4 — Kelly Ritch + Kristen, 2026-06-09</span>
          </div>
          <blockquote className="mb-4 border-l-2 border-accent bg-canvas px-3.5 py-2.5 text-sm italic text-slate-600">
            Anything that reaches the dataset is a new version; pure on-screen or logistical text
            that never enters the data is not.
          </blockquote>
          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-canvas">
                <tr className="border-b border-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-2.5 font-medium">Change</th>
                  <th className="px-3 py-2.5 font-medium">New version?</th>
                  <th className="px-3 py-2.5 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {RULE_TABLE.map((r, i) => (
                  <tr key={i} className="border-t border-slate-50">
                    <td className="px-3 py-2.5">{r.change}</td>
                    <td className="px-3 py-2.5">
                      {r.versions ? (
                        <Pill tone="danger">Yes — versions</Pill>
                      ) : (
                        <Pill tone="success">No</Pill>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-slate-500">{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}

interface VersionLike {
  version_label: string;
  protocol_version_label: string;
  signed_off_at?: string;
  signed_off_by?: string;
  published_at?: string;
  published_by?: string;
  changes: Array<{ area: string; summary: string; versioning_class?: string }>;
}

function EnvCard({
  title,
  status,
  borderTone,
  ctaLabel,
  emptyText,
  version,
  showSignedBy,
  showPublishedBy,
  footnote,
}: {
  title: string;
  status: "Draft" | "Signed Off" | "Published" | "Retired";
  borderTone: string;
  ctaLabel?: string;
  emptyText: string;
  version: VersionLike | undefined;
  showSignedBy?: boolean;
  showPublishedBy?: boolean;
  footnote?: React.ReactNode;
}) {
  return (
    <div className={cx("rounded-xl border border-slate-200 bg-white shadow-sm", borderTone, "border-t-[3px]")}>
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3">
        <h2 className="m-0 text-sm font-semibold text-navy">{title}</h2>
        <VersionBadge status={status} />
      </div>
      <div className="p-5">
        {version ? (
          <>
            <div className="text-2xl font-bold tracking-tight text-navy">{version.version_label}</div>
            <div className="mb-3 text-xs text-slate-500">
              Protocol {version.protocol_version_label}
              {status === "Draft" ? " · editable" : status === "Signed Off" ? " · frozen" : " · operative configuration"}
            </div>
            {showSignedBy && version.signed_off_at ? (
              <div className="mb-3 text-[11px] text-slate-400">
                Signed off {version.signed_off_at} by {version.signed_off_by}
              </div>
            ) : null}
            {showPublishedBy && version.published_at ? (
              <div className="mb-3 text-[11px] text-slate-400">
                Published {version.published_at} by {version.published_by}
              </div>
            ) : null}
            <div className="flex flex-col gap-2">
              {version.changes.map((c, i) => (
                <div key={i} className="text-xs leading-snug">
                  <Pill tone="neutral" mono>{c.area}</Pill>
                  <span className="ml-1.5">{c.summary}</span>
                  {c.versioning_class === "non_versioning" ? (
                    <Pill tone="neutral" mono>non-versioning</Pill>
                  ) : null}
                </div>
              ))}
            </div>
            {ctaLabel ? (
              <>
                <div className="my-4 h-px bg-slate-100" />
                <button
                  type="button"
                  className="w-full rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white outline-none hover:bg-bright disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  {ctaLabel}
                </button>
              </>
            ) : null}
            {footnote ? (
              <>
                <div className="my-4 h-px bg-slate-100" />
                <p className="text-[11px] leading-snug text-slate-500">{footnote}</p>
              </>
            ) : null}
          </>
        ) : (
          <p className="text-xs text-slate-400">{emptyText}</p>
        )}
      </div>
    </div>
  );
}
