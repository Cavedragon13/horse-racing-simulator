import { GAME_CONFIG } from '../utils/constants'

const MEDAL = ['🥇', '🥈', '🥉']

export default function ResultsScreen({ gs, onNext }) {
  const { lastResult, players, day, race, gameOver } = gs
  const { finishOrder, horses, odds, bets, raceDay, raceNum, raceType, raceDistance } = lastResult

  const human = players.find(p => p.isHuman)
  const humanBet = bets[human.id]
  const humanBetHorse = humanBet ? horses.find(h => h.id === humanBet.horseId) : null
  const winner = horses.find(h => h.id === finishOrder[0])
  const humanWon = humanBet?.horseId === finishOrder[0]
  const payout = humanWon ? Math.floor(humanBet.amount * odds[humanBet.horseId]) : 0
  const net = humanWon ? payout - humanBet.amount : -(humanBet?.amount || 0)

  const isNewDay = race === 1 && !gameOver
  const nextLabel = gameOver ? 'Final Results →' : isNewDay ? `Day ${day} — Race 1 →` : `Race ${race} →`

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="text-slate-500 text-sm">
          Day {raceDay} · Race {raceNum} · {raceType} {raceDistance}f
        </div>
        <div className="text-slate-500 text-xs">
          {(raceDay - 1) * GAME_CONFIG.RACES_PER_DAY + raceNum} / {GAME_CONFIG.MAX_GAME_DAYS * GAME_CONFIG.RACES_PER_DAY} races
        </div>
      </div>

      {/* Body — two columns */}
      <div className="flex-1 flex min-h-0">

        {/* Left: race results */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
          {/* Winner */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">🏆</div>
            <div className="text-slate-400 text-xs uppercase tracking-widest mb-1">Winner</div>
            <div className="text-4xl font-black text-white">{winner?.name}</div>
            <div className="text-slate-500 mt-1">{odds[finishOrder[0]]}x odds</div>
          </div>

          {/* Finish order */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">Race Results</div>
            </div>
            {finishOrder.map((id, i) => {
              const horse = horses.find(h => h.id === id)
              const isBet = humanBet?.horseId === id
              const totalBet = Object.values(bets).filter(b => b.horseId === id).reduce((s, b) => s + b.amount, 0)
              return (
                <div
                  key={id}
                  className={`flex items-center justify-between px-5 py-3 ${
                    i < finishOrder.length - 1 ? 'border-b border-slate-800' : ''
                  } ${i === 0 ? 'bg-slate-800/30' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl w-9">{MEDAL[i] || `#${i + 1}`}</span>
                    <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: horse?.color }} />
                    <span className={`font-semibold text-lg ${isBet ? 'text-yellow-400' : 'text-white'}`}>
                      {horse?.name}{isBet ? ' ⭐' : ''}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-400">{odds[id]}x</div>
                    {totalBet > 0 && <div className="text-slate-600 text-xs">{totalBet}🪙 bet</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: your result + standings + next */}
        <div className="w-80 flex-shrink-0 border-l border-slate-800 flex flex-col bg-slate-900/30">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Your result */}
            <div
              className={`rounded-2xl p-5 border text-center ${
                !humanBet
                  ? 'bg-slate-900 border-slate-800'
                  : humanWon
                  ? 'bg-green-950/50 border-green-700'
                  : 'bg-red-950/30 border-red-900'
              }`}
            >
              {!humanBet ? (
                <div className="text-slate-500">No bet placed</div>
              ) : (
                <>
                  <div className={`text-4xl font-black mb-1 ${humanWon ? 'text-green-400' : 'text-red-400'}`}>
                    {humanWon ? `+${payout}` : `-${humanBet.amount}`} 🪙
                  </div>
                  <div className="text-slate-400 text-sm">
                    {humanWon
                      ? `${humanBetHorse?.name} won! net +${net}🪙`
                      : `${humanBetHorse?.name} didn't place`}
                  </div>
                </>
              )}
              <div className="mt-3 pt-3 border-t border-slate-700">
                <div className="text-slate-500 text-xs">Balance</div>
                <div className="text-yellow-400 font-black text-2xl">{human.bux}🪙</div>
              </div>
            </div>

            {/* Standings */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800">
                <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">Standings</div>
              </div>
              {[...players].sort((a, b) => b.bux - a.bux).map((p, i) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between px-4 py-3 ${
                    i < players.length - 1 ? 'border-b border-slate-800' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 text-sm w-5">#{i + 1}</span>
                    <span className={`font-semibold ${p.isHuman ? 'text-yellow-400' : 'text-slate-300'}`}>
                      {p.name}{p.isHuman ? ' (you)' : ''}
                    </span>
                  </div>
                  <span className="text-yellow-400 font-bold">{p.bux}🪙</span>
                </div>
              ))}
            </div>
          </div>

          {/* Next button */}
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={onNext}
              className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-black text-lg rounded-xl transition-all shadow-lg shadow-yellow-500/20"
            >
              {nextLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
