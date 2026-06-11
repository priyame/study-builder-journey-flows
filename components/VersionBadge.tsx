import type { VersionStatus } from "@/lib/kelly-model";

export function VersionBadge({
  status,
  label,
}: {
  status: VersionStatus;
  label?: string;
}) {
  return (
    <span className="version-badge" data-status={status}>
      <span>{label ?? status}</span>
    </span>
  );
}
