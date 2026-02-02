'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.intuitv.app';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://api.intuitv.app/ws';

// Real-time metrics types
export interface RealTimeMetrics {
  timestamp: string;
  viewers: {
    total: number;
    by_channel: Record<string, number>;
    by_region: Record<string, number>;
  };
  bandwidth: {
    current_mbps: number;
    peak_mbps: number;
    total_gb: number;
  };
  quality: {
    avg_bitrate: number;
    buffer_ratio: number;
    error_rate: number;
  };
  cdn: {
    hit_ratio: number;
    origin_requests: number;
    edge_requests: number;
  };
}

export interface ChannelMetrics {
  channel_id: string;
  channel_name: string;
  status: 'live' | 'offline';
  viewers: number;
  peak_viewers: number;
  avg_watch_time: number;
  buffer_ratio: number;
  quality_switches: number;
  geographic_distribution: {
    country: string;
    viewers: number;
    percentage: number;
  }[];
}

export interface ContentPerformance {
  asset_id: string;
  title: string;
  views: number;
  unique_viewers: number;
  avg_completion: number;
  engagement_score: number;
  trending_score: number;
}

interface UseRealTimeMetricsReturn {
  metrics: RealTimeMetrics | null;
  channelMetrics: ChannelMetrics[];
  topContent: ContentPerformance[];
  connected: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useRealTimeMetrics(): UseRealTimeMetricsReturn {
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [channelMetrics, setChannelMetrics] = useState<ChannelMetrics[]>([]);
  const [topContent, setTopContent] = useState<ContentPerformance[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getAuthToken = useCallback(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  }, []);

  const connect = useCallback(() => {
    const token = getAuthToken();
    if (!token) {
      setError('Not authenticated');
      return;
    }

    try {
      const ws = new WebSocket(`${WS_URL}/analytics?token=${token}`);

      ws.onopen = () => {
        setConnected(true);
        setError(null);
        setLoading(false);

        // Subscribe to all metrics
        ws.send(JSON.stringify({
          type: 'subscribe',
          channels: ['metrics', 'channels', 'content'],
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'metrics':
              setMetrics(data.payload);
              break;
            case 'channel_metrics':
              setChannelMetrics(data.payload);
              break;
            case 'top_content':
              setTopContent(data.payload);
              break;
            case 'error':
              setError(data.message);
              break;
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = () => {
        setError('WebSocket error');
        setConnected(false);
      };

      ws.onclose = () => {
        setConnected(false);
        // Attempt reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      };

      wsRef.current = ws;
    } catch (err) {
      setError('Failed to connect');
      setLoading(false);
    }
  }, [getAuthToken]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  const refresh = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'refresh' }));
    }
  }, []);

  return {
    metrics,
    channelMetrics,
    topContent,
    connected,
    loading,
    error,
    refresh,
  };
}

// Historical analytics hook
interface TimeSeriesPoint {
  timestamp: string;
  value: number;
}

interface HistoricalAnalytics {
  period: string;
  viewers: TimeSeriesPoint[];
  bandwidth: TimeSeriesPoint[];
  revenue: TimeSeriesPoint[];
  engagement: TimeSeriesPoint[];
  totals: {
    total_views: number;
    unique_viewers: number;
    total_watch_time_hours: number;
    avg_session_duration: number;
    revenue: number;
  };
}

interface UseHistoricalAnalyticsOptions {
  period?: '1h' | '24h' | '7d' | '30d' | '90d';
  granularity?: '1m' | '5m' | '1h' | '1d';
}

interface UseHistoricalAnalyticsReturn {
  data: HistoricalAnalytics | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setPeriod: (period: '1h' | '24h' | '7d' | '30d' | '90d') => void;
}

export function useHistoricalAnalytics(
  options: UseHistoricalAnalyticsOptions = {}
): UseHistoricalAnalyticsReturn {
  const [period, setPeriodState] = useState(options.period || '24h');
  const [granularity] = useState(options.granularity || '1h');
  const [data, setData] = useState<HistoricalAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/v1/analytics/historical?period=${period}&granularity=${granularity}`,
        { headers: getAuthHeaders() }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [period, granularity, getAuthHeaders]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setPeriod = (newPeriod: '1h' | '24h' | '7d' | '30d' | '90d') => {
    setPeriodState(newPeriod);
  };

  return {
    data,
    loading,
    error,
    refresh: fetchData,
    setPeriod,
  };
}

// Audience insights hook
export interface AudienceSegment {
  id: string;
  name: string;
  size: number;
  percentage: number;
  avg_watch_time: number;
  top_content: string[];
  growth_rate: number;
}

export interface AudienceInsights {
  total_audience: number;
  active_users_24h: number;
  retention_rate: number;
  segments: AudienceSegment[];
  demographics: {
    age_groups: Record<string, number>;
    devices: Record<string, number>;
    platforms: Record<string, number>;
  };
  behavior: {
    peak_hours: number[];
    avg_sessions_per_user: number;
    avg_content_per_session: number;
  };
}

interface UseAudienceInsightsReturn {
  insights: AudienceInsights | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAudienceInsights(): UseAudienceInsightsReturn {
  const [insights, setInsights] = useState<AudienceInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const fetchInsights = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/analytics/audience`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch audience insights: ${response.status}`);
      }

      const data = await response.json();
      setInsights(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch insights');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return {
    insights,
    loading,
    error,
    refresh: fetchInsights,
  };
}

export default useRealTimeMetrics;
