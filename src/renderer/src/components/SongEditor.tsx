import { useState } from 'react'
import { Song, Stanza, parseStanzas, stanzasToText } from '../lib/songs'

interface Props {
  song: Song | null // null = canción nueva
  onSave: (title: string, stanzas: Stanza[]) => void
  onClose: () => void
}

export function SongEditor({ song, onSave, onClose }: Props): React.JSX.Element {
  const [title, setTitle] = useState(song?.title ?? '')
  const [raw, setRaw] = useState(song ? stanzasToText(song.stanzas) : '')

  const stanzas = parseStanzas(raw)
  const canSave = title.trim() !== '' && stanzas.length > 0

  return (
    <div
      data-modal
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div className="w-full max-w-5xl h-[85vh] bg-neutral-900 border border-neutral-700 rounded-lg flex flex-col">
        <header className="p-4 border-b border-neutral-700 flex items-center gap-3">
          <h2 className="text-lg font-bold">{song ? 'Editar canción' : 'Nueva canción'}</h2>
          <input
            autoFocus
            className="flex-1 p-2 rounded bg-neutral-800"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </header>

        <div className="flex-1 grid grid-cols-2 gap-4 p-4 min-h-0">
          <div className="flex flex-col min-h-0">
            <p className="text-xs text-neutral-400 mb-2">
              Separa las estrofas con una línea en blanco. Opcional: pon la etiqueta en la primera
              línea, por ejemplo <code>[Coro]</code>.
            </p>
            <textarea
              className="flex-1 p-3 rounded bg-neutral-800 font-mono text-sm resize-none"
              placeholder={'[Verso 1]\nPrimera línea\nSegunda línea\n\n[Coro]\n...'}
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
            />
          </div>

          <div className="overflow-y-auto space-y-2">
            <p className="text-xs text-neutral-400">
              Vista previa: {stanzas.length} {stanzas.length === 1 ? 'estrofa' : 'estrofas'}
            </p>
            {stanzas.map((st, i) => (
              <div key={i} className="p-3 rounded border border-neutral-700 bg-neutral-800">
                <div className="text-xs uppercase text-neutral-400 mb-1">{st.label}</div>
                {st.lines.map((l, j) => (
                  <div key={j}>{l}</div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <footer className="p-4 border-t border-neutral-700 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-neutral-700">
            Cancelar
          </button>
          <button
            disabled={!canSave}
            onClick={() => onSave(title.trim(), stanzas)}
            className="px-4 py-2 rounded bg-blue-600 disabled:opacity-40"
          >
            Guardar
          </button>
        </footer>
      </div>
    </div>
  )
}