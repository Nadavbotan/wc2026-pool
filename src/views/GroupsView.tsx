import { useState } from 'react'
import type { Match, Participant } from '../types'
import { flag, shortName } from '../lib/teams'
import { computeActualGroupRankings } from '../lib/scoring'
import MatchCard from '../components/MatchCard'

interface Props {
  matches: Match[]
  participant: Participant
}

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

function getPrediction(p: Participant, m: Match) {
  if (!m.homeTeam || !m.awayTeam) return undefined
  return p.groupMatches[`${m.homeTeam}|${m.awayTeam}`]
}

export default function GroupsView({ matches, participant }: Props) {
  const [selectedGroup, setSelectedGroup] = useState('A')
  const [showOnlyFinished, setShowOnlyFinished] = useState(false)

  const actualRankings = computeActualGroupRankings(matches)

  const groupMatches = matches.filter(
    m => m.stage === 'GROUP_STAGE' && m.group === `GROUP_${selectedGroup}`
  )

  const displayMatches = showOnlyFinished
    ? groupMatches.filter(m => m.status === 'FINISHED')
    : groupMatches

  const sortedMatches = [...displayMatches].sort(
    (a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()
  )

  const predicted = participant.groupRankings[selectedGroup] ?? []
  const actual = actualRankings[selectedGroup] ?? []

  const goalscorers = participant.goalscorers
  const gsPoints = [4, 3, 2]

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 pt-2">
        <span className="text-2xl">⚽</span>
        <h1 className="text-lg font-bold text-white">Groups</h1>
      </div>

      {/* Goalscorers */}
      <div className="bg-navy-800 rounded-2xl p-4 border border-navy-700">
        <p className="text-xs font-bold text-slate-400 mb-3">TOP GOALSCORER PICKS</p>
        <div className="flex gap-3">
          {goalscorers.map((gs, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-2xl">⚽</span>
              <span className="text-xs font-semibold text-white text-center">{gs}</span>
              <span className="text-xs text-gold-400">{gsPoints[i]} pts/goal</span>
            </div>
          ))}
        </div>
      </div>

      {/* Group selector */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {GROUPS.map(g => (
          <button
            key={g}
            onClick={() => setSelectedGroup(g)}
            className={`flex-shrink-0 w-9 h-9 rounded-full text-sm font-bold transition-colors
              ${selectedGroup === g
                ? 'bg-gold-400 text-navy-950'
                : 'bg-navy-800 text-slate-400 hover:text-white'}`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Standings */}
      <div className="bg-navy-800 rounded-2xl overflow-hidden border border-navy-700">
        <div className="grid grid-cols-3 px-4 py-2 text-xs font-bold text-slate-500 border-b border-navy-700">
          <span>TEAM</span>
          <span className="text-center">MY PICK</span>
          <span className="text-center">ACTUAL</span>
        </div>
        {([1,2,3,4] as const).map(pos => {
          const predTeam = predicted[pos - 1]
          const actualTeam = actual[pos - 1]
          const correct = predTeam && actualTeam && predTeam === actualTeam
          const partial = predTeam && actualTeam && pos <= 2 && actual.slice(0,2).includes(predTeam)

          return (
            <div key={pos} className="grid grid-cols-3 px-4 py-3 border-b border-navy-700/50 last:border-0 items-center">
              <div className="flex items-center gap-2">
                <span className="text-base">{predTeam ? flag(predTeam) : '—'}</span>
                <span className="text-sm text-white">{predTeam ? shortName(predTeam) : '—'}</span>
              </div>
              <div className="text-center">
                <span className={`text-sm font-bold ${
                  correct ? 'text-green-400' : partial ? 'text-blue-400' : 'text-slate-300'
                }`}>{pos}{['st','nd','rd','th'][pos-1]}</span>
              </div>
              <div className="text-center">
                {actualTeam ? (
                  <span className="text-sm text-slate-300">{pos}{['st','nd','rd','th'][pos-1]}</span>
                ) : (
                  <span className="text-slate-600">—</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Match filter */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-300">MATCHES</p>
        <button
          onClick={() => setShowOnlyFinished(!showOnlyFinished)}
          className={`text-xs px-3 py-1 rounded-full transition-colors ${
            showOnlyFinished ? 'bg-gold-400 text-navy-950 font-bold' : 'text-gold-400'
          }`}
        >
          {showOnlyFinished ? 'All matches' : 'Finished only'}
        </button>
      </div>

      <div className="space-y-3">
        {sortedMatches.map(m => (
          <MatchCard key={m.id} match={m} prediction={getPrediction(participant, m)} />
        ))}
        {sortedMatches.length === 0 && (
          <p className="text-slate-500 text-center py-4">No matches yet</p>
        )}
      </div>
    </div>
  )
}
