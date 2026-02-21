# Authentication & Onboarding Module

## Overview

Complete Student-Teacher authentication with role-based dashboards, SWOT self-assessment, and JWT sessions.

---

## Database Setup

Run `supabase_auth_schema.sql` in the Supabase SQL Editor.

Tables created:
- **users** - email, password_hash, role (student|teacher)
- **student_profiles** - full_name, mobile, prn, department, year_semester, skills, interests, career_goal, learning_style, strength_areas, weak_areas
- **teacher_profiles** - full_name, mobile, department, subjects, experience, specialization
- **swot_analysis** - strengths, weaknesses, opportunities, threats (JSONB)

---

## API Endpoints

### Auth (prefix: `/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup/student` | Register student with profile |
| POST | `/auth/signup/teacher` | Register teacher with profile |
| POST | `/auth/signin` | Email + password login, returns JWT |
| GET | `/auth/me` | Get current user (requires `Authorization: Bearer <token>`) |

### SWOT (prefix: `/swot`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/swot` | Get current user's SWOT (auth required) |
| PUT | `/swot` | Create/update SWOT (auth required) |

---

## API Examples

### Student Sign Up

```json
POST /auth/signup/student
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "mobile": "9876543210",
  "prn": "2024001",
  "department": "CSE",
  "year_semester": "3rd Year",
  "skills": ["Python", "React"],
  "interests": "Web development",
  "career_goal": "Full-stack developer",
  "learning_style": "Visual",
  "strength_areas": "Problem solving",
  "weak_areas": "Time management"
}
```

### Teacher Sign Up

```json
POST /auth/signup/teacher
{
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securepass123",
  "mobile": "9876543210",
  "department": "CSE",
  "subjects": ["DBMS", "Algorithms"],
  "experience": "5 years",
  "specialization": "Database systems"
}
```

### Sign In

```json
POST /auth/signin
{
  "email": "john@example.com",
  "password": "securepass123"
}

Response:
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user_id": "uuid",
  "role": "student",
  "profile_complete": true,
  "swot_complete": false
}
```

---

## Flow Logic

**Student:** Sign Up → Login → SWOT Form (first time) → Dashboard

**Teacher:** Sign Up → Login → Dashboard

---

## Environment Variables

- `JWT_SECRET_KEY` - Secret for JWT signing (default: dev key)
- `VITE_API_URL` - Backend URL (default: http://127.0.0.1:8000)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key

---

## Run

```bash
# Backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend && npm install && npm run dev
```
