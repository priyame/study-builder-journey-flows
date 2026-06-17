// Registry of all study fixtures + helpers for resolving the active study from
// a search-param value. Default = LANTERN (the richest extract).

import type { StudyFixture } from "./types";
import { CARDIO1 } from "./cardio1";
import { PULSERX } from "./pulserx";
import { LANTERN } from "./lantern";
import { LEUKREG } from "./leukreg";
import { PEVD } from "./pevd";
import { BOOSTER } from "./booster";
import { GENESYS } from "./genesys";
import { VCF } from "./vcf";

// CARDIO-1 + PULSE-RX lead the list — they're Nathan's two canonical demos.
// The 6 protocol-pack samples follow.
export const STUDIES: StudyFixture[] = [
  CARDIO1,
  PULSERX,
  LANTERN,
  LEUKREG,
  PEVD,
  BOOSTER,
  GENESYS,
  VCF,
];

// Default to CARDIO-1 now that it's the first in the list — matches Nathan's
// app behavior where CARDIO-1 is the default active study.
export const DEFAULT_STUDY_ID = CARDIO1.identity.id;

export function getStudy(id: string | null | undefined): StudyFixture {
  if (!id) return STUDIES.find((s) => s.identity.id === DEFAULT_STUDY_ID)!;
  return STUDIES.find((s) => s.identity.id === id) ?? STUDIES[0];
}

export function getStudyOrNull(id: string | null | undefined): StudyFixture | null {
  if (!id) return null;
  return STUDIES.find((s) => s.identity.id === id) ?? null;
}

export type { StudyFixture, StudyArchetype, StudyIdentity, DataSource } from "./types";
