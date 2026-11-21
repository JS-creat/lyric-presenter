import { useState } from 'react'
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Pencil,
  SkipBack,
  SkipForward,
  ListMusic
} from 'lucide-react'
import { usePresenter, getActiveService } from '../store'

const iconBtn =
  'p-1.5 rounded text-zinc-500 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-500'

export function ServicePanel(): React.JSX.Element {
  const services = usePresenter((s) => s.services)
  const active = usePresenter(getActiveService)
  const songs = usePresenter((s) => s.songs)
  const cursor = usePresenter((s) => s.serviceCursor)
  const {
    setActiveService,
    createService,
    renameService,
    deleteService,
    removeFromService,
    moveInService,
    goToServiceItem,
    stepService
  } = usePresenter.getState()

  const [mode, setMode] = useState<'idle' | 'create' | 'rename'>('idle')
  const [name, setName] = useState('')

  const open = (m: 'create' | 'rename'): void => {
    setName(m === 'rename' && active ? active.name : '')
    setMode(m)
  }

  const submit = (): void => {
    const value = name.trim()
    if (!value) return
    if (mode === 'create') createService(value)
    else if (mode === 'rename' && active) renameService(active.id, value)
    setMode('idle')
    setName('')
  }

  const handleDelete = (): void => {
    if (active && window.confirm(`¿Eliminar el servicio "${active.name}"?`)) {
      deleteService(active.id)
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="p-3 space-y-2 border-b border-zinc-800">
        {mode === 'idle' ? (
          <>
            <select
              value={active?.id ?? ''}
              onChange={(e) => setActiveService(e.target.value || null)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="">
                {services.length === 0 ? 'Sin servicios' : 'Elige un servicio'}
              </option>
              {services.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => open('create')}
                className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium transition-colors"
              >
                <Plus size={16} /> Nuevo
              </button>
              <button
                onClick={() => open('rename')}
                disabled={!active}
                className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm disabled:opacity-40 disabled:hover:bg-zinc-800 transition-colors"
              >
                <Pencil size={15} /> Editar
              </button>
              <button
                onClick={handleDelete}
                disabled={!active}
                className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-zinc-800 hover:bg-red-600/80 text-sm disabled:opacity-40 disabled:hover:bg-zinc-800 transition-colors"
              >
                <Trash2 size={15} /> Borrar
              </button>
            </div>
          </>
        ) : (
          <>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit()
                if (e.key === 'Escape') setMode('idle')
              }}
              placeholder="Nombre del servicio"
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode('idle')}
                className="py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={submit}
                disabled={!name.trim()}
                className="py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium disabled:opacity-40"
              >
                Aceptar
              </button>
            </div>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {!active && (
          <div className="flex flex-col items-center gap-2 text-zinc-500 text-center py-10 px-4">
            <ListMusic size={32} strokeWidth={1.5} />
            <p className="text-sm">
              Crea un servicio y agrega canciones con el botón + de la biblioteca
            </p>
          </div>
        )}

        {active && active.songIds.length === 0 && (
          <p className="text-sm text-zinc-500 text-center py-10 px-4">
            Servicio vacío. En la biblioteca, pasa el mouse sobre una canción y pulsa +
          </p>
        )}

        {active?.songIds.map((songId, i) => {
          const song = songs.find((x) => x.id === songId)
          const current = cursor === i
          return (
            <div
              key={`${songId}-${i}`}
              className={`flex items-center rounded-lg border transition-colors ${
                current
                  ? 'border-emerald-500/60 bg-emerald-500/10'
                  : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'
              }`}
            >
              <button
                onClick={() => goToServiceItem(i)}
                className="flex-1 min-w-0 flex items-center gap-3 pl-3 pr-1 py-2 text-left"
              >
                <span
                  className={`shrink-0 h-6 w-6 rounded-full text-xs font-bold flex items-center justify-center ${
                    current ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="truncate text-sm">{song?.title ?? 'Canción eliminada'}</span>
              </button>
              <button
                className={iconBtn}
                disabled={i === 0}
                onClick={() => moveInService(i, -1)}
                title="Subir"
              >
                <ChevronUp size={16} />
              </button>
              <button
                className={iconBtn}
                disabled={i === active.songIds.length - 1}
                onClick={() => moveInService(i, 1)}
                title="Bajar"
              >
                <ChevronDown size={16} />
              </button>
              <button
                className={`${iconBtn} mr-1`}
                onClick={() => removeFromService(i)}
                title="Quitar del servicio"
              >
                <Trash2 size={15} />
              </button>
            </div>
          )
        })}
      </div>

      {active && active.songIds.length > 0 && (
        <div className="p-3 border-t border-zinc-800 grid grid-cols-2 gap-2">
          <button
            onClick={() => stepService(-1)}
            className="flex items-center justify-center gap-2 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm transition-colors"
          >
            <SkipBack size={15} /> Anterior
          </button>
          <button
            onClick={() => stepService(1)}
            className="flex items-center justify-center gap-2 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium transition-colors"
          >
            Siguiente <SkipForward size={15} />
          </button>
          <p className="col-span-2 text-center text-[11px] text-zinc-500">
            Atajo: Ctrl + ← / Ctrl + →
          </p>
        </div>
      )}
    </div>
  )
}
