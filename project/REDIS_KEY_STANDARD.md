# Redis Key Standard — Mini Game Template

## Base Format

```text
<ns>:<id>[:<sub>[:<subId>]]
```

## Rules
- lowercase ASCII
- `:` separator
- omit env/zone when datasource isolation already provides that boundary
- never place user free-text directly in keys
- namespaces/abbreviations are centrally registered
- prefer short, stable keys
- Redis is not the sole durable source of truth for critical business data

## Default Namespaces
| Namespace | Meaning |
|---|---|
| u | user/player cache |
| ss | session |
| on | online/presence |
| rk | ranking |
| cd | cooldown/temp expiry |
| tm | timer/schedule acceleration |
| rl | rate limit |
| lk | coordination/distributed lock when truly required |
| ct | counter |
| cf | config cache |

## Default User Subkeys
| Subkey | Meaning |
|---|---|
| b | basic |
| inv | inventory |
| q | quest |
| act | activity |
| eq | equipment |

## TTL Rule
TTL is appropriate for session, presence, cache, cooldown, rate-limit and disposable lock timeout. Redis keyspace expiry notification must never be the sole trigger for critical scheduled business work. Critical jobs persist `executeAt` / status and use a recoverable scheduler such as Redis ZSet and/or a durable task record.

Project-specific namespaces must be added to this registry rather than invented independently inside business modules.
