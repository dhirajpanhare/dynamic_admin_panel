import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { WidgetComponentProps } from '@/lib/registry/widget-components';

/**
 * Metric / stat card widget.
 * config shape: { title, value, change, changeType: 'positive'|'negative'|'neutral', format }
 */
export const StatWidget: React.FC<WidgetComponentProps> = ({ config, isLoading }) => {
  const { title, value, change, changeType = 'neutral', format } = config ?? {};

  const formatted =
    format === 'currency'
      ? `$${Number(value ?? 0).toLocaleString()}`
      : format === 'percent'
      ? `${value}%`
      : String(value ?? '—');

  const ChangeIcon =
    changeType === 'positive'
      ? TrendingUp
      : changeType === 'negative'
      ? TrendingDown
      : Minus;

  const changeColor =
    changeType === 'positive'
      ? 'text-green-600'
      : changeType === 'negative'
      ? 'text-red-600'
      : 'text-muted-foreground';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title ?? 'Metric'}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-8 w-24 animate-pulse rounded bg-muted" />
        ) : (
          <>
            <div className="text-2xl font-bold">{formatted}</div>
            {change && (
              <div className={`flex items-center gap-1 text-xs mt-1 ${changeColor}`}>
                <ChangeIcon className="h-3 w-3" />
                <span>{change}</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StatWidget;
