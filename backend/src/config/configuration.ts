export const configuration = () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',

  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
  },

  database: {
    url: process.env.DATABASE_URL,
  },

  security: {
    jwtSecret: process.env.JWT_SECRET,
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    adminApiKey: process.env.ADMIN_API_KEY,
  },

  crawler: {
    userAgent: process.env.CRAWLER_USER_AGENT || 'Mozilla/5.0 (compatible; SedaBot/1.0)',
    timeoutMs: parseInt(process.env.CRAWLER_TIMEOUT_MS || '30000', 10),
    maxRetries: parseInt(process.env.CRAWLER_MAX_RETRIES || '3', 10),
  },

  rateLimit: {
    verificationPerDay: parseInt(process.env.RATE_LIMIT_VERIFICATION_PER_DAY || '3', 10),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '86400000', 10),
  },

  verification: {
    codeLength: parseInt(process.env.VERIFICATION_CODE_LENGTH || '8', 10),
    codeExpiryDays: parseInt(process.env.VERIFICATION_CODE_EXPIRY_DAYS || '7', 10),
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    connectClientId: process.env.STRIPE_CONNECT_CLIENT_ID,
  },

  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    mode: (process.env.PAYPAL_MODE || 'sandbox') as 'sandbox' | 'live',
  },

  email: {
    sendgridApiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.EMAIL_FROM || 'noreply@seda.fm',
    fromName: process.env.EMAIL_FROM_NAME || 'sedā',
  },

  app: {
    frontendUrl: process.env.FRONTEND_URL || 'https://seda.fm',
  },
});
