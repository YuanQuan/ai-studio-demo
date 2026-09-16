# Tasks

Formal project tasks are created/split/dispatched/cancelled only by Master. Producer maintains their workflow status and gates.

Default specialized flow:
`BACKLOG -> SPEC -> READY -> IN_PROGRESS -> REVIEW -> USER_REVIEW -> DONE`

Exception/extended states may include `REVISION`, `BLOCKED`, `CANCELLED`, `INTEGRATION`, `QA` where appropriate.

Directories:
- `backlog/`
- `active/`
- `review/`
- `done/`

Every formal Task must declare Owner, dependencies, Required Artifacts, acceptance/gates and traceability to upstream approved artifacts.
