import { usePresenter } from '../store'
import { themePresets, fonts, themeBackground } from '../lib/themes'

export function ThemePanel(): React.JSX.Element {
  const theme = usePresenter((s) => s.theme)
  const setTheme = usePresenter((s) => s.setTheme)

  // Al tocar un ajuste, el tema pasa a ser "personalizado"
  const update = (patch: Partial<Theme>): void => setTheme({ ...patch, id: 'custom' })

  return (
    <div className="space-y-3 pt-3 border-t border-neutral-700">
      <h3 className="text-sm font-semibold text-neutral-300">Tema</h3>

      <div className="grid grid-cols-3 gap-2">
        {themePresets.map((p) => (
          <button
            key={p.id}
            onClick={() => setTheme(p)}
            title={p.name}
            className="h-12 rounded border-2 text-lg font-bold"
            style={{
              background: themeBackground(p),
              color: p.textColor,
              fontFamily: p.fontFamily,
              borderColor: theme.id === p.id ? '#3b82f6' : 'transparent'
            }}
          >
            Aa
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {(['solid', 'gradient'] as const).map((type) => (
          <button
            key={type}
            onClick={() => update({ bgType: type })}
            className={`flex-1 py-1 rounded text-sm ${
              theme.bgType === type ? 'bg-blue-600' : 'bg-neutral-700'
            }`}
          >
            {type === 'solid' ? 'Color' : 'Degradado'}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 text-sm">
        <label className="flex items-center gap-1">
          Fondo
          <input
            type="color"
            value={theme.bg1}
            onChange={(e) => update({ bg1: e.target.value })}
          />
        </label>
        {theme.bgType === 'gradient' && (
          <label className="flex items-center gap-1">
            Fin
            <input
              type="color"
              value={theme.bg2}
              onChange={(e) => update({ bg2: e.target.value })}
            />
          </label>
        )}
        <label className="flex items-center gap-1">
          Texto
          <input
            type="color"
            value={theme.textColor}
            onChange={(e) => update({ textColor: e.target.value })}
          />
        </label>
      </div>

      {theme.bgType === 'gradient' && (
        <label className="block text-sm">
          Ángulo: {theme.gradientAngle}°
          <input
            type="range"
            min={0}
            max={360}
            value={theme.gradientAngle}
            onChange={(e) => update({ gradientAngle: Number(e.target.value) })}
            className="w-full"
          />
        </label>
      )}

      <select
        className="w-full p-2 rounded bg-neutral-800 text-sm"
        value={theme.fontFamily}
        onChange={(e) => update({ fontFamily: e.target.value })}
      >
        {fonts.map((f) => (
          <option key={f.label} value={f.css}>
            {f.label}
          </option>
        ))}
      </select>

      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={theme.bold}
            onChange={(e) => update({ bold: e.target.checked })}
          />
          Negrita
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={theme.uppercase}
            onChange={(e) => update({ uppercase: e.target.checked })}
          />
          MAYÚSC.
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={theme.shadow}
            onChange={(e) => update({ shadow: e.target.checked })}
          />
          Sombra
        </label>
      </div>
    </div>
  )
}