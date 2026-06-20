'use client';

import React, { useEffect, useState } from 'react';
import { analyticsClient, RealTimeMetric } from '@/shared/api/analyticsClient';
import Reveal from './Reveal';

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
    return <div className="animate-pulse text-[#0A0A0A] font-display">Loading metrics...</div>;
  }

  if (!metrics || metrics.length === 0) {
    return <div className="text-[rgba(10,10,10,0.6)]">No metrics available</div>;
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Reveal key={index} delay={index * 70}>
          <MetricCard
            title={metric.label}
            value={typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
            status={metric.status}
            change={metric.change}
          />
        </Reveal>
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
  // status dot colors mapped onto the lime/ink system
  const statusColors = {
    good: 'bg-[#C6F833]',
    warning: 'bg-[#D8FF5E]',
    critical: 'bg-[#F6F6F1]',
  };

  return (
    <div className="bg-[#0A0A0A] border-2 border-[#0A0A0A] rounded-2xl p-6 shadow-xl hover:border-[#C6F833] transition-all">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-[rgba(246,246,241,0.7)]">{title}</p>
          <p className="font-display text-3xl text-[#C6F833] mt-2">{value}</p>
          {change !== undefined && (
            <p className={`text-sm mt-1 font-bold ${change >= 0 ? 'text-[#C6F833]' : 'text-[#D8FF5E]'}`}>
              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
            </p>
          )}
        </div>
        {status && (
          <div className={`w-3 h-3 rounded-full ${statusColors[status] || 'bg-[rgba(246,246,241,0.4)]'}`}></div>
        )}
      </div>
    </div>
  );
};
