import { useState } from 'react'
import { Library } from './Library'
import { ServicePanel } from './ServicePanel'

interface Props {
  onNew: () => void
  onImport: () => void
}

export function LeftPanel({ onNew, onImport }: Props): React.JSX.Element {
  const [tab, setTab] = useState<'library' | 'service'>('library')

  return (
    <aside className="flex flex-col min-h-0 border-r border-zinc-800 bg-zinc-900/50">
      <div className="flex gap-1 p-2 border-b border-zinc-800">
        {(
          [
            ['library', 'Biblioteca'],
            ['service', 'Servicio']
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 py-1.5 rounded-md text-sm transition-colors ${
              tab === id ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'library' ? <Library onNew={onNew} onImport={onImport} /> : <ServicePanel />}
    </aside>
  )
}
