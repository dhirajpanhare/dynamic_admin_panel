# Quick Start Guide — Dynamic Admin Panel Frontend

**Status:** ✅ Phases 0-6 Complete | Ready for Testing

---

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Backend API running (optional for testing UI)

---

## Installation

```bash
# Navigate to frontend directory
cd admin-panel-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at: **http://localhost:5173**

---

## Available Routes

### 🔐 Authentication
- `/login` — Login page
- `/verify-otp` — OTP verification
- `/workspace` — Workspace selector

### 📊 Core Features
- `/dashboard` — Dynamic dashboard (metadata-driven)
- `/products` — Products page (example entity)
- `/builder` — Form builder
- `/users` — Users page
- `/workflow` — Workflow management
- `/settings` — Settings page
- `/profile` — User profile

### 👥 RBAC
- `/rbac/roles` — Role management
- `/rbac/permissions` — Permission matrix
- `/rbac/users` — User management
- `/rbac/audit` — Audit logs

### 🏢 Workspaces
- `/workspaces` — Workspace list
- `/workspaces/:id/members` — Workspace members

### 📁 Files & Notifications (NEW ✅)
- `/files` — File management with drag & drop
- `/notifications` — Notification center

### 🔄 Dynamic Entities
- `/entities/:slug` — List any entity
- `/entities/:slug/new` — Create entity record
- `/entities/:slug/:id` — View entity record
- `/entities/:slug/:id/edit` — Edit entity record

---

## Test Credentials

If backend has test mode enabled:

```
Email: admin@example.com
Password: admin123
```

---

## Key Features to Test

### 1. Dynamic Form Engine
**Route:** `/entities/products/new`

- Form fields are generated from backend metadata
- Validation rules from backend
- Conditional field visibility
- 10+ field types supported

### 2. Dynamic Data Grid
**Route:** `/entities/products`

- Table columns from backend metadata
- Server-side pagination, sorting, filtering
- Bulk selection and delete
- Export to XLSX ✅

### 3. File Management ✅
**Route:** `/files`

- Drag & drop file upload
- Grid and list views
- Search files
- Copy URL, download, delete
- Image thumbnails

### 4. Notification Center ✅
**Location:** Bell icon in header

- Real-time unread count
- Dropdown with recent notifications
- Full notifications page at `/notifications`
- Mark as read, delete
- Filter by all/unread

### 5. Dynamic Dashboard
**Route:** `/dashboard`

- Widgets from backend config
- Live data fetching
- Stat cards and charts

### 6. RBAC
**Routes:** `/rbac/*`

- Role management
- Permission matrix
- User management
- Audit logs

### 7. Workflow Engine
**Route:** `/workflow`

- Workflow list
- Activate/pause workflows
- Execution logs

---

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npx tsc --noEmit

# Lint code
npm run lint
```

---

## Project Structure

```
src/
├── app/                    # App setup (router, providers)
├── components/
│   ├── data-grid/         # DynamicDataGrid
│   ├── dynamic/           # DynamicForm, DynamicDashboard
│   ├── fields/            # 10+ field components
│   ├── layout/            # Header, Sidebar, Layout
│   ├── ui/                # Shadcn UI components
│   └── widgets/           # Dashboard widgets
├── config/                # Constants, routes
├── features/              # Feature modules (auth, profile, settings)
├── lib/
│   ├── api/               # API clients
│   ├── auth/              # Auth utilities
│   ├── hooks/             # React Query hooks
│   ├── registry/          # Component registries
│   └── store/             # Zustand stores
├── pages/                 # Page components
│   ├── entity/            # Dynamic entity pages
│   ├── files/             # File management ✅
│   ├── notifications/     # Notifications ✅
│   ├── rbac/              # RBAC pages
│   └── workflow/          # Workflow pages
└── styles/                # Global styles
```

---

## Environment Variables

Create `.env.local` file:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=Dynamic Admin Panel
VITE_ENABLE_MOCK_API=false
```

---

## API Integration

### Backend Required Endpoints

#### Metadata API
```
GET /api/metadata/entities/:slug
GET /api/metadata/list-views/:entity
GET /api/metadata/menus
GET /api/metadata/dashboards/:slug
```

#### Dynamic Entity API
```
GET    /api/entities/:slug
POST   /api/entities/:slug
GET    /api/entities/:slug/:id
PUT    /api/entities/:slug/:id
DELETE /api/entities/:slug/:id
GET    /api/entities/:slug/export
```

#### Files API ✅
```
GET    /api/files
POST   /api/files/upload
DELETE /api/files/:id
```

#### Notifications API ✅
```
GET    /api/notifications
GET    /api/notifications/unread-count
PUT    /api/notifications/:id/read
PUT    /api/notifications/read-all
```

---

## Troubleshooting

### Issue: "Cannot find module"
**Solution:** Run `npm install`

### Issue: TypeScript errors
**Solution:** Run `npx tsc --noEmit` to check errors

### Issue: API calls failing
**Solution:** 
1. Check backend is running
2. Verify `VITE_API_BASE_URL` in `.env.local`
3. Check browser console for CORS errors

### Issue: Blank page
**Solution:**
1. Check browser console for errors
2. Verify all dependencies installed
3. Try clearing browser cache

### Issue: Styles not loading
**Solution:**
1. Restart dev server
2. Check Tailwind CSS is configured
3. Verify `index.css` is imported in `main.tsx`

---

## Browser DevTools Tips

### React Query DevTools
React Query DevTools are enabled in development. Look for the floating icon in bottom-right corner to inspect:
- Query cache
- Mutation status
- Network requests

### Redux DevTools (Zustand)
Install Redux DevTools extension to inspect Zustand stores:
- Auth state
- UI state
- RBAC state
- Workspace state

---

## Testing Checklist

### Basic Functionality
- [ ] Login works
- [ ] Dashboard loads
- [ ] Sidebar navigation works
- [ ] Theme toggle works (header)
- [ ] User menu works (header)

### Dynamic Features
- [ ] Entity list page loads
- [ ] Entity create form works
- [ ] Entity edit form works
- [ ] Entity detail view works
- [ ] Search and filters work
- [ ] Pagination works
- [ ] Export button works ✅

### New Features (Phase 6)
- [ ] Files page loads
- [ ] File upload works (drag & drop)
- [ ] File download works
- [ ] File delete works
- [ ] Notification bell shows count
- [ ] Notification dropdown works
- [ ] Notifications page loads
- [ ] Mark as read works
- [ ] Mark all read works

### RBAC
- [ ] Roles page loads
- [ ] Create role works
- [ ] Permission matrix works
- [ ] User management works
- [ ] Audit logs display

### Responsive Design
- [ ] Works on mobile (375px)
- [ ] Works on tablet (768px)
- [ ] Works on desktop (1920px)
- [ ] Sidebar collapses on mobile
- [ ] Dropdowns work on touch

---

## Performance Tips

### Development
- Use React DevTools Profiler to identify slow components
- Check Network tab for unnecessary API calls
- Monitor React Query cache hits

### Production
- Enable code splitting (already configured)
- Use production build: `npm run build`
- Serve with CDN for static assets
- Enable gzip compression on server

---

## Next Steps

1. **Test all features** using this guide
2. **Report any bugs** found during testing
3. **Complete Phase 7** (production hardening)
4. **Deploy to staging** for user acceptance testing
5. **Deploy to production** after approval

---

## Support

### Documentation
- `ALIGNMENT_PLAN.md` — Implementation plan
- `PHASE_6_COMPLETE.md` — Phase 6 details
- `ALIGNMENT_COMPLETE_SUMMARY.md` — Full summary
- `FRONTEND_STRUCTURE.md` — Architecture guide

### Code Comments
All major components have inline comments explaining:
- Purpose
- Props
- Usage examples
- Integration points

---

## Quick Reference

### Important Files
```
src/components/dynamic/dynamic-form.tsx          → Form engine
src/components/data-grid/dynamic-data-grid.tsx   → Grid engine
src/components/dynamic/dynamic-dashboard.tsx     → Dashboard engine
src/pages/files/files-page.tsx                   → File management ✅
src/pages/notifications/notifications-page.tsx   → Notifications ✅
src/components/layout/header.tsx                 → Notification bell ✅
```

### Key Hooks
```typescript
useEntityList()          → Fetch entity list
useEntityDetail()        → Fetch single entity
useCreateEntity()        → Create entity
useUpdateEntity()        → Update entity
useDeleteEntity()        → Delete entity
useExportEntity()        → Export entity data ✅
useFiles()               → Fetch files ✅
useUploadFile()          → Upload file ✅
useNotifications()       → Fetch notifications ✅
useNotificationCount()   → Get unread count ✅
```

---

**Happy Testing! 🚀**

For questions or issues, refer to the documentation files or check the inline code comments.
