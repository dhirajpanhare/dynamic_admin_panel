import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS, FEATURES } from '@/config/constants';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  primaryColor?: string;
  settings?: Record<string, any>;
}

interface TenantContextType {
  currentTenant: Tenant | null;
  availableTenants: Tenant[];
  isLoading: boolean;
  switchTenant: (tenantId: string) => void;
  setTenants: (tenants: Tenant[]) => void;
  setCurrentTenant: (tenant: Tenant) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTenant, setCurrentTenantState] = useState<Tenant | null>(null);
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize tenant from localStorage
  useEffect(() => {
    if (!FEATURES.MULTI_TENANT) {
      setIsLoading(false);
      return;
    }

    const storedTenantId = localStorage.getItem(STORAGE_KEYS.TENANT);
    
    if (storedTenantId) {
      // In a real app, fetch tenant details from API
      // For now, we'll just set the ID
      setCurrentTenantState({
        id: storedTenantId,
        name: 'Current Tenant',
        slug: storedTenantId,
      });
    }
    
    setIsLoading(false);
  }, []);

  // Apply tenant branding
  useEffect(() => {
    if (currentTenant?.primaryColor) {
      document.documentElement.style.setProperty('--primary', currentTenant.primaryColor);
    }
  }, [currentTenant]);

  const switchTenant = useCallback((tenantId: string) => {
    const tenant = availableTenants.find((t) => t.id === tenantId);
    if (tenant) {
      localStorage.setItem(STORAGE_KEYS.TENANT, tenantId);
      setCurrentTenantState(tenant);
      
      // Reload page to refresh all data for new tenant
      window.location.reload();
    }
  }, [availableTenants]);

  const setTenants = useCallback((tenants: Tenant[]) => {
    setAvailableTenants(tenants);
    
    // If no current tenant but tenants available, set first as current
    if (!currentTenant && tenants.length > 0) {
      const firstTenant = tenants[0];
      localStorage.setItem(STORAGE_KEYS.TENANT, firstTenant.id);
      setCurrentTenantState(firstTenant);
    }
  }, [currentTenant]);

  const setCurrentTenant = useCallback((tenant: Tenant) => {
    localStorage.setItem(STORAGE_KEYS.TENANT, tenant.id);
    setCurrentTenantState(tenant);
  }, []);

  const value: TenantContextType = {
    currentTenant,
    availableTenants,
    isLoading,
    switchTenant,
    setTenants,
    setCurrentTenant,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

export const useTenantContext = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenantContext must be used within a TenantProvider');
  }
  return context;
};
