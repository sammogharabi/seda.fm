// Sentry configuration for error tracking
// To enable Sentry, set VITE_SENTRY_DSN in your environment variables

interface SentryConfig {
  dsn: string;
  environment: string;
  release?: string;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
}

interface SentryUser {
  id?: string;
  email?: string;
  username?: string;
}

interface SentryBreadcrumb {
  category: string;
  message: string;
  level?: 'debug' | 'info' | 'warning' | 'error';
  data?: Record<string, unknown>;
}

class SentryService {
  private initialized = false;
  private config: SentryConfig | null = null;

  async init(): Promise<void> {
    const dsn = import.meta.env.VITE_SENTRY_DSN;

    if (!dsn) {
      if (import.meta.env.DEV) {
        console.log('[Sentry] DSN not configured - error tracking disabled');
      }
      return;
    }

    this.config = {
      dsn,
      environment: import.meta.env.MODE || 'development',
      release: import.meta.env.VITE_APP_VERSION,
      tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
      replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 0,
      replaysOnErrorSampleRate: import.meta.env.PROD ? 1.0 : 0,
    };

    try {
      // Dynamic import to avoid loading Sentry in development if not needed
      const Sentry = await import('@sentry/react');

      Sentry.init({
        dsn: this.config.dsn,
        environment: this.config.environment,
        release: this.config.release,
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
          }),
        ],
        tracesSampleRate: this.config.tracesSampleRate,
        replaysSessionSampleRate: this.config.replaysSessionSampleRate,
        replaysOnErrorSampleRate: this.config.replaysOnErrorSampleRate,
        // Don't send errors in development unless explicitly enabled
        enabled: import.meta.env.PROD || import.meta.env.VITE_SENTRY_ENABLED === 'true',
        // Filter out known non-actionable errors
        beforeSend(event, hint) {
          const error = hint.originalException;
          if (error instanceof Error) {
            // Filter out network errors that we can't do anything about
            if (error.message.includes('Network request failed')) {
              return null;
            }
            // Filter out aborted requests
            if (error.name === 'AbortError') {
              return null;
            }
          }
          return event;
        },
      });

      // Make Sentry available globally for ErrorBoundary
      (window as unknown as { Sentry: typeof Sentry }).Sentry = Sentry;

      this.initialized = true;
      console.log('[Sentry] Initialized successfully');
    } catch (error) {
      console.error('[Sentry] Failed to initialize:', error);
    }
  }

  setUser(user: SentryUser | null): void {
    if (!this.initialized) return;

    import('@sentry/react').then((Sentry) => {
      if (user) {
        Sentry.setUser(user);
      } else {
        Sentry.setUser(null);
      }
    });
  }

  captureException(error: Error, context?: Record<string, unknown>): void {
    if (!this.initialized) {
      console.error('[Sentry not initialized] Error:', error, context);
      return;
    }

    import('@sentry/react').then((Sentry) => {
      Sentry.captureException(error, {
        extra: context,
      });
    });
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    if (!this.initialized) {
      console.log(`[Sentry not initialized] ${level}: ${message}`);
      return;
    }

    import('@sentry/react').then((Sentry) => {
      Sentry.captureMessage(message, level);
    });
  }

  addBreadcrumb(breadcrumb: SentryBreadcrumb): void {
    if (!this.initialized) return;

    import('@sentry/react').then((Sentry) => {
      Sentry.addBreadcrumb({
        ...breadcrumb,
        timestamp: Date.now() / 1000,
      });
    });
  }

  setTag(key: string, value: string): void {
    if (!this.initialized) return;

    import('@sentry/react').then((Sentry) => {
      Sentry.setTag(key, value);
    });
  }
}

export const sentry = new SentryService();

// Helper function to capture errors with context
export function captureError(error: Error, context?: Record<string, unknown>): void {
  sentry.captureException(error, context);
}

// Helper for tracking user actions
export function trackAction(category: string, action: string, data?: Record<string, unknown>): void {
  sentry.addBreadcrumb({
    category,
    message: action,
    level: 'info',
    data,
  });
}

export default sentry;
