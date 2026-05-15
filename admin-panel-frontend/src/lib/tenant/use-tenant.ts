import { useTenantContext } from './tenant-context';

/**
 * Hook to access tenant state and methods
 * 
 * @example
 * const { currentTenant, switchTenant } = useTenant();
 */
export const useTenant = () => {
  return useTenantContext();
};

export default useTenant;
