import { Search, Bell, ChevronDown, LogOut, User, Settings, CheckCheck, ExternalLink } from 'lucide-react';
import { useAuthStore } from '@/lib/store/store';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/config';
import { useNotificationCount, useNotifications, useMarkNotificationRead, useMarkAllRead } from '@/lib/hooks/use-files-notifications';
import { formatDistanceToNow } from 'date-fns';

export function Header() {
  const { user, workspace, logout } = useAuthStore();
  const navigate = useNavigate();

  // Notification hooks
  const { data: countData } = useNotificationCount();
  const { data: notificationsData, isLoading: notificationsLoading } = useNotifications({ page: 1, pageSize: 5 });
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllRead();

  const unreadCount = countData?.count ?? 0;

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const handleNotificationClick = (id: string, link?: string) => {
    markReadMutation.mutate(id);
    if (link) navigate(link);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getNotificationBadgeVariant = (type: string) => {
    switch (type) {
      case 'success': return 'default';
      case 'warning': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Search */}
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search... (Cmd+K)"
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Workspace Selector */}
        {workspace && (
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary-100 text-xs font-semibold text-primary">
              {workspace.name[0]}
            </div>
            <span className="text-sm font-medium text-slate-900">
              {workspace.name}
            </span>
            <Badge variant="secondary" className="text-xs">
              {workspace.type}
            </Badge>
          </div>
        )}

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative rounded-lg p-2 hover:bg-slate-100 transition-colors">
              <Bell className="h-5 w-5 text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-96">
            <div className="flex items-center justify-between px-2 py-2">
              <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => markAllReadMutation.mutate()}
                  disabled={markAllReadMutation.isPending}
                >
                  <CheckCheck className="mr-1 h-3 w-3" />
                  Mark all read
                </Button>
              )}
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-96 overflow-y-auto">
              {notificationsLoading ? (
                <div className="space-y-2 p-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2 p-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  ))}
                </div>
              ) : !notificationsData || notificationsData.items.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notificationsData.items.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`flex-col items-start gap-1 p-3 cursor-pointer ${!notification.isRead ? 'bg-primary/5' : ''}`}
                    onClick={() => handleNotificationClick(notification.id, notification.link)}
                  >
                    <div className="flex items-start justify-between w-full gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium truncate">{notification.title}</p>
                          {!notification.isRead && (
                            <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                      <Badge variant={getNotificationBadgeVariant(notification.type)} className="text-xs flex-shrink-0">
                        {notification.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                      {notification.link && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            View <ExternalLink className="h-3 w-3" />
                          </span>
                        </>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="justify-center text-sm font-medium text-primary cursor-pointer"
              onClick={() => navigate('/notifications')}
            >
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg p-2 hover:bg-slate-100 transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-primary text-white text-xs">
                {user?.name ? getInitials(user.name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <div className="text-sm font-medium text-slate-900">
                {user?.name || 'User'}
              </div>
              <div className="text-xs text-slate-500">{user?.role || 'Admin'}</div>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(ROUTES.PROFILE)}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(ROUTES.SETTINGS)}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
