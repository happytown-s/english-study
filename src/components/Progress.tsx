import { useState, useEffect } from 'react'
import toeicData from '../data/toeic.json'
import vocabData from '../data/vocab.json'

interface Question {
  category: string
  question: string
  options: { text: string; correct: boolean }[]
  explanation: string
}

const questions: Question[] = toeicData as Question[]
const totalWords = (vocabData as { lang: string }[]).filter((w) => w.lang === 'en').length

interface Stats {
  correct: number
  total: number
}

function getStats(): Record<string, Stats> {
  try {
    return JSON.parse(localStorage.getItem('english-stats') || '{}')
  } catch {
    return {}
  }
}

function getFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem('english-favorites') || '[]')
  } catch {
    return []
  }
}

function getWrongIds(): number[] {
  try {
    return JSON.parse(localStorage.getItem('english-quiz-wrong') || '[]')
  } catch {
    return []
  }
}

export default function Progress() {
  const [stats, setStats] = useState<Record<string, Stats>>(getStats)
  const [favorites, setFavorites] = useState<string[]>(getFavorites)
  const [wrongIds, setWrongIds] = useState<number[]>(getWrongIds)

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getStats())
      setFavorites(getFavorites())
      setWrongIds(getWrongIds())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const categories = Array.from(new Set(questions.map((q) => q.category)))

  const totalCorrect = Object.values(stats).reduce((s, v) => s + v.correct, 0)
  const totalAttempted = Object.values(stats).reduce((s, v) => s + v.total, 0)
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0

  const clearData = () => {
    if (window.confirm('Reset all progress data? This cannot be undone.')) {
      localStorage.removeItem('english-quiz-wrong')
      localStorage.removeItem('english-favorites')
      localStorage.removeItem('english-stats')
      setStats({})
      setFavorites([])
      setWrongIds([])
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl" style={{ background: '#1a1a3e', border: '1px solid rgba(102,126,234,0.15)' }}>
          <p className="text-xs text-gray-400 mb-1">Overall Accuracy</p>
          <p className="text-2xl font-bold" style={{ color: '#667eea' }}>{overallAccuracy}%</p>
          <p className="text-xs text-gray-500">{totalCorrect}/{totalAttempted} correct</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: '#1a1a3e', border: '1px solid rgba(102,126,234,0.15)' }}>
          <p className="text-xs text-gray-400 mb-1">Words Available</p>
          <p className="text-2xl font-bold" style={{ color: '#764ba2' }}>{totalWords}</p>
          <p className="text-xs text-gray-500">in vocabulary list</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: '#1a1a3e', border: '1px solid rgba(102,126,234,0.15)' }}>
          <p className="text-xs text-gray-400 mb-1">Favorites</p>
          <p className="text-2xl font-bold" style={{ color: '#eab308' }}>{favorites.length}</p>
          <p className="text-xs text-gray-500">starred words</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: '#1a1a3e', border: '1px solid rgba(102,126,234,0.15)' }}>
          <p className="text-xs text-gray-400 mb-1">Mistakes to Review</p>
          <p className="text-2xl font-bold" style={{ color: '#ef4444' }}>{wrongIds.length}</p>
          <p className="text-xs text-gray-500">questions marked wrong</p>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="p-5 rounded-xl" style={{ background: '#1a1a3e' }}>
        <h2 className="text-sm font-semibold text-gray-200 mb-4">Accuracy by Category</h2>
        <div className="space-y-4">
          {categories.map((cat) => {
            const catStats = stats[cat] || { correct: 0, total: 0 }
            const pct = catStats.total > 0 ? Math.round((catStats.correct / catStats.total) * 100) : 0
            const catCount = questions.filter((q) => q.category === cat).length

            return (
              <div key={cat}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300">{cat}</span>
                  <span className="text-gray-400">
                    {catStats.total > 0 ? `${pct}% (${catStats.correct}/${catStats.total})` : 'No attempts'}
                  </span>
                </div>
                <div className="h-2 rounded-full" style={{ background: 'rgba(102,126,234,0.15)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background:
                        pct >= 80
                          ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                          : pct >= 50
                          ? 'linear-gradient(135deg, #eab308, #ca8a04)'
                          : 'linear-gradient(135deg, #667eea, #764ba2)',
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-0.5">{catCount} questions</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Data management */}
      <div className="p-4 rounded-xl text-center" style={{ background: '#1a1a3e' }}>
        <button
          onClick={clearData}
          className="px-4 py-2 rounded-lg text-sm text-red-400 transition-all hover:text-red-300"
          style={{ background: 'rgba(239,68,68,0.1)' }}
        >
          Reset All Progress
        </button>
      </div>
    </div>
  )
}
