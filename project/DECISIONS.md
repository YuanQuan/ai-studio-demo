# Project Decisions

This log contains decisions specific to this Game Repository. Do not copy decision history from another game.

## Entry Format
- Decision ID:
- Date:
- Status: PROPOSED / ACCEPTED / SUPERSEDED
- Scope:
- Decision:
- Rationale:
- Affected Artifacts / Roles:
- Migration / Rollback Notes:

## Decisions

### DEC-001 — Producer Dashboard artifact viewing
- Decision ID: DEC-001
- Date: 2026-09-16
- Status: ACCEPTED
- Scope: Producer Dashboard UX / artifact traceability
- Decision: Every Artifact shown in `project/dashboard/index.html` should use a readable clickable link to its repository file. When practical, Markdown/text/JSON/image/PDF artifacts should also provide an in-page preview action. The repository path remains visible for traceability.
- Rationale: Users should be able to inspect formal outputs directly from the Producer Dashboard instead of manually locating files in the repository.
- Affected Artifacts / Roles: Producer; `project/dashboard/index.html`; future Dashboard snapshots that reference Product/Art/UI/VFX/Tech/Client/Server/QA artifacts.
- Migration / Rollback Notes: Existing Dashboard artifact references should be converted to links/preview actions as they are touched. If an artifact format cannot be previewed safely or reliably, retain the repository link as the required fallback.
