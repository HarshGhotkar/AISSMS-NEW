import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { getAuthHeaders } from '../lib/api'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

type SWOTData = {
  strengths: { technical: string[]; soft: string[]; subjects: string[] }
  weaknesses: { subjects: string[]; habits: string[]; gaps: string[] }
  opportunities: { internships: string[]; certs: string[]; projects: string[]; competitions: string[] }
  threats: { time: string[]; resources: string[]; distractions: string[]; confidence: string[] }
}

type ActivityInsights = {
  what_they_are_doing: string
  should_do: string[]
  should_not_do: string[]
  overall_analysis: string
  recommendations: string[]
}

function formatActivityTime(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hr ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

type ActivityLog = {
  summary: string
  logged_at: string
}

type Assessment = {
  scenario_question: string
  problem_solving_score: number
  conceptual_clarity_score: number
  practical_skill_score: number
  feedback: string
  recommended_next_topic: string
}

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const userId = user?.id ?? 'hackathon_demo_user'
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [swotData, setSwotData] = useState<SWOTData | null>(null)
  const [insights, setInsights] = useState<ActivityInsights | null>(null)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchInsights() {
    setInsightsLoading(true)
    try {
      const res = await fetch(`${API_URL}/student-activity-insights?user_id=${userId}`)
      const data = await res.json()
      setInsights(data.insights ?? null)
    } catch {
      setInsights(null)
    } finally {
      setInsightsLoading(false)
    }
  }

  useEffect(() => {
    async function fetchSwot() {
      try {
        const res = await fetch(`${API_URL}/swot`, { headers: getAuthHeaders() })
        if (res.ok) {
          const json = await res.json()
          if (json.strengths) setSwotData(json)
        }
      } catch {
        setSwotData(null)
      }
    }
    fetchSwot()
  }, [])

  useEffect(() => {
    async function fetchData() {
      try {
        const [logsRes, assessmentsRes] = await Promise.all([
          supabase
            .from('activity_logs')
            .select('summary, logged_at')
            .eq('user_id', userId)
            .order('logged_at', { ascending: false })
            .limit(20),
          supabase
            .from('assessments')
            .select('scenario_question, problem_solving_score, conceptual_clarity_score, practical_skill_score, feedback, recommended_next_topic')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10),
        ])

        if (logsRes.error) throw logsRes.error
        if (assessmentsRes.error) throw assessmentsRes.error

        setActivityLogs(logsRes.data ?? [])
        setAssessments(assessmentsRes.data ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [userId])

  const avgProblemSolving = assessments.length
    ? assessments.reduce((a, b) => a + b.problem_solving_score, 0) / assessments.length
    : 0
  const avgConceptual = assessments.length
    ? assessments.reduce((a, b) => a + b.conceptual_clarity_score, 0) / assessments.length
    : 0
  const avgPractical = assessments.length
    ? assessments.reduce((a, b) => a + b.practical_skill_score, 0) / assessments.length
    : 0

  const skillData = [
    { label: 'Problem Solving', value: avgProblemSolving, color: 'bg-gradient-to-r from-emerald-500 to-teal-500', barBg: 'bg-emerald-500/10' },
    { label: 'Conceptual Clarity', value: avgConceptual, color: 'bg-gradient-to-r from-violet-500 to-purple-500', barBg: 'bg-violet-500/10' },
    { label: 'Practical Skill', value: avgPractical, color: 'bg-gradient-to-r from-cyan-500 to-blue-500', barBg: 'bg-cyan-500/10' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 rounded-xl border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
          <p className="text-zinc-500 text-sm font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-6">
        <div className="bg-zinc-900 border border-zinc-700/50 rounded-2xl p-8 max-w-md text-center shadow-xl shadow-black/20">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-xl">!</span>
          </div>
          <p className="text-red-400 font-semibold mb-2">Connection Error</p>
          <p className="text-zinc-400 text-sm mb-4">{error}</p>
          <p className="text-zinc-500 text-xs">
            Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-500/[0.03] via-transparent to-violet-500/[0.03] pointer-events-none" />

      <header className="relative border-b border-zinc-800/80 bg-[#0a0a0b]/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">SkillSync</h1>
            <p className="text-zinc-500 text-sm mt-0.5 font-medium">Student Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 text-sm">{user.email}</span>
                <Link
                  to="/swot"
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition"
                >
                  SWOT
                </Link>
                <button
                  onClick={signOut}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-300 hover:text-red-400 text-sm font-medium transition"
                >
                  Sign Out
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-glow">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-sm font-medium">Live</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
                <h2 className="text-xl font-semibold text-white">Skill Scores</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {skillData.map((skill) => (
                  <div
                    key={skill.label}
                    className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 hover:shadow-card-hover transition-all duration-200"
                  >
                    <p className="text-zinc-400 text-sm font-semibold mb-4 uppercase tracking-wider">{skill.label}</p>
                    <div className={`h-3 rounded-full overflow-hidden ${skill.barBg}`}>
                      <div
                        className={`h-full rounded-full ${skill.color} transition-all duration-700 ease-out`}
                        style={{ width: `${Math.min(100, (skill.value / 10) * 100)}%` }}
                      />
                    </div>
                    <p className="text-white font-bold text-2xl mt-4">{skill.value.toFixed(1)}<span className="text-zinc-500 font-normal text-base">/10</span></p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 rounded-full bg-gradient-to-b from-amber-500 to-orange-500" />
                  <h2 className="text-xl font-semibold text-white">Your Activity Report</h2>
                </div>
                <button
                  onClick={fetchInsights}
                  disabled={insightsLoading || activityLogs.length === 0}
                  className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-medium hover:bg-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {insightsLoading ? 'Analyzing...' : 'Generate Report'}
                </button>
              </div>
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden">
                {!insights ? (
                  <div className="p-10 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl">📊</span>
                    </div>
                    <p className="text-zinc-400 font-medium mb-1">Activity analysis not generated yet</p>
                    <p className="text-zinc-500 text-sm">Click &quot;Generate Report&quot; to analyze your recent desktop activity</p>
                  </div>
                ) : (
                  <div className="p-6 space-y-6">
                    <div>
                      <h3 className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2">What you&apos;re doing</h3>
                      <p className="text-zinc-300 text-sm leading-relaxed">{insights.what_they_are_doing}</p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <h3 className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">Should do</h3>
                        <ul className="space-y-2">
                          {insights.should_do.map((item, i) => (
                            <li key={i} className="text-zinc-300 text-sm flex gap-2">
                              <span className="text-emerald-400">✓</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                        <h3 className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-3">Should avoid</h3>
                        <ul className="space-y-2">
                          {insights.should_not_do.length ? insights.should_not_do.map((item, i) => (
                            <li key={i} className="text-zinc-300 text-sm flex gap-2">
                              <span className="text-red-400">✗</span> {item}
                            </li>
                          )) : (
                            <li className="text-zinc-500 text-sm">No specific habits to avoid</li>
                          )}
                        </ul>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2">Overall analysis</h3>
                      <p className="text-zinc-300 text-sm leading-relaxed">{insights.overall_analysis}</p>
                    </div>
                    {insights.recommendations.length > 0 && (
                      <div className="pt-4 border-t border-zinc-800">
                        <h3 className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-3">Recommendations</h3>
                        <ul className="space-y-2">
                          {insights.recommendations.map((item, i) => (
                            <li key={i} className="text-amber-400/90 text-sm flex gap-2">
                              <span className="text-amber-500">→</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 rounded-full bg-gradient-to-b from-violet-500 to-purple-500" />
                <h2 className="text-xl font-semibold text-white">AI Evaluator Feedback</h2>
              </div>
              <div className="space-y-5">
                {assessments.length === 0 ? (
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl">📋</span>
                    </div>
                    <p className="text-zinc-400 font-medium">No assessments yet</p>
                    <p className="text-zinc-500 text-sm mt-1">Complete a scenario to see AI feedback</p>
                  </div>
                ) : (
                  assessments.map((a, i) => (
                    <div
                      key={i}
                      className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 hover:shadow-card-hover transition-all duration-200"
                    >
                      <p className="text-zinc-200 text-sm font-medium mb-4 line-clamp-2 leading-relaxed">{a.scenario_question}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-semibold">
                          PS: {a.problem_solving_score}
                        </span>
                        <span className="px-3 py-1 rounded-lg bg-violet-500/15 text-violet-400 text-xs font-semibold">
                          CC: {a.conceptual_clarity_score}
                        </span>
                        <span className="px-3 py-1 rounded-lg bg-cyan-500/15 text-cyan-400 text-xs font-semibold">
                          PC: {a.practical_skill_score}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-sm leading-relaxed mb-4">{a.feedback}</p>
                      <div className="pt-4 border-t border-zinc-800">
                        <p className="text-zinc-500 text-xs font-medium">
                          Recommended next topic <span className="text-emerald-400 font-semibold">{a.recommended_next_topic}</span>
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            {swotData && (
              <section>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 rounded-full bg-gradient-to-b from-amber-500 to-orange-500" />
                    <h2 className="text-xl font-semibold text-white">Your SWOT</h2>
                  </div>
                  <Link
                    to="/swot"
                    className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
                  >
                    Edit
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-900/80 border border-emerald-500/20 rounded-xl p-4">
                    <p className="text-emerald-400 text-xs font-semibold mb-2">Strengths</p>
                    <p className="text-zinc-400 text-xs line-clamp-2">
                      {[...Object.values(swotData.strengths)].flat().slice(0, 4).join(', ') || '—'}
                    </p>
                  </div>
                  <div className="bg-zinc-900/80 border border-amber-500/20 rounded-xl p-4">
                    <p className="text-amber-400 text-xs font-semibold mb-2">Weaknesses</p>
                    <p className="text-zinc-400 text-xs line-clamp-2">
                      {[...Object.values(swotData.weaknesses)].flat().slice(0, 4).join(', ') || '—'}
                    </p>
                  </div>
                  <div className="bg-zinc-900/80 border border-cyan-500/20 rounded-xl p-4">
                    <p className="text-cyan-400 text-xs font-semibold mb-2">Opportunities</p>
                    <p className="text-zinc-400 text-xs line-clamp-2">
                      {[...Object.values(swotData.opportunities)].flat().slice(0, 4).join(', ') || '—'}
                    </p>
                  </div>
                  <div className="bg-zinc-900/80 border border-red-500/20 rounded-xl p-4">
                    <p className="text-red-400 text-xs font-semibold mb-2">Threats</p>
                    <p className="text-zinc-400 text-xs line-clamp-2">
                      {[...Object.values(swotData.threats)].flat().slice(0, 4).join(', ') || '—'}
                    </p>
                  </div>
                </div>
              </section>
            )}
            <section className="lg:sticky lg:top-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 rounded-full bg-gradient-to-b from-cyan-500 to-blue-500" />
                <h2 className="text-xl font-semibold text-white">Recent Desktop Activity</h2>
              </div>
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden">
                {activityLogs.length === 0 ? (
                  <div className="p-10 text-center">
                    <div className="w-14 h-14 rounded-xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">💻</span>
                    </div>
                    <p className="text-zinc-500 text-sm font-medium">No activity logged yet</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-zinc-800">
                    {activityLogs.map((log, i) => (
                      <li key={i} className="p-5 hover:bg-zinc-800/30 transition-colors">
                        <p className="text-zinc-300 text-sm font-medium leading-snug">{log.summary}</p>
                        <p className="text-zinc-500 text-xs mt-2 font-medium">
                          {formatActivityTime(log.logged_at)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
