"""Shared Supabase client."""
from supabase import create_client, Client

SUPABASE_URL = "https://gqtqlmqdpqnqdlyjbpis.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxdHFsbXFkcHFucWRseWpicGlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NTIzNDgsImV4cCI6MjA4NzIyODM0OH0.QFynd-7TN0yeO0WPVgL8xTx_svlY2l3nwA91jHRoGUU"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
