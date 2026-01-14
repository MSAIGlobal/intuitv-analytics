'use client';

import { useState, useEffect } from 'react';
import { analyticsClient } from '../lib/analyticsClient';
import { ChannelRanking, AnalyticsFilters } from '../lib/types';

interface ChannelRankingsProps {
  filters: AnalyticsFilters;
  refreshKey: number;
}

export default function ChannelRankings({ filters, refreshKey }: ChannelRankingsProps) {
  const [rankings, setRankings] = useState<ChannelRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<'watchTime' | 'views'>('watchTime');

  useEffect(() => {
    loadRankings();
  }, [filters, refreshKey, metric]);

  const loadRankings = async () => {
    setLoading(true);
    try {
      const data = await analyticsClient.getChannelRankings(filters, metric, 10);
      setRankings(data);
    } catch (error) {
      console.error('Failed to load channel rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/50 backdrop-blur-sm border border-blue-700/30 rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Top Channels</h2>
          <p className="text-blue-300">By watch time and views</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMetric('watchTime')}
            className={`px-4 py-2 rounded-lg transition-all ${
              metric === 'watchTime'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-blue-300 hover:bg-slate-600'
            }`}
          >
            Watch Time
          </button>
          <button
            onClick={() => setMetric('views')}
            className={`px-4 py-2 rounded-lg transition-all ${
              metric === 'views'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-blue-300 hover:bg-slate-600'
            }`}
          >
            Views
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-700/50 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {rankings.map((channel, index) => (
            <div
              key={channel.channelId}
              className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all group"
            >
              {/* Rank */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  index === 0
                    ? 'bg-yellow-500 text-yellow-900'
                    : index === 1
                    ? 'bg-slate-400 text-slate-900'
                    : index === 2
                    ? 'bg-amber-600 text-amber-900'
                    : 'bg-slate-600 text-slate-200'
                }`}
              >
                {index + 1}
              </div>

              {/* Channel Info */}
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold truncate group-hover:text-blue-400 transition-colors">
                  {channel.channelName}
                </div>
                {channel.creatorName && (
                  <div className="text-sm text-blue-300">{channel.creatorName}</div>
                )}
              </div>

              {/* Metrics */}
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-white font-bold">
                    {formatNumber(metric === 'watchTime' ? channel.watchTime : channel.views)}
                  </div>
                  <div className="text-xs text-blue-300">
                    {metric === 'watchTime' ? 'hours' : 'views'}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-32">
                  <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                      style={{
                        width: `${
                          ((metric === 'watchTime' ? channel.watchTime : channel.views) /
                            Math.max(
                              ...rankings.map((r) =>
                                metric === 'watchTime' ? r.watchTime : r.views
                              )
                            )) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
