import { EnvBanner } from "@/components/EnvBanner";
import { ExportShapePreview } from "@/components/export/ExportShapePreview";

export default function ExportPage() {
  return (
    <>
      <div className="page-header">
        <h1>Export Shape</h1>
        <p className="lede">
          One combined dataset for review — not N narrow exports stitched together downstream.
          Subject identity, version pin (per §23.7), enrollment status, disposition, and every Tag
          Category value (using stable <span className="code">export_code</span>s, never labels) in
          a single shape.
        </p>
        <span className="source-tag">NFR-095 · Pooja + Ana 2026-06-10</span>
      </div>

      <EnvBanner />

      <ExportShapePreview />

      <div style={{ height: 24 }} />

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h2>Why <span className="code">export_code</span>, not <span className="code">label</span></h2>
          </div>
          <div className="card-body">
            <p style={{ margin: "0 0 12px", fontSize: 13 }}>
              The builder-facing label can change between Study Versions without dataset disruption.
              The <span className="code">export_code</span> stays stable so SDTM/ADaM pipelines downstream
              don&apos;t break on cosmetic renames.
            </p>
            <table className="table">
              <tbody>
                <tr>
                  <td className="muted">Rename label only</td>
                  <td><span className="chip green">No version bump</span></td>
                </tr>
                <tr>
                  <td className="muted">Rename export_code</td>
                  <td><span className="chip rose">Versions — dataset shape changes</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Per-subject version pin (§23.7)</h2>
          </div>
          <div className="card-body">
            <p style={{ margin: "0 0 12px", fontSize: 13 }}>
              Every subject row carries <span className="code">consented_protocol_version</span>
              and <span className="code">current_study_version</span>. When a new version Publishes:
            </p>
            <ul style={{ paddingLeft: 18, fontSize: 12.5, lineHeight: 1.7, color: "var(--fg-secondary)" }}>
              <li><strong>Bug fix:</strong> all subjects move forward immediately.</li>
              <li><strong>Amendment, upcoming portion:</strong> subject moves forward when they next reach the impacted element.</li>
              <li><strong>Amendment, completed portion:</strong> subject stays pinned; audit captures the divergence.</li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="card">
        <div className="card-header">
          <h2>Export delivery</h2>
          <span className="sub">Where this drops</span>
        </div>
        <div className="card-body">
          <table className="table">
            <thead>
              <tr><th style={{ width: 160 }}>Channel</th><th>Format</th><th>Cadence</th></tr>
            </thead>
            <tbody>
              <tr><td>SFTP drop</td><td>CSV (combined shape above) + dictionary JSON</td><td>On demand · scheduled (daily/weekly)</td></tr>
              <tr><td>GDP export</td><td>SDTM-compliant package · one zip per domain</td><td>On Database Lock or signed snapshot</td></tr>
              <tr><td>Direct download</td><td>CSV preview · Excel pivot-ready</td><td>Ad-hoc from the Export Hub</td></tr>
              <tr><td>API pull</td><td>Paginated JSON · same shape as CSV</td><td>Polled by downstream pipelines</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
