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

  interface Api {
    openOutput(): Promise<void>
    closeOutput(): Promise<void>
    updateState(state: ProjectionState): void
    getState(): Promise<ProjectionState | null>
    onState(cb: (state: ProjectionState) => void): () => void
  }

  interface Window {
    electron: ElectronAPI
    api: Api
  }
}