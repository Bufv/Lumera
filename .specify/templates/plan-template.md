# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]

**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]

**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]

**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]

**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]

**Project Type**: [e.g., library/cli/web-service/mobile-app/compiler/desktop-app or NEEDS CLARIFICATION]

**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]

**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]

**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Derived from `.specify/memory/constitution.md` v2.0.0. Mark each gate PASS / FAIL / N/A with a
one-line justification. Any FAIL must be recorded in Complexity Tracking below.

- [ ] **Mukadimah**: This plan serves the social mission (Indonesian student literacy/engagement),
      not revenue maximization; no monetization/premium feature is being designed or implemented.
- [ ] **I. Interaksi Nyata**: No planned UI control is decorative — every interactive element
      changes real state and produces feedback.
- [ ] **II. Struktur 7 Langkah**: Every lesson module in this plan implements all 7 steps
      (Prompt → Model visual → Aksi pengguna → Umpan balik instan → "Kenapa?" → Refleksi → Lanjutkan),
      with the "Kenapa?" explanation shown on both correct and incorrect answers.
- [ ] **III. Kedalaman di Atas Kuantitas**: Scope trade-offs cut module count, not per-module depth;
      no half-finished module is counted as a deliverable.
- [ ] **IV. Kebenaran Konten**: Content verification against Kurikulum Merdeka is planned before
      release, with a reviewer other than the module author.
- [ ] **V. Dewasa Secara Visual**: Visual/copy direction follows "Soft Academic Adventure"; no
      childish tone, no leaderboard or heavy social features; target segment is SMP-SMA.
- [ ] **VI. Instrumentasi Sejak Awal**: Minimal per-lesson data capture (concept, error type,
      time-on-task) is included in this plan, even if consuming features are out of scope.
- [ ] **VII. Aset Orisinal**: All illustrations/animations/icons are original or properly licensed.
- [ ] **VIII. Privasi dan Keamanan Data Siswa**: Any student data stored/processed is minimized,
      self-deletable by the student, never sold/shared with third parties, and has passed a
      privacy review before release.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
