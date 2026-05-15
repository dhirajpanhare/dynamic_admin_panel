import React, { useState } from 'react';
import { PageContainer } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { GeneralTab } from './general-tab';
import { AppearanceTab } from './appearance-tab';
import { SecurityTab } from './security-tab';
import { NotificationsTab } from './notifications-tab';
import { BillingTab } from './billing-tab';
import { Settings, Palette, Shield, Bell, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

type TabType = 'general' | 'appearance' | 'security' | 'notifications' | 'billing';

const tabs = [
  { id: 'general' as TabType, label: 'General', icon: Settings },
  { id: 'appearance' as TabType, label: 'Appearance', icon: Palette },
  { id: 'security' as TabType, label: 'Security', icon: Shield },
  { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
  { id: 'billing' as TabType, label: 'Billing', icon: CreditCard },
];

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('general');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralTab />;
      case 'appearance':
        return <AppearanceTab />;
      case 'security':
        return <SecurityTab />;
      case 'notifications':
        return <NotificationsTab />;
      case 'billing':
        return <BillingTab />;
      default:
        return <GeneralTab />;
    }
  };

  return (
    <PageContainer maxWidth="2xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your application preferences and configuration
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Tabs */}
          <aside className="w-full md:w-64 shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Tab Content */}
          <div className="flex-1 min-w-0">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default SettingsPage;
