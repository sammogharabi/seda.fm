/**
 * Shared types for Sedā.fm Edge Functions
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PostHogEvent {
  event: string;
  properties: Record<string, any>;
  environment: 'qa' | 'sandbox' | 'production';
}

export interface AdminContext {
  isAdmin: boolean;
  error?: string;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  environment: string;
  uptime: number;
  checks: Record<string, boolean>;
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  environment: string;
  description?: string;
  rollout_percentage?: number;
}

export interface MetricsData {
  timestamp: string;
  environment: string;
  metrics: {
    active_users: number;
    verification_requests_today: number;
    verification_success_rate: number;
    avg_response_time_ms: number;
    errors_count: number;
  };
}