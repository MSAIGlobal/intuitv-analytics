'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analyticsClient } from '../lib/analyticsClient';
import { TimeSeriesData, AnalyticsFilters } from '../lib/types';
import { format, parseISO } from 'date-fns';
import Reveal from './Reveal';

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
      <div className="bg-[#0A0A0A] border-2 border-[#0A0A0A] rounded-2xl p-4 sm:p-6">
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C6F833]"></div>
        </div>
      </div>
    );
  }

  return (
    <Reveal>
    <div className="bg-[#0A0A0A] border-2 border-[#0A0A0A] rounded-2xl p-4 sm:p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#C6F833] mb-1">Performance Over Time</h2>
          <p className="text-[rgba(246,246,241,0.7)]">Views, watch time, and session activity</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setInterval('hour')}
            className={`px-4 py-2 rounded-lg border-2 border-[#0A0A0A] transition-all ${
              interval === 'hour'
                ? 'bg-[#0A0A0A] text-[#C6F833]'
                : 'bg-[#C6F833] text-[#0A0A0A] hover:bg-[#D8FF5E]'
            }`}
          >
            Hourly
          </button>
          <button
            onClick={() => setInterval('day')}
            className={`px-4 py-2 rounded-lg border-2 border-[#0A0A0A] transition-all ${
              interval === 'day'
                ? 'bg-[#0A0A0A] text-[#C6F833]'
                : 'bg-[#C6F833] text-[#0A0A0A] hover:bg-[#D8FF5E]'
            }`}
          >
            Daily
          </button>
        </div>
      </div>

      {/* Views Over Time */}
      <div className="mb-8">
        <h3 className="font-display text-lg font-semibold text-[#C6F833] mb-4">Views Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C6F833" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#C6F833" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(246,246,241,0.12)" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              stroke="rgba(246,246,241,0.6)"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="rgba(246,246,241,0.6)" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0A0A0A',
                border: '1px solid #C6F833',
                borderRadius: '8px',
                color: '#F6F6F1',
              }}
            />
            <Area
              type="monotone"
              dataKey="views"
              stroke="#C6F833"
              fillOpacity={1}
              fill="url(#colorViews)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Watch Time Over Time */}
      <div className="mb-8">
        <h3 className="font-display text-lg font-semibold text-[#C6F833] mb-4">Watch Time Over Time (hours)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorWatchTime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D8FF5E" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#D8FF5E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(246,246,241,0.12)" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              stroke="rgba(246,246,241,0.6)"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="rgba(246,246,241,0.6)" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0A0A0A',
                border: '1px solid #C6F833',
                borderRadius: '8px',
                color: '#F6F6F1',
              }}
            />
            <Area
              type="monotone"
              dataKey="watchTime"
              stroke="#D8FF5E"
              fillOpacity={1}
              fill="url(#colorWatchTime)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Session Starts vs Ends */}
      <div>
        <h3 className="font-display text-lg font-semibold text-[#C6F833] mb-4">Session Activity</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(246,246,241,0.12)" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              stroke="rgba(246,246,241,0.6)"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="rgba(246,246,241,0.6)" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0A0A0A',
                border: '1px solid #C6F833',
                borderRadius: '8px',
                color: '#F6F6F1',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="sessionStarts"
              stroke="#C6F833"
              strokeWidth={2}
              dot={false}
              name="Session Starts"
            />
            <Line
              type="monotone"
              dataKey="sessionEnds"
              stroke="#D8FF5E"
              strokeWidth={2}
              dot={false}
              name="Session Ends"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
    </Reveal>
  );
}
