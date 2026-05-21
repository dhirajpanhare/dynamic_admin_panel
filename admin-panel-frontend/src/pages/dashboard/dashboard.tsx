import { StatsCard } from '@/components/widgets/stats-card';
import { ChartWidget } from '@/components/widgets/chart-widget';
import {
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Activity,
  ShoppingCart,
} from 'lucide-react';
import { DynamicDashboard } from '@/components/dynamic/dynamic-dashboard';
import { useDashboardConfig } from '@/lib/hooks/use-metadata';
import { Skeleton } from '@/components/ui/skeleton';

// ─── Static fallback dashboard content ───────────────────────────────────────
const revenueData = [
  { month: 'Jan', revenue: 4200 },
  { month: 'Feb', revenue: 3800 },
  { month: 'Mar', revenue: 5100 },
  { month: 'Apr', revenue: 4600 },
  { month: 'May', revenue: 5900 },
  { month: 'Jun', revenue: 6200 },
];

const ordersData = [
  { day: 'Mon', orders: 45 },
  { day: 'Tue', orders: 52 },
  { day: 'Wed', orders: 48 },
  { day: 'Thu', orders: 61 },
  { day: 'Fri', orders: 55 },
  { day: 'Sat', orders: 67 },
  { day: 'Sun', orders: 43 },
];

function StaticFallbackDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-600 mt-1">
          Welcome back! Here's what's happening with your workspace.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value="$45,231"
          change="+20.1% from last month"
          changeType="positive"
          icon={DollarSign}
          iconColor="bg-green-100 text-green-600"
        />
        <StatsCard
          title="Active Users"
          value="2,350"
          change="+15.3% from last month"
          changeType="positive"
          icon={Users}
          iconColor="bg-blue-100 text-blue-600"
        />
        <StatsCard
          title="Total Orders"
          value="1,234"
          change="-4.2% from last month"
          changeType="negative"
          icon={ShoppingCart}
          iconColor="bg-orange-100 text-orange-600"
        />
        <StatsCard
          title="Products"
          value="567"
          change="+12 new this week"
          changeType="positive"
          icon={Package}
          iconColor="bg-purple-100 text-purple-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartWidget
          title="Revenue Overview"
          data={revenueData}
          type="line"
          dataKey="revenue"
          xAxisKey="month"
        />
        <ChartWidget
          title="Orders This Week"
          data={ordersData}
          type="bar"
          dataKey="orders"
          xAxisKey="day"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard
          title="Conversion Rate"
          value="3.24%"
          change="+0.5% from last week"
          changeType="positive"
          icon={TrendingUp}
          iconColor="bg-indigo-100 text-indigo-600"
        />
        <StatsCard
          title="Avg. Order Value"
          value="$124.50"
          change="+$12.30 from last month"
          changeType="positive"
          icon={Activity}
          iconColor="bg-pink-100 text-pink-600"
        />
        <StatsCard
          title="Customer Satisfaction"
          value="4.8/5"
          change="Based on 1,234 reviews"
          changeType="neutral"
          icon={Users}
          iconColor="bg-yellow-100 text-yellow-600"
        />
      </div>
    </div>
  );
}

// ─── Main dashboard page ──────────────────────────────────────────────────────
export function DashboardPage() {
  const { data: dashboardConfig, isLoading, isError } = useDashboardConfig('default');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  // If API returned a config, render it dynamically; otherwise show static fallback
  if (!isError && dashboardConfig) {
    return <DynamicDashboard config={dashboardConfig} />;
  }

  return <StaticFallbackDashboard />;
}

