'use client';

import React, { useEffect, useState } from 'react';
import { analyticsClient, RealTimeMetric } from '@/shared/api/analyticsClient';

export const RealTimeMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<RealTimeMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await analyticsClient.getRealTimeMetrics();
        setMetrics(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="animate-pulse">Loading metrics...</div>;
  }

  if (!metrics || metrics.length === 0) {
    return <div>No metrics available</div>;
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          title={metric.label}
          value={typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
          status={metric.status}
          change={metric.change}
        />
      ))}
    </div>
  );
};

const MetricCard: React.FC<{
  title: string;
  value: string;
  status?: 'good' | 'warning' | 'critical';
  change?: number;
}> = ({ title, value, status, change }) => {
  const statusColors = {
    good: 'text-green-500',
    warning: 'text-yellow-500',
    critical: 'text-red-500',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {change !== undefined && (
            <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
            </p>
          )}
        </div>
        {status && (
          <div className={`w-3 h-3 rounded-full ${statusColors[status] || 'bg-gray-400'}`}></div>
        )}
      </div>
    </div>
  );
};
