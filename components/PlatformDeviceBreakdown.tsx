'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { analyticsClient } from '../lib/analyticsClient';
import { PlatformBreakdown, AnalyticsFilters } from '../lib/types';

interface PlatformDeviceBreakdownProps {
  filters: AnalyticsFilters;
  refreshKey: number;
}

export default function PlatformDeviceBreakdown({ filters, refreshKey }: PlatformDeviceBreakdownProps) {
  const [platforms, setPlatforms] = useState<PlatformBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<'tv' | 'mobile' | 'web'>('tv');

  useEffect(() => {
    loadData();
  }, [filters, refreshKey]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await analyticsClient.getPlatformBreakdown(filters);
      setPlatforms(data);
    } catch (error) {
      console.error('Failed to load platform breakdown:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  const platformColors = {
    tv: '#3b82f6',
    mobile: '#06b6d4',
    web: '#8b5cf6',
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const platformData = platforms.map((p) => ({
    name: p.platform.toUpperCase(),
    value: p.views,
    platform: p.platform,
  }));

  const selectedPlatformData = platforms.find((p) => p.platform === selectedPlatform);

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/50 backdrop-blur-sm border border-blue-700/30 rounded-xl p-6 shadow-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Platform & Device Analytics</h2>
        <p className="text-blue-300">TV, Mobile, and Web distribution</p>
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Platform Distribution Pie Chart */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Platform Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {platformData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={platformColors[entry.platform as keyof typeof platformColors]}
                      onClick={() => setSelectedPlatform(entry.platform as any)}
                      className="cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #3b82f6',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Platform Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {platforms.map((platform) => (
                <button
                  key={platform.platform}
                  onClick={() => setSelectedPlatform(platform.platform)}
                  className={`p-4 rounded-lg transition-all ${
                    selectedPlatform === platform.platform
                      ? 'bg-blue-600 border-2 border-blue-400'
                      : 'bg-slate-700/30 hover:bg-slate-700/50'
                  }`}
                >
                  <div className="text-sm text-blue-300 uppercase mb-1">
                    {platform.platform}
                  </div>
                  <div className="text-lg font-bold text-white">
                    {formatNumber(platform.views)}
                  </div>
                  <div className="text-xs text-blue-300">views</div>
                </button>
              ))}
            </div>
          </div>

          {/* Device Breakdown for Selected Platform */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              {selectedPlatform.toUpperCase()} Devices
            </h3>
            {selectedPlatformData && (
              <div className="space-y-3">
                {selectedPlatformData.devices.map((device, index) => (
                  <div
                    key={device.deviceType}
                    className="p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-white font-semibold">
                          {device.deviceType.replace(/_/g, ' ').toUpperCase()}
                        </div>
                        {device.os && (
                          <div className="text-sm text-blue-300">{device.os}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">
                          {formatNumber(device.count)}
                        </div>
                        <div className="text-xs text-blue-300">viewers</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-2">
                      <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                          style={{
                            width: `${
                              (device.count /
                                Math.max(
                                  ...selectedPlatformData.devices.map((d) => d.count)
                                )) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Average Watch Time */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-300">Avg Watch Time:</span>
                      <span className="text-white font-semibold">
                        {device.avgWatchTime.toFixed(1)} min
                      </span>
                    </div>

                    {device.appVersion && (
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-blue-300">App Version:</span>
                        <span className="text-white">{device.appVersion}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
