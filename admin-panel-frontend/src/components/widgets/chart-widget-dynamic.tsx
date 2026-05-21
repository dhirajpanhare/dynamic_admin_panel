import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { WidgetComponentProps } from '@/lib/registry/widget-components';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

/**
 * Chart widget — renders line, bar, or pie chart.
 * config shape: { title, chartType: 'line'|'bar'|'pie', data, dataKey, xKey, nameKey }
 */
export const ChartWidgetDynamic: React.FC<WidgetComponentProps> = ({ config, data: externalData, isLoading }) => {
  const {
    title,
    chartType = 'line',
    data: configData,
    dataKey = 'value',
    xKey = 'name',
    nameKey = 'name',
  } = config ?? {};

  const chartData = externalData ?? configData ?? [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title ?? 'Chart'}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-48 animate-pulse rounded bg-muted" />
        ) : chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            {chartType === 'pie' ? (
              <PieChart>
                <Pie data={chartData} dataKey={dataKey} nameKey={nameKey} cx="50%" cy="50%" outerRadius={80} label>
                  {chartData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            ) : chartType === 'bar' ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey={dataKey} fill={COLORS[0]} radius={[3, 3, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey={dataKey} stroke={COLORS[0]} strokeWidth={2} dot={false} />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ChartWidgetDynamic;
