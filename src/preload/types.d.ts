import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Theme {
    id: string
    name: string
    bgType: 'solid' | 'gradient' | 'image'
    bg1: string
    bg2: string
    gradientAngle: number
    bgImage: string
    bgDim: number
    textColor: string
    fontFamily: string
    bold: boolean
    uppercase: boolean
    shadow: boolean
  }

  interface ProjectionState {
    lines: string[]
    label: string
    blackout: boolean
    clear: boolean
    fontSize: number
    align: 'left' | 'center' | 'right'
    theme: Theme
  }
  interface DisplayInfo {
    id: number
    label: string
    width: number
    height: number
    primary: boolean
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
    openOutput(displayId?: number): Promise<void>
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
    backgrounds: {
      list(): Promise<string[]>
      add(): Promise<string[]>
      remove(name: string): Promise<void>
    }
    displays: {
      list(): Promise<DisplayInfo[]>
    }
  }

  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
