# Protocol Registry — Mini Game Template

This registry defines shared message/envelope conventions. Concrete business message IDs start empty in every new Game Repository.

## Envelope

```proto
message E {
  MT mt = 1;      // messageType
  uint32 mi = 2;  // messageId
  uint32 ri = 3;  // requestId
  uint32 sq = 4;  // sequence, optional
  uint32 ec = 5;  // errorCode, 0/default omitted
  bytes p = 6;    // protobuf payload
}
```

## Registered Abbreviations
| Abbr | Meaning |
|---|---|
| mt | messageType |
| mi | messageId |
| ri | requestId |
| sq | sequence |
| ec | errorCode |
| p | payload |
| uid | userId |
| zid | zoneId |
| ts | timestamp |

Rules:
- Abbreviations are centrally registered; the same abbreviation never has two meanings.
- Name collisions extend by 1–2 meaningful letters.
- Field-name shortening is for source consistency; Protobuf binary does not transmit field-name strings.

## Message ID Allocation
Default ranges:
- 1–31: network/session core
- 32–127: high-frequency realtime
- 128+: ordinary business modules, assigned centrally

Use numeric `mi`; do not send route strings on the wire.

## Envelope Usage
- Connection-level session/auth/protocol version is preferred where feasible instead of repeating it in every normal business packet.
- Time sync is handled through Ping/Pong or equivalent network-core messages.
- `ri` exists only when request correlation is needed.
- `sq` exists only where ordering/replay/realtime semantics require it.
- Protobuf default/unused fields should remain omitted naturally.

## Business Message Registry
| Message ID | Name | Direction | Proto | Module | Status | Notes |
|---:|---|---|---|---|---|---|

No project business message is pre-registered by the template.
