-- Run this in Supabase SQL Editor to create the assessments table
-- Dashboard: https://supabase.com/dashboard -> Your Project -> SQL Editor

CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    scenario_question TEXT NOT NULL,
    student_answer TEXT NOT NULL,
    problem_solving_score INTEGER,
    conceptual_clarity_score INTEGER,
    practical_skill_score INTEGER,
    feedback TEXT,
    recommended_next_topic TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) - optional, adjust policies as needed
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Allow anonymous insert (matches anon key) - adjust if you have auth
CREATE POLICY "Allow anonymous insert" ON public.assessments
    FOR INSERT
    WITH CHECK (true);
