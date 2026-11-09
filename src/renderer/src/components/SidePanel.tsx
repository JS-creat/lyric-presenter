import { useEffect, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Eraser,
  MonitorOff,
  MonitorPlay,
  X,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react'
import { Slide } from './Slide'
import { ThemePanel } from './ThemePanel'
import { usePresenter, buildProjection } from '../store'


const btn =
  'flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors'

function Kbd({ children }: { children: string }): React.JSX.Element {
  return (
    <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 text-zinc-400 font-sans">
      {children}
    </kbd>
  )
}

export function SidePanel(): React.JSX.Element {
  const s = usePresenter()
  const preview = buildProjection(s)
  const [displays, setDisplays] = useState<DisplayInfo[]>([])
  const [displayId, setDisplayId] = useState<number | ''>('')

  // Se actualiza al abrir la app y cada vez que vuelves a ella (por ejemplo, tras conectar el proyector)
  useEffect(() => {
    const refresh = (): void => {
      window.api.displays.list().then(setDisplays)
    }
    refresh()
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [])

  return (
    <aside className="flex flex-col min-h-0 border-l border-zinc-800 bg-zinc-900/50">
      <div className="p-4 space-y-3 border-b border-zinc-800">
        <span className="text-xs font-semibold tracking-wider text-zinc-500">VISTA PREVIA</span>
        <div className="aspect-video rounded-lg overflow-hidden border border-zinc-700 shadow-lg">
          <Slide state={preview} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={s.prev} className={`${btn} bg-zinc-800 hover:bg-zinc-700`}>
            <ChevronLeft size={18} /> Anterior
          </button>
          <button onClick={s.next} className={`${btn} bg-indigo-600 hover:bg-indigo-500`}>
            Siguiente <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={s.toggleClear}
            className={`${btn} border ${s.clear
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-transparent'
              }`}
          >
            <Eraser size={16} /> Limpiar <Kbd>Esc</Kbd>
          </button>
          <button
            onClick={s.toggleBlackout}
            className={`${btn} border ${s.blackout
              ? 'bg-red-500/20 text-red-300 border-red-500/40'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-transparent'
              }`}
          >
            <MonitorOff size={16} /> Blackout <Kbd>B</Kbd>
          </button>
        </div>

        <select
          value={displayId}
          onChange={(e) => setDisplayId(e.target.value === '' ? '' : Number(e.target.value))}
          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm focus:outline-none focus:border-indigo-500"
        >
          <option value="">Automática (pantalla externa)</option>
          {displays.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => window.api.openOutput(displayId === '' ? undefined : displayId)}
            className={`${btn} bg-zinc-800 hover:bg-zinc-700`}
          >
            <MonitorPlay size={16} /> Abrir proyección
          </button>
          <button
            onClick={() => window.api.closeOutput()}
            className={`${btn} bg-zinc-800 hover:bg-zinc-700`}
          >
            <X size={16} /> Cerrar
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <span className="text-xs font-semibold tracking-wider text-zinc-500">APARIENCIA</span>

        <label className="block text-sm text-zinc-300">
          <span className="flex justify-between mb-1">
            Tamaño de fuente <span className="text-zinc-500">{s.fontSize}</span>
          </span>
          <input
            type="range"
            min={3}
            max={14}
            step={0.5}
            value={s.fontSize}
            onChange={(e) => s.setFontSize(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </label>

        <div className="flex bg-zinc-800 rounded-lg p-1 gap-1">
          {(
            [
              ['left', AlignLeft],
              ['center', AlignCenter],
              ['right', AlignRight]
            ] as const
          ).map(([value, Icon]) => (
            <button
              key={value}
              onClick={() => s.setAlign(value)}
              className={`flex-1 py-1.5 rounded-md flex justify-center transition-colors ${s.align === value ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>

        <ThemePanel />
      </div>
    </aside>
  )
}