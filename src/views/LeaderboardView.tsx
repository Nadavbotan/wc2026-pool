export interface LeaderboardEntry {
  rank: number
  name: string
  score: number | null
  change: number | null
}

export interface LeaderboardData {
  updatedAt: string
  entries: LeaderboardEntry[]
}

interface Props {
  leaderboard: LeaderboardData | null
  currentName: string
}

function ChangeChip({ change }: { change: number | null }) {
  if (change === null) return null
  if (change === 0) return <span className="text-xs text-slate-500">—</span>
  const up = change > 0
  return (
    <span className={`text-xs font-bold ${up ? 'text-green-400' : 'text-red-400'}`}>
      {up ? '▲' : '▼'}{Math.abs(change)}
    </span>
  )
}

export default function LeaderboardView({ leaderboard, currentName }: Props) {
  if (!leaderboard) {
    return (
      <div className="p-4 flex items-center justify-center min-h-64">
        <p className="text-slate-500">Loading…</p>
      </div>
    )
  }

  const myEntry = leaderboard.entries.find(e => e.name === currentName)
  const total = leaderboard.entries.length

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <h1 className="text-lg font-bold text-white">Leaderboard</h1>
        </div>
        <span className="text-xs text-slate-500">Updated {leaderboard.updatedAt}</span>
      </div>

      {myEntry && myEntry.score !== null && (
        <div className="bg-navy-800 rounded-2xl p-4 border border-gold-400/30 text-center">
          <p className="text-xs text-slate-400 mb-1">MY POSITION</p>
          <p className="text-4xl font-bold text-white">
            📍 {myEntry.rank}
            <span className="text-2xl text-slate-400"> / {total}</span>
          </p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-gold-400 font-semibold">{myEntry.score} pts</span>
            <ChangeChip change={myEntry.change} />
          </div>
        </div>
      )}

      <div className="bg-navy-800 rounded-2xl overflow-hidden border border-navy-700">
        <div className="grid grid-cols-[2.5rem_1fr_auto_2.5rem] px-4 py-2 text-xs font-bold text-slate-500 border-b border-navy-700">
          <span>#</span>
          <span>PLAYER</span>
          <span>PTS</span>
          <span className="text-right">±</span>
        </div>
        {leaderboard.entries.map(entry => {
          const isMe = entry.name === currentName
          const hasData = entry.score !== null

          return (
            <div
              key={entry.rank}
              className={`grid grid-cols-[2.5rem_1fr_auto_2.5rem] px-4 py-3 border-b border-navy-700/50 last:border-0 items-center
                ${isMe ? 'bg-gold-400/10' : ''}`}
            >
              <span className={`text-sm font-bold ${
                entry.rank === 1 ? 'text-yellow-400' :
                entry.rank === 2 ? 'text-slate-300' :
                entry.rank === 3 ? 'text-amber-600' : 'text-slate-500'
              }`}>
                {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
              </span>

              <span className={`text-sm font-medium truncate ${isMe ? 'text-gold-400' : hasData ? 'text-white' : 'text-slate-600'}`}>
                {entry.name}
                {isMe && <span className="ml-1 text-xs text-slate-500">(you)</span>}
              </span>

              <span className={`text-sm font-bold ${hasData ? 'text-white' : 'text-slate-700'}`}>
                {hasData ? entry.score : '—'}
              </span>

              <div className="text-right">
                <ChangeChip change={entry.change} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
