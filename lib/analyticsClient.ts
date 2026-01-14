import axios, { AxiosInstance } from 'axios';
import {
  KPIMetrics,
  TimeSeriesData,
  ChannelRanking,
  GeoData,
  StateData,
  PlatformBreakdown,
  ViewerBehavior,
  CreatorAnalytics,
  StudioAnalytics,
  AnalyticsFilters as BaseAnalyticsFilters,
  SupportTicket,
  TicketMessage,
} from './types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.intuitv.app';

/**
 * 🔧 FIX:
 * Extend AnalyticsFilters locally to match actual usage
 * without modifying shared types or removing functionality
 */
type AnalyticsFilters = BaseAnalyticsFilters & {
  channel?: string;
  platform?: string;
  country?: string;
};

class AnalyticsClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Request interceptor for auth
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error(
          'API Error:',
          error.response?.data || error.message
        );
        throw error;
      }
    );
  }

  // Helper to convert filters to query params
  private filtersToParams(filters?: AnalyticsFilters): any {
    if (!filters) return {};

    const params: any = {};

    if (filters.dateRange) {
      params.start_date = filters.dateRange.start;
      params.end_date = filters.dateRange.end;
    }

    if (filters.channel) {
      params.channel_id = filters.channel;
    }

    if (filters.platform) {
      params.platform = filters.platform;
    }

    if (filters.country) {
      params.country = filters.country;
    }

    return params;
  }

  // ========================================================================
  // KPI OVERVIEW
  // ========================================================================

  async getKPIMetrics(filters?: AnalyticsFilters): Promise<KPIMetrics> {
    const response = await this.client.get('/api/analytics/overview', {
      params: this.filtersToParams(filters),
    });
    return response.data;
  }

  // ========================================================================
  // TIME SERIES DATA
  // ========================================================================

  async getTimeSeriesData(
    filters?: AnalyticsFilters,
    interval: 'hour' | 'day' = 'day'
  ): Promise<TimeSeriesData[]> {
    const response = await this.client.get('/api/analytics/timeseries', {
      params: {
        ...this.filtersToParams(filters),
        interval,
      },
    });
    return response.data;
  }

  // ========================================================================
  // CHANNEL RANKINGS
  // ========================================================================

  async getChannelRankings(
    filters?: AnalyticsFilters,
    metric: 'watchTime' | 'views' = 'watchTime',
    limit: number = 10
  ): Promise<ChannelRanking[]> {
    const response = await this.client.get('/api/analytics/channels', {
      params: {
        ...this.filtersToParams(filters),
        metric,
        limit,
      },
    });
    return response.data;
  }

  // ========================================================================
  // GEOGRAPHIC ANALYTICS
  // ========================================================================

  async getGeoAnalytics(filters?: AnalyticsFilters): Promise<GeoData[]> {
    const response = await this.client.get('/api/analytics/geo', {
      params: this.filtersToParams(filters),
    });
    return response.data;
  }

  async getStateAnalytics(
    country: string = 'US',
    filters?: AnalyticsFilters
  ): Promise<StateData[]> {
    const response = await this.client.get('/api/analytics/geo/states', {
      params: {
        ...this.filtersToParams(filters),
        country,
      },
    });
    return response.data;
  }

  // ========================================================================
  // PLATFORM & DEVICE ANALYTICS
  // ========================================================================

  async getPlatformBreakdown(
    filters?: AnalyticsFilters
  ): Promise<PlatformBreakdown[]> {
    const response = await this.client.get('/api/analytics/platforms', {
      params: this.filtersToParams(filters),
    });
    return response.data;
  }

  // ========================================================================
  // VIEWER BEHAVIOR
  // ========================================================================

  async getViewerBehavior(
    filters?: AnalyticsFilters
  ): Promise<ViewerBehavior> {
    const response = await this.client.get('/api/analytics/behavior', {
      params: this.filtersToParams(filters),
    });
    return response.data;
  }

  // ========================================================================
  // CREATOR ANALYTICS
  // ========================================================================

  async getCreatorAnalytics(
    filters?: AnalyticsFilters,
    limit: number = 20
  ): Promise<CreatorAnalytics[]> {
    const response = await this.client.get('/api/analytics/creators', {
      params: {
        ...this.filtersToParams(filters),
        limit,
      },
    });
    return response.data;
  }

  // ========================================================================
  // STUDIO ANALYTICS
  // ========================================================================

  async getStudioAnalytics(
    filters?: AnalyticsFilters,
    limit: number = 20
  ): Promise<StudioAnalytics[]> {
    const response = await this.client.get('/api/analytics/studios', {
      params: {
        ...this.filtersToParams(filters),
        limit,
      },
    });
    return response.data;
  }

  // ========================================================================
  // SUPPORT TICKETS
  // ========================================================================

  async createSupportTicket(
    ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<SupportTicket> {
    const response = await this.client.post(
      '/api/support/tickets',
      ticket
    );
    return response.data;
  }

  async getSupportTickets(filters?: {
    status?: string;
    category?: string;
  }): Promise<SupportTicket[]> {
    const response = await this.client.get('/api/support/tickets', {
      params: filters,
    });
    return response.data;
  }

  async addTicketMessage(
    ticketId: string,
    message: Omit<TicketMessage, 'id' | 'timestamp'>
  ): Promise<TicketMessage> {
    const response = await this.client.post(
      `/api/support/tickets/${ticketId}/messages`,
      message
    );
    return response.data;
  }

  async updateTicketStatus(
    ticketId: string,
    status: string
  ): Promise<SupportTicket> {
    const response = await this.client.patch(
      `/api/support/tickets/${ticketId}`,
      { status }
    );
    return response.data;
  }
}

export const analyticsClient = new AnalyticsClient();
