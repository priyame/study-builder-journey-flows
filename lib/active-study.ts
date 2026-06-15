// Client-side helper for reading the active study from the URL. Search-param-
// driven so links are shareable: ?study=lantern, ?study=leukreg, etc.
// Falls back to DEFAULT_STUDY_ID when no param is present.

"use client";

import { useSearchParams } from "next/navigation";
import { getStudy, DEFAULT_STUDY_ID } from "./studies";

export function useActiveStudyId(): string {
  const params = useSearchParams();
  return params.get("study") ?? DEFAULT_STUDY_ID;
}

export function useActiveStudy() {
  const id = useActiveStudyId();
  return getStudy(id);
}
