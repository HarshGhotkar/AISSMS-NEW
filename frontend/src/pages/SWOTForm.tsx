import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getAuthHeaders } from '../lib/api'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

type SWOTData = {
  strengths: { technical: string[]; soft: string[]; subjects: string[] }
  weaknesses: { subjects: string[]; habits: string[]; gaps: string[] }
  opportunities: { internships: string[]; certs: string[]; projects: string[]; competitions: string[] }
  threats: { time: string[]; resources: string[]; distractions: string[]; confidence: string[] }
}

const DEFAULT_SWOT: SWOTData = {
  strengths: { technical: [], soft: [], subjects: [] },
  weaknesses: { subjects: [], habits: [], gaps: [] },
  opportunities: { internships: [], certs: [], projects: [], competitions: [] },
  threats: { time: [], resources: [], distractions: [], confidence: [] },
}

function TagInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string[]
  onChange: (v: string[]) => void
  placeholder?: string
}) {
  const [input, setInput] = useState('')

  function add() {
    const trimmed = input.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
      setInput('')
    }
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i))
  }

  return (
    <div>
      <label className="block text-zinc-400 text-sm font-medium mb-2">{label}</label>
      <div className="flex gap-2 flex-wrap">
        {value.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-sm"
          >
            {item}
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-zinc-400 hover:text-white ml-1"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          onBlur={add}
          placeholder={placeholder}
          className="flex-1 min-w-[120px] px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:border-emerald-500 outline-none text-sm"
        />
      </div>
    </div>
  )
}

export default function SWOTForm() {
  const [data, setData] = useState<SWOTData>(DEFAULT_SWOT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const { refreshUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchSwot() {
      try {
        const res = await fetch(`${API_URL}/swot`, { headers: getAuthHeaders() })
        if (res.ok) {
          const json = await res.json()
          if (json.strengths) {
            setData({
              strengths: json.strengths ?? DEFAULT_SWOT.strengths,
              weaknesses: json.weaknesses ?? DEFAULT_SWOT.weaknesses,
              opportunities: json.opportunities ?? DEFAULT_SWOT.opportunities,
              threats: json.threats ?? DEFAULT_SWOT.threats,
            })
          }
        }
      } catch {
        setData(DEFAULT_SWOT)
      } finally {
        setLoading(false)
      }
    }
    fetchSwot()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch(`${API_URL}/swot`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setSaved(true)
        await refreshUser()
        setTimeout(() => navigate('/dashboard'), 1500)
      } else {
        throw new Error('Failed to save')
      }
    } catch {
      setSaved(false)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="w-12 h-12 rounded-xl border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] py-12 px-6">
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-500/[0.03] via-transparent to-violet-500/[0.03] pointer-events-none" />
      <div className="relative max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">SWOT Analysis</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Help us personalize your experience. Add items in each category.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Strengths */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 rounded-full bg-emerald-500" />
              <h2 className="text-lg font-semibold text-white">Strengths</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              <TagInput
                label="Technical"
                value={data.strengths.technical}
                onChange={(v) =>
                  setData((d) => ({
                    ...d,
                    strengths: { ...d.strengths, technical: v },
                  }))
                }
                placeholder="Python, React..."
              />
              <TagInput
                label="Soft Skills"
                value={data.strengths.soft}
                onChange={(v) =>
                  setData((d) => ({
                    ...d,
                    strengths: { ...d.strengths, soft: v },
                  }))
                }
                placeholder="Leadership, communication..."
              />
              <TagInput
                label="Subjects"
                value={data.strengths.subjects}
                onChange={(v) =>
                  setData((d) => ({
                    ...d,
                    strengths: { ...d.strengths, subjects: v },
                  }))
                }
                placeholder="Math, DSA..."
              />
            </div>
          </div>

          {/* Weaknesses */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 rounded-full bg-amber-500" />
              <h2 className="text-lg font-semibold text-white">Weaknesses</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              <TagInput
                label="Subjects"
                value={data.weaknesses.subjects}
                onChange={(v) =>
                  setData((d) => ({
                    ...d,
                    weaknesses: { ...d.weaknesses, subjects: v },
                  }))
                }
              />
              <TagInput
                label="Habits"
                value={data.weaknesses.habits}
                onChange={(v) =>
                  setData((d) => ({
                    ...d,
                    weaknesses: { ...d.weaknesses, habits: v },
                  }))
                }
                placeholder="Procrastination..."
              />
              <TagInput
                label="Knowledge Gaps"
                value={data.weaknesses.gaps}
                onChange={(v) =>
                  setData((d) => ({
                    ...d,
                    weaknesses: { ...d.weaknesses, gaps: v },
                  }))
                }
              />
            </div>
          </div>

          {/* Opportunities */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 rounded-full bg-cyan-500" />
              <h2 className="text-lg font-semibold text-white">Opportunities</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <TagInput
                label="Internships"
                value={data.opportunities.internships}
                onChange={(v) =>
                  setData((d) => ({
                    ...d,
                    opportunities: { ...d.opportunities, internships: v },
                  }))
                }
              />
              <TagInput
                label="Certifications"
                value={data.opportunities.certs}
                onChange={(v) =>
                  setData((d) => ({
                    ...d,
                    opportunities: { ...d.opportunities, certs: v },
                  }))
                }
              />
              <TagInput
                label="Projects"
                value={data.opportunities.projects}
                onChange={(v) =>
                  setData((d) => ({
                    ...d,
                    opportunities: { ...d.opportunities, projects: v },
                  }))
                }
              />
              <TagInput
                label="Competitions"
                value={data.opportunities.competitions}
                onChange={(v) =>
                  setData((d) => ({
                    ...d,
                    opportunities: { ...d.opportunities, competitions: v },
                  }))
                }
              />
            </div>
          </div>

          {/* Threats */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 rounded-full bg-red-500" />
              <h2 className="text-lg font-semibold text-white">Threats</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <TagInput
                label="Time"
                value={data.threats.time}
                onChange={(v) =>
                  setData((d) => ({
                    ...d,
                    threats: { ...d.threats, time: v },
                  }))
                }
                placeholder="Limited study time..."
              />
              <TagInput
                label="Resources"
                value={data.threats.resources}
                onChange={(v) =>
                  setData((d) => ({
                    ...d,
                    threats: { ...d.threats, resources: v },
                  }))
                }
              />
              <TagInput
                label="Distractions"
                value={data.threats.distractions}
                onChange={(v) =>
                  setData((d) => ({
                    ...d,
                    threats: { ...d.threats, distractions: v },
                  }))
                }
              />
              <TagInput
                label="Confidence"
                value={data.threats.confidence}
                onChange={(v) =>
                  setData((d) => ({
                    ...d,
                    threats: { ...d.threats, confidence: v },
                  }))
                }
                placeholder="Imposter syndrome..."
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : saved ? 'Saved! Redirecting...' : 'Save SWOT'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition"
            >
              Skip
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
