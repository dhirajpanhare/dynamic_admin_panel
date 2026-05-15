import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useEntityConfig } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { toTitleCase } from '@/lib/utils/helpers';

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const params = useParams();
  const entitySlug = params.entitySlug;

  // Fetch entity config if we're on an entity page
  const { data: entityConfig } = useEntityConfig(entitySlug || '', {
    enabled: !!entitySlug,
  });

  // Parse pathname into breadcrumb segments
  const pathSegments = location.pathname
    .split('/')
    .filter((segment) => segment && segment !== 'admin');

  // Build breadcrumb items
  const breadcrumbItems = React.useMemo(() => {
    const items: Array<{ label: string; path: string; isLast: boolean }> = [];

    // Add home
    items.push({
      label: 'Home',
      path: '/admin/dashboard',
      isLast: false,
    });

    // Build path progressively
    let currentPath = '/admin';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;

      let label = segment;

      // Special handling for entity pages
      if (segment === entitySlug && entityConfig) {
        label = entityConfig.label_plural;
      } else if (segment === 'create') {
        label = 'Create';
      } else if (segment === 'edit') {
        label = 'Edit';
      } else if (segment === 'detail') {
        label = 'Details';
      } else if (segment === 'list') {
        label = 'List';
      } else if (segment === 'dashboard') {
        label = 'Dashboard';
      } else if (segment === 'builder') {
        label = 'Builder';
      } else if (segment === 'settings') {
        label = 'Settings';
      } else if (segment === 'profile') {
        label = 'Profile';
      } else if (params.id && segment === params.id) {
        // Skip ID segments in breadcrumb
        return;
      } else {
        label = toTitleCase(segment);
      }

      items.push({
        label,
        path: currentPath,
        isLast,
      });
    });

    // Mark last item
    if (items.length > 0) {
      items[items.length - 1].isLast = true;
    }

    return items;
  }, [pathSegments, entitySlug, entityConfig, params.id]);

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.path}>
          {index > 0 && <ChevronRight className="h-4 w-4" />}
          {item.isLast ? (
            <span className="font-medium text-foreground">{item.label}</span>
          ) : (
            <Link
              to={item.path}
              className="hover:text-foreground transition-colors"
            >
              {index === 0 ? (
                <Home className="h-4 w-4" />
              ) : (
                item.label
              )}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
