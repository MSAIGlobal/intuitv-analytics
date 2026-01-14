
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.intuitv.app';

export interface ContentStats {
  views: number;
  engagement: number;
  completion_rate: number;
  avg_watch_time: number;
  date: string;
  likes?: number;
  shares?: number;
  comments?: number;
}

export interface GPUMetrics {
  region: string;
  utilization: number;
  temperature: number;
  power_usage: number;
  timestamp: string;
}

export interface ESGMetrics {
  carbon_offset: number;
  renewable_energy_pct: number;
  power_efficiency: number;
  date: string;
}

export interface EngagementData {
  metric: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface RealTimeMetric {
  label: string;
  value: number | string;
  unit?: string;
  change?: number;
  status?: 'good' | 'warning' | 'critical';
}

class AnalyticsClient {
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
      
      if (!response.ok) {
        console.warn(`Analytics API warning: ${response.status} ${endpoint}`);
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Analytics API error: ${endpoint}`, error);
      return null;
    }
  }

  async getContentStats(contentId: number, timeframe: string = '7d'): Promise<ContentStats[]> {
    const data = await this.fetch<ContentStats[]>(`/analytics/content/${contentId}?timeframe=${timeframe}`);
    if (!data) return this.getMockContentStats(timeframe);
    return data;
  }

  async getGPUMetrics(region?: string): Promise<GPUMetrics[]> {
    const endpoint = region ? `/analytics/gpu?region=${region}` : '/analytics/gpu';
    const data = await this.fetch<GPUMetrics[]>(endpoint);
    if (!data) return this.getMockGPUMetrics();
    return data;
  }

  async getESGMetrics(timeframe: string = '30d'): Promise<ESGMetrics[]> {
    const data = await this.fetch<ESGMetrics[]>(`/analytics/esg?timeframe=${timeframe}`);
    if (!data) return this.getMockESGMetrics();
    return data;
  }

  async getEngagementData(): Promise<EngagementData[]> {
    const data = await this.fetch<EngagementData[]>('/analytics/engagement');
    if (!data) return this.getMockEngagementData();
    return data;
  }

   async getOverview(timeframe: string = '7d'): Promise<any> {
    const data = await this.fetch<any>(`/analytics/overview?timeframe=${timeframe}`);
    if (!data) {
      return {
        total_views: 125430,
        total_watch_time: 892450,
        active_viewers: 12453,
        engagement_rate: 0.785,
        trending_content: []
      };
    }
    return data;
  }

  async getRealTimeMetrics(): Promise<RealTimeMetric[]> {
    const data = await this.fetch<RealTimeMetric[]>('/analytics/realtime');
    if (!data) return this.getMockRealTimeMetrics();
    return data;
  }

  private getMockContentStats(timeframe: string): ContentStats[] {
    const days = timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const stats: ContentStats[] = [];
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      stats.push({
        date: date.toISOString().split('T')[0],
        views: Math.floor(1000 + Math.random() * 500),
        engagement: 0.75 + Math.random() * 0.2,
        completion_rate: 0.65 + Math.random() * 0.25,
        avg_watch_time: 3 + Math.random() * 3,
        likes: Math.floor(50 + Math.random() * 100),
        shares: Math.floor(10 + Math.random() * 40),
        comments: Math.floor(5 + Math.random() * 30),
      });
    }
    return stats;
  }

  private getMockGPUMetrics(): GPUMetrics[] {
    const regions = ['Manchester', 'Liverpool', 'Durham', 'Düsseldorf', 'Marseille'];
    return regions.map(region => ({
      region,
      utilization: 60 + Math.random() * 35,
      temperature: 45 + Math.random() * 20,
      power_usage: 200 + Math.random() * 150,
      timestamp: new Date().toISOString(),
    }));
  }

  private getMockESGMetrics(): ESGMetrics[] {
    const metrics: ESGMetrics[] = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      metrics.push({
        date: date.toISOString().split('T')[0],
        carbon_offset: 150 + Math.random() * 50,
        renewable_energy_pct: 85 + Math.random() * 10,
        power_efficiency: 0.85 + Math.random() * 0.1,
      });
    }
    return metrics;
  }

  private getMockEngagementData(): EngagementData[] {
    return [
      { metric: 'Total Views', value: 125430, change: 12.5, trend: 'up' },
      { metric: 'Avg Watch Time', value: 4.2, change: 8.3, trend: 'up' },
      { metric: 'Engagement Rate', value: 78.5, change: -2.1, trend: 'down' },
      { metric: 'Completion Rate', value: 68.9, change: 5.7, trend: 'up' },
      { metric: 'Social Shares', value: 8920, change: 15.2, trend: 'up' },
      { metric: 'Comments', value: 3450, change: 3.4, trend: 'stable' },
    ];
  }

  private getMockRealTimeMetrics(): RealTimeMetric[] {
    return [
      { label: 'Active Viewers', value: 12453, change: 8.5, status: 'good' },
      { label: 'Concurrent Streams', value: 847, change: -2.3, status: 'warning' },
      { label: 'GPU Utilization', value: '78%', status: 'good' },
      { label: 'Avg Latency', value: '45ms', status: 'good' },
      { label: 'Error Rate', value: '0.02%', status: 'good' },
      { label: 'Bandwidth', value: '2.4 Gbps', status: 'good' },
    ];
  }

  async exportData(type: 'content' | 'gpu' | 'esg', format: 'csv' | 'json' = 'csv'): Promise<Blob | null> {
    try {
      const response = await fetch(`${API_URL}/analytics/export/${type}?format=${format}`, {
        method: 'GET',
      });
      if (!response.ok) return null;
      return await response.blob();
    } catch (error) {
      console.error('Export error:', error);
      return null;
    }
  }
}

export const analyticsClient = new AnalyticsClient();

