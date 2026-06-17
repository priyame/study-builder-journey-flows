import { EnvBanner } from "@/components/EnvBanner";
import { ExportShapePreview } from "@/components/export/ExportShapePreview";
import { Card, PageGuide, PageHeader, Pill } from "@/components/ui";

export default function ExportPage() {
  return (
    <>
      <PageHeader
        phase="analyze"
        title="Export Shape"
        subtitle={
          <>
            One combined dataset for review — not N narrow exports stitched together downstream.
            Subject identity, version pin (per §23.7), enrollment status, disposition, and every Tag
            Category value (using stable <span className="rounded bg-slate-100 px-1 font-mono text-[11px] text-slate-600">export_code</span>s,
            never labels) in a single shape.
          </>
        }
        action={<Pill tone="primary" mono>NFR-095</Pill>}
      />

      <PageGuide eyebrow="What you're looking at">
        Pooja + Ana operational ask from 2026-06-10 — exports should be reviewer-ready in one
        combined shape. Tag Categories become columns (wide) or rows (long); stable export codes mean
        cosmetic label renames never break downstream pipelines.
      </PageGuide>

      <EnvBanner />

      <ExportShapePreview />

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-navy">
            Why <span className="rounded bg-slate-100 px-1 font-mono text-[11px] text-slate-600">export_code</span>, not <span className="rounded bg-slate-100 px-1 font-mono text-[11px] text-slate-600">label</span>
          </h2>
          <p className="mb-3 text-sm text-slate-600">
            The builder-facing label can change between Study Versions without dataset disruption. The
            export code stays stable so SDTM/ADaM pipelines downstream don&apos;t break on cosmetic
            renames.
          </p>
          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-t border-slate-50 first:border-t-0">
                  <td className="px-3 py-2 text-slate-500">Rename label only</td>
                  <td className="px-3 py-2"><Pill tone="success">No version bump</Pill></td>
                </tr>
                <tr className="border-t border-slate-50">
                  <td className="px-3 py-2 text-slate-500">Rename export_code</td>
                  <td className="px-3 py-2"><Pill tone="danger">Versions — dataset shape changes</Pill></td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-navy">Per-subject version pin (§23.7)</h2>
          <p className="mb-3 text-sm text-slate-600">
            Every subject row carries{" "}
            <span className="rounded bg-slate-100 px-1 font-mono text-[11px] text-slate-600">consented_protocol_version</span>{" "}
            and{" "}
            <span className="rounded bg-slate-100 px-1 font-mono text-[11px] text-slate-600">current_study_version</span>.
            When a new version Publishes:
          </p>
          <ul className="space-y-1.5 pl-5 text-[13px] leading-relaxed text-slate-600" style={{ listStyleType: "disc" }}>
            <li><strong>Bug fix:</strong> all subjects move forward immediately.</li>
            <li><strong>Amendment, upcoming portion:</strong> subject moves forward when they next reach the impacted element.</li>
            <li><strong>Amendment, completed portion:</strong> subject stays pinned; audit captures the divergence.</li>
          </ul>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <div className="mb-3 flex items-baseline gap-2">
            <h2 className="text-sm font-semibold text-navy">Export delivery</h2>
            <span className="text-xs text-slate-400">Where this drops</span>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-canvas">
                <tr className="border-b border-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-2.5 font-medium">Channel</th>
                  <th className="px-3 py-2.5 font-medium">Format</th>
                  <th className="px-3 py-2.5 font-medium">Cadence</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-50">
                  <td className="px-3 py-2.5">SFTP drop</td>
                  <td className="px-3 py-2.5">CSV (combined shape above) + dictionary JSON</td>
                  <td className="px-3 py-2.5 text-slate-500">On demand · scheduled (daily/weekly)</td>
                </tr>
                <tr className="border-t border-slate-50">
                  <td className="px-3 py-2.5">GDP export</td>
                  <td className="px-3 py-2.5">SDTM-compliant package · one zip per domain</td>
                  <td className="px-3 py-2.5 text-slate-500">On Database Lock or signed snapshot</td>
                </tr>
                <tr className="border-t border-slate-50">
                  <td className="px-3 py-2.5">Direct download</td>
                  <td className="px-3 py-2.5">CSV preview · Excel pivot-ready</td>
                  <td className="px-3 py-2.5 text-slate-500">Ad-hoc from the Export Hub</td>
                </tr>
                <tr className="border-t border-slate-50">
                  <td className="px-3 py-2.5">API pull</td>
                  <td className="px-3 py-2.5">Paginated JSON · same shape as CSV</td>
                  <td className="px-3 py-2.5 text-slate-500">Polled by downstream pipelines</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
