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
    <div className="bg-[#0A0A0A] border-2 border-[#0A0A0A] rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#C6F833] mb-1">
            {view === 'creators' ? 'Creator' : 'Studio'} Analytics
          </h2>
          <p className="text-[rgba(246,246,241,0.7)]">Performance by creator and studio</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('creators')}
            className={`px-4 py-2 rounded-lg border-2 border-[#0A0A0A] transition-all ${
              view === 'creators'
                ? 'bg-[#0A0A0A] text-[#C6F833]'
                : 'bg-[#C6F833] text-[#0A0A0A] hover:bg-[#D8FF5E]'
            }`}
          >
            Creators
          </button>
          <button
            onClick={() => setView('studios')}
            className={`px-4 py-2 rounded-lg border-2 border-[#0A0A0A] transition-all ${
              view === 'studios'
                ? 'bg-[#0A0A0A] text-[#C6F833]'
                : 'bg-[#C6F833] text-[#0A0A0A] hover:bg-[#D8FF5E]'
            }`}
          >
            Studios
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-24 bg-[rgba(198,248,51,0.12)] rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : view === 'creators' ? (
        <div className="space-y-3">
          {creators.map((creator, index) => (
            <div
              key={creator.creatorId}
              className="p-4 bg-[rgba(198,248,51,0.12)] rounded-lg hover:bg-[rgba(198,248,51,0.2)] transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Rank */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#C6F833] text-[#0A0A0A] flex items-center justify-center font-bold">
                  {index + 1}
                </div>

                {/* Creator Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-[#F6F6F1] font-semibold text-lg mb-1">
                    {creator.creatorName}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-[rgba(246,246,241,0.7)]">Views</div>
                      <div className="text-[#F6F6F1] font-semibold">
                        {formatNumber(creator.views)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[rgba(246,246,241,0.7)]">Watch Time</div>
                      <div className="text-[#F6F6F1] font-semibold">
                        {formatNumber(creator.watchTime)}h
                      </div>
                    </div>
                    <div>
                      <div className="text-[rgba(246,246,241,0.7)]">Growth</div>
                      <div
                        className={`font-semibold ${
                          creator.channelGrowth >= 0 ? 'text-[#C6F833]' : 'text-[#F6F6F1]'
                        }`}
                      >
                        {creator.channelGrowth >= 0 ? '+' : ''}
                        {creator.channelGrowth}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[rgba(246,246,241,0.7)]">Performance</div>
                      <div className="text-[#F6F6F1] font-semibold">
                        {creator.avgPerformance}%
                      </div>
                    </div>
                  </div>

                  {/* AI vs Uploaded Content */}
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#C6F833]"></div>
                      <span className="text-[rgba(246,246,241,0.7)]">AI Generated:</span>
                      <span className="text-[#F6F6F1] font-semibold">
                        {creator.aiGeneratedContent}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#D8FF5E]"></div>
                      <span className="text-[rgba(246,246,241,0.7)]">Uploaded:</span>
                      <span className="text-[#F6F6F1] font-semibold">
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
              className="p-4 bg-[rgba(198,248,51,0.12)] rounded-lg hover:bg-[rgba(198,248,51,0.2)] transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#9BD600] text-[#0A0A0A] flex items-center justify-center font-bold">
                  {index + 1}
                </div>

                <div className="flex-1">
                  <div className="text-[#F6F6F1] font-semibold text-lg mb-2">
                    {studio.studioName}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                    <div>
                      <div className="text-[rgba(246,246,241,0.7)]">Views</div>
                      <div className="text-[#F6F6F1] font-semibold">
                        {formatNumber(studio.views)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[rgba(246,246,241,0.7)]">Watch Time</div>
                      <div className="text-[#F6F6F1] font-semibold">
                        {formatNumber(studio.watchTime)}h
                      </div>
                    </div>
                    <div>
                      <div className="text-[rgba(246,246,241,0.7)]">Channels</div>
                      <div className="text-[#F6F6F1] font-semibold">{studio.channels}</div>
                    </div>
                  </div>

                  {/* Top Channels */}
                  {studio.topChannels && studio.topChannels.length > 0 && (
                    <div className="text-sm">
                      <div className="text-[rgba(246,246,241,0.7)] mb-1">Top Channels:</div>
                      <div className="flex flex-wrap gap-2">
                        {studio.topChannels.slice(0, 3).map((channel) => (
                          <span
                            key={channel.channelId}
                            className="px-3 py-1 bg-[rgba(246,246,241,0.2)] rounded-full text-[#F6F6F1]"
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
