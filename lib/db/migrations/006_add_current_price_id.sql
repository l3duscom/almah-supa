-- Migration: Add current_price_id to users table
-- Created: 2025-01-13
-- Description: Add field to track user's current Stripe price ID for plan changes

-- Add current_price_id column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS current_price_id TEXT;