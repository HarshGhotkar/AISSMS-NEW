from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import google.generativeai as genai
import json

from db import supabase
from auth_router import router as auth_router
from swot_router import router as swot_router

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. AI Brain Setup ---
genai.configure(api_key="AIzaSyDmYOhfY1HNdfp1ww9vHDbqCvRd-HtqkX4")

# Routers
app.include_router(auth_router)
app.include_router(swot_router)

class ActivityPayload(BaseModel):
    user_id: str
    activity_summary: str
    timestamp: str

class AssessmentSubmission(BaseModel):
    user_id: str
    scenario_question: str
    student_answer: str

class AnalyzeActivityPayload(BaseModel):
    user_id: str
    window_history: list[str]
    collected_at: str | None = None  # ISO timestamp when batch was captured (user's machine)

@app.get("/")
def read_root():
    return {"status": "Hackathon Backend is LIVE 🚀"}

@app.post("/log-activity")
def log_activity(payload: ActivityPayload):
    print(f"\n[RECEIVED FROM AGENT] User {payload.user_id} was doing: {payload.activity_summary}")
    
    try:
        # Save the desktop agent's findings directly to the cloud database
        supabase.table('activity_logs').insert({
            "user_id": payload.user_id,
            "summary": payload.activity_summary,
            "logged_at": payload.timestamp
        }).execute()
        print("-> Successfully saved to Supabase 'activity_logs' table.")
    except Exception as e:
        print(f"Database Error: {e}")
        
    return {"message": "Activity logged successfully", "status": "success"}

@app.post("/analyze-activity")
def analyze_activity(payload: AnalyzeActivityPayload):
    """Analyze window history with Gemini and save to activity_logs."""
    if not payload.window_history:
        return {"summary": "No activity to analyze", "status": "skipped"}

    window_list = " → ".join(payload.window_history)
    prompt = f"""Analyze this exact sequence of apps/windows the user switched between (in order):

"{window_list}"

Write ONE sentence describing what they were doing. Rules:
1. MUST mention at least 1–2 specific app names from the list (e.g. "Chrome", "Excel", "Notepad", "VS Code")
2. Describe the CONCRETE activity (e.g. "browsing docs in Chrome while coding in VS Code", "taking notes in Notepad while watching a video")
3. NEVER use the phrase "software development" or "IDE and API documentation" — use different wording
4. Vary your phrasing: use "coding", "editing", "browsing", "researching" etc. based on the actual apps
5. If the apps suggest learning → say "learning" or "studying". If productivity → "working on" or "managing". Be specific.

One sentence only, no quotes."""

    try:
        model = genai.GenerativeModel(
            "gemini-2.5-flash",
            generation_config={"temperature": 0.9},
        )
        response = model.generate_content(prompt)
        summary = response.text.strip().strip('"')

        logged_at = payload.collected_at or datetime.now().isoformat()
        try:
            supabase.table("activity_logs").insert({
                "user_id": payload.user_id,
                "summary": summary,
                "logged_at": logged_at,
            }).execute()
            print(f"[AI ANALYSIS] {summary}")
            print("-> Saved to activity_logs")
        except Exception as e:
            print(f"DB save failed: {e}")

        return {"summary": summary, "status": "success"}
    except Exception as e:
        print(f"AI analysis error: {e}")
        return {"summary": str(e), "status": "error"}

@app.get("/student-activity-insights")
def student_activity_insights(user_id: str = Query(default="hackathon_demo_user")):
    """Fetch recent activity_logs and run comprehensive AI analysis for the student."""
    try:
        res = supabase.table("activity_logs").select("summary, logged_at").eq("user_id", user_id).order("logged_at", desc=True).limit(25).execute()
        logs = res.data or []
    except Exception as e:
        return {"error": str(e), "insights": None}

    if not logs:
        return {
            "insights": {
                "what_they_are_doing": "No activity recorded yet.",
                "should_do": ["Keep using your computer normally — the desktop agent will track and analyze your activity."],
                "should_not_do": [],
                "overall_analysis": "Start working to see personalized insights.",
                "recommendations": [],
            },
        }

    activity_text = "\n".join([f"- {log['summary']} (at {log['logged_at']})" for log in logs])

    prompt = f"""You are a student productivity coach. Analyze this student's recent desktop activity and provide a comprehensive assessment.

RECENT ACTIVITY LOG:
{activity_text}

Output valid JSON only, no other text:
{{
  "what_they_are_doing": "2-3 sentence summary of what the student has been doing based on the activity.",
  "should_do": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "should_not_do": ["habit to avoid 1", "habit to avoid 2"],
  "overall_analysis": "3-4 sentence overall analysis: their focus areas, productivity patterns, and strengths.",
  "recommendations": ["next step 1", "next step 2"]
}}"""

    try:
        model = genai.GenerativeModel(
            "gemini-2.5-flash",
            generation_config={"response_mime_type": "application/json", "temperature": 0.7},
        )
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0]
        insights = json.loads(text)
        return {"insights": insights}
    except Exception as e:
        return {"error": str(e), "insights": None}

@app.post("/evaluate")
def evaluate_submission(payload: AssessmentSubmission):
    print(f"\n[EVALUATING SUBMISSION] Grading answer for user: {payload.user_id}...")
    
    system_prompt = """
    You are an expert technical assessor. Evaluate the student's answer to the scenario.
    You must output ONLY valid JSON in this exact format:
    {
      "problem_solving_score": 8,
      "conceptual_clarity_score": 7,
      "practical_skill_score": 9,
      "feedback": "2 sentences of personalized, constructive feedback",
      "recommended_next_topic": "1 specific sub-topic to study"
    }
    """
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash',
                                      generation_config={"response_mime_type": "application/json"})

        prompt = f"{system_prompt}\n\nScenario: {payload.scenario_question}\nStudent Answer: {payload.student_answer}"
        response = model.generate_content(prompt)
        result = json.loads(response.text)

        print(f"[AI GRADE GENERATED] {result}")

        # Save the AI's grading rubric to Supabase (optional - grade is returned even if this fails)
        try:
            supabase.table('assessments').insert({
                "user_id": payload.user_id,
                "scenario_question": payload.scenario_question,
                "student_answer": payload.student_answer,
                "problem_solving_score": result.get("problem_solving_score", 0),
                "conceptual_clarity_score": result.get("conceptual_clarity_score", 0),
                "practical_skill_score": result.get("practical_skill_score", 0),
                "feedback": result.get("feedback", "No feedback provided."),
                "recommended_next_topic": result.get("recommended_next_topic", "General Review"),
            }).execute()
            print("-> Successfully saved grade to Supabase 'assessments' table.")
        except Exception as db_err:
            print(f"-> DB save failed (create the 'assessments' table in Supabase): {db_err}")

        return result

    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e)}