import { useState } from 'react'
import type { Participant } from '../types'

interface Props {
  onSelectUser: (id: string) => void
  participants: Participant[]
}

export default function LoginView({ onSelectUser, participants }: Props) {
  const [selectedId, setSelectedId] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selectedId) onSelectUser(selectedId)
  }

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-6">
      <div className="text-5xl mb-4">⚽</div>
      <h1 className="text-2xl font-bold text-white mb-1">World Cup 2026</h1>
      <p className="text-slate-400 mb-8">Who are you?</p>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <select
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-navy-800 border border-navy-600 text-white focus:outline-none focus:border-gold-400"
        >
          <option value="">Select your name...</option>
          {participants.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={!selectedId}
          className="w-full py-3 rounded-xl bg-gold-400 text-navy-950 font-bold text-lg hover:bg-gold-500 transition-colors disabled:opacity-40"
        >
          Let's Go
        </button>
      </form>
    </div>
  )
}
