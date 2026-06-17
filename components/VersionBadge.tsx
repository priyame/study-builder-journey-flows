import { cx } from "./ui";
import type { VersionStatus } from "@/lib/kelly-model";

const STATUS_CLS: Record<VersionStatus, string> = {
  Draft: "bg-primary/10 text-primary",
  "Signed Off": "bg-warning/10 text-warning",
  Published: "bg-success/10 text-success",
  Retired: "bg-slate-100 text-slate-500",
};

export function VersionBadge({ status, label }: { status: VersionStatus; label?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
        STATUS_CLS[status],
      )}
    >
      {label ?? status}
    </span>
  );
}
