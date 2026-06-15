import { useState } from 'react'
import type { Match, Participant } from '../types'
import MatchCard from '../components/MatchCard'

interface Props {
  matches: Match[]
  participant: Participant
}

type Filter = 'all' | 'upcoming' | 'finished' | 'correct' | 'wrong'

function getPrediction(p: Participant, m: Match) {
  return p.groupMatches[`${m.homeTeam}|${m.awayTeam}`]
}

function isCorrect(p: Participant, m: Match): boolean | null {
  if (m.status !== 'FINISHED' || m.homeScore === null || m.awayScore === null) return null
  const pred = getPrediction(p, m)
  if (!pred) return null
  const r = (h: number, a: number) => h > a ? 'H' : a > h ? 'A' : 'D'
  return r(pred.home, pred.away) === r(m.homeScore, m.awayScore)
}

export default function NextUpView({ matches, participant }: Props) {
  const [filter, setFilter] = useState<Filter>('all')

  const groupMatches = matches.filter(m => m.stage === 'GROUP_STAGE')

  const nextUp = [...groupMatches]
    .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
    .find(m => m.status === 'SCHEDULED' || m.status === 'TIMED' || m.status === 'IN_PLAY')

  const filteredMatches = groupMatches.filter(m => {
    if (filter === 'upcoming') return m.status === 'SCHEDULED' || m.status === 'TIMED'
    if (filter === 'finished') return m.status === 'FINISHED'
    if (filter === 'correct') return isCorrect(participant, m) === true
    if (filter === 'wrong') return isCorrect(participant, m) === false
    return true
  })

  const sortedMatches = [...filteredMatches].sort(
    (a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()
  )

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'finished', label: 'Finished' },
    { key: 'correct', label: 'Correct' },
    { key: 'wrong', label: 'Wrong' },
  ]

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 pt-2">
        <span className="text-2xl">⚽</span>
        <div>
          <h1 className="text-lg font-bold text-white leading-tight">World Cup 2026</h1>
          <p className="text-xs text-slate-400">My Bets Dashboard</p>
        </div>
      </div>

      {nextUp && (
        <div>
          <p className="text-xs font-bold text-gold-400 mb-2">NEXT UP</p>
          <MatchCard match={nextUp} prediction={getPrediction(participant, nextUp)} />
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors
              ${filter === f.key
                ? 'bg-gold-400 text-navy-950'
                : 'bg-navy-800 text-slate-400 hover:text-white'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {sortedMatches.map(m => (
          <MatchCard key={m.id} match={m} prediction={getPrediction(participant, m)} />
        ))}
        {sortedMatches.length === 0 && (
          <p className="text-slate-500 text-center py-8">No matches found</p>
        )}
      </div>
    </div>
  )
}
