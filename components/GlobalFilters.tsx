'use client';

import { useState } from 'react';
import { AnalyticsFilters } from '../lib/types';
import { format, subDays, subMonths } from 'date-fns';

interface GlobalFiltersProps {
  filters: AnalyticsFilters;
  onFilterChange: (filters: Partial<AnalyticsFilters>) => void;
}

export default function GlobalFilters({ filters, onFilterChange }: GlobalFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const quickDateRanges = [
    { label: 'Last 24 Hours', days: 1 },
    { label: 'Last 7 Days', days: 7 },
    { label: 'Last 30 Days', days: 30 },
    { label: 'Last 90 Days', days: 90 },
  ];

  const handleQuickDate = (days: number) => {
    const end = new Date();
    const start = subDays(end, days);
    onFilterChange({
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
    });
  };

  return (
    <div className="bg-[#0A0A0A] border-2 border-[#0A0A0A] rounded-2xl p-4 sm:p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg font-semibold text-[#C6F833]">Filters</h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-[#C6F833] hover:text-[#D8FF5E] transition-colors text-sm flex items-center gap-2"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced
          <svg
            className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Quick Date Ranges */}
      <div className="mb-6">
        <label className="text-sm text-[rgba(246,246,241,0.7)] mb-2 block">Date Range</label>
        <div className="flex flex-wrap gap-2">
          {quickDateRanges.map((range) => (
            <button
              key={range.label}
              onClick={() => handleQuickDate(range.days)}
              className="px-4 py-2 bg-[#C6F833] text-[#0A0A0A] border-2 border-[#0A0A0A] rounded-lg hover:bg-[#D8FF5E] transition-all"
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[rgba(246,246,241,0.2)]">
          {/* Platform Filter */}
          <div>
            <label className="text-sm text-[rgba(246,246,241,0.7)] mb-2 block">Platform</label>
            <select
              className="w-full px-4 py-2 bg-[rgba(198,248,51,0.12)] text-[#F6F6F1] rounded-lg border-2 border-[rgba(246,246,241,0.2)] focus:border-[#C6F833] focus:outline-none"
              onChange={(e) => {
                const value = e.target.value;
                onFilterChange({
                  platforms: value
                    ? [value as 'tv' | 'mobile' | 'web']
                    : undefined,
                });
              }}
            >
              <option value="">All Platforms</option>
              <option value="tv">TV</option>
              <option value="mobile">Mobile</option>
              <option value="web">Web</option>
            </select>
          </div>

          {/* Country Filter */}
          <div>
            <label className="text-sm text-[rgba(246,246,241,0.7)] mb-2 block">Country</label>
            <select
              className="w-full px-4 py-2 bg-[rgba(198,248,51,0.12)] text-[#F6F6F1] rounded-lg border-2 border-[rgba(246,246,241,0.2)] focus:border-[#C6F833] focus:outline-none"
              onChange={(e) => {
                const value = e.target.value;
                onFilterChange({
                  countries: value ? [value] : undefined,
                });
              }}
            >
              <option value="">All Countries</option>
              <option value="GB">United Kingdom</option>
              <option value="US">United States</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="CA">Canada</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                onFilterChange({
                  dateRange: {
                    start: subDays(new Date(), 30).toISOString(),
                    end: new Date().toISOString(),
                  },
                  platforms: undefined,
                  countries: undefined,
                  channelIds: undefined,
                  creatorIds: undefined,
                  studioIds: undefined,
                });
              }}
              className="w-full px-4 py-2 bg-[#0A0A0A] text-[#C6F833] border-2 border-[#C6F833] rounded-lg hover:bg-[rgba(198,248,51,0.12)] transition-all"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
