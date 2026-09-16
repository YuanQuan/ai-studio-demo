# API / Protocol Specification

## Locked Baseline
- Transport: Standard WebSocket.
- Development: `ws` allowed.
- Production: `wss` required.
- Server WebSocket implementation: `ws`.
- Message encoding: Protobuf.
- Protocol source of truth: `packages/protocol/`.

No business messages are defined by the template.

## Contract Rules
Each formal message defines:
- numeric message ID / type
- direction
- auth/authority requirement
- payload fields and semantics
- response/push fields
- error semantics
- timeout/retry behavior where applicable
- idempotency/duplicate behavior where applicable
- compatibility/version requirements

Client and Server must not maintain independent same-name/different-meaning contracts.

## Protobuf Rules
- `.proto` is the network field structure source of truth.
- Released field numbers are never repurposed.
- Removed fields reserve their old numbers/names where appropriate.
- Prefer additive/backward-compatible evolution.
- Do not introduce a second business message encoding for local convenience.
- Generated TypeScript types/code are shared by Client and Server.

## Reliability / Security
- Client-reported final results are not trusted for critical business state.
- Critical operations apply authorization, validation, idempotency, replay/rate-limit protection according to risk.
- Session resume and reconnect are handled by the shared network foundation rather than per-business incompatible implementations.

## Lock Rule
Once Client/Server implementation depends on an approved contract version, breaking changes require a formal Change/Impact Review.

## Business Messages
None yet. Register real messages in `project/PROTOCOL_REGISTRY.md` inside the Game Repository.
