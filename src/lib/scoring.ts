import type { Match, Participant, ScoreBreakdown } from '../types'

function matchKey(homeTeam: string, awayTeam: string) {
  return `${homeTeam}|${awayTeam}`
}

function resultType(home: number, away: number): 'H' | 'D' | 'A' {
  if (home > away) return 'H'
  if (away > home) return 'A'
  return 'D'
}

export function computeScore(p: Participant, matches: Match[]): ScoreBreakdown {
  let groupMatchPoints = 0, groupMatchExact = 0, groupMatchCorrect = 0, groupMatchWrong = 0
  let groupRankingPoints = 0
  let r32Points = 0, r16Points = 0, qfPoints = 0, sfPoints = 0, finalPoints = 0
  let thirdPlacePoints = 0, goalscorerPoints = 0, bonusPoints = 0

  const groupMatches = matches.filter(m => m.stage === 'GROUP_STAGE' && m.status === 'FINISHED')
  const predMap = p.groupMatches

  for (const m of groupMatches) {
    if (!m.homeTeam || !m.awayTeam) continue
    const key = matchKey(m.homeTeam, m.awayTeam)
    const pred = predMap[key]
    if (!pred || m.homeScore === null || m.awayScore === null) continue

    if (pred.home === m.homeScore && pred.away === m.awayScore) {
      groupMatchPoints += 4
      groupMatchExact++
    } else if (resultType(pred.home, pred.away) === resultType(m.homeScore, m.awayScore)) {
      groupMatchPoints += 2
      groupMatchCorrect++
    } else {
      groupMatchWrong++
    }
  }

  // Group rankings — computed after group stage is done
  // For now we check each group if it has all 6 matches finished
  const groupsWithActual = computeActualGroupRankings(matches)
  for (const [grp, actual] of Object.entries(groupsWithActual)) {
    const predicted = p.groupRankings[grp]
    if (!predicted || actual.length < 4) continue
    for (let i = 0; i < 4; i++) {
      if (predicted[i] === actual[i]) {
        groupRankingPoints += 4
      } else if (i < 2 && actual.slice(0, 2).includes(predicted[i])) {
        groupRankingPoints += 2
      } else if (i >= 2 && actual.slice(2, 4).includes(predicted[i])) {
        // no points for 3rd/4th unless exact
      }
    }
  }

  // Knockout: who actually advanced
  const r32Winners = getKnockoutAdvancers(matches, 'LAST_32')
  const r16Winners = getKnockoutAdvancers(matches, 'LAST_16')
  const qfWinners  = getKnockoutAdvancers(matches, 'QUARTER_FINALS')
  const sfWinners  = getKnockoutAdvancers(matches, 'SEMI_FINALS')
  const finalMatch = matches.find(m => m.stage === 'FINAL' && m.status === 'FINISHED')
  const thirdMatch = matches.find(m => m.stage === 'THIRD_PLACE' && m.status === 'FINISHED')

  for (const team of p.r32Advances)  if (r32Winners.has(team))  r32Points += 4
  for (const team of p.r16Advances)  if (r16Winners.has(team))  r16Points += 6
  for (const team of p.qfAdvances)   if (qfWinners.has(team))   qfPoints  += 8
  for (const team of p.sfAdvances)   if (sfWinners.has(team))   sfPoints  += 10

  if (finalMatch && p.finalWinner) {
    const winner = matchWinner(finalMatch)
    if (winner && winner === p.finalWinner) finalPoints = 20
  }
  if (thirdMatch && p.thirdPlace) {
    const winner = matchWinner(thirdMatch)
    if (winner && winner === p.thirdPlace) thirdPlacePoints = 5
  }

  const total =
    groupMatchPoints + groupRankingPoints +
    r32Points + r16Points + qfPoints + sfPoints + finalPoints +
    thirdPlacePoints + goalscorerPoints + bonusPoints

  return {
    groupMatchPoints, groupMatchExact, groupMatchCorrect, groupMatchWrong,
    groupRankingPoints,
    r32Points, r16Points, qfPoints, sfPoints, finalPoints,
    thirdPlacePoints, goalscorerPoints, bonusPoints,
    total,
  }
}

function matchWinner(m: Match): string | null {
  if (!m.homeTeam || !m.awayTeam) return null
  if (m.homeScore === null || m.awayScore === null) return null
  if (m.homeScore > m.awayScore) return m.homeTeam
  if (m.awayScore > m.homeScore) return m.awayTeam
  return null
}

export function getKnockoutAdvancers(matches: Match[], stage: string): Set<string> {
  const result = new Set<string>()
  for (const m of matches) {
    if (m.stage !== stage || m.status !== 'FINISHED') continue
    const w = matchWinner(m)
    if (w) result.add(w)
  }
  return result
}

export type KnockoutPickStatus = 'confirmed' | 'eliminated' | 'pending'

export function getKnockoutPickStatus(
  team: string,
  stage: Match['stage'],
  priorStage: Match['stage'] | null,
  matches: Match[],
): KnockoutPickStatus {
  const advancers = getKnockoutAdvancers(matches, stage)
  if (advancers.has(team)) return 'confirmed'

  if (priorStage) {
    const priorWinners = getKnockoutAdvancers(matches, priorStage)
    const priorMatches = matches.filter(m => m.stage === priorStage)
    const priorDone = priorMatches.length > 0 && priorMatches.every(m => m.status === 'FINISHED')
    if (priorDone && !priorWinners.has(team)) return 'eliminated'
  }

  for (const m of matches) {
    if (m.stage !== stage || m.status !== 'FINISHED') continue
    if (m.homeTeam !== team && m.awayTeam !== team) continue
    return matchWinner(m) === team ? 'confirmed' : 'eliminated'
  }

  return 'pending'
}

export function getMatchWinner(m: Match): string | null {
  return matchWinner(m)
}

export function computeActualGroupRankings(matches: Match[]): Record<string, string[]> {
  const groups: Record<string, Record<string, { pts: number; gd: number; gf: number }>> = {}

  for (const m of matches) {
    if (m.stage !== 'GROUP_STAGE' || m.status !== 'FINISHED') continue
    if (!m.homeTeam || !m.awayTeam) continue
    if (m.homeScore === null || m.awayScore === null) continue
    const grp = (m.group ?? '').replace('GROUP_', '')
    if (!grp) continue

    if (!groups[grp]) groups[grp] = {}
    const g = groups[grp]
    if (!g[m.homeTeam]) g[m.homeTeam] = { pts: 0, gd: 0, gf: 0 }
    if (!g[m.awayTeam]) g[m.awayTeam] = { pts: 0, gd: 0, gf: 0 }

    const hg = m.homeScore, ag = m.awayScore
    g[m.homeTeam].gf += hg; g[m.homeTeam].gd += hg - ag
    g[m.awayTeam].gf += ag; g[m.awayTeam].gd += ag - hg

    if (hg > ag) { g[m.homeTeam].pts += 3 }
    else if (ag > hg) { g[m.awayTeam].pts += 3 }
    else { g[m.homeTeam].pts += 1; g[m.awayTeam].pts += 1 }
  }

  const result: Record<string, string[]> = {}
  for (const [grp, teams] of Object.entries(groups)) {
    result[grp] = Object.entries(teams)
      .sort(([, a], [, b]) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf)
      .map(([name]) => name)
  }
  return result
}
