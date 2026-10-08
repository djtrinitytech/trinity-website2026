-- ==============================================================================
-- GALLERY TRINITY - PUBLIC.GALLERY2 SEED DATA
-- Target Supabase Project: https://aiqoevzducopcqsuyolo.supabase.co
-- Table: public.gallery2
-- Purpose: Initial seed data for Gallery Trinity default events and sample photos
-- ==============================================================================

INSERT INTO public.gallery2 (
    event_id,
    event_title,
    event_subtitle,
    event_year,
    event_pattern,
    event_palette,
    event_cover_image,
    photo_title,
    photo_url,
    photo_date,
    photo_location,
    frame_style
) VALUES
-- 1. Freshers '25
(
    'freshers',
    'FRESHERS ''25',
    'The Genesis & Night of Lights',
    '2025',
    'sunburst',
    '["#1b1d1f", "#e8572b", "#f0c94c"]'::jsonb,
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop',
    'Genesis Night Opening',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop',
    'Oct 12, 2025',
    'Main Auditorium',
    'baroque-gold'
),
(
    'freshers',
    'FRESHERS ''25',
    'The Genesis & Night of Lights',
    '2025',
    'sunburst',
    '["#1b1d1f", "#e8572b", "#f0c94c"]'::jsonb,
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop',
    'DJ Night Crowd',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop',
    'Oct 12, 2025',
    'Campus Lawns',
    'burnt-mahogany'
),

-- 2. Trinity Fest
(
    'trinity',
    'TRINITY FEST',
    'Annual Flagship Cultural Extravaganza',
    '2025',
    'eclipse',
    '["#141414", "#e9e4da", "#c8a24a"]'::jsonb,
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop',
    'Main Stage Concert',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop',
    'Feb 20, 2025',
    'Trinity Arena',
    'baroque-gold'
),

-- 3. Carnival
(
    'carnival',
    'CARNIVAL',
    'Street Food, Games & Rides',
    '2025',
    'mosaic',
    '["#f2e3c6", "#d2452b", "#2a5d8f"]'::jsonb,
    'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?q=80&w=800&auto=format&fit=crop',
    'Carnival Lights',
    'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?q=80&w=800&auto=format&fit=crop',
    'Mar 05, 2025',
    'Quadrangle',
    'broken-victorian'
),

-- 4. Farewell Night
(
    'farewell',
    'FAREWELL NIGHT',
    'A Nostalgic Toast to the Graduates',
    '2024',
    'horizon',
    '["#2d3f7a", "#e8b4c8", "#f4efe6"]'::jsonb,
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop',
    'Graduation Celebration',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop',
    'May 18, 2024',
    'Grand Banquet Hall',
    'chipped-wood'
),

-- 5. Sports Meet
(
    'sports',
    'SPORTS MEET',
    'Championship Glory & Athletics',
    '2024',
    'stripes',
    '["#d9e3df", "#16443f", "#f08a5d"]'::jsonb,
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800&auto=format&fit=crop',
    'Track Championship',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800&auto=format&fit=crop',
    'Dec 10, 2024',
    'Sports Complex',
    'baroque-gold'
),

-- 6. Cultural Eve
(
    'cultural',
    'CULTURAL EVE',
    'Dances, Drama & Fashion Runway',
    '2024',
    'rings',
    '["#e9e6df", "#1d1d1d", "#d84b3c"]'::jsonb,
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
    'Fashion Runway Show',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
    'Nov 22, 2024',
    'Open Air Theatre',
    'burnt-mahogany'
);
