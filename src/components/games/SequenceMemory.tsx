import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, RotateCcw, Volume2 } from 'lucide-react'
import { useScore } from '@/context/ScoreContext'

interface SequenceMemoryProps {
  onBack: () => void
}

const GRID_SIZE = 3
const BASE_DELAY = 600
const MIN_DELAY = 300
const FREQUENCIES = [261, 294, 329, 349, 392, 440, 494, 523, 587]

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms))

export default function SequenceMemory({ onBack }: SequenceMemoryProps) {
  const { addScore } = useScore()

  /* ---------------- GAME STATE ---------------- */
  const [level, setLevel] = useState(1)
  const [sequence, setSequence] = useState<number[]>([])
  const [playerIndex, setPlayerIndex] = useState(0)
  const [activeCell, setActiveCell] = useState<number | null>(null)

  const [phase, setPhase] = useState<'idle' | 'showing' | 'input' | 'over'>(
    'idle'
  )

  /* ---------------- REFS ---------------- */
  const audioCtxRef = useRef<AudioContext | null>(null)
  const runningRef = useRef(false)

  /* ---------------- AUDIO ---------------- */
  const playTone = (i: number) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)()
      }
      const ctx = audioCtxRef.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = FREQUENCIES[i]
      osc.type = 'sine'

      gain.gain.setValueAtTime(0.35, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)

      osc.start()
      osc.stop(ctx.currentTime + 0.3)
    } catch {}
  }

  /* ---------------- HELPERS ---------------- */
  const delayForLevel = () =>
    Math.max(MIN_DELAY, BASE_DELAY - (level - 1) * 40)

  const randomTile = () =>
    Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE))

  /* ---------------- PLAY SEQUENCE ---------------- */
  const playSequence = async (seq: number[]) => {
    setPhase('showing')
    setPlayerIndex(0)

    const delay = delayForLevel()

    for (const tile of seq) {
      await sleep(delay)
      setActiveCell(tile)
      playTone(tile)
      await sleep(delay * 0.75)
      setActiveCell(null)
    }

    setPhase('input')
    runningRef.current = false
  }

  /* ---------------- START GAME ---------------- */
  const startGame = async () => {
    if (runningRef.current) return
    runningRef.current = true

    setLevel(1)
    setPhase('idle')

    // ✅ start with TWO tiles
    const firstSequence = [randomTile(), randomTile()]
    setSequence(firstSequence)

    await playSequence(firstSequence)
  }

  /* ---------------- NEXT LEVEL ---------------- */
  const goToNextLevel = async () => {
    if (runningRef.current) return
    runningRef.current = true

    const nextLevel = level + 1
    setLevel(nextLevel)

    // ✅ APPEND ONE tile (this is the key change)
    const nextSequence = [...sequence, randomTile()]
    setSequence(nextSequence)

    await sleep(600)
    await playSequence(nextSequence)
  }

  /* ---------------- PLAYER INPUT ---------------- */
  const handleCellClick = async (index: number) => {
    if (phase !== 'input') return

    playTone(index)
    setActiveCell(index)
    setTimeout(() => setActiveCell(null), 120)

    if (index !== sequence[playerIndex]) {
      setPhase('over')
      addScore((level - 1) * 15)
      return
    }

    const nextIndex = playerIndex + 1
    setPlayerIndex(nextIndex)

    if (nextIndex === sequence.length) {
      await sleep(500)
      goToNextLevel()
    }
  }

  /* ---------------- COLORS & STYLE ---------------- */
  const COLORS = [
    'hsl(355, 85%, 55%)',
    'hsl(200, 90%, 55%)',
    'hsl(145, 75%, 45%)',
    'hsl(45, 95%, 55%)',
    'hsl(280, 85%, 60%)',
    'hsl(20, 95%, 55%)',
    'hsl(165, 80%, 45%)',
    'hsl(325, 85%, 60%)',
    'hsl(215, 90%, 55%)',
  ]

  const getTileStyle = (i: number) => {
    const isActive = activeCell === i

    return {
      backgroundColor: COLORS[i],
      opacity: isActive ? 1 : 0.7,
      transform: isActive
        ? 'translateY(-10px) scale(1.08)'
        : 'translateY(0) scale(1)',
      boxShadow: isActive
        ? `0 20px 40px rgba(0,0,0,0.35), 0 0 32px ${COLORS[i]}`
        : '0 6px 14px rgba(0,0,0,0.25)',
      transition: 'all 160ms ease',
    }
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen p-4 bg-background">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-between mb-6">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          {phase !== 'idle' && <span>Level {level}</span>}
        </div>

        <h2 className="text-2xl font-bold text-center mb-4">
          Sequence Memory
        </h2>

        {phase === 'idle' && (
          <div className="text-center">
            <Button onClick={startGame}>Start Game</Button>
          </div>
        )}

        {phase !== 'idle' && (
          <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto mt-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <button
                key={i}
                onClick={() => handleCellClick(i)}
                disabled={phase !== 'input'}
                className="aspect-square rounded-2xl"
                style={getTileStyle(i)}
              />
            ))}
          </div>
        )}

        {phase === 'showing' && (
          <p className="text-center mt-5 animate-pulse flex justify-center gap-2">
            <Volume2 className="h-4 w-4" />
            Watch carefully…
          </p>
        )}

        {phase === 'input' && (
          <p className="text-center mt-5">
            Your turn ({playerIndex}/{sequence.length})
          </p>
        )}

        {phase === 'over' && (
          <div className="text-center mt-6 bg-card p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-1">Game Over</h3>
            <p>You reached level {level}</p>
            <Button className="mt-4" onClick={startGame}>
              <RotateCcw className="mr-2 h-4 w-4" /> Play Again
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
