-- AISSMS Authentication & Onboarding Schema
-- Run in Supabase SQL Editor: https://supabase.com/dashboard -> Your Project -> SQL Editor

-- ============ USERS TABLE ============
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ STUDENT PROFILES TABLE ============
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    full_name TEXT,
    mobile TEXT,
    prn TEXT,
    department TEXT,
    year_semester TEXT,
    skills JSONB DEFAULT '[]'::jsonb,
    interests TEXT,
    career_goal TEXT,
    learning_style TEXT,
    strength_areas TEXT,
    weak_areas TEXT,
    profile_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============ TEACHER PROFILES TABLE ============
CREATE TABLE IF NOT EXISTS public.teacher_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    full_name TEXT,
    mobile TEXT,
    department TEXT,
    subjects JSONB DEFAULT '[]'::jsonb,
    experience TEXT,
    specialization TEXT,
    profile_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============ SWOT ANALYSIS TABLE ============
CREATE TABLE IF NOT EXISTS public.swot_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    strengths JSONB DEFAULT '{"technical":[],"soft":[],"subjects":[]}'::jsonb,
    weaknesses JSONB DEFAULT '{"subjects":[],"habits":[],"gaps":[]}'::jsonb,
    opportunities JSONB DEFAULT '{"internships":[],"certs":[],"projects":[],"competitions":[]}'::jsonb,
    threats JSONB DEFAULT '{"time":[],"resources":[],"distractions":[],"confidence":[]}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON public.student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_teacher_profiles_user_id ON public.teacher_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_swot_analysis_user_id ON public.swot_analysis(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swot_analysis ENABLE ROW LEVEL SECURITY;

-- Policies for anon key (backend uses service key for full access)
-- Allow full access for demo; restrict in production with JWT-based policies
CREATE POLICY "Users allow all" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Student profiles allow all" ON public.student_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Teacher profiles allow all" ON public.teacher_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "SWOT analysis allow all" ON public.swot_analysis FOR ALL USING (true) WITH CHECK (true);
