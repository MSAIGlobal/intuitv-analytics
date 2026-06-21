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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-[#0A0A0A] border-2 border-[#0A0A0A] rounded-2xl p-4 sm:p-6 animate-pulse"
          >
            <div className="h-12 bg-[rgba(198,248,51,0.12)] rounded mb-2"></div>
            <div className="h-8 bg-[rgba(198,248,51,0.12)] rounded mb-2"></div>
            <div className="h-4 bg-[rgba(198,248,51,0.12)] rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {kpis.map((kpi, index) => (
        <div
          key={index}
          className="bg-[#0A0A0A] border-2 border-[#0A0A0A] rounded-2xl p-4 sm:p-6 hover:border-[#C6F833] transition-all shadow-xl"
        >
          <div className="flex items-start justify-between mb-4">
            <span className="text-3xl">{kpi.icon}</span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                kpi.trend === 'up'
                  ? 'bg-[rgba(198,248,51,0.12)] text-[#C6F833]'
                  : 'bg-[rgba(246,246,241,0.12)] text-[#F6F6F1]'
              }`}
            >
              {kpi.change}
            </span>
          </div>
          <div className="font-display text-3xl font-bold text-[#C6F833] mb-1">{kpi.value}</div>
          <div className="text-sm text-[rgba(246,246,241,0.7)]">{kpi.label}</div>
        </div>
      ))}
    </div>
  );
}
