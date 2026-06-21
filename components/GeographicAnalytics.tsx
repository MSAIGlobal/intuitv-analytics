'use client';

import { useState, useEffect } from 'react';
import { analyticsClient } from '../lib/analyticsClient';
import { GeoData, StateData, AnalyticsFilters } from '../lib/types';

interface GeographicAnalyticsProps {
  filters: AnalyticsFilters;
  refreshKey: number;
}

export default function GeographicAnalytics({ filters, refreshKey }: GeographicAnalyticsProps) {
  const [geoData, setGeoData] = useState<GeoData[]>([]);
  const [stateData, setStateData] = useState<StateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>('US');
  const [view, setView] = useState<'world' | 'states'>('world');

  useEffect(() => {
    loadData();
  }, [filters, refreshKey, selectedCountry, view]);

  const loadData = async () => {
    setLoading(true);
    try {
      const countries = await analyticsClient.getGeoAnalytics(filters);
      setGeoData(countries);

      if (view === 'states') {
        const states = await analyticsClient.getStateAnalytics(selectedCountry, filters);
        setStateData(states);
      }
    } catch (error) {
      console.error('Failed to load geographic data:', error);
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
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#C6F833] mb-1">Geographic Distribution</h2>
          <p className="text-[rgba(246,246,241,0.7)]">Watch hours by country and region</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setView('world')}
            className={`px-4 py-2 rounded-lg border-2 border-[#0A0A0A] transition-all ${
              view === 'world'
                ? 'bg-[#0A0A0A] text-[#C6F833]'
                : 'bg-[#C6F833] text-[#0A0A0A] hover:bg-[#D8FF5E]'
            }`}
          >
            World Map
          </button>
          <button
            onClick={() => setView('states')}
            className={`px-4 py-2 rounded-lg border-2 border-[#0A0A0A] transition-all ${
              view === 'states'
                ? 'bg-[#0A0A0A] text-[#C6F833]'
                : 'bg-[#C6F833] text-[#0A0A0A] hover:bg-[#D8FF5E]'
            }`}
          >
            US States
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C6F833]"></div>
        </div>
      ) : (
        <>
          {view === 'world' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* World Map Placeholder */}
              <div className="bg-[rgba(198,248,51,0.12)] rounded-lg p-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🌍</div>
                  <p className="text-[rgba(246,246,241,0.7)]">World Map Visualization</p>
                  <p className="text-sm text-[rgba(246,246,241,0.7)] mt-2">
                    Integrate with Mapbox or similar for full map view
                  </p>
                </div>
              </div>

              {/* Country Rankings */}
              <div>
                <h3 className="font-display text-lg font-semibold text-[#C6F833] mb-4">Top Countries</h3>
                <div className="space-y-3">
                  {geoData.map((country, index) => (
                    <div
                      key={country.countryCode}
                      className="flex items-center gap-4 p-4 bg-[rgba(198,248,51,0.12)] rounded-lg hover:bg-[rgba(198,248,51,0.2)] transition-all"
                    >
                      <div className="text-2xl">{country.countryCode === 'GB' ? '🇬🇧' : country.countryCode === 'US' ? '🇺🇸' : country.countryCode === 'DE' ? '🇩🇪' : country.countryCode === 'FR' ? '🇫🇷' : country.countryCode === 'CA' ? '🇨🇦' : '🌍'}</div>
                      <div className="flex-1">
                        <div className="text-[#F6F6F1] font-semibold">{country.country}</div>
                        <div className="text-sm text-[rgba(246,246,241,0.7)]">
                          {formatNumber(country.uniqueViewers)} viewers
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[#F6F6F1] font-bold">
                          {formatNumber(country.watchHours)}
                        </div>
                        <div className="text-xs text-[rgba(246,246,241,0.7)]">hours</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* US Map Placeholder */}
              <div className="bg-[rgba(198,248,51,0.12)] rounded-lg p-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🇺🇸</div>
                  <p className="text-[rgba(246,246,241,0.7)]">US State Map Visualization</p>
                  <p className="text-sm text-[rgba(246,246,241,0.7)] mt-2">
                    Integrate with D3 or similar for choropleth map
                  </p>
                </div>
              </div>

              {/* State Rankings */}
              <div>
                <h3 className="font-display text-lg font-semibold text-[#C6F833] mb-4">Top US States</h3>
                <div className="space-y-3">
                  {stateData.map((state, index) => (
                    <div
                      key={state.stateCode}
                      className="flex items-center gap-4 p-4 bg-[rgba(198,248,51,0.12)] rounded-lg hover:bg-[rgba(198,248,51,0.2)] transition-all"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#C6F833] text-[#0A0A0A] flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-[#F6F6F1] font-semibold">{state.state}</div>
                        <div className="text-sm text-[rgba(246,246,241,0.7)]">{formatNumber(state.views)} views</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[#F6F6F1] font-bold">
                          {formatNumber(state.watchHours)}
                        </div>
                        <div className="text-xs text-[rgba(246,246,241,0.7)]">hours</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
