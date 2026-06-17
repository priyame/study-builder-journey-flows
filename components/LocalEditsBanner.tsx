"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { useLocalStore } from "@/lib/local-store";

/**
 * Honest banner that surfaces when the user has made local edits — this is a
 * sketch repo with no backend, so persistence is only in localStorage. The
 * Reset button restores the seed state for clean demos.
 */
export function LocalEditsBanner() {
  const { isDirty, reset } = useLocalStore();
  const [confirming, setConfirming] = useState(false);
  if (!isDirty) return null;

  return (
    <div className="z-20 flex flex-wrap items-center gap-2 border-b border-warning/40 bg-warning/10 px-4 py-1.5 text-xs text-warning sm:px-6">
      <span className="font-semibold">Local edits</span>
      <span className="text-warning/80">·</span>
      <span className="text-warning/90">
        Changes are saved to this browser&apos;s localStorage only — no backend in this sketch.
      </span>
      <div className="ml-auto flex items-center gap-2">
        {confirming ? (
          <>
            <span className="text-warning/90">Reset everything?</span>
            <button
              type="button"
              onClick={() => { reset(); setConfirming(false); }}
              className="inline-flex items-center gap-1 rounded-md bg-warning px-2 py-0.5 text-[11px] font-semibold text-white outline-none hover:bg-warning/90 focus-visible:ring-2 focus-visible:ring-warning/50"
            >
              <RotateCcw size={11} /> Reset
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-md px-2 py-0.5 text-[11px] font-medium text-warning/70 outline-none hover:text-warning focus-visible:ring-2 focus-visible:ring-warning/50"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="inline-flex items-center gap-1 rounded-md border border-warning/40 bg-white px-2 py-0.5 text-[11px] font-semibold text-warning outline-none hover:bg-warning/10 focus-visible:ring-2 focus-visible:ring-warning/50"
          >
            <RotateCcw size={11} /> Reset to seed
          </button>
        )}
      </div>
    </div>
  );
}
