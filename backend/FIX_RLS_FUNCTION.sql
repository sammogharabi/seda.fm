-- Fix the function search path security warning
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION get_user_id_from_auth()
RETURNS TEXT AS $$
  SELECT id FROM public.users WHERE supabase_id = auth.uid()::text;
$$ LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public;
