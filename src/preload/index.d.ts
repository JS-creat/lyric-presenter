import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface ProjectionState {
    lines: string[]
    label: string
    blackout: boolean
    clear: boolean
    fontSize: number
    align: 'left' | 'center' | 'right'
  }

  interface StanzaData {
    label: string
    lines: string[]
  }

  interface SongData {
    id: string
    title: string
    stanzas: StanzaData[]
  }

  interface Api {
    openOutput(): Promise<void>
    closeOutput(): Promise<void>
    updateState(state: ProjectionState): void
    getState(): Promise<ProjectionState | null>
    onState(cb: (state: ProjectionState) => void): () => void
    songs: {
      list(): Promise<SongData[]>
      create(song: SongData): Promise<void>
      update(song: SongData): Promise<void>
      remove(id: string): Promise<void>
    }
  }

  interface Window {
    electron: ElectronAPI
    api: Api
  }
}