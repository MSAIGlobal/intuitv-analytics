'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { analyticsClient } from '../lib/analyticsClient';
import { PlatformBreakdown, AnalyticsFilters } from '../lib/types';
import Reveal from './Reveal';

const BRAND = '#C6F833';
const BRAND_BRIGHT = '#D8FF5E';
const BRAND_DEEP = '#9BD600';
const INK = '#0A0A0A';
const PAPER = '#F6F6F1';

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

  const platformColors = {
    tv: BRAND,
    mobile: BRAND_BRIGHT,
    web: BRAND_DEEP,
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
    <Reveal>
      <div className="bg-[#0A0A0A] border-2 border-[#0A0A0A] rounded-2xl p-6 shadow-xl">
        <div className="mb-6">
          <h2 className="font-display text-2xl text-[#C6F833] mb-1">Platform & Device Analytics</h2>
          <p className="text-[rgba(246,246,241,0.7)]">TV, Mobile, and Web distribution</p>
        </div>

        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C6F833]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Platform Distribution Pie Chart */}
            <div>
              <h3 className="font-display text-lg text-[#C6F833] mb-4">Platform Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill={BRAND}
                    dataKey="value"
                    stroke={INK}
                    strokeWidth={2}
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
                      backgroundColor: INK,
                      border: `2px solid ${BRAND}`,
                      borderRadius: '8px',
                      color: PAPER,
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
                    className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedPlatform === platform.platform
                        ? 'bg-[#C6F833] border-[#0A0A0A] text-[#0A0A0A]'
                        : 'bg-[rgba(198,248,51,0.12)] border-transparent hover:bg-[rgba(198,248,51,0.2)] text-[#F6F6F1]'
                    }`}
                  >
                    <div className={`text-sm uppercase mb-1 ${
                      selectedPlatform === platform.platform ? 'text-[#0A0A0A]' : 'text-[rgba(246,246,241,0.7)]'
                    }`}>
                      {platform.platform}
                    </div>
                    <div className="font-display text-lg">
                      {formatNumber(platform.views)}
                    </div>
                    <div className={`text-xs ${
                      selectedPlatform === platform.platform ? 'text-[rgba(10,10,10,0.7)]' : 'text-[rgba(246,246,241,0.7)]'
                    }`}>views</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Device Breakdown for Selected Platform */}
            <div>
              <h3 className="font-display text-lg text-[#C6F833] mb-4">
                {selectedPlatform.toUpperCase()} Devices
              </h3>
              {selectedPlatformData && (
                <div className="space-y-3">
                  {selectedPlatformData.devices.map((device) => (
                    <div
                      key={device.deviceType}
                      className="p-4 bg-[rgba(198,248,51,0.12)] rounded-lg hover:bg-[rgba(198,248,51,0.2)] transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-[#F6F6F1] font-semibold">
                            {device.deviceType.replace(/_/g, ' ').toUpperCase()}
                          </div>
                          {device.os && (
                            <div className="text-sm text-[rgba(246,246,241,0.7)]">{device.os}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-[#C6F833] font-bold">
                            {formatNumber(device.count)}
                          </div>
                          <div className="text-xs text-[rgba(246,246,241,0.7)]">viewers</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-2">
                        <div className="h-2 bg-[rgba(246,246,241,0.2)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#C6F833]"
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
                        <span className="text-[rgba(246,246,241,0.7)]">Avg Watch Time:</span>
                        <span className="text-[#F6F6F1] font-semibold">
                          {device.avgWatchTime.toFixed(1)} min
                        </span>
                      </div>

                      {device.appVersion && (
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-[rgba(246,246,241,0.7)]">App Version:</span>
                          <span className="text-[#F6F6F1]">{device.appVersion}</span>
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
    </Reveal>
  );
}
