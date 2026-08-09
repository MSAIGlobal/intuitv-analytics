'use client'

import { useState, useEffect, ReactNode, ReactElement, cloneElement } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  TrendingUp,
  Users,
  Eye,
  Clock,
  Play,
  Globe,
  AlertCircle,
  Search,
  RefreshCw,
  Bell
} from 'lucide-react'
import Image from 'next/image'
import Reveal from '../components/Reveal'

/* ============================================================================
   BRAND PALETTE — IntuiTV "BUILT DIFFERENT"
============================================================================ */

const BRAND = '#C6F833'        // neon lime
const BRAND_BRIGHT = '#D8FF5E' // lime bright
const BRAND_DEEP = '#9BD600'   // lime deep
const INK = '#0A0A0A'          // chunky black
const PAPER = '#F6F6F1'        // off-white
const INK_SOFT = '#3A3A33'     // muted ink for secondary text on lime
const LIME_FILL = 'rgba(198,248,51,0.12)' // subtle lime fill on black

// Categorical accents for charts/legends — kept legible on ink surfaces
const ACCENTS = [BRAND, BRAND_BRIGHT, PAPER, BRAND_DEEP, '#7AAB00', '#EAFFB0']

/* ============================================================================
   TYPES
============================================================================ */

interface AnalyticsOverview {
  totalViews: number
  totalWatchHours: number
  uniqueViewers: number
  avgSessionDuration: number
  concurrentStreams: number
  viewsTrend?: number
  watchHoursTrend?: number
  viewersTrend?: number
}

interface CreationStats {
  totalCreated: number
  aiGenerated: number
  scriptCount: number
  imageCount: number
  videoCount: number
  audioCount: number
  avgGenerationTime: number
}

interface PlatformData {
  platform: string
  count: number
  percentage: number
  watchHours?: number
}

interface GeoData {
  country: string
  count: number
  watchHours: number
  percentage: number
}

interface TimeSeriesPoint {
  timestamp: string
  views: number
  uniques: number
  watchHours: number
  concurrentStreams?: number
}

interface GPUMetrics {
  utilization: number
  memoryUsed: number
  memoryTotal: number
  temperature: number
  powerUsage: number
  activeJobs: number
}

interface ErrorMetrics {
  total: number
  critical: number
  warnings: number
  byType: Array<{ type: string; count: number }>
}

/* ============================================================================
   API CLIENT - ALL REAL DATA CONNECTIONS
============================================================================ */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class AnalyticsAPIClient {
  private async fetch<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`)
      if (!response.ok) {
        console.error(`API Error: ${endpoint} - ${response.statusText}`)
        throw new Error(response.statusText)
      }
      return response.json()
    } catch (error) {
      console.error(`Network Error: ${endpoint}`, error)
      throw error
    }
  }

  async getOverview(timeframe: string = '7d'): Promise<AnalyticsOverview> {
    return this.fetch<AnalyticsOverview>(`/api/analytics/overview?timeframe=${timeframe}`)
  }

  async getCreationStats(timeframe: string = '7d'): Promise<CreationStats> {
    return this.fetch<CreationStats>(`/api/analytics/creation?timeframe=${timeframe}`)
  }

  async getPlatformBreakdown(timeframe: string = '7d'): Promise<{ platforms: PlatformData[] }> {
    return this.fetch(`/api/analytics/platforms?timeframe=${timeframe}`)
  }

  async getGeoData(timeframe: string = '7d', limit: number = 10): Promise<{ countries: GeoData[] }> {
    return this.fetch(`/api/analytics/geo?timeframe=${timeframe}&limit=${limit}`)
  }

  async getTimeSeries(timeframe: string = '7d', interval: string = 'hour'): Promise<TimeSeriesPoint[]> {
    return this.fetch(`/api/analytics/timeseries?timeframe=${timeframe}&interval=${interval}`)
  }

  async getGPUMetrics(): Promise<GPUMetrics> {
    return this.fetch<GPUMetrics>('/api/metrics/gpu')
  }

  async getErrorMetrics(timeframe: string = '24h'): Promise<ErrorMetrics> {
    return this.fetch<ErrorMetrics>(`/api/errors/summary?timeframe=${timeframe}`)
  }
}

const api = new AnalyticsAPIClient()

/* ============================================================================
   MAIN DASHBOARD - ZERO DUMMY DATA
============================================================================ */

export default function AnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState('7d')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Data states - all start empty/zero
  const [overview, setOverview] = useState<AnalyticsOverview>({
    totalViews: 0,
    totalWatchHours: 0,
    uniqueViewers: 0,
    avgSessionDuration: 0,
    concurrentStreams: 0,
  })
  const [creationStats, setCreationStats] = useState<CreationStats>({
    totalCreated: 0,
    aiGenerated: 0,
    scriptCount: 0,
    imageCount: 0,
    videoCount: 0,
    audioCount: 0,
    avgGenerationTime: 0,
  })
  const [platformData, setPlatformData] = useState<PlatformData[]>([])
  const [geoData, setGeoData] = useState<GeoData[]>([])
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([])
  const [gpuMetrics, setGPUMetrics] = useState<GPUMetrics>({
    utilization: 0,
    memoryUsed: 0,
    memoryTotal: 100,
    temperature: 0,
    powerUsage: 0,
    activeJobs: 0,
  })
  const [errorMetrics, setErrorMetrics] = useState<ErrorMetrics>({
    total: 0,
    critical: 0,
    warnings: 0,
    byType: [],
  })

  useEffect(() => {
    loadAllData()
    
    // Set up real-time polling for live metrics
    const interval = setInterval(() => {
      loadGPUMetrics()
      loadOverview()
    }, 10000) // Update every 10 seconds
    
    return () => clearInterval(interval)
  }, [timeframe])

  const loadAllData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      await Promise.all([
        loadOverview(),
        loadCreationStats(),
        loadPlatformData(),
        loadGeoData(),
        loadTimeSeries(),
        loadGPUMetrics(),
        loadErrorMetrics(),
      ])
    } catch (err) {
      setError('Failed to load dashboard data. Please check API connection.')
      console.error('Dashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadOverview = async () => {
    try {
      const data = await api.getOverview(timeframe)
      setOverview(data)
    } catch (err) {
      console.error('Overview load error:', err)
    }
  }

  const loadCreationStats = async () => {
    try {
      const data = await api.getCreationStats(timeframe)
      setCreationStats(data)
    } catch (err) {
      console.error('Creation stats error:', err)
    }
  }

  const loadPlatformData = async () => {
    try {
      const data = await api.getPlatformBreakdown(timeframe)
      setPlatformData(data.platforms || [])
    } catch (err) {
      console.error('Platform data error:', err)
    }
  }

  const loadGeoData = async () => {
    try {
      const data = await api.getGeoData(timeframe)
      setGeoData(data.countries || [])
    } catch (err) {
      console.error('Geo data error:', err)
    }
  }

  const loadTimeSeries = async () => {
    try {
      const interval = timeframe === '24h' ? 'hour' : 'day'
      const data = await api.getTimeSeries(timeframe, interval)
      setTimeSeries(data || [])
    } catch (err) {
      console.error('Time series error:', err)
    }
  }

  const loadGPUMetrics = async () => {
    try {
      const data = await api.getGPUMetrics()
      setGPUMetrics(data)
    } catch (err) {
      console.error('GPU metrics error:', err)
    }
  }

  const loadErrorMetrics = async () => {
    try {
      const data = await api.getErrorMetrics('24h')
      setErrorMetrics(data)
    } catch (err) {
      console.error('Error metrics error:', err)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadAllData()
    setRefreshing(false)
  }

  if (loading && !overview.totalViews) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BRAND }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4"
               style={{ borderColor: INK, borderTopColor: 'transparent' }} />
          <p className="font-display text-2xl" style={{ color: INK }}>Loading analytics…</p>
        </div>
      </div>
    )
  }

return (
  <div className="min-h-screen" style={{ backgroundColor: BRAND }}>
    {/* Header */}
    <header
      className="sticky top-0 z-50 border-b-4"
      style={{ backgroundColor: BRAND, borderColor: INK }}
    >
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3">

        {/* Left: Logo + Title (clickable) */}
        <a
          href="https://mother.mediastreamai.com"
          className="flex items-center gap-3 sm:gap-4 transition-transform hover:scale-[1.02] min-w-0"
        >
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-lg overflow-hidden border-2" style={{ borderColor: INK, backgroundColor: INK }}>
            <Image
              src="/logo_icon.png"
              alt="MOTHER"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="hidden sm:block h-8 w-1 shrink-0" style={{ backgroundColor: INK }} />

          <h1 className="font-display text-xl sm:text-2xl md:text-3xl truncate" style={{ color: INK }}>
            Analytics Dashboard
          </h1>
        </a>

          {/* Right: Search + Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 sm:flex-none justify-end min-w-0">
            <div className="relative flex-1 sm:flex-none min-w-0">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: INK_SOFT }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search metrics..."
                className="pl-10 pr-4 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 w-full sm:w-[220px] lg:w-[280px]"
                style={{
                  backgroundColor: PAPER,
                  borderWidth: '2px',
                  borderColor: INK,
                  color: INK,
                }}
              />
            </div>

            <button
              aria-label="Notifications"
              className="relative shrink-0 p-2.5 rounded-lg border-2 transition-all hover:scale-105"
              style={{ backgroundColor: INK, borderColor: INK, color: BRAND }}
            >
              <Bell className="w-5 h-5" style={{ color: BRAND }} />
              {errorMetrics.critical > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center border-2"
                  style={{
                    backgroundColor: BRAND_BRIGHT,
                    color: INK,
                    borderColor: INK,
                  }}
                >
                  {errorMetrics.critical}
                </span>
              )}
            </button>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              aria-label="Refresh"
              className="shrink-0 p-2.5 rounded-lg border-2 transition-all hover:scale-105 disabled:opacity-50"
              style={{ backgroundColor: INK, borderColor: INK, color: BRAND }}
            >
              <RefreshCw
                className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
                style={{ color: BRAND }}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Marquee banner */}
      <div className="overflow-hidden border-b-4" style={{ backgroundColor: INK, borderColor: INK }}>
        <div className="marquee-track py-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="font-display text-base sm:text-lg md:text-xl px-4" style={{ color: BRAND }} aria-hidden={i === 1}>
              BUILT DIFFERENT&nbsp;•&nbsp;INTUITV&nbsp;•&nbsp;BUILT DIFFERENT&nbsp;•&nbsp;INTUITV&nbsp;•&nbsp;BUILT DIFFERENT&nbsp;•&nbsp;INTUITV&nbsp;•&nbsp;
            </span>
          ))}
        </div>
      </div>

      {error && (
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="p-4 rounded-lg flex items-center gap-3 border-2" style={{ backgroundColor: INK, borderColor: INK }}>
            <AlertCircle className="w-5 h-5" style={{ color: BRAND_BRIGHT }} />
            <span className="font-semibold" style={{ color: PAPER }}>{error}</span>
          </div>
        </div>
      )}

      {/* Title + Timeframe Selector */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-4">
        <Reveal>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-5 sm:mb-6" style={{ color: INK }}>
            Built Different.<br />The Numbers Prove It.
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <div className="flex flex-wrap gap-2">
            {['24h', '7d', '30d', '90d'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className="px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all hover:scale-105"
                style={{
                  backgroundColor: timeframe === tf ? INK : BRAND,
                  color: timeframe === tf ? BRAND : INK,
                  borderColor: INK,
                }}
              >
                {tf === '24h' ? 'Last 24 Hours' : tf === '7d' ? 'Last 7 Days' : tf === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
              </button>
            ))}
          </div>
        </Reveal>
      </div>

      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
          {[
            { title: 'Total Views', value: overview.totalViews, icon: <Eye />, trend: overview.viewsTrend },
            { title: 'Unique Viewers', value: overview.uniqueViewers, icon: <Users />, trend: overview.viewersTrend },
            { title: 'Watch Hours', value: overview.totalWatchHours, icon: <Clock />, format: 'hours' as const, trend: overview.watchHoursTrend },
            { title: 'Avg Session', value: overview.avgSessionDuration, icon: <Play />, format: 'minutes' as const },
            { title: 'Live Now', value: overview.concurrentStreams, icon: <Play />, pulse: true },
          ].map((k, i) => (
            <Reveal key={k.title} delay={i * 70}>
              <KPICard
                title={k.title}
                value={k.value}
                icon={k.icon}
                format={k.format}
                trend={k.trend}
                pulse={k.pulse}
              />
            </Reveal>
          ))}
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 mb-6">
          {/* Time Series Chart - Full Width */}
          <Reveal className="col-span-12">
            <ChartCard title="Viewership Over Time">
              {timeSeries.length === 0 ? (
                <div className="h-[300px] flex flex-col items-center justify-center" style={{ color: 'rgba(246,246,241,0.6)' }}>
                  <Eye className="w-12 h-12 mb-3" style={{ color: BRAND_DEEP }} />
                  <p>No viewership data available yet</p>
                  <p className="text-sm mt-1">Data will appear as viewers start watching content</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timeSeries}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={BRAND} stopOpacity={0.45}/>
                        <stop offset="95%" stopColor={BRAND} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorUniques" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={PAPER} stopOpacity={0.35}/>
                        <stop offset="95%" stopColor={PAPER} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(246,246,241,0.12)" />
                    <XAxis
                      dataKey="timestamp"
                      stroke="rgba(246,246,241,0.6)"
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return timeframe === '24h'
                          ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : date.toLocaleDateString([], { month: 'short', day: 'numeric' })
                      }}
                    />
                    <YAxis stroke="rgba(246,246,241,0.6)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: INK,
                        border: `2px solid ${BRAND}`,
                        borderRadius: '8px',
                        color: PAPER,
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke={BRAND}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorViews)"
                      name="Total Views"
                    />
                    <Area
                      type="monotone"
                      dataKey="uniques"
                      stroke={PAPER}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorUniques)"
                      name="Unique Viewers"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </Reveal>

          {/* Platform Breakdown */}
          <Reveal className="col-span-12 lg:col-span-6" delay={80}>
            <ChartCard title="Platform Distribution">
              {platformData.length === 0 ? (
                <div className="h-[300px] flex flex-col items-center justify-center" style={{ color: 'rgba(246,246,241,0.6)' }}>
                  <Eye className="w-12 h-12 mb-3" style={{ color: BRAND_DEEP }} />
                  <p>No platform data available yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={platformData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(246,246,241,0.12)" />
                    <XAxis dataKey="platform" stroke="rgba(246,246,241,0.6)" />
                    <YAxis stroke="rgba(246,246,241,0.6)" />
                    <Tooltip
                      cursor={{ fill: LIME_FILL }}
                      contentStyle={{
                        backgroundColor: INK,
                        border: `2px solid ${BRAND}`,
                        borderRadius: '8px',
                        color: PAPER,
                      }}
                    />
                    <Bar dataKey="count" fill={BRAND} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </Reveal>

          {/* Geographic Distribution */}
          <Reveal className="col-span-12 lg:col-span-6" delay={160}>
            <ChartCard title="Top Countries">
              <div className="space-y-3">
                {geoData.length === 0 ? (
                  <div className="h-[300px] flex flex-col items-center justify-center" style={{ color: 'rgba(246,246,241,0.6)' }}>
                    <Globe className="w-12 h-12 mb-3" style={{ color: BRAND_DEEP }} />
                    <p>No geographic data available yet</p>
                    <p className="text-sm mt-1">Location data will appear as viewers watch</p>
                  </div>
                ) : (
                  geoData.map((country, index) => (
                    <div key={country.country} className="flex items-center gap-3">
                      <div className="w-8 text-right font-display text-lg" style={{ color: BRAND }}>
                        #{index + 1}
                      </div>
                      <Globe className="w-4 h-4" style={{ color: BRAND }} />
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span style={{ color: PAPER }}>{country.country}</span>
                          <span style={{ color: 'rgba(246,246,241,0.7)' }}>{formatNumber(country.count)} views</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(246,246,241,0.15)' }}>
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${country.percentage}%`,
                              backgroundColor: BRAND,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ChartCard>
          </Reveal>

          {/* Content Creation Stats */}
          <Reveal className="col-span-12 lg:col-span-4" delay={80}>
            <ChartCard title="AI Content Generation">
              <div className="space-y-4">
                <StatRow label="Total Created" value={creationStats.totalCreated} color={ACCENTS[0]} />
                <StatRow label="AI Generated" value={creationStats.aiGenerated} color={ACCENTS[1]} />
                <StatRow label="Scripts" value={creationStats.scriptCount} color={ACCENTS[2]} />
                <StatRow label="Images" value={creationStats.imageCount} color={ACCENTS[3]} />
                <StatRow label="Videos" value={creationStats.videoCount} color={ACCENTS[4]} />
                <StatRow label="Audio" value={creationStats.audioCount} color={ACCENTS[5]} />
                <div className="pt-3 mt-3 border-t-2" style={{ borderColor: 'rgba(246,246,241,0.2)' }}>
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'rgba(246,246,241,0.7)' }} className="text-sm">Avg Generation Time</span>
                    <span style={{ color: PAPER }} className="font-semibold">
                      {creationStats.avgGenerationTime.toFixed(1)}s
                    </span>
                  </div>
                </div>
              </div>
            </ChartCard>
          </Reveal>

          {/* GPU Metrics */}
          <Reveal className="col-span-12 lg:col-span-4" delay={160}>
            <ChartCard title="GPU Performance">
              <div className="space-y-4">
                <MetricGauge label="Utilization" value={gpuMetrics.utilization} max={100} unit="%" color={BRAND} />
                <MetricGauge label="Memory" value={gpuMetrics.memoryUsed} max={gpuMetrics.memoryTotal} unit="GB" color={BRAND_BRIGHT} />
                <MetricGauge
                  label="Temperature"
                  value={gpuMetrics.temperature}
                  max={90}
                  unit="°C"
                  color={gpuMetrics.temperature > 80 ? BRAND_BRIGHT : BRAND}
                />
                <MetricGauge label="Power Usage" value={gpuMetrics.powerUsage} max={700} unit="W" color={BRAND_DEEP} />
                <div className="pt-3 mt-3 border-t-2" style={{ borderColor: 'rgba(246,246,241,0.2)' }}>
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'rgba(246,246,241,0.7)' }} className="text-sm">Active Jobs</span>
                    <span style={{ color: BRAND }} className="font-display text-3xl">
                      {gpuMetrics.activeJobs}
                    </span>
                  </div>
                </div>
              </div>
            </ChartCard>
          </Reveal>

          {/* System Health */}
          <Reveal className="col-span-12 lg:col-span-4" delay={240}>
            <ChartCard title="System Health">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <HealthBadge label="Total" value={errorMetrics.total} color={PAPER} />
                  <HealthBadge label="Critical" value={errorMetrics.critical} color={BRAND_BRIGHT} />
                  <HealthBadge label="Warnings" value={errorMetrics.warnings} color={BRAND} />
                </div>

                <div className="space-y-2 pt-4">
                  {errorMetrics.byType.length > 0 ? (
                    errorMetrics.byType.slice(0, 5).map((error) => (
                      <div key={error.type} className="flex justify-between items-center p-2 rounded-lg" style={{ backgroundColor: LIME_FILL }}>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" style={{ color: BRAND }} />
                          <span style={{ color: PAPER }} className="text-sm">{error.type}</span>
                        </div>
                        <span style={{ color: 'rgba(246,246,241,0.8)' }} className="text-sm font-semibold">{error.count}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8" style={{ color: BRAND }}>
                      <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: LIME_FILL }}>
                        <span className="text-2xl">✓</span>
                      </div>
                      <p className="font-display text-xl">All Systems Operational</p>
                      <p className="text-sm mt-1" style={{ color: 'rgba(246,246,241,0.6)' }}>No errors in the last 24 hours</p>
                    </div>
                  )}
                </div>
              </div>
            </ChartCard>
          </Reveal>
        </div>
      </main>

      {/* EU AI Act — Model Transparency (Article 53) */}
      <footer
        aria-label="EU AI Act transparency"
        className="border-t-4"
        style={{ backgroundColor: INK, borderColor: INK }}
      >
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div
            className="pt-6 border-t"
            style={{ borderColor: 'rgba(198,248,51,0.25)' }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: BRAND }}
            >
              EU AI Act — Model Transparency
            </p>
            <p className="text-sm leading-relaxed max-w-4xl mb-4 text-[rgba(246,246,241,0.6)]">
              MOTHER CORE V2 &amp; V3 are open-weight general-purpose AI models. As their
              provider, Media Stream AI publishes the documents required under Article 53 of
              the EU AI Act (Regulation (EU) 2024/1689) — a copyright-compliance policy and a
              public summary of training content — together with our full technology
              due-diligence dossier:
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <a
                href="/downloads/MOTHER-EU-Copyright-Policy.pdf"
                target="_blank"
                rel="noopener"
                className="transition-colors text-[rgba(246,246,241,0.6)] hover:text-[#C6F833]"
              >
                ↓ Copyright Policy — Art. 53(1)(c)
              </a>
              <a
                href="/downloads/MOTHER-Training-Content-Summary.pdf"
                target="_blank"
                rel="noopener"
                className="transition-colors text-[rgba(246,246,241,0.6)] hover:text-[#C6F833]"
              >
                ↓ Training-Content Summary — Art. 53(1)(d)
              </a>
              <a
                href="/downloads/MOTHER-Technology-Due-Diligence.pdf"
                target="_blank"
                rel="noopener"
                className="transition-colors text-[rgba(246,246,241,0.6)] hover:text-[#C6F833]"
              >
                ↓ Technology Due Diligence
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ============================================================================
   COMPONENT: KPI Card
============================================================================ */

interface KPICardProps {
  title: string
  value: number
  icon: ReactNode
  format?: 'number' | 'hours' | 'minutes'
  trend?: number
  pulse?: boolean
}

function KPICard({ title, value, icon, format = 'number', trend, pulse }: KPICardProps) {
  const formattedValue = formatKPIValue(value, format)

  return (
    <div
      className="rounded-2xl p-4 sm:p-5 border-2 transition-all hover:scale-[1.03] hover:-translate-y-1 relative overflow-hidden h-full"
      style={{ backgroundColor: INK, borderColor: INK, color: PAPER }}
    >
      {pulse && value > 0 && (
        <div
          className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full animate-pulse"
          style={{ backgroundColor: BRAND, boxShadow: `0 0 12px ${BRAND}` }}
        />
      )}

      <div className="flex items-start justify-between mb-3 gap-2">
        <span className="text-xs sm:text-sm font-medium uppercase tracking-wide min-w-0 break-words" style={{ color: 'rgba(246,246,241,0.7)' }}>{title}</span>
        <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: LIME_FILL }}>
          {cloneElement(icon as ReactElement, {
            className: 'w-4 h-4',
            style: { color: BRAND },
          })}
        </div>
      </div>

      <div className="font-display text-3xl sm:text-4xl mb-1 break-words" style={{ color: BRAND }}>
        {formattedValue}
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-1 text-sm">
          <TrendingUp
            className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`}
            style={{ color: trend >= 0 ? BRAND : BRAND_BRIGHT }}
          />
          <span className="font-semibold" style={{ color: trend >= 0 ? BRAND : BRAND_BRIGHT }}>
            {Math.abs(trend).toFixed(1)}%
          </span>
          <span style={{ color: 'rgba(246,246,241,0.5)' }}>vs last period</span>
        </div>
      )}
    </div>
  )
}

/* ============================================================================
   COMPONENT: Chart Card
============================================================================ */

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-4 sm:p-6 border-2 h-full transition-all hover:-translate-y-1" style={{ backgroundColor: INK, borderColor: INK }}>
      <h3 className="font-display text-xl sm:text-2xl mb-4" style={{ color: BRAND }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

/* ============================================================================
   COMPONENT: Stat Row
============================================================================ */

function StatRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span style={{ color: 'rgba(246,246,241,0.75)' }} className="text-sm">{label}</span>
      </div>
      <span style={{ color: PAPER }} className="font-display text-xl">{formatNumber(value)}</span>
    </div>
  )
}

/* ============================================================================
   COMPONENT: Metric Gauge
============================================================================ */

function MetricGauge({ 
  label, 
  value, 
  max, 
  unit, 
  color 
}: { 
  label: string
  value: number
  max: number
  unit: string
  color: string
}) {
  const percentage = Math.min((value / max) * 100, 100)
  
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span style={{ color: 'rgba(246,246,241,0.75)' }} className="text-sm">{label}</span>
        <span style={{ color: PAPER }} className="font-semibold">
          {value.toFixed(1)}{unit} <span style={{ color: 'rgba(246,246,241,0.5)' }}>/ {max}{unit}</span>
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(246,246,241,0.15)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  )
}

/* ============================================================================
   COMPONENT: Health Badge
============================================================================ */

function HealthBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg p-3 text-center" style={{ backgroundColor: LIME_FILL }}>
      <div className="font-display text-3xl mb-1" style={{ color }}>
        {value}
      </div>
      <div className="text-xs uppercase tracking-wide" style={{ color: 'rgba(246,246,241,0.6)' }}>
        {label}
      </div>
    </div>
  )
}

/* ============================================================================
   UTILITIES
============================================================================ */

function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K'
  return num.toFixed(0)
}

function formatKPIValue(value: number, format: string): string {
  switch (format) {
    case 'hours':
      if (value >= 1000) return (value / 1000).toFixed(1) + 'K hrs'
      return value.toFixed(1) + 'h'
    case 'minutes':
      return value.toFixed(1) + 'm'
    default:
      return formatNumber(value)
  }
}
