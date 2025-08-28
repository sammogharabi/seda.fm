-- Create feature_flags table for Edge Functions
-- This table stores feature flags for different environments

CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT false,
    environment TEXT NOT NULL CHECK (environment IN ('qa', 'sandbox', 'production')),
    description TEXT,
    rollout_percentage DECIMAL(5,2) CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(key, environment)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_feature_flags_key_env ON feature_flags(key, environment);
CREATE INDEX IF NOT EXISTS idx_feature_flags_environment ON feature_flags(environment);

-- Add RLS policies for security
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything
CREATE POLICY "Service role can manage feature flags" ON feature_flags
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Policy: Authenticated users can read flags for their environment
CREATE POLICY "Users can read feature flags" ON feature_flags
    FOR SELECT USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_feature_flags_updated_at
    BEFORE UPDATE ON feature_flags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default feature flags for all environments
INSERT INTO feature_flags (key, enabled, environment, description) VALUES
    ('artist_verification', true, 'qa', 'Enable artist verification flow'),
    ('admin_dashboard', true, 'qa', 'Enable admin dashboard features'),
    ('posthog_analytics', true, 'qa', 'Enable PostHog analytics tracking'),
    ('rate_limiting', false, 'qa', 'Enable rate limiting for API endpoints'),
    
    ('artist_verification', true, 'sandbox', 'Enable artist verification flow'),
    ('admin_dashboard', true, 'sandbox', 'Enable admin dashboard features'),
    ('posthog_analytics', true, 'sandbox', 'Enable PostHog analytics tracking'),
    ('rate_limiting', true, 'sandbox', 'Enable rate limiting for API endpoints'),
    
    ('artist_verification', true, 'production', 'Enable artist verification flow'),
    ('admin_dashboard', true, 'production', 'Enable admin dashboard features'),
    ('posthog_analytics', true, 'production', 'Enable PostHog analytics tracking'),
    ('rate_limiting', true, 'production', 'Enable rate limiting for API endpoints')
ON CONFLICT (key, environment) DO NOTHING;