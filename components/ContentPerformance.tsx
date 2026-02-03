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
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!stats || stats.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Content Performance Analytics
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {stats.length} data points • Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-2">
          {['24h', '7d', '30d', '90d', 'all'].map((tf) => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTimeframe === tf
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Views"
          value={totalViews.toLocaleString()}
          icon="👁️"
          trend="+12%"
        />
        <StatCard
          title="Avg Engagement"
          value={`${(avgEngagement * 100).toFixed(1)}%`}
          icon="💥"
          trend="+8%"
        />
        <StatCard
          title="Avg Watch Time"
          value={`${avgWatchTime.toFixed(1)}m`}
          icon="⏱️"
          trend="+5%"
        />
        <StatCard
          title="Completion Rate"
          value={`${(avgCompletionRate * 100).toFixed(1)}%`}
          icon="✅"
          trend="+3%"
        />
      </div>

      {/* Views Over Time Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold mb-4">Views Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={stats}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00AEFF" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#00AEFF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="date" 
              stroke="#666"
            />
            <YAxis stroke="#666" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: 'none', 
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="views" 
              stroke="#00AEFF" 
              fillOpacity={1} 
              fill="url(#colorViews)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Over Time */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">Engagement Rate</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: any) => `${(value * 100).toFixed(1)}%`}
              />
              <Line 
                type="monotone" 
                dataKey="engagement" 
                stroke="#00AEFF" 
                strokeWidth={2}
                dot={{ fill: '#00AEFF' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Watch Time Analysis */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">Average Watch Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: any) => `${value.toFixed(1)}m`}
              />
              <Bar dataKey="avg_watch_time" fill="#00AEFF" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Completion Rate Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold mb-4">Completion Rate Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={stats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: 'none', 
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value: any) => `${(value * 100).toFixed(1)}%`}
            />
            <Line 
              type="monotone" 
              dataKey="completion_rate" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: string;
  trend?: string;
}> = ({ title, value, icon, trend }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
      <span className="text-2xl">{icon}</span>
    </div>
    <div className="flex items-end justify-between">
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      {trend && (
        <span className={`text-sm font-medium ${
          trend.startsWith('+') ? 'text-green-500' : 'text-red-500'
        }`}>
          {trend}
        </span>
      )}
    </div>
  </div>
);
