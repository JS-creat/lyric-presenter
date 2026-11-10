import { usePresenter } from '../store'
import { themePresets, fonts, themeBackground } from '../lib/themes'
import { BackgroundPicker } from './BackgroundPicker'

const field = 'flex items-center gap-2 text-sm text-zinc-300'
const colorInput = 'h-8 w-10 rounded cursor-pointer bg-transparent border border-zinc-700'

const bgTypes = [
  ['solid', 'Color'],
  ['gradient', 'Degradado'],
  ['image', 'Imagen']
] as const

export function ThemePanel(): React.JSX.Element {
  const theme = usePresenter((s) => s.theme)
  const setTheme = usePresenter((s) => s.setTheme)

  // Al tocar un ajuste, el tema pasa a ser "personalizado"
  const update = (patch: Partial<Theme>): void => setTheme({ ...patch, id: 'custom' })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {themePresets.map((p) => (
          <button
            key={p.id}
            onClick={() => setTheme(p)}
            title={p.name}
            className={`h-14 rounded-lg text-lg font-bold border-2 transition-colors ${
              theme.id === p.id ? 'border-indigo-500' : 'border-transparent hover:border-zinc-600'
            }`}
            style={{
              background: themeBackground(p),
              color: p.textColor,
              fontFamily: p.fontFamily
            }}
          >
            Aa
          </button>
        ))}
      </div>

      <div className="flex bg-zinc-800 rounded-lg p-1 gap-1">
        {bgTypes.map(([type, label]) => (
          <button
            key={type}
            onClick={() => update({ bgType: type })}
            className={`flex-1 py-1.5 rounded-md text-sm transition-colors ${
              theme.bgType === type ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {theme.bgType === 'image' && <BackgroundPicker />}

      <div className="flex flex-wrap items-center gap-4">
        {theme.bgType !== 'image' && (
          <label className={field}>
            Fondo
            <input
              type="color"
              className={colorInput}
              value={theme.bg1}
              onChange={(e) => update({ bg1: e.target.value })}
            />
          </label>
        )}
        {theme.bgType === 'gradient' && (
          <label className={field}>
            Fin
            <input
              type="color"
              className={colorInput}
              value={theme.bg2}
              onChange={(e) => update({ bg2: e.target.value })}
            />
          </label>
        )}
        <label className={field}>
          Texto
          <input
            type="color"
            className={colorInput}
            value={theme.textColor}
            onChange={(e) => update({ textColor: e.target.value })}
          />
        </label>
      </div>

      {theme.bgType === 'gradient' && (
        <label className="block text-sm text-zinc-300">
          <span className="flex justify-between mb-1">
            Ángulo <span className="text-zinc-500">{theme.gradientAngle}°</span>
          </span>
          <input
            type="range"
            min={0}
            max={360}
            value={theme.gradientAngle}
            onChange={(e) => update({ gradientAngle: Number(e.target.value) })}
            className="w-full accent-indigo-500"
          />
        </label>
      )}

      <select
        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm focus:outline-none focus:border-indigo-500"
        value={theme.fontFamily}
        onChange={(e) => update({ fontFamily: e.target.value })}
      >
        {fonts.map((f) => (
          <option key={f.label} value={f.css}>
            {f.label}
          </option>
        ))}
      </select>

      <div className="flex gap-4 text-sm text-zinc-300">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="accent-indigo-500"
            checked={theme.bold}
            onChange={(e) => update({ bold: e.target.checked })}
          />
          Negrita
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="accent-indigo-500"
            checked={theme.uppercase}
            onChange={(e) => update({ uppercase: e.target.checked })}
          />
          MAYÚSC.
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="accent-indigo-500"
            checked={theme.shadow}
            onChange={(e) => update({ shadow: e.target.checked })}
          />
          Sombra
        </label>
      </div>
    </div>
  )
}
