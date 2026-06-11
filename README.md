# Study Builder & Journey Flows

A focused click-through sketch of the **new study-build model** for TalOS v2 —
the version that landed in PRD #12 v0.8 after Kelly Ritch's 2026-06-04 input
and Pooja + Ana's 2026-06-10 operational follow-ups.

This is **not** a port of `t6v2prototype`. It's a small, opinionated repo built
for one purpose: walk the team through the new model and surface gaps before
we commit the same patterns into the production prototype.

## What's inside

Four routes, each a slice of Kelly's model:

| Route | Demonstrates | Source |
| --- | --- | --- |
| `/study/tags`     | Tag Categories + Tag Assignment Rules — replaces the legacy "Participant Group" entity (Doctrine D1, v0.8) | PRD #12 v0.8 §4 + §4.1 |
| `/study/versions` | Draft / UAT / Live lattice; Kelly's "what counts as a versioning change" rule table | PRD #12 v0.8 §§21–28 · NFR-107 |
| `/study/subjects` | Configurable Subject ID, configurable enrollment definition, disposition catch-all, auto + manual state transitions | Pooja + Ana 2026-06-10 · NFR-016 |
| `/study/export`   | Combined-dataset export shape (wide and long), per-subject version pin, delivery channels | Pooja + Ana 2026-06-10 · NFR-095 |

A persistent env switcher in the topbar (Draft / UAT / Live) demonstrates how
the same configuration surface changes posture per environment per §23.6
(warn-and-allow on Live).

## What's explicitly *not* in scope

- **Journey + Workflow Authoring Surface (§4.5)** — the visual canvas with
  milestone-as-node + builder-named touchpoints. Deferred to the next iteration.
  Cohort-Workflow-Optimization is the visual reference when we tackle this.
- **AI Import Wizard (Story 1)** and **Template flow (Story 2)** — separate review.
- **eCRF Builder, Schedule of Activities, Edit Checks** — these consume Tags
  and Versions, they don't author them.

## Visual borrow

`~/Projects/Cohort-Workflow/` (cloned from
`github.com/priyame/Cohort-Workflow-Optimization`) is checked out alongside
this repo as a reference for the workflow-authoring slice we haven't built yet.
Its `VisitScheduleBuilderPage.tsx` is the visual starting point when we
build `/study/journey` in the next iteration.

## Stack

- Next.js 16.2 (App Router)
- React 19.2
- TypeScript
- `lucide-react` for icons
- No Tailwind — CSS variables + a single `globals.css` modeled on
  `t6v2prototype`'s design tokens

## Run locally

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Push to GitHub (manual)

`gh` CLI isn't installed on this machine. To get this onto GitHub:

1. Create an empty `priyame/study-builder-journey-flows` repo at github.com/new
   (no README, no .gitignore — this repo already has them).
2. From this directory:
   ```bash
   git remote add origin https://github.com/priyame/study-builder-journey-flows.git
   git push -u origin main
   ```

## Domain types

The canonical model lives in `lib/kelly-model.ts` — read this first if you're
joining the review cold. It mirrors PRD #12 v0.8 §4 verbatim:

- `TagCategory` (8 `category_type`s, 5 `assignment_mode`s, ≥1 `usage`)
- `TagAssignmentRule` (7 `trigger_type`s; auto and manual are both first-class)
- `StudyVersion` (4 statuses across 3 environments)
- `SubjectIdConfig`, `EnrollmentDefinition`, `Disposition` — Pooja + Ana scope

Seed data lives in `components/*/seed.ts` for each slice.
