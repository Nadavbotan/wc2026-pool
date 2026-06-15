import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/next-up',      label: 'Next Up',  icon: '🎯' },
  { to: '/my-score',     label: 'My Score', icon: '📊' },
  { to: '/groups',       label: 'Groups',   icon: '⚽' },
  { to: '/leaderboard',  label: 'Board',    icon: '🏆' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-navy-900 border-t border-navy-700 flex items-stretch h-16 z-50">
      {tabs.map(t => (
        <NavLink
          key={t.to}
          to={t.to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors
            ${isActive ? 'text-gold-400' : 'text-slate-500 hover:text-slate-300'}`
          }
        >
          <span className="text-xl leading-none">{t.icon}</span>
          <span>{t.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
