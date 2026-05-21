# Frontend Alignment Plan
**Project:** Dynamic Admin Panel  
**Goal:** Align the frontend with the core innovation — a metadata-driven, dynamic rendering engine where every entity, form, list, dashboard, and workflow is defined by backend configuration, not hardcoded UI.

---

## Architecture Summary

```
Backend API (metadata)
  └─ /api/metadata/entities/:slug      → EntityConfig (fields, validations, permissions)
  └─ /api/metadata/list-views/:entity  → ListViewConfig (columns, sorts, filters)
  └─ /api/metadata/menus               → MenuItem[] (dynamic sidebar)
  └─ /api/metadata/dashboards/:slug    → DashboardConfig (widgets, layout)

Frontend Engine
  ├─ DynamicForm        → renders any EntityConfig as a validated form
  ├─ DynamicDataGrid    → renders any ListViewConfig as a paginated table
  ├─ DynamicDashboard   → renders any DashboardConfig as a widget grid
  └─ Sidebar            → driven by useMenus() with static fallback
```

---

## Phase Status

### ✅ Phase 0 — Foundation Fixes (COMPLETE)
| # | What | File |
|---|------|------|
| 1 | Fix AuthProvider placement (useNavigate inside router) | `src/components/layout/root-layout.tsx` *(new)* |
| 2 | Create AuthGuard for protected routes | `src/lib/auth/auth-guard.tsx` *(new)* |
| 3 | Rewrite router with proper structure | `src/app/router.tsx` |
| 4 | Add OTP verification route `/verify-otp` | `src/app/router.tsx` |
| 5 | Fix hardcoded localStorage keys → STORAGE_KEYS constants | `src/lib/api/client.ts`, `src/lib/auth/auth-service.ts` |
| 6 | Add missing QUERY_KEYS, ROUTES, FEATURES, APP_INFO | `src/config/constants.ts` |
| 7 | Rewrite workspace selector to use real `user.tenants` | `src/pages/workspace/workspace-selector.tsx` |

---

### ✅ Phase 1A — Field Component Library (COMPLETE)
All field components implement `FieldComponentProps` and are registered in the field registry.

| Component | File | Field Types Handled |
|-----------|------|---------------------|
| `TextField` | `src/components/fields/text-field.tsx` | text, email, url, password, slug, color |
| `NumberField` | `src/components/fields/number-field.tsx` | number |
| `TextareaField` | `src/components/fields/textarea-field.tsx` | textarea, json |
| `SelectField` | `src/components/fields/select-field.tsx` | select, radio |
| `MultiSelectField` | `src/components/fields/multi-select-field.tsx` | multi-select, checkbox-group |
| `CheckboxField` | `src/components/fields/checkbox-field.tsx` | checkbox, switch |
| `DateField` | `src/components/fields/date-field.tsx` | date, datetime, date-range, time |
| `FileField` | `src/components/fields/file-field.tsx` | file, image |
| `RichTextField` | `src/components/fields/rich-text-field.tsx` | rich-text (TipTap) |
| `RelationField` | `src/components/fields/relation-field.tsx` | relation (async search) |

Registry: `src/lib/registry/field-components.ts`

---

### ✅ Phase 1B — DynamicForm (COMPLETE)
**File:** `src/components/dynamic/dynamic-form.tsx`

Key capabilities:
- `buildZodSchema(fields)` — dynamically constructs Zod validation schema from `EntityField[]`
- `isFieldVisible(field, watchedValues)` — evaluates `conditional_visibility` rules
- Renders each field via `getFieldComponent(field.field_type)` from registry
- `readonly` mode for detail view (all inputs disabled, no submit button)
- Passes full field metadata: `label`, `placeholder`, `options[]`, `relation config`, `inputType`

---

### ✅ Phase 1C — DynamicDataGrid (COMPLETE)
**File:** `src/components/data-grid/dynamic-data-grid.tsx`

Key capabilities:
- `buildColumnDef(columns)` — converts `ListViewConfig.columns[]` to TanStack `ColumnDef[]`
- `formatCellValue()` — formats currency / date / datetime / boolean / badge per column config
- Server-side: pagination + sort + search (350 ms debounce)
- Bulk selection + bulk delete with confirmation
- `PermissionGuard` on Create / Edit / Delete actions
- Row actions dropdown (View / Edit / Delete)
- Loading skeletons while fetching

---

### ✅ Phase 1D — Entity Pages (COMPLETE)
All four entity pages are fully rewritten. No stubs remain.

| Page | File | How it works |
|------|------|--------------|
| List | `src/pages/entity/list-page.tsx` | `useEntityConfig` + `useListViewConfig` → `<DynamicDataGrid>` |
| Create | `src/pages/entity/create-page.tsx` | `useEntityConfig` + `useCreateEntity` → `<DynamicForm>` |
| Edit | `src/pages/entity/edit-page.tsx` | `useEntityConfig` + `useEntityDetail` + `useUpdateEntity` → `<DynamicForm initialData>` |
| Detail | `src/pages/entity/detail-page.tsx` | `useEntityConfig` + `useEntityDetail` → `<DynamicForm readonly>` |

Routes: `/entities/:entitySlug`, `/entities/:entitySlug/new`, `/entities/:entitySlug/:id`, `/entities/:entitySlug/:id/edit`

---

### ✅ Phase 1E — Dynamic Sidebar (COMPLETE)
**File:** `src/components/layout/sidebar.tsx`

- Calls `useMenus()` on mount; renders API-driven `MenuItem[]` sorted by `order`
- Each item wrapped in `<PermissionGuard requiredPermission={item.permission}>`
- Lucide icon resolved by name string via `resolveIcon()` helper
- Falls back to static `FALLBACK_NAV` array while API is loading / unavailable

---

### ✅ Phase 2 — Dynamic Dashboard (COMPLETE)

#### Widget Registry
**File:** `src/lib/registry/widget-components.ts`

Registered types: `metric`, `stat`, `chart`, `line-chart`, `bar-chart`, `pie-chart`

#### Widget Components
| Component | File | Config Shape |
|-----------|------|--------------|
| `StatWidget` | `src/components/widgets/stat-widget.tsx` | `{ title, value, change, changeType, format }` |
| `ChartWidgetDynamic` | `src/components/widgets/chart-widget-dynamic.tsx` | `{ title, chartType, data, dataKey, xKey }` |

#### DynamicDashboard Renderer
**File:** `src/components/dynamic/dynamic-dashboard.tsx`
- Iterates `DashboardConfig.widgets[]`, resolves component from registry
- Fetches live data via `useEntityList` if `widget.data_source.entity` is set
- Unknown widget types show a "not registered" placeholder

#### Dashboard Page
**File:** `src/pages/dashboard/dashboard.tsx`
- Calls `useDashboardConfig('default')` on load
- If config returned → renders `<DynamicDashboard>`
- If API error / no config → renders static `StaticFallbackDashboard`
- Shows loading skeletons while fetching

---

### ✅ Phase 3 — RBAC & Users Connected to Real API (COMPLETE)

#### New Files
| File | Purpose |
|------|---------|
| `src/lib/api/rbac.api.ts` | REST wrappers: `rolesApi`, `usersApi`, `permissionsApi`, `auditLogsApi` |
| `src/lib/hooks/use-rbac.ts` | React Query hooks: `useRoles`, `useCreateRole`, `useUpdateRole`, `useDeleteRole`, `useUsers`, `useInviteUser`, `useDeleteUser`, `useAssignRoles`, `usePermissions`, `useAuditLogs` |

#### Updated Pages (API-first, store fallback)
- `src/pages/rbac/roles.tsx` — deletes via `deleteRoleMutation`; falls back to store if API unavailable
- `src/pages/rbac/user-management.tsx` — fetches users via `useUsers()`; delete via `useDeleteUser()`
- `src/pages/rbac/audit-logs.tsx` — fetches logs via `useAuditLogs()`; falls back to store

---

### ✅ Phase 4 — Workflow Engine (COMPLETE)

#### New Files
| File | Purpose |
|------|---------|
| `src/lib/api/workflow.api.ts` | REST wrappers for workflows + execution logs |
| `src/lib/hooks/use-workflow.ts` | React Query hooks: `useWorkflows`, `useWorkflow`, `useCreateWorkflow`, `useUpdateWorkflow`, `useDeleteWorkflow`, `useActivateWorkflow`, `usePauseWorkflow`, `useWorkflowLogs` |

#### Updated Page
**File:** `src/pages/workflow/workflow.tsx`
- Fetches live workflow list via `useWorkflows()`
- Activate / Pause / Delete actions wired to mutations
- "Create Workflow" and row "View" buttons link to `ROUTES.WORKFLOW_BUILDER`
- Execution logs fetched from `useWorkflowLogs()` with 30s auto-refresh
- Falls back to static data if API is unavailable

---

### ✅ Phase 5 — Form Builder Save to API (COMPLETE)
**File:** `src/pages/builder/form-builder.tsx`

- "Save Form" button now calls `POST /api/metadata/entities` with the generated JSON schema
- Uses `useMutation` from React Query
- Shows loading state (`Saving...`) and toast on success/error

---

### ✅ Phase 6 — Files, Notifications, Export (COMPLETE)

#### API Foundation
| File | Status |
|------|--------|
| `src/lib/api/files.api.ts` | ✅ Created |
| `src/lib/api/notifications.api.ts` | ✅ Created |
| `src/lib/hooks/use-files-notifications.ts` | ✅ Created |

#### Implemented Features

**6A — File Management Page** ✅
- ✅ Created `src/pages/files/files-page.tsx`
  - Drag & drop upload via react-dropzone
  - Grid and list view modes
  - File search and pagination
  - Thumbnail preview for images
  - Copy URL, Download, Delete actions
  - File size formatting and MIME type icons
  - Responsive design with hover actions
- ✅ Added route `/files` to `src/app/router.tsx`
- ✅ Added Files menu item to sidebar

**6B — Notification Center** ✅
- ✅ Enhanced header (`src/components/layout/header.tsx`)
  - Notification bell with unread count badge
  - Dropdown panel with 5 most recent notifications
  - Real-time polling (30s interval)
  - "Mark all read" button
  - Click to navigate to notification link
  - Auto-mark as read on click
- ✅ Created `src/pages/notifications/notifications-page.tsx`
  - Full notification list with pagination
  - Filter by all/unread
  - Mark individual as read
  - Mark all as read
  - Delete notifications
  - Type-based badges (success/warning/error/info)
  - Timestamp formatting
  - Empty states
- ✅ Added route `/notifications` to `src/app/router.tsx`
- ✅ Added Notifications menu item to sidebar

**6C — Export Button on DynamicDataGrid** ✅
- ✅ Wired `useExportEntity` hook to Export button
- ✅ Triggers XLSX download via `dynamicApi.export()`
- ✅ Shows loading state during export
- ✅ Includes current filters/search/sort in export

---

### 🔲 Phase 7 — Production Hardening (NOT STARTED)

**7A — Remove Test Credential Bypass**
- [ ] `src/lib/auth/auth-service.ts` — remove any hardcoded test user / bypass logic
- [ ] `TEST_CREDENTIALS.md` — delete or redact

**7B — Error Boundaries**
- [ ] Create `src/components/shared/error-boundary.tsx` using React's `ErrorBoundary`
- [ ] Wrap `<AppLayout>` and each major page section

**7C — Empty States**
- [ ] Audit all pages for missing empty states (currently some show blank instead of a message)
- [ ] Standardize with a shared `<EmptyState icon title message action>` component

**7D — React Query Error Handling**
- [ ] Add `onError` global handler in `src/app/query-client.ts`
- [ ] Ensure all mutations show user-facing toasts (currently inconsistent)

**7E — Workflow Builder (ReactFlow)**
- [ ] Create `src/pages/workflow/workflow-builder.tsx`
- [ ] Use `reactflow` (already installed) for node-based visual editor
- [ ] Load existing workflow graph via `useWorkflow(id)` when editing
- [ ] Save graph via `useUpdateWorkflow()`

**7F — Tenant Branding**
- [ ] Fetch tenant branding config on login (`logo`, `primary_color`, `font`)
- [ ] Apply CSS custom properties (`--color-primary`, etc.) dynamically
- [ ] Store in `TenantProvider` context

---

## File Map — All Modified / Created Files

### New Files (created during alignment)
```
src/app/router.tsx                                  ← full rewrite
src/components/layout/root-layout.tsx               ← new
src/lib/auth/auth-guard.tsx                         ← new
src/components/fields/text-field.tsx                ← new
src/components/fields/number-field.tsx              ← new
src/components/fields/textarea-field.tsx            ← new
src/components/fields/select-field.tsx              ← new
src/components/fields/multi-select-field.tsx        ← new
src/components/fields/checkbox-field.tsx            ← new
src/components/fields/date-field.tsx                ← new
src/components/fields/file-field.tsx                ← new
src/components/fields/rich-text-field.tsx           ← new
src/components/fields/relation-field.tsx            ← new
src/components/dynamic/dynamic-form.tsx             ← new
src/components/dynamic/dynamic-dashboard.tsx        ← new
src/components/data-grid/dynamic-data-grid.tsx      ← new
src/components/widgets/stat-widget.tsx              ← new
src/components/widgets/chart-widget-dynamic.tsx     ← new
src/lib/api/rbac.api.ts                             ← new
src/lib/api/workflow.api.ts                         ← new
src/lib/api/files.api.ts                            ← new
src/lib/api/notifications.api.ts                    ← new
src/lib/hooks/use-rbac.ts                           ← new
src/lib/hooks/use-workflow.ts                       ← new
src/lib/hooks/use-files-notifications.ts            ← new
src/pages/files/files-page.tsx                      ← new (Phase 6A)
src/pages/notifications/notifications-page.tsx      ← new (Phase 6B)
```

### Modified Files (updated during alignment)
```
src/config/constants.ts                             ← added ROUTES, QUERY_KEYS, FEATURES, APP_INFO
src/lib/api/client.ts                               ← STORAGE_KEYS constants
src/lib/auth/auth-service.ts                        ← STORAGE_KEYS constants
src/lib/auth/auth-context.tsx                       ← ROUTES constant for navigate()
src/lib/auth/index.ts                               ← export AuthGuard
src/lib/registry/field-components.ts               ← registered all 10+ field types
src/lib/registry/widget-components.ts              ← registered StatWidget, ChartWidgetDynamic
src/components/layout/index.ts                      ← export RootLayout
src/components/layout/sidebar.tsx                   ← full rewrite (API-driven) + Files/Notifications menu
src/components/layout/header.tsx                    ← added notification bell with dropdown (Phase 6B)
src/components/data-grid/dynamic-data-grid.tsx      ← wired export button (Phase 6C)
src/pages/workspace/workspace-selector.tsx          ← real user.tenants
src/pages/entity/list-page.tsx                      ← full rewrite (DynamicDataGrid)
src/pages/entity/create-page.tsx                    ← full rewrite (DynamicForm)
src/pages/entity/edit-page.tsx                      ← full rewrite (DynamicForm)
src/pages/entity/detail-page.tsx                    ← full rewrite (DynamicForm readonly)
src/pages/dashboard/dashboard.tsx                   ← API-driven (DynamicDashboard)
src/pages/rbac/roles.tsx                            ← useRoles() + useDeleteRole()
src/pages/rbac/user-management.tsx                  ← useUsers() + useDeleteUser()
src/pages/rbac/audit-logs.tsx                       ← useAuditLogs()
src/pages/workflow/workflow.tsx                      ← full rewrite (API-driven)
src/pages/builder/form-builder.tsx                  ← Save wired to POST /api/metadata/entities
src/app/router.tsx                                  ← added /files and /notifications routes (Phase 6)
```

---

## TypeScript Status
All phases above verified with `npx tsc --noEmit` → **0 errors**.

---

## Remaining Work Priority

| Priority | Phase | Effort | Impact | Status |
|----------|-------|--------|--------|--------|
| ✅ Complete | 6A: File management page | Medium | Core feature promised in ProjectOverview | **DONE** |
| ✅ Complete | 6B: Notification bell + page | Medium | Core feature promised in ProjectOverview | **DONE** |
| ✅ Complete | 6C: Export button wiring | Small | Quick win, hook already exists | **DONE** |
| 🟡 Medium | 7E: Workflow Builder (ReactFlow) | Large | Key differentiator, ReactFlow already installed | TODO |
| 🟢 Low | 7A: Remove test bypass | Small | Security, do before production | TODO |
| 🟢 Low | 7B-D: Error boundaries + hardening | Medium | Quality | TODO |
| 🟢 Low | 7F: Tenant branding | Medium | Multi-tenant differentiator | TODO |
