# Frontend Folder Structure Documentation

## Overview
This document provides a comprehensive guide to the frontend folder structure for the Dynamic Admin Panel application. The frontend is built with **React + TypeScript** using **Vite** as the build tool and **ShadcnUI** for component library.

---

## Root Directory Structure

```
admin-panel-frontend/
├── src/                          # Source code directory
├── public/                        # Static assets
├── node_modules/                  # Dependencies
├── index.html                     # Main HTML entry point
├── package.json                   # Project dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── tsconfig.app.json             # App-specific TypeScript config
├── tsconfig.node.json            # Node-specific TypeScript config
├── vite.config.ts                # Vite build configuration
├── eslint.config.js              # ESLint configuration
├── postcss.config.js             # PostCSS configuration
├── components.json               # ShadcnUI components config
├── .prettierrc                    # Prettier code formatting config
├── .gitignore                     # Git ignore rules
├── .env.example                   # Environment variables template
├── README.md                      # Project README
├── SETUP_PROGRESS.md             # Setup progress tracking
├── TEST_CREDENTIALS.md           # Test credentials documentation
└── FRONTEND_STRUCTURE.md         # This file
```

---

## Source Directory (`src/`)

The `src/` directory contains all application source code organized by feature and functionality.

### Core Application Files

```
src/
├── main.tsx                       # React application entry point
├── App.tsx                        # Root React component
├── App.css                        # Root component styles
├── index.css                      # Global CSS imports
```

### Directory Structure

```
src/
├── app/                           # Application configuration
├── assets/                        # Static assets (images, icons)
├── components/                    # Reusable UI components
├── config/                        # Configuration files
├── features/                      # Feature modules
├── lib/                           # Utility libraries and helpers
├── pages/                         # Page components
└── styles/                        # Global styles and themes
```

---

## Detailed Directory Breakdown

### 1. **`app/`** - Application Setup & Configuration

```
app/
├── providers.tsx                  # React Context providers setup
├── query-client.ts               # React Query client configuration
└── router.tsx                     # Router configuration and setup
```

**Purpose:** 
- Centralized application setup
- Provider configuration for global state management
- React Router setup with route definitions

---

### 2. **`assets/`** - Static Assets

```
assets/
├── images/                        # Image files
├── icons/                         # Icon files
└── fonts/                         # Custom fonts
```

**Purpose:**
- Static files referenced in components
- Images, icons, and font files used throughout the application

---

### 3. **`components/`** - Reusable UI Components

```
components/
├── data-grid/                     # Data table/grid components
│   ├── data-grid.tsx
│   ├── columns.tsx
│   └── filters.tsx
│
├── dynamic/                       # Dynamic form/field components
│   ├── dynamic-form.tsx
│   ├── form-generator.tsx
│   └── field-renderer.tsx
│
├── fields/                        # Individual field components
│   ├── text-field.tsx
│   ├── select-field.tsx
│   ├── checkbox-field.tsx
│   ├── date-field.tsx
│   └── custom-fields/
│
├── layout/                        # Layout components
│   ├── app-layout.tsx            # Main app layout wrapper
│   ├── page-container.tsx        # Page container component
│   ├── header.tsx                # Header/Top bar component
│   ├── sidebar.tsx               # Sidebar navigation component
│   ├── breadcrumb.tsx            # Breadcrumb navigation
│   └── index.ts                  # Barrel export
│
├── shared/                        # Shared utility components
│   ├── loading-spinner.tsx
│   ├── error-boundary.tsx
│   ├── confirmation-modal.tsx
│   └── notifications/
│
├── ui/                           # ShadcnUI wrapped components
│   ├── button.tsx                # Button component
│   ├── input.tsx                 # Input field component
│   ├── card.tsx                  # Card component
│   ├── avatar.tsx                # Avatar component
│   ├── badge.tsx                 # Badge component
│   ├── skeleton.tsx              # Skeleton loader
│   └── separator.tsx             # Divider component
│
└── widgets/                       # Composite widgets
    ├── dashboard-widget.tsx
    ├── stats-card.tsx
    ├── chart-widget.tsx
    └── activity-feed.tsx
```

**Purpose:**
- Reusable UI components following single responsibility principle
- Organized by component type and functionality
- Forms the building blocks of page components

---

### 4. **`config/`** - Application Configuration

```
config/
├── index.ts                       # Configuration barrel export
├── api.config.ts                 # API endpoints and base URL
├── constants.ts                  # Application-wide constants
└── theme.config.ts               # Theme configuration (colors, sizes)
```

**Purpose:**
- Centralized configuration management
- API endpoints definition
- Application constants and theme settings

---

### 5. **`features/`** - Feature Modules

```
features/
├── auth/                          # Authentication feature
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   └── types/
│
├── profile/                       # User profile feature
│   ├── components/
│   ├── pages/
│   └── hooks/
│
└── settings/                      # Application settings feature
    ├── components/
    ├── pages/
    └── hooks/
```

**Purpose:**
- Domain-specific feature modules
- Each feature is self-contained with its own components, hooks, and services
- Supports scalability and code organization

---

### 6. **`lib/`** - Utility Libraries and Helpers

```
lib/
├── utils.ts                       # General utility functions
├── api/                           # API client and services
│   ├── client.ts                 # Axios/Fetch client setup
│   ├── interceptors.ts           # Request/response interceptors
│   └── endpoints.ts              # API endpoint definitions
│
├── auth/                          # Authentication utilities
│   ├── token-manager.ts          # Token storage and management
│   ├── auth-service.ts           # Authentication service
│   └── guards.ts                 # Route guards
│
├── hooks/                         # Custom React hooks
│   ├── useAuth.ts                # Authentication hook
│   ├── useFetch.ts               # Data fetching hook
│   ├── useLocalStorage.ts        # Local storage hook
│   └── useFormState.ts           # Form state management hook
│
├── registry/                      # Component registry
│   └── component-registry.ts     # Dynamic component registration
│
├── store/                         # Global state management
│   ├── store.ts                  # Store setup (Zustand/Redux)
│   └── slices/
│
├── tenant/                        # Multi-tenancy utilities
│   ├── tenant-manager.ts
│   └── tenant-context.ts
│
└── utils/                         # Additional utilities
    ├── formatting.ts             # String/data formatting
    ├── validation.ts             # Form validation rules
    ├── error-handler.ts          # Error handling utilities
    └── logger.ts                 # Logging utilities
```

**Purpose:**
- Reusable logic and utilities
- Service layers for API communication
- Custom hooks for React functionality
- State management setup

---

### 7. **`pages/`** - Page Components

```
pages/
├── not-found.tsx                  # 404 page
│
├── dashboard/                     # Dashboard page
│   ├── dashboard.tsx
│   ├── dashboard-tabs.tsx
│   └── widgets/
│
├── builder/                       # Form/Entity builder page
│   ├── builder.tsx
│   ├── builder-canvas.tsx
│   ├── property-panel.tsx
│   ├── component-palette.tsx
│   └── preview.tsx
│
└── entity/                        # Entity management page
    ├── entity-list.tsx
    ├── entity-detail.tsx
    ├── entity-form.tsx
    └── entity-actions.tsx
```

**Purpose:**
- Full page components
- Represent routes in the application
- Composed of multiple component pieces
- Typically connected to state management

---

### 8. **`styles/`** - Global Styles

```
styles/
├── globals.css                    # Global CSS variables and styles
│
└── themes/                        # Theme definitions
    ├── light.css                 # Light theme
    ├── dark.css                  # Dark theme
    ├── colors.css                # Color palette
    └── typography.css            # Typography styles
```

**Purpose:**
- Global CSS variables
- Theme definitions
- Design tokens
- Base styles and resets

---

## Key Technologies & Dependencies

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | React 18+ | UI library |
| **Language** | TypeScript | Type safety |
| **Build Tool** | Vite | Fast development & build |
| **Styling** | CSS/PostCSS | Component styling |
| **UI Library** | ShadcnUI | Pre-built components |
| **Routing** | React Router | Page navigation |
| **State Management** | Zustand/Redux | Global state |
| **Data Fetching** | React Query/TanStack Query | Server state management |
| **HTTP Client** | Axios | API requests |
| **Code Quality** | ESLint + Prettier | Code formatting & linting |

---

## Component Hierarchy Example

```
App (src/App.tsx)
├── Provider (src/app/providers.tsx)
│   ├── AppLayout (src/components/layout/app-layout.tsx)
│   │   ├── Header (src/components/layout/header.tsx)
│   │   ├── Sidebar (src/components/layout/sidebar.tsx)
│   │   └── PageContainer (src/components/layout/page-container.tsx)
│   │       └── Routes
│   │           ├── Dashboard Page
│   │           ├── Entity Page
│   │           └── Builder Page
│   └── Notifications/Modals
```

---

## Data Flow Architecture

```
Pages (src/pages/)
    ↓
Custom Hooks (src/lib/hooks/)
    ↓
API Services (src/lib/api/)
    ↓
Global Store (src/lib/store/)
    ↓
Reusable Components (src/components/)
```

---

## Best Practices

1. **Component Organization**: Place related components together in feature directories
2. **Naming Conventions**: Use descriptive names for files and components (e.g., `DynamicForm.tsx`)
3. **Exports**: Use barrel exports (`index.ts`) for cleaner imports
4. **Styling**: Maintain consistent CSS approach (ShadcnUI + custom CSS)
5. **Type Safety**: Always use TypeScript interfaces/types for props and state
6. **Code Splitting**: Use dynamic imports for route-based code splitting
7. **Asset Management**: Keep assets organized in the `assets/` directory

---

## Configuration Files Reference

### `tsconfig.json`
- Base TypeScript configuration
- Shared by app and node configs

### `vite.config.ts`
- Build and development server setup
- Plugin configuration
- Alias definitions

### `eslint.config.js`
- Code quality rules
- Enforces coding standards

### `.env.example`
- Template for environment variables
- Copy to `.env.local` for local development

### `components.json`
- ShadcnUI component configuration
- Component path aliases

---

## Getting Started

1. Install dependencies: `npm install`
2. Create `.env.local` from `.env.example`
3. Start dev server: `npm run dev`
4. Build for production: `npm run build`

---

## Notes

- This structure supports scalability and maintainability
- New features should follow the established pattern in the `features/` directory
- Global components go in `components/`, feature-specific components in `features/<feature>/components/`
- Always maintain proper TypeScript types for better developer experience
