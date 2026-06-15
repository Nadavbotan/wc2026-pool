import type { Match } from '../types'
import type { MatchPrediction } from '../types'
import { flag, shortName } from '../lib/teams'

interface Props {
  match: Match
  prediction?: MatchPrediction
}

function formatDate(utcDate: string) {
  const d = new Date(utcDate)
  const day = d.getDate().toString().padStart(2,'0')
  const month = (d.getMonth()+1).toString().padStart(2,'0')
  const hours = d.getHours().toString().padStart(2,'0')
  const mins = d.getMinutes().toString().padStart(2,'0')
  return { date: `${day}/${month}`, time: `${hours}:${mins}` }
}

function resultBadge(pred: MatchPrediction, match: Match) {
  if (match.status !== 'FINISHED' || match.homeScore === null || match.awayScore === null) return null
  const exact = pred.home === match.homeScore && pred.away === match.awayScore
  const result = (h: number, a: number) => h > a ? 'H' : a > h ? 'A' : 'D'
  const correct = result(pred.home, pred.away) === result(match.homeScore, match.awayScore)
  if (exact) return <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 font-bold">+4</span>
  if (correct) return <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">+2</span>
  return <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">+0</span>
}

export default function MatchCard({ match, prediction }: Props) {
  const { date, time } = formatDate(match.utcDate)
  const isFinished = match.status === 'FINISHED'
  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED'
  const groupLabel = match.group ? match.group.replace('GROUP_', 'GROUP ') : match.stage.replace('_', ' ')

  return (
    <div className="bg-navy-800 rounded-2xl p-4 border border-navy-700">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 tracking-wide">{groupLabel}</span>
        {isLive
          ? <span className="text-xs font-bold text-green-400 animate-pulse">● LIVE</span>
          : isFinished
            ? <span className="text-xs font-semibold text-slate-500">FINISHED</span>
            : <span className="text-xs font-semibold text-gold-400">UPCOMING</span>
        }
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center gap-1 w-[38%]">
          <span className="text-3xl">{flag(match.homeTeam)}</span>
          <span className="text-sm font-semibold text-white text-center">{shortName(match.homeTeam)}</span>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <span className="text-xs text-slate-400">{date} · {time}</span>
          {isFinished && match.homeScore !== null ? (
            <span className="text-2xl font-bold text-white">
              {match.homeScore}–{match.awayScore}
            </span>
          ) : isLive && match.homeScore !== null ? (
            <span className="text-2xl font-bold text-green-400">
              {match.homeScore}–{match.awayScore}
            </span>
          ) : (
            <span className="text-lg font-semibold text-slate-400">vs</span>
          )}
          {prediction && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">MY BET</span>
              <span className="text-sm font-bold text-gold-400">
                {prediction.home}–{prediction.away}
              </span>
              {resultBadge(prediction, match)}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-1 w-[38%]">
          <span className="text-3xl">{flag(match.awayTeam)}</span>
          <span className="text-sm font-semibold text-white text-center">{shortName(match.awayTeam)}</span>
        </div>
      </div>
    </div>
  )
}
