import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth,type StudentSignUpData, type TeacherSignUpData } from '../contexts/AuthContext'

const SKILL_OPTIONS = [
  'Python', 'JavaScript', 'React', 'Node.js', 'Java', 'C++', 'SQL', 'Data Structures',
  'Algorithms', 'Machine Learning', 'Communication', 'Teamwork', 'Problem Solving',
]

const SUBJECT_OPTIONS = [
  'Mathematics', 'Programming', 'DBMS', 'OS', 'Networks', 'AI/ML', 'Web Dev',
  'Mobile Dev', 'Cloud', 'DevOps',
]

export default function SignUp() {
  const [role, setRole] = useState<'student' | 'teacher'>('student')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUpStudent, signUpTeacher } = useAuth()
  const navigate = useNavigate()

  const [studentForm, setStudentForm] = useState<StudentSignUpData>({
    full_name: '',
    email: '',
    password: '',
    mobile: '',
    prn: '',
    department: '',
    year_semester: '',
    skills: [],
    interests: '',
    career_goal: '',
    learning_style: '',
    strength_areas: '',
    weak_areas: '',
  })

  const [teacherForm, setTeacherForm] = useState<TeacherSignUpData>({
    full_name: '',
    email: '',
    password: '',
    mobile: '',
    department: '',
    subjects: [],
    experience: '',
    specialization: '',
  })

  function toggleSkill(s: string) {
    setStudentForm((f) => ({
      ...f,
      skills: f.skills.includes(s) ? f.skills.filter((x) => x !== s) : [...f.skills, s],
    }))
  }

  function toggleSubject(s: string) {
    setTeacherForm((f) => ({
      ...f,
      subjects: f.subjects.includes(s) ? f.subjects.filter((x) => x !== s) : [...f.subjects, s],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (role === 'student') {
        await signUpStudent(studentForm)
      } else {
        await signUpTeacher(teacherForm)
      }
      if (role === 'student') {
        navigate('/swot', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] py-12 px-6">
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-500/[0.03] via-transparent to-violet-500/[0.03] pointer-events-none" />
      <div className="relative max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Account</h1>
          <p className="text-zinc-500 text-sm mt-1">Join SkillSync as a student or teacher</p>
          <div className="flex justify-center gap-4 mt-6">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`px-6 py-2 rounded-xl font-medium transition ${
                role === 'student'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`px-6 py-2 rounded-xl font-medium transition ${
                role === 'teacher'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              Teacher
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl shadow-black/20 space-y-5">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-zinc-400 text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={role === 'student' ? studentForm.full_name : teacherForm.full_name}
                  onChange={(e) =>
                    role === 'student'
                      ? setStudentForm((f) => ({ ...f, full_name: e.target.value }))
                      : setTeacherForm((f) => ({ ...f, full_name: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={role === 'student' ? studentForm.email : teacherForm.email}
                  onChange={(e) =>
                    role === 'student'
                      ? setStudentForm((f) => ({ ...f, email: e.target.value }))
                      : setTeacherForm((f) => ({ ...f, email: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-zinc-400 text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={role === 'student' ? studentForm.password : teacherForm.password}
                  onChange={(e) =>
                    role === 'student'
                      ? setStudentForm((f) => ({ ...f, password: e.target.value }))
                      : setTeacherForm((f) => ({ ...f, password: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition"
                  placeholder="Min 6 characters"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-sm font-medium mb-2">Mobile</label>
                <input
                  type="tel"
                  required
                  value={role === 'student' ? studentForm.mobile : teacherForm.mobile}
                  onChange={(e) =>
                    role === 'student'
                      ? setStudentForm((f) => ({ ...f, mobile: e.target.value }))
                      : setTeacherForm((f) => ({ ...f, mobile: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Department</label>
              <input
                type="text"
                required
                value={role === 'student' ? studentForm.department : teacherForm.department}
                onChange={(e) =>
                  role === 'student'
                    ? setStudentForm((f) => ({ ...f, department: e.target.value }))
                    : setTeacherForm((f) => ({ ...f, department: e.target.value }))
                }
                className="w-full px-4 py-3 rounded-xl bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition"
                placeholder="Computer Engineering"
              />
            </div>

            {role === 'student' && (
              <>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-zinc-400 text-sm font-medium mb-2">PRN</label>
                    <input
                      type="text"
                      required
                      value={studentForm.prn}
                      onChange={(e) => setStudentForm((f) => ({ ...f, prn: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition"
                      placeholder="22UEC001"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-sm font-medium mb-2">Year / Semester</label>
                    <input
                      type="text"
                      required
                      value={studentForm.year_semester}
                      onChange={(e) => setStudentForm((f) => ({ ...f, year_semester: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition"
                      placeholder="3rd Year / 5th Sem"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm font-medium mb-2">Skills (multi-select)</label>
                  <div className="flex flex-wrap gap-2">
                    {SKILL_OPTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSkill(s)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          studentForm.skills.includes(s)
                            ? 'bg-emerald-600 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm font-medium mb-2">Interests</label>
                  <input
                    type="text"
                    value={studentForm.interests}
                    onChange={(e) => setStudentForm((f) => ({ ...f, interests: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition"
                    placeholder="Web development, AI, etc."
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm font-medium mb-2">Career Goal</label>
                  <input
                    type="text"
                    value={studentForm.career_goal}
                    onChange={(e) => setStudentForm((f) => ({ ...f, career_goal: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition"
                    placeholder="Software Engineer, Data Scientist, etc."
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm font-medium mb-2">Learning Style</label>
                  <input
                    type="text"
                    value={studentForm.learning_style}
                    onChange={(e) => setStudentForm((f) => ({ ...f, learning_style: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition"
                    placeholder="Visual, Hands-on, Reading, etc."
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-zinc-400 text-sm font-medium mb-2">Strength Areas</label>
                    <input
                      type="text"
                      value={studentForm.strength_areas}
                      onChange={(e) => setStudentForm((f) => ({ ...f, strength_areas: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition"
                      placeholder="Programming, Math"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-sm font-medium mb-2">Weak Areas</label>
                    <input
                      type="text"
                      value={studentForm.weak_areas}
                      onChange={(e) => setStudentForm((f) => ({ ...f, weak_areas: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition"
                      placeholder="DBMS, Networking"
                    />
                  </div>
                </div>
              </>
            )}

            {role === 'teacher' && (
              <>
                <div>
                  <label className="block text-zinc-400 text-sm font-medium mb-2">Subjects (multi-select)</label>
                  <div className="flex flex-wrap gap-2">
                    {SUBJECT_OPTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSubject(s)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          teacherForm.subjects.includes(s)
                            ? 'bg-emerald-600 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm font-medium mb-2">Experience</label>
                  <input
                    type="text"
                    value={teacherForm.experience}
                    onChange={(e) => setTeacherForm((f) => ({ ...f, experience: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition"
                    placeholder="5 years in industry"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm font-medium mb-2">Specialization</label>
                  <input
                    type="text"
                    value={teacherForm.specialization}
                    onChange={(e) => setTeacherForm((f) => ({ ...f, specialization: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition"
                    placeholder="AI/ML, Web Development"
                  />
                </div>
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-zinc-500 text-sm">
          Already have an account?{' '}
          <Link to="/signin" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
