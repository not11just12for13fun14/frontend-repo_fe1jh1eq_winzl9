import React from 'react'

const steps = [
  'Fahrzeug',
  'Farbe & Polster',
  'Werksoptionen',
  'Zubehör',
  'Sondervereinbarung',
  'Kundendaten',
  'Übersicht'
]

export default function Stepper({ current }) {
  return (
    <ol className="flex items-center w-full text-sm text-slate-200">
      {steps.map((label, idx) => {
        const active = idx === current
        const done = idx < current
        return (
          <li key={label} className="flex-1 flex items-center">
            <div className={`flex items-center gap-2 ${done ? 'text-emerald-300' : active ? 'text-white' : 'text-slate-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border ${done ? 'bg-emerald-500 border-emerald-500' : active ? 'border-blue-400' : 'border-slate-600'}`}>
                {done ? '✓' : idx + 1}
              </div>
              <span className="hidden sm:block">{label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`mx-2 h-px flex-1 ${done ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
