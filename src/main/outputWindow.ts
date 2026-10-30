import { BrowserWindow, ipcMain, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

let outputWindow: BrowserWindow | null = null
let lastState: ProjectionState | null = null

interface ProjectionState {
  text: string
}

// Prefiere un monitor externo (proyector) si solo hay uno se usa el principal
function pickDisplay(): { display: Electron.Display; isExternal: boolean } {
  const primary = screen.getPrimaryDisplay()
  const external = screen.getAllDisplays().find((d) => d.id !== primary.id)
  return { display: external ?? primary, isExternal: !!external }
}

function openOutput(): void {
  if (outputWindow && !outputWindow.isDestroyed()) {
    outputWindow.focus()
    return
  }

  const { display, isExternal } = pickDisplay()
  const { x, y, width, height } = display.bounds

  outputWindow = new BrowserWindow({
    x,
    y,
    width: isExternal ? width : 960,
    height: isExternal ? height : 540,
    frame: !isExternal,
    fullscreen: isExternal,
    backgroundColor: '#000000',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  outputWindow.on('ready-to-show', () => outputWindow?.show())
  outputWindow.on('closed', () => {
    outputWindow = null
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    outputWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#/output`)
  } else {
    outputWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: '/output' })
  }
}

export function registerOutputIpc(): void {
  ipcMain.handle('output:open', () => openOutput())
  ipcMain.handle('output:close', () => outputWindow?.close())

  // El main guarda el último estado y lo reenvía a la proyección
  ipcMain.on('state:update', (_event, state: ProjectionState) => {
    lastState = state
    outputWindow?.webContents.send('state:changed', state)
  })
  ipcMain.handle('state:get', () => lastState)
}