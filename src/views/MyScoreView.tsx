import type { Match, Participant } from '../types'
import { computeScore } from '../lib/scoring'
import { flag } from '../lib/teams'

interface Props {
  matches: Match[]
  participant: Participant
}

const MAX_SCORE = 672

interface Row { label: string; pts: number; max: number; detail?: string }

export default function MyScoreView({ matches, participant }: Props) {
  const s = computeScore(participant, matches)

  const rows: Row[] = [
    {
      label: 'GROUP MATCH PREDICTIONS',
      pts: s.groupMatchPoints,
      max: 288,
      detail: `${s.groupMatchExact} exact · ${s.groupMatchCorrect} correct winner · ${s.groupMatchWrong} wrong`,
    },
    {
      label: 'GROUP RANKINGS',
      pts: s.groupRankingPoints,
      max: 192,
      detail: 'Position predictions across 12 groups',
    },
    {
      label: 'ROUND OF 32',
      pts: s.r32Points,
      max: 64,
      detail: '4 pts per correct advance (16 matches)',
    },
    {
      label: 'ROUND OF 16',
      pts: s.r16Points,
      max: 48,
      detail: '6 pts per correct advance (8 matches)',
    },
    {
      label: 'QUARTER FINALS',
      pts: s.qfPoints,
      max: 32,
      detail: '8 pts per correct advance (4 matches)',
    },
    {
      label: 'SEMI FINALS',
      pts: s.sfPoints,
      max: 20,
      detail: '10 pts per correct advance (2 matches)',
    },
    {
      label: 'FINAL WINNER',
      pts: s.finalPoints,
      max: 20,
      detail: participant.finalWinner
        ? `${flag(participant.finalWinner)} ${participant.finalWinner}`
        : '—',
    },
    {
      label: 'GOALSCORER POINTS',
      pts: s.goalscorerPoints,
      max: 0,
      detail: participant.goalscorers.map((g, i) => `${['1st','2nd','3rd'][i]}: ${g}`).join(' · '),
    },
  ]

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 pt-2">
        <span className="text-2xl">📊</span>
        <h1 className="text-lg font-bold text-white">My Score</h1>
      </div>

      <div className="bg-navy-800 rounded-2xl p-6 border border-navy-700 text-center">
        <p className="text-6xl font-bold text-gold-400">{s.total}</p>
        <p className="text-slate-400 mt-1">points earned</p>
        <div className="mt-4 w-full bg-navy-700 rounded-full h-2">
          <div
            className="bg-gold-400 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(100, (s.total / MAX_SCORE) * 100)}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1 text-right">Max: {MAX_SCORE}</p>
      </div>

      <div className="space-y-3">
        {rows.map(row => (
          <div key={row.label} className="bg-navy-800 rounded-2xl p-4 border border-navy-700">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-300 tracking-wide">{row.label}</span>
              <span className="text-sm font-bold text-white">
                {row.pts}
                {row.max > 0 && <span className="text-slate-500 font-normal">/{row.max}</span>}
              </span>
            </div>
            {row.detail && (
              <p className="text-xs text-slate-500">{row.detail}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
