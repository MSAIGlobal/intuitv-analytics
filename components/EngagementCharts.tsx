
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
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Engagement Analytics
        </h2>
        <div className="flex gap-2">
          {['24h', '7d', '30d'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeframe === tf
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
              }`}
            >
              {tf === '24h' ? '24 Hours' : tf === '7d' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Hourly Engagement Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold mb-4">Hourly Activity</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={overview.hourly_data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="hour" 
              stroke="#666"
              label={{ value: 'Hour', position: 'insideBottom', offset: -5 }}
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
            <Legend />
            <Line 
              type="monotone" 
              dataKey="views" 
              stroke="#00AEFF" 
              strokeWidth={2}
              name="Views"
              dot={{ fill: '#00AEFF' }}
            />
            <Line 
              type="monotone" 
              dataKey="sessions" 
              stroke="#10B981" 
              strokeWidth={2}
              name="Sessions"
              dot={{ fill: '#10B981' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">Viewers by Device</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deviceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis type="number" stroke="#666" />
              <YAxis dataKey="device" type="category" stroke="#666" width={100} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="viewers" fill="#00AEFF" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">Viewers by Platform</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={platformData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="platform" stroke="#666" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="viewers" fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Event Type Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold mb-4">Event Distribution</h3>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={engagementByType}>
            <PolarGrid stroke="#333" />
            <PolarAngleAxis dataKey="type" stroke="#666" />
            <PolarRadiusAxis stroke="#666" />
            <Radar 
              name="Events" 
              dataKey="events" 
              stroke="#00AEFF" 
              fill="#00AEFF" 
              fillOpacity={0.6} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: 'none', 
                borderRadius: '8px',
                color: '#fff'
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Views"
          value={overview.summary.total_views.toLocaleString()}
          change="+12.5%"
          positive={true}
        />
        <MetricCard
          title="Unique Viewers"
          value={overview.summary.unique_viewers.toLocaleString()}
          change="+8.3%"
          positive={true}
        />
        <MetricCard
          title="Watch Hours"
          value={overview.summary.total_watch_hours.toLocaleString()}
          change="+15.7%"
          positive={true}
        />
        <MetricCard
          title="Completion Rate"
          value={`${overview.summary.completion_rate_percentage.toFixed(1)}%`}
          change="-2.1%"
          positive={false}
        />
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
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
    <div className="flex items-baseline justify-between">
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <span className={`text-sm font-medium ${
        positive ? 'text-green-500' : 'text-red-500'
      }`}>
        {change}
      </span>
    </div>
  </div>
);
