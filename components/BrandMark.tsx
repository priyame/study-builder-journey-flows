/** Simplified BrandMark — a navy/cyan monogram tile that reads as "TalOS". */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 font-mono text-base font-bold tracking-tight text-white shadow-md ${className ?? ""}`}
    >
      t6
    </span>
  );
}
