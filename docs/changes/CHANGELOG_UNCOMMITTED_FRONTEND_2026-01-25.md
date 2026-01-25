# Uncommitted Change Log — Frontend — 2026-01-25

## 1) Summary
- **Total files changed**: ~8 (3 modified, 5 added)
- **Added**: Workflow service, types, and UI components (Templates & Prospect Instance view).
- **Modified**: API config, Settings view, Prospect Detail view.
- **Key themes**:
  - **Feature**: Implemented "Workflow" UI (Template management in Settings, Workflow execution in Prospect view).
  - **Infrastructure**: Enforced strictly defined `VITE_API_BASE_URL` (no default fallback).
  - **Refactor**: Simplified tab navigation logic in Settings.

## 2) File-by-file breakdown

### `src/services/api.ts`
- **Change type**: Modified
- **Why**: To prevent accidental connection to localhost default in environments where configuration is missing.
- **What changed**:
  - Removed `|| 'http://localhost:3000'` fallback.
  - Added explicit check: throws Error if `VITE_API_BASE_URL` is missing.
- **Risk / Impact**: **High**. App will crash immediately on startup if `.env` is missing or incorrect.

### `src/views/ProspectDetail.vue`
- **Change type**: Modified
- **Why**: To integrate the valid Workflow UI instead of the "Coming Soon" placeholder.
- **What changed**:
  - Replaced hardcoded "Coming Soon" placeholder div with `<WorkflowTab />` component.
  - Imported `WorkflowTab`.
- **Risk / Impact**: **Medium**. Introduces new complex interaction area in the main prospect view.

### `src/views/Settings.vue`
- **Change type**: Modified
- **Why**: To allow management of Workflow Templates and clean up tab switching code.
- **What changed**:
  - Added "Workflow Templates" tab to navigation.
  - Added `<WorkflowTemplates />` component integration.
  - Refactored `switchToCompanyInfo` into a generic `watch(activeTab)` pattern for lazy loading data.
- **Risk / Impact**: **Low**.

### `src/services/workflowService.ts` (Untracked/New)
- **Change type**: Added
- **Why**: To communicate with the new Backend Workflow API.
- **What changed**:
  - Methods: `getInstances`, `createInstance`, `addStep`, `activateWorkflow`, `regenerateDraft`, etc.

### `src/components/prospect/WorkflowTab.vue` (Untracked/New)
- **Change type**: Added
- **Why**: To display and manage a specific prospect's workflow state.
- **What changed**:
  - UI for viewing timeline/steps.
  - Controls for activating and managing workflow steps.

### `src/components/settings/WorkflowTemplates.vue` (Untracked/New)
- **Change type**: Added
- **Why**: To create and edit reusable workflow templates.
- **What changed**:
  - CRUD interface for Templates and their steps.

### `src/types/workflow.ts` (Untracked/New)
- **Change type**: Added
- **Why**: TypeScript definitions for the new domain.
- **What changed**:
  - Interfaces for `WorkflowInstance`, `WorkflowStep`, `WorkflowTemplate`, enums for `WorkflowStatus` etc.

## 3) Behavioral changes
- **User-visible (UI)**:
  - **Settings**: New "Workflow Templates" tab available.
  - **Prospect Detail**: "Workflow" tab is now functional (empty state or list of steps) instead of "Coming Soon".
  - **Error Landing**: If ENV vars are missing, the app will now show a white screen/error (console error) instead of silently trying localhost.

## 4) Tests
- **Added**: None visible in this diff.
- **Gaps**:
  - No Unit/Component tests added for the new Workflow components.

## 5) Review checklist
- [ ] **CRITICAL**: Verify `.env` file exists and has `VITE_API_BASE_URL` defined in all environments (Local/Dev/Prod).
- [ ] Check mobile responsiveness of the new Workflow Timeline view.
- [ ] Verify that the generic `Toast.vue` component doesn't conflict with existing notification systems.
