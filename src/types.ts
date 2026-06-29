export interface Match {
  id: number
  utcDate: string
  status: 'SCHEDULED' | 'TIMED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'CANCELLED'
  stage: 'GROUP_STAGE' | 'LAST_32' | 'LAST_16' | 'QUARTER_FINALS' | 'SEMI_FINALS' | 'THIRD_PLACE' | 'FINAL'
  group: string | null
  homeTeam: string | null
  awayTeam: string | null
  homeScore: number | null
  awayScore: number | null
}

export interface MatchPrediction {
  home: number
  away: number
}

export interface Participant {
  id: string
  name: string
  pin: string
  groupMatches: Record<string, MatchPrediction>
  groupRankings: Record<string, string[]>
  r32Advances: string[]
  r16Advances: string[]
  qfAdvances: string[]
  sfAdvances: string[]
  finalWinner: string
  thirdPlace: string
  goalscorers: [string, string, string]
}

export interface ScoreBreakdown {
  groupMatchPoints: number
  groupMatchExact: number
  groupMatchCorrect: number
  groupMatchWrong: number
  groupRankingPoints: number
  r32Points: number
  r16Points: number
  qfPoints: number
  sfPoints: number
  finalPoints: number
  thirdPlacePoints: number
  goalscorerPoints: number
  bonusPoints: number
  total: number
}

export interface LeaderboardEntry {
  participant: Participant
  score: ScoreBreakdown
  rank: number
}
