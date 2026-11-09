import { useEffect, useRef, useState } from 'react'
import { FileUp, X, AlertTriangle } from 'lucide-react'
import { Stanza, parseStanzas } from '../lib/songs'
import { readTextFile, titleFromFileName } from '../lib/importText'
import { usePresenter } from '../store'

interface Pending {
  key: string
  title: string
  stanzas: Stanza[]
}

const norm = (t: string): string => t.trim().toLowerCase()

export function ImportModal({ onClose }: { onClose: () => void }): React.JSX.Element {
  const songs = usePresenter((s) => s.songs)
  const importSongs = usePresenter((s) => s.importSongs)
  const [items, setItems] = useState<Pending[]>([])
  const [rejected, setRejected] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const addFiles = async (files: File[]): Promise<void> => {
    const added: Pending[] = []
    const bad: string[] = []
    for (const file of files) {
      if (!file.name.toLowerCase().endsWith('.txt')) {
        bad.push(file.name)
        continue
      }
      const stanzas = parseStanzas(await readTextFile(file))
      if (stanzas.length === 0) {
        bad.push(file.name)
        continue
      }
      added.push({ key: crypto.randomUUID(), title: titleFromFileName(file.name), stanzas })
    }
    setItems((prev) => [...prev, ...added])
    setRejected(bad)
  }

  // Marca como duplicadas las que ya existen o se repiten dentro del mismo lote
  const existing = new Set(songs.map((s) => norm(s.title)))
  const seen = new Set<string>()
  const rows = items.map((it) => {
    const n = norm(it.title)
    const dup = existing.has(n) || seen.has(n)
    seen.add(n)
    return { ...it, dup }
  })
  const toImport = rows.filter((r) => !r.dup && r.title.trim() !== '')

  const handleImport = (): void => {
    importSongs(toImport.map((r) => ({ title: r.title.trim(), stanzas: r.stanzas })))
    onClose()
  }

  return (
    <div data-modal className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl h-[80vh] bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col">
        <header className="px-5 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold">Importar canciones</h2>
          <p className="text-xs text-zinc-500 mt-1">
            Un archivo .txt por canción: el nombre del archivo es el título y las estrofas se
            separan con una línea en blanco.
          </p>
        </header>

        <div className="p-5 space-y-4 flex-1 min-h-0 flex flex-col">
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              addFiles(Array.from(e.dataTransfer.files))
            }}
            className={`cursor-pointer rounded-xl border-2 border-dashed py-8 flex flex-col items-center gap-2 transition-colors ${
              dragging
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-zinc-700 hover:border-zinc-500'
            }`}
          >
            <FileUp size={28} className="text-zinc-400" />
            <p className="text-sm text-zinc-300">Arrastra archivos .txt aquí o haz clic para elegir</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".txt,text/plain"
            multiple
            hidden
            onChange={(e) => {
              addFiles(Array.from(e.target.files ?? []))
              e.target.value = ''
            }}
          />

          {rejected.length > 0 && (
            <p className="text-xs text-amber-400">
              No se pudieron leer: {rejected.join(', ')} (solo .txt con texto)
            </p>
          )}

          <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
            {rows.map((r) => (
              <div
                key={r.key}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  r.dup ? 'border-amber-500/40 bg-amber-500/5' : 'border-zinc-800 bg-zinc-950'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <input
                    className="w-full bg-transparent text-sm font-medium border-b border-transparent focus:border-indigo-500 focus:outline-none"
                    value={r.title}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((x) => (x.key === r.key ? { ...x, title: e.target.value } : x))
                      )
                    }
                  />
                  <p className="text-xs text-zinc-500 mt-1 truncate">
                    {r.stanzas.length} estrofas · {r.stanzas[0].lines[0]}
                  </p>
                  {r.dup && (
                    <p className="text-xs text-amber-400 flex items-center gap-1 mt-1">
                      <AlertTriangle size={12} /> Ya existe una canción con este título; cámbialo
                      para importarla
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setItems((prev) => prev.filter((x) => x.key !== r.key))}
                  className="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-800"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <footer className="px-5 py-4 border-t border-zinc-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm">
            Cancelar
          </button>
          <button
            disabled={toImport.length === 0}
            onClick={handleImport}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium disabled:opacity-40 disabled:hover:bg-indigo-600"
          >
            Importar {toImport.length} {toImport.length === 1 ? 'canción' : 'canciones'}
          </button>
        </footer>
      </div>
    </div>
  )
}