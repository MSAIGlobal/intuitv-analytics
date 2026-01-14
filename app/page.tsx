

'use client'

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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A0F1E' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" 
               style={{ borderColor: '#00D9FF', borderTopColor: 'transparent' }} />
          <p style={{ color: '#A8B2C8' }}>Loading analytics from API...</p>
        </div>
      </div>
    )
  }

return (
  <div className="min-h-screen" style={{ backgroundColor: '#0A0F1E' }}>
    {/* Header */}
    <header
      className="sticky top-0 z-50 border-b"
      style={{ backgroundColor: '#121A2E', borderColor: '#1E293B' }}
    >
      <div className="max-w-[1920px] mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Left: Logo + Title (clickable) */}
        <a
          href="https://mother.mediastreamai.com"
          className="flex items-center gap-4 transition-opacity hover:opacity-80"
        >
          <div className="relative w-10 h-10 shrink-0">
            <Image
              src="/logo_icon.png"
              alt="MOTHER"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="h-8 w-px" style={{ backgroundColor: '#1E293B' }} />

          <h1 className="text-xl font-semibold text-white whitespace-nowrap">
            Analytics Dashboard
          </h1>
        </a>

        {/* Right side content continues here */}
      </div>
    </header>
  </div>
);


          {/* Right: Search + Actions */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" 
                style={{ color: '#6B7A99' }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search metrics..."
                className="pl-10 pr-4 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: '#0A0F1E',
                  borderWidth: '1px',
                  borderColor: '#1E293B',
                  color: '#FFFFFF',
                  width: '280px',
                }}
              />
            </div>

            <button 
              className="relative p-2 rounded-lg transition-colors hover:bg-opacity-70"
              style={{ backgroundColor: '#1A2640' }}
            >
              <Bell className="w-5 h-5" style={{ color: '#A8B2C8' }} />
              {errorMetrics.critical > 0 && (
                <span 
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-semibold flex items-center justify-center"
                  style={{ 
                    backgroundColor: '#EF4444',
                    color: '#FFFFFF',
                  }}
                >
                  {errorMetrics.critical}
                </span>
              )}
            </button>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg transition-all hover:bg-opacity-70 disabled:opacity-50"
              style={{ backgroundColor: '#1A2640' }}
            >
              <RefreshCw
                className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
                style={{ color: '#A8B2C8' }}
              />
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="p-4 rounded-lg flex items-center gap-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444' }}>
            <AlertCircle className="w-5 h-5" style={{ color: '#EF4444' }} />
            <span style={{ color: '#EF4444' }}>{error}</span>
          </div>
        </div>
      )}

      {/* Timeframe Selector */}
      <div className="max-w-[1920px] mx-auto px-6 py-4">
        <div className="flex gap-2">
          {['24h', '7d', '30d', '90d'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: timeframe === tf ? '#00D9FF' : '#1A2640',
                color: timeframe === tf ? '#0A0F1E' : '#A8B2C8',
              }}
            >
              {tf === '24h' ? 'Last 24 Hours' : tf === '7d' ? 'Last 7 Days' : tf === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-[1920px] mx-auto px-6 pb-8">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <KPICard
            title="Total Views"
            value={overview.totalViews}
            icon={<Eye />}
            trend={overview.viewsTrend}
            color="#00D9FF"
          />
          <KPICard
            title="Unique Viewers"
            value={overview.uniqueViewers}
            icon={<Users />}
            trend={overview.viewersTrend}
            color="#10B981"
          />
          <KPICard
            title="Watch Hours"
            value={overview.totalWatchHours}
            icon={<Clock />}
            format="hours"
            trend={overview.watchHoursTrend}
            color="#F59E0B"
          />
          <KPICard
            title="Avg Session"
            value={overview.avgSessionDuration}
            icon={<Play />}
            format="minutes"
            color="#8B5CF6"
          />
          <KPICard
            title="Live Now"
            value={overview.concurrentStreams}
            icon={<Play />}
            color="#EF4444"
            pulse
          />
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          {/* Time Series Chart - Full Width */}
          <div className="col-span-12">
            <ChartCard title="Viewership Over Time">
              {timeSeries.length === 0 ? (
                <div className="h-[300px] flex flex-col items-center justify-center" style={{ color: '#6B7A99' }}>
                  <Eye className="w-12 h-12 mb-3" style={{ color: '#1A2640' }} />
                  <p>No viewership data available yet</p>
                  <p className="text-sm mt-1">Data will appear as viewers start watching content</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timeSeries}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00D9FF" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorUniques" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis 
                      dataKey="timestamp" 
                      stroke="#6B7A99"
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return timeframe === '24h' 
                          ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : date.toLocaleDateString([], { month: 'short', day: 'numeric' })
                      }}
                    />
                    <YAxis stroke="#6B7A99" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#121A2E', 
                        border: '1px solid #1E293B',
                        borderRadius: '8px',
                        color: '#FFFFFF'
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      stroke="#00D9FF" 
                      fillOpacity={1} 
                      fill="url(#colorViews)"
                      name="Total Views"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="uniques" 
                      stroke="#10B981" 
                      fillOpacity={1} 
                      fill="url(#colorUniques)"
                      name="Unique Viewers"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          {/* Platform Breakdown */}
          <div className="col-span-12 lg:col-span-6">
            <ChartCard title="Platform Distribution">
              {platformData.length === 0 ? (
                <div className="h-[300px] flex flex-col items-center justify-center" style={{ color: '#6B7A99' }}>
                  <Eye className="w-12 h-12 mb-3" style={{ color: '#1A2640' }} />
                  <p>No platform data available yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={platformData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="platform" stroke="#6B7A99" />
                    <YAxis stroke="#6B7A99" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#121A2E', 
                        border: '1px solid #1E293B',
                        borderRadius: '8px',
                        color: '#FFFFFF'
                      }}
                    />
                    <Bar dataKey="count" fill="#00D9FF" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          {/* Geographic Distribution */}
          <div className="col-span-12 lg:col-span-6">
            <ChartCard title="Top Countries">
              <div className="space-y-3">
                {geoData.length === 0 ? (
                  <div className="h-[300px] flex flex-col items-center justify-center" style={{ color: '#6B7A99' }}>
                    <Globe className="w-12 h-12 mb-3" style={{ color: '#1A2640' }} />
                    <p>No geographic data available yet</p>
                    <p className="text-sm mt-1">Location data will appear as viewers watch</p>
                  </div>
                ) : (
                  geoData.map((country, index) => (
                    <div key={country.country} className="flex items-center gap-3">
                      <div className="w-8 text-right font-semibold" style={{ color: '#6B7A99' }}>
                        #{index + 1}
                      </div>
                      <Globe className="w-4 h-4" style={{ color: '#00D9FF' }} />
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span style={{ color: '#FFFFFF' }}>{country.country}</span>
                          <span style={{ color: '#A8B2C8' }}>{formatNumber(country.count)} views</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#1A2640' }}>
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${country.percentage}%`,
                              backgroundColor: '#00D9FF'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ChartCard>
          </div>

          {/* Content Creation Stats */}
          <div className="col-span-12 lg:col-span-4">
            <ChartCard title="AI Content Generation">
              <div className="space-y-4">
                <StatRow 
                  label="Total Created" 
                  value={creationStats.totalCreated} 
                  color="#00D9FF"
                />
                <StatRow 
                  label="AI Generated" 
                  value={creationStats.aiGenerated} 
                  color="#10B981"
                />
                <StatRow 
                  label="Scripts" 
                  value={creationStats.scriptCount} 
                  color="#8B5CF6"
                />
                <StatRow 
                  label="Images" 
                  value={creationStats.imageCount} 
                  color="#F59E0B"
                />
                <StatRow 
                  label="Videos" 
                  value={creationStats.videoCount} 
                  color="#EF4444"
                />
                <StatRow 
                  label="Audio" 
                  value={creationStats.audioCount} 
                  color="#EC4899"
                />
                <div className="pt-3 mt-3 border-t" style={{ borderColor: '#1E293B' }}>
                  <div className="flex justify-between items-center">
                    <span style={{ color: '#A8B2C8' }} className="text-sm">Avg Generation Time</span>
                    <span style={{ color: '#FFFFFF' }} className="font-semibold">
                      {creationStats.avgGenerationTime.toFixed(1)}s
                    </span>
                  </div>
                </div>
              </div>
            </ChartCard>
          </div>

          {/* GPU Metrics */}
          <div className="col-span-12 lg:col-span-4">
            <ChartCard title="GPU Performance">
              <div className="space-y-4">
                <MetricGauge 
                  label="Utilization" 
                  value={gpuMetrics.utilization} 
                  max={100}
                  unit="%"
                  color="#00D9FF"
                />
                <MetricGauge 
                  label="Memory" 
                  value={gpuMetrics.memoryUsed} 
                  max={gpuMetrics.memoryTotal}
                  unit="GB"
                  color="#10B981"
                />
                <MetricGauge 
                  label="Temperature" 
                  value={gpuMetrics.temperature} 
                  max={90}
                  unit="°C"
                  color={gpuMetrics.temperature > 80 ? "#EF4444" : "#F59E0B"}
                />
                <MetricGauge 
                  label="Power Usage" 
                  value={gpuMetrics.powerUsage} 
                  max={700}
                  unit="W"
                  color="#8B5CF6"
                />
                <div className="pt-3 mt-3 border-t" style={{ borderColor: '#1E293B' }}>
                  <div className="flex justify-between items-center">
                    <span style={{ color: '#A8B2C8' }} className="text-sm">Active Jobs</span>
                    <span style={{ color: '#FFFFFF' }} className="font-semibold text-2xl">
                      {gpuMetrics.activeJobs}
                    </span>
                  </div>
                </div>
              </div>
            </ChartCard>
          </div>

          {/* System Health */}
          <div className="col-span-12 lg:col-span-4">
            <ChartCard title="System Health">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <HealthBadge 
                    label="Total" 
                    value={errorMetrics.total} 
                    color="#A8B2C8"
                  />
                  <HealthBadge 
                    label="Critical" 
                    value={errorMetrics.critical} 
                    color="#EF4444"
                  />
                  <HealthBadge 
                    label="Warnings" 
                    value={errorMetrics.warnings} 
                    color="#F59E0B"
                  />
                </div>
                
                <div className="space-y-2 pt-4">
                  {errorMetrics.byType.length > 0 ? (
                    errorMetrics.byType.slice(0, 5).map((error) => (
                      <div key={error.type} className="flex justify-between items-center p-2 rounded" style={{ backgroundColor: '#1A2640' }}>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" style={{ color: '#F59E0B' }} />
                          <span style={{ color: '#FFFFFF' }} className="text-sm">{error.type}</span>
                        </div>
                        <span style={{ color: '#A8B2C8' }} className="text-sm font-semibold">{error.count}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8" style={{ color: '#10B981' }}>
                      <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                        <span className="text-2xl">✓</span>
                      </div>
                      <p className="font-semibold">All Systems Operational</p>
                      <p className="text-sm mt-1" style={{ color: '#6B7A99' }}>No errors in the last 24 hours</p>
                    </div>
                  )}
                </div>
              </div>
            </ChartCard>
          </div>
        </div>
      </main>
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
  color: string
  pulse?: boolean
}

function KPICard({ title, value, icon, format = 'number', trend, color, pulse }: KPICardProps) {
  const formattedValue = formatKPIValue(value, format)
  
  return (
    <div 
      className="rounded-lg p-5 transition-all hover:scale-[1.02] relative overflow-hidden"
      style={{ backgroundColor: '#121A2E' }}
    >
      {pulse && value > 0 && (
        <div 
          className="absolute top-3 right-3 w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
        />
      )}
      
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm" style={{ color: '#A8B2C8' }}>{title}</span>
        <div className="p-2 rounded-lg" style={{ backgroundColor: '#1A2640' }}>
      {cloneElement(icon as ReactElement, {
  className: 'w-4 h-4',
  style: { color },
})}
        </div>
      </div>
      
      <div className="text-3xl font-bold mb-1" style={{ color: '#FFFFFF' }}>
        {formattedValue}
      </div>
      
      {trend !== undefined && (
        <div className="flex items-center gap-1 text-sm">
          <TrendingUp 
            className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`}
            style={{ color: trend >= 0 ? '#10B981' : '#EF4444' }}
          />
          <span style={{ color: trend >= 0 ? '#10B981' : '#EF4444' }}>
            {Math.abs(trend).toFixed(1)}%
          </span>
          <span style={{ color: '#6B7A99' }}>vs last period</span>
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
    <div className="rounded-lg p-6" style={{ backgroundColor: '#121A2E' }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>
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
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span style={{ color: '#A8B2C8' }} className="text-sm">{label}</span>
      </div>
      <span style={{ color: '#FFFFFF' }} className="font-semibold">{formatNumber(value)}</span>
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
        <span style={{ color: '#A8B2C8' }} className="text-sm">{label}</span>
        <span style={{ color: '#FFFFFF' }} className="font-semibold">
          {value.toFixed(1)}{unit} <span style={{ color: '#6B7A99' }}>/ {max}{unit}</span>
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#1A2640' }}>
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color
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
    <div className="rounded-lg p-3 text-center" style={{ backgroundColor: '#1A2640' }}>
      <div className="text-2xl font-bold mb-1" style={{ color }}>
        {value}
      </div>
      <div className="text-xs" style={{ color: '#6B7A99' }}>
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
