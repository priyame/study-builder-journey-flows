// Registry of all study fixtures + helpers for resolving the active study from
// a search-param value. Default = LANTERN (the richest extract).

import type { StudyFixture } from "./types";
import { LANTERN } from "./lantern";
import { LEUKREG } from "./leukreg";
import { PEVD } from "./pevd";
import { BOOSTER } from "./booster";
import { GENESYS } from "./genesys";
import { VCF } from "./vcf";

export const STUDIES: StudyFixture[] = [
  LANTERN,
  LEUKREG,
  PEVD,
  BOOSTER,
  GENESYS,
  VCF,
];

export const DEFAULT_STUDY_ID = LANTERN.identity.id;

export function getStudy(id: string | null | undefined): StudyFixture {
  if (!id) return STUDIES.find((s) => s.identity.id === DEFAULT_STUDY_ID)!;
  return STUDIES.find((s) => s.identity.id === id) ?? STUDIES[0];
}

export function getStudyOrNull(id: string | null | undefined): StudyFixture | null {
  if (!id) return null;
  return STUDIES.find((s) => s.identity.id === id) ?? null;
}

export type { StudyFixture, StudyArchetype, StudyIdentity, DataSource } from "./types";
