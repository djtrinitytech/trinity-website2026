-- ==============================================================================
-- GALLERY TRINITY - SINGLE ISOLATED TABLE SCHEMA & PUBLIC READ RLS
-- Target Supabase Project: https://aiqoevzducopcqsuyolo.supabase.co
-- Table: public.gallery2
-- Purpose: Complete, self-contained single table for DJS Trinity Gallery
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.gallery2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT NOT NULL,
    event_title TEXT NOT NULL,
    event_subtitle TEXT,
    event_year TEXT,
    event_pattern TEXT DEFAULT 'sunburst',
    event_palette JSONB DEFAULT '["#1b1d1f", "#e8572b", "#f0c94c"]'::jsonb,
    event_cover_image TEXT,
    photo_title TEXT NOT NULL DEFAULT 'Untitled Photo',
    photo_url TEXT NOT NULL,
    storage_path TEXT,
    photo_date TEXT,
    photo_location TEXT DEFAULT 'Gallery Trinity',
    frame_style TEXT DEFAULT 'baroque-gold',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance when fetching/grouping gallery items by event
CREATE INDEX IF NOT EXISTS idx_gallery2_event_id ON public.gallery2 (event_id);
CREATE INDEX IF NOT EXISTS idx_gallery2_created_at ON public.gallery2 (created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.gallery2 ENABLE ROW LEVEL SECURITY;

-- Public Read-Only Policy
CREATE POLICY "Allow public read access on gallery2"
    ON public.gallery2
    FOR SELECT
    TO public
    USING (true);
