import { useState } from 'react'
import Quiz from './components/Quiz'
import Vocabulary from './components/Vocabulary'
import Progress from './components/Progress'

type Tab = 'quiz' | 'vocab' | 'progress'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('quiz')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'quiz', label: 'Quiz' },
    { key: 'vocab', label: 'Vocabulary' },
    { key: 'progress', label: 'Progress' },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#0f0f23' }}>
      <header className="sticky top-0 z-50 backdrop-blur-md" style={{ background: 'rgba(15,15,35,0.85)', borderBottom: '1px solid rgba(102,126,234,0.2)' }}>
        <div className="max-w-3xl mx-auto px-4 py-3">
          <h1 className="text-xl font-bold text-center mb-2" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            English Study
          </h1>
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'text-white shadow-lg'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                style={activeTab === tab.key ? { background: 'linear-gradient(135deg, #667eea, #764ba2)' } : { background: 'rgba(26,26,62,0.6)' }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {activeTab === 'quiz' && <Quiz />}
        {activeTab === 'vocab' && <Vocabulary />}
        {activeTab === 'progress' && <Progress />}
      </main>
    </div>
  )
}

export default App
