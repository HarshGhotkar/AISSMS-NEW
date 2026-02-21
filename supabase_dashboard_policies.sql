-- Run this if the dashboard cannot fetch data (RLS blocking reads)
-- Add SELECT policies so the anon key can read for the demo user

-- Assessments table
CREATE POLICY "Allow anonymous select assessments" ON public.assessments
    FOR SELECT
    USING (true);

-- Activity logs table (create policy only if the table exists)
CREATE POLICY "Allow anonymous select activity_logs" ON public.activity_logs
    FOR SELECT
    USING (true);
