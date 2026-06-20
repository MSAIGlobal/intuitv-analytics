'use client';

import { useState, useEffect } from 'react';
import { analyticsClient } from '../lib/analyticsClient';
import { ViewerBehavior as ViewerBehaviorType, AnalyticsFilters } from '../lib/types';

interface ViewerBehaviorProps {
  filters: AnalyticsFilters;
  refreshKey: number;
}

export default function ViewerBehavior({ filters, refreshKey }: ViewerBehaviorProps) {
  const [behavior, setBehavior] = useState<ViewerBehaviorType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [filters, refreshKey]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await analyticsClient.getViewerBehavior(filters);
      setBehavior(data);
    } catch (error) {
      console.error('Failed to load viewer behavior:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !behavior) {
    return (
      <div className="bg-[#0A0A0A] border-2 border-[#0A0A0A] rounded-2xl p-6">
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C6F833]"></div>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: 'Completion Rate',
      value: behavior.completionRate,
      format: 'percent',
      icon: '✅',
      color: 'bg-[#C6F833] text-[#0A0A0A]',
    },
    {
      label: 'Drop-off Rate',
      value: behavior.dropoffRate,
      format: 'percent',
      icon: '⚠️',
      color: 'bg-[#D8FF5E] text-[#0A0A0A]',
    },
    {
      label: 'Avg Watch Time',
      value: behavior.avgWatchTimePerContent,
      format: 'minutes',
      icon: '⏱️',
      color: 'bg-[#9BD600] text-[#0A0A0A]',
    },
    {
      label: 'Repeat Frequency',
      value: behavior.repeatViewerFrequency,
      format: 'times',
      icon: '🔄',
      color: 'bg-[#F6F6F1] text-[#0A0A0A]',
    },
  ];

  return (
    <div className="bg-[#0A0A0A] border-2 border-[#0A0A0A] rounded-2xl p-6 shadow-xl">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-[#C6F833] mb-1">Viewer Behavior Analytics</h2>
        <p className="text-[rgba(246,246,241,0.7)]">Engagement patterns and content performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="bg-[rgba(198,248,51,0.12)] rounded-lg p-6 hover:bg-[rgba(198,248,51,0.2)] transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-3xl">{metric.icon}</span>
              <div
                className={`px-3 py-1 rounded-full ${metric.color} text-sm font-semibold`}
              >
                {metric.format === 'percent'
                  ? `${metric.value.toFixed(1)}%`
                  : metric.format === 'minutes'
                  ? `${metric.value.toFixed(1)}m`
                  : `${metric.value.toFixed(1)}x`}
              </div>
            </div>
            <div className="text-[rgba(246,246,241,0.7)]">{metric.label}</div>
          </div>
        ))}
      </div>

      {/* Top Drop-off Points */}
      {behavior.topDropoffPoints && behavior.topDropoffPoints.length > 0 && (
        <div>
          <h3 className="font-display text-lg font-semibold text-[#C6F833] mb-4">Top Drop-off Points</h3>
          <div className="space-y-3">
            {behavior.topDropoffPoints.map((point) => (
              <div
                key={point.contentId}
                className="flex items-center gap-4 p-4 bg-[rgba(198,248,51,0.12)] rounded-lg hover:bg-[rgba(198,248,51,0.2)] transition-all"
              >
                <div className="flex-1">
                  <div className="text-[#F6F6F1] font-semibold">{point.contentTitle}</div>
                  <div className="text-sm text-[rgba(246,246,241,0.7)]">
                    at {Math.floor(point.timestamp / 60)}:{(point.timestamp % 60).toString().padStart(2, '0')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[#C6F833] font-bold">
                    {point.dropoffPercentage.toFixed(1)}%
                  </div>
                  <div className="text-xs text-[rgba(246,246,241,0.7)]">drop-off</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
