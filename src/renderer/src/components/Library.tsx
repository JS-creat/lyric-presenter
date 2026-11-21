import { useState } from 'react'
import { Search, Plus, Upload, Music, ListPlus } from 'lucide-react'
import { usePresenter, getActiveService } from '../store'

interface Props {
  onNew: () => void
  onImport: () => void
}

export function Library({ onNew, onImport }: Props): React.JSX.Element {
  const songs = usePresenter((s) => s.songs)
  const currentSongId = usePresenter((s) => s.currentSongId)
  const selectSong = usePresenter((s) => s.selectSong)
  const addToService = usePresenter((s) => s.addToService)
  const activeService = usePresenter(getActiveService)
  const [query, setQuery] = useState('')

  const filtered = songs.filter((x) => x.title.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="p-3 space-y-2 border-b border-zinc-800">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
            placeholder="Buscar canción..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onNew}
            className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Nueva
          </button>
          <button
            onClick={onImport}
            className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
          >
            <Upload size={16} /> Importar
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.length === 0 && (
          <p className="text-sm text-zinc-500 text-center py-10">
            {songs.length === 0 ? 'Aún no hay canciones' : 'Sin resultados'}
          </p>
        )}
        {filtered.map((x) => {
          const active = x.id === currentSongId
          return (
            <div key={x.id} className="group relative">
              <button
                onClick={() => selectSong(x.id)}
                className={`w-full text-left pl-3 pr-11 py-2.5 rounded-lg border transition-colors flex items-center gap-3 ${
                  active
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                    : 'border-transparent text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <Music size={16} className={active ? 'text-indigo-300' : 'text-zinc-500'} />
                <span className="min-w-0">
                  <span className="block text-sm font-medium truncate">{x.title}</span>
                  <span className="block text-xs text-zinc-500">{x.stanzas.length} estrofas</span>
                </span>
              </button>
              {activeService && (
                <button
                  onClick={() => addToService(x.id)}
                  title={`Agregar a "${activeService.name}"`}
                  className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex p-1.5 rounded-md bg-zinc-700 text-zinc-200 hover:bg-indigo-600 hover:text-white"
                >
                  <ListPlus size={16} />
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="px-3 py-2 border-t border-zinc-800 text-xs text-zinc-500">
        {songs.length} {songs.length === 1 ? 'canción' : 'canciones'}
      </div>
    </div>
  )
}
