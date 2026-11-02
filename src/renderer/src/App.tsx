
import { useEffect, useState } from 'react'
import { Slide } from './components/Slide'
import { usePresenter, getCurrentSong, buildProjection } from './store'
import { SongEditor } from './components/SongEditor'
import { Stanza } from './lib/songs'
import { ThemePanel } from './components/ThemePanel'

function Control(): React.JSX.Element {
  const s = usePresenter()
  const [query, setQuery] = useState('')
  const song = getCurrentSong(s)
  const preview = buildProjection(s)

  const [editor, setEditor] = useState<{ songId: string | null } | null>(null)
  const editingSong = s.songs.find((x) => x.id === editor?.songId) ?? null

  // Guardar canción
  const handleSave = (title: string, stanzas: Stanza[]): void => {
    if (editingSong) {
      s.updateSong(editingSong.id, title, stanzas)
    } else {
      s.selectSong(s.addSong(title, stanzas))
    }

    setEditor(null)
  }

  // Eliminar canción
  const handleDelete = (): void => {
    if (song && window.confirm(`¿Eliminar "${song.title}"?`)) {
      s.deleteSong(song.id)
    }
  }

  useEffect(() => {
    usePresenter.getState().loadSongs()
  }, [])

  // Sincroniza con la ventana de proyección cada vez que cambia el estado
  useEffect(() => {
    window.api.updateState(buildProjection(usePresenter.getState()))

    return usePresenter.subscribe((state) =>
      window.api.updateState(buildProjection(state))
    )
  }, [])

  // Atajos de teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const tag = (e.target as HTMLElement).tagName

      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (document.querySelector('[data-modal]')) return

      const st = usePresenter.getState()

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault()
        st.next()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        st.prev()
      } else if (e.key.toLowerCase() === 'b') {
        st.toggleBlackout()
      } else if (e.key === 'Escape') {
        st.toggleClear()
      }
    }

    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Filtrar canciones
  const filtered = s.songs.filter((x) =>
    x.title.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="h-screen grid grid-cols-[260px_1fr_340px] bg-neutral-900 text-neutral-100">

      {/* Biblioteca */}
      <aside className="border-r border-neutral-700 p-3 space-y-2 overflow-y-auto">
        <input
          className="w-full p-2 rounded bg-neutral-800"
          placeholder="Buscar canción..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button
          onClick={() => setEditor({ songId: null })}
          className="w-full py-2 rounded bg-green-700 hover:bg-green-600"
        >
          + Nueva canción
        </button>

        {filtered.map((x) => (
          <button
            key={x.id}
            onClick={() => s.selectSong(x.id)}
            className={`w-full text-left p-2 rounded ${x.id === s.currentSongId
                ? 'bg-blue-600'
                : 'bg-neutral-800 hover:bg-neutral-700'
              }`}
          >
            {x.title}
          </button>
        ))}
      </aside>

      {/* Estrofas */}
      <main className="p-4 space-y-2 overflow-y-auto">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold flex-1">
            {song ? song.title : 'Elige una canción'}
          </h2>

          {song && (
            <>
              <button
                onClick={() => setEditor({ songId: song.id })}
                className="px-3 py-1 rounded bg-neutral-700"
              >
                Editar
              </button>

              <button
                onClick={handleDelete}
                className="px-3 py-1 rounded bg-red-800"
              >
                Eliminar
              </button>
            </>
          )}
        </div>

        {song?.stanzas.map((st, i) => {
          const active = i === s.stanzaIndex && !s.clear

          return (
            <button
              key={i}
              onClick={() => s.setStanza(i)}
              className={`w-full text-left p-3 rounded border ${active
                  ? 'border-green-500 bg-green-900/40'
                  : 'border-neutral-700 bg-neutral-800'
                }`}
            >
              <div className="text-xs uppercase text-neutral-400 mb-1">
                {st.label}
              </div>

              {st.lines.map((l, j) => (
                <div key={j}>{l}</div>
              ))}
            </button>
          )
        })}
      </main>

      {/* Vista previa y controles */}
      <aside className="border-l border-neutral-700 p-3 space-y-4 overflow-y-auto">

        {/* Vista previa */}
        <div className="aspect-video border border-neutral-600">
          <Slide state={preview} />
        </div>

        {/* Blackout y limpiar */}
        <div className="flex gap-2">
          <button
            onClick={s.toggleBlackout}
            className={`flex-1 py-2 rounded ${s.blackout ? 'bg-red-600' : 'bg-neutral-700'
              }`}
          >
            Blackout (B)
          </button>

          <button
            onClick={s.toggleClear}
            className={`flex-1 py-2 rounded ${s.clear ? 'bg-yellow-600' : 'bg-neutral-700'
              }`}
          >
            Limpiar (Esc)
          </button>
        </div>

        {/* Navegación */}
        <div className="flex gap-2">
          <button
            onClick={s.prev}
            className="flex-1 py-2 rounded bg-neutral-700"
          >
            ← Anterior
          </button>

          <button
            onClick={s.next}
            className="flex-1 py-2 rounded bg-neutral-700"
          >
            Siguiente →
          </button>
        </div>

        {/* Tamaño de fuente */}
        <label className="block text-sm">
          Tamaño de fuente: {s.fontSize}

          <input
            type="range"
            min={3}
            max={14}
            step={0.5}
            value={s.fontSize}
            onChange={(e) => s.setFontSize(Number(e.target.value))}
            className="w-full"
          />
        </label>

        {/* Alineación */}
        <div className="flex gap-2">
          {(['left', 'center', 'right'] as const).map((a) => (
            <button
              key={a}
              onClick={() => s.setAlign(a)}
              className={`flex-1 py-1 rounded ${s.align === a ? 'bg-blue-600' : 'bg-neutral-700'
                }`}
            >
              {a === 'left' ? 'Izq' : a === 'center' ? 'Centro' : 'Der'}
            </button>
          ))}
        </div>

        <ThemePanel />

        {/* Ventana de proyección */}
        <div className="flex gap-2">
          <button
            onClick={() => window.api.openOutput()}
            className="flex-1 py-2 rounded bg-blue-600"
          >
            Abrir proyección
          </button>

          <button
            onClick={() => window.api.closeOutput()}
            className="flex-1 py-2 rounded bg-neutral-700"
          >
            Cerrar
          </button>
        </div>
      </aside>

      {/* Editor de canciones */}
      {editor && (
        <SongEditor
          key={editor.songId ?? 'new'}
          song={editingSong}
          onSave={handleSave}
          onClose={() => setEditor(null)}
        />
      )}
    </div>
  )
}

// Ventana de proyección
function Output(): React.JSX.Element {
  const [state, setState] = useState<ProjectionState | null>(null)

  useEffect(() => {
    window.api.getState().then(setState)

    return window.api.onState(setState)
  }, [])

  return (
    <div className="h-screen w-screen">
      <Slide state={state} />
    </div>
  )
}

// Componente principal
export default function App(): React.JSX.Element {
  return window.location.hash === '#/output'
    ? <Output />
    : <Control />
}
