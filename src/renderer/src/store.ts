import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Song, Stanza } from './lib/songs'
import { themePresets } from './lib/themes'

type Align = 'left' | 'center' | 'right'

const sortSongs = (songs: Song[]): Song[] =>
  [...songs].sort((a, b) => a.title.localeCompare(b.title, 'es', { sensitivity: 'base' }))

const sortServices = (services: ServiceData[]): ServiceData[] =>
  [...services].sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }))

interface PresenterState {
  songs: Song[]
  services: ServiceData[]
  activeServiceId: string | null
  serviceCursor: number | null
  currentSongId: string | null
  stanzaIndex: number
  blackout: boolean
  clear: boolean
  fontSize: number
  align: Align
  theme: Theme
  loadSongs: () => Promise<void>
  loadServices: () => Promise<void>
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
  importSongs: (items: { title: string; stanzas: Stanza[] }[]) => void
  createService: (name: string) => void
  renameService: (id: string, name: string) => void
  deleteService: (id: string) => void
  setActiveService: (id: string | null) => void
  addToService: (songId: string) => void
  removeFromService: (index: number) => void
  moveInService: (index: number, delta: -1 | 1) => void
  goToServiceItem: (index: number) => void
  stepService: (delta: -1 | 1) => void
}

export const usePresenter = create<PresenterState>()(
  persist(
    (set, get) => ({
      songs: [],
      services: [],
      activeServiceId: null,
      serviceCursor: null,
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

      loadServices: async () => {
        const services = await window.api.services.list()
        set((s) => ({
          services,
          activeServiceId: services.some((x) => x.id === s.activeServiceId)
            ? s.activeServiceId
            : null
        }))
      },

      selectSong: (id) =>
        set({ currentSongId: id, stanzaIndex: 0, clear: true, serviceCursor: null }),
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
          // La base de datos ya la quita de los servicios; aquí se refleja en pantalla
          services: s.services.map((svc) => ({
            ...svc,
            songIds: svc.songIds.filter((x) => x !== id)
          })),
          serviceCursor: null,
          ...(s.currentSongId === id ? { currentSongId: null, stanzaIndex: 0, clear: true } : {})
        }))
        window.api.songs.remove(id)
      },

      importSongs: (items) => {
        items.forEach((item) => get().addSong(item.title, item.stanzas))
      },

      // ---- Servicios ----
      createService: (name) => {
        const service: ServiceData = { id: crypto.randomUUID(), name, songIds: [] }
        set((s) => ({
          services: sortServices([...s.services, service]),
          activeServiceId: service.id,
          serviceCursor: null
        }))
        window.api.services.save(service)
      },

      renameService: (id, name) => {
        const services = sortServices(get().services.map((x) => (x.id === id ? { ...x, name } : x)))
        set({ services })
        const updated = services.find((x) => x.id === id)
        if (updated) window.api.services.save(updated)
      },

      deleteService: (id) => {
        set((s) => ({
          services: s.services.filter((x) => x.id !== id),
          ...(s.activeServiceId === id ? { activeServiceId: null, serviceCursor: null } : {})
        }))
        window.api.services.remove(id)
      },

      setActiveService: (id) => set({ activeServiceId: id, serviceCursor: null }),

      addToService: (songId) =>
        updateActiveService((svc) => ({ ...svc, songIds: [...svc.songIds, songId] })),

      removeFromService: (index) => {
        updateActiveService((svc) => ({
          ...svc,
          songIds: svc.songIds.filter((_, i) => i !== index)
        }))
        set((s) => {
          const c = s.serviceCursor
          if (c === null) return {}
          if (c === index) return { serviceCursor: null }
          return { serviceCursor: c > index ? c - 1 : c }
        })
      },

      moveInService: (index, delta) => {
        const svc = getActiveService(get())
        const target = index + delta
        if (!svc || target < 0 || target >= svc.songIds.length) return
        updateActiveService((current) => {
          const ids = [...current.songIds]
          ;[ids[index], ids[target]] = [ids[target], ids[index]]
          return { ...current, songIds: ids }
        })
        set((s) => ({
          serviceCursor:
            s.serviceCursor === index
              ? target
              : s.serviceCursor === target
                ? index
                : s.serviceCursor
        }))
      },

      goToServiceItem: (index) => {
        const songId = getActiveService(get())?.songIds[index]
        if (!songId || !get().songs.some((x) => x.id === songId)) return
        set({ currentSongId: songId, stanzaIndex: 0, clear: true, serviceCursor: index })
      },

      stepService: (delta) => {
        const svc = getActiveService(get())
        if (!svc || svc.songIds.length === 0) return
        const cursor = get().serviceCursor
        const target = cursor === null ? (delta === 1 ? 0 : svc.songIds.length - 1) : cursor + delta
        if (target < 0 || target >= svc.songIds.length) return
        get().goToServiceItem(target)
      }
    }),
    {
      name: 'lyric-presenter-settings',
      // Solo se recuerdan los ajustes y el servicio activo; los datos viven en SQLite
      partialize: (s) => ({
        theme: s.theme,
        fontSize: s.fontSize,
        align: s.align,
        activeServiceId: s.activeServiceId
      }),
      // Completa temas guardados con versiones anteriores que no tenían campos nuevos
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<PresenterState>
        return { ...current, ...saved, theme: { ...current.theme, ...saved.theme } }
      }
    }
  )
)

export function getCurrentSong(s: PresenterState): Song | null {
  return s.songs.find((song) => song.id === s.currentSongId) ?? null
}

export function getActiveService(s: PresenterState): ServiceData | null {
  return s.services.find((x) => x.id === s.activeServiceId) ?? null
}

// Aplica un cambio al servicio activo y lo guarda en la base de datos
function updateActiveService(fn: (svc: ServiceData) => ServiceData): void {
  const state = usePresenter.getState()
  const current = getActiveService(state)
  if (!current) return
  const updated = fn(current)
  usePresenter.setState({
    services: state.services.map((x) => (x.id === updated.id ? updated : x))
  })
  window.api.services.save(updated)
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
