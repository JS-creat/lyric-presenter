import { useEffect, useState } from 'react'
import { Music2 } from 'lucide-react'
import { Slide } from './components/Slide'
import { SongEditor } from './components/SongEditor'
import { ImportModal } from './components/ImportModal'
import { Library } from './components/Library'
import { StanzaList } from './components/StanzaList'
import { SidePanel } from './components/SidePanel'
import { Stanza } from './lib/songs'
import { usePresenter, buildProjection } from './store'

function StatusBadge(): React.JSX.Element {
  const blackout = usePresenter((s) => s.blackout)
  const clear = usePresenter((s) => s.clear)

  const [label, cls] = blackout
    ? ['BLACKOUT', 'bg-red-500/15 text-red-400 border-red-500/30']
    : clear
      ? ['LIMPIA', 'bg-amber-500/15 text-amber-300 border-amber-500/30']
      : ['EN VIVO', 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30']

  return (
    <span className={`text-xs font-bold tracking-wider px-3 py-1 rounded-full border ${cls}`}>
      {label}
    </span>
  )
}

function Control(): React.JSX.Element {
  const songs = usePresenter((s) => s.songs)

  // null = cerrado; { songId: null } = canción nueva; { songId: 'x' } = editando
  const [editor, setEditor] = useState<{ songId: string | null } | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const editingSong = songs.find((x) => x.id === editor?.songId) ?? null

  const handleSave = (title: string, stanzas: Stanza[]): void => {
    const st = usePresenter.getState()
    if (editingSong) st.updateSong(editingSong.id, title, stanzas)
    else st.selectSong(st.addSong(title, stanzas))
    setEditor(null)
  }

  // Carga inicial de canciones desde SQLite
  useEffect(() => {
    usePresenter.getState().loadSongs()
  }, [])

  // Sincroniza con la ventana de proyección cada vez que cambia el estado
  useEffect(() => {
    window.api.updateState(buildProjection(usePresenter.getState()))
    return usePresenter.subscribe((state) => window.api.updateState(buildProjection(state)))
  }, [])

  // Evita que soltar un archivo fuera de una zona válida navegue a ese archivo
  useEffect(() => {
    const prevent = (e: DragEvent): void => e.preventDefault()
    window.addEventListener('dragover', prevent)
    window.addEventListener('drop', prevent)
    return () => {
      window.removeEventListener('dragover', prevent)
      window.removeEventListener('drop', prevent)
    }
  }, [])

  // Atajos de teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (document.querySelector('[data-modal]')) return
      const st = usePresenter.getState()
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault()
        st.next()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        st.prev()
      } else if (e.key.toLowerCase() === 'b') st.toggleBlackout()
      else if (e.key === 'Escape') st.toggleClear()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-100">
      <header className="h-12 shrink-0 border-b border-zinc-800 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold tracking-tight">
          <Music2 size={18} className="text-indigo-400" />
          Lyric Presenter
        </div>
        <StatusBadge />
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-[260px_1fr_340px]">
        <Library onNew={() => setEditor({ songId: null })} onImport={() => setImportOpen(true)} />
        <StanzaList onEdit={(songId) => setEditor({ songId })} />
        <SidePanel />
      </div>

      {editor && (
        <SongEditor
          key={editor.songId ?? 'new'}
          song={editingSong}
          onSave={handleSave}
          onClose={() => setEditor(null)}
        />
      )}

      {importOpen && <ImportModal onClose={() => setImportOpen(false)} />}
    </div>
  )
}

function Output(): React.JSX.Element {
  const [state, setState] = useState<ProjectionState | null>(null)

  useEffect(() => {
    window.api.getState().then(setState)
    return window.api.onState(setState)
  }, [])

  return (
    <div className="h-screen w-screen cursor-none">
      <Slide state={state} />
    </div>
  )
}

export default function App(): React.JSX.Element {
  return window.location.hash === '#/output' ? <Output /> : <Control />
}
