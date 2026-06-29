import type { Match, Participant } from '../types'
import { computeScore, getKnockoutPickStatus, getMatchWinner, type KnockoutPickStatus } from '../lib/scoring'
import { flag, shortName } from '../lib/teams'

interface Props {
  matches: Match[]
  participant: Participant
}

interface RoundConfig {
  label: string
  stage: Match['stage']
  priorStage: Match['stage'] | null
  picks: string[]
  ptsPerPick: number
  pointsKey: 'r32Points' | 'r16Points' | 'qfPoints' | 'sfPoints'
}

const STATUS_STYLE: Record<KnockoutPickStatus, string> = {
  confirmed: 'bg-green-500/20 text-green-400 border-green-500/30',
  eliminated: 'bg-red-500/20 text-red-400 border-red-500/30',
  pending: 'bg-navy-700 text-slate-400 border-navy-600',
}

const STATUS_LABEL: Record<KnockoutPickStatus, string> = {
  confirmed: 'Advanced',
  eliminated: 'Out',
  pending: 'Pending',
}

function PickChip({
  team,
  status,
  ptsPerPick,
}: {
  team: string
  status: KnockoutPickStatus
  ptsPerPick: number
}) {
  const earned = status === 'confirmed' ? ptsPerPick : 0
  return (
    <div className={`flex items-center justify-between rounded-xl border px-3 py-2 ${STATUS_STYLE[status]}`}>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-lg">{flag(team)}</span>
        <span className="text-sm font-semibold truncate">{shortName(team)}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-2">
        <span className="text-xs font-medium">{STATUS_LABEL[status]}</span>
        <span className="text-xs font-bold">{earned}/{ptsPerPick}</span>
      </div>
    </div>
  )
}

export default function KnockoutView({ matches, participant }: Props) {
  const score = computeScore(participant, matches)

  const rounds: RoundConfig[] = [
    {
      label: 'Round of 32',
      stage: 'LAST_32',
      priorStage: null,
      picks: participant.r32Advances,
      ptsPerPick: 4,
      pointsKey: 'r32Points',
    },
    {
      label: 'Round of 16',
      stage: 'LAST_16',
      priorStage: 'LAST_32',
      picks: participant.r16Advances,
      ptsPerPick: 6,
      pointsKey: 'r16Points',
    },
    {
      label: 'Quarter Finals',
      stage: 'QUARTER_FINALS',
      priorStage: 'LAST_16',
      picks: participant.qfAdvances,
      ptsPerPick: 8,
      pointsKey: 'qfPoints',
    },
    {
      label: 'Semi Finals',
      stage: 'SEMI_FINALS',
      priorStage: 'QUARTER_FINALS',
      picks: participant.sfAdvances,
      ptsPerPick: 10,
      pointsKey: 'sfPoints',
    },
  ]

  const finalMatch = matches.find(m => m.stage === 'FINAL' && m.status === 'FINISHED')
  const thirdMatch = matches.find(m => m.stage === 'THIRD_PLACE' && m.status === 'FINISHED')
  const finalWinner = finalMatch ? getMatchWinner(finalMatch) : null
  const thirdWinner = thirdMatch ? getMatchWinner(thirdMatch) : null

  const finalStatus: KnockoutPickStatus = !finalMatch
    ? 'pending'
    : finalWinner === participant.finalWinner
      ? 'confirmed'
      : 'eliminated'

  const thirdStatus: KnockoutPickStatus = !thirdMatch
    ? 'pending'
    : thirdWinner === participant.thirdPlace
      ? 'confirmed'
      : 'eliminated'

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 pt-2">
        <span className="text-2xl">🏆</span>
        <h1 className="text-lg font-bold text-white">Bracket</h1>
      </div>

      <div className="bg-navy-800 rounded-2xl p-4 border border-navy-700">
        <p className="text-xs font-bold text-slate-400 mb-1">KNOCKOUT POINTS</p>
        <p className="text-3xl font-bold text-gold-400">
          {score.r32Points + score.r16Points + score.qfPoints + score.sfPoints + score.finalPoints + score.thirdPlacePoints}
        </p>
        <p className="text-xs text-slate-500 mt-1">From R32 through final and 3rd place</p>
      </div>

      {rounds.map(round => (
        <div key={round.stage} className="bg-navy-800 rounded-2xl p-4 border border-navy-700 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-300 tracking-wide">{round.label.toUpperCase()}</p>
            <span className="text-sm font-bold text-white">
              {score[round.pointsKey]}
              <span className="text-slate-500 font-normal">/{round.picks.length * round.ptsPerPick}</span>
            </span>
          </div>
          <div className="space-y-2">
            {round.picks.map(team => (
              <PickChip
                key={team}
                team={team}
                status={getKnockoutPickStatus(team, round.stage, round.priorStage, matches)}
                ptsPerPick={round.ptsPerPick}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="bg-navy-800 rounded-2xl p-4 border border-navy-700 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-300 tracking-wide">FINAL WINNER</p>
          <span className="text-sm font-bold text-white">
            {score.finalPoints}
            <span className="text-slate-500 font-normal">/20</span>
          </span>
        </div>
        <PickChip team={participant.finalWinner} status={finalStatus} ptsPerPick={20} />
      </div>

      <div className="bg-navy-800 rounded-2xl p-4 border border-navy-700 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-300 tracking-wide">THIRD PLACE</p>
          <span className="text-sm font-bold text-white">
            {score.thirdPlacePoints}
            <span className="text-slate-500 font-normal">/5</span>
          </span>
        </div>
        <PickChip team={participant.thirdPlace} status={thirdStatus} ptsPerPick={5} />
      </div>
    </div>
  )
}
