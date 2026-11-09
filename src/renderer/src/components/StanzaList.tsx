import { useEffect } from 'react'
import { Pencil, Trash2, ListMusic } from 'lucide-react'
import { usePresenter, getCurrentSong } from '../store'

export function StanzaList({ onEdit }: { onEdit: (songId: string) => void }): React.JSX.Element {
  const song = usePresenter(getCurrentSong)
  const stanzaIndex = usePresenter((s) => s.stanzaIndex)
  const clear = usePresenter((s) => s.clear)
  const setStanza = usePresenter((s) => s.setStanza)
  const deleteSong = usePresenter((s) => s.deleteSong)

  useEffect(() => {
    document
      .getElementById(`stanza-${stanzaIndex}`)
      ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [stanzaIndex, song?.id])

  if (!song) {
    return (
      <main className="flex flex-col items-center justify-center gap-3 text-zinc-500">
        <ListMusic size={40} strokeWidth={1.5} />
        <p className="text-sm">Elige una canción de la biblioteca</p>
      </main>
    )
  }

  const handleDelete = (): void => {
    if (window.confirm(`¿Eliminar "${song.title}"?`)) deleteSong(song.id)
  }

  return (
    <main className="flex flex-col min-h-0">
      <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold truncate">{song.title}</h2>
          <p className="text-xs text-zinc-500">{song.stanzas.length} estrofas</p>
        </div>
        <button
          onClick={() => onEdit(song.id)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm transition-colors"
        >
          <Pencil size={15} /> Editar
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-red-600/80 text-sm transition-colors"
        >
          <Trash2 size={15} /> Eliminar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {song.stanzas.map((st, i) => {
          const active = i === stanzaIndex && !clear
          return (
            <button
              key={i}
              id={`stanza-${i}`}
              onClick={() => setStanza(i)}
              className={`w-full text-left rounded-xl border p-4 flex gap-4 transition-colors ${
                active
                  ? 'border-emerald-500/60 bg-emerald-500/10'
                  : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'
              }`}
            >
              <span
                className={`shrink-0 h-7 w-7 rounded-full text-xs font-bold flex items-center justify-center ${
                  active ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    {st.label}
                  </span>
                  {active && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-black">
                      EN VIVO
                    </span>
                  )}
                </span>
                {st.lines.map((l, j) => (
                  <span key={j} className="block text-[15px] leading-snug text-zinc-200">
                    {l}
                  </span>
                ))}
              </span>
            </button>
          )
        })}
      </div>
    </main>
  )
}