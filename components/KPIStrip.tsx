'use client';

import { useState, useEffect } from 'react';
import { analyticsClient } from '../lib/analyticsClient';
import { KPIMetrics, AnalyticsFilters } from '../lib/types';

interface KPIStripProps {
  filters: AnalyticsFilters;
  refreshKey: number;
}

export default function KPIStrip({ filters, refreshKey }: KPIStripProps) {
  const [metrics, setMetrics] = useState<KPIMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [filters, refreshKey]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const data = await analyticsClient.getKPIMetrics(filters);
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load KPI metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(0);
  };

  const kpis = metrics
    ? [
        {
          label: 'Total Views',
          value: formatNumber(metrics.totalViews),
          change: '+12.3%',
          trend: 'up',
          icon: '👁️',
        },
        {
          label: 'Watch Hours',
          value: formatNumber(metrics.totalWatchHours),
          change: '+8.7%',
          trend: 'up',
          icon: '⏱️',
        },
        {
          label: 'Unique Viewers',
          value: formatNumber(metrics.uniqueViewers),
          change: '+15.2%',
          trend: 'up',
          icon: '👥',
        },
        {
          label: 'Avg Session',
          value: `${metrics.avgSessionDuration.toFixed(1)}m`,
          change: '+4.1%',
          trend: 'up',
          icon: '📊',
        },
        {
          label: 'Concurrent Streams',
          value: formatNumber(metrics.concurrentStreams),
          change: '+21.8%',
          trend: 'up',
          icon: '📡',
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-slate-800/50 backdrop-blur-sm border border-blue-700/30 rounded-xl p-6 animate-pulse"
          >
            <div className="h-12 bg-slate-700/50 rounded mb-2"></div>
            <div className="h-8 bg-slate-700/50 rounded mb-2"></div>
            <div className="h-4 bg-slate-700/50 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {kpis.map((kpi, index) => (
        <div
          key={index}
          className="bg-gradient-to-br from-slate-800/80 to-slate-800/50 backdrop-blur-sm border border-blue-700/30 rounded-xl p-6 hover:border-blue-500/50 transition-all shadow-xl"
        >
          <div className="flex items-start justify-between mb-4">
            <span className="text-3xl">{kpi.icon}</span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                kpi.trend === 'up'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {kpi.change}
            </span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{kpi.value}</div>
          <div className="text-sm text-blue-300">{kpi.label}</div>
        </div>
      ))}
    </div>
  );
}
