import { useState } from 'react'
import { GAME_CONFIG } from '../utils/constants'

export default function SetupScreen({ onStart, savedData }) {
  const [name, setName] = useState(savedData?.playerName || '')
  const [numAI, setNumAI] = useState(1)

  const canStart = name.trim().length > 0

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-950">
      <div className="text-8xl mb-4 select-none">🏇</div>
      <h1 className="text-5xl font-black text-yellow-400 mb-1 tracking-tight">Horse Racing</h1>
      <p className="text-slate-400 mb-10 text-lg tracking-widest uppercase text-sm">Simulator</p>

      <div className="bg-slate-900 rounded-2xl p-8 w-full max-w-md shadow-2xl border border-slate-800">
        {/* Player name */}
        <div className="mb-6">
          <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-widest">
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && canStart && onStart(name.trim(), numAI)}
            placeholder="Enter your name…"
            maxLength={20}
            className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 text-lg border border-slate-700 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors placeholder-slate-600"
          />
        </div>

        {/* AI opponents */}
        <div className="mb-8">
          <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-widest">
            AI Opponents
          </label>
          <div className="flex gap-2">
            {[1, 2, 3].map(n => (
              <button
                key={n}
                onClick={() => setNumAI(n)}
                className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all border ${
                  numAI === n
                    ? 'bg-yellow-500 text-slate-900 border-yellow-400'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Game info */}
        <div className="bg-slate-800/50 rounded-xl p-4 mb-6 space-y-2 text-sm">
          <div className="flex justify-between text-slate-400">
            <span>Starting funds</span>
            <span className="text-yellow-400 font-bold">{GAME_CONFIG.STARTING_BUX} 🪙</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Tournament length</span>
            <span>{GAME_CONFIG.MAX_GAME_DAYS} days · {GAME_CONFIG.RACES_PER_DAY} races each</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Win condition</span>
            <span>Most 🪙 after {GAME_CONFIG.MAX_GAME_DAYS * GAME_CONFIG.RACES_PER_DAY} races</span>
          </div>
        </div>

        <button
          onClick={() => canStart && onStart(name.trim(), numAI)}
          disabled={!canStart}
          className={`w-full py-4 rounded-xl font-black text-xl transition-all ${
            canStart
              ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-900 shadow-lg shadow-yellow-500/20'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          Start Tournament
        </button>
      </div>

      {savedData && (
        <p className="mt-5 text-slate-600 text-xs">
          Last session: <span className="text-slate-500">{savedData.playerName}</span> · {savedData.bux} 🪙
        </p>
      )}
    </div>
  )
}
