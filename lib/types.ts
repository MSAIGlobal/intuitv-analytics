// Analytics Types
export interface KPIMetrics {
  totalViews: number;
  totalWatchHours: number;
  uniqueViewers: number;
  avgSessionDuration: number;
  concurrentStreams: number;
}

export interface TimeSeriesData {
  timestamp: string;
  views: number;
  watchTime: number;
  sessionStarts: number;
  sessionEnds: number;
}

export interface ChannelRanking {
  channelId: string;
  channelName: string;
  watchTime: number;
  views: number;
  thumbnailUrl?: string;
  creatorName?: string;
}

export interface GeoData {
  country: string;
  countryCode: string;
  watchHours: number;
  views: number;
  uniqueViewers: number;
  lat?: number;
  lng?: number;
}

export interface StateData {
  state: string;
  stateCode: string;
  country: string;
  watchHours: number;
  views: number;
}

export interface PlatformBreakdown {
  platform: 'tv' | 'mobile' | 'web';
  views: number;
  watchTime: number;
  uniqueViewers: number;
  devices: DeviceBreakdown[];
}

export interface DeviceBreakdown {
  deviceType: string; // 'android_tv', 'fire_tv', 'ios', etc.
  os?: string;
  appVersion?: string;
  count: number;
  avgWatchTime: number;
}

export interface ViewerBehavior {
  completionRate: number;
  dropoffRate: number;
  avgWatchTimePerContent: number;
  repeatViewerFrequency: number;
  topDropoffPoints: DropoffPoint[];
}

export interface DropoffPoint {
  contentId: string;
  contentTitle: string;
  timestamp: number;
  dropoffPercentage: number;
}

export interface CreatorAnalytics {
  creatorId: string;
  creatorName: string;
  views: number;
  watchTime: number;
  channelGrowth: number;
  aiGeneratedContent: number;
  uploadedContent: number;
  avgPerformance: number;
}

export interface StudioAnalytics {
  studioId: string;
  studioName: string;
  views: number;
  watchTime: number;
  channels: number;
  topChannels: ChannelRanking[];
}

export interface AnalyticsFilters {
  dateRange: {
    start: string;
    end: string;
  };
  channelIds?: string[];
  creatorIds?: string[];
  studioIds?: string[];
  platforms?: ('tv' | 'mobile' | 'web')[];
  countries?: string[];
}

export interface ContentEvent {
  eventType: 'start' | 'pause' | 'resume' | 'complete' | 'drop';
  channelId: string;
  contentId: string;
  viewerId: string;
  viewerIp: string;
  platform: 'android_tv' | 'fire_tv' | 'ios' | 'android' | 'web';
  deviceType: string;
  appVersion: string;
  timestamp: string;
}

export interface WatchSession {
  sessionId: string;
  viewerId: string;
  platform: string;
  deviceType: string;
  appVersion: string;
  startTime: string;
  endTime?: string;
  totalWatchTime: number;
}

export interface SupportTicket {
  id?: string;
  requesterId: string;
  requesterRole: 'creator' | 'studio' | 'broadcaster' | 'ops';
  tenantId: string;
  contextType: 'analytics' | 'playout' | 'channel' | 'content';
  contextId: string;
  category: 'analytics' | 'playout' | 'ai' | 'billing' | 'technical' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  subject: string;
  description: string;
  attachments?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TicketMessage {
  id?: string;
  ticketId: string;
  senderRole: 'user' | 'engineer' | 'system';
  senderId?: string;
  message: string;
  attachments?: string[];
  createdAt?: string;
}
