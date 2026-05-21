import React from 'react';
import { getWidgetComponent } from '@/lib/registry/widget-components';
import type { DashboardConfig, DashboardWidget } from '@/lib/api/metadata.api';
import { useEntityList } from '@/lib/hooks/use-dynamic-api';

// ─── Single widget wrapper ────────────────────────────────────────────────────

interface WidgetRendererProps {
  widget: DashboardWidget;
}

const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget }) => {
  const WidgetComponent = getWidgetComponent(widget.type);

  // Fetch widget data from entity if a data_source is configured
  const { data, isLoading } = useEntityList(
    widget.data_source?.entity ?? '',
    widget.data_source?.params,
    { enabled: !!widget.data_source?.entity }
  );

  if (!WidgetComponent) {
    console.warn(`[DynamicDashboard] No widget registered for type: ${widget.type}`);
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Unknown widget type: <code>{widget.type}</code>
      </div>
    );
  }

  return (
    <WidgetComponent
      config={widget.config}
      data={data?.items}
      isLoading={isLoading}
    />
  );
};

// ─── Dashboard renderer ───────────────────────────────────────────────────────

export interface DynamicDashboardProps {
  config: DashboardConfig;
}

export const DynamicDashboard: React.FC<DynamicDashboardProps> = ({ config }) => {
  const sortedWidgets = [...config.widgets].sort((a, b) => a.position.y - b.position.y);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{config.title}</h1>
        {config.description && (
          <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
        )}
      </div>

      {/* Simple responsive grid — position data used to derive column spans */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {sortedWidgets.map((widget) => (
          <div
            key={widget.id}
            className={`col-span-${Math.min(widget.position.w, 4)} row-span-${widget.position.h}`}
            style={{ gridColumn: `span ${Math.min(widget.position.w, 4)}` }}
          >
            <WidgetRenderer widget={widget} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DynamicDashboard;
