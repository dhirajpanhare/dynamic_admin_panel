import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { metadataApi } from '@/lib/api/metadata.api';
import type { EntityConfig, MenuItem, PageConfig, DashboardConfig } from '@/lib/api/metadata.api';
import { useMetadataStore } from '@/lib/store/metadata.store';
import { QUERY_KEYS } from '@/config/constants';

/**
 * Hook to fetch and cache menu items
 */
export function useMenus(): UseQueryResult<MenuItem[], Error> {
  const { setMenus, setMenusLoading } = useMetadataStore();

  return useQuery({
    queryKey: [QUERY_KEYS.MENUS],
    queryFn: async () => {
      setMenusLoading(true);
      try {
        const menus = await metadataApi.getMenuItems();
        setMenus(menus);
        return menus;
      } finally {
        setMenusLoading(false);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch and cache entity configuration
 */
export function useEntityConfig(slug: string): UseQueryResult<EntityConfig, Error> {
  const { setEntityConfig, getEntityConfig } = useMetadataStore();

  return useQuery({
    queryKey: [QUERY_KEYS.ENTITY_CONFIG, slug],
    queryFn: async () => {
      const config = await metadataApi.getEntityConfig(slug);
      setEntityConfig(slug, config);
      return config;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData: () => getEntityConfig(slug),
    enabled: !!slug,
  });
}

/**
 * Hook to fetch and cache page configuration
 */
export function usePageConfig(slug: string): UseQueryResult<PageConfig, Error> {
  const { setPageConfig, getPageConfig } = useMetadataStore();

  return useQuery({
    queryKey: [QUERY_KEYS.PAGE_CONFIG, slug],
    queryFn: async () => {
      const config = await metadataApi.getPageConfig(slug);
      setPageConfig(slug, config);
      return config;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData: () => getPageConfig(slug),
    enabled: !!slug,
  });
}

/**
 * Hook to fetch and cache dashboard configuration
 */
export function useDashboardConfig(slug: string): UseQueryResult<DashboardConfig, Error> {
  const { setDashboardConfig, getDashboardConfig } = useMetadataStore();

  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_CONFIG, slug],
    queryFn: async () => {
      const config = await metadataApi.getDashboardConfig(slug);
      setDashboardConfig(slug, config);
      return config;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData: () => getDashboardConfig(slug),
    enabled: !!slug,
  });
}

/**
 * Hook to fetch list view configuration
 */
export function useListViewConfig(entity: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.LIST_VIEW_CONFIG, entity],
    queryFn: () => metadataApi.getListViewConfig(entity),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!entity,
  });
}
