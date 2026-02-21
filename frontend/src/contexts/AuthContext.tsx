import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'

export type UserRole = 'student' | 'teacher'

export type AuthState = {
  user: {
    id: string
    email: string
    role: UserRole
    profile_complete: boolean
    swot_complete: boolean
  } | null
  token: string | null
  loading: boolean
}

type AuthContextType = AuthState & {
  signIn: (email: string, password: string) => Promise<{ role: UserRole; swot_complete: boolean }>
  signUpStudent: (data: StudentSignUpData) => Promise<void>
  signUpTeacher: (data: TeacherSignUpData) => Promise<void>
  signOut: () => void
  refreshUser: () => Promise<void>
}

export type StudentSignUpData = {
  full_name: string
  email: string
  password: string
  mobile: string
  prn: string
  department: string
  year_semester: string
  skills: string[]
  interests: string
  career_goal: string
  learning_style: string
  strength_areas: string
  weak_areas: string
}

export type TeacherSignUpData = {
  full_name: string
  email: string
  password: string
  mobile: string
  department: string
  subjects: string[]
  experience: string
  specialization: string
}

const AuthContext = createContext<AuthContextType | null>(null)
const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    loading: true,
  })

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setState((s) => ({ ...s, user: null, token: null, loading: false }))
      return
    }
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: getAuthHeaders(),
      })
      if (!res.ok) {
        localStorage.removeItem('token')
        setState((s) => ({ ...s, user: null, token: null, loading: false }))
        return
      }
      const data = await res.json()
      setState({
        user: {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
          profile_complete: data.profile_complete ?? false,
          swot_complete: data.swot_complete ?? false,
        },
        token,
        loading: false,
      })
    } catch {
      localStorage.removeItem('token')
      setState((s) => ({ ...s, user: null, token: null, loading: false }))
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const signIn = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail ?? 'Sign in failed')
    localStorage.setItem('token', data.access_token)
    const userData = {
      id: data.user_id,
      email,
      role: data.role,
      profile_complete: data.profile_complete ?? false,
      swot_complete: data.swot_complete ?? false,
    }
    setState({ user: userData, token: data.access_token, loading: false })
    return { role: data.role, swot_complete: data.swot_complete ?? false }
  }

  const signUpStudent = async (payload: StudentSignUpData) => {
    const res = await fetch(`${API_URL}/auth/signup/student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail ?? 'Sign up failed')
    localStorage.setItem('token', data.access_token)
    setState({
      user: {
        id: data.user_id,
        email: payload.email,
        role: 'student',
        profile_complete: true,
        swot_complete: false,
      },
      token: data.access_token,
      loading: false,
    })
  }

  const signUpTeacher = async (payload: TeacherSignUpData) => {
    const res = await fetch(`${API_URL}/auth/signup/teacher`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail ?? 'Sign up failed')
    localStorage.setItem('token', data.access_token)
    setState({
      user: {
        id: data.user_id,
        email: payload.email,
        role: 'teacher',
        profile_complete: true,
        swot_complete: true,
      },
      token: data.access_token,
      loading: false,
    })
  }

  const signOut = () => {
    localStorage.removeItem('token')
    setState({ user: null, token: null, loading: false })
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUpStudent,
        signUpTeacher,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
