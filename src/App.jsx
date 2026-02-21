import { useState } from 'react'
import SetupScreen from './components/SetupScreen'
import BettingScreen from './components/BettingScreen'
import RaceTrack from './components/RaceTrack'
import ResultsScreen from './components/ResultsScreen'
import GameOver from './components/GameOver'
import { GAME_CONFIG } from './utils/constants'
import {
  generateRace, calculateOdds, createPlayer, createAIPlayer,
  makeAIBet, applyBetResults, savePlayerData, loadPlayerData, clearPlayerData,
} from './utils/gameLogic'
import './App.css'

function newRace() {
  const r = generateRace()
  return { ...r, odds: calculateOdds(r.horses, r.type) }
}

export default function App() {
  const [screen, setScreen] = useState('setup')
  const [gs, setGs] = useState(null)

  const handleStart = (playerName, numAI) => {
    setGs({
      day: 1,
      race: 1,
      players: [
        createPlayer(playerName, true),
        ...Array.from({ length: numAI }, (_, i) => createAIPlayer(i)),
      ],
      currentRace: newRace(),
      currentBets: {},
      lastResult: null,
      gameOver: false,
    })
    setScreen('betting')
  }

  const startRace = (humanBetHorseId, humanBetAmount) => {
    setGs(prev => {
      const human = prev.players.find(p => p.isHuman)
      const bets = {}
      if (humanBetHorseId && humanBetAmount > 0) {
        bets[human.id] = { horseId: humanBetHorseId, amount: humanBetAmount }
      }
      prev.players.filter(p => !p.isHuman).forEach(ai => {
        const b = makeAIBet(ai, prev.currentRace.horses, prev.currentRace.odds)
        if (b) bets[ai.id] = b
      })
      return { ...prev, currentBets: bets }
    })
    setScreen('racing')
  }

  const handleRaceComplete = (finishOrder) => {
    setGs(prev => {
      const { players, currentBets, currentRace, day, race } = prev
      const updatedPlayers = applyBetResults(players, currentBets, finishOrder[0], currentRace.odds)
      const human = updatedPlayers.find(p => p.isHuman)
      savePlayerData(human.name, human.bux)

      const isLastRace = race >= GAME_CONFIG.RACES_PER_DAY
      const isLastDay = isLastRace && day >= GAME_CONFIG.MAX_GAME_DAYS

      return {
        ...prev,
        players: updatedPlayers,
        lastResult: {
          finishOrder,
          horses: currentRace.horses,
          odds: currentRace.odds,
          bets: currentBets,
          raceDay: day,
          raceNum: race,
          raceType: currentRace.type,
          raceDistance: currentRace.distance,
        },
        currentBets: {},
        day: isLastRace && !isLastDay ? day + 1 : day,
        race: isLastRace ? (isLastDay ? race : 1) : race + 1,
        currentRace: isLastDay ? null : newRace(),
        gameOver: isLastDay,
      }
    })
    setScreen('results')
  }

  const handleNext = () => {
    if (gs.gameOver) setScreen('game-over')
    else setScreen('betting')
  }

  const handleNewGame = () => {
    clearPlayerData()
    setGs(null)
    setScreen('setup')
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white">
      {screen === 'setup' && (
        <SetupScreen onStart={handleStart} savedData={loadPlayerData()} />
      )}
      {screen === 'betting' && gs && (
        <BettingScreen gs={gs} onRace={startRace} />
      )}
      {screen === 'racing' && gs && (
        <RaceTrack
          race={gs.currentRace}
          bets={gs.currentBets}
          players={gs.players}
          onComplete={handleRaceComplete}
        />
      )}
      {screen === 'results' && gs && (
        <ResultsScreen gs={gs} onNext={handleNext} />
      )}
      {screen === 'game-over' && gs && (
        <GameOver players={gs.players} onNewGame={handleNewGame} />
      )}
    </div>
  )
}
