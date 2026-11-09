import { app, BrowserWindow, dialog, ipcMain, net, protocol } from 'electron'
import { randomUUID } from 'crypto'
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'fs'
import { basename, extname, join } from 'path'
import { pathToFileURL } from 'url'

const EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp']

function bgDir(): string {
  const dir = join(app.getPath('userData'), 'backgrounds')
  mkdirSync(dir, { recursive: true })
  return dir
}

// Debe llamarse ANTES de que la app esté lista
export function registerMediaScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'lyric-media',
      privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true }
    }
  ])
}

// lyric-media://bg/<archivo> -> archivo dentro de la carpeta de fondos
export function registerMediaProtocol(): void {
  protocol.handle('lyric-media', (request) => {
    const name = basename(decodeURIComponent(new URL(request.url).pathname))
    const full = join(bgDir(), name)
    if (!existsSync(full)) return new Response('Not found', { status: 404 })
    return net.fetch(pathToFileURL(full).toString())
  })
}

export function registerMediaIpc(): void {
  ipcMain.handle('backgrounds:list', (): string[] =>
    readdirSync(bgDir())
      .filter((f) => EXTS.includes(extname(f).toLowerCase()))
      .map((f) => ({ f, t: statSync(join(bgDir(), f)).mtimeMs }))
      .sort((a, b) => a.t - b.t)
      .map((x) => x.f)
  )

  ipcMain.handle('backgrounds:add', async (event): Promise<string[]> => {
    const options: Electron.OpenDialogOptions = {
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Imágenes', extensions: EXTS.map((e) => e.slice(1)) }]
    }
    const win = BrowserWindow.fromWebContents(event.sender)
    const result = win
      ? await dialog.showOpenDialog(win, options)
      : await dialog.showOpenDialog(options)
    if (result.canceled) return []

    return result.filePaths.map((src) => {
      const name = `${randomUUID()}${extname(src).toLowerCase()}`
      copyFileSync(src, join(bgDir(), name))
      return name
    })
  })

  ipcMain.handle('backgrounds:remove', (_e, name: string) => {
    const full = join(bgDir(), basename(name))
    if (existsSync(full)) unlinkSync(full)
  })
}