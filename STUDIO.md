# Studio Configuration — Standard Mini Game

## Project
- Name: ai-studio-demo
- Type: Mini Game
- Stage: Discovery / Pre-production
- Target Platforms: Local Web (development/debug), WeChat Mini Game, Douyin Mini Game
- Client Stack: Cocos Creator + TypeScript
- Server Stack: Node.js + NestJS + TypeScript; modular monolith
- Network: Standard WebSocket; server `ws`; production `wss`
- Message Encoding: Protobuf
- Data Layer: MySQL + Redis
- Repository: Monorepo
- GitHub Repository: `YuanQuan/ai-studio-demo`
- Authority Model: critical business state and trusted results are server-authoritative
- Workflow Mode: APPROVAL
- Producer: workflow/status/artifact version/user approval source of truth

## Platform Architecture
Core business code must not scatter direct platform API calls. Platform-specific capabilities are isolated behind adapters such as:
- WebAdapter
- WeChatAdapter
- DouyinAdapter

Local Web should reproduce gameplay/business behavior/effects as fully as technically feasible for development and QA.

## Default Server Topology
- One game service zone maps to one game process by default.
- Each zone binds independently configurable/migratable MySQL and Redis data sources.
- Global platform identity/payment/zone-directory data is separated from zone gameplay data when those capabilities are required.
- Cross-zone database joins are not a default integration mechanism.

## QA Defaults
- Default formal client execution target: Web only.
- WeChat/Douyin device/platform testing is not included unless the Task/user explicitly requests it.
- Network/weak-network/reconnect testing is not included unless explicitly requested.
- Performance/load/memory testing is not included unless explicitly requested.
- Broad regression outside the changed feature is not included unless explicitly requested.
- P0 and P1 block the flow; P2 may carry to the next version but must be reported.

## Development Principles
1. Product semantics and approved Acceptance Criteria are the implementation/test source of truth.
2. Formal cross-agent input/output must be traceable Artifacts, not chat-only context.
3. Downstream work can only consume the approved upstream Artifact version.
4. Product/Art/UI/VFX/Tech/Client/Server/QA follow `rules/artifact_contract.md`.
5. Producer continuously maintains workflow status, milestone history, approval log, artifact paths and the project Dashboard.
6. Art Director owns long-term visual direction; UI/VFX visual work must align with approved Art Direction.
7. Public game configuration uses `.xlsx` human source + data dictionary/validation rules.
8. Critical project facts live in the Game Repository, not conversation memory.

## Studio Template
- Source: `YuanQuan/ai-studio-template`
- Template: `templates/game/` (Standard Mini Game)
- Locked Commit: see `.studio-lock.json`
- Sync Mode: pinned; no automatic Studio Layer upgrade

## Project Rules
- Project-specific requirements, architecture changes, assets, tasks, approvals, code and test evidence live only in this Game Repository.
- Do not push Project Layer content back to `YuanQuan/ai-studio-template`.
- Studio Layer upgrades require an explicit diff/impact review and user approval.
