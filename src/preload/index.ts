import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  openOutput: (): Promise<void> => ipcRenderer.invoke('output:open'),
  closeOutput: (): Promise<void> => ipcRenderer.invoke('output:close'),
  updateState: (state: ProjectionState): void => ipcRenderer.send('state:update', state),
  getState: (): Promise<ProjectionState | null> => ipcRenderer.invoke('state:get'),
  onState: (cb: (state: ProjectionState) => void): (() => void) => {
    const handler = (_: unknown, state: ProjectionState): void => cb(state)
    ipcRenderer.on('state:changed', handler)
    return () => ipcRenderer.removeListener('state:changed', handler)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
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
