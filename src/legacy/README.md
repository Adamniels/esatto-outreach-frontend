# Legacy Compatibility Layer

This folder is reserved for temporary adapters during architecture migration.

Current compatibility is handled mostly via alias exports in `src/services/*`.
When moving modules to `src/features/*`, keep old import paths working until all callers are migrated.

