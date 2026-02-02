/**
 * IntuiTV Playout - TypeScript Type Definitions
 */

// Channel Types
export type ChannelStatus = 'live' | 'offline' | 'scheduled' | 'error';
export type ChannelType = 'linear' | 'vod' | 'live' | 'fast';

export interface Channel {
  id: string;
  name: string;
  status: ChannelStatus;
  type: ChannelType;
  viewers: number;
  hls_url: string;
  thumbnail: string;
  description?: string;
  created_at: string;
  updated_at: string;
  schedule_id?: string;
  bitrate?: number;
  resolution?: string;
}

// Schedule Types
export interface ScheduleItem {
  id: string;
  channel_id: string;
  asset_id: string;
  title: string;
  start_time: string;
  end_time: string;
  duration: number;
  status: 'scheduled' | 'playing' | 'completed' | 'failed';
  position: number;
  metadata?: Record<string, any>;
}

export interface Schedule {
  id: string;
  channel_id: string;
  name: string;
  items: ScheduleItem[];
  start_date: string;
  end_date: string;
  loop: boolean;
  created_at: string;
}

// Asset/Media Types
export type AssetType = 'video' | 'audio' | 'image' | 'subtitle' | 'overlay';
export type AssetStatus = 'uploading' | 'processing' | 'ready' | 'error' | 'archived';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  status: AssetStatus;
  file_url: string;
  thumbnail_url?: string;
  duration?: number;
  size: number;
  format: string;
  resolution?: string;
  bitrate?: number;
  codec?: string;
  tags: string[];
  metadata: AssetMetadata;
  created_at: string;
  updated_at: string;
}

export interface AssetMetadata {
  title?: string;
  description?: string;
  tags?: string[];
  category?: string;
  rating?: string;
  language?: string;
  subtitles?: string[];
  audio_tracks?: string[];
  intuitagger_labels?: IntuiTaggerLabel[];
}

export interface IntuiTaggerLabel {
  label: string;
  confidence: number;
  timestamp_start?: number;
  timestamp_end?: number;
}

// Video Project Types
export interface VideoProject {
  id: string;
  name: string;
  status: 'draft' | 'rendering' | 'complete' | 'error';
  timeline: Timeline;
  settings: ProjectSettings;
  created_at: string;
  updated_at: string;
  last_saved_at: string;
  thumbnail_url?: string;
}

export interface Timeline {
  duration: number;
  tracks: Track[];
}

export interface Track {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'text' | 'overlay';
  clips: Clip[];
  muted: boolean;
  locked: boolean;
  visible: boolean;
}

export interface Clip {
  id: string;
  asset_id: string;
  track_id: string;
  start: number;
  end: number;
  in_point: number;
  out_point: number;
  effects: Effect[];
  transitions: Transition[];
}

export interface Effect {
  id: string;
  type: string;
  parameters: Record<string, any>;
}

export interface Transition {
  id: string;
  type: 'fade' | 'dissolve' | 'wipe' | 'slide';
  duration: number;
  position: 'start' | 'end';
}

export interface ProjectSettings {
  resolution: '720p' | '1080p' | '4k';
  framerate: 24 | 25 | 30 | 50 | 60;
  aspect_ratio: '16:9' | '4:3' | '1:1' | '9:16';
  codec: 'h264' | 'h265' | 'prores';
  bitrate: number;
}

// AI Generation Types
export interface AIGenerationRequest {
  type: 'text_to_video' | 'image_to_video' | 'video_extend' | 'audio_generate';
  prompt: string;
  duration?: number;
  style?: string;
  aspect_ratio?: string;
  source_asset_id?: string;
  settings?: AIGenerationSettings;
}

export interface AIGenerationSettings {
  model?: string;
  quality?: 'draft' | 'standard' | 'high';
  fps?: number;
  seed?: number;
}

export interface AIGenerationJob {
  id: string;
  status: 'queued' | 'processing' | 'complete' | 'failed';
  progress: number;
  request: AIGenerationRequest;
  result_asset_id?: string;
  error?: string;
  created_at: string;
  completed_at?: string;
}

// Social Media Types
export type SocialPlatform = 'youtube' | 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'tiktok';

export interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  account_name: string;
  account_id: string;
  connected: boolean;
  avatar_url?: string;
  followers?: number;
}

export interface SocialPost {
  id: string;
  asset_id: string;
  platforms: SocialPlatform[];
  title: string;
  description: string;
  tags: string[];
  schedule_time?: string;
  status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';
  results: SocialPostResult[];
  created_at: string;
}

export interface SocialPostResult {
  platform: SocialPlatform;
  status: 'pending' | 'success' | 'failed';
  post_url?: string;
  post_id?: string;
  error?: string;
  metrics?: {
    views?: number;
    likes?: number;
    shares?: number;
    comments?: number;
  };
}

// Analytics Types
export interface ChannelAnalytics {
  channel_id: string;
  period: string;
  viewers: {
    current: number;
    peak: number;
    average: number;
    total_unique: number;
  };
  engagement: {
    watch_time_minutes: number;
    avg_view_duration: number;
    completion_rate: number;
  };
  geographic: {
    country: string;
    viewers: number;
    percentage: number;
  }[];
  devices: {
    type: string;
    percentage: number;
  }[];
  timeline: {
    timestamp: string;
    viewers: number;
    bitrate: number;
  }[];
}

export interface ContentAnalytics {
  asset_id: string;
  views: number;
  unique_viewers: number;
  avg_watch_time: number;
  completion_rate: number;
  engagement_score: number;
  top_segments: {
    start: number;
    end: number;
    replays: number;
  }[];
}

// System Health Types
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  services: ServiceHealth[];
  metrics: {
    cpu_usage: number;
    memory_usage: number;
    gpu_usage: number;
    storage_used: number;
    storage_total: number;
    active_transcodes: number;
    queue_depth: number;
  };
  alerts: SystemAlert[];
}

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latency_ms: number;
  last_check: string;
  error?: string;
}

export interface SystemAlert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  service: string;
  timestamp: string;
  acknowledged: boolean;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: 'admin' | 'editor' | 'viewer';
  subscription_status: 'trial' | 'active' | 'expired' | 'cancelled';
  subscription_tier: 'free' | 'pro' | 'enterprise';
  trial_end?: string;
  storage_used: number;
  storage_limit: number;
  created_at: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ApiError {
  error: string;
  message: string;
  status: number;
  details?: Record<string, any>;
}
