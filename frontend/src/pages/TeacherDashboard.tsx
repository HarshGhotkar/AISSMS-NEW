import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function TeacherDashboard() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <div className="fixed inset-0 bg-gradient-to-br from-violet-500/[0.03] via-transparent to-cyan-500/[0.03] pointer-events-none" />

      <header className="relative border-b border-zinc-800/80 bg-[#0a0a0b]/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">SkillSync</h1>
            <p className="text-zinc-500 text-sm mt-0.5 font-medium">Teacher Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 text-sm">{user.email}</span>
                <button
                  onClick={signOut}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-300 hover:text-red-400 text-sm font-medium transition"
                >
                  Sign Out
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-violet-400 text-sm font-medium">Live</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center mb-4 text-2xl">👥</div>
            <h3 className="text-lg font-semibold text-white mb-2">Manage Students</h3>
            <p className="text-zinc-500 text-sm">View and assess student progress and SWOT analyses.</p>
          </div>
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4 text-2xl">📋</div>
            <h3 className="text-lg font-semibold text-white mb-2">Assessments</h3>
            <p className="text-zinc-500 text-sm">Create and grade scenario-based assessments.</p>
          </div>
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4 text-2xl">📊</div>
            <h3 className="text-lg font-semibold text-white mb-2">Analytics</h3>
            <p className="text-zinc-500 text-sm">Track skill development across your students.</p>
          </div>
        </div>

        <div className="mt-10 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-4">Welcome, Teacher</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Your dashboard is ready. Student management, assessments, and analytics features will be available as the platform expands.
          </p>
        </div>
      </main>
    </div>
  )
}
