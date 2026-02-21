import { useState } from 'react'
import { GAME_CONFIG } from '../utils/constants'

const STAT_LABEL = { topSpeed: 'Speed', stamina: 'Stamina', sprint: 'Sprint', pace: 'Pace', gate: 'Gate' }
const TYPE_COLOR = { Short: 'text-green-400', Medium: 'text-blue-400', Long: 'text-purple-400' }

function StatDots({ value, max = 10 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-sm ${
            i < value
              ? value >= 8 ? 'bg-green-500' : value >= 5 ? 'bg-yellow-500' : 'bg-red-500'
              : 'bg-slate-700'
          }`}
        />
      ))}
    </div>
  )
}

export default function BettingScreen({ gs, onRace }) {
  const { day, race, players, currentRace } = gs
  const { horses, type, distance, odds } = currentRace

  const human = players.find(p => p.isHuman)
  const [selectedId, setSelectedId] = useState(null)
  const [betAmount, setBetAmount] = useState(0)

  const sorted = [...horses].sort((a, b) => odds[a.id] - odds[b.id])
  const betOptions = [1, 5, 10, 25].filter(b => b <= human.bux)
  const selected = horses.find(h => h.id === selectedId)
  const canBet = selected && betAmount > 0
  const potentialWin = canBet ? Math.floor(betAmount * odds[selectedId]) : 0

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top header bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="text-slate-500 text-xs uppercase tracking-widest">
            Day {day}/{GAME_CONFIG.MAX_GAME_DAYS} · Race {race}/{GAME_CONFIG.RACES_PER_DAY}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`font-bold text-xl ${TYPE_COLOR[type] || 'text-white'}`}>{type}</span>
            <span className="text-slate-500">— {distance} furlongs</span>
          </div>
        </div>
        <div className="flex items-center gap-8">
          {/* Live standings */}
          <div className="hidden md:flex items-center gap-4">
            {[...players].sort((a, b) => b.bux - a.bux).map((p, i) => (
              <div key={p.id} className={`text-sm ${p.isHuman ? 'text-yellow-400 font-bold' : 'text-slate-400'}`}>
                #{i + 1} {p.name} {p.bux}🪙
              </div>
            ))}
          </div>
          <div className="border-l border-slate-700 pl-6">
            <div className="text-slate-500 text-xs">Your balance</div>
            <div className="text-yellow-400 font-black text-2xl leading-none">{human.bux}🪙</div>
          </div>
        </div>
      </div>

      {/* Two-column body */}
      <div className="flex-1 flex min-h-0">

        {/* Left: horse list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {sorted.map((horse, idx) => {
            const isSelected = horse.id === selectedId
            const isFav = idx === 0
            return (
              <div
                key={horse.id}
                onClick={() => { setSelectedId(isSelected ? null : horse.id); setBetAmount(0) }}
                className={`rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-yellow-500 bg-yellow-500/8'
                    : 'border-slate-800 bg-slate-900 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3 p-3">
                  {/* Color badge */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                    style={{ backgroundColor: horse.color }}
                  >
                    {horse.number}
                  </div>

                  {/* Name & jockey */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-lg">{horse.name}</span>
                      {isFav && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full font-semibold">
                          FAV
                        </span>
                      )}
                    </div>
                    <div className="text-slate-500 text-sm">
                      🏇 {horse.jockey} · ❤️ {horse.health}/10
                    </div>
                  </div>

                  {/* Stats (always visible) */}
                  <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
                    {Object.entries(horse.stats).map(([stat, val]) => (
                      <div key={stat} className="text-center">
                        <div className="text-slate-600 text-xs mb-1">{STAT_LABEL[stat]}</div>
                        <StatDots value={val} />
                      </div>
                    ))}
                  </div>

                  {/* Odds */}
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="text-yellow-400 font-black text-2xl leading-none">{odds[horse.id]}x</div>
                    <div className="text-slate-600 text-xs">odds</div>
                  </div>
                </div>

                {/* Expanded stats on smaller screens */}
                {isSelected && (
                  <div className="lg:hidden px-3 pb-3 pt-1 border-t border-slate-800">
                    <div className="grid grid-cols-5 gap-3">
                      {Object.entries(horse.stats).map(([stat, val]) => (
                        <div key={stat}>
                          <div className="text-slate-500 text-xs mb-1">{STAT_LABEL[stat]}</div>
                          <StatDots value={val} />
                          <div className="text-slate-400 text-xs mt-0.5">{val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Right: bet panel — fixed width sidebar */}
        <div className="w-72 flex-shrink-0 border-l border-slate-800 flex flex-col bg-slate-900/50">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">

            {/* Selected horse */}
            {selected ? (
              <div>
                <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3">
                  Betting on
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900 border border-yellow-500/30">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                    style={{ backgroundColor: selected.color }}
                  >
                    {selected.number}
                  </div>
                  <div>
                    <div className="font-bold text-white">{selected.name}</div>
                    <div className="text-yellow-400 text-sm font-bold">{odds[selected.id]}x payout</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🐎</div>
                <div className="text-slate-500 text-sm">Select a horse to bet on</div>
              </div>
            )}

            {/* Bet amount */}
            {selected && (
              <div>
                <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">
                  Bet amount
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {betOptions.map(amt => (
                    <button
                      key={amt}
                      onClick={() => setBetAmount(betAmount === amt ? 0 : amt)}
                      className={`py-2.5 rounded-lg font-bold transition-all ${
                        betAmount === amt
                          ? 'bg-yellow-500 text-slate-900'
                          : 'bg-slate-800 text-white hover:bg-slate-700'
                      }`}
                    >
                      {amt}
                    </button>
                  ))}
                  {human.bux > 0 && (
                    <button
                      onClick={() => setBetAmount(betAmount === human.bux ? 0 : human.bux)}
                      className={`py-2.5 rounded-lg font-bold transition-all col-span-3 ${
                        betAmount === human.bux
                          ? 'bg-red-500 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      All In ({human.bux}🪙)
                    </button>
                  )}
                </div>
                {canBet && (
                  <div className="text-sm text-slate-400 text-center">
                    Payout: <span className="text-green-400 font-bold">{potentialWin}🪙</span>
                    <span className="text-slate-600 ml-1">(net +{potentialWin - betAmount})</span>
                  </div>
                )}
              </div>
            )}

            {/* Mobile standings */}
            <div className="md:hidden">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Standings</div>
              {[...players].sort((a, b) => b.bux - a.bux).map((p, i) => (
                <div key={p.id} className="flex justify-between text-sm py-1">
                  <span className={p.isHuman ? 'text-yellow-400 font-bold' : 'text-slate-400'}>
                    #{i + 1} {p.name}
                  </span>
                  <span className="text-yellow-400 font-bold">{p.bux}🪙</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions — pinned to bottom */}
          <div className="p-4 border-t border-slate-800 space-y-2">
            <button
              onClick={() => canBet && onRace(selectedId, betAmount)}
              disabled={!canBet}
              className={`w-full py-3.5 rounded-xl font-black text-lg transition-all ${
                canBet
                  ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-900 shadow-lg shadow-yellow-500/20'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              {canBet ? `Bet ${betAmount}🪙 → Race!` : 'Pick horse + amount'}
            </button>
            <button
              onClick={() => onRace(null, 0)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl font-semibold transition-all text-sm"
            >
              Skip Bet
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
