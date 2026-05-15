# Dynamic Admin Panel - Implementation Guide

## 🎨 Design Philosophy

This implementation follows a **minimalist, high-density enterprise UI** inspired by Vercel and Stripe, focusing on:
- Whitespace and typography
- Functional clarity
- Clean, modern aesthetics

### Design System

- **Typography**: Inter font family
  - Small: 12px
  - Base: 14px
  - Header: 18px
  - Title: 24px

- **Color Palette**:
  - Primary: Indigo (#6366F1)
  - Text: Slate-900 (#0F172A)
  - Background: Slate-50 (#F8FAFC)
  - Border: Slate-200 (#E2E8F0)

## 📁 Project Structure

```
src/
├── app/
│   ├── providers.tsx       # React Query & Toast providers
│   ├── query-client.ts     # TanStack Query configuration
│   └── router.tsx          # React Router setup
│
├── components/
│   ├── layout/
│   │   ├── app-layout.tsx  # Main layout wrapper
│   │   ├── sidebar.tsx     # Collapsible sidebar navigation
│   │   └── header.tsx      # Top header with search & user menu
│   ├── ui/                 # ShadcnUI components
│   └── widgets/
│       ├── stats-card.tsx  # Dashboard stat cards
│       └── chart-widget.tsx # Recharts wrapper
│
├── pages/
│   ├── login/              # Authentication
│   ├── workspace/          # Multi-tenant workspace selector
│   ├── dashboard/          # Analytics dashboard
│   ├── products/           # TanStack Table data grid
│   ├── builder/            # Drag-and-drop form builder
│   ├── users/              # RBAC management
│   └── workflow/           # API & workflow engine
│
├── lib/
│   ├── store/
│   │   └── store.ts        # Zustand state management
│   ├── api/                # API client setup
│   ├── hooks/              # Custom React hooks
│   └── utils.ts            # Utility functions
│
└── config/
    ├── constants.ts        # App constants
    └── api.config.ts       # API configuration
```

## 🚀 Features Implemented

### 1. Authentication & Workspace Selection
- ✅ Split-screen minimalist login
- ✅ Multi-tenant workspace cards
- ✅ Organization branding
- ✅ Secure session management with Zustand

### 2. Main Dashboard
- ✅ Collapsible Lucide-icon sidebar
- ✅ Real-time metrics widgets
- ✅ Flat trend charts (Line/Bar) using Recharts
- ✅ Global search in header
- ✅ User profile dropdown with logout

### 3. Dynamic Data Grid (Products)
- ✅ TanStack Table v8
- ✅ Server-side filtering & sorting
- ✅ Column visibility toggles
- ✅ Bulk selection
- ✅ Category filtering
- ✅ Sticky headers
- ✅ Pagination

### 4. Low-Code Form Builder
- ✅ Drag-and-drop with @dnd-kit
- ✅ Component toolbox (8 field types)
- ✅ JSON schema live preview
- ✅ Sortable form fields
- ✅ Field removal
- ✅ Responsive layout

### 5. User & RBAC Management
- ✅ User list with avatars
- ✅ Role badges
- ✅ Permission matrix (Read/Write/Delete)
- ✅ Audit logs & activity tracking
- ✅ User stats dashboard
- ✅ Invite user flow

### 6. Workflow & API Engine
- ✅ Workflow list with status
- ✅ API key management
- ✅ Key visibility toggle
- ✅ Activity logs
- ✅ Stats dashboard
- ✅ Rate limiting indicators

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: ShadcnUI
- **Icons**: Lucide React
- **State Management**: Zustand (with persist)
- **Data Fetching**: TanStack Query v5
- **Routing**: React Router v7
- **Tables**: TanStack Table v8
- **Charts**: Recharts
- **Drag & Drop**: @dnd-kit
- **Forms**: React Hook Form + Zod
- **Notifications**: Sonner

## 🎯 Getting Started

### Installation

```bash
cd admin-panel-frontend
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🔐 Authentication Flow

1. User lands on `/login`
2. After successful login, redirected to `/workspace`
3. User selects a workspace
4. Redirected to `/dashboard`
5. All authenticated routes use `AppLayout` wrapper

## 📊 State Management

### Auth Store (Zustand + Persist)
```typescript
- user: User | null
- token: string | null
- workspace: Workspace | null
- setUser, setToken, setWorkspace, logout
```

### UI Store (Zustand + Persist)
```typescript
- sidebarCollapsed: boolean
- theme: 'light' | 'dark'
- toggleSidebar, setTheme
```

## 🎨 Component Patterns

### Stats Card
```tsx
<StatsCard
  title="Total Revenue"
  value="$45,231"
  change="+20.1% from last month"
  changeType="positive"
  icon={DollarSign}
  iconColor="bg-green-100 text-green-600"
/>
```

### Chart Widget
```tsx
<ChartWidget
  title="Revenue Overview"
  data={revenueData}
  type="line"
  dataKey="revenue"
  xAxisKey="month"
/>
```

## 🔄 Routing Structure

```
/ → /login
/login → Login Page
/workspace → Workspace Selector
/dashboard → Main Dashboard (Protected)
/products → Products Grid (Protected)
/builder → Form Builder (Protected)
/users → RBAC Management (Protected)
/workflow → API & Workflows (Protected)
* → 404 Not Found
```

## 🎯 Next Steps

### Recommended Enhancements:
1. **API Integration**: Connect to backend endpoints
2. **Real-time Updates**: WebSocket integration
3. **Advanced Filtering**: More filter options in data grid
4. **Form Validation**: Add validation rules in form builder
5. **Dark Mode**: Complete dark theme implementation
6. **Mobile Responsive**: Enhance mobile layouts
7. **Testing**: Add unit and integration tests
8. **Accessibility**: WCAG compliance improvements
9. **Performance**: Code splitting and lazy loading
10. **Documentation**: API documentation with Swagger

## 📝 Mock Data

All pages currently use mock data for demonstration. Replace with actual API calls:

- `mockProducts` → API endpoint
- `mockUsers` → API endpoint
- `mockWorkspaces` → API endpoint
- `mockWorkflows` → API endpoint
- `mockAPIKeys` → API endpoint

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to customize the color palette.

### Typography
Update font imports in `src/index.css`.

### Layout
Modify sidebar width in `src/components/layout/sidebar.tsx`.

## 📦 Dependencies

All required dependencies are already installed:
- React 19
- TanStack Query & Table
- Zustand
- Recharts
- @dnd-kit
- Lucide React
- React Router
- And more...

## 🐛 Known Issues

None at this time. This is a fresh implementation.

## 📄 License

Proprietary - Dynamic Admin Panel v1.0.0

---

**Built with ❤️ following Vercel & Stripe design principles**
