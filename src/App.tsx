import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import type { Match, Participant } from './types'
import { isSiteAuthed, getCurrentUser } from './lib/auth'
import LoginView from './views/LoginView'
import NextUpView from './views/NextUpView'
import MyScoreView from './views/MyScoreView'
import GroupsView from './views/GroupsView'
import LeaderboardView from './views/LeaderboardView'
import BottomNav from './components/BottomNav'
import participantsData from './data/participants.json'

const BASE = import.meta.env.BASE_URL

export default function App() {
  const [authed, setAuthed] = useState(isSiteAuthed())
  const [userId, setUserId] = useState<string | null>(getCurrentUser())
  const [matches, setMatches] = useState<Match[]>([])
  const participants = participantsData as unknown as Participant[]

  useEffect(() => {
    fetch(`${BASE}data/matches.json`)
      .then(r => r.json())
      .then(setMatches)
      .catch(console.error)
  }, [])

  if (!authed) {
    return <LoginView onAuth={() => setAuthed(true)} />
  }

  const currentParticipant = userId
    ? participants.find(p => p.id === userId) ?? null
    : null

  if (!currentParticipant) {
    return (
      <LoginView
        onAuth={() => setAuthed(true)}
        skipPassword
        onSelectUser={(id) => setUserId(id)}
        participants={participants}
      />
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-navy-950">
      <div className="flex-1 pb-20">
        <Routes>
          <Route path="/" element={<Navigate to="/next-up" replace />} />
          <Route path="/next-up" element={
            <NextUpView matches={matches} participant={currentParticipant} />
          } />
          <Route path="/my-score" element={
            <MyScoreView matches={matches} participant={currentParticipant} />
          } />
          <Route path="/groups" element={
            <GroupsView matches={matches} participant={currentParticipant} />
          } />
          <Route path="/leaderboard" element={
            <LeaderboardView matches={matches} participants={participants} currentId={userId!} />
          } />
        </Routes>
      </div>
      <BottomNav onLogout={() => { setUserId(null) }} />
    </div>
  )
}
