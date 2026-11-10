import { BrowserWindow, ipcMain, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

let outputWindow: BrowserWindow | null = null
let outputDisplayId: number | null = null
let lastState: ProjectionState | null = null

function listDisplays(): DisplayInfo[] {
  const primaryId = screen.getPrimaryDisplay().id
  return screen.getAllDisplays().map((d, i) => ({
    id: d.id,
    label: `${d.label || `Pantalla ${i + 1}`} · ${d.bounds.width}×${d.bounds.height}${
      d.id === primaryId ? ' · principal' : ''
    }`,
    width: d.bounds.width,
    height: d.bounds.height,
    primary: d.id === primaryId
  }))
}

function openOutput(control: BrowserWindow | null, displayId?: number): void {
  const displays = screen.getAllDisplays()
  const controlDisplay = control
    ? screen.getDisplayMatching(control.getBounds())
    : screen.getPrimaryDisplay()

  // Elegida a mano, o la primera que no sea donde está el panel de control
  const target =
    displays.find((d) => d.id === displayId) ??
    displays.find((d) => d.id !== controlDisplay.id) ??
    controlDisplay

  if (outputWindow && !outputWindow.isDestroyed()) {
    if (outputDisplayId === target.id) {
      outputWindow.focus()
      return
    }
    outputWindow.destroy() // se vuelve a crear en la otra pantalla
  }

  const external = target.id !== controlDisplay.id
  const { x, y, width, height } = target.bounds
  outputDisplayId = target.id

  const win = new BrowserWindow({
    x: external ? x : x + 80,
    y: external ? y : y + 80,
    width: external ? width : 960,
    height: external ? height : 540,
    frame: !external,
    fullscreen: external,
    backgroundColor: '#000000',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  outputWindow = win

  win.on('ready-to-show', () => win.show())
  win.on('closed', () => {
    if (outputWindow === win) outputWindow = null
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#/output`)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'), { hash: '/output' })
  }
}

export function registerOutputIpc(): void {
  ipcMain.handle('output:open', (event, displayId?: number) =>
    openOutput(BrowserWindow.fromWebContents(event.sender), displayId)
  )
  ipcMain.handle('output:close', () => outputWindow?.close())
  ipcMain.handle('displays:list', () => listDisplays())

  // El main guarda el último estado y lo reenvía a la proyección
  ipcMain.on('state:update', (_event, state: ProjectionState) => {
    lastState = state
    outputWindow?.webContents.send('state:changed', state)
  })
  ipcMain.handle('state:get', () => lastState)
}
