import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Song, Stanza } from './lib/songs'
import { themePresets } from './lib/themes'

type Align = 'left' | 'center' | 'right'

const sortSongs = (songs: Song[]): Song[] =>
  [...songs].sort((a, b) => a.title.localeCompare(b.title, 'es', { sensitivity: 'base' }))

interface PresenterState {
  songs: Song[]
  currentSongId: string | null
  stanzaIndex: number
  blackout: boolean
  clear: boolean
  fontSize: number
  align: Align
  theme: Theme
  loadSongs: () => Promise<void>
  selectSong: (id: string) => void
  setStanza: (index: number) => void
  next: () => void
  prev: () => void
  toggleBlackout: () => void
  toggleClear: () => void
  setFontSize: (size: number) => void
  setAlign: (align: Align) => void
  setTheme: (patch: Partial<Theme>) => void
  addSong: (title: string, stanzas: Stanza[]) => string
  updateSong: (id: string, title: string, stanzas: Stanza[]) => void
  deleteSong: (id: string) => void
}

export const usePresenter = create<PresenterState>()(
  persist(
    (set, get) => ({
      songs: [],
      currentSongId: null,
      stanzaIndex: 0,
      blackout: false,
      clear: true,
      fontSize: 8,
      align: 'center',
      theme: themePresets[1],

      loadSongs: async () => {
        const songs = await window.api.songs.list()
        set({ songs })
      },

      selectSong: (id) => set({ currentSongId: id, stanzaIndex: 0, clear: true }),
      setStanza: (index) => set({ stanzaIndex: index, clear: false }),

      next: () => {
        const { clear, stanzaIndex } = get()
        const song = getCurrentSong(get())
        if (!song) return
        if (clear) set({ clear: false })
        else if (stanzaIndex < song.stanzas.length - 1) set({ stanzaIndex: stanzaIndex + 1 })
      },
      prev: () => {
        const { stanzaIndex } = get()
        if (stanzaIndex > 0) set({ stanzaIndex: stanzaIndex - 1, clear: false })
      },

      toggleBlackout: () => set((s) => ({ blackout: !s.blackout })),
      toggleClear: () => set((s) => ({ clear: !s.clear })),
      setFontSize: (fontSize) => set({ fontSize }),
      setAlign: (align) => set({ align }),
      setTheme: (patch) => set((s) => ({ theme: { ...s.theme, ...patch } })),

      addSong: (title, stanzas) => {
        const id = crypto.randomUUID()
        const song = { id, title, stanzas }
        set((s) => ({ songs: sortSongs([...s.songs, song]) }))
        window.api.songs.create(song)
        return id
      },

      updateSong: (id, title, stanzas) => {
        set((s) => ({
          songs: sortSongs(s.songs.map((x) => (x.id === id ? { ...x, title, stanzas } : x))),
          stanzaIndex:
            s.currentSongId === id ? Math.min(s.stanzaIndex, stanzas.length - 1) : s.stanzaIndex
        }))
        window.api.songs.update({ id, title, stanzas })
      },

      deleteSong: (id) => {
        set((s) => ({
          songs: s.songs.filter((x) => x.id !== id),
          ...(s.currentSongId === id ? { currentSongId: null, stanzaIndex: 0, clear: true } : {})
        }))
        window.api.songs.remove(id)
      }
    }),
    {
      name: 'lyric-presenter-settings',
      // Solo se recuerdan los ajustes de apariencia; las canciones viven en SQLite
      partialize: (s) => ({ theme: s.theme, fontSize: s.fontSize, align: s.align })
    }
  )
)

export function getCurrentSong(s: PresenterState): Song | null {
  return s.songs.find((song) => song.id === s.currentSongId) ?? null
}

// Lo que realmente se envía a la ventana de proyección
export function buildProjection(s: PresenterState): ProjectionState {
  const stanza = getCurrentSong(s)?.stanzas[s.stanzaIndex]
  return {
    lines: stanza?.lines ?? [],
    label: stanza?.label ?? '',
    blackout: s.blackout,
    clear: s.clear || !stanza,
    fontSize: s.fontSize,
    align: s.align,
    theme: s.theme
  }
}