# Esatto Outreach Frontend - Codebase Rules

This file reflects the standards currently implemented in the frontend after the latest refactor wave.

## Status Vocabulary
- **Current standard**: implemented and expected for new code.
- **Migration rule**: required during transition from legacy structure.
- **Guidance**: recommended, but can be flexible with clear rationale.
- **Open decision**: intentionally not finalized yet.

---

## 1) Architecture and Layering

### 1.1 Architecture model
- **Current standard**: layered Vue 3 SPA with the practical flow `View -> Composable -> ApiService -> AxiosClient -> Backend`.
- **Current standard**: `src/services/api.ts` is the shared authenticated HTTP client and remains the entry point for authenticated requests.
- **Current standard**: no global store library (no Pinia/Vuex); state is composable/component-local plus selective `localStorage`.

### 1.2 Layer boundaries
- **Current standard**:
  - `views` orchestrate screens and compose UI/composables.
  - `components` contain reusable visual/domain UI pieces.
  - `composables` contain reusable stateful behavior and UI-facing logic.
  - `services` contain API transport only (no Vue runtime state).
  - `types` contain shared domain/request/response contracts.
- **Guidance**: keep business and mapping logic out of views when it can live in composables/shared helpers.

---

## 2) Folder and Module Placement

### 2.1 Primary structure in use
- **Current standard**:
  - App-level folders still active: `src/views`, `src/components`, `src/composables`, `src/services`, `src/types`, `src/router`.
  - Migration-era feature folders now present: `src/features/*` (currently strongest in api/composable extraction).
  - Shared cross-domain utilities now live in `src/shared/utils`.

### 2.2 Feature migration structure
- **Migration rule**:
  - New feature-facing API entry points should be exposed from `src/features/<feature>/api/*`.
  - Existing transport implementations in `src/services/*` stay as compatibility layer until fully migrated.
  - Temporary compatibility notes live in `src/legacy/README.md`.

---

## 3) Naming Conventions

### 3.1 Services and API exports
- **Current standard**: API objects are named `*Api` (e.g. `prospectsApi`, `workflowApi`, `companyInfoApi`, `outreachPromptsApi`).
- **Migration rule**: legacy `*API` aliases may remain temporarily to avoid breaking imports during phased migration.
- **Guidance**: new code should import `*Api` names directly, not legacy aliases.

### 3.2 Files and symbols
- **Current standard**:
  - Composables: `useXxx` naming.
  - Vue components: PascalCase file names.
  - Type contracts: backend-aligned names (`Dto`, `Request`, `Response`) where applicable.

---

## 4) Import Rules

- **Current standard**: use `@/` for cross-folder imports.
- **Current standard**: use `./` for same-folder imports.
- **Migration rule**: avoid reintroducing `../` deep relative imports in app code.

---

## 5) API, DTO, and Mapping Rules

### 5.1 API client and service rules
- **Current standard**:
  - Services return `response.data`.
  - Auth/refresh behavior is centralized in `src/services/api.ts`.
  - Feature entry points can re-export service APIs from `src/features/*/api/*`.

### 5.2 Type placement
- **Current standard**: shared request/response/domain contracts belong in `src/types`.
- **Current standard**: service-local duplicate contracts should be removed when shared equivalents exist.
- **Migration rule**: when moving a contract out of a service file, update all consumers before removing compatibility exports.

### 5.3 Mapping helpers
- **Current standard**: repeated mappings should be centralized in shared/feature helpers.
- **Examples now in place**:
  - `src/shared/utils/prospectStatus.ts`
  - `src/shared/utils/text.ts`
  - draft helpers in `src/features/prospects/composables/*Draft*`

---

## 6) State Management Rules

- **Current standard**: composables manage reusable stateful logic; views compose them.
- **Current standard**: global-like auth state is handled via `useAuth` singleton-style refs plus token storage in `authService`.
- **Guidance**: keep persistence limited to durable state (auth, explicit draft/chat persistence); avoid persisting transient UI state by default.

---

## 7) Error Handling and User Feedback

### 7.1 Error extraction
- **Current standard**: use `getApiErrorMessage()` from `src/shared/utils/apiError.ts` for API error normalization.
- **Guidance**: avoid hand-rolled `err.response?.data?...` chains in new code.

### 7.2 User notifications/dialogs
- **Current standard**: native dialogs are allowed and wrapped via `src/shared/utils/dialog.ts` (`confirmDialog`, `alertDialog`).
- **Migration rule**: avoid direct ad-hoc DOM-injected notifications in views/components.
- **Guidance**: if a feature uses component-based toast UX, keep it internally consistent instead of mixing three patterns in one flow.

---

## 8) Validation Rules

- **Current standard**: client-side validation is lightweight (native input constraints + computed checks).
- **Current standard**: backend validation remains source of truth.
- **Guidance**: UI validation hints must match actual implemented checks.

---

## 9) UI and Styling Rules

- **Current standard**:
  - Vue SFCs with `<script setup lang=\"ts\">`.
  - Typed props/emits for component interfaces.
  - Tailwind-first styling with shared global base styles in `src/style.css`.
- **Guidance**: avoid oversized route files; extract dense concern blocks into composables/components as they grow.

---

## 10) Configuration and Environment

- **Current standard**: `VITE_API_BASE_URL` is required; `.env.example` documents this explicitly.
- **Current standard**: docs and runtime configuration must match actual behavior.
- **Guidance**: if proxy mode is introduced later, update both `vite` config and `.env.example` in the same change.

---

## 11) Testing and Quality Gates

- **Current standard**:
  - `npm run typecheck` (`vue-tsc -b`)
  - `npm run lint` (ESLint flat config)
  - `npm run test` / `npm run test:watch` (Vitest)
  - `npm run build` runs typecheck before Vite build
- **Current standard**: baseline unit testing exists (example: `src/shared/utils/apiError.test.ts`).
- **Guidance**: add tests for extracted composables/helpers when refactoring feature logic.

---

## 12) New Feature Checklist

For each new feature or substantial extension:
1. Add/extend contracts in `src/types`.
2. Add/extend transport methods in `src/services` and expose from `src/features/<feature>/api`.
3. Put reusable feature logic in composables (feature or shared location).
4. Keep views thin and orchestration-focused.
5. Reuse shared helpers for errors/dialogs/status/text mapping.
6. Add or update tests for new helper/composable behavior.
7. Keep imports aligned with `@/` conventions.

---

## 13) Explicitly Avoid

- Reintroducing mixed deep relative import style.
- Duplicating canonical DTO/type definitions across files.
- Re-adding `*API` naming in new modules when `*Api` exists.
- Implementing one-off error parsing in each component.
- Injecting DOM notification elements directly from feature code.

---

## 14) Open Decisions

- **Store strategy**: continue composable-singleton only, or introduce Pinia for selected cross-feature state as complexity grows.
- **Feature migration end-state**: when to fully move from top-level layer folders to `src/features/*` for views/components/composables (currently incremental, not complete).

