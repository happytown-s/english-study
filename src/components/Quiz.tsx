import { useState, useEffect, useCallback } from 'react'
import toeicData from '../data/toeic.json'

interface Question {
  category: string
  question: string
  options: { text: string; correct: boolean }[]
  explanation: string
}

type Mode = 'drill' | 'exam' | 'review'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const questions: Question[] = toeicData as Question[]

const categories = Array.from(new Set(questions.map((q) => q.category)))

function getWrongIds(): number[] {
  try {
    return JSON.parse(localStorage.getItem('english-quiz-wrong') || '[]')
  } catch {
    return []
  }
}

function getStats(): Record<string, { correct: number; total: number }> {
  try {
    return JSON.parse(localStorage.getItem('english-stats') || '{}')
  } catch {
    return {}
  }
}

export default function Quiz() {
  const [mode, setMode] = useState<Mode>('drill')
  const [category, setCategory] = useState<string>('all')
  const [shuffleOn, setShuffleOn] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [examScore, setExamScore] = useState<{ correct: number; total: number } | null>(null)

  const buildQuestions = useCallback(() => {
    let pool: Question[]
    if (mode === 'review') {
      const wrongIds = getWrongIds()
      pool = questions.filter((_, i) => wrongIds.includes(i))
      if (pool.length === 0) pool = questions.slice(0, 10)
    } else if (category !== 'all') {
      pool = questions.filter((q) => q.category === category)
    } else {
      pool = [...questions]
    }
    if (mode === 'exam') {
      pool = shuffle(pool).slice(0, 20)
    }
    if (shuffleOn) {
      pool = shuffle(pool)
    }
    return pool
  }, [mode, category, shuffleOn])

  useEffect(() => {
    const q = buildQuestions()
    setFilteredQuestions(q)
    setCurrentIdx(0)
    setSelected(null)
    setShowExplanation(false)
    setExamScore(null)
  }, [mode, category, shuffleOn, buildQuestions])

  const current = filteredQuestions[currentIdx]
  const totalQ = filteredQuestions.length

  const handleAnswer = (optIdx: number) => {
    if (selected !== null) return
    setSelected(optIdx)
    setShowExplanation(true)

    const isCorrect = current.options[optIdx].correct
    // Find original index in full questions array
    const origIdx = questions.indexOf(current)
    const wrongIds = getWrongIds()
    const stats = getStats()
    const cat = current.category

    if (!stats[cat]) stats[cat] = { correct: 0, total: 0 }
    stats[cat].total++

    if (isCorrect) {
      stats[cat].correct++
      // Remove from wrong list if present
      const updated = wrongIds.filter((id) => id !== origIdx)
      localStorage.setItem('english-quiz-wrong', JSON.stringify(updated))
    } else {
      if (!wrongIds.includes(origIdx)) {
        wrongIds.push(origIdx)
      }
      localStorage.setItem('english-quiz-wrong', JSON.stringify(wrongIds))
    }
    localStorage.setItem('english-stats', JSON.stringify(stats))
  }

  const nextQuestion = () => {
    if (mode === 'exam' && currentIdx >= totalQ - 1) {
      // Calculate exam score from this session
      setExamScore({ correct: 0, total: totalQ })
      return
    }
    setCurrentIdx((prev) => Math.min(prev + 1, totalQ - 1))
    setSelected(null)
    setShowExplanation(false)
  }

  const resetExam = () => {
    const q = buildQuestions()
    setFilteredQuestions(q)
    setCurrentIdx(0)
    setSelected(null)
    setShowExplanation(false)
    setExamScore(null)
  }

  if (mode === 'review' && getWrongIds().length === 0 && !current) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4" style={{ color: '#667eea' }}>*</div>
        <p className="text-lg text-gray-300 mb-2">No wrong answers yet!</p>
        <p className="text-gray-500">Answer some questions incorrectly to build your review list.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Controls */}
      <div className="mb-6 p-4 rounded-xl" style={{ background: '#1a1a3e' }}>
        <div className="flex flex-wrap gap-3 mb-3">
          {(['drill', 'exam', 'review'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === m ? 'text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
              style={mode === m ? { background: 'linear-gradient(135deg, #667eea, #764ba2)' } : { background: 'rgba(102,126,234,0.15)' }}
            >
              {m === 'drill' ? 'Drill' : m === 'exam' ? 'Exam (20)' : 'Review Mistakes'}
            </button>
          ))}
        </div>
        {mode !== 'review' && (
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm border-0 outline-none"
              style={{ background: 'rgba(102,126,234,0.15)', color: '#e2e8f0' }}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={shuffleOn}
                onChange={(e) => setShuffleOn(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              Shuffle
            </label>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {totalQ > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{currentIdx + 1} / {totalQ}</span>
            {mode === 'exam' && currentIdx >= totalQ - 1 && selected !== null && (
              <span>Exam complete!</span>
            )}
          </div>
          <div className="h-1.5 rounded-full" style={{ background: 'rgba(102,126,234,0.2)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${((currentIdx + 1) / totalQ) * 100}%`,
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
              }}
            />
          </div>
        </div>
      )}

      {/* Question */}
      {current ? (
        <div className="p-5 rounded-xl transition-all" style={{ background: '#1a1a3e' }}>
          <div className="text-xs text-purple-300 mb-2 font-medium uppercase tracking-wider">
            {current.category}
          </div>
          <p className="text-lg font-medium mb-5 leading-relaxed text-gray-100">
            {current.question}
          </p>

          <div className="space-y-3 mb-5">
            {current.options.map((opt, i) => {
              let optStyle: React.CSSProperties = {
                background: 'rgba(102,126,234,0.1)',
                border: '1px solid rgba(102,126,234,0.2)',
              }
              let labelClass = 'text-gray-200'

              if (selected !== null) {
                if (opt.correct) {
                  optStyle = {
                    background: 'rgba(34,197,94,0.15)',
                    border: '1px solid rgba(34,197,94,0.5)',
                  }
                  labelClass = 'text-green-300'
                } else if (i === selected && !opt.correct) {
                  optStyle = {
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.5)',
                  }
                  labelClass = 'text-red-300'
                } else {
                  labelClass = 'text-gray-500'
                }
              }

              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={selected !== null}
                  className={`w-full text-left p-3 rounded-lg transition-all ${labelClass} ${
                    selected === null ? 'hover:scale-[1.01] cursor-pointer' : 'cursor-default'
                  }`}
                  style={optStyle}
                >
                  <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                  {opt.text}
                </button>
              )
            })}
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className="p-4 rounded-lg mb-4" style={{ background: 'rgba(102,126,234,0.1)', border: '1px solid rgba(102,126,234,0.2)' }}>
              <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{current.explanation}</p>
            </div>
          )}

          {/* Next button */}
          {selected !== null && (
            <button
              onClick={nextQuestion}
              className="w-full py-3 rounded-lg text-white font-medium transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
            >
              {mode === 'exam' && currentIdx >= totalQ - 1 ? 'Finish Exam' : 'Next'}
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p>No questions available for this selection.</p>
        </div>
      )}

      {/* Exam result overlay */}
      {examScore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="p-6 rounded-2xl max-w-sm w-full text-center" style={{ background: '#1a1a3e' }}>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#667eea' }}>Exam Complete</h2>
            <p className="text-3xl font-bold mb-4 text-white">
              {examScore.total} questions
            </p>
            <p className="text-gray-300 mb-6">Check the Progress tab for detailed stats.</p>
            <button
              onClick={resetExam}
              className="px-6 py-2 rounded-lg text-white font-medium"
              style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
