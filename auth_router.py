"""Auth router: signup, signin, me."""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from supabase import Client

from auth_utils import (
    hash_password,
    verify_password,
    create_access_token,
    decode_token,
)
from db import supabase

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer(auto_error=False)


# --------------- Request/Response Models ---------------
class StudentSignUp(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    mobile: str
    prn: str
    department: str
    year_semester: str
    skills: list[str] = []
    interests: str = ""
    career_goal: str = ""
    learning_style: str = ""
    strength_areas: str = ""
    weak_areas: str = ""


class TeacherSignUp(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    mobile: str
    department: str
    subjects: list[str] = []
    experience: str = ""
    specialization: str = ""


class SignIn(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: str
    profile_complete: bool
    swot_complete: bool = False


# --------------- Dependencies ---------------
def get_current_user_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> str:
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload.get("user_id", "")


# --------------- Endpoints ---------------
@router.post("/signup/student", response_model=TokenResponse)
def signup_student(payload: StudentSignUp):
    """Register a new student with profile."""
    res = supabase.table("users").select("id").eq("email", payload.email).execute()
    if res.data and len(res.data) > 0:
        raise HTTPException(status_code=400, detail="Email already registered")

    password_hash = hash_password(payload.password)
    user_row = {
        "email": payload.email,
        "password_hash": password_hash,
        "role": "student",
    }
    user_res = supabase.table("users").insert(user_row).execute()
    if not user_res.data:
        raise HTTPException(status_code=500, detail="Failed to create user")
    user_id = user_res.data[0]["id"]

    profile_row = {
        "user_id": user_id,
        "full_name": payload.full_name,
        "mobile": payload.mobile,
        "prn": payload.prn,
        "department": payload.department,
        "year_semester": payload.year_semester,
        "skills": payload.skills,
        "interests": payload.interests,
        "career_goal": payload.career_goal,
        "learning_style": payload.learning_style,
        "strength_areas": payload.strength_areas,
        "weak_areas": payload.weak_areas,
        "profile_complete": True,
    }
    supabase.table("student_profiles").insert(profile_row).execute()

    token = create_access_token({"user_id": user_id, "role": "student"})
    return TokenResponse(
        access_token=token,
        user_id=user_id,
        role="student",
        profile_complete=True,
        swot_complete=False,
    )


@router.post("/signup/teacher", response_model=TokenResponse)
def signup_teacher(payload: TeacherSignUp):
    """Register a new teacher with profile."""
    res = supabase.table("users").select("id").eq("email", payload.email).execute()
    if res.data and len(res.data) > 0:
        raise HTTPException(status_code=400, detail="Email already registered")

    password_hash = hash_password(payload.password)
    user_row = {
        "email": payload.email,
        "password_hash": password_hash,
        "role": "teacher",
    }
    user_res = supabase.table("users").insert(user_row).execute()
    if not user_res.data:
        raise HTTPException(status_code=500, detail="Failed to create user")
    user_id = user_res.data[0]["id"]

    profile_row = {
        "user_id": user_id,
        "full_name": payload.full_name,
        "mobile": payload.mobile,
        "department": payload.department,
        "subjects": payload.subjects,
        "experience": payload.experience,
        "specialization": payload.specialization,
        "profile_complete": True,
    }
    supabase.table("teacher_profiles").insert(profile_row).execute()

    token = create_access_token({"user_id": user_id, "role": "teacher"})
    return TokenResponse(
        access_token=token,
        user_id=user_id,
        role="teacher",
        profile_complete=True,
        swot_complete=True,
    )


@router.post("/signin", response_model=TokenResponse)
def signin(payload: SignIn):
    """Sign in with email and password."""
    res = supabase.table("users").select("id, password_hash, role").eq("email", payload.email).execute()
    if not res.data or len(res.data) == 0:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user = res.data[0]
    if not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id = user["id"]
    role = user["role"]
    profile_complete = False
    swot_complete = False

    if role == "student":
        prof = supabase.table("student_profiles").select("profile_complete").eq("user_id", user_id).execute()
        if prof.data and prof.data[0].get("profile_complete"):
            profile_complete = True
        swot_res = supabase.table("swot_analysis").select("id").eq("user_id", user_id).execute()
        swot_complete = bool(swot_res.data and len(swot_res.data) > 0)
    else:
        prof = supabase.table("teacher_profiles").select("profile_complete").eq("user_id", user_id).execute()
        if prof.data and prof.data[0].get("profile_complete"):
            profile_complete = True

    token = create_access_token({"user_id": user_id, "role": role})
    return TokenResponse(
        access_token=token,
        user_id=user_id,
        role=role,
        profile_complete=profile_complete,
        swot_complete=swot_complete,
    )


@router.get("/me")
def me(user_id: str = Depends(get_current_user_id)):
    """Get current user info (protected)."""
    res = supabase.table("users").select("id, email, role, created_at").eq("id", user_id).execute()
    if not res.data or len(res.data) == 0:
        raise HTTPException(status_code=404, detail="User not found")
    user = res.data[0]
    profile_complete = False
    profile = None
    swot_complete = False
    if user["role"] == "student":
        prof = supabase.table("student_profiles").select("*").eq("user_id", user_id).execute()
        if prof.data:
            profile = prof.data[0]
            profile_complete = profile.get("profile_complete", False)
        swot_res = supabase.table("swot_analysis").select("id").eq("user_id", user_id).execute()
        swot_complete = bool(swot_res.data and len(swot_res.data) > 0)
    else:
        prof = supabase.table("teacher_profiles").select("*").eq("user_id", user_id).execute()
        if prof.data:
            profile = prof.data[0]
            profile_complete = profile.get("profile_complete", False)
        swot_complete = True
    return {"user": user, "profile": profile, "profile_complete": profile_complete, "swot_complete": swot_complete}
