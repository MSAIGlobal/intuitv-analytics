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
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/50 backdrop-blur-sm border border-blue-700/30 rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Geographic Distribution</h2>
          <p className="text-blue-300">Watch hours by country and region</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('world')}
            className={`px-4 py-2 rounded-lg transition-all ${
              view === 'world'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-blue-300 hover:bg-slate-600'
            }`}
          >
            World Map
          </button>
          <button
            onClick={() => setView('states')}
            className={`px-4 py-2 rounded-lg transition-all ${
              view === 'states'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-blue-300 hover:bg-slate-600'
            }`}
          >
            US States
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {view === 'world' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* World Map Placeholder */}
              <div className="bg-slate-700/30 rounded-lg p-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🌍</div>
                  <p className="text-blue-300">World Map Visualization</p>
                  <p className="text-sm text-slate-400 mt-2">
                    Integrate with Mapbox or similar for full map view
                  </p>
                </div>
              </div>

              {/* Country Rankings */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Top Countries</h3>
                <div className="space-y-3">
                  {geoData.map((country, index) => (
                    <div
                      key={country.countryCode}
                      className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all"
                    >
                      <div className="text-2xl">{country.countryCode === 'GB' ? '🇬🇧' : country.countryCode === 'US' ? '🇺🇸' : country.countryCode === 'DE' ? '🇩🇪' : country.countryCode === 'FR' ? '🇫🇷' : country.countryCode === 'CA' ? '🇨🇦' : '🌍'}</div>
                      <div className="flex-1">
                        <div className="text-white font-semibold">{country.country}</div>
                        <div className="text-sm text-blue-300">
                          {formatNumber(country.uniqueViewers)} viewers
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">
                          {formatNumber(country.watchHours)}
                        </div>
                        <div className="text-xs text-blue-300">hours</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* US Map Placeholder */}
              <div className="bg-slate-700/30 rounded-lg p-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🇺🇸</div>
                  <p className="text-blue-300">US State Map Visualization</p>
                  <p className="text-sm text-slate-400 mt-2">
                    Integrate with D3 or similar for choropleth map
                  </p>
                </div>
              </div>

              {/* State Rankings */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Top US States</h3>
                <div className="space-y-3">
                  {stateData.map((state, index) => (
                    <div
                      key={state.stateCode}
                      className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-semibold">{state.state}</div>
                        <div className="text-sm text-blue-300">{formatNumber(state.views)} views</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">
                          {formatNumber(state.watchHours)}
                        </div>
                        <div className="text-xs text-blue-300">hours</div>
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
