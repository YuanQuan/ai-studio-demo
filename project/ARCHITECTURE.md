# Architecture — Standard Mini Game Baseline

## Status
This file is the default architecture baseline for a new mini-game project. It is inherited at project creation and may be changed only by an explicit project Decision.

## Platforms
- Local Web: primary development/debug environment.
- WeChat Mini Game.
- Douyin Mini Game.

Local Web should reproduce gameplay, business behavior, UI and VFX as fully as technically feasible.

## Repository
Default Monorepo direction:

```text
apps/
├── client/          # Cocos Creator client
├── server/          # NestJS modular-monolith server
└── tools/           # development/debug tools
packages/
├── protocol/        # .proto source of truth + generated code
├── shared/          # truly platform-neutral shared TypeScript
├── client-core/     # reusable client foundation
├── server-core/     # reusable server foundation
└── platform-sdk/    # Web/WeChat/Douyin adapters
tooling/             # build/generation/validation/test tools
```

Do not create giant catch-all `common` / `utils` packages. Extract shared code after real repeated use appears.

## Client
- Cocos Creator + TypeScript.
- Core gameplay/business logic must not directly scatter `wx.*` / `tt.*` calls.
- Platform capabilities are isolated through WebAdapter / WeChatAdapter / DouyinAdapter or equivalent explicit adapter contracts.
- UI, VFX, resource management, input, animation and lifecycle remain clearly separated from business state.

## Server
- Node.js + NestJS + TypeScript.
- Modular monolith by default; no microservices without an explicit need/decision.
- NestJS owns module organization, DI and lifecycle.
- Game-specific network/session/protocol/reconnect/idempotency/realtime behavior stays in a thin game foundation layer rather than being mixed into business modules.

Suggested boundaries:

```text
server/
├── core/             # network/protocol/session/auth/event/scheduler/config
├── infrastructure/   # mysql/redis/logger/metrics
├── modules/          # player/inventory/quest/activity/ranking/...
└── realtime/         # room/match/battle when needed
```

## Network / Protocol
- Standard WebSocket.
- Development may use `ws://`; production uses `wss://`.
- Server implementation uses `ws`, not Socket.IO by default.
- Protobuf is the business message encoding; `.proto` under `packages/protocol/` is the protocol source of truth.
- Support request/response, server push and realtime streams.
- Critical state is server-authoritative.
- Network foundation supports connect/disconnect/reconnect, heartbeat, session/auth/resume, timeout/retry/idempotency, validation, rate limits and ordering/replay semantics where required.

## Data
- MySQL is the durable primary business store.
- Redis is cache/online runtime state, not the sole durable source for critical business data.
- Core queryable/statistical data should be relational rather than hidden in giant JSON fields.
- Critical economy/payment/reward changes must use an explicit recoverable consistency strategy.
- Critical scheduled jobs must not depend only on Redis TTL/keyspace notifications.

## Global / Zone Default
For server-backed projects that need accounts/payments/zones:
- Global Service / Global DB owns platform identity, payment orders/idempotency, zone directory and true cross-zone aggregates.
- Zone owns character/player, inventory, quest, equipment, zone activity/battle/rank gameplay data.
- A zone does not directly cross-DB join Global; use an explicit Global Service Contract.
- One zone = one game process is the default deployment unit; each zone uses independently configurable/migratable MySQL and Redis data sources.

If a small game does not need this topology, record a simplifying project Decision rather than silently ignoring the baseline.

## Development Labs
Plan independent debug/showcase entries early:
- UI Lab
- Component Lab
- VFX Lab
- Animation Lab
- Network Lab
- Platform API Lab

They should run on local Web first and remain buildable to WeChat/Douyin where applicable.

## Pending Per-Game Decisions
The following are intentionally not locked by the template and must be decided when a real requirement requires them:
- ORM/query builder/migrations/transaction approach
- Redis client and detailed MySQL/Redis consistency strategy
- login/auth/session/duplicate-login/refresh design
- reliable scheduler implementation
- deployment/logging/metrics/CI/CD/backup
- realtime battle sync model
- exact device/performance/concurrency budgets
- client UI/resource/hot-update architecture
- actual xlsx generator/runtime format
