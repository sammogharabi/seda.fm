-- ===========================================
-- SEDA Production Diagnostic
-- Run this first to see what exists in the database
-- ===========================================

-- List all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- List all custom types (enums)
SELECT t.typname as enum_name,
       array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
GROUP BY t.typname;

-- Check rooms table columns if it exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'rooms' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check users table columns if it exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;
