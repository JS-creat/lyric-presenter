import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  openOutput: (displayId?: number): Promise<void> => ipcRenderer.invoke('output:open', displayId),
  closeOutput: (): Promise<void> => ipcRenderer.invoke('output:close'),
  updateState: (state: ProjectionState): void => ipcRenderer.send('state:update', state),
  getState: (): Promise<ProjectionState | null> => ipcRenderer.invoke('state:get'),
  onState: (cb: (state: ProjectionState) => void): (() => void) => {
    const handler = (_: unknown, state: ProjectionState): void => cb(state)
    ipcRenderer.on('state:changed', handler)
    return () => ipcRenderer.removeListener('state:changed', handler)
  },
  songs: {
    list: (): Promise<SongData[]> => ipcRenderer.invoke('songs:list'),
    create: (song: SongData): Promise<void> => ipcRenderer.invoke('songs:create', song),
    update: (song: SongData): Promise<void> => ipcRenderer.invoke('songs:update', song),
    remove: (id: string): Promise<void> => ipcRenderer.invoke('songs:delete', id)
  },
  backgrounds: {
    list: (): Promise<string[]> => ipcRenderer.invoke('backgrounds:list'),
    add: (): Promise<string[]> => ipcRenderer.invoke('backgrounds:add'),
    remove: (name: string): Promise<void> => ipcRenderer.invoke('backgrounds:remove', name)
  },
  displays: {
    list: (): Promise<DisplayInfo[]> => ipcRenderer.invoke('displays:list')
  },
  services: {
    list: (): Promise<ServiceData[]> => ipcRenderer.invoke('services:list'),
    save: (service: ServiceData): Promise<void> => ipcRenderer.invoke('services:save', service),
    remove: (id: string): Promise<void> => ipcRenderer.invoke('services:delete', id)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
