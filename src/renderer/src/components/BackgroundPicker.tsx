import { useEffect, useState } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { usePresenter } from '../store'
import { bgUrl } from '../lib/themes'

export function BackgroundPicker(): React.JSX.Element {
  const theme = usePresenter((s) => s.theme)
  const setTheme = usePresenter((s) => s.setTheme)
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    window.api.backgrounds.list().then(setImages)
  }, [])

  const add = async (): Promise<void> => {
    const added = await window.api.backgrounds.add()
    if (added.length === 0) return
    setImages((prev) => [...prev, ...added])
    setTheme({ id: 'custom', bgType: 'image', bgImage: added[0] })
  }

  const remove = async (name: string): Promise<void> => {
    if (!window.confirm('¿Quitar esta imagen de la galería?')) return
    await window.api.backgrounds.remove(name)
    setImages((prev) => prev.filter((n) => n !== name))
    if (theme.bgImage === name) setTheme({ id: 'custom', bgType: 'solid', bgImage: '' })
  }

  return (
    <div className="space-y-3">
      <button
        onClick={add}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm transition-colors"
      >
        <ImagePlus size={16} /> Añadir imagen
      </button>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((name) => (
            <div key={name} className="group relative">
              <button
                onClick={() => setTheme({ id: 'custom', bgType: 'image', bgImage: name })}
                className={`block w-full aspect-video rounded-md border-2 bg-cover bg-center transition-colors ${
                  theme.bgImage === name
                    ? 'border-indigo-500'
                    : 'border-transparent hover:border-zinc-600'
                }`}
                style={{ backgroundImage: `url("${bgUrl(name)}")` }}
              />
              <button
                onClick={() => remove(name)}
                title="Quitar de la galería"
                className="absolute top-1 right-1 hidden group-hover:flex p-1 rounded bg-black/70 text-zinc-200 hover:bg-red-600"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="block text-sm text-zinc-300">
        <span className="flex justify-between mb-1">
          Oscurecer fondo <span className="text-zinc-500">{theme.bgDim ?? 0}%</span>
        </span>
        <input
          type="range"
          min={0}
          max={80}
          value={theme.bgDim ?? 0}
          onChange={(e) => setTheme({ id: 'custom', bgDim: Number(e.target.value) })}
          className="w-full accent-indigo-500"
        />
      </label>
    </div>
  )
}