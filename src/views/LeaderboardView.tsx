import type { Match, Participant } from '../types'
import { computeScore } from '../lib/scoring'

interface Props {
  matches: Match[]
  participants: Participant[]
  currentId: string
}

export default function LeaderboardView({ matches, participants, currentId }: Props) {
  const scored = participants
    .map(p => ({ p, score: computeScore(p, matches) }))
    .sort((a, b) => b.score.total - a.score.total)
    .map((item, i) => ({ ...item, rank: i + 1 }))

  const myEntry = scored.find(e => e.p.id === currentId)

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 pt-2">
        <span className="text-2xl">🏆</span>
        <h1 className="text-lg font-bold text-white">Leaderboard</h1>
      </div>

      {myEntry && (
        <div className="bg-navy-800 rounded-2xl p-4 border border-gold-400/30 text-center">
          <p className="text-xs text-slate-400 mb-1">MY POSITION</p>
          <p className="text-4xl font-bold text-white">
            📍 {myEntry.rank}<span className="text-2xl text-slate-400">/ {scored.length}</span>
          </p>
          <p className="text-gold-400 font-semibold mt-1">{myEntry.score.total} pts</p>
        </div>
      )}

      {scored.length <= 1 ? (
        <div className="bg-navy-800 rounded-2xl p-8 border border-navy-700 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-slate-400 text-sm">
            More participants will appear here once their predictions are loaded.
          </p>
        </div>
      ) : (
        <div className="bg-navy-800 rounded-2xl overflow-hidden border border-navy-700">
          <div className="grid grid-cols-[2.5rem_1fr_auto] px-4 py-2 text-xs font-bold text-slate-500 border-b border-navy-700">
            <span>#</span>
            <span>PLAYER</span>
            <span>PTS</span>
          </div>
          {scored.map(({ p, score, rank }) => (
            <div
              key={p.id}
              className={`grid grid-cols-[2.5rem_1fr_auto] px-4 py-3 border-b border-navy-700/50 last:border-0 items-center
                ${p.id === currentId ? 'bg-gold-400/10' : ''}`}
            >
              <span className={`text-sm font-bold ${
                rank === 1 ? 'text-yellow-400' :
                rank === 2 ? 'text-slate-300' :
                rank === 3 ? 'text-amber-600' : 'text-slate-500'
              }`}>
                {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
              </span>
              <span className={`text-sm font-medium ${p.id === currentId ? 'text-gold-400' : 'text-white'}`}>
                {p.name}
                {p.id === currentId && <span className="ml-2 text-xs text-slate-500">(you)</span>}
              </span>
              <span className="text-sm font-bold text-white">{score.total}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
