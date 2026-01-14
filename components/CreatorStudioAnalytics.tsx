'use client';

import { useState, useEffect } from 'react';
import { analyticsClient } from '../lib/analyticsClient';
import { CreatorAnalytics, StudioAnalytics, AnalyticsFilters } from '../lib/types';

interface CreatorStudioAnalyticsProps {
  filters: AnalyticsFilters;
  refreshKey: number;
}

export default function CreatorStudioAnalytics({ filters, refreshKey }: CreatorStudioAnalyticsProps) {
  const [creators, setCreators] = useState<CreatorAnalytics[]>([]);
  const [studios, setStudios] = useState<StudioAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'creators' | 'studios'>('creators');

  useEffect(() => {
    loadData();
  }, [filters, refreshKey, view]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (view === 'creators') {
        const creatorData = await analyticsClient.getCreatorAnalytics(filters, 15);
        setCreators(creatorData);
      } else {
        const studioData = await analyticsClient.getStudioAnalytics(filters, 15);
        setStudios(studioData);
      }
    } catch (error) {
      console.error('Failed to load creator/studio analytics:', error);
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
          <h2 className="text-2xl font-bold text-white mb-1">
            {view === 'creators' ? 'Creator' : 'Studio'} Analytics
          </h2>
          <p className="text-blue-300">Performance by creator and studio</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('creators')}
            className={`px-4 py-2 rounded-lg transition-all ${
              view === 'creators'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-blue-300 hover:bg-slate-600'
            }`}
          >
            Creators
          </button>
          <button
            onClick={() => setView('studios')}
            className={`px-4 py-2 rounded-lg transition-all ${
              view === 'studios'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-blue-300 hover:bg-slate-600'
            }`}
          >
            Studios
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-700/50 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : view === 'creators' ? (
        <div className="space-y-3">
          {creators.map((creator, index) => (
            <div
              key={creator.creatorId}
              className="p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Rank */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 text-white flex items-center justify-center font-bold">
                  {index + 1}
                </div>

                {/* Creator Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-lg mb-1">
                    {creator.creatorName}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-blue-300">Views</div>
                      <div className="text-white font-semibold">
                        {formatNumber(creator.views)}
                      </div>
                    </div>
                    <div>
                      <div className="text-blue-300">Watch Time</div>
                      <div className="text-white font-semibold">
                        {formatNumber(creator.watchTime)}h
                      </div>
                    </div>
                    <div>
                      <div className="text-blue-300">Growth</div>
                      <div
                        className={`font-semibold ${
                          creator.channelGrowth >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {creator.channelGrowth >= 0 ? '+' : ''}
                        {creator.channelGrowth}%
                      </div>
                    </div>
                    <div>
                      <div className="text-blue-300">Performance</div>
                      <div className="text-white font-semibold">
                        {creator.avgPerformance}%
                      </div>
                    </div>
                  </div>

                  {/* AI vs Uploaded Content */}
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-blue-300">AI Generated:</span>
                      <span className="text-white font-semibold">
                        {creator.aiGeneratedContent}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                      <span className="text-blue-300">Uploaded:</span>
                      <span className="text-white font-semibold">
                        {creator.uploadedContent}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {studios.map((studio, index) => (
            <div
              key={studio.studioId}
              className="p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center font-bold">
                  {index + 1}
                </div>

                <div className="flex-1">
                  <div className="text-white font-semibold text-lg mb-2">
                    {studio.studioName}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                    <div>
                      <div className="text-blue-300">Views</div>
                      <div className="text-white font-semibold">
                        {formatNumber(studio.views)}
                      </div>
                    </div>
                    <div>
                      <div className="text-blue-300">Watch Time</div>
                      <div className="text-white font-semibold">
                        {formatNumber(studio.watchTime)}h
                      </div>
                    </div>
                    <div>
                      <div className="text-blue-300">Channels</div>
                      <div className="text-white font-semibold">{studio.channels}</div>
                    </div>
                  </div>

                  {/* Top Channels */}
                  {studio.topChannels && studio.topChannels.length > 0 && (
                    <div className="text-sm">
                      <div className="text-blue-300 mb-1">Top Channels:</div>
                      <div className="flex flex-wrap gap-2">
                        {studio.topChannels.slice(0, 3).map((channel) => (
                          <span
                            key={channel.channelId}
                            className="px-3 py-1 bg-slate-600/50 rounded-full text-white"
                          >
                            {channel.channelName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
