import { useState, useEffect, useMemo } from 'react'
import vocabData from '../data/vocab.json'

interface VocabWord {
  word: string
  lang: string
  level: string
  pos: string
  meaning: string
  pron: string
  examples: { en: string; ja: string }[]
}

const words: VocabWord[] = vocabData as VocabWord[]

function getFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem('english-favorites') || '[]')
  } catch {
    return []
  }
}

function speak(text: string) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    u.rate = 0.9
    window.speechSynthesis.speak(u)
  }
}

// Speech recognition type
interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: { transcript: string }
      isFinal: boolean
    }
    length: number
  }
}

export default function Vocabulary() {
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [favorites, setFavorites] = useState<string[]>(getFavorites)
  const [expandedWord, setExpandedWord] = useState<string | null>(null)
  const [listening, setListening] = useState(false)
  const [listenTarget, setListenTarget] = useState<string | null>(null)
  const [listenResult, setListenResult] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem('english-favorites', JSON.stringify(favorites))
  }, [favorites])

  const filtered = useMemo(() => {
    let list = words
    if (levelFilter !== 'all') {
      list = list.filter((w) => w.level === levelFilter)
    }
    if (search.trim()) {
      const s = search.toLowerCase()
      list = list.filter(
        (w) =>
          w.word.toLowerCase().includes(s) ||
          w.meaning.toLowerCase().includes(s)
      )
    }
    return list
  }, [search, levelFilter])

  const toggleFavorite = (word: string) => {
    setFavorites((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word]
    )
  }

  const startListening = (word: string) => {
    const SpeechRecognition = (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setListenResult('Speech recognition not supported')
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new (SpeechRecognition as any)()
    recognition.lang = 'en-US'
    recognition.interimResults = false

    setListening(true)
    setListenTarget(word)
    setListenResult(null)

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim()
      const target = word.toLowerCase().trim()
      const match = transcript === target
      setListenResult(match ? `Correct! "${transcript}"` : `Heard: "${transcript}"`)
      setListening(false)
    }

    recognition.onerror = () => {
      setListenResult('Could not hear. Try again.')
      setListening(false)
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognition.start()
  }

  return (
    <div>
      {/* Search and Filter */}
      <div className="mb-6 p-4 rounded-xl" style={{ background: '#1a1a3e' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search word or meaning..."
          className="w-full px-4 py-2.5 rounded-lg text-sm outline-none mb-3"
          style={{ background: 'rgba(102,126,234,0.15)', color: '#e2e8f0', border: '1px solid rgba(102,126,234,0.2)' }}
        />
        <div className="flex gap-2 flex-wrap">
          {['all', 'A1', 'A2', 'B1', 'B2'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                levelFilter === lvl ? 'text-white' : 'text-gray-400'
              }`}
              style={levelFilter === lvl ? { background: 'linear-gradient(135deg, #667eea, #764ba2)' } : { background: 'rgba(102,126,234,0.15)' }}
            >
              {lvl === 'all' ? 'All Levels' : lvl}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">{filtered.length} words found</p>
      </div>

      {/* Word Cards */}
      <div className="space-y-3">
        {filtered.slice(0, 50).map((w) => {
          const isExpanded = expandedWord === w.word
          const isFav = favorites.includes(w.word)

          return (
            <div
              key={w.word}
              className="rounded-xl transition-all"
              style={{ background: '#1a1a3e', border: '1px solid rgba(102,126,234,0.15)' }}
            >
              <button
                onClick={() => setExpandedWord(isExpanded ? null : w.word)}
                className="w-full p-4 text-left flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-semibold text-white">{w.word}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(102,126,234,0.2)', color: '#667eea' }}>
                      {w.level}
                    </span>
                    <span className="text-xs text-gray-500">{w.pos}</span>
                  </div>
                  <p className="text-sm text-gray-400">{w.meaning} / {w.pron}</p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      speak(w.word)
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: 'rgba(102,126,234,0.2)' }}
                    title="Pronounce"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(w.word)
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: isFav ? 'rgba(234,179,8,0.2)' : 'rgba(102,126,234,0.1)' }}
                    title={isFav ? 'Remove favorite' : 'Add favorite'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={isFav ? '#eab308' : 'none'} stroke={isFav ? '#eab308' : '#667eea'} strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isExpanded ? '#667eea' : '#4b5563'} strokeWidth="2" style={{ transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid rgba(102,126,234,0.1)' }}>
                  <div className="pt-3">
                    <p className="text-xs font-medium text-gray-400 mb-2">Examples</p>
                    {w.examples.map((ex, i) => (
                      <div key={i} className="mb-2 text-sm">
                        <p className="text-gray-200">{ex.en}</p>
                        <p className="text-gray-500 text-xs">{ex.ja}</p>
                      </div>
                    ))}
                  </div>

                  {/* Pronunciation check */}
                  <div className="pt-2" style={{ borderTop: '1px solid rgba(102,126,234,0.1)' }}>
                    <p className="text-xs font-medium text-gray-400 mb-2">Pronunciation Check</p>
                    <button
                      onClick={() => startListening(w.word)}
                      disabled={listening}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
                      style={{
                        background: listening ? 'rgba(239,68,68,0.2)' : 'rgba(102,126,234,0.15)',
                        color: listening ? '#ef4444' : '#667eea',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="2" width="20" height="20" rx="5" />
                        <line x1="12" y1="8" x2="12" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                      {listening ? 'Listening...' : 'Tap and speak the word'}
                    </button>
                    {listenTarget === w.word && listenResult && (
                      <p className={`text-xs mt-2 ${listenResult.startsWith('Correct') ? 'text-green-400' : 'text-gray-400'}`}>
                        {listenResult}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filtered.length > 50 && (
        <p className="text-center text-gray-500 text-sm mt-4">
          Showing 50 of {filtered.length} words. Narrow your search for more results.
        </p>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No words found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
