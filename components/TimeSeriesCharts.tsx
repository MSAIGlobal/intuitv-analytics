'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analyticsClient } from '../lib/analyticsClient';
import { TimeSeriesData, AnalyticsFilters } from '../lib/types';
import { format, parseISO } from 'date-fns';

interface TimeSeriesChartsProps {
  filters: AnalyticsFilters;
  refreshKey: number;
}

export default function TimeSeriesCharts({ filters, refreshKey }: TimeSeriesChartsProps) {
  const [data, setData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [interval, setInterval] = useState<'hour' | 'day'>('day');

  useEffect(() => {
    loadData();
  }, [filters, refreshKey, interval]);

  const loadData = async () => {
    setLoading(true);
    try {
      const timeSeriesData = await analyticsClient.getTimeSeriesData(filters, interval);
      setData(timeSeriesData);
    } catch (error) {
      console.error('Failed to load time series data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatXAxis = (timestamp: string) => {
    const date = parseISO(timestamp);
    return interval === 'hour' ? format(date, 'HH:mm') : format(date, 'MMM dd');
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-700/30 rounded-xl p-6">
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/50 backdrop-blur-sm border border-blue-700/30 rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Performance Over Time</h2>
          <p className="text-blue-300">Views, watch time, and session activity</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setInterval('hour')}
            className={`px-4 py-2 rounded-lg transition-all ${
              interval === 'hour'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-blue-300 hover:bg-slate-600'
            }`}
          >
            Hourly
          </button>
          <button
            onClick={() => setInterval('day')}
            className={`px-4 py-2 rounded-lg transition-all ${
              interval === 'day'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-blue-300 hover:bg-slate-600'
            }`}
          >
            Daily
          </button>
        </div>
      </div>

      {/* Views Over Time */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Views Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #3b82f6',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Area
              type="monotone"
              dataKey="views"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorViews)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Watch Time Over Time */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Watch Time Over Time (hours)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorWatchTime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #06b6d4',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Area
              type="monotone"
              dataKey="watchTime"
              stroke="#06b6d4"
              fillOpacity={1}
              fill="url(#colorWatchTime)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Session Starts vs Ends */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Session Activity</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #3b82f6',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="sessionStarts"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name="Session Starts"
            />
            <Line
              type="monotone"
              dataKey="sessionEnds"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              name="Session Ends"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
