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
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { analyticsClient } from '@/shared/api/analyticsClient';
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

export const EngagementCharts: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('7d');
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await analyticsClient.getOverview(timeframe);
        setOverview(data);
      } catch (error) {
        console.error('Failed to fetch engagement data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeframe]);

  if (loading || !overview) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#C6F833]"></div>
      </div>
    );
  }

  // Prepare data for charts
  const deviceData = Object.entries(overview.distribution.devices).map(([device, count]) => ({
    device: device.charAt(0).toUpperCase() + device.slice(1),
    viewers: count
  }));

  const platformData = Object.entries(overview.distribution.platforms).map(([platform, count]) => ({
    platform: platform.replace('_', ' ').toUpperCase(),
    viewers: count
  }));

  const engagementByType = Object.entries(overview.engagement.events_by_type).map(([type, count]) => ({
    type: type.replace('_', ' '),
    events: count
  }));

  return (
    <div className="space-y-6">
      {/* Timeframe Selector */}
      <Reveal>
        <div className="flex justify-between items-center">
          <h2 className="font-display text-3xl text-[#0A0A0A]">
            Engagement Analytics
          </h2>
          <div className="flex gap-2">
            {['24h', '7d', '30d'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf as any)}
                className={`px-4 py-2 rounded-lg font-bold border-2 border-[#0A0A0A] transition-all hover:scale-105 ${
                  timeframe === tf
                    ? 'bg-[#0A0A0A] text-[#C6F833]'
                    : 'bg-[#C6F833] text-[#0A0A0A] hover:bg-[#D8FF5E]'
                }`}
              >
                {tf === '24h' ? '24 Hours' : tf === '7d' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Hourly Engagement Chart */}
      <Reveal>
        <div className="bg-[#0A0A0A] border-2 border-[#0A0A0A] rounded-2xl p-6 shadow-xl">
          <h3 className="font-display text-2xl text-[#C6F833] mb-4">Hourly Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={overview.hourly_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(246,246,241,0.12)" />
              <XAxis
                dataKey="hour"
                stroke="rgba(246,246,241,0.6)"
                label={{ value: 'Hour', position: 'insideBottom', offset: -5, fill: 'rgba(246,246,241,0.6)' }}
              />
              <YAxis stroke="rgba(246,246,241,0.6)" />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend />
              <Line
                type="monotone"
                dataKey="views"
                stroke={BRAND}
                strokeWidth={2}
                name="Views"
                dot={{ fill: BRAND }}
              />
              <Line
                type="monotone"
                dataKey="sessions"
                stroke={PAPER}
                strokeWidth={2}
                name="Sessions"
                dot={{ fill: PAPER }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Distribution */}
        <Reveal>
          <div className="bg-[#0A0A0A] border-2 border-[#0A0A0A] rounded-2xl p-6 shadow-xl">
            <h3 className="font-display text-2xl text-[#C6F833] mb-4">Viewers by Device</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deviceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(246,246,241,0.12)" />
                <XAxis type="number" stroke="rgba(246,246,241,0.6)" />
                <YAxis dataKey="device" type="category" stroke="rgba(246,246,241,0.6)" width={100} />
                <Tooltip cursor={{ fill: 'rgba(198,248,51,0.12)' }} contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="viewers" fill={BRAND} radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Reveal>

        {/* Platform Distribution */}
        <Reveal delay={80}>
          <div className="bg-[#0A0A0A] border-2 border-[#0A0A0A] rounded-2xl p-6 shadow-xl">
            <h3 className="font-display text-2xl text-[#C6F833] mb-4">Viewers by Platform</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(246,246,241,0.12)" />
                <XAxis dataKey="platform" stroke="rgba(246,246,241,0.6)" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="rgba(246,246,241,0.6)" />
                <Tooltip cursor={{ fill: 'rgba(198,248,51,0.12)' }} contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="viewers" fill={BRAND_BRIGHT} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Reveal>
      </div>

      {/* Event Type Distribution */}
      <Reveal>
        <div className="bg-[#0A0A0A] border-2 border-[#0A0A0A] rounded-2xl p-6 shadow-xl">
          <h3 className="font-display text-2xl text-[#C6F833] mb-4">Event Distribution</h3>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={engagementByType}>
              <PolarGrid stroke="rgba(246,246,241,0.2)" />
              <PolarAngleAxis dataKey="type" stroke="rgba(246,246,241,0.6)" />
              <PolarRadiusAxis stroke="rgba(246,246,241,0.4)" />
              <Radar
                name="Events"
                dataKey="events"
                stroke={BRAND}
                fill={BRAND}
                fillOpacity={0.5}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Reveal>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Views', value: overview.summary.total_views.toLocaleString(), change: '+12.5%', positive: true },
          { title: 'Unique Viewers', value: overview.summary.unique_viewers.toLocaleString(), change: '+8.3%', positive: true },
          { title: 'Watch Hours', value: overview.summary.total_watch_hours.toLocaleString(), change: '+15.7%', positive: true },
          { title: 'Completion Rate', value: `${overview.summary.completion_rate_percentage.toFixed(1)}%`, change: '-2.1%', positive: false },
        ].map((m, i) => (
          <Reveal key={m.title} delay={i * 70}>
            <MetricCard title={m.title} value={m.value} change={m.change} positive={m.positive} />
          </Reveal>
        ))}
      </div>
    </div>
  );
};

const MetricCard: React.FC<{
  title: string;
  value: string;
  change: string;
  positive: boolean;
}> = ({ title, value, change, positive }) => (
  <div className="bg-[#0A0A0A] border-2 border-[#0A0A0A] rounded-2xl p-6 shadow-xl hover:border-[#C6F833] transition-all">
    <p className="text-sm text-[rgba(246,246,241,0.7)] mb-1">{title}</p>
    <div className="flex items-baseline justify-between">
      <p className="font-display text-2xl text-[#C6F833]">{value}</p>
      <span className={`text-sm font-bold ${
        positive ? 'text-[#C6F833]' : 'text-[#D8FF5E]'
      }`}>
        {change}
      </span>
    </div>
  </div>
);
