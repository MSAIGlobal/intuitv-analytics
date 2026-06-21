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
    <div className="bg-[#0A0A0A] border-2 border-[#0A0A0A] rounded-2xl p-4 sm:p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#C6F833] mb-1">Top Channels</h2>
          <p className="text-[rgba(246,246,241,0.7)]">By watch time and views</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setMetric('watchTime')}
            className={`px-4 py-2 rounded-lg border-2 border-[#0A0A0A] transition-all ${
              metric === 'watchTime'
                ? 'bg-[#0A0A0A] text-[#C6F833]'
                : 'bg-[#C6F833] text-[#0A0A0A] hover:bg-[#D8FF5E]'
            }`}
          >
            Watch Time
          </button>
          <button
            onClick={() => setMetric('views')}
            className={`px-4 py-2 rounded-lg border-2 border-[#0A0A0A] transition-all ${
              metric === 'views'
                ? 'bg-[#0A0A0A] text-[#C6F833]'
                : 'bg-[#C6F833] text-[#0A0A0A] hover:bg-[#D8FF5E]'
            }`}
          >
            Views
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-[rgba(198,248,51,0.12)] rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {rankings.map((channel, index) => (
            <div
              key={channel.channelId}
              className="flex items-center gap-4 p-4 bg-[rgba(198,248,51,0.12)] rounded-lg hover:bg-[rgba(198,248,51,0.2)] transition-all group"
            >
              {/* Rank */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  index === 0
                    ? 'bg-[#C6F833] text-[#0A0A0A]'
                    : index === 1
                    ? 'bg-[#D8FF5E] text-[#0A0A0A]'
                    : index === 2
                    ? 'bg-[#9BD600] text-[#0A0A0A]'
                    : 'bg-[rgba(246,246,241,0.2)] text-[#F6F6F1]'
                }`}
              >
                {index + 1}
              </div>

              {/* Channel Info */}
              <div className="flex-1 min-w-0">
                <div className="text-[#F6F6F1] font-semibold truncate group-hover:text-[#C6F833] transition-colors">
                  {channel.channelName}
                </div>
                {channel.creatorName && (
                  <div className="text-sm text-[rgba(246,246,241,0.7)]">{channel.creatorName}</div>
                )}
              </div>

              {/* Metrics */}
              <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                <div className="text-right">
                  <div className="text-[#F6F6F1] font-bold">
                    {formatNumber(metric === 'watchTime' ? channel.watchTime : channel.views)}
                  </div>
                  <div className="text-xs text-[rgba(246,246,241,0.7)]">
                    {metric === 'watchTime' ? 'hours' : 'views'}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="hidden sm:block w-20 md:w-32">
                  <div className="h-2 bg-[rgba(246,246,241,0.2)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#C6F833]"
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
