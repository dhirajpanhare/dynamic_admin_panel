import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  Workflow,
  Settings,
  ChevronLeft,
  ChevronRight,
  Blocks,
  Shield,
  Building2,
  Database,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/store/store';
import { ROUTES } from '@/config';
import { useMenus } from '@/lib/hooks/use-metadata';
import { PermissionGuard } from '@/lib/auth';
import type { MenuItem } from '@/lib/api/metadata.api';
import type { LucideIcon } from 'lucide-react';

// ── Static fallback nav (shown while metadata loads or as base nav) ──────────
const FALLBACK_NAV = [
  { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { name: 'Products', href: ROUTES.PRODUCTS, icon: Package },
  { name: 'Form Builder', href: ROUTES.BUILDER, icon: Blocks },
  { name: 'Users & RBAC', href: ROUTES.USERS, icon: Users },
  { name: 'Roles', href: ROUTES.RBAC_ROLES, icon: Shield },
  { name: 'Workspaces', href: ROUTES.WORKSPACES, icon: Building2 },
  { name: 'Workflows', href: ROUTES.WORKFLOW, icon: Workflow },
  { name: 'Settings', href: ROUTES.SETTINGS, icon: Settings },
];

// Resolve a Lucide icon name string to the component (falls back to Database icon)
function resolveIcon(name?: string): LucideIcon {
  if (!name) return Database as LucideIcon;
  const Icon = (LucideIcons as any)[name] as LucideIcon | undefined;
  return Icon ?? (Database as LucideIcon);
}

interface NavItemProps {
  href: string;
  name: string;
  Icon: LucideIcon;
  collapsed: boolean;
  permission?: string;
}

function NavItem({ href, name, Icon, collapsed, permission }: NavItemProps) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(href);

  const link = (
    <Link
      to={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-slate-700 hover:bg-slate-100'
      )}
      title={collapsed ? name : undefined}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!collapsed && <span>{name}</span>}
    </Link>
  );

  if (permission) {
    return <PermissionGuard requiredPermission={permission}>{link}</PermissionGuard>;
  }
  return link;
}

// Render a menu item from the API (recursive for children)
function DynamicNavItem({ item, collapsed }: { item: MenuItem; collapsed: boolean }) {
  const Icon = resolveIcon(item.icon);
  if (!item.path) return null;
  return (
    <NavItem
      href={item.path}
      name={item.label}
      Icon={Icon}
      collapsed={collapsed}
      permission={item.permission}
    />
  );
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { data: apiMenus } = useMenus();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-slate-200 bg-white transition-all duration-300 flex flex-col',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 shrink-0">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-semibold">
              D
            </div>
            <span className="text-lg font-semibold text-slate-900">Dynamic</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-5 w-5 text-slate-600" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {apiMenus && apiMenus.length > 0
          ? // API-driven menu
            [...apiMenus]
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <DynamicNavItem key={item.id} item={item} collapsed={sidebarCollapsed} />
              ))
          : // Static fallback nav while API is unavailable
            FALLBACK_NAV.map((item) => (
              <NavItem
                key={item.name}
                href={item.href}
                name={item.name}
                Icon={item.icon as LucideIcon}
                collapsed={sidebarCollapsed}
              />
            ))}
      </nav>
    </aside>
  );
}
