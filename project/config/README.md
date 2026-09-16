# Public Game Configuration

Human-maintained source tables use `.xlsx` under `source/`. Data dictionaries/validation contracts live under `schema/`.

## Ownership
- Product owns gameplay semantics, balancing goals and actual numeric content.
- Tech Lead owns public config structure, field types, IDs/references, constraints, validation and generation/runtime rules.
- Client/Server consume generated/validated outputs; they do not invent independent config semantics.

## Per-Table Data Dictionary
For each table document:
- unique ID
- field/stable abbreviation where useful
- type
- business meaning
- default/null policy
- enum/range/unique rules
- references/FKs
- Client-only / Server-only / Shared
- hot-update eligibility if later supported
- compatibility/deprecation policy

## Validation
At minimum validate unique IDs, references, types/ranges, required values, deprecated ID/field reuse, and accidental exposure of sensitive server-only fields to Client.

Do not create speculative tables just because the template exists. Add actual `.xlsx` files only when the project has a real requirement.
