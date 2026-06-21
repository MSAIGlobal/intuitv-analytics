'use client';

import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { analyticsClient, ContentStats } from '@/shared/api/analyticsClient';
import Reveal from './Reveal';

const BRAND = '#C6F833';
const BRAND_BRIGHT = '#D8FF5E';
const INK = '#0A0A0A';
const PAPER = '#F6F6F1';

const TOOLTIP_STYLE = {
  backgroundColor: INK,
  border: `2px solid ${BRAND}`,
  borderRadius: '8px',
  color: PAPER,
};

interface ContentPerformanceProps {
  contentId: number;
  timeframe?: '24h' | '7d' | '30d' | '90d' | 'all';
}

export const ContentPerformance: React.FC<ContentPerformanceProps> = ({
  contentId,
  timeframe = '7d'
}) => {
  const [stats, setStats] = useState<ContentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await analyticsClient.getContentStats(contentId, selectedTimeframe);
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch content stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [contentId, selectedTimeframe]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#C6F833]"></div>
      </div>
    );
  }

  if (!stats || stats.length === 0) {
    return (
      <div className="text-center p-8 text-[rgba(10,10,10,0.6)]">
        No performance data available
      </div>
    );
  }

  // Calculate summary metrics from stats array
  const totalViews = stats.reduce((sum, stat) => sum + stat.views, 0);
  const avgEngagement = stats.reduce((sum, stat) => sum + stat.engagement, 0) / stats.length;
  const avgCompletionRate = stats.reduce((sum, stat) => sum + stat.completion_rate, 0) / stats.length;
  const avgWatchTime = stats.reduce((sum, stat) => sum + stat.avg_watch_time, 0) / stats.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Reveal>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl text-[#0A0A0A]">
              Content Performance Analytics
            </h2>
            <p className="text-sm text-[rgba(10,10,10,0.65)]">
              {stats.length} data points • Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Timeframe Selector */}
          <div className="flex flex-wrap gap-2">
            {['24h', '7d', '30d', '90d', 'all'].map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf as any)}
                className={`px-4 py-2 rounded-lg font-bold border-2 border-[#0A0A0A] transition-all hover:scale-105 ${
                  selectedTimeframe === tf
                    ? 'bg-[#0A0A0A] text-[#C6F833]'
                    : 'bg-[#C6F833] text-[#0A0A0A] hover:bg-[#D8FF5E]'
                }`}
              >
                {tf === '24h' ? '24 Hours' :
                 tf === '7d' ? '7 Days' :
                 tf === '30d' ? '30 Days' :
                 tf === '90d' ? '90 Days' : 'All Time'}
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Views', value: totalViews.toLocaleString(), icon: '👁️', trend: '+12%' },
          { title: 'Avg Engagement', value: `${(avgEngagement * 100).toFixed(1)}%`, icon: '💥', trend: '+8%' },
          { title: 'Avg Watch Time', value: `${avgWatchTime.toFixed(1)}m`, icon: '⏱️', trend: '+5%' },
          { title: 'Completion Rate', value: `${(avgCompletionRate * 100).toFixed(1)}%`, icon: '✅', trend: '+3%' },
        ].map((c, i) => (
          <Reveal key={c.title} delay={i * 70}>
            <StatCard title={c.title} value={c.value} icon={c.icon} trend={c.trend} />
          </Reveal>
        ))}
      </div>

      {/* Views Over Time Chart */}
      <Reveal>
        <div className="bg-[#0A0A0A] border-2 border-[#0A0A0A] rounded-2xl p-4 sm:p-6 shadow-xl">
          <h3 className="font-display text-2xl text-[#C6F833] mb-4">Views Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats}>
              <defs>
                <linearGradient id="cpColorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={BRAND} stopOpacity={0.45}/>
                  <stop offset="95%" stopColor={BRAND} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(246,246,241,0.12)" />
              <XAxis dataKey="date" stroke="rgba(246,246,241,0.6)" />
              <YAxis stroke="rgba(246,246,241,0.6)" />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area
                type="monotone"
                dataKey="views"
                stroke={BRAND}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#cpColorViews)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Over Time */}
        <Reveal>
          <div className="bg-[#0A0A0A] border-2 border-[#0A0A0A] rounded-2xl p-4 sm:p-6 shadow-xl">
            <h3 className="font-display text-2xl text-[#C6F833] mb-4">Engagement Rate</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(246,246,241,0.12)" />
                <XAxis dataKey="date" stroke="rgba(246,246,241,0.6)" />
                <YAxis stroke="rgba(246,246,241,0.6)" />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(value: any) => `${(value * 100).toFixed(1)}%`}
                />
                <Line
                  type="monotone"
                  dataKey="engagement"
                  stroke={BRAND}
                  strokeWidth={2}
                  dot={{ fill: BRAND }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Reveal>

        {/* Watch Time Analysis */}
        <Reveal delay={80}>
          <div className="bg-[#0A0A0A] border-2 border-[#0A0A0A] rounded-2xl p-4 sm:p-6 shadow-xl">
            <h3 className="font-display text-2xl text-[#C6F833] mb-4">Average Watch Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(246,246,241,0.12)" />
                <XAxis dataKey="date" stroke="rgba(246,246,241,0.6)" />
                <YAxis stroke="rgba(246,246,241,0.6)" />
                <Tooltip
                  cursor={{ fill: 'rgba(198,248,51,0.12)' }}
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(value: any) => `${value.toFixed(1)}m`}
                />
                <Bar dataKey="avg_watch_time" fill={BRAND} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Reveal>
      </div>

      {/* Completion Rate Chart */}
      <Reveal>
        <div className="bg-[#0A0A0A] border-2 border-[#0A0A0A] rounded-2xl p-4 sm:p-6 shadow-xl">
          <h3 className="font-display text-2xl text-[#C6F833] mb-4">Completion Rate Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(246,246,241,0.12)" />
              <XAxis dataKey="date" stroke="rgba(246,246,241,0.6)" />
              <YAxis stroke="rgba(246,246,241,0.6)" />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value: any) => `${(value * 100).toFixed(1)}%`}
              />
              <Line
                type="monotone"
                dataKey="completion_rate"
                stroke={BRAND_BRIGHT}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Reveal>
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: string;
  trend?: string;
}> = ({ title, value, icon, trend }) => (
  <div className="bg-[#0A0A0A] border-2 border-[#0A0A0A] rounded-2xl p-4 sm:p-6 shadow-xl hover:border-[#C6F833] transition-all">
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm text-[rgba(246,246,241,0.7)]">{title}</p>
      <span className="text-2xl">{icon}</span>
    </div>
    <div className="flex items-end justify-between">
      <p className="font-display text-3xl text-[#C6F833]">{value}</p>
      {trend && (
        <span className={`text-sm font-bold ${
          trend.startsWith('+') ? 'text-[#C6F833]' : 'text-[#D8FF5E]'
        }`}>
          {trend}
        </span>
      )}
    </div>
  </div>
);
